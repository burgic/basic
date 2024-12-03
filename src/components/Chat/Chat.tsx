// src/components/Chat/Chat.tsx

import React, { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const Chat: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string) => {
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          message
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
      <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-700 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            <div className="bg-blue-500 text-white p-2 rounded-lg mb-2 max-w-[80%] ml-auto">
              {msg.user}
            </div>
            <div className="bg-gray-600 text-white p-2 rounded-lg max-w-[80%]">
              {msg.bot}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default Chat