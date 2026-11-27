import type { Request, Response } from "express";
import OpenAI from "openai";
import { systemPrompt } from "../services/System-prompt.js";
import type { JwtPayload } from "jsonwebtoken";
import { estimateTokens } from "../services/token-counter.js";
import { summarizer } from "../services/summarizer.js";
import { Message } from "../models/message.js";
import { Thread } from "../models/thread.js";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";
import { Summary } from "../models/summary.js";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

interface CustomJwtPayload extends JwtPayload {
    id: string;
}

interface Query {
    prompt: string;
    userId: string;
}

type Message = {
    msg: string;
    sendBy: string;
}

type Sender = "user" | "system";

interface IncomingMessage {
    msg: string;
    sendBy: Sender;
}

type Input = {
    role: string;
    content: string;
}

function isIncomingMessage(item: unknown): item is IncomingMessage {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
        typeof obj.msg === "string" && (obj.sendBy === "user" || obj.sendBy === "system")
    );
}

export const chatController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt, userId } = req.body;
        let summary = req.body.summary ? req.body.summary : null;
        // console.log(userId)
        if (userId === undefined) {
            // console.log("********Guest User**********");
            const rawMessages: unknown = req.body?.messages;

            if (!Array.isArray(rawMessages)) {
                res.status(400).json({ error: "Messages should be an array" })
                return;
            }
            if (!rawMessages.every(isIncomingMessage)) {
                res.status(400).json({ error: "Each message must follow isIncomingMessage" })
                return;
            }

            if (rawMessages.length === 1) {
                // Generate title
                const response = await client.responses.create({
                    model: "openai/gpt-oss-20b",
                    instructions: `${systemPrompt}
                    Generate a short, meaningful title for this conversation based on the user's first message.
                    Keep the title around 3-8 words.
                    The answer must follow standard Markdown formatting.`,
                    text: {
                        format: {
                            type: "json_schema",
                            name: "chat_response",
                            strict: true,
                            schema: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string"
                                    },
                                    answer: {
                                        type: "string"
                                    }
                                },
                                required: ["title", "answer"],
                                additionalProperties: false
                            }
                        }
                    },
                    tool_choice: "auto",
                    parallel_tool_calls: false,
                    input: prompt,
                });
                // console.log(JSON.parse(response.output_text).title);
                res.status(200).json({ content: JSON.parse(response.output_text).answer, title: JSON.parse(response.output_text).title });
            } else {
                // Only generate the output

                const input = [
                    ...rawMessages.map(message => {
                        // if (typeof message === "object") {
                        return {
                            role: message.sendBy === "system" ? "assistant" as const : "user" as const,
                            content: message.msg
                        }
                        // }
                    }),
                    // {
                    //     role: "user" as const,
                    //     content: prompt
                    // } Because current prompt is also included in rawMessages
                ];

                const contextInstructions = `${systemPrompt}
                PREVIOUS CONVERSATION SUMMARY:
                ${summary || "No previous summary available."}

                Use this summary as background context when answering
                the user's latest question. Do not treat it as a new question.
                `;

                let counter = estimateTokens(JSON.stringify(input));
                counter += estimateTokens(contextInstructions);
                if (counter > 4000) {
                    const lastFewMessages = input.splice(-3);
                    summary = await summarizer(input);
                    const response = await client.responses.create({
                        model: "openai/gpt-oss-20b",
                        instructions: contextInstructions,
                        tool_choice: "auto",
                        parallel_tool_calls: false,
                        input: lastFewMessages,
                    });
                    res.status(200).json({ content: response.output_text, message: "token limits hit", summary, lastFewMessages });
                    return;
                }
                // console.log(counter);
                const response = await client.responses.create({
                    model: "openai/gpt-oss-20b",
                    instructions: contextInstructions,
                    tool_choice: "auto",
                    parallel_tool_calls: false,
                    input,
                });
                // console.log(response.usage)
                // counter += estimateTokens(response.output_text);
                // console.log(counter);
                res.status(200).json({ content: response.output_text });
            }
        } else {
            // User is logged in
            // console.log(userId);
            // const thread = await Thread.find({ owner: userId });

            if (req.body.chatId) {
                // console.log(req.body.chatId)
                // user either clicked on New chat button or clicked on pre-existing chat
                if (req.body.chatId === "New Chat") {
                    const response = await client.responses.create({
                        model: "openai/gpt-oss-20b",
                        instructions: `${systemPrompt}
                    Generate a short, meaningful title for this conversation based on the user's first message.
                    Keep the title around 3-8 words.
                    The answer must follow standard Markdown formatting.`,
                        text: {
                            format: {
                                type: "json_schema",
                                name: "chat_response",
                                strict: true,
                                schema: {
                                    type: "object",
                                    properties: {
                                        title: {
                                            type: "string"
                                        },
                                        answer: {
                                            type: "string"
                                        }
                                    },
                                    required: ["title", "answer"],
                                    additionalProperties: false
                                }
                            }
                        },
                        tool_choice: "auto",
                        parallel_tool_calls: false,
                        input: prompt,
                    });
                    // console.log(response);
                    const title = JSON.parse(response.output_text).title;
                    const newThread = await Thread.create({
                        title,
                        owner: userId
                    });
                    // console.log(newThread)
                    // console.log(newThread._id);
                    const newUserMsg = await Message.create({
                        msg: prompt,
                        sendBy: "user",
                        belongsTo: newThread._id
                    });
                    const newResponseMsg = await Message.create({
                        msg: JSON.parse(response.output_text).answer,
                        sendBy: "system",
                        belongsTo: newThread._id
                    });

                    res.status(200).json({ content: JSON.parse(response.output_text).answer, title: title, threadId: newThread._id });
                    return;
                } else {
                    // clicked on existing chat or new user is in it's first chat
                    const chatId: string = req.body.chatId;

                    const rawMessages = await Message.find({ belongsTo: chatId });
                    // type OldMessage = {
                    //     role: "user" | "assistant" | "system" | "developer";
                    //     content: string;
                    // }
                    const chatHistory = rawMessages.map(({ msg, sendBy }) => {
                        return {
                            msg,
                            sendBy
                        }
                    });
                    // rawMessages.push({ msg: prompt, sendBy: "user" })
                    const input: ResponseInput = [
                        ...chatHistory.map(message => {
                            return {
                                role: message.sendBy === "system" ? "assistant" as const : "user" as const,
                                content: message.msg
                            }
                        }),
                        {
                            role: "user" as const,
                            content: prompt
                        }
                    ];
                    const contextInstructions = `${systemPrompt}
                PREVIOUS CONVERSATION SUMMARY:
                ${summary || "No previous summary available."}

                Use this summary as background context when answering
                the user's latest question. Do not treat it as a new question.
                `;

                    let counter = estimateTokens(JSON.stringify(input));
                    counter += estimateTokens(contextInstructions);
                    // console.log(counter)
                    if (counter > 4000) {
                        // console.log(counter)
                        const lastFewMessages = input.splice(-3);
                        summary = await summarizer(input);
                        const response = await client.responses.create({
                            model: "openai/gpt-oss-20b",
                            instructions: contextInstructions,
                            tool_choice: "auto",
                            parallel_tool_calls: false,
                            input: lastFewMessages,
                        });
                        const newUserMsg = await Message.create({
                            msg: prompt,
                            sendBy: "user",
                            belongsTo: chatId
                        });
                        const newSummary = await new Summary({
                            msg: summary,
                            belongsTo: chatId
                        })
                        await newSummary.save();

                        const newResponseMsg = await Message.create({
                            msg: response.output_text,
                            sendBy: "system",
                            belongsTo: chatId
                        });
                        res.status(200).json({ content: response.output_text, message: "token limits hit" });
                        return;
                    }

                    const threadSummary = await Summary.find({ belongsTo: chatId });
                    if (threadSummary.length > 0) {
                        let str = "";
                        for (let obj of threadSummary) {
                            str += obj.msg;
                        }
                        summary = str;
                        const lastFewMessages = input.splice(-7);
                        const response = await client.responses.create({
                            model: "openai/gpt-oss-20b",
                            instructions: contextInstructions,
                            tool_choice: "auto",
                            parallel_tool_calls: false,
                            input: lastFewMessages,
                        });
                        const newUserMsg = await Message.create({
                            msg: prompt,
                            sendBy: "user",
                            belongsTo: chatId
                        });
                        const newResponseMsg = await Message.create({
                            msg: response.output_text,
                            sendBy: "system",
                            belongsTo: chatId
                        });
                        res.status(200).json({ content: response.output_text });
                        return;
                    }
                    const response = await client.responses.create({
                        model: "openai/gpt-oss-20b",
                        instructions: contextInstructions,
                        tool_choice: "auto",
                        parallel_tool_calls: false,
                        input: input,
                    });
                    const newUserMsg = await Message.create({
                        msg: prompt,
                        sendBy: "user",
                        belongsTo: chatId
                    });
                    // console.log(response);
                    // console.log(response.usage?.total_tokens);
                    // console.log("executed1")
                    // res.send(response.output_text);
                    const newResponseMsg = await Message.create({
                        msg: response.output_text,
                        sendBy: "system",
                        belongsTo: chatId
                    });
                    // console.log("executed2")
                    res.status(200).json({ content: response.output_text });
                }

            } else {
                // New User or user who has chats didn't clicked on any chat or new chat button
                // Generate Title
                const response = await client.responses.create({
                    model: "openai/gpt-oss-20b",
                    instructions: `${systemPrompt}
                    Generate a short, meaningful title for this conversation based on the user's first message.
                    Keep the title around 3-8 words.
                    The answer must follow standard Markdown formatting.`,
                    text: {
                        format: {
                            type: "json_schema",
                            name: "chat_response",
                            strict: true,
                            schema: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string"
                                    },
                                    answer: {
                                        type: "string"
                                    }
                                },
                                required: ["title", "answer"],
                                additionalProperties: false
                            }
                        }
                    },
                    tool_choice: "auto",
                    parallel_tool_calls: false,
                    input: prompt,
                });
                const title = JSON.parse(response.output_text).title;
                const newThread = await Thread.create({
                    title,
                    owner: userId
                });
                // console.log(newThread)
                // console.log(newThread._id);
                const newUserMsg = await Message.create({
                    msg: prompt,
                    sendBy: "user",
                    belongsTo: newThread._id
                });
                const newResponseMsg = await Message.create({
                    msg: JSON.parse(response.output_text).answer,
                    sendBy: "system",
                    belongsTo: newThread._id
                });
                res.status(200).json({ content: JSON.parse(response.output_text).answer, title: title, threadId: newThread._id });
                return;
            }
        }

    } catch (error: any) {
        // console.log(error)
        // console.error("Error message:", error.message);
        // console.error("Error status:", error.status);
        // console.error("Error details:", error.error);
        // console.error("Full error:", error);
        res.status(500).json({ content: "Internal server error, Try after some time! or May be You have crossed the token limit" });
    }
}


