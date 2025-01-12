const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  sender: {
    type: String,
    required: true
  },
  _id: false}
);

const MessagesByDateSchema = new mongoose.Schema({
  date: {
    type: Date, // Date stored in "YYYY-MM-DD" format
    required: true,
  },
  messages: [MessageSchema], // Array of messages for the specific date
},
{_id:false});

const UserMessagesSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userId:{
    type: String,
    required: true
  },
  messagesByDate: [MessagesByDateSchema], // Array of date-grouped messages
}, { collection: "User_messages" });

module.exports = mongoose.model("UserMessages", UserMessagesSchema);