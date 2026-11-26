import "./env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

import indexRoute from "./routes/index-route.js";
import chatRoute from "./routes/chat-route.js";
import authRoutes from "./routes/auth-routes.js";
import historyRoute from "./routes/chat-history-routes.js";


const app = express();


const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use("/", indexRoute);

app.use("/api/chat", chatRoute);

app.use("/api/auth", authRoutes);

app.use("/api/chats", historyRoute);

// /api/chats/claim => save history of guest user
// /api/chats/:id => to show a chat when clicked on a thread




// app.get("/", (req,res) => {
//     res.send("Hello TypeScript")
// });


export default app;
