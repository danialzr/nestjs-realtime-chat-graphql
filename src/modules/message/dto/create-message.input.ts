import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

@InputType()
export class CreateMessageInput {
    @Field()
    @IsUUID()
    @IsNotEmpty()
    roomId: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    content: string;
}
