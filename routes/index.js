var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-nqk:quangkhanh09@cluster0.iqely.mongodb.net/uwc')
  .then(() => console.log("Connect MongoDB successfully!"))
  .catch(error => console.log(error))

const backOfficerSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String
});

const BackOfficer = mongoose.model('backofficers', backOfficerSchema);

passport.use(new LocalStrategy(function verify(username, password, cb) {
    BackOfficer.findOne({username: username, password: password})
        .then((backOfficer) => {
            if (!backOfficer) return cb(null, false, { message: 'Incorrect username or password.' });
            else return cb(null, backOfficer);
        })
        .catch((error) => cb(error))
}));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user._id, username: user.username });
    });
});
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

// TO-DO: render home page
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// TO-DO: render signin page
router.get('/signin', function(req, res, next) {
    res.render('signin', { title: 'Sign In' });
});

// TO-DO: handle signin with passport.js
router.post('/signin', passport.authenticate('local', {
    successReturnToOrRedirect: '/back-officer/dashboard',
    failureRedirect: '/signin',
    failureMessage: true
}));

// TO-DO: handle signout
router.post('/signout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;
