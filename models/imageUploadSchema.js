const mongoose = require('mongoose');

const imageUploadSchema = new mongoose.Schema({
    img: {
        contentType: String,
        data: Buffer,
        originalname: String,
        filename: String,
        destination: String,
        path: String,
        encoding: String,
        size: Number
    },
    name: {
        type: String
    }
});

const image = mongoose.model('IMAGE', imageUploadSchema);
module.exports = image;

