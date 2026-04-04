import { buildResovelPrompt } from './src/lib/resovel-prompt.js';
const key = 'AIzaSyAbKqX5JlQ6dCcLMQ9GqSo9ckWIzWu9ZzQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function test() {
  const user = {
    mbti: 'ESTJ',
    age: '30s',
    situation: '工作管理下屬有困難',
    energy: 'normal',
    goals: ['想學說服力'],
    avoidTypes: [],
    booksRead: [],
    depthSlider: 50,
    langSlider: 50,
    mode: 'problem',
  };
  const { systemPrompt, userPrompt } = buildResovelPrompt(user);

  const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("----- RAW TEXT -----");
  console.log(rawText);
  console.log("--------------------");
}
test();
