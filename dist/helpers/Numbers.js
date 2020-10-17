"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigNum2Small = void 0;
function bigNum2Small(bigNum) {
    if (typeof bigNum === 'string' && isNaN(parseInt(bigNum))) {
        return '0';
    }
    if (bigNum < 1000) {
        return bigNum.toString();
    }
    if (bigNum < 10000) {
        return bigNum.toString().slice(0, -3) + "K+";
    }
    if (bigNum < 100000) {
        return bigNum.toString().slice(0, -3) + "K+";
    }
    if (bigNum < 1000000) {
        return bigNum.toString().slice(0, -3) + "K+";
    }
    if (bigNum < 10000000) {
        return bigNum.toString().slice(0, -6) + "M+";
    }
    if (bigNum < 100000000) {
        return bigNum.toString().slice(0, -6) + "M+";
    }
    if (bigNum < 1000000000) {
        return bigNum.toString().slice(0, -6) + "M+";
    }
    if (bigNum < 10000000000) {
        return bigNum.toString().slice(0, -9) + "B+";
    }
    if (bigNum < 100000000000) {
        return bigNum.toString().slice(0, -9) + "B+";
    }
    if (bigNum < 1000000000000) {
        return bigNum.toString().slice(0, -9) + "B+";
    }
    if (bigNum < 10000000000000) {
        return bigNum.toString().slice(0, -12) + "T+";
    }
    return bigNum.toString().slice(0, -12) + "T+";
}
exports.bigNum2Small = bigNum2Small;
