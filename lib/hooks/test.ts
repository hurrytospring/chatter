
import axios from 'axios';
import  { OpenAI } from 'openai';
// import {
//   GoogleGenerativeAI,
//   HarmBlockThreshold,
//   HarmCategory,
// } from '@google/generative-ai';

// // Access your API key (see "Set up your API key" above)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || '');

// export async function llmChatGemini(prompt: string) {
//   // For text-only input, use the gemini-pro model
//   const model = genAI.getGenerativeModel({
//     model: 'gemini-pro',
//     safetySettings: [
//       {
//         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//         threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
//       },
//     ],
//   });

//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   const text = response.text();
//   return text;
// }
// window.llmChatGemini = llmChatGemini;
// const openai = new OpenAI({
//   baseURL: process.env.openaiApiBase,
//   apiKey: process.env.openaiApiKey,
//   dangerouslyAllowBrowser: true,
// });

const openai = new OpenAI({
  apiKey: '你的API密钥', // 默认为process.env["OPENAI_API_KEY"]
});

export async function llmChat(content: string, model?: string) {
  const rep = await openai.chat.completions.create({
    model: model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content }],
  });
  return rep.choices[0].message.content;
}


export async function llmChatStream(content: string, model?: string) {
  const rep = await openai.chat.completions.create({
    model: model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content }],
    stream: true,
  });
  return rep;
}

