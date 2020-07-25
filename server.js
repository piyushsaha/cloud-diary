require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const flash = require('express-flash')
const User = require('./models/userSchema')

//Routes
const userRoutes = require('./routes/userRoutes')
const noteRoutes = require('./routes/noteRoutes')


app.set('view engine', 'ejs')       //Setting the view engine to ejs
app.set('views', 'views')           //Setting the views folder to 'views'           
app.use(express.static('public'))   //Setting the 'public' folder as static folder
app.use(express.urlencoded({ extended: true }))  //parsing the incoming objects into json


const PORT = process.env.PORT || 3000
const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS
const DB_NAME = process.env.DB_NAME

//DB connection
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@node-tutorial-wqr5i.gcp.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => app.listen(PORT, () => console.log(`Connected to DB\nStarted on port : ${PORT}`)))
    .catch(err => console.log(err))


//Middlewares
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

//Handling Routes
app.use(userRoutes)
app.use(noteRoutes)

//Local Strategy Authentication (Using Passport.js)
const localStrategy = require('passport-local').Strategy
passport.use(new localStrategy({ usernameField: 'username', passwordField: 'password' },
    (username, password, done) => {
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No user with that username' })
                }
                bcrypt.compare(password, user.password)
                    .then(match => {
                        if (!match) {
                            return done(null, false, { message: 'Incorrect Password'})
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
    done(null, user.id);
})
passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(err, user)
    })
})
