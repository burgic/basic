import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: text })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4 h-[60vh] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[80%] ${
            msg.role === 'user' 
              ? 'bg-blue-500 text-white ml-auto' 
              : 'bg-gray-200 text-gray-900'
          }`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(message)}
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}


/*
// Chat.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, message: text })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg ${
            msg.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200'
          }`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(message)}
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

*/