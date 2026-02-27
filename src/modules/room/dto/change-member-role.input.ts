import { Field, InputType } from "@nestjs/graphql";
import { GroupRole } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class ChangeRoleInput {
    @Field()
    @IsUUID()
    @IsNotEmpty()
    roomId: string;

    @Field()
    @IsUUID()
    @IsNotEmpty()
    targetId: string;

    @Field(() => GroupRole) 
    @IsEnum(GroupRole)
    newRole: GroupRole;
}