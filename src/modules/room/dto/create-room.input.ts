import { Field, InputType } from "@nestjs/graphql";
import { ArrayMinSize, IsOptional, IsString, IsUUID, Length } from "class-validator";

@InputType()
export class CreateRoomInput {
    @Field()
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
    @ArrayMinSize(1) 
    @IsUUID("4", { each: true })
    participantIds: string[];
}