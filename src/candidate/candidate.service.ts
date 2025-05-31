import { Inject, Injectable, Logger } from '@nestjs/common';
import { Candidate } from './model/candidate.model';
import { HttpService } from '@nestjs/axios';
import { CandidateDto } from './dto/candidate.dto';
import { firstValueFrom } from 'rxjs';
import * as process from 'node:process';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CandidateService {
  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private redis: Cache,
  ) {}

  _mappedCandidate(candidates: CandidateDto[]): Candidate[] {
    return candidates.map((candidate) => {
      return {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        nickName: candidate.nickName,
        nik: candidate.nik,
        email: candidate.email,
        phone: candidate.phone,
        dob: candidate.dob,
        address: candidate.address,
        batch: candidate.batch,
        status: candidate.status,
        skills: candidate.skills,
        experience: candidate.experience,
        technicalScore: candidate.scores,
      };
    });
  }

  async _retrieveCandidates(): Promise<Candidate[]> {
    Logger.debug('[CandidateService] Requesting candidates from ms-candidates');

    const baseUrl = process.env.MS_CANDIDATES_BASE_URL;
    const xIdToken = process.env.X_ID_TOKEN;
    try {
      const candidates = await firstValueFrom(
        this.http.get<CandidateDto[]>(`${baseUrl}/candidates`, {
          headers: {
            'X-Id-Token': xIdToken,
          },
        }),
      );

      const mappedCandidates = this._mappedCandidate(candidates.data);
      Logger.debug(
        '[CandidateService] Candidates retrieved successfully, Set to Redis with total',
        mappedCandidates.length,
      );
      await this.redis.set('candidates', mappedCandidates);

      return mappedCandidates;
    } catch (error) {
      Logger.error('[CandidateService] Error retrieving candidates', error);

      return [];
    }
  }

  async findAll(): Promise<Candidate[]> {
    Logger.debug('[CandidateService] Retrieving all candidates from redis');

    const cachedCandidates: Candidate[] | null =
      await this.redis.get('candidates');

    if (cachedCandidates && cachedCandidates.length > 0) {
      return cachedCandidates;
    }

    return this._retrieveCandidates();
  }

  async getCandidateByEmail(email: string): Promise<Candidate | null> {
    Logger.debug(
      `[CandidateService] Retrieving candidate by email: ${email} from redis`,
    );

    const cachedCandidates: Candidate[] | null =
      await this.redis.get<Candidate[]>('candidates');

    if (cachedCandidates && cachedCandidates.length > 0) {
      const candidate = cachedCandidates.find(
        (candidate) => candidate.email === email,
      );

      if (candidate) {
        return candidate;
      }
    }

    Logger.debug(
      `[CandidateService] Candidate with email: ${email} not found in cache, retrieving from ms-candidates`,
    );
    const candidates = await this._retrieveCandidates();
    return candidates.find((candidate) => candidate.email === email) || null;
  }
}
