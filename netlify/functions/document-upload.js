// netlify/functions/document-upload.js

const { createClient } = require('@supabase/supabase-js');
const busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');

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

  // Check if the request has the correct content type
  if (!event.headers['content-type']?.includes('multipart/form-data')) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid content type. Must be multipart/form-data' })
    };
  }

  return new Promise((resolve) => {
    const bb = busboy({ headers: event.headers });
    const result = {
      files: [],
      userId: null,
      documentType: null
    };

    // Handle fields in the form data
    bb.on('field', (name, val) => {
      if (name === 'userId') {
        result.userId = val;
      } else if (name === 'documentType') {
        result.documentType = val;
      }
    });

    // Handle file uploads
    bb.on('file', async (name, file, info) => {
      const { filename, mimeType } = info;
      const fileData = [];

      file.on('data', (data) => {
        fileData.push(data);
      });

      file.on('end', () => {
        result.files.push({
          filename,
          mimeType,
          content: Buffer.concat(fileData)
        });
      });
    });

    // Handle end of the form data parsing
    bb.on('finish', async () => {
      try {
        if (!result.userId) {
          resolve({
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User ID is required' })
          });
          return;
        }

        const uploadResults = [];

        for (const file of result.files) {
          const fileId = uuidv4();
          const filePath = `${result.userId}/${fileId}-${file.filename}`;

          // Upload file to Supabase storage
          const { data: storageData, error: storageError } = await supabase
            .storage
            .from('documents')
            .upload(filePath, file.content, {
              contentType: file.mimeType,
              upsert: false
            });

          if (storageError) {
            throw storageError;
          }

          // Create a record in the documents table
          const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert({
              id: fileId,
              client_id: result.userId,
              file_name: file.filename,
              file_type: file.mimeType,
              file_path: filePath,
              document_type: result.documentType || 'other',
              uploaded_at: new Date().toISOString()
            })
            .select()
            .single();

          if (docError) {
            throw docError;
          }

          uploadResults.push(docData);
        }

        resolve({
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploaded: uploadResults })
        });
      } catch (error) {
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        });
      }
    });

    // Parse the event body
    bb.write(Buffer.from(event.body, 'base64'));
    bb.end();
  });
};
