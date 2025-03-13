# AoV Report Analyzer

An AI-powered web application that analyzes Assessment of Value (AoV) reports for financial compliance, accessibility, and effectiveness.

## Features

- **Authentication**: Secure login and registration
- **PDF Parsing**: Upload and extract text from PDF reports
- **AI Analysis**: AI-powered evaluation using OpenAI API
- **Detailed Metrics**: Readability scores, document structure analysis
- **Export Options**: Download analysis as PDF
- **History**: Track previous analyses in a dashboard

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone this repository
```
git clone https://github.com/yourusername/aov-analyzer.git
cd aov-analyzer
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file with the following variables:
```
REACT_APP_SUPABASE_DATABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Set up Supabase tables by running the SQL scripts in `supabase/schema.sql`

5. Start the development server
```
npm start
```

## Netlify Deployment

### Deploy via Netlify UI

1. Build your application
```
npm run build
```

2. Drag and drop the `build` folder to Netlify

### Deploy via Netlify CLI

1. Install Netlify CLI
```
npm install -g netlify-cli
```

2. Connect to your Netlify site
```
netlify link
```

3. Deploy
```
netlify deploy --prod
```

### Environment Variables

Set these in your Netlify site settings:

- `REACT_APP_SUPABASE_DATABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Supabase Setup

### Create Tables

Create the following tables in your Supabase dashboard:

1. `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

2. `analyses` table:
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  filename TEXT NOT NULL,
  report_hash TEXT NOT NULL,
  analysis TEXT NOT NULL,
  qa_feedback TEXT,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Set up Row Level Security

```sql
-- Profiles table policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit their own profile"
  ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Analyses table policy
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
  ON analyses
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analyses"
  ON analyses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

## Project Structure

```
/
├── netlify/
│   └── functions/
│       └── aovAnalysis.js        # Serverless function for AI analysis
│
├── public/
│   ├── index.html
│   └── ...
│
├── src/
│   ├── components/               # React components
│   │   ├── AnalysisResult.tsx    # Displays analysis results
│   │   ├── FileUpload.tsx        # PDF upload component
│   │   ├── Header.tsx            # App header
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── ProtectedRoute.tsx    # Route protection component
│   │   └── ReportAnalyzer.tsx    # Main analyzer component
│   │
│   ├── context/                  # React context
│   │   └── AuthContext.tsx       # Authentication context
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useAuthRedirect.ts    # Auth redirection hook
│   │
│   ├── pages/                    # Full page components
│   │   ├── Dashboard.tsx         # User dashboard
│   │   ├── Login.tsx             # Login page
│   │   └── Register.tsx          # Registration page
│   │
│   ├── services/                 # API services
│   │   └── supabaseClient.ts     # Supabase client setup
│   │
│   ├── styles/                   # CSS styles
│   │   ├── auth.css              # Auth component styles
│   │   ├── dashboard.css         # Dashboard styles
│   │   └── styles.css            # Main styles
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Shared types
│   │
│   ├── utils/                    # Utility functions
│   │   ├── analysisUtils.ts      # Analysis processing
│   │   ├── metricsUtils.ts       # Metrics extraction
│   │   └── pdfUtils.ts           # PDF processing
│   │
│   ├── App.tsx                   # Main app component
│   └── index.tsx                 # Entry point
│
├── netlify.toml                  # Netlify configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Using the App

1. Register/login to the application
2. Upload an AoV report PDF
3. Wait for the analysis to complete
4. View the detailed report with metrics and recommendations
5. Export the analysis to PDF if needed
6. View history of past analyses in the Dashboard

## Dependencies

- React
- TypeScript
- PDF.js for PDF processing
- jsPDF for PDF generation
- Supabase for authentication and data storage
- OpenAI for AI analysis
- React Router for navigation
- html2canvas for PDF export
- React Markdown for rendering markdown content

## License

MIT