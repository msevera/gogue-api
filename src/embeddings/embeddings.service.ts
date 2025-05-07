import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingsService {
  public embeddings: OpenAIEmbeddings;
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small"
    });
  }
}
