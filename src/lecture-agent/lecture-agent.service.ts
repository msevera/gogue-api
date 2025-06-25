import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { MongoClient } from 'mongodb';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { prompt as normalizePrompt } from './prompts/normalize';
import { prompt as planPrompt } from './prompts/plan';
import { prompt as contentPrompt } from './prompts/content';
import { prompt as overviewPrompt } from './prompts/overview';
import { prompt as categoriesPrompt } from './prompts/categories';
import { responseSchema as planAgentResponseSchema } from './schemas/plan-agent';
import { responseSchema as normalizeAgentResponseSchema } from './schemas/normalize-agent';
import { responseSchema as overviewAgentResponseSchema } from './schemas/overview-agent';
import { responseSchema as categoriesAgentResponseSchema } from './schemas/categories-agent';
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { LecturesService } from '../lectures/lectures.service';
import { CategoriesService } from '../categories/categories.service';


class ContentAnnotation {
  startIndex: number;
  endIndex: number;
  title: string;
  type: string;
  url: string;
}

class PlanSection {
  title: string;
  duration: number;
  content: string;
  annotations: ContentAnnotation[];
}

class Category {
  name: string
  id: string
}

@Injectable()
export class LectureAgentService {

  private graphAnnotation = Annotation.Root({
    input: Annotation<string>(),
    duration: Annotation<number>(),
    topic: Annotation<string>(),
    title: Annotation<string>(),
    emoji: Annotation<string>(),
    plan: Annotation<PlanSection[]>(),
    overview: Annotation<string>(),
    sectionsOverview: Annotation<string[]>(),
    categories: Annotation<Category[]>()
  });
  private builder: any;
  private _graph: any;
  private planModel: any;
  normalizeModel: any;
  contentModel: any;
  overviewModel: any;
  categoriesModel: any;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => LecturesService))
    private lecturesService: LecturesService,
    private categoriesService: CategoriesService,
  ) {

    const modelSettings = {
      model: 'gpt-4o',
      temperature: 0,
    }

    this.normalizeModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: normalizeAgentResponseSchema
      }
    });

    this.planModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: planAgentResponseSchema
      }
    });

    this.overviewModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: overviewAgentResponseSchema
      }
    });

    this.categoriesModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: categoriesAgentResponseSchema
      }
    });

    this.contentModel = new ChatOpenAI({
      ...modelSettings,
    }).bindTools([{ type: "web_search_preview" }], { tool_choice: { "type": "web_search_preview" } });

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('normalizeNode', this.normalizeNode)
      .addNode('planNode', this.planNode)
      .addNode('contentNode', this.contentNode)
      .addNode('finalNode', this.finalNode)
      .addNode('beforeExtractionNode', this.beforeExtractionNode)
      .addNode('overviewNode', this.overviewNode)
      .addNode('categoriesNode', this.categoriesNode)
      .addEdge(START, 'normalizeNode')
      .addEdge('normalizeNode', 'planNode')
      .addConditionalEdges('planNode', this.routeToContentNode)
      .addEdge('contentNode', 'planNode')
      .addEdge('beforeExtractionNode', 'overviewNode')
      .addEdge('beforeExtractionNode', 'categoriesNode')
      .addEdge('overviewNode', 'finalNode')
      .addEdge('categoriesNode', 'finalNode')
      .addEdge('finalNode', END);

    this._graph = this.builder.compile({
      checkpointer: new MongoDBSaver({
        client: new MongoClient(this.configService.get<string>('DB_LANGGRAPH')),
      }),
    });
  }

  get graph() {
    return this._graph;
  }

  private normalizeNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { input } = state;
    const { authContext, lectureId } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
    };

    const normalizingTopicEvent = 'NORMALIZING_TOPIC';
    await this.lecturesService.updateOne(authContext, lectureId, {
      creationEvent: {
        name: normalizingTopicEvent
      }
    });

    await dispatchCustomEvent(normalizingTopicEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(normalizePrompt);

    const prompt = await systemPrompt.invoke({
      INPUT: input
    });

    const result = await this.normalizeModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { title, topic, emoji } = parsed;

    return { topic, title, emoji };
  }

  private planNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { emoji, topic, title, duration } = state;
    const { authContext, lectureId } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
    };

    let { plan } = state;
    if (plan?.length > 0) {
      return { plan };
    }

    const generatingPlanEvent = 'GENERATING_PLAN';
    await this.lecturesService.updateOne(authContext, lectureId, {
      topic,
      title,
      emoji,
      creationEvent: {
        name: generatingPlanEvent
      }
    });

    await dispatchCustomEvent(generatingPlanEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(planPrompt);

    const prompt = await systemPrompt.invoke({
      TOPIC: topic,
      DURATION: duration.toString()
    });

    const result = await this.planModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    plan = parsed.sections;

    return { plan };
  }

  private routeToContentNode = (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const sectionWithoutContent = plan.find(section => !section.content);
    if (sectionWithoutContent) {
      return 'contentNode';
    }

    return 'beforeExtractionNode';
  }


  private contentNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { wordsPerMinute } = config.configurable as {
      wordsPerMinute: number;
    };
    const { plan } = state;
    const { authContext, lectureId } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
    };

    const sectionWithoutContent = plan.find(section => !section.content);
    const { title, duration } = sectionWithoutContent;

    const generatingContentEvent = 'GENERATING_CONTENT';
    await this.lecturesService.updateOne(authContext, lectureId, {
      sections: plan,
      creationEvent: {
        name: generatingContentEvent,
      }
    });

    await dispatchCustomEvent(generatingContentEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(contentPrompt);

    const prompt = await systemPrompt.invoke({
      SECTION_TITLE: title,
      SECTION_DURATION: duration.toString(),
      PREVIOUS_SECTIONS: JSON.stringify(plan),
      WORDS_COUNT: duration * wordsPerMinute,
      TODAYS_DATE: new Date().toLocaleDateString()
    });

    const result = await this.contentModel.invoke([...prompt]);
    const [firstResult] = result.content;

    return {
      plan: plan.map((section) => {
        if (section.title === title) {
          return {
            ...section,
            content: firstResult.text,
            annotations: firstResult?.annotations?.map(annotation => ({
              startIndex: annotation.start_index,
              endIndex: annotation.end_index,
              title: annotation.title,
              type: annotation.type,
              url: annotation.url
            }))
          };
        }
        return section;
      })
    };
  }

  private beforeExtractionNode = (
    state: typeof this.graphAnnotation.State
  ) => {
    const { plan } = state;
    return { plan }
  }

  private overviewNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan, title, topic } = state;
    const { authContext, lectureId } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
    };

    const generatingOverviewEvent = 'GENERATING_OVERVIEW';
    await this.lecturesService.updateOne(authContext, lectureId, {
      sections: plan,
      creationEvent: {
        name: generatingOverviewEvent,
      }
    });

    await dispatchCustomEvent(generatingOverviewEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(overviewPrompt);

    const prompt = await systemPrompt.invoke({
      TOPIC: topic,
      TITLE: title,
      SECTIONS: plan.map(section => `<section_title>${section.title}</section_title>\n<section_text>${section.content}</section_text>`).join('\n')
    });

    const result = await this.overviewModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { lecture_overview, sections } = parsed;

    return { overview: lecture_overview, sectionsOverview: sections.map(section => section.section_overview) };
  }

  private categoriesNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const { authContext, lectureId } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
    };

    const generatingCategoriesEvent = 'GENERATING_CATEGORIES';
    const lecture = await this.lecturesService.updateOne(authContext, lectureId, {
      sections: plan,
      creationEvent: {
        name: generatingCategoriesEvent,
      }
    });

    await dispatchCustomEvent(generatingCategoriesEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(categoriesPrompt);

    const topCategories = await this.categoriesService.findByNameEmbeddings(lecture.topicEmbeddings);

    const prompt = await systemPrompt.invoke({
      EXISTING_CATEGORIES: JSON.stringify(topCategories.map(category => ({
        name: category.name,
        id: category.id
      }))),
      CONTENT: lecture.sections.map(section => section.content).join('\n'),
    });

    const result = await this.categoriesModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { categories } = parsed;

    return {
      categories: categories.map(category => ({
        name: category.category_name,
        id: category.category_id
      }))
    };
  }


  private finalNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    try {
      const { overview, sectionsOverview, plan, categories } = state;
      const { authContext, lectureId } = config.configurable as {
        authContext: AuthContextType;
        lectureId: string;
      };

      const finalizingEvent = 'FINALIZING';

      const newCategories = await this.categoriesService.createMany(
        categories
          .filter(category => category.id === 'NEW')
          .map(category => ({
            name: category.name,
          }))
      );

      const existingCategories = categories.filter(category => category.id !== 'NEW');

      await this.lecturesService.updateOne(authContext, lectureId, {
        overview,
        categories: [...existingCategories, ...newCategories]
          .map(category => ({
            categoryId: category.id
          })),
        sections: plan.map((section, index) => ({
          ...section,
          overview: sectionsOverview[index]
        })),
        creationEvent: {
          name: finalizingEvent,
        }
      });

      await dispatchCustomEvent(finalizingEvent, {
        chunk: {}
      });

      return {};
    } catch (error) {
      console.error('Lecture agent error:', JSON.stringify(error, null, 2));
      throw new Error('Failed to create lecture');
    }
  }
}
