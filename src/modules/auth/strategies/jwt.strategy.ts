import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/modules/user/user.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET!
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('اجازه دسترسی ندارید');
        }
        return { id: user.id, role: user.role }
    }
}