import { SetMetadata } from "@nestjs/common";
import { Action } from "../types/ability.types";
import { Subjects } from "../types/subject.types";


export interface RequiredRule {
    action: Action,
    subject: Subjects
}

export const CHECK_ABILITY_KEY = 'check_ability';

export const CheckAbility = (rule: RequiredRule) => SetMetadata(CHECK_ABILITY_KEY, rule);