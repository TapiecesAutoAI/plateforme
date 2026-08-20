import type {
  ReleaseReadiness,
} from "../release/ReleaseReadinessEngine";

export type CertificationLevel =

  | "NONE"

  | "BRONZE"

  | "SILVER"

  | "GOLD"

  | "PLATINUM";

export interface CertificationResult {

  level:
    CertificationLevel;

  certified:
    boolean;

  score:
    number;

  missingPoints:
    string[];

}

export class CertificationEngine {

  public certify(

    release:
      ReleaseReadiness,

  ): CertificationResult {

    const missing:
      string[] =
      [];

    let level:
      CertificationLevel =
      "NONE";

    if (

      release.blockers.length >

      0

    ) {

      missing.push(

        ...release.blockers,

      );

    }

    if (

      release.score >= 99 &&

      release.ready

    ) {

      level =
        "PLATINUM";

    }

    else if (

      release.score >= 96

    ) {

      level =
        "GOLD";

    }

    else if (

      release.score >= 92

    ) {

      level =
        "SILVER";

    }

    else if (

      release.score >= 85

    ) {

      level =
        "BRONZE";

    }

    return {

      level,

      certified:
        level !==
        "NONE",

      score:
        release.score,

      missingPoints:
        missing,

    };

  }

}
