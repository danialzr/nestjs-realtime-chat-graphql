import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from 'src/modules/user/models/user.model';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserModel)
  user: UserModel;
}
