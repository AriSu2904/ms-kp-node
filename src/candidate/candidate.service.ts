import { Inject, Injectable, Logger } from '@nestjs/common';
import { Candidate } from './model/candidate.model';
import { HttpService } from '@nestjs/axios';
import { CandidateDto } from './dto/candidate.dto';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CandidateService {
  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private redis: Cache,
    private readonly config: ConfigService,
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

    const baseUrl = this.config.get<string>('service.candidate.baseUrl');
    const xIdToken = this.config.get<string>('service.candidate.xIdToken');

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
        Logger.debug(
          `[CandidateService] Candidates with email ${email} found in cache`,
        );
        return candidate;
      }
    }

    Logger.debug(
      `[CandidateService] Candidate with email: ${email} not found in cache, retrieving from ms-candidates`,
    );
    const candidates = await this._retrieveCandidates();
    return candidates.find((candidate) => candidate.email === email) || null;
  }

  async getCandidateByNik(nik: string): Promise<Candidate | null> {
    Logger.debug(
      `[CandidateService] Retrieving candidate by nik: ${nik} from redis`,
    );

    const cachedCandidates: Candidate[] | null =
      await this.redis.get<Candidate[]>('candidates');

    if (cachedCandidates && cachedCandidates.length > 0) {
      const candidate = cachedCandidates.find(
        (candidate) => candidate.nik === nik,
      );

      if (candidate) {
        Logger.debug(
          `[CandidateService] Candidates with nik ${nik} found in cache`,
        );
        return candidate;
      }
    }

    Logger.debug(
      `[CandidateService] Candidate with nik: ${nik} not found in cache, retrieving from ms-candidates`,
    );
    const candidates = await this._retrieveCandidates();
    return candidates.find((candidate) => candidate.nik === nik) || null;
  }

  async getCandidateByBatch(batch: string): Promise<Candidate[] | null> {
    Logger.debug(
      `[CandidateService] Retrieving candidates with batch: ${batch} from redis`,
    );

    const cachedCandidates: Candidate[] | null =
      await this.redis.get<Candidate[]>('candidates');

    if (cachedCandidates && cachedCandidates.length > 0) {
      const candidate = cachedCandidates.filter(
        (candidate) => candidate.batch === batch,
      );

      if (candidate.length > 0) {
        Logger.debug(
          `[CandidateService] Candidates with batch ${batch} found in cache with total ${candidate.length}`,
        );
        return candidate;
      }
    }

    Logger.debug(
      `[CandidateService] Candidate with batch: ${batch} not found in cache, retrieving from ms-candidates`,
    );
    const candidates = await this._retrieveCandidates();
    return candidates.filter((candidate) => candidate.batch === batch) || null;
  }
}
