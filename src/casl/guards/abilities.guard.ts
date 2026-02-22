import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CaslAbilityFactory } from "../casl-ability.factory";
import { CHECK_ABILITY_KEY, RequiredRule } from "../decorators/check-ability.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AbilitiesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const rule = this.reflector.get<RequiredRule>(
            CHECK_ABILITY_KEY,
            context.getHandler()
        );

        if (!rule) return true;

        const ctx = GqlExecutionContext.create(context);
        const { user } = ctx.getContext().req;

        if (!user) throw new ForbiddenException('User not authenticated');

        const ability = this.caslAbilityFactory.createForUser(user);

        const isAllowed = ability.can(rule.action, rule.subject);

        if (!isAllowed) {
            throw new ForbiddenException('You do not have permission');
        }

        return true;
    }
}