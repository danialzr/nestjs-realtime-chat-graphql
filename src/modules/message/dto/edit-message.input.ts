import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

@InputType()
export class EditMessageInput {
    @Field()
    @IsUUID()
    @IsNotEmpty()
    messageId: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    newContent: string;
}
