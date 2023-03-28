const express = require('express')
const router = express.Router()

const controller = require('../controller/general')

const isAuth = (req, res, next) => {
    if (req.session.isloggedIn === true) {
        return next(); //make sure to return this next call
    } else {
        return res.redirect('/')
    }
}
router.get('/home',controller.home)
router.get('/results',controller.results)
router.get('/search-menu',controller.searchMenu)
router.get('/shows',controller.shows)
router.get('/movies',controller.movies)
router.get('/actor',controller.actors)
module.exports = router