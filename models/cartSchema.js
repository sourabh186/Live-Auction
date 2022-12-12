const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: [
        {
            productId: Number,
            quantity: Number,
            name: String,
            price: Number
        }
    ],
    active: {
        type: Boolean,
        default: true
    },
    modifiedOn: {
        type: Date,
        default: Date.now
    }
},
{ timestamps: true }
);

const Cart = mongoose.model('CART', cartSchema);
module.exports = Cart;