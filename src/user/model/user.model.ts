import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  nik: string;
  @Field()
  token: string;
}
