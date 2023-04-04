const express  = require('express')

const router = express.Router()
const controller = require('../controller/user')
const user = require('../model/user')
const isAuth = require('./isAuth')
const {check,body} = require('express-validator')
const { Container } = require('winston')
router.get('/', controller.landingPage)
router.get('/login', controller.login)
router.post('/login', [
    check('name').custom((value,{req})=>{
        return user.find({name:value}).
        then(user=>{
            if(user.length==0){
                return Promise.reject('1')
            }
        })
    })
],controller.login_check)
router.get('/signup', controller.signup)
router.post('/signup', [
    check('name').custom((value,{req})=>{
        return user.find({name:value})
        .then(user=>{
            if(user.length>0){
                return Promise.reject('1')
            }
        })
    }),
    check('email').isEmail().withMessage('2'),
    
check('email').custom((value, { req }) => {
        return user.find({ email: value } )
            .then(user => {
                if (user.length > 0) {
                    return Promise.reject('3') // we are returning a promise with reject which is basically an error message
                }
            })
            //let's see the chain we are returning a find ooperation which in turn will return a promis reject if an entry is found
    })
    .normalizeEmail() //this is a sanitization method for email
    ,
    //validator will look for password field in the body of req
    body('password', '4') //the second key is the default message we want for all the validators check
    .isLength({ min: 10 })
    .trim() //this is a sanitization method for password
    ,
    body('confirm').custom((value, { req }) => {
        if (value === req.body.password) {
            return true
        } else
            return Promise.reject('5')
    }),
    
], controller.signup_check)
router.get('/logout', isAuth, controller.logout)
router.get('/change_password',controller.ChangingPassword)
router.post('/changePassword', isAuth, controller.changePassword)
// the thing is we can not use user token in this case since it is generated at the time of session creation that is time of login
router.get('/ConfirmChange1/:email', controller.confirmPasswordChange1)
router.get('/ConfirmChange/:userId/:token', controller.confirmPasswordChange)
router.post('/confirmChange', [
        check('password', 'Please enter a valid password which is atleast 10 characters long') //the second key is the default message we want for all the validators check
        .isLength({ min: 10 })
        .trim() //this is a sanitization method for password
        ,
        check('password')
        .custom((value, { req }) => {
            if (value != req.body.Confirm) {
                throw new Error('The passwords you entered do not match');
            } else {
                return true;
            }
        })
    ],
    controller.confirmChange)

    router.post('/confirmChange1', [
        check('password', 'Please enter a valid password which is atleast 10 characters long') //the second key is the default message we want for all the validators check
        .isLength({ min: 10 })
        .trim() //this is a sanitization method for password
        ,
        check('password')
        .custom((value, { req }) => {
            if (value != req.body.Confirm) {
                throw new Error('The passwords you entered do not match');
            } else {
                return true;
            }
        })
    ],
    controller.confirmChange1)
    router.post('/remindPassword', controller.remindPassword)
router.get('/watchlist',isAuth,controller.watchList)
router.get('/user',isAuth,controller.user)
router.get('/suggestions',isAuth,controller.suggestions)
router.get('/upvote/:item/:type',isAuth,controller.upvote)
router.get('/watchlist/:item/:type',isAuth,controller.addWatch)
module.exports = router
