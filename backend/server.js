import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appRouter from "./src/router/index.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: "https://menu-website-frontend.vercel.app",
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api", appRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
