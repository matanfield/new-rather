import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Primary model for chat
export const chatModel = anthropic('claude-sonnet-4-20250514');

// Model for generating titles and summaries
export const utilityModel = anthropic('claude-sonnet-4-20250514');
