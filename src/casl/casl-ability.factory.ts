import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";
import { Action } from "./types/ability.types";
import { Subjects } from "./types/subject.types";
import { Injectable } from "@nestjs/common";
import { UserModel } from "src/modules/user/models/user.model";
import { Role } from "@prisma/client";
import { RoomModel } from "src/modules/room/models/room.model";


type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: UserModel) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(
            createMongoAbility
        );

        if (user.role === Role.SUPER_ADMIN) {
            can(Action.Manage, 'all')
        } 
        else if (user.role === Role.ADMIN) {
            can(Action.Read, UserModel);
            can(Action.Update, UserModel);
            can(Action.Delete, UserModel);

            cannot(Action.Update, UserModel, { role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } });
            cannot(Action.Delete, UserModel, { role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } });

            cannot(Action.Update, UserModel, ['role']);

            can(Action.Manage, RoomModel);
        } else {
            can(Action.Read, UserModel, { id: user.id });
            can(Action.Update, UserModel, { id: user.id });

            cannot(Action.Update, UserModel, ['role']);
            cannot(Action.Delete, UserModel);
        }  
        
        return build({
            detectSubjectType: (item) => 
                item.constructor as any
        })
    }
}