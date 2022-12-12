const mongoose = require('mongoose');

const userSchema2 = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

const Contact = mongoose.model('CONTACT', userSchema2);
module.exports = Contact;