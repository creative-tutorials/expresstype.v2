import rateLimit from "express-rate-limit";
import { type Response, type Request } from "express";

// You can set any rate limit you want
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 requests per windowMs
  handler: (req: Request, res: Response) => {
    console.log("Too many requests, please try again later.");
    res.status(429).json({
      error: "Too many requests, please try again in 15 minutes",
    });
  },
});
