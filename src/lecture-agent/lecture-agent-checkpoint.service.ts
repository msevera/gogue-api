
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { MongoClient } from 'mongodb';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { prompt as checkpointPrompt } from './prompts/checkpoint';
import { responseSchema as checkpointAgentResponseSchema } from './schemas/checkpoint-agent';
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { LecturesService } from 'src/lectures/lectures.service';

@Injectable()
export class LectureAgentCheckpointService {
  public model: ChatOpenAI;
  private graphAnnotation = Annotation.Root({
    lectureId: Annotation<string>(),
    transcript: Annotation<string>(),
    title: Annotation<string>(),
    checkpoint: Annotation<string>(),
  });
  private builder: any;
  private _graph: any;
  checkpointModel: any;

  constructor(
    private configService: ConfigService,  
    private lecturesService: LecturesService,
  ) {

    const modelSettings = {
      model: 'gpt-4o',
      temperature: 0,
    }

    this.checkpointModel = new ChatOpenAI({
      ...modelSettings,
      modelKwargs: {
        response_format: checkpointAgentResponseSchema
      }
    });

    this.model = new ChatOpenAI({
      ...modelSettings
    });

    this.builder = new StateGraph(this.graphAnnotation)
      .addNode('checkpointNode', this.checkpointNode)
      .addNode('finalNode', this.finalNode)
      .addEdge(START, 'checkpointNode')
      .addEdge('checkpointNode', 'finalNode')
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

  private checkpointNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { transcript, lectureId } = state;
    const { authContext } = config.configurable as {
      authContext: AuthContextType;
    };

    const lecture = await this.lecturesService.findOne(authContext, lectureId);
    const lectureContent = `# ${lecture.title}\n\n${lecture.sections.map(section => `## ${section.title}\n${section.content}`).join('\n\n')}`;

    const systemPrompt =
      SystemMessagePromptTemplate.fromTemplate(checkpointPrompt);

    const prompt = await systemPrompt.invoke({
      LECTURE_CONTENT: lectureContent,
      TRANSCRIPT: transcript
    });

    const result = await this.checkpointModel.invoke([...prompt]);
    const parsed = JSON.parse(result.content as string);
    const { title, checkpoint } = parsed;
    return { title, checkpoint };
  }

  private finalNode = async (
    state: typeof this.graphAnnotation.State,
    config?: RunnableConfig,
  ) => {
    const { lectureId, title, checkpoint } = state;
    const { authContext } = config.configurable as {
      authContext: AuthContextType;
    };

    try {
      await this.lecturesService.setCheckpoint(authContext, lectureId, JSON.stringify({ title, checkpoint }))      
      return {};
    } catch (error) {
      console.error(error);
      throw new Error('Failed to set lecture checkpoint');
    }
  }
}
