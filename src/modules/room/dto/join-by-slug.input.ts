import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

@InputType()
export class JoinBySlugInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^d\.dani\/[a-zA-Z0-9_-]+$/, {
    message: 'فرمت آیدی گروه معتبر نیست. باید با d.dani/ شروع شود',
  })
  slug: string;
}