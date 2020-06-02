export enum Answer {
  YES,
  UNSURE,
  NOT_YET,
}

export interface MilestoneAnswer {
  childId: number;
  questionId: number;
  milestoneId: number;
  answer?: Answer;
  note?: string | undefined | null;
}
