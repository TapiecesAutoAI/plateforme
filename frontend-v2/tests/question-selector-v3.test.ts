import {
describe,
expect,
test,
} from "vitest";

import {
QuestionSelectorV3,
} from "../engine/question-selector";

describe(

"QuestionSelectorV3",

()=>{

const selector=
new QuestionSelectorV3();

const questions=[

{

id:"simple",

label:"Question simple",

informationGain:70,

difficulty:1,

requiresMeasurement:false,

},

{

id:"multimetre",

label:"Mesurer la tension",

informationGain:95,

difficulty:5,

requiresMeasurement:true,

}

];

test(

"Particulier",

()=>{

expect(

selector.select(

"particulier",

questions,

)?.id

).toBe(

"simple"

);

}

);

test(

"Garage",

()=>{

expect(

selector.select(

"garage",

questions,

)?.id

).toBe(

"multimetre"

);

}

);

}

);
