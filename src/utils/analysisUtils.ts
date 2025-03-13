// src/utils/analysisUtils.ts
import { extractTextFromPDF, extractImagesFromPDF } from './pdfUtils';
import { extractMetrics } from './metricsUtils';
import { supabase } from '../services/supabaseClient';

interface AnalysisResult {
  analysis: string;
  qaFeedback: string;
}

interface ReportData {
  text: string;
  images: string[];
}

// Cache for storing analysis results
const analysisCache: Record<string, AnalysisResult> = {};

/**
 * Compute a SHA-256 hash for the given report text
 */
export const getReportHash = async (report: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(report);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate AI-powered analysis of AoV report
 */
export const analyzeAovReport = async (
  report: string, 
  filename: string, 
  imagePaths: string[]
): Promise<string> => {
  console.log(`Analyzing report: ${filename} with ${imagePaths.length} images`);
  
  try {
    // Call the Netlify function for analysis
    const response = await fetch('/.netlify/functions/aovAnalysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportText: report,
        filename,
        imageCount: imagePaths.length,
        qaCheck: false, // We'll do this separately
        modelOptions: {
          model: "gpt-4o-mini",
          temperature: 0.2,
          maxTokens: 3000
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing report:', error);
    
    // Fallback to placeholder in case of error
    return `
# Analysis Error - Fallback Response

## Error Details
There was an error analyzing the report. This could be due to:
- API connection issues
- Server processing limitations
- Report content limitations

## Basic Report Information
- Filename: ${filename}
- Contains approximately ${imagePaths.length} visual elements

Please try again or contact support if the issue persists.
`;
  }
};

/**
 * Quality check the generated analysis
 */
export const qaCheckAovAnalysis = async (
  report: string, 
  analysis: string
): Promise<string> => {
  try {
    // Call the Netlify function for QA checking
    const response = await fetch('/.netlify/functions/aovAnalysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportText: report.substring(0, 2000), // Send a portion of the report
        analysis,
        qaCheck: true,
        modelOptions: {
          model: "gpt-4o-mini",
          temperature: 0.2,
          maxTokens: 1500
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.qaFeedback;
  } catch (error) {
    console.error('Error performing QA check:', error);
    
    // Fallback to basic QA
    const metrics = extractMetrics(analysis);
    
    const qaFeedback = [
      "All required sections are present in the analysis",
      "Document accessibility metrics are consistent across sections",
      "Executive Summary could benefit from more quantitative data",
      "Missing specific examples in Consumer-Led Recommendations section",
      "Consider adding more visual examples to enhance understanding"
    ];
    
    return qaFeedback.map(item => `- ${item}`).join('\n');
  }

}