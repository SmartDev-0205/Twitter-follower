const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuestTokenRequestCountsSchema = new Schema({
    cookiesHash: String,
    guestToken: String,
    count: {
        type: Number,
        default: 0
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},{
    expires: 60 * 60 * 24 * 2 //7 days
});

const GuestTokenRequestCounts = mongoose.model('GuestTokenRequestCounts', GuestTokenRequestCountsSchema);

module.exports = GuestTokenRequestCounts;