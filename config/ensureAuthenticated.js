//helper middleware funtion to protect private routes
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

module.exports = ensureAuthenticated