import { Injectable } from '@nestjs/common';

import { UsersService } from './users.service';
import { ChatOpenAI } from '@langchain/openai';
import { responseSchema as topicsAgentResponseSchema } from './schemas/topics-agent';
import { responseSchema as topicsFinalizeAgentResponseSchema } from './schemas/topics-finalize-agent';
import { Annotation, END, messagesStateReducer, START, StateGraph } from '@langchain/langgraph';
import { MongoClient } from 'mongodb';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { RunnableConfig } from '@langchain/core/runnables';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { prompt as topicsPrompt } from './prompt/topics';
import { prompt as topicsFinalizePrompt } from './prompt/topics-finalize';
import { ConfigService } from '@nestjs/config';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class UsersTopicsAgentService {

  private graphAnnotation = Annotation.Root({
    chatMessages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
  });
  private builder: any;
  private _graph: any;
  topicsModel: any;
  topicsFinalizeModel: any;

  constructor(
    private configService: ConfigService,
    private readonly usersService: UsersService,    
  ) {
    const modelSettings = {
      model: 'gpt-4.1',
      temperature: 0,
    }

    this.topicsModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: topicsAgentResponseSchema
      }
    });

    this.topicsFinalizeModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: topicsFinalizeAgentResponseSchema
      }
    });

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('topicNode', this.topicNode)
      .addNode('storeNode', this.storeNode)
      .addConditionalEdges(START, this.decisionNode)
      .addEdge('storeNode', END)
      .addEdge('topicNode', END);

    this._graph = this.builder.compile({
      checkpointer: new MongoDBSaver({
        client: new MongoClient(this.configService.get<string>('DB_LANGGRAPH')),
      }),
    });
  }

  get graph() {
    return this._graph;
  }

  private decisionNode = async (state: typeof this.graphAnnotation.State,
    config?: RunnableConfig) => {
    const { store } = config.configurable as {
      store: boolean;
    };
    if (store) {
      return 'storeNode';
    }
    return 'topicNode';
  }

  private storeNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { chatMessages } = state;
    const { authContext, input } = config.configurable as {
      authContext: AuthContextType;
      input: HumanMessage;
    };

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(topicsFinalizePrompt);

    const prompt = await systemPrompt.invoke({});

    const messages = [...prompt, ...chatMessages];
    if (input) {
      messages.push(input);
    }

    const result = await this.topicsFinalizeModel.invoke(messages);

    const parsed = JSON.parse(result.content as string);
    const { general_topics, narrowed_topics } = parsed;
    await this.usersService.setTopics(authContext.user.id, {
      topics: [
        ...general_topics.map(topic => ({ ...topic, type: 'general', nameId: topic.name_id })),
        ...narrowed_topics.map(topic => ({ ...topic, type: 'narrowed', nameId: topic.name_id }))
      ]
    });

    await dispatchCustomEvent('TOPICS_STORED', {
      chunk: {}
    });

    await this.usersService.upsertGlimpsesJob(authContext);

    return { chatMessages: [new AIMessage(result.content as string)] };
  }

  private topicNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { chatMessages } = state;
    const { authContext, input } = config.configurable as {
      authContext: AuthContextType;
      input: HumanMessage;
    };

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(topicsPrompt);

    const prompt = await systemPrompt.invoke({
      USER_NAME: authContext.user.firstName
    });

    const messages = [...prompt, ...chatMessages];
    if (input) {
      messages.push(input);
    }

    const result = await this.topicsModel.invoke(messages);

    return { chatMessages: [new AIMessage(result.content as string)] };
  }
}