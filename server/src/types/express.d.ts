export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id?: string;
        id?: string;
        [key: string]: any;
      };
    }
  }
}
