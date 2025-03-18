// netlify/functions/data-fetcher.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, userId, dataType, dataId, data } = JSON.parse(event.body);

    switch (action) {
      case 'fetch':
        let query = supabase.from(dataType).select('*');
        
        if (userId) {
          query = query.eq('client_id', userId);
        }
        
        if (dataId) {
          query = query.eq('id', dataId);
        }
        
        const { data: fetchedData, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: fetchedData })
        };
        
      case 'create':
        if (!data) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Data is required for creation' })
          };
        }
        
        const { data: createdData, error: createError } = await supabase
          .from(dataType)
          .insert([data])
          .select();
          
        if (createError) throw createError;
        
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: createdData[0] })
        };
        
      case 'update':
        if (!dataId || !data) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Data ID and update data are required' })
          };
        }
        
        const { data: updatedData, error: updateError } = await supabase
          .from(dataType)
          .update(data)
          .eq('id', dataId)
          .select();
          
        if (updateError) throw updateError;
        
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: updatedData[0] })
        };
        
      case 'delete':
        if (!dataId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Data ID is required for deletion' })
          };
        }
        
        const { error: deleteError } = await supabase
          .from(dataType)
          .delete()
          .eq('id', dataId);
          
        if (deleteError) throw deleteError;
        
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true })
        };
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};