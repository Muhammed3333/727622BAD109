const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876; // or try 3000 if 9876 is blocked

// Sample data to use when API is unavailable
const sampleData = {
  primes: [2, 3, 5, 7, 11, 13, 17, 19, 23],
  fibo: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  even: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  rand: [4, 18, 7, 29, 13, 22, 5, 11, 36, 9]
};

// Serve static files
app.use(express.static('public'));

// API endpoint that processes the numbers
app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;
  let apiUrl;
  let fallbackData;
  
  // Select appropriate API based on the type parameter
  switch(type) {
    case 'p':
      apiUrl = 'http://20.244.56.144/evaluation-service/primes';
      fallbackData = sampleData.primes;
      break;
    case 'f':
      apiUrl = 'http://20.244.56.144/evaluation-service/fibo';
      fallbackData = sampleData.fibo;
      break;
    case 'e':
      apiUrl = 'http://20.244.56.144/evaluation-service/even';
      fallbackData = sampleData.even;
      break;
    case 'r':
      apiUrl = 'http://20.244.56.144/evaluation-service/rand';
      fallbackData = sampleData.rand;
      break;
    default:
      apiUrl = 'http://20.244.56.144/evaluation-service/even';
      fallbackData = sampleData.even;
  }
  
  try {
    // Try to get data from the external API
    const response = await axios.get(apiUrl, { timeout: 3000 });
    const numbers = response.data.numbers;
    processAndSendResponse(numbers, res);
  } catch (error) {
    console.error('Error fetching data, using fallback:', error.message);
    // Use fallback data when API is unavailable
    processAndSendResponse(fallbackData, res);
  }
});

function processAndSendResponse(numbers, res) {
  // Process window state
  const windowPrevState = global.windowCurrState || [];
  const windowCurrState = numbers.slice(0, 8); // Take first 8 numbers
  
  // Update global state
  global.windowCurrState = windowCurrState;
  
  // Calculate average
  const avg = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  
  // Send response
  res.json({
    windowPrevState,
    windowCurrState,
    numbers,
    avg: parseFloat(avg.toFixed(2))
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});