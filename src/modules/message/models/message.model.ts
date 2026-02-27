import { Field, ObjectType } from "@nestjs/graphql";
import { RoomModel } from "src/modules/room/models/room.model";
import { UserModel } from "src/modules/user/models/user.model";

@ObjectType()
export class MessageModel {
    @Field(() => String)
    id: string;

    @Field()
    content: string;

    @Field({ nullable: true })
    senderId?: string;

    @Field(() => UserModel, { nullable: true })
    sender?: UserModel;

    @Field()
    roomId: string;

    @Field(() => RoomModel)
    room?: RoomModel;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}