export const explainFeature = async (req, res) => {
    try {
        const { feature } = req.body;
        // respond with faq content or dynamic explanation
        res.json({ success: true, data: { explanation: `Explanation for ${feature}` } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const getHelp = async (req, res) => {
    try {
        res.json({ success: true, data: { faq: [] } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const sendFeedback = async (req, res) => {
    try {
        const { userId, feedback } = req.body;
        // persist feedback
        res.json({ success: true, data: { saved: true } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const onboarding = async (req, res) => {
    try {
        const { step, userId } = req.body;
        res.json({ success: true, data: { step, next: "..." } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
