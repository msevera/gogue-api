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
import { prompt as researchPlanPrompt } from './prompts/research-planner';
import { prompt as researchContentPrompt } from './prompts/research-content';
import { prompt as compileContentPrompt } from './prompts/compile-content';
import { prompt as categoriesPrompt } from './prompts/categories';
import { responseSchema as researchPlannerAgentResponseSchema } from './schemas/research-planner-agent';
import { responseSchema as normalizeAgentResponseSchema } from './schemas/normalize-agent';
import { responseSchema as compileContentAgentResponseSchema } from './schemas/compile-content-agent';
import { responseSchema as categoriesAgentResponseSchema } from './schemas/categories-agent';
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { LecturesService } from '../lectures/lectures.service';
import { CategoriesService } from '../categories/categories.service';
import { SourceService } from '../sources/sources.service';

class ContentAnnotation {
  startIndex: number;
  endIndex: number;
  title: string;
  type: string;
  url: string;
}

class ResearchPlan {
  title: string;
  description: string;
  category: string;
  content?: string;
  annotations?: ContentAnnotation[];
}

class WorkbookTask {
  prompt: string;
  instructions: string;
  expectedFormat: string;
}

class Category {
  name: string
  id: string
}

class Section {
  title: string;
  content: string;
  overview: string;
}

function getRandomItem(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

const introExamples = [
  "Hello, Gogue here — your personal assistant, eager to help you explore...",
  "Hey there, Gogue here and ready to explore your ideas together...",
  "Hi there, Gogue here, eager to start our...",
  "Welcome aboard. I’m Gogue, and I’m here to support you every step of the way...",
  "It’s great to see you today, and I’m Gogue, ready to...",
  "Delighted to connect with you — I’m Gogue, here to...",
  "Thank you for joining me. I’m Gogue, and I’ll be guiding you...",
  "Thrilled to have you here, and I’m Gogue, at your disposal for...",
  "I’m excited about our discussion, and I’m Gogue, committed to making this lecture valuable for you...",
  "At your service today — I’m Gogue, ready to provide insights...",
  "Ready to get started with our journey, where I, Gogue, will be your companion for exploring...",
  "Allow me to introduce myself. I’m Gogue, and I’m here to help you navigate through...",
  "It’s a pleasure to meet you, as I’m Gogue, and I’ll be assisting you throughout our...",
]

const ctaExamples = [
  "Feel free to jump in with questions anytime—just tap **Ask anything**. You can also keep track of your thoughts by tapping **Add note**.",
  "Don’t hesitate to interrupt me with any question—hit **Ask anything** whenever you like. To save your ideas, simply tap **Add note**.",
  "Have a question? Tap **Ask anything** at any moment to chime in. And whenever you want to jot something down, just tap **Add note**.",
  "You’re welcome to ask questions anytime—just press **Ask anything**. Plus, you can capture your insights by tapping **Add note**.",
  "Jump in with a question whenever it comes to mind—tap **Ask anything**. To record your thoughts, tap **Add note**.",
  "If you’d like to ask something, simply tap **Ask anything**, even mid-conversation. And to note key points, hit **Add note**.",
  "Remember, you can interrupt me at any time by tapping **Ask anything**, and you can log your ideas by tapping **Add note**.",
  "Anytime you’re curious, tap **Ask anything** to ask away—no need to wait! And if you want to note something, tap **Add note**.",
  "Feel empowered to stop me with questions by tapping **Ask anything**, and don’t forget you can capture notes with **Add note**.",
  "Got a question? Tap **Ask anything** anytime. Need to jot down a thought? Just tap **Add note**.",
]

const outroExamples = [
  "Thank you all for your attention today—I appreciate your time and look forward to seeing you in future lectures!",
  "I’m grateful for your engagement and hope to welcome you back for our next session.",
  "Thank you for listening so attentively. I can’t wait to see you at our upcoming lectures!",
  "Many thanks for your attention today—see you in the next lecture!",
  "I appreciate you joining me today and hope to see you again in future talks.",
  "Thank you for being such a great audience. I look forward to our next lecture together!",
  "Thanks for tuning in and for your thoughtful attention—hope to see you at the next one!",
  "Your attention is much appreciated, and I can’t wait to share more with you in upcoming lectures.",
  "Thank you for your time today. I hope to see you again in our future sessions!",
  "I’m thankful for your engagement, and I look forward to having you with me in future lectures."
]

@Injectable()
export class LectureAgentService {
  private graphAnnotation = Annotation.Root({
    input: Annotation<string>(),
    duration: Annotation<number>(),
    topic: Annotation<string>(),
    languageCode: Annotation<string>(),
    title: Annotation<string>(),
    emoji: Annotation<string>(),
    researchPlan: Annotation<ResearchPlan[]>(),
    overview: Annotation<string>(),
    categories: Annotation<Category[]>(),
    sections: Annotation<Section[]>(),
    voiceInstructions: Annotation<string>(),
    keyInsights: Annotation<string[]>(),
    workbook: Annotation<WorkbookTask[]>(),
  });
  private builder: any;
  private _graph: any;
  private normalizeModel: any;
  private researchPlannerModel: any;
  private researchContentModel: any;
  private compileContentModel: any;
  private categoriesModel: any;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => LecturesService))
    private lecturesService: LecturesService,
    private categoriesService: CategoriesService,
    private sourcesService: SourceService,
  ) {

    const modelSettings = {
      model: 'gpt-4.1',
      temperature: 0,
    }

    this.normalizeModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        text: {
          format: normalizeAgentResponseSchema
        }
      }
    }).bindTools([{ type: "web_search_preview" }], { tool_choice: { "type": "web_search_preview" } });

    this.researchPlannerModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        text: {
          format: researchPlannerAgentResponseSchema
        }
      }
    }).bindTools([{ type: "web_search_preview" }], { tool_choice: { "type": "web_search_preview" } });

    this.researchContentModel = new ChatOpenAI({
      ...modelSettings,
    }).bindTools([{ type: "web_search_preview" }], { tool_choice: { "type": "web_search_preview" } });

    this.compileContentModel = new ChatOpenAI({
      // model: 'gpt-5',
      // temperature: 1,
      // reasoning: {
      //   effort: 'minimal',
      //   summary: null
      // },
      // verbosity: 'medium',
      ...modelSettings,
      modelKwargs: {
        response_format: compileContentAgentResponseSchema
      }
    });

    this.categoriesModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: categoriesAgentResponseSchema
      }
    });

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('normalizeNode', this.normalizeNode)
      .addNode('researchPlannerNode', this.researchPlannerNode)
      .addNode('researchContentNode', this.researchContentNode)
      .addNode('compileContentNode', this.compileContentNode)
      .addNode('finalNode', this.finalNode)
      .addNode('categoriesNode', this.categoriesNode)
      .addEdge(START, 'normalizeNode')
      .addEdge('normalizeNode', 'researchPlannerNode')
      .addConditionalEdges('researchPlannerNode', this.routeToResearchNode)
      .addEdge('researchContentNode', 'researchPlannerNode')
      .addEdge('compileContentNode', 'categoriesNode')
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
    const { authContext, lectureId, showNotification } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
      showNotification: boolean;
    };

    const normalizingTopicEvent = 'NORMALIZING_TOPIC';
    await this.lecturesService.updateOne(authContext, lectureId, {
      creationEvent: {
        name: normalizingTopicEvent,
        showNotification
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
    const parsed = result.additional_kwargs.parsed;
    const { title, topic, emoji, language_code } = parsed;

    return { topic, title, emoji, languageCode: language_code };
  }

  private researchPlannerNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { emoji, topic, title, languageCode } = state;
    const { authContext, lectureId, showNotification } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
      showNotification: boolean;
    };

    let { researchPlan } = state;
    if (researchPlan?.length > 0) {
      return { researchPlan };
    }

    const researchingPlanEvent = 'RESEARCHING_PLAN';
    await this.lecturesService.updateOne(authContext, lectureId, {
      topic,
      title,
      emoji,
      languageCode,
      creationEvent: {
        name: researchingPlanEvent,
        showNotification
      }
    });

    await dispatchCustomEvent(researchingPlanEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(researchPlanPrompt);

    const prompt = await systemPrompt.invoke({
      topic,
      current_timestamp: new Date().toDateString()
    });

    const result = await this.researchPlannerModel.invoke([...prompt]);
    const { research_items } = result.additional_kwargs.parsed;
    return { researchPlan: research_items };
  }

  private researchContentNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { researchPlan } = state;
    const { authContext, lectureId, showNotification } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
      showNotification: boolean;
    };

    const sectionWithoutContent = researchPlan.find(section => !section.content);
    const { title, description, category } = sectionWithoutContent;

    const researchingContentEvent = 'RESEARCHING_CONTENT';
    await this.lecturesService.updateOne(authContext, lectureId, {
      research: researchPlan,
      creationEvent: {
        name: researchingContentEvent,
        showNotification
      }
    });

    await dispatchCustomEvent(researchingContentEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(researchContentPrompt);

    const prompt = await systemPrompt.invoke({
      title,
      description,
      category,
      current_timestamp: new Date().toDateString()
    });

    const result = await this.researchContentModel.invoke([...prompt]);
    const [firstResult] = result.content;

    return {
      researchPlan: researchPlan.map((section) => {
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

  private routeToResearchNode = (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { researchPlan } = state;
    const sectionWithoutContent = researchPlan.find(section => !section.content);
    if (sectionWithoutContent) {
      return 'researchContentNode';
    }

    return 'compileContentNode';
  }


  private compileContentNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { researchPlan, title, topic, input } = state;
    const { authContext, lectureId, sourceId, showNotification } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
      sourceId: string;
      showNotification: boolean;
    };

    const source = sourceId ? await this.sourcesService.findOne(false, sourceId) : null;

    const compilingContentEvent = 'COMPILING_CONTENT';
    await this.lecturesService.updateOne(authContext, lectureId, {
      research: researchPlan,
      creationEvent: {
        name: compilingContentEvent,
        showNotification
      }
    });
    await dispatchCustomEvent(compilingContentEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(compileContentPrompt);


    const prompt = await systemPrompt.invoke({
      book: source ? `${source.title} by ${source.authors?.join(', ')}` : 'null',
      title: title,
      topic: topic,
      user_input: input,
      researched_content: researchPlan.map(section => section.content).join('\n'),
      current_timestamp: new Date().toDateString(),
      intro_example: getRandomItem(introExamples),
      cta_example: getRandomItem(ctaExamples),
      outro_example: getRandomItem(outroExamples)
    });

    const result = await this.compileContentModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { overview, voice_instructions, sections, key_insights, workbook } = parsed;



    return {
      overview,
      voiceInstructions: voice_instructions,
      sections: sections.map(section => ({
        title: section.title,
        content: section.content,
        overview: section.overview,
      })),
      keyInsights: key_insights,
      workbook: workbook?.map(task => ({
        prompt: task.prompt,
        instructions: task.instructions,
        expectedFormat: task.expected_format
      }))
    };
  }

  private categoriesNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { sections } = state;
    const { authContext, lectureId, showNotification } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
      showNotification: boolean;
    };

    const generatingCategoriesEvent = 'GENERATING_CATEGORIES';
    const lecture = await this.lecturesService.updateOne(authContext, lectureId, {
      creationEvent: {
        name: generatingCategoriesEvent,
        showNotification
      }
    });

    await dispatchCustomEvent(generatingCategoriesEvent, {
      chunk: {}
    });

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(categoriesPrompt);

    const topCategories = await this.categoriesService.findByNameEmbeddings(lecture.topicEmbeddings);

    const prompt = await systemPrompt.invoke({
      existing_categories: JSON.stringify(topCategories.map(category => ({
        name: category.name,
        id: category.id
      }))),
      content: sections.map(section => section.content).join('\n'),
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
      const { overview, sections, voiceInstructions, categories, workbook, keyInsights } = state;
      const { authContext, lectureId, showNotification } = config.configurable as {
        authContext: AuthContextType;
        lectureId: string;
        showNotification: boolean;
      };

      const finalizingEvent = 'FINALIZING';
      const newCategories = await this.categoriesService.createMany(
        categories
          .filter(category => category.id === null)
          .map(category => ({
            name: category.name,
          }))
      );

      const existingCategories = categories.filter(category => category.id !== null);

      await this.lecturesService.updateOne(authContext, lectureId, {
        overview,
        sections,
        voiceInstructions,
        categories: [...existingCategories, ...newCategories]
          .map(category => ({
            categoryId: category.id
          })),
        creationEvent: {
          name: finalizingEvent,
          showNotification
        },
        keyInsights,
        workbook
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
