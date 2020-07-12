require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const User = require('./models/userSchema')



app.set('view engine', 'ejs')       //Setting the view engine to ejs
app.set('views', 'views')           //Setting the views folder to 'views'           
app.use(express.static('public'))   //Setting the 'public' folder as static folder
app.use(express.urlencoded({ extended: true }))



const PORT = process.env.PORT || 3000

const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS
const DB_NAME = process.env.DB_NAME

const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@node-tutorial-wqr5i.gcp.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

// DB connection
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => app.listen(PORT, () => console.log(`Connected to DB\nStarted on port : ${PORT}`)))
    .catch(err => console.log(err))


//middlewares
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

//helper function to check if any user is logged in or not to protect some routes
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

app.get('/login', (req, res) => {
    res.render('login', { title: "Login - Cloud Diary" })
})

app.get('/register', (req, res) => {
    res.render('register', { title: "Register - Cloud Diary" })
})

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { title: "Dashboard  - Cloud Diary", userData: req.user })
})

app.get('/', ensureAuthenticated, (req, res) => {
    res.redirect('dashboard')
    // console.log(req)
})





// Local Strategy Authentication (Using Passport.js)
const localStrategy = require('passport-local').Strategy
passport.use(new localStrategy({ usernameField: 'username', passwordField: 'password' },
    (username, password, done) => {
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'User Not Found' })
                    // console.log('No user')
                }
                bcrypt.compare(password, user.password)
                    .then(match => {
                        if (!match) {
                            return done(null, false, { message: 'Incorrect Password' })
                            // console.log(`Incorrect pass`)
                        }
                        if (match) {
                            return done(null, user)
                        }
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))

    }))



passport.serializeUser((user, done) => {
    // console.log(user.id)
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(err, user)
    })
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
}), (req, res) => {
    console.log(req.user)
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => res.redirect('/'))
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // 
        req.body.password = hashedPassword
        console.log(req.body.password)
        const user = new User(req.body)
        User.findOne({ username: req.body.username })
            .then(result => {
                if (result) {
                    console.log('Username already taken!')
                    res.redirect('register')
                } else {
                    user.save()
                        .then(res.redirect('login'))
                        .catch(err => console.log(err))
                }
            })
    } catch {
        res.status(500).send()
    }
})

app.get('/delete/:noteID', async (req, res) => {
    var noteID = req.params.noteID
    var userID = req.user._id
    await User.findByIdAndUpdate( userID , { $pull: { notes: { _id: noteID } } })
        .then (async response => {
            await res.redirect('/dashboard')
        })
        .catch(err => console.log(err))
})


app.post('/create-note', (req, res) => {
    req.body.date = new Date().toLocaleString() // setting the current date and time into date property
    // console.log(req.body)
    User.findOneAndUpdate({ username: req.user.username }, { $push: { notes: req.body } }, { returnOriginal: false }) //finding the user and pushing the new note object into the array
        .then(response => {
            // console.log(response)
            // userData = response
            res.redirect('/dashboard')
        })
        .catch(err => console.log(err))
})
