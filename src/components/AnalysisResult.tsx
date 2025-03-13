// src/components/AnalysisResult.tsx
import React from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import ReactMarkdown from 'react-markdown';

interface AnalysisResultProps {
  result: AnalysisResultType;
  filename: string;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
  result, 
  filename,
  onReset 
}) => {
  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Analysis for: {filename}</h2>
        <button 
          onClick={onReset}
          className="reset-button"
        >
          Analyze Another Report
        </button>
      </div>

      <div className="analysis-content">
        <div className="tabs">
          <button className="tab active">Analysis</button>
          <button className="tab">QA Feedback</button>
          <button className="tab">Export</button>
        </div>

        <div className="tab-content">
          <div className="markdown-content">
            <ReactMarkdown>{result.analysis}</ReactMarkdown>
          </div>
        </div>

        <div className="qa-feedback">
          <h3>QA Feedback</h3>
          <ReactMarkdown>{result.qaFeedback}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;