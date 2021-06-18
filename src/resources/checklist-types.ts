import {MilestoneIdType} from './constants';

export interface Concern {
  id: number;
  value: string;
}

export interface Milestones {
  social: SkillSection[];
  language: SkillSection[];
  cognitive: SkillSection[];
  movement: SkillSection[];
}

export interface SkillSection {
  id: number;
  value: string;
  photos?: SkillMedia[];
  videos?: SkillMedia[];
}

export interface SkillMedia {
  name: string;
  alt: string;
}

export interface MilestoneChecklist {
  concerns: Concern[];
  helpful_hints: Concern[];
  id: MilestoneIdType;
  milestones: Record<keyof Milestones | string, SkillSection[] | undefined>;
  title?: string;
}

export type Quetion = SkillSection & {skillType: keyof Milestones; milestoneId: number};
export type MilestoneData = Pick<MilestoneChecklist, 'id' | 'concerns' | 'helpful_hints'> & {milestones: Quetion[]};
