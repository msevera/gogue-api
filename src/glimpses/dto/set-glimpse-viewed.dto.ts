import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

@InputType('SetGlimpseViewedInput')
export class SetGlimpseViewedInputDto {
  @Field(() => ID)
  @IsMongoId()
  @IsNotEmpty()
  id: string; 
}
