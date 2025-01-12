const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
app.use(express.json()); // To parse incoming JSON requests

// Your Google Cloud project ID
const projectId = 'chatbotbachelor';

// Set up Vertex AI client
const vertexAI = new VertexAI({ project: projectId, location: 'us-central1' });

// Create a route to handle incoming questions
app.post('/ask-question', async (req, res) => {
  const userQuestion = req.body.question;
  if (!userQuestion) {
    return res.status(400).json({ error: 'No question provided.' });
  }

  try {
    // Select the model (e.g., gemini-1.5-flash-002)
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002', // Replace with your desired model
    });

    // Send the question to the model and get the response
    const response = await generativeModel.generateContent(userQuestion);

    // Extract the generated text from the nested structure
    const candidates = response.response?.candidates;
    if (!candidates || candidates.length === 0) {
      console.error('No candidates found in the model response:', response.response);
      return res.status(500).json({ error: 'No valid response from the model.' });
    }

    const generatedParts = candidates[0]?.content?.parts;
    if (!generatedParts || generatedParts.length === 0) {
      console.error('Parts content is empty or malformed:', candidates[0]);
      return res.status(500).json({ error: 'Failed to generate a valid response from the model.' });
    }

    const generatedText = generatedParts.map(part => part.text).join('').trim();

    // Send the generated text back as a response
    res.json({ answer: generatedText });

  } catch (error) {
    console.error('Error generating response:', error.message, error);
    res.status(500).json({ error: 'Failed to generate an answer.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

