import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class ChangeUserRoleInput {

  @Field()
  @IsUUID()
  targetId: string;

  @Field(() => Role)
  @IsEnum(Role)
  newRole: Role;
}