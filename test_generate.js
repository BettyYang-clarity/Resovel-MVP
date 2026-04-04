const key = 'AIzaSyAbKqX5JlQ6dCcLMQ9GqSo9ckWIzWu9ZzQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function test() {
  const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { // <--- Using snake_case here
        parts: [{ text: "You must output JSON: {\"hello\": \"system_instruction\"}" }],
      },
      contents: [{
        role: 'user',
        parts: [{ text: "hi!" }],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
