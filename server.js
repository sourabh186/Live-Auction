const dotenv = require('dotenv');
// const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const session = require('express-session');
// const cookieSession = require('cookie-session');
const multer = require('multer');
const flash = require('connect-flash');
const image = require('./models/imageUploadSchema');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/authenticate');
const google = require('googleapis').google;
const oAuth2 = google.auth.oAuth2;
const config = require('./config');
const User = require('./models/userSchema');
const cors = require('cors');
const passport = require('passport');
require('./passport-setup');

dotenv.config({path: './config.env'});


// we link the router files to make our router easy
app.use(express.json());
app.use(cors());
//BodyParser
app.use(express.urlencoded({extended : false}));
app.use(require('./router/auth'));
app.use(express.static('public'));
app.use(cookieParser());



// app.use(cookieSession({
//     name: 'session',
//     keys: ['key1', 'key2']
//   }));


app.use(
    session({
      secret: 'randironababushona',
      saveUninitialized: false,
      resave: false,
      maxAge: null,
      cookie: {
        path: '/admin',
        secure: true,
        httpOnly: true,
      },
    }),
  );


// app.use(session({
//     resave: false,
//     saveUninitialized: false,
//     secret: 'SECRET',
//     // cookie: { maxAge: 60*1000}
// }));

const isLoggedIn = (req, res, next) => {
    if(req.user) {
        // console.log(req);
        next();
    } else {
        res.status(401).send('plzz log in!!');
    }
}


app.use(passport.initialize());
app.use(passport.session());



//  Set Path
const viewPath = path.join(__dirname, "/templates/views")
const partialsPath = path.join(__dirname, "/templates/partials");

// set view engine
app.set("view engine","hbs");
app.set("views", viewPath);
hbs.registerPartials(partialsPath);


// app.use(session({
//     secret : 'secret',
//     resave : true,
//     saveUninitialized : true
// }));


// use flash
// app.use(flash());
// app.use((req,res,next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     res.locals.error = req.flash('error');
//     next();
// });





// app.get('/google', (req, res) => {
//     //  Create an oAuth2 client object from the credentials in the config file
//     const auth2Client = new  oAuth2(config.oauth2Credentials.client_id, config.oauth2Credentials.client_secret, config.oauth2Credentials.redirect_uris[0]);
//     //  Obtain the google login link to which we will send our users to give us access
//     const loginLink = oauth2Client.generateAuthUrl({
//         access_type: 'offline',  // Indicates that we need to be able to access data continuously without the user constantly  giving us consent
//         scope: config.oauth2Credentials.scopes  // Using the access scopes from our config file
//     });
//     return res.render('involve', { loginLink: loginLink });
// })


app.get('/verify/:uniqueString', async (req, res) => {
    // getting the string
    const { uniqueString } = req.params
    // check is there is anyone with this string
    const user = await User.findOne({uniqueString: uniqueString})
    if(user) {
        // if there is anyone, mark them verified
        user.isValid = true
        await user.save()
        // redirect to the home or anywhere else
        res.status(201).json("User Authenticated");
        res.render('index')
    } else {
        // else send an error message
        res.json("User not found");
    }
});



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


// Upload Single File

app.post('/uploadfile.html', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
      res.send(file)
    
  });

  //Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
   
      res.send(files)
    
  });


//  Image Upload Page

  app.post('/profile.html', upload.single('error'), async (req, res) => {
      try{
        var img = fs.readFileSync(req.file.path);
    //   var img = fs.readFileSync(__dirname + '/public/assets/images/error.png', (err, result) => {
    //       console.log(result);
    //   });
        var encode_img = img.toString('base64');
        // console.log(encode_img);
        // console.log(req.file.mimetype);
        // console.log(Buffer.from(encode_img, 'base64'));
        // console.log(req.file);

        // console.log(req.cookies.jwtoken);
        // console.log(user);

        await User.updateOne({"tokens.token": req.cookies.jwtoken},{ $set: {
            // name: req.body.name,
            img: {
                contentType: req.file.mimetype,
                data: Buffer.from(encode_img, 'base64'),
                originalname: req.file.originalname,
                filename: req.file.filename,
                destination: req.file.destination,
                path: req.file.path,
                encoding: req.file.encoding
            }
        }});


        // console.log(User.USER);
        // await User.save();
        res.status(201).render('profile')
    
    } catch (err) {
    }
  });




//  Photo Showing Page

// app.get(`/:auction`, async (req, res) => {
//    var filename = req.params.auction;
//    console.log(filename);

//     try {
//         const img = await image.findOne({"name": `${filename}` })

//         // res.send("done")
//         console.log(img);
     
//        console.log(img.img.contentType);
//        console.log(img.img.filename);

       
//        res.contentType(img.img.contentType);
//        res.send(img.img.data)

//     //    res.render( 'index');


//     //    console.log(img.path);
       

//       } catch (err) {console.log(err);}
//     });




//  Home Page

app.get('/', async (req, res) => {
    // const img = await image.findOne({'name': req.params.name});
    // console.log(img.img);
    // res.contentType(img.img.contentType);
    // console.log(img.img.path - __dirname);
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    const userDate = user.date.toLocaleDateString();
    // console.log(user.date);
    const daw = new Date();
    // const laps = daw - user.date;
    var date5 = new Date("03/03/2021");
    var diffDays = parseInt((daw - date5) / (1000 * 60 * 60 * 24));
    // console.log(typeof(laps));
    console.log(diffDays);
    console.log(userDate);
    // console.log(Date.now());
    const date = new Date();console.log(date);
    const userNow = await User.find({"date": date});
    console.log(userNow);
    // console.log(date);
    if(userDate == date) {
        var date2 = userDate;
    } else {;}

    res.render('index', {
        date: date2
    })
});




app.get('/not', (req, res) => {
    res.send('You are logged out!!!!');
    console.log(req.session.cookie);
    console.log(req.sessionID);
});
app.get('/failed', (req, res) => res.send('You failed to login!!'));
app.get('/good', isLoggedIn, (req, res) => {
    res.send(`Welcome ${req.user.displayName}`);
    console.log(req.session.cookie);
    console.log(req.sessionID);
});

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    (req, res) => {
        // successful authentication, redirect home
        res.redirect('/good');
    });


// { path: '/', _expires: null, originalMaxAge: null, httpOnly: true }
// wXcaBo-AD30C6SDUzEJOs0_NGgCxpp-t

// s%3AxohZqCrIk0nCW3okE6kZg_5o5zAwkL-U.of4CTPdvbx0

// res.redirect(config.destroySessionUrl);

// app.use(
//     session({
//       secret,
//       saveUninitialized: false,
//       resave: false,
//       maxAge: null,
//       cookie: {
//         path: '/admin',
//         secure: secureCookie,
//         httpOnly: true,
//       },
//     }),
//   );
// [...]
// req.session.destroy(() => {
//       res
//         .clearCookie('connect.sid', {
//           path: '/admin',
//           secure: secureCookie,
//           httpOnly: true,
//         })
//         .sendStatus(200);
//     });


app.get('/logopt', (req, res) => {
    // res.clearCookie('connect.sid', {path: '/', httpOnly: true});
    // req.session = null;
    //         req.logout();

    req.session.destroy(() => {
        res
          .clearCookie('connect.sid', {
            path: '/admin',
            secure: secureCookie,
            httpOnly: true,
          })
          .sendStatus(200);
      });
        res.redirect('/not');
});


// app.get('/logopt', (req, res) => {
//     if (req.user) {
//       req.session.destroy()
//       res.clearCookie('connect.sid') // clean up!
//       return res.json({ msg: 'logging you out' })
//     } else {
//       return res.json({ msg: 'no user to log out!' })
//     }
//   })








app.get('/about.html', (req, res) => {
    res.render('about', {
        authenticate: req.cookies.jwtoken
    });
});

app.get('/dashboard.html', async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    res.render('dashboard', {
        authenticate: req.cookies.jwtoken,
        img: user.img.filename,
        name: user.name,
        email: user.email

    });
});

app.get('/profile.html', authenticate, upload.single('error'), async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.img);

    res.render('profile', {
        authenticate: req.cookies.jwtoken,
        img: user.img.filename,
        name: user.name,
        email: user.email
    });
});


//  Sign up form

app.get('/sign-up.html', (req, res) => {
    res.render('signup', {
        authenticate: req.cookies.jwtoken
    });
});


// Sign in Form


app.get('/sign-in.html', (req, res) => {
    res.render('signin', {
        authenticate: req.cookies.jwtoken,
        email: req.body.email
    });
});


//  Error Page

app.get('/error.html', (req, res) => {
    res.render('error', {
        authenticate: req.cookies.jwtoken
    });
});


//  Auction / Production Page

app.get('/product.html', async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user);
    console.log(req.body.value);
    res.render('product', {
        authenticate: req.cookies.jwtoken
    });
});


//  Logout 

app.get('/logout.html', authenticate , async (req, res) => {
    try {
        // logout from single device...
        req.register.tokens = req.register.tokens.filter((currElem) => {
            return currElem.token !== req.token
        })

        // logout from all devices...
        // req.user.tokens = [];

        res.clearCookie("jwtoken");
        console.log("Logout Successfully");
        await req.register.save();
        res.render('signin');
    } catch (err) {console.log(err);}
});

app.get('/addProduct.html', (req, res) => {
    res.render('addProducts');
})


//  Upload Image

app.get('/uploadphoto.html', (req, res) => {
    res.render('imgupload');
});





//  Product Detail Page

app.get('/product-details.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('product-details', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});


app.get('/ford-details.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('ford-details', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/nissan-versa.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('nissan-versa', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/honda-accord.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('honda-accord', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/mercedes-benz.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('mercedes-benz', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/harley-davidson.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('harley-davidson', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/hyundai-elantra.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('hyundai-elantra', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/kia-sorento.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('kia-sorento', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/subaru-crosstrek.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('subaru-crosstrek', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/chevrolet.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('chevrolet', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/ford-expedition.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('ford-expedition', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/buick-envision.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('buick-envision', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});

app.get('/honda-city.html', authenticate, async (req, res) => {
    const user = await User.findOne({"tokens.token": req.cookies.jwtoken});
    console.log(user.bid);
    res.render('honda-city', {
        authenticate: req.cookies.jwtoken,
        bid: user.bid
    });
});


//  Contact Page

app.get('/contact.html', (req, res) => {
    res.render('avaiContact', {
        authenticate: req.cookies.jwtoken
    });
});


//  Feedback page

app.get('/feedback.html', (req, res) => {
    res.render('feedback', {
        authenticate: req.cookies.jwtoken
    });
});

// app.get('/dashboard-check.html', (req, res) => {
//     res.render('dashboard_check', {
//         authenticate: req.cookies.jwtoken
//     });
// });

app.get('/my-bid-check.html', (req, res) => {
    res.render('my-bid-check', {
        authenticate: req.cookies.jwtoken
    });
});

app.get('/myfavorites.html', (req, res) => {
    res.render('my-favorites-check', {
        authenticate: req.cookies.jwtoken
    });
});

app.get('/notifications-check.html', (req, res) => {
    res.render('notifications-check', {
        authenticate: req.cookies.jwtoken
    });
});

app.get('/profile-check.html', (req, res) => {
    res.render('profile-check', {
        authenticate: req.cookies.jwtoken
    });
});

// app.get('/referral.html', (req, res) => {
//     res.render('referral', {
//         authenticate: req.cookies.jwtoken
//     });
// });

// app.get('/winning-bids.html', (req, res) => {
//     res.render('winning-bids', {
//         authenticate: req.cookies.jwtoken
//     });
// });

//  All other pages redirect to error page

app.get('*', (req, res) => {
    res.render('error', {
        authenticate: req.cookies.jwtoken
    });
})


//  Server Listening

app.listen(3005, () => {
    console.log("Listen to 3005");
})