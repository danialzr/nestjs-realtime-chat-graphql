import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

@InputType()
export class SearchUsersInput {

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9@_+.\s]+$/)
  query: string;
}