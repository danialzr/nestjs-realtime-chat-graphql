import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RefreshPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
