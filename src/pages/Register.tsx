// src/components/AnalysisResult.tsx
import React, { useState, useRef } from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [activeTab, setActiveTab] = useState<'analysis' | 'qa' | 'export'>('analysis');
  const analysisRef = useRef<HTMLDivElement>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Extract metrics from analysis for summary display
  const extractMetrics = (analysis: string) => {
    const readingAge = analysis.match(/reading age:?\s*(?:of\s*)?(\d+(?:\.\d+)?)/i)?.[1] || 'N/A';
    const fleschScore = analysis.match(/flesch reading ease:?\s*(\d+(?:\.\d+)?)/i)?.[1] || 'N/A';
    
    return {
      readingAge,
      fleschScore
    };
  };
  
  const metrics = extractMetrics(result.analysis);

  // Generate PDF from analysis content
  const generatePDF = async () => {
    if (!analysisRef.current) return;
    
    setExportLoading(true);
    
    try {
      const contentElement = analysisRef.current;
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with appropriate dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      let position = 0;
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(`Analysis Report - ${filename}`, 10, 10);
      position += 20;
      
      // Add generation date
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 10, position);
      position += 10;
      
      // Add the rendered content
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`AoV_Analysis_${filename.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF export');
    } finally {
      setExportLoading(false);
    }
  };

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

      <div className="analysis-metrics">
        <div className="metric-card">
          <span className="metric-label">Reading Age</span>
          <span className="metric-value">{metrics.readingAge}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Flesch Score</span>
          <span className="metric-value">{metrics.fleschScore}</span>
        </div>
      </div>

      <div className="analysis-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            Analysis
          </button>
          <button 
            className={`tab ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            QA Feedback
          </button>
          <button 
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            Export
          </button>
        </div>

        {activeTab === 'analysis' && (
          <div className="tab-content">
            <div className="markdown-content" ref={analysisRef}>
              <ReactMarkdown>{result.analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="tab-content">
            <div className="qa-feedback">
              <h3>QA Feedback</h3>
              <ReactMarkdown>{result.qaFeedback}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="tab-content export-tab">
            <h3>Export Options</h3>
            <p>Download your analysis report in your preferred format:</p>
            
            <div className="export-options">
              <button 
                className="export-button pdf-button"
                onClick={generatePDF}
                disabled={exportLoading}
              >
                {exportLoading ? 'Generating PDF...' : 'Download as PDF'}
              </button>
              
              <button className="export-button markdown-button">
                Download as Markdown
              </button>
            </div>
            
            <div className="export-preview">
              <h4>Preview</h4>
              <p>The export will include:</p>
              <ul>
                <li>Complete analysis report</li>
                <li>Key metrics and scores</li>
                <li>QA feedback and recommendations</li>
                <li>Original report filename and date</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;