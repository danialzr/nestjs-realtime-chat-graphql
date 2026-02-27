import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { RoomType } from "@prisma/client";
import { RoomMemberModel } from "./room-member.model";

registerEnumType(RoomType, { name: 'RoomType' });

@ObjectType()
export class RoomCount {
    @Field(() => Int)
    members: number;

    @Field(() => Int)
    messages: number;
}

@ObjectType()
export class RoomModel {
    @Field(() => String)
    id: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    bio?: string;

    @Field({ nullable: true })
    avatar?: string;

    @Field({ nullable: true })
    slug?: string;

    @Field(() => RoomType)
    type: RoomType;

    @Field(() => [RoomMemberModel])
    members: RoomMemberModel[];

    @Field(() => RoomCount, { nullable: true })
    _count?: RoomCount;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}