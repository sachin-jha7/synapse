// 4 chars = 1 token

export const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
}

interface TokenUsage {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
}

export const tokenUsage = (usage: TokenUsage) => {
    return {
        input: usage.input_tokens,
        output: usage.output_tokens,
        total: usage.total_tokens
    }
}