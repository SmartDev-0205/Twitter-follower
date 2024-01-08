const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetsRepliedSchema = new Schema({
    tweetId: {
        type: String,
        unique: true,
        index: true,
    }
})

const TweetsReplied = mongoose.model('TweetsReplied', TweetsRepliedSchema);
module.exports = TweetsReplied;