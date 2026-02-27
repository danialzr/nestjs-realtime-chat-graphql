import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class RoomMessageIdInput {
    @Field()
    @IsUUID()
    @IsNotEmpty()
    roomId: string;
}