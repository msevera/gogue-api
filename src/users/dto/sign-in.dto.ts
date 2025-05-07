import { IsDefined, IsNotEmpty } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('SignInInput')
export class SignInDto {
  @IsDefined()
  @IsNotEmpty()
  @Field()
  idToken: string;
}
