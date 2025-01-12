const mongoose = require("mongoose");

const UsernameSchema = new mongoose.Schema({
    
    "username":{
        type: String, required: true
    }
}, {collection: "User"});

module.exports = mongoose.model("Username", UsernameSchema);