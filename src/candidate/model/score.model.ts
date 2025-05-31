import { Field, Int, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class Score {
  @Field(() => Int, { nullable: true })
  basicTest?: number;

  @Field(() => Int, { nullable: true })
  mathTest?: number;

  @Field(() => Int, { nullable: true })
  codingTest?: number;
}
