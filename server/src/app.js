import express from "express";
import cors from "cors";
import authRouer from "./routes/auth.routes.js"
const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouer)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});


export default app;