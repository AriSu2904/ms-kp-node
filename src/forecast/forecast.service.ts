import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CandidateService } from '../candidate/candidate.service';
import { firstValueFrom } from 'rxjs';
import { Candidate } from '../candidate/model/candidate.model';
import { ForecastRequestDto } from './dto/forecastRequest.dto';
import { ForecastResponseDto } from './dto/forecastResponse.dto';

@Injectable()
export class ForecastService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly candidateService: CandidateService,
  ) {}

  private _mapToCandidate(
    originalCandidates: Candidate[],
    forecastedCandidates: ForecastResponseDto[],
  ): Candidate[] {
    return originalCandidates.map((candidate) => {
      const forecast = forecastedCandidates.find(
        (f) => f.nik === candidate.nik,
      );

      return {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        nik: candidate.nik,
        nickName: candidate.nickName,
        email: candidate.email,
        phone: candidate.phone,
        dob: candidate.dob,
        address: candidate.address,
        batch: candidate.batch,
        status: forecast?.predicted_status,
        skills: forecast?.skills,
        experience: forecast?.experience,
        technicalScore: {
          basicTest: candidate.technicalScore?.basicTest,
          mathTest: candidate.technicalScore?.mathTest,
          codingTest: candidate.technicalScore?.codingTest,
        },
        forecastResult: {
          codingScoreWeighted: forecast?.coding_test_weighted,
          skillExperience: forecast?.sk_exp,
          basicAndMathScoreWeighted: forecast?.basic_test,
        },
      };
    });
  }

  async _requestForecast(payload: ForecastRequestDto[]): Promise<Candidate[]> {
    const baseUrl = this.config.get<string>('service.machineLearning.baseUrl');
    const xId = this.config.get<string>('service.machineLearning.xIdToken');

    try {
      Logger.debug('[ForecastService] Requesting forecast from ML service');

      const response = await firstValueFrom(
        this.http.post<ForecastResponseDto[]>(`${baseUrl}/predict`, payload, {
          headers: {
            'X-ID-Token': xId,
          },
        }),
      );

      Logger.debug('[ForecastService] Successfully received forecast data');
      return this._mapToCandidate(payload, response.data);
    } catch (error) {
      Logger.error(`[ForecastService] Error requesting forecast: ${error}`);
      throw new InternalServerErrorException(
        'Forecast service is currently unavailable',
      );
    }
  }

  _mapForecastRequest(candidate: Candidate): ForecastRequestDto {
    return <ForecastRequestDto>{
      nik: candidate.nik,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      skills: candidate.skills || [],
      totalSkills: candidate.skills?.length || 0,
      experience: candidate.experience || 0,
      technicalScore: {
        basicTest: candidate.technicalScore?.basicTest || 0,
        mathTest: candidate.technicalScore?.mathTest || 0,
        codingTest: candidate.technicalScore?.codingTest || 0,
      },
    };
  }

  async singleForecast(nik: string): Promise<Candidate | Error> {
    const candidate = await this.candidateService.getCandidateByNik(nik);

    if (!candidate) {
      throw new NotFoundException(`Candidate with NIK ${nik} not found`);
    }

    const forecastResult: Candidate[] = await this._requestForecast([
      this._mapForecastRequest(candidate),
    ]);

    return forecastResult[0] || new Error('No forecast result found');
  }

  async batchForecast(batch: string): Promise<Candidate[]> {
    const candidates = await this.candidateService.getCandidateByBatch(batch);

    if (!candidates || candidates.length === 0) {
      throw new NotFoundException(`No candidates found for batch ${batch}`);
    }

    const forecastRequests = candidates.map((candidate) =>
      this._mapForecastRequest(candidate),
    );

    Logger.debug(
      `[ForecastService] Requesting forecast for batch ${batch} with total candidates: ${forecastRequests.length}`,
    );

    return await this._requestForecast(forecastRequests);
  }
}
