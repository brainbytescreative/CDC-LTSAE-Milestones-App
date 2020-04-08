declare module '*!milestoneChecklist' {
  export interface Concern {
    id?: number;
    value?: string;
  }

  export interface Milestones {
    social?: Cognitive[];
    language?: Cognitive[];
    cognitive?: Cognitive[];
    movement?: Cognitive[];
  }

  export interface Cognitive {
    id?: number;
    value?: string;
    photos?: Photo[];
    videos?: Photo[];
  }

  export interface Photo {
    name?: string;
    alt?: string;
  }

  export interface MilestoneChecklist {
    concerns?: Concern[];
    helpful_hints?: Concern[];
    id?: number;
    milestones?: Milestones;
    title?: string;
  }

  const root: MilestoneChecklist[];
  export default root;
}
