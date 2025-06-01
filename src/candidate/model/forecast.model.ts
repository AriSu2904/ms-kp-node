import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Forecast {
  @Field(() => Float, { nullable: true })
  codingScoreWeighted?: number;

  @Field(() => Float, { nullable: true })
  skillExperience?: number;

  @Field(() => Float, { nullable: true })
  basicAndMathScoreWeighted?: number;
}
