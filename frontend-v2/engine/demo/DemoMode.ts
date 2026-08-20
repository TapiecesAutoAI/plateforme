import { Profiles } from "../profiles";

export function getDemo(profile:string){

    const p =
        Profiles[
            profile as keyof typeof Profiles
        ];

    return{

        profile:p.displayName,

        interface:{

            explainReasoning:
                p.explainReasoning,

            showConfidence:
                p.showConfidence,

            showAlternativeParts:
                p.showAlternativeParts,

            allowMeasurements:
                p.allowMeasurements,

            allowAdvancedQuestions:
                p.allowAdvancedQuestions,

            maxQuestions:
                p.maxQuestions,

        }

    };

}
