const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberAccountsSchema = new Schema({
    screenName: String,
    id: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const SubscriberAccountsModel = mongoose.model('SubscriberAccounts', SubscriberAccountsSchema);
module.exports = SubscriberAccountsModel;