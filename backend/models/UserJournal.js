const mongoose = require("mongoose");

const UserJournalSchema = new mongoose.Schema({
    "_id":{
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    "entry_content":{
        type: String
    },
    "created_at":{
        type: Date
    },
    "typeOfVisit":{
        type: String
    },
    "idTag":{
        type: String
    },
}, {collection: "user_journal"});

module.exports = mongoose.model("UserJournal", UserJournalSchema);