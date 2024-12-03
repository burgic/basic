import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input || !user) return; // Ensure input and user exist

    try {
      const response = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, query: input }), // Use user.id from AuthContext
      });

      const data = await response.json();

      if (data.response) {
        setMessages([...messages, { user: input, bot: data.response }]);
        setInput('');
      } else {
        console.error('Error in bot response:', data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!user) {
    return <div>Loading user information...</div>; // Show a loading state if user isn't available yet
  }


  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p><strong>User:</strong> {msg.user}</p>
            <p><strong>Bot:</strong> {msg.bot}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;