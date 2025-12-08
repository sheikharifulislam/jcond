import { getValueByPath } from "./getValueByPath";
import { isVariable } from "./isVariable";

// const data = {
//     logic: "or",
//     conditions: [
//         {
//             logic: "and",
//             conditions: [
//                 {
//                     logic: "or",
//                     conditions: [
//                         {
//                             logic: "or",
//                             conditions: [
//                                 { field: "name", operator: "==", value: "temo" },
//                                 { field: "name", operator: "==", value: "memo" },
//                             ],
//                         },
//                         {
//                             logic: "and",
//                             conditions: [
//                                 { field: "role", operator: "==", value: 2 },
//                                 { field: "level", operator: "==", value: 3 },
//                             ],
//                         },
//                     ],
//                 },
//                 {
//                     logic: "and",
//                     conditions: [
//                         { field: "age", operator: "==", value: 20 },
//                         { field: "price", operator: "==", value: 1 },
//                     ],
//                 },
//             ],
//         },
//         {
//             logic: "or",
//             conditions: [
//                 { field: "bio", operator: "==", value: "test" },
//                 { field: "role", operator: "==", value: 1 },
//             ],
//         },
//     ],
// };

type OperatorFunction = (leftExpression: any, rightExpression?: any) => boolean;

type OperatorMap = {
    "===": OperatorFunction;
    "!==": OperatorFunction;
    "<": OperatorFunction;
    ">": OperatorFunction;
    "<=": OperatorFunction;
    ">=": OperatorFunction;
    isTruthy: OperatorFunction;
    isFalsy: OperatorFunction;
    contains: OperatorFunction;
    containsAll: OperatorFunction;
    containsAny: OperatorFunction;
};

type Logic = "and" | "or";
type Operator = "===" | "!==" | "<" | ">" | "<=" | ">=" | "isTruthy" | "isFalsy" | "contains";
type Item = string | number | boolean;

interface Condition {
    field: string | number | boolean | Array<any> | Object;
    operator: Operator;
    value: string | number | boolean | Array<any> | Object;
}

type ConditionConfig = Condition | ConditionGroup;

interface ConditionGroup {
    logic: Logic;
    conditions: ConditionConfig[];
}

class JsonConditionParser {
    operators: OperatorMap;
    constructor() {
        this.operators = {
            "===": (leftExpression, rightExpression) => leftExpression === rightExpression,
            "!==": (leftExpression, rightExpression) => leftExpression !== rightExpression,
            "<": (leftExpression, rightExpression) => leftExpression < rightExpression,
            ">": (leftExpression, rightExpression) => leftExpression > rightExpression,
            "<=": (leftExpression, rightExpression) => leftExpression <= rightExpression,
            ">=": (leftExpression, rightExpression) => leftExpression >= rightExpression,
            isTruthy: (leftExpression) => {
                if (leftExpression) {
                    return true;
                }

                return false;
            },
            isFalsy: (leftExpression) => {
                if (!leftExpression) {
                    return true;
                }

                return false;
            },
            contains: (leftExpression, rightExpression) => {
                if (Array.isArray(leftExpression) || typeof leftExpression === "string") {
                    return leftExpression.includes(rightExpression);
                }

                //fallback
                return false;
            },
            containsAll: (leftExpression, rightExpression) => {
                // check both are array
                if (!Array.isArray(leftExpression) && !Array.isArray(rightExpression)) return false;

                // check leftExpression is empty and rightExpression is not empty
                if (!leftExpression.length && rightExpression.length) return false;

                return rightExpression.every((item: Item) => leftExpression.includes(item));
            },
            containsAny: (leftExpression, rightExpression) => {
                if (!Array.isArray(leftExpression) && !Array.isArray(rightExpression)) return false;

                // check leftExpression is empty and rightExpression is not empty
                if (!leftExpression.length && rightExpression.length) return false;

                return rightExpression.some((item: Item) => leftExpression.includes(item));
            },
        };
    }
    evaluate(conditionConfig: any, data: any): unknown {
        if (conditionConfig.logic && Array.isArray(conditionConfig.conditions)) {
            return this.evaluateConditions(conditionConfig.conditions, conditionConfig.logic, data);
        }

        if (conditionConfig.field && conditionConfig.operator && conditionConfig.field) {
            return this.evaluateCondition(conditionConfig, data);
        }

        // Handle single boolean expression (just field, no operator/value)
        if (conditionConfig.field && conditionConfig.operator && !conditionConfig.value) {
            return this.evaluateBooleanExpression(conditionConfig, data);
        }
    }

    private evaluateBooleanExpression(condition: Condition, data: any) {
        const { field: leftExpression, operator } = condition;
        const leftExpressionValue =
            typeof leftExpression === "string" && isVariable(leftExpression)
                ? getValueByPath(leftExpression, data)
                : leftExpression;

        return this.operators[operator](leftExpressionValue);
    }

    private evaluateCondition(condition: Condition, data: any) {
        const { field: leftExpression, operator, value: rightExpression } = condition;

        if (!this.operators[operator]) {
            throw new Error(`Unsupported operator: ${operator}`);
        }
        const leftExpressionValue =
            typeof leftExpression === "string" && isVariable(leftExpression)
                ? getValueByPath(leftExpression, data)
                : leftExpression;

        const rightExpressionValue =
            typeof rightExpression === "string" && isVariable(rightExpression)
                ? getValueByPath(rightExpression, data)
                : rightExpression;
        return this.operators[operator](leftExpressionValue, rightExpressionValue);
    }
    private evaluateConditions(conditions: any, logic: Logic, data: any) {
        if (!Array.isArray(conditions) || conditions.length < 1) {
            return true;
        }

        // parse each condition
        const results = conditions.map((condition: any) => this.evaluate(condition, data));
        if (logic === "and") {
            return results.every((result: any) => result === true);
        } else if (logic === "or") {
            return results.some((result: any) => result === true);
        } else {
            throw new Error(`Unsupported logic operator: ${logic}`);
        }
    }
}

const data = {
    config: {
        base: {
            media: {
                mobile: {
                    style: {
                        color: "red",
                        fontSize: "20px",
                    },
                },
            },
        },
    },
    device: "mobile",
};

// const condition = {
//     logic: "and",
//     conditions: [
//         {
//             field: "{{config.base.media.{{device}}.style.color}}",
//             operator: "!==",
//             value: "red",
//         },
//         {
//             field: "{{config.base.media.mobile.style.fontSize}}",
//             operator: "!==",
//             value: "22px",
//         },
//     ],
// };

// const jsonConditionParser = new JsonConditionParser();
// console.log(jsonConditionParser.evaluate(condition, data));

// const data = {
//     config: {
//         base: {
//             media: {
//                 mobile: {
//                     color: "red",
//                 },
//             },
//         },
//     },
// };

// const path = "{{config.base.media.{{device}}.color}}";

// // const output = path.replace(/^{{|}}$/g, "");
// // console.log("to the path", output.split("."));
// // // console.log(/^{{|}}$/g.test(path));

// const res = getValueByPath(path, {
//     config: {
//         base: {
//             media: {
//                 mobile: {
//                     color: "red",
//                 },
//             },
//         },
//     },
//     device: "mobile",
// });

// const res2 = getValueByPath(path, {
//     config: {
//         base: {
//             media: {
//                 mobile: {
//                     color: "red",
//                 },
//             },
//         },
//     },
//     // device: "tablet",
// });

// const res3 = getValueByPath("{{config.base.media.{{device}}.{{fontSize}}}}", {
//     config: {
//         base: {
//             media: {
//                 mobile: {
//                     color: "red",
//                 },
//                 tablet: {
//                     color: "green",
//                     fontSize: "130px",
//                 },
//             },
//         },
//     },

//     device: "mobile",
//     fontSize: "fontSize",
// });

// console.log(
//     "to the getValueByPath",
//     new JsonConditionParser().evaluate(
//         {
//             logic: "and",
//             conditions: [
//                 {
//                     field: "{{fontSize}}",
//                     operator: "isTruthy",
//                 },
//             ],
//         },
//         {
//             fontSize: 1,
//         }
//     )
// );
// console.log("to the getValueByPath", res2);
// console.log("to the getValueByPath", res3);

export default JsonConditionParser;
