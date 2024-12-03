import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_DATABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// netlify/functions/chat.ts

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  
    try {
      const { userId, message } = JSON.parse(event.body || '{}');
  
      if (!userId || !message) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing userId or message' })
        };
      }
  
      // Validate user exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
  
      if (profileError) {
        console.error('Profile error:', profileError);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'User not found' })
        };
      }
  
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful financial advisor assistant." },
          { role: "user", content: message }
        ]
      });
  
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          response: completion.choices[0].message.content
        })
      };
  
    } catch (error) {
      console.error('Server error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error', details: error.message })
      };
    }
  };