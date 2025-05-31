export type CandidateDto = {
  firstName: string;
  lastName: string;
  nik: string;
  nickName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  batch: string;
  status: string;
  skills: string[];
  experience: number;
  scores: {
    basicTest: number;
    mathTest: number;
    codingTest: number;
  };
};
