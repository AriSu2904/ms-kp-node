import { Test, TestingModule } from '@nestjs/testing';
import { ForecastResolver } from './forecast.resolver';
import { ForecastService } from './forecast.service';

describe('ForecastResolver', () => {
  let resolver: ForecastResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForecastResolver, ForecastService],
    }).compile();

    resolver = module.get<ForecastResolver>(ForecastResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
