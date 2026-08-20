export type UserProfile =

    | "particulier"

    | "bricoleur"

    | "vendeur"

    | "garage"

    | "depanneur";

export interface ProfileSettings{

    id:UserProfile;

    displayName:string;

    maxQuestions:number;

    technicalLevel:number;

    explainReasoning:boolean;

    showConfidence:boolean;

    showAlternativeParts:boolean;

    allowMeasurements:boolean;

    allowAdvancedQuestions:boolean;

}

export const Profiles:Record<UserProfile,ProfileSettings>={

particulier:{

id:"particulier",

displayName:"Particulier",

maxQuestions:6,

technicalLevel:1,

explainReasoning:false,

showConfidence:false,

showAlternativeParts:false,

allowMeasurements:false,

allowAdvancedQuestions:false,

},

bricoleur:{

id:"bricoleur",

displayName:"Bricoleur",

maxQuestions:8,

technicalLevel:2,

explainReasoning:true,

showConfidence:true,

showAlternativeParts:true,

allowMeasurements:true,

allowAdvancedQuestions:false,

},

vendeur:{

id:"vendeur",

displayName:"Vendeur GPA",

maxQuestions:10,

technicalLevel:3,

explainReasoning:true,

showConfidence:true,

showAlternativeParts:true,

allowMeasurements:true,

allowAdvancedQuestions:true,

},

garage:{

id:"garage",

displayName:"Garage",

maxQuestions:12,

technicalLevel:5,

explainReasoning:true,

showConfidence:true,

showAlternativeParts:true,

allowMeasurements:true,

allowAdvancedQuestions:true,

},

depanneur:{

id:"depanneur",

displayName:"Dépanneur",

maxQuestions:12,

technicalLevel:5,

explainReasoning:true,

showConfidence:true,

showAlternativeParts:true,

allowMeasurements:true,

allowAdvancedQuestions:true,

}

};
