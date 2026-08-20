export type CandidateQuestion={

    id:string;

    label:string;

    informationGain:number;

    difficulty:number;

    requiresMeasurement:boolean;

};

export class QuestionSelectorV2{

    public select(
        questions:CandidateQuestion[],
    ):CandidateQuestion|null{

        if(
            questions.length===0
        ){
            return null;
        }

        return [...questions]
        .sort(

            (a,b)=>{

                if(
                    b.informationGain!==a.informationGain
                ){
                    return b.informationGain-a.informationGain;
                }

                return a.difficulty-b.difficulty;

            }

        )[0];

    }

}
