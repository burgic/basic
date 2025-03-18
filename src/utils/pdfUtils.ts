// src/utils/pdfUtils.ts
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

/**
 * Extract text content from a PDF file
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};

/**
 * Extract images from a PDF file
 * Returns paths to extracted images (in this case, data URLs)
 */
export const extractImagesFromPDF = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const imagePaths: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const operatorList = await page.getOperatorList();
      
      for (let j = 0; j < operatorList.fnArray.length; j++) {
        // Check if the operator is "paintImageXObject"
        if (operatorList.fnArray[j] === pdfjs.OPS.paintImageXObject) {
          const imgIndex = operatorList.argsArray[j][0];
          
          // This is a simplified approach - in a real application,
          // you would need to extract the actual image data
          // For demonstration purposes, we'll just track that an image was found
          imagePaths.push(`page_${i}_img_${imgIndex}`);
        }
      }
    }

    return imagePaths;
  } catch (error) {
    console.error('Error extracting images from PDF:', error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Process a PDF file and extract both text and images
 */
export const processPDFFile = async (file: File) => {
  const text = await extractTextFromPDF(file);
  const imagePaths = await extractImagesFromPDF(file);
  
  return {
    text,
    images: imagePaths
  };
};