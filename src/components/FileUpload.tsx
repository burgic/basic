// src/components/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { processPDFFile } from '../utils/pdfUtils';
import { ReportData } from '../types';

interface FileUploadProps {
  onFileProcessed: (data: ReportData, filename: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedFile) {
      try {
        const reportData = await processPDFFile(selectedFile);
        onFileProcessed(reportData, selectedFile.name);
      } catch (error) {
        console.error('Error processing PDF:', error);
        alert('Failed to process PDF file');
      }
    }
  }, [selectedFile, onFileProcessed]);

  return (
    <div className="upload-container">
      <div 
        className={`upload-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="upload-icon" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          <p>Drag and drop your AoV PDF file here</p>
          <p>or</p>
          <label className="file-input-label">
            Browse Files
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="file-input" 
            />
          </label>
        </div>
      </div>

      {selectedFile && (
        <div className="selected-file">
          <div className="file-info">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="file-icon" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
            <span>{selectedFile.name}</span>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={isProcessing} 
            className="analyze-button"
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Report'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;