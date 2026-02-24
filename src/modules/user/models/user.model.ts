import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field()
  id: string;

  @Field()
  phone: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  role: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
