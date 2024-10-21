// index.js
const MyAxiosInstrumentation = require('./MyAxiosInstrumentation'); // Import your instrumentation class

// Initialize the instrumentation
const myAxiosInstrumentation = new MyAxiosInstrumentation();
myAxiosInstrumentation.init();

const axios = require('axios'); // Ensure axios is imported

async function makeRequests() {
  try {
    // Example GET request
    const getResponse = await axios.get('http://httpbin.org/get'); // Replace with a valid URL
    console.log('GET response:', getResponse.data);

    // Example POST request
    const postResponse = await axios.post('http://httpbin.org/post', { key: 'value' }); // Replace with a valid URL and data
    console.log('POST response:', postResponse.data);
  } catch (error) {
    console.error('Error during HTTP request:', error);
  }
}

// Call the function to make requests
makeRequests();
