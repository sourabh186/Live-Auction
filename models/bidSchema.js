const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    bid : {
        type: String
    }
});

const Bid = mongoose.model('BID', bidSchema);
module.exports = Bid;