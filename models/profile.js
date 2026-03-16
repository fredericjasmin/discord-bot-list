const mongoose = require("mongoose");
let profile = new mongoose.Schema({
userId: String,
biography: {type: String},
liked: {
    type: Date,
    default: Date.now()
}
});

module.exports = mongoose.model("profiles", profile);