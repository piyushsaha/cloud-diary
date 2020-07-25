const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const ensureAuthenticated = require('../config/ensureAuthenticated')    //helper middleware funtion to protect private routes
const User = require('../models/userSchema')

router.get('/', ensureAuthenticated, (req, res) => {
    res.redirect('dashboard')
})

router.get('/login', (req, res) => {
    res.render('login', { title: "Cloud Diary - Login" })
})

router.get('/register', (req, res) => {
    res.render('register', { title: "Cloud Diary - Register" })
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { title: "Cloud Diary - Dashboard", userData: req.user })
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/logout', (req, res) => {
    req.session.destroy((err) => res.redirect('/'))
})

router.post('/register', async (req, res) => {
    try {
        console.log(req.body)
        const { name, username, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name,
            username,
            password: hashedPassword
        })
        User.findOne({ username })
            .then(result => {
                if (result) {
                    req.flash('error', 'Username already taken')
                    req.flash('name', name)     //sending the entered name as a flash message to the page
                    res.redirect('register')
                } else {
                    user.save()
                        .then(res.redirect('login'))
                        .catch(err => console.log(err))
                }
            })
    } catch {
        console.log(err)
    }
})

module.exports = router