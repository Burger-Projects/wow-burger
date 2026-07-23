import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

const authenticate = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Authorization header missing",
        });
      }

      const tokenParts = authHeader.split(" ");
      if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({
          success: false,
          message: "Invalid token format. Expected: 'Bearer <token>'",
        });
      }

      const token = tokenParts[1];

      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      // 4. Verify and decode token
      const decoded = jwt.verify(token, SECRET_KEY);

      // 5. Verify token has required role
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      // Attach user to request
      req.user = decoded;
      next();
    } catch (err) {
      console.error("JWT Error:", err.message);

      const errorResponse = {
        success: false,
        message: "Authentication failed",
      };

      if (err.name === "JsonWebTokenError") {
        errorResponse.message = "Invalid token";
      } else if (err.name === "TokenExpiredError") {
        errorResponse.message = "Token expired";
      }

      return res.status(401).json(errorResponse);
    }
  };
};

export default authenticate;
