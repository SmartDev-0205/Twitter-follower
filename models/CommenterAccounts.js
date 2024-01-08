const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommenterAccountsSchema = new Schema({
    screenName: String,
    rateLimitReset: {
        type: Number,
        default: 0
    },
    rateLimitRemaining: {
        type: Number,
        default: 0
    },
});

const CommenterAccountsModel = mongoose.model('CommenterAccounts', CommenterAccountsSchema);

module.exports = CommenterAccountsModel;