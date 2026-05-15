import rateLimit from "express-rate-limit";

// 5 Messages Per 30 minutes
// 3 Images per day
// 5 documnets to ingest per day

export const chatRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minute window
  max: 5, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many messages sent. Please wait a moment before trying again.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


export const imageRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 1, // Limit each IP to 3 requests per windowMs
  message: {
    error: "Daily limit reached. You can only upload 3 images per day.",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});


export const ingestRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 5, // Limit each IP to 3 requests per windowMs
  message: {
    error: "Daily limit reached. You can only upload and ingest 5 documents per day.",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});