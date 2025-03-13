// netlify/functions/aovAnalysis.js

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
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
    console.log('AoV Analysis Function called');
    
    const { 
      reportText, 
      filename, 
      imageCount = 0,
      qaCheck = true,
      modelOptions = {}
    } = JSON.parse(event.body);

    if (!reportText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Report text is required' })
      };
    }

    // Generate detailed analysis
    const analysis = await analyzeAovReport(reportText, filename, imageCount, modelOptions);
    
    // If QA check requested, perform it
    let qaFeedback = null;
    if (qaCheck) {
      qaFeedback = await qaCheckAovAnalysis(reportText, analysis, modelOptions);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        qaFeedback
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Generate AI analysis of the AoV report
async function analyzeAovReport(reportText, filename, imageCount, options = {}) {
  const { model = "gpt-4o-mini", temperature = 0.2, maxTokens = 3000 } = options;
  
  const systemPrompt = generateAnalysisPrompt(filename, imageCount);

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: reportText }
    ],
    temperature,
    max_tokens: maxTokens
  });

  return completion.choices[0].message.content;
}

// Quality check the analysis
async function qaCheckAovAnalysis(reportText, analysis, options = {}) {
  const { model = "gpt-4o-mini", temperature = 0.2, maxTokens = 1500 } = options;
  
  const systemPrompt = generateQAPrompt();

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Report: ${reportText.substring(0, 2000)}... (truncated)\n\nAnalysis: ${analysis}` 
      }
    ],
    temperature,
    max_tokens: maxTokens
  });

  return completion.choices[0].message.content;
}

// Generate the system prompt for AoV analysis
function generateAnalysisPrompt(filename, imageCount) {
  return `
    You are a compliance manager reviewing Assessment of Value Reports. Your task is to produce a detailed, comprehensive 
    consumer-focused analysis of the report in a professional manner. Your output must be formatted in Markdown using clear headings 
    and subheadings, and it should include specific metrics, actionable recommendations, and rich consumer-friendly 
    language. 
    
    **Key Guidelines:**
    - Write for a **technical audience** (e.g., asset management compliance manager) while maintaining professionalism.
    - Use **positive, constructive language** to frame recommendations (e.g., "Consider enhancing..." instead of "This is lacking...").
    - Provide **specific examples** of consumer-friendly language and actionable recommendations.
    - Reference **industry-standard benchmarks** for readability, visual effectiveness, and governance.
    - Ensure the analysis aligns with **FCA guidelines** and other regulatory expectations.

    Follow the structure exactly as outlined below

    # Enhanced Consumer-Focused Analysis of Assessment of Value Report from ${filename}

    ## Executive Summary

    ### Report Leadership and Governance
    - Evaluate presence and clarity of Chairman's introduction
    - Assess quality of Executive Summary and does it go beyond basic value statements
    - Review ESG approach articulation, does it provide clarity of firms approach to ESG?
    - Examine availability of individual fund analysis, or is it analysis of fund range only?

    ### Document Accessibility Overview
    - Report the average sentence length (e.g., X words per sentence) 
    - Report the average sentence length and text-to-visual ratio
    - Evaluate presence and quality of Glossary of Terms
    - Review contact information for additional details
    - Assess reading age and Flesch-Kincaid readability score
    
    ### Document Structure and Visual Elements
    - Analyze distribution and effectiveness of tables, charts, and diagrams 
    - Describe the clarity of visuals (e.g., graphs, charts) and the text-to-visual ratio (e.g., X:Y) and how they aid consumer understanding
    - Assess methodology explanation beyond RAG ratings
    - Review action plan clarity for identified issues
    - Evaluate visual aids for improved understanding

    ### Value Demonstration Effectiveness
    - List key quantitative metrics (e.g., performance data, cost comparisons).
    - Explain how the report clearly demonstrates service quality and investment approach in a consumer-friendly manner.
    - Review clarity of fund-specific information

    ### Primary Enhancement Opportunities
    - Identify actionable improvements such as:
    - Adding additional risk-adjusted performance metrics, though this will depend on the readers level of understanding.
    - Enhancing visual representations of service quality metrics.
    - Incorporating interactive digital elements.
    - Extending benchmark context for deeper insights.

    ## Detailed Analysis

    ### 1. Leadership and Governance Assessment
    #### Board Oversight
    - Evaluate Chairman's introduction and engagement
    - Assess Board's role in value assessment
    #### ESG Integration
    - Review clarity of ESG approach and implementation
    - Assess integration with value assessment

    ### 2. Document Accessibility Assessment
    #### Reading Age Metrics
    - Provide average sentence length
    - Provide reading level from Flesch-Kincaid grade level, Flesch Reading Ease and 
    - Provide Reading Age
    - Assess how technical terms are explained (e.g., via a glossary).
    #### Visual Content Analysis
    - Specify the number of graphs/charts ${imageCount} and evaluate their effectiveness.
    - Note any opportunities for additional visual elements.
    - Provide feedback where the diagrams are helpful and indicate where the could be improved
    #### Support Resources
    - Assess Glossary of Terms comprehensiveness
    - Review additional information access methods, including whether there is the ability to contact for more information
    #### Information Hierarchy
    - Assess the use of headings, section organization, and overall navigation.
    
    ### 4. Methodology and Action Planning
    #### Analytical Approach
    - Evaluate methodology explanation depth, assess if it goes beyond-RAG analytical tools
    #### Issue Resolution
    - Review action plan specificity
    - Assess timeline and accountability measures

    ### 5. Consumer Understanding Focus
    #### Clear Rationale Presentation
    - Describe how well the report explains its methodology and rationale.
    - Ensure consumer-friendly language and transparency.
    #### Value Demonstration
    - Summarize key quantitative metrics (e.g., 82% satisfaction rate, 0.03% trade error rate) and cost comparisons.
    - Include explanations that highlight the consumer impact.

    ## Areas for Development

    ### Consumer Experience Enhancement
    - Suggest additional metrics (e.g., risk-adjusted returns) and digital interactivity improvements.

    ### Educational Content Development
    - Recommend improvements such as clearer investment approach graphics and enhanced glossary definitions.

    ## Strategic Priorities
    - Outline prioritized actions including:
    - Enhanced digital engagement.
    - Additional performance metrics.
    - Improved service quality demonstrations.

    ## Consumer-Led Recommendations
    For each recommendation, include:
    - **Rationale:** Explain why the change benefits consumers.
    - **Suggestions:** Provide specific, actionable steps (e.g., "add process flow diagrams to explain the investment process", 
    simplify benchmarks, incorporate interactive features).

    ## Positive Elements
    - Summarize the report's strengths in consumer communication, transparency, and technical rigor.

    ## Effectiveness of Assessment Criteria
    - Evaluate whether the current criteria serve consumers well.
    - Suggest refinements (e.g., additional metrics or clearer explanations).

    ## Implementation Considerations
    - Detail practical steps for implementing the recommendations, ensuring they maintain technical accuracy and consumer clarity.
    - Highlight the consumer benefits of these steps.

    ## Conclusion
    - Summarize the overall effectiveness of the report.
    - List the high-priority enhancements that support improved consumer understanding and engagement.
    - Highlight critical enhancement priorities
    - Address specific governance and accessibility improvements
  `;
}

// Generate the system prompt for QA checking
function generateQAPrompt() {
  return `
    You are a Quality Assurance specialist for Assessment of Value (AoV) report analyses. Your task is to review the 
    analysis of an AoV report and provide constructive feedback on areas that could be improved or that may be missing.
    
    Please check for:
    
    1. Missing required sections (Executive Summary, Detailed Analysis, Areas for Development, etc.)
    2. Missing key metrics (reading age, Flesch-Kincaid score, text-to-visual ratio)
    3. Consistency in metrics mentioned throughout the report
    4. Actionable recommendations with clear rationales
    5. Analysis of Leadership and Governance elements
    6. Analysis of Document Structure and accessibility
    7. Methodology explanation assessment
    8. Consumer-friendly language throughout
    
    Provide your feedback in a bulleted list, focusing on actionable improvements.
  `;
}