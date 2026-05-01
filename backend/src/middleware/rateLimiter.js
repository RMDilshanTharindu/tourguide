import rateLimit from "express-rate-limit";

export const chatRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minute window
  max: 2, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many messages sent. Please wait a moment before trying again.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});