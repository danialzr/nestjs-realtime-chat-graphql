import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @MinLength(20, { message: 'Refresh token is not valid' })
  refreshToken: string;
}
