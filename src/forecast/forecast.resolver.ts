import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ForecastService } from './forecast.service';
import { Candidate } from '../candidate/model/candidate.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver()
@UseGuards(AuthGuard)
export class ForecastResolver {
  constructor(private readonly forecastService: ForecastService) {}

  @Mutation(() => Candidate) async predictCandidate(
    @Args('nik') nik: string,
  ): Promise<Candidate | Error> {
    return this.forecastService.singleForecast(nik);
  }

  @Mutation(() => [Candidate]) async batchPrediction(
    @Args('batch') batch: string,
  ): Promise<Candidate[] | Error> {
    return this.forecastService.batchForecast(batch);
  }
}
