//in here we will be handling all the errors that can occur at server side
//by creating an error object and returning the next containing that error with the
//http status code of 500

/*
implementing async await improves the readibity of the code since the syntax now is more like synchronous approach
*/
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../model/user')
const bcrypt = require('bcrypt')
const nodeMailer = require('nodeMailer')
const logger = require('../logs/logger')
const nodemailer = require('nodemailer')
require('dotenv').config();
const { validationResult } = require('express-validator')
const Movie = require('../model/movies')
const Show =  require('../model/shows')
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

exports.landingPage = async(req,res,next)=>{
    if (req.session.isloggedIn === true) {

        res.redirect(`/user/${req.session.userId}`)
    }
    else{
        // things required for landing page
        // top 7 trending movies and 7 trending shows
        const trend_movies = await Movie.find({}).sort({'rank':1}).limit(7).select({images:1,description:1,title:1,ratings:1})
        const trend_shows = await Show.find({}).sort({'rank':1}).limit(7).select({images:1,title:1,description:1,ratings:1})
        //there will be 13 different rows and of different categories we will fetch 5 items from movies ans shows each
         let suggestions = trend_movies
         let trending = {'movies':trend_movies,'shows':trend_shows}

         //fetching data for different categories
         let action_movie = await Movie.find({category:'Adventure'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let comedy_movie = await Movie.find({category:'Comedy'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let horror_movie = await Movie.find({category:'Horror'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let crime_movie = await Movie.find({category:'Crime'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let romance_movie = await Movie.find({category:'Romance'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let scifi_movie = await Movie.find({category:'Sci-Fi'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let drama_movie = await Movie.find({category:'drama'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let fantasy_movie = await Movie.find({category:'Fantasy'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let sport_movie = await Movie.find({category:'Sport'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let history_movie = await Movie.find({category:'History'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         
         let action_show = await Show.find({category:'Adventure'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let comedy_show = await Show.find({category:'Comedy'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let horror_show = await Show.find({category:'Horror'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let crime_show = await Show.find({category:'Crime'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let romance_show = await Show.find({category:'Romance'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let scifi_show = await Show.find({category:'Sci-Fi'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let drama_show = await Show.find({category:'drama'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let fantasy_show = await Show.find({category:'Fantasy'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let sport_show = await Show.find({category:'Sport'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
         let history_show = await Show.find({category:'History'}).sort({rank:1}).limit(5).select({images:1,title:1,description:1,ratings:1})
        

        res.render('landing-page.ejs',{
            suggestions:suggestions,
            trending:trending,
            // before deploy add oscar as well
            items:{
                Adventure:{'movie':action_movie,'show':action_show},
            Comedy:{'movie':comedy_movie,'show':comedy_show},
            Horror:{'movie':horror_movie,'show':horror_show},
            Crime:{'movie':crime_movie,'show':crime_show},
            Romance:{'movie':romance_movie,'show':romance_show},
            Sci_Fi:{'movie':scifi_movie,'show':scifi_show},
            Drama:{'movie':drama_movie,'show':drama_show},
            Fantasy:{'movie':fantasy_movie,'show':fantasy_show},
            Sport:{'movie':sport_movie,'show':sport_show},
            History:{'movie':history_movie,'show':history_show}
            }    
        })
    }
}
exports.login = (req, res, next) => {

    if (req.session.isloggedIn === true) {

        res.redirect(`/user/${req.session.userId}`)
    } else {

        res.render('login.ejs', {
            pageTitle: 'Login',
            err:[],
            user: '',

        })
    }
}
exports.signup = (req, res, next) => {

    res.render('signup.ejs', {
        pageTitle: 'signup',
        error: '',
        user_name: '',
        email: '',
        contact: ''
    })
}
exports.login_check = (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password
    const errors = validationResult(req).errors //all the errors realted to this req which were caught by the check middleware will be addded to this validationResult
        if (errors.length > 0){
            res.render('login.ejs',{
                pageTitle: 'Login',
                err: errors[0].msg,
            user: name,
            })
        }
    User.find({ name: name })
        .then(user => {
            if (user.length > 0) {
                req.body.id = user[0].id
                bcrypt.compare(password, user[0].password)
                    .then(matched => {
                        if (matched === true) {
                            const user_id = req.body.id;
                            req.body.id = -1;

                            req.session.isloggedIn = true
                            req.session.userId = user_id
                            res.redirect(`/user/${user_id}`)
                        } else {
                            //in this case the passwoed does not so we will flash this info
                            req.flash('errorpswd', 'The password you entere is wrong so fuck off!!') //this method is now available in our app
                                //this metod takes a key value pair
                                //new we need to register in the page which will be rendered
                            res.render('login.ejs', {
                                pageTitle: 'Login',


                                err: '2', //we simply specify the key in here
                        
                                    user: req.body.name,
                                    
                            })
                        }
                    })
            } else {
                req.flash('errorUser', 'No such user found so fuck off !!')
                res.redirect('/signup')
            }
        })
        .catch(err => {
            logger.log({level:'error',message:`failed to vaidate user ${err}`})
            const error = new Error('Server side erorr failed to fetch details')
            error.httpStatusCode = 500;
            return next(error);
        })


}
exports.signup_check = (req, res, next) => {
        const name = req.body.name;
        const password = req.body.password
        const confirm = req.body.confirm //this is the confirmation password
        const errors = validationResult(req).errors //all the errors realted to this req which were caught by the check middleware will be addded to this validationResult
        if (errors.length > 0) {
            return res.status(422).render('signup.ejs', {
                pageTitle: 'signup',
                error: errors[0],
                user_name: req.body.user_name,
                email: req.body.email,
                contact: req.body.contact
            })


            //we are setting the status code to 422 which is a commom validation failed status code and then we are rendering the same page
        }
        if (password === confirm) {
            return bcrypt.hash(password, 13) //second param is the salt value which specifies the rounds of hashing implemented security and time taken are directly proportional to salt value
                .then(
                    hashedPassword => {
                        User.create({
                                name: req.body.name,
                                password: hashedPassword,
                                email: req.body.email,
                                contact:req.body.contact,
                                interests:[]
                            }).then(person => {
                                logger.log('user is created sucessfully!!')
                                res.render('login.ejs', {
                                    pageTitle: 'Login',
                                    error1: req.flash('NoUser'), //no user found
                                    error2: req.flash('WrongPassword'), //password error
                                    user: name
                                })
                                let mailOptions = {
                                        to: req.body.email,
                                        from: process.env.MAIL_FROM,
                                        subject: "Signup confirmation",
                                        text: " WE are so happy that you chose our service",
                                        html: `<h1>Hey user these are your credentials</h1>
                                <ul>
                                <li><h3>User name: ${req.body.name}</h3></li>
                                <li><h3>Email : ${req.body.email}</h3></li>
                                <li><h3>Password: ${req.body.password}</h3></li>
                                
                                </ul>`
                                    }
                                    //since this sending of email might take some time therefore processing it asynchronously
                                return transporter.sendMail(mailOptions)
                                    .then(result => {
                                        logger.info('mail sent successfully')
                                    })
                                    .catch(err => {
                                        logger.log('{level:error,message:failed to send mail}')
                                        const error = new Error('Server side erorr failed to send mail')
                                        error.httpStatusCode = 500;
                                        return next(error);
                                    })
                            })
                            .catch(err => logger.log({level:'error',message:err}))
                    }
                )
                //here catch the password mismatched error
                .catch(err => { logger.log({level:'error',message:err}) })
        } else {
            req.flash('errorMismatch', 'The password does not match')
            res.render('signup.ejs', {
                pageTitle: 'Signup',

                errorMessage: req.flash('errorUser'), //we simply specify the
                errorPaswd: req.flash('errorMismatch'),
                value: {
                    userName: req.body.name,
                    Email: req.body.email,
                    Password: req.body.password,
                    Confirm: ''
                }
            })
        }
    }
//     //here we will be using magic association methods to fetch all the movies belonging to a user
// exports.user = (req, res, next) => {

//     const ID = req.params.userId;
//     MovieList.find({ user: ID }, { movies: 1 })
//         .populate('movies')
//         .then(movie => {
//             if (movie.length > 0)
//                 return req.body.movies = movie[0].movies;
//             else
//                 return req.body.movies = []
//         })
//         .then(roopa => {
//             User.find({ user_id: ID })
//                 .then(user => {
//                     // console.log('%j', req.body.movies);
//                     res.render('user.ejs', {
//                         pageTitle: 'User',
//                         movies: req.body.movies,
//                         user: ID,
//                         name: user[0].user
//                     })


//                 })
//         })
//         .catch(err => {
//             console.error(err)
//             const error = new Error('Server side erorr failed to fetch details')
//             error.httpStatusCode = 500;
//             return next(error);
//         })



// }

exports.logout = (req, res, next) => {
    //for logging out we simply delte a session
    req.session.destroy(err => {
        loggger.log({level:'error',message:err});
        res.redirect('/')
    });
}

// these functions are for handling the password changes

exports.ChangingPassword = (req, res, next) => {
    //attaching the current user to the req
    res.render('forgot.ejs', {
        error: '',
        message:''
    })

}

exports.changePassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            logger.log({level:'error',messagee:err});
            return res.status(422).res.render('passwordChange1.ejs', {
                user: req.session.userId,
                message: '',
                error: 'Something went wrong on our side'
            })
        }
        req.session.token = buffer.toString('hex');
    })
    error =
        User.findById(req.session.userId)
        .then(user => {
            if (user) {
                return user
            } else {
                req.flash('passwordChange', 'No such user was found');
                res.render('passwordChange1.ejs', {
                    user: req.session.userId,
                    message: '',
                    error: req.flash('passwordChange')
                })
            }
        })
        .then(user => {
            req.session.email = user.email;
            user.resetToken = req.session.token;
            user.resetTokenExpiration = Date.now() + 60000;
            return user.save();
        })
        .then(user => {
            bcrypt.compare(req.body.password, user.password)
                .then(matched => {
                    if (matched === true) {
                        let mailOptions = {
                                to: req.session.email,
                                from: process.env.MAIL_FROM,
                                subject: "Password Change",
                                text: "Use the link to change the password if not sent by you \n Then sorry my friend you are fucked",
                                html: `<h1>Use this link to change the password</h1>
                                <a href='http://localhost:4000/ConfirmChange/${req.session.userId}/${req.session.token}'>Change password</a>`
                            }
                            //since this sending of email might take some time therefore processing it asynchronously
                        return transporter.sendMail(mailOptions)
                            .then(result => {
                                console.log('mail sent successfully');
                                //render the same page with a message
                                res.render('passwordChange1.ejs', {
                                    user: req.session.userId,
                                    message: 'A mail has been sent to your email id with password reset link',
                                    error: ''
                                })
                            })
                            .catch(err => {
                                logger.log({level:'error',message:`sending mail failed: ${err}`});
                                
                                res.render('passwordChange1.ejs', {
                                    user: req.session.userId,
                                    message: 'Sending mail failed please try again',
                                    error: ''
                                })
                            })

                    } else {
                        req.flash('passwordChange', 'Wrong Password');
                        res.render('passwordChange1.ejs', {
                            user: req.session.userId,
                            message: '',
                            error: req.flash('passwordChange')
                        })
                    }
                })
        })
        .catch(err => {
            const error = new Error('Server side erorr failed to fetch details')
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.confirmPasswordChange = (req, res, next) => {
    User.findById(req.params.userId)
        //if you want to include a time restraint you can do like this
        //User.find({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
        .then(user => {
            

            if (user.resetToken == req.params.token) {
                let currDate = new Date();
                if (user.resetTokenExpiration.getTime() <= currDate.getTime()) {
                    res.render('passwordChange2.ejs', {
                        userId: user._id,
                        error: ''
                    })
                } else {
                    res.render('passwordChange1.ejs', {
                        user: req.session.userId,
                        message: '',
                        error: req.flash('Timeout error')
                    })
                }
            }
        })
        .catch(err => {
            logger.log({level:'error',message:err});
        })
}

exports.confirmPasswordChange1 = (req, res, next) => {
    User.find({email:req.params.email})
        //if you want to include a time restraint you can do like this
        //User.find({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
        .then(user => {
            if (user) {
                    res.render('passwordChange2A.ejs', {
                        email: req.params.email,
                        error: ''
                    })
                
            }
            else {
                res.render('forgot.ejs', {
                    message: '',
                    error: req.flash('Timeout error')
                })
            }
        })
        .catch(err => {
            logger.log({level:'error',message:err})
            res.render('500.ejs');
        })
}


exports.confirmChange = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('passwordChange2.ejs', {
            userId: req.body.userId,
            error: errors.errors[0].msg

        })
    } else {
        User.findById(req.body.userId)
            .then(user => {
                bcrypt.compare(req.body.password, user.password)
                    .then(matched => {
                        if (matched === true) {
                            return res.status(422).render('passwordChange2.ejs', {
                                userId: req.body.userId,
                                error: 'This is same as your old password'

                            })
                        } else {
                            return bcrypt.hash(req.body.password, 13)
                                .then(password => {
                                    req.session.currPassword = password;
                                    User.findById(req.body.userId)
                                        .then(user => {
                                            user.password = req.session.currPassword;
                                            req.session.currPassword = ''
                                            return user.save();
                                        })
                                        .then(result => {
                                            res.render('login.ejs', {
                                                pageTitle: 'Login',
                                                errorMessage: '',
                                                value: {
                                                    user: '',
                                                    password: ''
                                                }

                                            })

                                        })
                                        .catch(err => {
                                            logger.log({level:"error",message:err});
                                            return res.status(422).render('passwordChange2.ejs', {
                                                userId: req.body.userId,
                                                error: 'Faield to update password'

                                            })
                                        })
                                })
                        }
                    })
            })
            .catch(err => {
                logger.log({level:'error',message:err});
                return res.status(422).render('passwordChange2.ejs', {
                    userId: req.body.userId,
                    error: 'Try again'

                })
            })
    }
}

exports.confirmChange1 = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('passwordChange2.ejs', {
            email: req.body.email,
            error: errors.errors[0].msg

        })
    } else {
        User.find({email:req.body.email})
            .then(user => {
                user = user[0]
                bcrypt.compare(req.body.password, user.password)
                    .then(matched => {
                        if (matched === true) {
                            return res.status(422).render('passwordChange2A.ejs', {
                                email: req.body.email,
                                error: 'This is same as your old password'

                            })
                        } else {
                            let userName = ""    
                            return bcrypt.hash(req.body.password, 14)
                            
                            .then(password => {
                                    User.find({email:req.body.email})
                                        .then(user => {
                                            user = user[0]
                                            userName = user.user
                                            user.password = password;
                                            return user.save();
                                        })
                                        .then(result => {
                                           
                                            res.render('login.ejs', {
                                                pageTitle: 'Login',
                                                error1: '', //no user found
                                                error2:'', //password error
                                                user: userName

                                            })

                                        })
                                        .catch(err => {
                                            logger.log({level:'error',message:err});
                                            return res.status(422).render('passwordChange2A.ejs', {
                                                email: req.body.email,
                                                error: 'Failed to update password'

                                            })
                                        })
                                })
                        }
                    })
            })
            .catch(err => {
                logger.log({level:'error',message:err});
                return res.status(422).render('passwordChange2A.ejs', {
                    email: req.body.email,
                    error: 'Try again'

                })
            })
    }
}

exports.remindPassword = async(req, res, next) => {
    let email = req.body.email
    const result = await User.find({ 'email': email })
    if (result.length > 0) {
        let mailOptions = {
                to: email,
                from: process.env.MAIL_FROM,
                subject: "Password Change",
                text: "Use the link to change the password if not sent by you \n Then sorry my friend you are fucked",
                html: `<h1>Use this link to change the password</h1>
            <a href='http://localhost:4000/ConfirmChange1/${email}'>Change password</a>`
            }
            //since this sending of email might take some time therefore processing it asynchronously
        return transporter.sendMail(mailOptions)
            .then(result => {
                //render the same page with a message
                res.render('forgot.ejs', {
                    error:'',
                    message: 'Check your email mail is sent!!'
                })
            })
            .catch(err => {
                logger.log({level:'error',message:`sending mail failed:${err}`});
                res.render('forgot.ejs', {
                    error: '',
                    message:'failed to send mail try again'
                })
            })
    } else {
        res.render('forgot.ejs', {
            error: 'No such email found!',
            message: ''
        })
    }
}
exports.watchList = (req,res,next)=>{
    res.render('watchlist.ejs')
}

exports.user = (req,res,next)=>{

    res.render('user.ejs')
}

exports.suggestions = (req,res,next)=>{
    res.render('suggestion.ejs')
}