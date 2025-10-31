import axios, { AxiosRequestConfig } from "axios";

export type ToolParams = Record<string, any>;
export type ToolResponse = { success: boolean; data?: any; message?: string };

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;

  constructor(
    protected apiBaseUrl: string,
    protected authToken?: string,
    protected userId?: string,
    protected mockMode: boolean = false
  ) {}

  protected async request(
    path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    body?: any,
    params?: Record<string, any>
  ): Promise<ToolResponse> {
    if (this.mockMode) {
      return { success: true, data: { mock: true, path, method, body, params } };
    }

    const url = `${this.apiBaseUrl}${path}`;
    const cfg: AxiosRequestConfig = {
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
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Request failed";
      return { success: false, message };
    }
  }

  // All tools implement _call
  abstract _call(params: ToolParams): Promise<ToolResponse>;
}
