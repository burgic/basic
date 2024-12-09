// src/components/Chat/Chat.tsx

import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useFinancialData } from '../../hooks/useFinancialData';
import { supabase } from '../../services/supabaseClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { data: financialData, loading: dataLoading } = useFinancialData();

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user?.id || !financialData) return;
    
    setIsLoading(true);
    setError(null);
  
    // Transform financialContext into the expected financialData structure
    const formattedFinancialData = {
      incomes: [{ 
        client_id: user.id,
        type: 'Total Income', 
        amount: financialData.income,
        frequency: 'Annual' 
      }],
      expenditures: financialData.expenditure.map(exp => ({
        client_id: user.id,
        category: exp.category,
        amount: exp.amount,
        frequency: 'Monthly'
      })),
      assets: [{
        client_id: user.id,
        type: 'Total Assets',
        value: financialData.assets,
        description: 'Combined assets'
      }],
      liabilities: [{
        client_id: user.id,
        type: 'Total Liabilities',
        amount: financialData.liabilities,
        interest_rate: 0
      }],
      goals: (financialData.goals || []).map(goal => ({
        id: goal.id,
        client_id: user.id,
        goal: goal.goal,
        target_amount: goal.target_amount,
        time_horizon: goal.time_horizon
      }))
    };
    
    console.log('Raw financial data:', financialData);
    console.log('Formatted data being sent:', formattedFinancialData);
  
    // Create message history in the format OpenAI expects
    const messageHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    try {
      const requestBody = { 
        message: text,
        messageHistory,
        userId: user.id,
        financialData: formattedFinancialData
      };

      console.log('Full request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response from server:', data);
  
      if (data.error) {
        throw new Error(data.error);
      }
      
      const newUserMessage: ChatMessage = { role: 'user', content: text };
      const newAssistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: data.response 
      };
      
      setMessages(prev => [...prev, newUserMessage, newAssistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4 mb-4 h-[60vh] overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Ask me anything about financial planning, investments, or budgeting!
          </div>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-lg max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white ml-auto' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}
          >
            <div className="text-sm opacity-75 mb-1">
              {msg.role === 'user' ? 'You' : 'Financial Advisor'}
            </div>
            <div className="whitespace-pre-wrap">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 text-gray-600 p-4 rounded-lg max-w-[85%]">
            Thinking...
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about financial planning, investments, or budgeting..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(message)}
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}


/*
import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) {
      setError('Please enter a message and ensure you are logged in');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, message: text })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.response) {
        throw new Error('Invalid response format from server');
      }

      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 text-sm text-gray-600">
        {user ? `Logged in as: ${user.email}` : 'Please log in to use the chat'}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
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
          disabled={!user || isLoading}
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={!user || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}



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