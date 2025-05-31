import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './model/user.model';
import { Logger } from '@nestjs/common';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User) async loginToken(
    @Args('nik') nik: string,
    @Args('token') token: string,
  ): Promise<User | Error> {
    return this.userService.login(nik, token);
  }

  @Mutation(() => User) async requestToken(
    @Args('nik') nik: string,
    @Args('fullName') fullName: string,
  ): Promise<User> {
    const token = await this.userService.generateToken(nik, fullName);
    Logger.debug('[UserResolver] Success generate token', token);

    return token;
  }
}
