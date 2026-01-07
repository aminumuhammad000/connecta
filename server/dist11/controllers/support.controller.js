"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboarding = exports.sendFeedback = exports.getHelp = exports.explainFeature = void 0;
const explainFeature = async (req, res) => {
    try {
        const { feature } = req.body;
        // respond with faq content or dynamic explanation
        res.json({ success: true, data: { explanation: `Explanation for ${feature}` } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.explainFeature = explainFeature;
const getHelp = async (req, res) => {
    try {
        res.json({ success: true, data: { faq: [] } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getHelp = getHelp;
const sendFeedback = async (req, res) => {
    try {
        const { userId, feedback } = req.body;
        // persist feedback
        res.json({ success: true, data: { saved: true } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.sendFeedback = sendFeedback;
const onboarding = async (req, res) => {
    try {
        const { step, userId } = req.body;
        res.json({ success: true, data: { step, next: "..." } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.onboarding = onboarding;
