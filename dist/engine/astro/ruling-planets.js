"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRulingPlanets = exports.findRulingPlanets = exports.PLANET_NAME_MAP = void 0;
exports.PLANET_NAME_MAP = {
    "1": "ดาวอาทิตย์",
    "2": "ดาวจันทร์",
    "3": "ดาวอังคาร",
    "4": "ดาวพุธ",
    "5": "ดาวพฤหัสบดี",
    "6": "ดาวศุกร์",
    "7": "ดาวเสาร์",
    "8": "ดาวราหู",
    "9": "ดาวเกตุ",
    "0": "ดาวมฤตยู",
};
const ASCENDANT_PATTERN = /ลั/;
const isAscendantToken = (value) => typeof value === "string" && ASCENDANT_PATTERN.test(value);
const THAI_TO_ARABIC_DIGIT_MAP = {
    "๐": "0",
    "๑": "1",
    "๒": "2",
    "๓": "3",
    "๔": "4",
    "๕": "5",
    "๖": "6",
    "๗": "7",
    "๘": "8",
    "๙": "9",
};
const normalizeDigits = (value) => value.replace(/[๐-๙]/g, (digit) => { var _a; return (_a = THAI_TO_ARABIC_DIGIT_MAP[digit]) !== null && _a !== void 0 ? _a : digit; });
const extractAscendantEntry = (chart) => {
    const index = chart.findIndex(isAscendantToken);
    if (index === -1) {
        throw new Error("Unable to locate ascendant information in chart");
    }
    const token = chart[index];
    if (typeof token !== "string") {
        throw new Error("Ascendant token is not a string");
    }
    return { token, index };
};
const extractRulingNumbers = (token) => {
    var _a;
    const normalized = normalizeDigits(token);
    const matches = (_a = normalized.match(/\d/g)) !== null && _a !== void 0 ? _a : [];
    const uniqueNumbers = Array.from(new Set(matches));
    if (uniqueNumbers.length === 0) {
        throw new Error("No ruling planets found in ascendant token");
    }
    return uniqueNumbers;
};
const findRulingPlanets = (chart) => {
    if (!Array.isArray(chart)) {
        throw new Error("Chart must be an array");
    }
    const { token: ascendantToken } = extractAscendantEntry(chart);
    const numbers = extractRulingNumbers(ascendantToken);
    const names = numbers
        .map((digit) => exports.PLANET_NAME_MAP[digit])
        .filter((name) => Boolean(name));
    if (names.length === 0) {
        throw new Error("Unable to map ruling planet numbers to names");
    }
    return { numbers, names };
};
exports.findRulingPlanets = findRulingPlanets;
const formatRulingPlanets = ({ names, numbers }) => names.map((name, index) => { var _a; return `${name} (${(_a = numbers[index]) !== null && _a !== void 0 ? _a : "?"})`; }).join(" และ ");
exports.formatRulingPlanets = formatRulingPlanets;
//# sourceMappingURL=ruling-planets.js.map