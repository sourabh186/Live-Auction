const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // User.findById(id, (err, user) => {
    //     done(err, user);
    // });
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: '218760657503-aou3jql46mnd2nka4b3v72m7k51aavku.apps.googleusercontent.com',
    clientSecret: 'Xbhmdf6XzpVS3fMKMqWlWcw1',
    callbackURL: "http://localhost:3005/google/callback"
 },
 function(accessToken, refreshToken, profile, done) {
    //  use the profile info (mainly profile id) to check if the user is registered in ur db
    //  User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //  return done(err, user);
    //  })
    // console.log(profile);
    // console.log(done(null, profile));
    return done(null, profile);
 }
))