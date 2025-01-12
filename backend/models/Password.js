const mongoose = require("mongoose");

const Passwordhema = new mongoose.Schema({
    
    "password":{
        type: String, required: true
    }
}, {collection: "User"});

module.exports = mongoose.model("Password", Passwordhema);