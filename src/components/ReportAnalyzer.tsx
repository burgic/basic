// src/components/ReportAnalyzer.tsx
import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import AnalysisResult from './AnalysisResult';
import { ReportData, AnalysisResult as AnalysisResultType } from '../types';
import { processAovReport } from '../utils/analysisUtils';
import { useAuth } from '../context/AuthContext';

const ReportAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleFileProcessed = useCallback(async (data: ReportData, name: string) => {
    setReportData(data);
    setFilename(name);
    setIsProcessing(true);
    setProcessingError(null);

    try {
      // Process with user ID if available
      const result = await processAovReport(data, name, user?.id);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing report:', error);
      setProcessingError('Failed to analyze report. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const handleReset = useCallback(() => {
    setReportData(null);
    setFilename('');
    setAnalysisResult(null);
    setProcessingError(null);
  }, []);

  return (
    <div className="analyzer-container">
      {!analysisResult ? (
        <>
          <div className="analyzer-instructions">
            <h2>Upload an AoV Report for Analysis</h2>
            <p>
              Upload your Assessment of Value (AoV) report PDF file to receive an AI-powered
              analysis of its effectiveness, accessibility, and compliance with FCA guidelines.
            </p>
            {processingError && (
              <div className="error-message">
                <p>{processingError}</p>
              </div>
            )}
          </div>
          <FileUpload 
            onFileProcessed={handleFileProcessed} 
            isProcessing={isProcessing} 
          />
          {isProcessing && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing your report...</p>
              <p className="loading-detail">This may take a few minutes for complex reports</p>
            </div>
          )}
        </>
      ) : (
        <AnalysisResult 
          result={analysisResult} 
          filename={filename}
          onReset={handleReset} 
        />
      )}
    </div>
  );
};

export default ReportAnalyzer;