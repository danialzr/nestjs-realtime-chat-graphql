import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { Role } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsUrl, Length, Matches } from "class-validator";

registerEnumType(Role, { name: 'Role' });

@InputType()
export class UpdateProfileInput {
    @Field({ nullable: true, description: 'phobe number for update' })
    @Matches(/^09\d{9}$/, { message: 'Phone number not valid' })
    @IsOptional()
    phone?: string;

    @Field({ nullable: true, description: 'User display name (3-50 characters)' })
    @IsOptional()
    @IsString({ message: 'name must be string' })
    @Length(3, 50)
    name?: string;

    @Field({ nullable: true, description: 'short bio for profile' })
    @IsOptional()
    @IsString({ message: 'bio must be string' })
    @Length(0, 100)
    bio?: string;

    @Field({ nullable: true, description: 'URL for the user profile picture' })
    @IsOptional()
    @IsUrl({}, { message: 'Avatar must be a valid URL string' })
    avatar?: string;

     @Field(() => Role)
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
