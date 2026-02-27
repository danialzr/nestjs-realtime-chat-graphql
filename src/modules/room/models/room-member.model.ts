import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GroupRole } from "@prisma/client";
import { UserModel } from "src/modules/user/models/user.model";

registerEnumType(GroupRole, { name: 'GroupRole' })

@ObjectType()
export class RoomMemberModel {
    @Field(() => String)
    id: string;

    @Field()
    userId: string;

    @Field(() => UserModel)
    user?: UserModel;

    @Field()
    roomId: string;

    @Field(() => GroupRole)
    role: GroupRole;

    @Field()
    createdAt: Date;
}