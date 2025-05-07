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
import { responseSchema as planAgentResponseSchema } from './schemas/plan-agent';
import { responseSchema as normalizeAgentResponseSchema } from './schemas/normalize-agent';
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { LecturesService } from 'src/lectures/lectures.service';

class PlanSection {
  title: string;
  duration: number;
  content: string;
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
  });
  private builder: any;
  private _graph: any;
  private planModel: any;
  normalizeModel: any;
  contentModel: any;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => LecturesService))
    private lecturesService: LecturesService,
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

    this.contentModel = new ChatOpenAI({
      ...modelSettings,     
    }).bindTools([{ type: "web_search_preview" }]);

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('normalizeNode', this.normalizeNode)
      .addNode('planNode', this.planNode)
      .addNode('contentNode', this.contentNode)
      .addNode('finalNode', this.finalNode)
      .addEdge(START, 'normalizeNode')
      .addEdge('normalizeNode', 'planNode')
      .addConditionalEdges('planNode', this.routeToContentNode)
      .addEdge('contentNode', 'planNode')
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

    return 'finalNode';
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
          return { ...section, content: firstResult.text };
        }
        return section;
      })
    };
  }


  private finalNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const { authContext, lectureId } = config.configurable as {
      authContext: AuthContextType;
      lectureId: string;
    };

    const finalizingEvent = 'FINALIZING';
    await this.lecturesService.updateOne(authContext, lectureId, {
      sections: plan,
      creationEvent: {
        name: finalizingEvent,
      }
    });

    await dispatchCustomEvent(finalizingEvent, {
      chunk: {}
    });

    try {
      const createdEvent = 'DONE';
      await this.lecturesService.updateOne(authContext, lectureId, {
        sections: plan,
        creationEvent: {
          name: createdEvent,
        }
      });

      await dispatchCustomEvent(createdEvent, {
        chunk: {}
      });

      return {};
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create lecture');
    }
  }
}
