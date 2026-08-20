import {
  FutureEngine,
} from "../future/FutureEngine";

import {
  VisionEngine,
} from "../vision/VisionEngine";

import {
  RoadmapEngine,
} from "../roadmap/RoadmapEngine";

export interface EnterpriseReadiness {

  innovationScore:
    number;

  roadmapProgress:
    number;

  strategicValue:
    number;

  competitiveMoat:
    number;

  estimatedKnowledgeValue:
    number;

  nextObjective:
    string;

}

export class EnterpriseEngine {

  private readonly future =
    new FutureEngine();

  private readonly vision =
    new VisionEngine();

  private readonly roadmap =
    new RoadmapEngine();

  public evaluate():

    EnterpriseReadiness {

    const vision =
      this.vision.analyze();

    const roadmap =
      this.roadmap.completion();

    const innovationScore =
      Math.round(

        this.future

          .topFeatures(5)

          .reduce(

            (
              total,
              feature,
            ) =>

              total +
              feature.impact,

            0,

          ) / 5,

      );

    const strategicValue =
      Math.round(

        innovationScore *

        0.60 +

        roadmap *

        0.40,

      );

    const competitiveMoat =
      Math.round(

        innovationScore *

        0.75 +

        vision.completion *

        0.25,

      );

    const estimatedKnowledgeValue =
      Math.round(

        competitiveMoat *

        100000,

      );

    return {

      innovationScore,

      roadmapProgress:
        roadmap,

      strategicValue,

      competitiveMoat,

      estimatedKnowledgeValue,

      nextObjective:
        vision.nextPriority,

    };

  }

}
