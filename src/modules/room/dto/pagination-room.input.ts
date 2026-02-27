import { Field } from '@nestjs/graphql';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class PaginationInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 50;

    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    @Min(0)
    offset?: number = 0;
}