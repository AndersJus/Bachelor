// index.js
const User = require('./models/Userinfo');
const Manager = require('./models/Userinfo');
const Username = require("./models/Username");
const Password = require("./models/Password");
const UserJournal = require("./models/UserJournal");
const UserMessages = require("./models/Messages");
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const PORT = 5000;

// Middleware til JSON-håndtering
app.use(express.json());

// Forbind til MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Standard route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Get endpoints
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users); // Send users as JSON response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//SECURITY must be made here ------------------>
app.get("/passwords", async (req, res) =>{
  try {
    const passwords = await Password.find().select("password -_id");
    res.json(passwords);
  }
catch (error) {
  res.status(500).json({ message: error.message });
}
});


app.get("/usernames", async (req, res) =>{
  try {
    const usernames = await Username.find().select("username -_id");
    res.json(usernames);
  }
catch (error) {
  res.status(500).json({ message: error.message });
}
  
}); 

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await Username.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare plaintext passwords
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If valid, return user details (excluding sensitive data like password)
    res.status(200).json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.get("/usermessages/:id", async (req, res) => {
  try {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const userMessages = await UserMessages.findById(new mongoose.Types.ObjectId(id));
   
    if (!userMessages) {
      return res.status(404).json({ message: "Message entry not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    userMessages.messagesByDate.forEach(day => {
      day.messages.forEach(message => {
        // Ensure the timestamp is an ISO string
        message.timestamp = message.timestamp.toISOString();
      });
    });
    res.status(200).json(userMessages);
  }
  
  catch(error){
    res.status(500).json({ message: error.message });
  }
});




app.get("/userjournal/:id", async(req, res)=>{
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const userJournal = await UserJournal.findOne({ idTag: id });

    
    if (!userJournal) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    userJournal.created_at = new Date(userJournal.created_at).toISOString().slice(0, 10);
    
    res.status(200).json(userJournal);

  }
  catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//Integration to existing systems
app.post("/usermessages/:id", (req, res) => {
  const { content } = req.body;
  const timestamp = new Date();
  console.log(timestamp);
  console.log(content);


  res.sendStatus(200);
});

app.post("/usermessages", async (req, res) => {
  try {
    console.log("Request Body:", req.body);  // Log the incoming request
    const { userId, content, timestamp, sender } = req.body;

    if (!content || !timestamp || !userId || !sender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const date = new Date(new Date(timestamp).setUTCHours(0, 0, 0, 0)); // Normalize to midnight
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let userMessages = await UserMessages.findById(userObjectId);

    if (!userMessages) {
      // Create a new user document if it doesn't exist
      userMessages = new UserMessages({
        _id: userObjectId,
        userId,
        messagesByDate: [],
      });
    }

    // Find the date group
    let dateGroup = userMessages.messagesByDate.find((group) =>
      new Date(group.date).getTime() === date.getTime()
    );

    if (!dateGroup) {
      // Create a new date group if not found
      dateGroup = { date, messages: [] };
      userMessages.messagesByDate.push(dateGroup);
    }

    // Push the new message to the `messages` array
    dateGroup.messages.push({ content, timestamp, sender });

    // Explicitly mark the nested array as modified
    userMessages.markModified("messagesByDate");

    // Save the updated user messages document
    await userMessages.save();

    res.status(201).json({ message: "Message saved successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/userjournal", async (req, res)=> {
  try {
    const {idTag, entryContent, typeOfVisit, createdAt} = req.body;

    if (!idTag || !entryContent || !typeOfVisit || !createdAt) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEntry = new UserJournal({
      idTag,
      entry_content: entryContent,
      typeOfVisit,
      created_at: new Date(createdAt), // Ensure the date is stored properly
    });
    await newEntry.save();
    res.status(201).json({ message: "Journal entry created successfully", newEntry });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Set up Vertex AI client
const vertexAI = new VertexAI({ project: 'chatbotbachelor', location: 'us-central1' });

app.post("/AIConnection", async (req, res) => {
  console.log("Request body:", req.body);
  
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question provided." });
    }

    console.log("Received question:", question);

    // Select the model (e.g., gemini-1.5-flash-002)
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002', // Replace with your desired model
    });

    // Send the question to the model and get the response
    const response = await generativeModel.generateContent(question);

    // Extract the generated text from the nested structure
    const candidates = response.response?.candidates;
    if (!candidates || candidates.length === 0) {
      console.error("No candidates found in the model response:", response.response);
      return res.status(500).json({ error: "No valid response from the model." });
    }

    const generatedParts = candidates[0]?.content?.parts;
    if (!generatedParts || generatedParts.length === 0) {
      console.error("Parts content is empty or malformed:", candidates[0]);
      return res.status(500).json({ error: "Failed to generate a valid response from the model." });
    }

    const generatedText = generatedParts.map((part) => part.text).join("").trim();

    console.log("Generated response:", generatedText);

    // Send the AI-generated response back to the client
    return res.status(200).json({ message: generatedText });
  } catch (error) {
    console.error("Error generating response:", error.message, error);
    return res.status(500).json({ error: "Failed to generate an answer." });
  }
});

app.get("/AIConnection", async (req, res) => {
  try {
    console.log("Here");
    return res.status(200).json({message: "OK"})
  } catch (error) {
    console.log(error);
  }
});

app.post("/updateUser", async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { _id, fullName, dateOfBirth, address, phoneNumber, email } = req.body;

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if _id is valid, if not return an error
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Find and update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      _id,  // Use _id directly here
      {
        fullName,
        dateOfBirth,
        address,
        phoneNumber,
        email,
      },
      { new: true } // Return the updated document
    );

    console.log("Received _id:", _id);
    console.log("Updated user:", updatedUser);  // Log the updated user document

    // If user is not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated user data back to the client
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


