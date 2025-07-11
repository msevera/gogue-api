import { Injectable } from '@nestjs/common';

import { UsersService } from './users.service';
import { ChatOpenAI } from '@langchain/openai';
import { responseSchema as topicsAgentResponseSchema } from './schemas/topics-agent';
import { Annotation, END, StateGraph } from '@langchain/langgraph';
import { MongoClient } from 'mongodb';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { RunnableConfig } from '@langchain/core/runnables';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { prompt as topicsPrompt } from './prompt/topics';

@Injectable()
export class UsersTopicsAgentService {

  private graphAnnotation = Annotation.Root({

  });
  private builder: any;
  private _graph: any;
  topicsModel: any;

  constructor(
    private readonly usersService: UsersService
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

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('topicNode', this.topicNode)
      .addEdge('topicNode', END);

    this._graph = this.builder.compile();
  }

  get graph() {
    return this._graph;
  }

  private topicNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { authContext, input } = config.configurable as {
      authContext: AuthContextType;
      input: string;
    };

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(topicsPrompt);

    const prompt = await systemPrompt.invoke({
      USER_INPUT: input,
      EXISTING_TOPICS: JSON.stringify(authContext.user.topics.map(topic => ({
        name: topic.name,
        overview: topic.overview,
        name_identifier: topic.nameId.toString()
      })))
    });

    const result = await this.topicsModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { interes_topics } = parsed;

    await this.usersService.setTopics(authContext.user.id, {
      topics: interes_topics.map(topic => ({
        name: topic.name,
        nameId: topic.name_identifier,
        overview: topic.overview
      }))
    });

    return { interests: interes_topics };
  }
}