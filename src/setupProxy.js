const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/mock-hallucination-check',
    (req, res) => {
      // Simulate API delay
      setTimeout(() => {
        // Generate a random score between 0.1 and 0.9 for testing
        const mockScore = Math.round((Math.random() * 0.8 + 0.1) * 100) / 100;
        
        res.json({ 
          score: mockScore,
          model: "mock-hhem"
        });
      }, 500);
    }
  );
}; 