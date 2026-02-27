import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsUUID } from "class-validator";


@InputType()
export class MemberInput {
    @Field()
    @IsUUID()
    @IsNotEmpty()
    roomId: string;

    @Field()
    @IsUUID()
    @IsNotEmpty()
    userId: string;
}