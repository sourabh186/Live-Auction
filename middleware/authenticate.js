const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
// const user = require('../models/userSchema');

const authenticate = async (req,res,next) => {
    try {
        const token = req.cookies.jwtoken;
        console.log(token);
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        // console.log(verifyUser);

        const register = await User.findOne({_id:verifyUser._id});
        // console.log(register);

        req.token = token;
        req.register = register;

        next()
    } catch(err) {
        // res.status(401).send(err);
        // console.log(err);
        if(err) {res.status(401).render('signup')};
    }
}

module.exports = authenticate;