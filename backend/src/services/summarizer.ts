import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

const summarizerPrompt = `
You are conversation memory manager.

Your task is to summarize the provided conversation messages into a concise but information-rich summary that will be used as context in future conversations.

## Instructions

1. Preserve the important information from the conversation.
2. Maintain the original meaning and intent of both user and assistant messages.
3. Prioritize:
   - User's goals and intentions.
   - Important personal preferences and requirements.
   - Technical details, programming languages, frameworks, and tools.
   - Decisions, solutions, and approaches already discussed.
   - Ongoing projects and their current progress.
   - Unresolved problems, errors, and pending tasks.
   - Important facts, names, values, and constraints.
4. Preserve important technical details, including function names, variable names, API endpoints, error messages, and architectural decisions when relevant.
5. Retain information necessary to understand references to earlier discussions.
6. Remove repetitive explanations, greetings, irrelevant small talk, and redundant information.
7. Do not invent information, make assumptions, or introduce facts that are not present in the conversation.
8. Clearly distinguish confirmed decisions from suggestions or possibilities.
9. Do not include outdated information when a newer message explicitly corrects or replaces it.
10. Keep the summary organized and easy for another AI assistant to understand.

## Output Structure

Use the following structure:

### Conversation Overview
A brief description of what the conversation is about.

### Important Context
Relevant facts, preferences, requirements, and constraints.

### Key Discussions and Decisions
Important topics discussed and decisions made.

### Current Progress
What has been accomplished so far.

### Unresolved Issues
Problems that still need attention.

### Next Steps
Tasks or actions that were planned but not completed.

## Important

- Be concise, but never sacrifice important context.
- Avoid reproducing the entire conversation.
- Write in third person when describing the user's situation.
- Preserve relevant technical terminology.
- The summary must be self-contained and understandable without access to the original messages.
- Do not answer the original conversation questions. Your only task is to create a conversation summary.
`;


const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

type OldMessage = {
    role: "user" | "assistant" | "system" | "developer";
    content: string;
}

export const summarizer = async (oldMessages: ResponseInput) => {
    const summaryResponse = await client.responses.create({
        model: "openai/gpt-oss-20b",
        instructions: summarizerPrompt,
        input: oldMessages
    });
    return summaryResponse.output_text;
}