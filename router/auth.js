const express = require('express');
const User = require('../models/userSchema');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

require('../db/Conn');
const user = require('../models/userSchema');
const contact = require('../models/userSchema2');
const Contact = require('../models/userSchema2');
const Cart = require('../models/cartSchema');
const image = require('../models/imageUploadSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validator = require("email-validator");
const Bid = require('../models/bidSchema');

// router.get('/', (req, res) => {
//     res.send("Hello from router");
// });

const randString = () => {
    // Considering a 8 length String
    const len = 8;
    let randStr = '';
    for(let i = 0; i<len; i++) {
        // ch -> a number between 1 to 10
        const ch = Math.floor((Math.random() * 10) + 1);
        randStr += ch;
    };

    return randStr;
};


// router.post('/register', async (req, res) => {
//     const { email } =  req.body;
//     const uniqueString = randString()
//     const isValid = false;

//     const newUser = new User(isValid, uniqueString)
//     await newUser.save();
//     sendEmail(eamil, uniqueString);
//     res.render('/');
// });


const sendEmail = (email, uniqueString) => {
    var Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "komaldutta915@gmail.com",
            pass: "komal@123"
        }
    });

    var mailOptions;
    let sender = "Sourabh";
    mailOptions = {
        from: sender,
        to: email,
        subject: "Email Confirmation",
        html: `Press <a href=http://localhost:3005/verify/${uniqueString}> here </a> to verify your email. Thanks`
    };

    Transport.sendMail(mailOptions, (error, response) => {
        if(error) {
            console.log(error);
        } else {    
            console.log("Message Sent");
        }
    });
}


// router.get('/verify/:uniqueString', async (req, res) => {
//     // getting the string
//     const { uniqueString } = req.params
//     // check is there is anyone with this string
//     const user = await User.findOne({uniqueString: uniqueString})
//     if(user) {
//         // if there is anyone, mark them verified
//         user.isValid = true
//         await user.save()
//         // redirect to the home or anywhere else
//         res.render('/')
//     } else {
//         // else send an error message
//         res.json("User not found");
//     }
// });


//  Set storage

var storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, __dirname + '/public/assets/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

var upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => { checkFileType(file, cb) }
});

//  check file type
const checkFileType = (file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;

    // check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null,true);
    } else {
        cb('Error: Image Only!!');
    }
}





router.post('/about.html', upload.single('error'), async (req, res) => {

    // console.log(req);
    const { name, email, password, cpassword, utype } = req.body;
    const uniqueString = randString()
    const isValid = false;
    console.log(name);
    console.log(email);
    console.log(password);
    console.log(cpassword);
    console.log(utype);
    console.log(uniqueString);
    console.log(`isVAlid = ${isValid}`);

    if(!name || !email || !password || !cpassword) {
        return res.status(422).json({ error: "plzz filled the field properly" });
    }
    
    try{
        // console.log(`${__dirname} ../public`);
        const filePath = path.join(__dirname, "../public/assets/images/dashboard/user.png");
        console.log(filePath);
        var img = fs.readFileSync(filePath);
        var encode_img = img.toString('base64');

        const userExist = await User.findOne({ email: email });
        var validity = validator.validate(email);
        console.log(`validity = ${validity}`);
        if(validity == true){
            if(userExist) {
                return res.status(422).json({ error: "Email already exist!!" });
            } else if(password != cpassword) {
                return res.status(422).json({ error: "Password are not matching!!!" });
            } else {
                const user = new User({name, email, password, cpassword, uniqueString, isValid, utype,
                    img: {
                        contentType: "image/png",
                        data: Buffer.from(encode_img, 'base64'),
                        originalname: "user.png",
                        filename: "user.png",
                        destination: "C:\Users\soura\Downloads\auction\auction/public/assets/uploads",
                        path: filePath,
                        encoding: "7bit",
                        // size: req.file.size
                    }
                });
                // const token = await user.generateAuthToken();
                // console.log(token);
                await user.save();
                sendEmail(email, uniqueString);
                res.status(201).render('signin');
                // req.flash('success_msg','You have new registered!')
            }
        } else {
            return res.status(422).json({ error: "Email invalid!!" });
        }
    
                
        }catch(err){
            console.log(err);
        }

    

    // console.log(name);
    // console.log(email);
    // res.json({ message: req.body });
    // res.send("register page aa gyaaaa");
});

router.post('/product-details.html', async (req, res) => {
    const newbid = req.body.bid;
    console.log(req);
    try {
        // const bidin = new Bid({newbid});
        // console.log(bidin);
        // await bidin.save();
        // res.status(201).render('product-details');
        const bidExist = await User.findOne({ email: email })
        if(bidExist.bid < newbid) {
        const bidin = new User({newbid});
        console.log(bidin);
        await bidin.save();
        res.status(201).render('product-details');
        } else {
            res.status(401);
        }
    } catch (err) {console.log(err);}
})

router.post('/index.html', async (req, res) => {
    const { name, email, message } = req.body;
    console.log(name);
    console.log(email);
    console.log(message);
    // console.log(name);
    try {
    const contact = new Contact({name, email, message});
    await contact.save();
    res.status(201).render('avaiContact');
    }catch(err){
        console.log(err);
    }
});

router.post('/sign-in.html', async (req, res) => {
    try {
        let token;
        const  { email, password, utype } = req.body;

        if(!email || !password) {
            return res.status(400).json({error: "Plzz fill the data"});
        }

        const userLogin = await User.findOne({ email: email });
        console.log(userLogin);

        if(userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);

            token = await userLogin.generateAuthToken();
            // console.log(token);

            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 25892000000),
                // 25892000000 means 30 days. this value is in milisec.
                httpOnly: true,
                // this property is used only if https connections....
                // ye http prr aply nhi hota islea jb bhi hm http pe kam krenge 
                // tb ye property use nhi krenge...
                // secure: true
            })

            if(!isMatch && utype == userLogin.utype) {
                res.status(400).json({error: "Invalid Credientials"});
            }else {
                res.render('index');
            }
        }else {
            res.status(400).json({ error: "Invalid Credientials" });
        }
    }catch (err) {
        console.log(err);
    }
});


//  Cart Controller

router.post('/cart', async (req, res) => {
    const { productId, quantity, name, price } = req.body;

    const userId = "5de7ffa74fff640a0491bc4f";

    try {
        let cart = await Cart.findOne({userId});

        if(cart) {
            //  cart exist for user
            let itemIndex = cart.products.findIndex(p => p.productId == productId);

            if(itemIndex > -1) {
                //product exists in the cart, update the quantity
                let productItem = cart.products[itemIndex];
                productItem.quantity = quantity;
                cart.products[itemIndex] = productItem;
            } else {
                //  product does not exist in cart, add new item
                cart.products.push({ productId, quantity, name, price });
            }
            cart = await cart.save();
            return res.status(201).send(cart);
        } else {
            //  no cart for user, create new cart
            const newCart = await Cart.create({
                userId,
                products: [{ productId, quantity, name, price }]
            });

            return res.status(201).send(newCart);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
});


// image upload

// router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//     const file = req.file;
//     if(!file) {
//         const error = new Error('Please upload a file!')
//         error.httpStatusCode = 400;
//         return next(error);
//     }
//     res.send(file);
// })


// // empty collection
// image.remove((err) => {
//     if(err) throw err;

//     console.error('removed old docs');

//     // store an image im binary mode
//     var img = new image;
//     img.img.data = fs.readFileSync(imgPath);
//     img.img.contentType = 'image/jpg';
//     img.save((err, a) => {
//         if(err) throw err;

//         console.error('saved img to db');


//     })
// })

module.exports = router;
