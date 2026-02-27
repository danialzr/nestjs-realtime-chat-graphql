import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, Length } from "class-validator";

@InputType()
export class CreateRoomInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @Length(3, 50)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    bio?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    avatar?: string;

    @Field(() => [String])
    participantIds: string[];
}