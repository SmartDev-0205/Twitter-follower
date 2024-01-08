const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationsHandledSchema = new Schema({
    notificationId: String,
});

const NotificationsHandledModel = mongoose.model('NotificationsHandled', NotificationsHandledSchema);

module.exports = NotificationsHandledModel;
