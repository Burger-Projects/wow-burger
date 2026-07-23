import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 50,
  message: "Too many login attempts. Please try again in 30 minutes.",
});
export default loginLimiter;
