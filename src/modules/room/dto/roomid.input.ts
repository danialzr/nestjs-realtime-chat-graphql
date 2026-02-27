import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class RoomIdInput {
    @Field()
    @IsUUID()
    @IsNotEmpty()
    roomId: string;
}