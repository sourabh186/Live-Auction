const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    uniqueString: {
        type: String,
        unique: true
    },
    isValid: {
        type: Boolean
    },
    bid: {
        type: Number
    },
    utype: {
        type: String,
        required: true
    },
    img: {
        contentType: String,
        data: Buffer,
        originalname: String,
        filename: String,
        destination: String,
        path: String,
        encoding: String
    },
    date : {
        type: Date,
        default: Date.now
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

//  Password Hashing

userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }
    next();
})

//generating token

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({_id:this._id}, process.env.SECRET_KEY)
        console.log(token);
        this.tokens = this.tokens.concat({ token: token });
        console.log(this.tokens);
        await this.save();
        return token;
    }catch (err) { console.log(err);}
}

// Collection Creation

const User = mongoose.model('USER', userSchema);
module.exports = User;