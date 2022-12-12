const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require("./models/userSchema");
const passport = require('passport');


    passport.use(
        new LocalStrategy({usernameField : 'email' },
        (email,password,done) => {
            //match user
            User.findOne({email : email})
            .then((user) => {
                if(!user) {
                    return done(null, false, {message : 'that email is not registered'});
                }
                //match pass
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;

                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message : "pass incorrect"});
                    }
                })
            }).catch((err) => {console.log(err)})
        })
    )
    passport.serializeUser(function(user, data) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    module.exports = passport;