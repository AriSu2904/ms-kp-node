export type ForecastRequestDto = {
  nik: string;
  firstName: string;
  lastName: string;
  skills: string[];
  experience: number;
  technicalScore: {
    basicTest: number;
    mathTest: number;
    codingTest: number;
  };
};
