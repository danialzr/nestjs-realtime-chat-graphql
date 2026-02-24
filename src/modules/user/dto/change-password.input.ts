import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

@InputType()
export class ChangePasswordInput {
    @Field(() => String, { description: 'current password' })
    @MinLength(6, { message: 'currentPassword must be at least 6 characters' })
    @MaxLength(30, { message: 'currentPassword must be at most 32 characters' })
    @IsNotEmpty()
    oldPass: string;

    @Field(() => String, { description: 'new password' })
    @MinLength(6, { message: 'newPassword must be at least 6 characters' })
    @MaxLength(30, { message: 'newPassword must be at most 32 characters' })
    @IsNotEmpty()
    newPass: string;
}