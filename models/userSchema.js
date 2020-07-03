const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    notes: [{ title: String, body: String, date: String }]
})

const User = mongoose.model('users', userSchema)

module.exports = User