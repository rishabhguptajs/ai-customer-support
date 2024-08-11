const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY;

export const getLlmResponse = async (message: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "qwen/qwen-2-7b-instruct:free",
        "messages": [
          { "role": "user", "content": message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const botMessage = data.choices[0]?.message?.content?.trim() || 'Sorry, I couldn\'t process your request.';
    return botMessage;
  } catch (error) {
    console.error('Error getting response from LLM', error);
    return 'Sorry, I couldn\'t process your request.';
  }
};
