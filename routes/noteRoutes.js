const express = require('express')
const router = express.Router()
const User = require('../models/userSchema')


router.get('/delete/:noteID', async (req, res) => {
    var noteID = req.params.noteID
    var userID = req.user._id
    await User.findByIdAndUpdate( userID , { $pull: { notes: { _id: noteID } } }) //pulling the note with the given note id from the notes array
        .then (async response => {
            await res.redirect('/dashboard')
        })
        .catch(err => console.log(err))
})

router.post('/create-note', (req, res) => {
    req.body.date = new Date().toLocaleString() // setting the current date and time into date property
    User.findOneAndUpdate({ username: req.user.username }, { $push: { notes: req.body } }, { returnOriginal: false }) //finding the user and pushing the new note object into the array
        .then(response => {
            res.redirect('/dashboard')
        })
        .catch(err => console.log(err))
})

module.exports = router