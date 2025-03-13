// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface AnalysisRecord {
  id: string;
  created_at: string;
  filename: string;
  report_hash: string;
  metrics: {
    readingAge?: number;
    fleschScore?: number;
    wordsPerSentence?: number;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) return;
      
      try {
        // Fetch recent analyses for the current user
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        setAnalyses(data || []);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError('Failed to load your analysis history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyses();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/analyzer" className="new-analysis-button">
          New Analysis
        </Link>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-panel">
          <h2>Recent Analyses</h2>
          
          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Loading your analyses...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : analyses.length === 0 ? (
            <div className="empty-state">
              <p>You haven't run any analyses yet.</p>
              <Link to="/analyzer" className="cta-button">
                Analyze Your First Report
              </Link>
            </div>
          ) : (
            <div className="analyses-list">
              <div className="analyses-header">
                <div className="col-filename">Filename</div>
                <div className="col-date">Date</div>
                <div className="col-metrics">Key Metrics</div>
                <div className="col-actions">Actions</div>
              </div>
              
              {analyses.map((analysis) => (
                <div key={analysis.id} className="analysis-row">
                  <div className="col-filename">{analysis.filename}</div>
                  <div className="col-date">{formatDate(analysis.created_at)}</div>
                  <div className="col-metrics">
                    {analysis.metrics?.readingAge && (
                      <span className="metric">Reading Age: {analysis.metrics.readingAge}</span>
                    )}
                    {analysis.metrics?.fleschScore && (
                      <span className="metric">Flesch Score: {analysis.metrics.fleschScore}</span>
                    )}
                  </div>
                  <div className="col-actions">
                    <Link to={`/analysis/${analysis.id}`} className="view-button">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="dashboard-sidebar">
          <div className="sidebar-card">
            <h3>What's New</h3>
            <ul className="updates-list">
              <li>Enhanced QA checks for better analysis</li>
              <li>PDF export capability</li>
              <li>Analysis history tracking</li>
            </ul>
          </div>
          
          <div className="sidebar-card">
            <h3>Tips</h3>
            <ul className="tips-list">
              <li>Upload clean PDF files for better extraction</li>
              <li>Allow a few minutes for complex report analysis</li>
              <li>Check QA feedback for improvement suggestions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;