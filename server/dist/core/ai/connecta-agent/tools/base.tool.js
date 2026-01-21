import axios from "axios";
export class BaseTool {
    constructor(apiBaseUrl, authToken, userId, mockMode = false) {
        this.apiBaseUrl = apiBaseUrl;
        this.authToken = authToken;
        this.userId = userId;
        this.mockMode = mockMode;
    }
    async request(path, method = "GET", body, params) {
        if (this.mockMode) {
            return { success: true, data: { mock: true, path, method, body, params } };
        }
        const url = `${this.apiBaseUrl}${path}`;
        const cfg = {
            url,
            method,
            headers: {
                "Content-Type": "application/json",
                ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
            },
            data: body,
            params,
        };
        try {
            const res = await axios.request(cfg);
            return { success: true, data: res.data };
        }
        catch (err) {
            const message = err?.response?.data?.message || err.message || "Request failed";
            return { success: false, message };
        }
    }
}
