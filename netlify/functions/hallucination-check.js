// Netlify serverless function to evaluate hallucination
// This acts as a secure proxy to the Hugging Face API
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the incoming request body
    const { premise, hypothesis, hfToken } = JSON.parse(event.body);

    // Validate required parameters
    if (!premise || !hypothesis) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: premise and hypothesis are required' })
      };
    }

    // Get the HF token either from the request or environment variable
    const token = hfToken || process.env.HUGGINGFACE_API_TOKEN;
    
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'HuggingFace API token not provided' })
      };
    }

    // Format the input with the correct prompt template
    const prompt = `<pad> Determine if the hypothesis is true given the premise?\n\nPremise: ${premise}\n\nHypothesis: ${hypothesis}`;

    // Make request to Hugging Face API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/vectara/hallucination_evaluation_model",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          inputs: prompt,
          options: { use_cache: true, wait_for_model: true }
        })
      }
    );

    // If we get an error from Hugging Face
    if (!response.ok) {
      const errorData = await response.json();
      console.error("HuggingFace API error:", errorData);
      
      // Special handling for the trust_remote_code error
      if (errorData.error && errorData.error.includes('trust_remote_code=True')) {
        // Since we can't use the Inference API directly with this model due to trust_remote_code,
        // we'll use a fallback approach: provide a simulated score
        
        console.log("Falling back to simulated score due to trust_remote_code requirement");
        
        // Algorithm for generating a semi-meaningful score rather than purely random
        // We'll use string length ratio and some common word matching as a very basic heuristic
        const premiseWords = new Set(premise.toLowerCase().split(/\s+/));
        const hypothesisWords = hypothesis.toLowerCase().split(/\s+/);
        
        // Count matching words
        const matchingWords = hypothesisWords.filter(word => premiseWords.has(word)).length;
        
        // Calculate a basic relevance score based on word overlap and length
        const wordMatchRatio = hypothesisWords.length > 0 ? matchingWords / hypothesisWords.length : 0;
        const lengthRatio = Math.min(1, premise.length / Math.max(1, hypothesis.length * 10));
        
        // Combine factors for a final score between 0.1 and 0.9
        const simulatedScore = Math.min(0.9, Math.max(0.1, (wordMatchRatio * 0.7 + lengthRatio * 0.3)));
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            score: Math.round(simulatedScore * 100) / 100,
            model: "fallback-hhem",
            method: "simulated"
          })
        };
      }
      
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error calling HuggingFace API', details: errorData })
      };
    }

    // Process the successful response
    const data = await response.json();
    
    // Find the "consistent" score if it exists
    let score = -1;
    for (const result of data) {
      if (result.label === "consistent") {
        score = Math.round(result.score * 100) / 100; // Round to 2 decimal places
        break;
      }
    }
    
    // If we couldn't find a consistent score, use the highest score
    if (score === -1 && data.length > 0) {
      score = Math.round(data[0].score * 100) / 100;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        score,
        model: "hhem",
        method: "api"
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}; 