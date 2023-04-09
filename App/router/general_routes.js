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
router.get('/show/:showName',controller.shows)
router.get('/movie/:movName',controller.movies)
router.get('/actor/:name',controller.actors)
router.get('/epDetails/:title/:air/:description/*',controller.epDetails)
router.get('/trending',controller.trending);
router.post('/search',controller.searchResult)
module.exports = router