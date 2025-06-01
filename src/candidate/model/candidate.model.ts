import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Score } from './score.model';
import { Forecast } from './forecast.model';

@ObjectType()
export class Candidate {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  nik?: string;

  @Field({ nullable: true })
  nickName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  dob?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  batch?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  skills?: string[];

  @Field(() => Int, { nullable: true })
  experience?: number;

  @Field(() => Score, { nullable: true })
  technicalScore?: Score;

  @Field(() => Forecast, { nullable: true })
  forecastResult?: Forecast;
}
