import { Resolver, Query, Args } from '@nestjs/graphql';
import { CandidateService } from './candidate.service';
import { Candidate } from './model/candidate.model';

@Resolver(() => Candidate)
export class CandidateResolver {
  constructor(private readonly candidateService: CandidateService) {}

  @Query(() => [Candidate])
  async listCandidates(): Promise<Candidate[] | null> {
    return await this.candidateService.findAll();
  }

  @Query(() => Candidate, { nullable: true })
  async getCandidateByEmail(@Args('email') email: string) {
    return await this.candidateService.getCandidateByEmail(email);
  }

  @Query(() => Candidate, { nullable: true })
  async getCandidateByNik(@Args('nik') nik: string) {
    return await this.candidateService.getCandidateByNik(nik);
  }

  @Query(() => [Candidate], { nullable: true })
  async candidatesInBatch(@Args('batch') batch: string) {
    return await this.candidateService.getCandidateByBatch(batch);
  }
}
