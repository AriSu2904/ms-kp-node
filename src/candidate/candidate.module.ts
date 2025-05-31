import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateResolver } from './candidate.resolver';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [CandidateResolver, CandidateService],
})
export class CandidateModule {}
