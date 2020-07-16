import {ChildDbRecord} from './childrenHooks';

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

export type MilestoneQueryResult =
  | {
      milestoneAge: number | undefined;
      childAge: number | undefined;
      milestoneAgeFormatted: string | undefined;
      milestoneAgeFormattedDashes: string | undefined;
      isTooYong: boolean;
      betweenCheckList: boolean;
    }
  | undefined;

export type MilestoneQueryKey = [string, {childBirthday?: Date | string}];

export interface ChildResult extends Omit<ChildDbRecord, 'birthday'> {
  birthday: Date;
}

export type Key = 'children' | 'selectedChild';
