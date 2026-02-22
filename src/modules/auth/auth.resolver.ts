import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthInput } from './dto/input-auth.dto';
import { RefreshTokenInput } from './dto/refresh-auth.dto';
import { Public } from './decorators/public.decorator';
import { AuthPayload } from './models/auth-payload.model';
import { RefreshPayload } from './models/refresh-payload.models';

@Public()
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => AuthPayload, {
    name: 'register',
    description: 'Register a new user with phone and password'
  })
  async register(@Args('data') data: AuthInput) {
    return await this.authService.register(data)
  }

  @Mutation(() => AuthPayload, {
    name: 'login',
    description: 'Authenticate user and return access and refresh tokens'
  })
  async login(@Args('data') data: AuthInput) {
    return await this.authService.login(data)
  }

  @Mutation(() => RefreshPayload, {
    name: 'refresh',
    description: 'Renew access token using a valid refresh token'
  })
  async refresh(@Args('rt') rt: RefreshTokenInput) {
    return await this.authService.refresh(rt.refreshToken);
  }

  @Mutation(() => Boolean, {
    name: 'logout',
    description: 'Logout user and invalidate the current refresh token'
  })
  async logout(@Args('rt') rt: RefreshTokenInput) {
    return await this.authService.logout(rt.refreshToken)
  }

  @Query(() => String, { name: 'hello', description: 'Health check query' })
  hello() {
    return 'Hello World!';
  }
}
