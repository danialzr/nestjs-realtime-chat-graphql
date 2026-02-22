import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';

@InputType()
export class AuthInput {
  @Field(() => String, { description: 'phobe number for register' })
  @Matches(/^09\d{9}$/, { message: 'Phone number not valid' })
  @IsNotEmpty()
  phone: string;

  @Field(() => String, { description: 'register password at least 6' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(30, { message: 'Password must be at most 32 characters' })
  @IsNotEmpty()
  password: string;
}
