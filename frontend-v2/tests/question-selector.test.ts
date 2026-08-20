import {
describe,
expect,
test,
} from "vitest";

import {
QuestionSelectorV2,
} from "../engine/question-selector";

describe(
"QuestionSelectorV2",
()=>{

test(
"choisit la question ayant le meilleur gain d'information",
()=>{

const selector=
new QuestionSelectorV2();

const question=
selector.select([

{

id:"q1",

label:"Question 1",

informationGain:15,

difficulty:2,

requiresMeasurement:false,

},

{

id:"q2",

label:"Question 2",

informationGain:82,

difficulty:4,

requiresMeasurement:true,

},

{

id:"q3",

label:"Question 3",

informationGain:40,

difficulty:1,

requiresMeasurement:false,

}

]);

expect(
question?.id
).toBe(
"q2"
);

}

);

}
);
