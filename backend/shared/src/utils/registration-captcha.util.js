"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRegistrationCaptcha = clearRegistrationCaptcha;
exports.createRegistrationCaptcha = createRegistrationCaptcha;
exports.verifyRegistrationCaptcha = verifyRegistrationCaptcha;
const node_crypto_1 = require("node:crypto");
const TTL_MS = 10 * 60 * 1000;
const store = new Map();
function purgeExpired() {
    const now = Date.now();
    for (const [token, entry] of store.entries()) {
        if (entry.expiresAt <= now)
            store.delete(token);
    }
}
/** Generates a simple arithmetic captcha matching the Laravel registration forms. */
function createRegistrationCaptcha() {
    purgeExpired();
    const firstNumber = (0, node_crypto_1.randomInt)(3, 13);
    const secondNumber = (0, node_crypto_1.randomInt)(1, 10);
    const answer = String(firstNumber + secondNumber);
    const captchaToken = (0, node_crypto_1.randomUUID)();
    store.set(captchaToken, { answer, expiresAt: Date.now() + TTL_MS });
    return {
        captchaToken,
        question: `${firstNumber} + ${secondNumber} = ?`,
    };
}
function verifyRegistrationCaptcha(captchaToken, answer) {
    purgeExpired();
    if (!captchaToken || answer === undefined || answer === null)
        return false;
    const entry = store.get(String(captchaToken));
    if (!entry || entry.expiresAt <= Date.now()) {
        if (entry)
            store.delete(String(captchaToken));
        return false;
    }
    const matches = entry.answer === String(answer).trim();
    store.delete(String(captchaToken));
    return matches;
}
function clearRegistrationCaptcha(captchaToken) {
    if (captchaToken)
        store.delete(String(captchaToken));
}
