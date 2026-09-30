import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
	cors({
		origin: "http://localhost:5173",
	})
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
	res.json({
		success: true,
		message: "Gift Detective API is running",
	});
});

export default app;
