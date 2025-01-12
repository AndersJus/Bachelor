const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    "_id":{
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    "username":{
        type: String
    },
    "created_at": {
        type: Date
    },
    "email": {
        type: String,
        unique: true
    },
    "password": {
        type: String
    },
    "last_login": {
        type: Date
    },
    "isActive": {
        type: Boolean
    },
    "fullName":{
        type: String
    },
    "dateOfBirth":{
        type: Date
    },
    "phoneNumber":{
        type: String
    },
    "role": {
        type: String
    },
    "address":{
        type: String
    }
}, {collection: "User"});

const ManagerSchema = new mongoose.Schema({
    "_id":{
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    "role": {
        type: String
    },
    "profession": {
        type: String
    },
    "fullName":{
        type: String
    },
    "password":{
        type: String
    },
    "username": {
        type: String
    }
});

module.exports = mongoose.model("Manager", ManagerSchema);
module.exports = mongoose.model("User", UserSchema);