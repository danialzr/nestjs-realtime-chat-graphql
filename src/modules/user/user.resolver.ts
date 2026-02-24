import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserModel } from './models/user.model';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { CheckAbility } from 'src/casl/decorators/check-ability.decorator';
import { Action } from 'src/casl/types/ability.types';
import { UpdateProfileInput } from './dto/update-profile.input';
import { ChangePasswordInput } from './dto/change-password.input';
import { SearchUsersInput } from './dto/search-user.input';
import { ChangeUserRoleInput } from './dto/change-userRole.input';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Query(() => UserModel, {
    description: 'get user',
    nullable: true
  })
  async getMe(@GetUser('id') userId: string) {
    console.log(userId)
    return await this.userService.getMe(userId)
  }

  @CheckAbility({ action: Action.Update, subject: UserModel })
  @Mutation(() => UserModel, {
    name: 'updateUserProfile',
    description: 'Updates current user profile'
  })
  async updateProfile(
    @GetUser('id') userId: string,
    @Args('data') data: UpdateProfileInput
  ) {
    return await this.userService.updateProfile(userId, data)
  }

  @CheckAbility({ action: Action.Update, subject: UserModel })
  @Mutation(() => UserModel, {
    name: 'changeUserPassword',
    description: 'Allows authenticated users to change their account password after validating the old one.'
  })
  async changePassword(
    @GetUser('id') userId: string,
    @Args('passInput') passInput: ChangePasswordInput
  ) {
    return await this.userService.changePassword(userId, passInput.oldPass, passInput.newPass)
  }

  @CheckAbility({ action: Action.Read, subject: UserModel })
  @Query(() => [UserModel], {
    description: 'Searches for users by name or phone number. Returns a limited list of 20 matches.'
  })
  async searchUsers(@Args('input') input: SearchUsersInput) {
    return await this.userService.searchUsers(input.query)
  }

  @CheckAbility({ action: Action.Update, subject: UserModel })
  @Mutation(() => UserModel, {
    description: 'Admin only: Changes a specific user role'
  })
  async changeUserRole(@Args('input') input: ChangeUserRoleInput) {
    return await this.userService.changeRole(input.targetId, input.newRole)
  }

  @CheckAbility({ action: Action.Delete, subject: UserModel })
  @Mutation(() => Boolean, {
    description: 'Permits a user to delete their own account or an Admin to remove a specific user.'
  })
  async deleteUser(@Args('id') id: string) {
    return await this.userService.deleteUser(id)
  }
}
