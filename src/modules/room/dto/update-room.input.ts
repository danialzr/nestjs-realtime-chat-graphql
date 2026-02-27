import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID, Length, Matches } from "class-validator";


@InputType()
export class UpdateRoomInput {
  @Field()
  @IsString()
  @IsUUID()
  roomId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 250)
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'آیدی گروه فقط می‌تواند شامل حروف، اعداد و خط تیره باشد',
  })
  slug?: string;
}