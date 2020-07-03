const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()
const bcrypt = require('bcrypt')
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

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => app.listen(PORT, () => console.log(`Connected to DB\nStarted on port : ${PORT}`)))
    .catch(err => console.log(err))

process.env.isLoggedIn = false
// var userData = null
process.env.user = null

app.get('/login', (req, res) => {
    res.render('login', { title: "Login" })
})

app.get('/register', (req, res) => {
    res.render('register', { title: "Register" })
})

app.get('/dashboard', (req, res) => {
    isLoggedIn ?
        User.findOne({ username: user })
            .then(result => {
                console.log(result)
                userData = result
                res.render('dashboard', { title: "Dashboard", userData: result })
            })
            .catch(err => console.log(err))
        :
        res.redirect('login')
})

app.get('/', (req, res) => {
    isLoggedIn && userData ?
        res.redirect('dashboard')
        :
        res.redirect('login')
})



app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username })   //finding the user by username
        .then(result => {
            if (result) {   //if the username exists then the object is received into result
                bcrypt.compare(req.body.password, result.password)   //comparing the entered pass with pass in DB(result obj) 
                    .then(doesMatch => {   //the boolean value of if the paswword matches or not is received in doesMatch
                        if (doesMatch === true) {
                            user = req.body.username
                            isLoggedIn = true
                            res.redirect('dashboard')
                        }
                        else {   //if user exists but password is wrong
                            console.log('Wrong password!')
                        }
                    })
                    .catch(err => console.log(err))
            }
            else {      //if the user doesn't exist
                console.log('Username does not exists!')
            }
        })
        .catch(err => console.log(err))
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


app.post('/create-note', (req, res) => {
    req.body.date = new Date().toLocaleString() // setting the current date and time into date property
    console.log(req.body)
    User.findOneAndUpdate({ username: user }, { $push: { notes: req.body } }, { returnOriginal: false }) //finding the user and pushing the new note object into the array
        .then(response => {
            console.log(response)
            userData = response
            res.redirect('/dashboard')
        })
        .catch(err => console.log(err))
})

app.post('/logout', (req, res) => {
    isLoggedIn = false
    // userData = null
    user = null
})

app.post('/login', (req, res) => {
    console.log(req.body)
    res.redirect('/')
})