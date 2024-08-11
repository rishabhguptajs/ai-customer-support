import { useState } from 'react';
import { getLlmResponse } from '../utils/llmService';

const useChatbot = () => {
  const [responses, setResponses] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    const userMessage = message;
    setResponses(prevResponses => [...prevResponses, `You: ${userMessage}`]);
    setMessage('');

    setLoading(true);
    try {
      const botResponse = await getLlmResponse(userMessage);
      setResponses(prevResponses => [...prevResponses, `Bot: ${botResponse}`]);
    } catch (error) {
      console.error('Error getting response from LLM:', error);
      setResponses(prevResponses => [...prevResponses, `You: ${userMessage}`, 'Bot: Sorry, I couldn\'t process your request.']);
    } finally {
      setLoading(false);
    }
  };

  return {
    message,
    setMessage,
    responses,
    sendMessage,
    loading
  };
};

export default useChatbot;
