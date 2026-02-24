import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req;
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
