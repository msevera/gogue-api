import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { Annotation, END, messagesStateReducer, START, StateGraph } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { GlimpsesService } from './glimpses.service';
import { prompts as glimpsesPrompt } from './prompts/glimpses';
import { prompts as queriesPrompt } from './prompts/queries';
import { responseSchema as queriesAgentResponseSchema } from './schemas/queries-agent';

class ContentAnnotation {
  startIndex: number;
  endIndex: number;
  title: string;
  type: string;
  url: string;
}

class Plan {
  glimpseId?: string;
  id: number;
  topicId: string;
  content: string;
  annotations: ContentAnnotation[];
  backgroundColor: string;
  textColor: string;
}

function getRandomItems(array, count) {
  if (array.length === 0) {
    return [];
  }

  // First, shuffle the array and take what we can without duplicates
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const result = shuffled.slice(0, Math.min(count, array.length));

  // If we still need more items, fill remaining slots with random items
  const remaining = count - result.length;
  for (let i = 0; i < remaining; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    result.push(array[randomIndex]);
  }

  // Sort the result array before returning
  return result.sort();
}

@Injectable()
export class GlimpsesAgentService {

  private graphAnnotation = Annotation.Root({

    plan: Annotation<Plan[]>(),
  });
  private builder: any;
  private _graph: any;
  private maxGlimpses: number;
  glimpsesModel: any;
  queriesModel: any;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => GlimpsesService))
    private readonly glimpsesService: GlimpsesService
  ) {
    this.maxGlimpses = 10;
    const modelSettings = {
      model: 'gpt-4.1',
      temperature: 0,
    }

    this.glimpsesModel = new ChatOpenAI({
      ...modelSettings
    }).bindTools([{ type: "web_search_preview" }], { tool_choice: { "type": "web_search_preview" } });

    this.queriesModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: queriesAgentResponseSchema
      }
    })

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('planNode', this.planNode)
      .addNode('glimpseNode', this.glimpseNode)
      .addNode('queriesNode', this.queriesNode)
      .addNode('finalNode', this.finalNode)
      .addEdge(START, 'planNode')
      .addConditionalEdges('planNode', this.routeToGlimpseNode)
      .addEdge('glimpseNode', 'planNode')
      .addEdge('queriesNode', 'finalNode')
      .addEdge('finalNode', END);

    this._graph = this.builder.compile();
  }

  get graph() {
    return this._graph;
  }

  private planNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const { authContext } = config.configurable as {
      authContext: AuthContextType;
    };

    if (plan?.length > 0) {
      return { plan }
    }

    const topics = authContext.user.topics;
    const topicIds = topics.map(topic => topic.id);
    const nonViewedGlimpses = await this.glimpsesService.getNonViewedGlimpses(authContext);
    const newGlimpses = this.maxGlimpses - nonViewedGlimpses.items.length;
    if (newGlimpses === 0) {
      return { plan: [] }
    }

    await this.glimpsesService.updateGlimpseStatus(authContext, 'PREPARING');
    await dispatchCustomEvent('GLIMPSE_STATUS_UPDATED', {
      chunk: {}
    });
    const randomTopicIds = getRandomItems(topicIds, newGlimpses)

    return { plan: randomTopicIds.map((topicId, idx) => ({ topicId, id: idx })) }
  }

  private glimpseNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const { authContext } = config.configurable as {
      authContext: AuthContextType;
    };

    const glimpseWithoutContent = plan.find(item => !item.content);
    const { id, topicId } = glimpseWithoutContent;
    const checkpoint = await this.glimpsesService.findCheckpointByTopicId(authContext, topicId);
    const previousContent = checkpoint?.previousContent;
    const topic = authContext.user.topics.find(topic => topic.id === topicId);

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(glimpsesPrompt);

    const prompt = await systemPrompt.invoke({
      PREVIOUS_FACTS: previousContent ? JSON.stringify(previousContent.map(content => content.content)) : '[]',
      CATEGORY: JSON.stringify(topic)
    });

    const result = await this.glimpsesModel.invoke(prompt);
    const [firstResult] = result.content;
    const glimpse = await this.glimpsesService.createOne(authContext, {
      topicId,
      content: firstResult.text,
      annotations: firstResult?.annotations.map(annotation => ({
        startIndex: annotation.start_index,
        endIndex: annotation.end_index,
        title: annotation.title,
        type: annotation.type,
        url: annotation.url
      }))
    });

    await this.glimpsesService.addToCheckpointPreviousContent(authContext, topicId, glimpse.id, firstResult.text);

    return {
      plan: plan.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: firstResult.text,
            glimpseId: glimpse.id
          };
        }
        return item;
      })
    };
  }

  private queriesNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const { authContext } = config.configurable as {
      authContext: AuthContextType;
    };

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(queriesPrompt);

    const prompt = await systemPrompt.invoke({
      TOPICS: JSON.stringify(plan.map(item => ({
        id: item.glimpseId,
        content: item.content
      }))),
    });


    const result = await this.queriesModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { queries } = parsed;


    const queriesData = queries.map((query) => {
      return ({
        id: query.topic_id,
        query: query.query_text
      })
    })

    await this.glimpsesService.setGlimsesQueries(authContext, queriesData);

    return {};
  }

  private finalNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { authContext } = config.configurable as {
      authContext: AuthContextType;
    };

    await this.glimpsesService.updateGlimpseStatus(authContext, 'NEW');
    await dispatchCustomEvent('GLIMPSE_STATUS_UPDATED', {
      chunk: {}
    });

    return {}
  }


  private routeToGlimpseNode = (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { plan } = state;
    const sectionWithoutContent = plan.length > 0 && plan.find(item => !item.content);
    if (sectionWithoutContent) {
      return 'glimpseNode';
    }

    return 'queriesNode';
  }
}