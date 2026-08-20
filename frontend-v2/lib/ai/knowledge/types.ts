export type KnowledgeEntityType =
  | "vehicle"
  | "engine"
  | "system"
  | "problem"
  | "cause"
  | "part"
  | "symptom"
  | "observation"
  | "test"
  | "measurement"
  | "procedure"
  | "repair"
  | "tool";

export type KnowledgeRelationType =
  | "produces"
  | "caused-by"
  | "supports"
  | "contradicts"
  | "requires-part"
  | "verified-by"
  | "measured-by"
  | "repaired-by"
  | "requires-tool"
  | "compatible-with"
  | "installed-on"
  | "belongs-to"
  | "affects"
  | "related-to";

export type KnowledgeSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type KnowledgeDifficulty =
  | "very-easy"
  | "easy"
  | "medium"
  | "difficult"
  | "expert";

export type KnowledgeCostLevel =
  | "free"
  | "low"
  | "medium"
  | "high"
  | "very-high";

export type KnowledgeSafetyLevel =
  | "safe"
  | "caution"
  | "dangerous"
  | "professional-only";

export type KnowledgeEntityMetadataValue =
  | string
  | number
  | boolean
  | string[]
  | number[];

export type KnowledgeEntityMetadata =
  Record<
    string,
    KnowledgeEntityMetadataValue
  >;

export type BaseKnowledgeEntity = {
  id: string;
  type: KnowledgeEntityType;
  name: string;

  description?: string;
  aliases?: string[];
  category?: string;
  severity?: KnowledgeSeverity;

  metadata?: KnowledgeEntityMetadata;
};

export type TestKnowledgeEntity =
  BaseKnowledgeEntity & {
    type: "test";

    durationMinutes?: number;

    difficulty?:
      KnowledgeDifficulty;

    costLevel?:
      KnowledgeCostLevel;

    /**
     * Fiabilité estimée du test.
     *
     * Valeur comprise entre 0 et 1.
     */
    reliability?: number;

    requiredToolIds?: string[];

    safetyLevel?:
      KnowledgeSafetyLevel;

    /**
     * Instructions courtes destinées
     * à l’utilisateur ou au technicien.
     */
    instructions?: string[];

    /**
     * Valeur ou résultat normalement attendu
     * lorsque le système testé fonctionne.
     */
    expectedResult?: string;
  };

export type RepairKnowledgeEntity =
  BaseKnowledgeEntity & {
    type: "repair";

    durationMinutes?: number;

    difficulty?:
      KnowledgeDifficulty;

    costLevel?:
      KnowledgeCostLevel;

    requiredToolIds?: string[];
    requiredPartIds?: string[];

    safetyLevel?:
      KnowledgeSafetyLevel;

    instructions?: string[];
  };

export type ToolKnowledgeEntity =
  BaseKnowledgeEntity & {
    type: "tool";

    costLevel?:
      KnowledgeCostLevel;

    safetyLevel?:
      KnowledgeSafetyLevel;
  };

export type PartKnowledgeEntity =
  BaseKnowledgeEntity & {
    type: "part";

    oemReferences?: string[];
    tecdocReferences?: string[];

    manufacturer?: string;

    costLevel?:
      KnowledgeCostLevel;
  };

export type MeasurementKnowledgeEntity =
  BaseKnowledgeEntity & {
    type: "measurement";

    unit?: string;

    minimumValue?: number;
    maximumValue?: number;

    expectedValue?: number;

    tolerance?: number;
  };

export type GenericKnowledgeEntity =
  BaseKnowledgeEntity & {
    type: Exclude<
      KnowledgeEntityType,
      | "test"
      | "repair"
      | "tool"
      | "part"
      | "measurement"
    >;
  };

export type KnowledgeEntity =
  | TestKnowledgeEntity
  | RepairKnowledgeEntity
  | ToolKnowledgeEntity
  | PartKnowledgeEntity
  | MeasurementKnowledgeEntity
  | GenericKnowledgeEntity;

export type KnowledgeRelation = {
  id: string;

  from: string;
  to: string;

  type: KnowledgeRelationType;

  /**
   * Force de la relation.
   *
   * Valeur normalement comprise entre 0 et 1.
   */
  weight: number;

  description?: string;

  metadata?: KnowledgeEntityMetadata;
};

export type KnowledgeGraphData = {
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
};
