import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastResolver } from './forecast.resolver';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CandidateModule } from '../candidate/candidate.module';

@Module({
  imports: [HttpModule, ConfigModule, CandidateModule],
  providers: [ForecastResolver, ForecastService],
})
export class ForecastModule {}
