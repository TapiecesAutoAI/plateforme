import { UserProfileId } from "./identifiers";

export type TechnicalLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export type PreferredVocabulary =
  | "simple"
  | "standard"
  | "technical";

export type QuestionStyle =
  | "guided"
  | "balanced"
  | "direct";

export interface UserProfile {

  id: UserProfileId;

  label: string;

  technicalLevel: TechnicalLevel;

  preferredVocabulary: PreferredVocabulary;

  canPerformBasicChecks: boolean;

  canUseMultimeter: boolean;

  canAccessVehicleComponents: boolean;

  canInterpretTechnicalValues: boolean;

  questionStyle: QuestionStyle;

}
