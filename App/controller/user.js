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
const nodeMailer = require('nodemailer')
const logger = require('../logs/logger')
require('dotenv').config();
const { validationResult } = require('express-validator')
const Movie = require('../model/movies')
const Show =  require('../model/shows');
const Review = require('../model/reviews_movie')
const Watchlist = require('../model/watchList')
const { movies } = require('./general');
const { warn } = require('console');
let transporter = nodeMailer.createTransport({
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
        try{
            // things required for landing page
        // top 7 trending movies and 7 trending shows
        const trend_movies = await Movie.find({}).sort({'viewCount':1,'rating':1}).limit(7).select({images:1,description:1,title:1,ratings:1})
        const trend_shows = await Show.find({}).sort({'viewCount':1,'rating':1}).limit(7).select({images:1,title:1,description:1,ratings:1})
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
            validated:req.session.isloggedIn,
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
        catch(err){
            logger.log({'level':'error','message':`unable to fetch landing page for ${req.session.userId}`})
            res.render('error.ejs')
        }
    }

exports.login = (req, res, next) => {

    try{
        if (req.session.isloggedIn === true) {

            res.redirect(`/`)
        } else {
    
            res.render('login.ejs', {
                pageTitle: 'Login',
                err:[],
                user: '',
    
            })
        }
    }
    catch(err){
        logger.log({'level':'error','message':`unable to get login page for ${req.session.userId}`})
        res.render('error.ejs')
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
   try{
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
                            res.redirect('/')
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
   catch(err){
    logger.log({'level':'error','message':`unable to validate data for ${req.params.name}`})
    res.render('error.ejs')
   }
}
exports.signup_check = (req, res, next) => {
        try{
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
        catch(err){
            logger.log({'level':'warn','message':err})
            res.render('error.ejs')
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
        console.log({level:'error',message:err});
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
   try{
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
                                logger.log({'level':'info','message':`mail sent successfully `})
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
            logger.log({'level':'error','message':err})
            const error = new Error('Server side erorr failed to fetch details')
            error.httpStatusCode = 500;
            return next(error);
        })
   }
   catch(err){
    logger.log({'level':'error','message':err})
    res.render('error.ejs')
   }
}

exports.confirmPasswordChange = (req, res, next) => {
    try{
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
    catch(err){
        logger.log({'level':'error','message':err})
        res.render('error.ejs')
    }
}

exports.confirmPasswordChange1 = (req, res, next) => {
  try{
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
  catch(err){
    logger.log({'level':'error','message':err})
    res.render('error.ejs')
  }
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
exports.watchList = async (req,res,next)=>{

   try{
     /*this is the coding for the sort
    0=>none
    1=>latest
    2=>oldest
    3=>most popular 
    4=>least popular
    */
   let sort = req.params.sort;
   let watch;
   if(sort == '0')
    watch = await Watchlist.find({user:req.session.userId}).populate('movies').sort({'viewCount':1}).populate('shows');
   if(sort == '1') 
    watch = await Watchlist.find({user:req.session.userId}).populate({path:'movies',options:{sort:{'viewCount':1}}}).populate({path:'shows',options:{sort:{'viewCount':1}}});
   if(sort == '2') 
    watch = await Watchlist.find({user:req.session.userId}).populate({path:'movies',options:{sort:{'viewCount':1}}}).populate({path:'shows',options:{sort:{'viewCount':-1}}});
   if(sort == '3')  
    watch = await Watchlist.find({user:req.session.userId}).populate({path:'movies',options:{sort:{'viewCount':1}}}).populate({path:'shows',options:{sort:{'created_at':1}}});
   if(sort == '4')
    watch = await Watchlist.find({user:req.session.userId}).populate({path:'movies',options:{sort:{'viewCount':1}}}).populate({path:'shows',options:{sort:{'created_at':-1}}});
   if(watch.length>0){
    res.render('watchlist.ejs',{
        data:watch[0],
        validated:req.session.isloggedIn,
        empty:false
    })
   }
    else{
        res.render('watchlist.ejs',{
            data:[],
            validated:req.session.isloggedIn,
            empty:true
        })
    }
   }
   catch(err){
    logger.log({'level':'error','message':`Unable to fetch watchlist for ${req.session.userId}`})
    res.render('error.ejs')
   }
}

exports.user = (req,res,next)=>{

    res.render('user.ejs',{
        validated:req.session.isloggedIn,
    })
}

exports.suggestions = (req,res,next)=>{
    res.render('suggestion.ejs',{
        validated:req.session.isloggedIn,
    })
}

exports.upvote = async(req,res,next)=>{
let item = req.params.item;
let type = req.params.type;
// increase upvote of movie;
if(type == 'movie'){
    try{
        let result = await Movie.updateOne({_id:item},{$inc:{'likeCount':1}})
        console.log(result)
    }
    catch(err){
        console.log(err)
    }
}
else{
    try{
        let result = await Show.updateOne({_id:item},{$inc:{'likeCount':1}})
        console.log(result)
    }
    catch(err){
        console.log(err)
    }
}
res.status(204).send();
}

exports.addWatch = async(req,res,next)=>{
    let item = req.params.item;
    let type = req.params.type;
    let user = req.session.userId;
     if(type === 'movie'){
    try{
        let result = await Watchlist.find({user:user})
        // add to the doc
        if(result.length>0){
           let watch = result[0]
           let movies = watch.movies;
           let increase=0;
           if(movies.indexOf(item)==-1)
           {
            movies.push(item)
            increase=1;
           }
           try{
            let mov_update = await Watchlist.updateOne({user:user},{$set:{'movies':movies},$inc:{'movieCount':increase}})
            console.log(mov_update)
           }
           catch(err){
            console.log(err)
           }
        }
        // creat doc
        else{
      let newWatch =  new Watchlist({
        user:user,
        movieCount:1,
        showsCount:0,
        movies:[item],
        show:[]
      })
      await newWatch.save();
        }
    }
    catch(err){
        console.log(err);
        return;
    }
    //increase the watchlist count of the movie
    try{
        await Movie.updateOne({_id:item},{$inc:{'movieListCount':1}})
    }
    catch(err){
        console.log(err)
    }
      } 
      
      else{
        try{
            let result = await Watchlist.find({user:user})
            // add to the doc
            if(result){
               let watch = result[0]
               let shows = watch.shows;
               let increase = 0;
               if(shows.indexOf(item)==-1)
               {
                shows.push(item)
                increase=1;
               }
               try{
                await Watchlist.updateOne({user:user},{$set:{'shows':shows},$inc:{'showsCount':increase}})
               }
               catch(err){
                console.log(err)
               }
            }
            // creat doc
            else{
          let newWatch =  new Watchlist({
            user:user,
            movieCount:0,
            showsCount:1,
            movies:[],
            show:[item]
          })
          await newWatch.save();
            }
        }
        catch(err){
            console.log(err)
            return;
        }
        //increase the watchlist count of the movie
        try{
            await Show.updateOne({_id:item},{$inc:{'movieListCount':1}})
        }
        catch(err){
            console.log(err)
        }
      }
      res.status(204).send();
}

exports.addReview=async(req,res,next)=>{
    try{
        let userId =  req.session.userId;
    let name = req.params.name;
    let type = req.params.type;
    let rate = req.body.rate;
    let content =  req.body.content;

    // creating the review doc:
    //1) checking if a review with same userID and movie name exists
    let check = await Review.find({user:userId,movie:name})
    if(check.length>0){
        await Review.updateOne({user:userId},{$set:{'content':content,'rate':rate}})
    }
    //2) If the review do not exists than create the new doc or just update the existing one
    else{
        let newRev = new Review({
            user:userId,
            movie:name,
            catg:type,
            rating:rate,
            content:content
        })
        await newRev.save();
    }
    res.status(204).send();
    }
    catch(err){
        logger.log({'level':'error','message':`${req.session.userId} failed to add review for ${req.params.name}:${err}`})
        res.status(204).send();
    }
}
exports.getChangeDetails = async(req,res,next)=>{
    let userId = req.session.userId;
    //fetching user
    let user = await User.find({_id:userId})
    user = user[0]

    res.render('changeDetails.ejs',{
        pageTitle: 'signup',
        error: '',
        user_name: user.name,
        email: user.email,
        contact: user.contact
    })

}
exports.postEditDetails = async(req,res,next)=>{
    //make changes in here
    let userId = req.session.userId;
    //performing validation checks in here
    let user = await User.find({_id:userId})
    user=user[0];
    let new_name = req.body.name;
    let new_email = req.body.email;
    // validating these
    let user_name = await User.find({name:new_name});
    let user_email = await User.find({email:new_email});
    if(user_name.length>0){
       if(new_name!=user_name[0].name){
        return res.render('changeDetails.ejs',{
            pageTitle: 'signup',
            error: '1',
            user_name:'',
            email: user.email,
            contact: user.contact
        })
       }
    }
    if(user_email.length>0){
      if(new_email!=user_email[0].email){
        return res.render('changeDetails.ejs',{
            pageTitle: 'signup',
            error: '2',
            user_name: user.name,
            email:'',
            contact: user.contact
        })
      }
    }
   
// editing the user details if there are no validation 
try{
    let res = await User.updateOne({_id:userId},{$set:{
        name: req.body.name,
        email: req.body.email,
        contact:req.body.contact,
    }})
    logger.log({'level':'info','message':`updated the user details for ${req.session.userId}`})
}
catch(err){
    logger.log({'level':'error','message':`failed to update the user details for ${req.session.userId}`})
}
    res.redirect('/user')
}

// fetching the userdtails
exports.getRecommendation = async(req,res,next)=>{
 try{
    let watch = await Watchlist.find({user:req.session.userId}).populate('movies').sort({'viewCount':1}).populate('shows');
    let movies = watch[0].movies;
    let shows = watch[0].shows;
    // collecting the genres
    genres = []
    movies.forEach(mov=>{
      let categories = mov.category;
      categories.forEach(catg=>{
          if(genres.indexOf(catg)==-1){
              genres.push(catg)
          }
      })
    })
    shows.forEach(mov=>{
      let categories = mov.category;
      categories.forEach(catg=>{
          if(genres.indexOf(catg)==-1){
              genres.push(catg)
          }
      })
    })
    // fetching the movies
   
  let fetch_mov = await Movie.find({'category':{$in:genres}}).sort({'viewCount':1,'ratings':1}).limit(20)
    // fetching the shows
  let fetch_show = await Show.find({'category':{$in:genres}}).sort({'viewCount':1,ratings:1}).limit(20)
    res.render('recommendation.ejs',{
      title:'Recommendations',
       movies:fetch_mov,
       shows:fetch_show,
       validated:req.session.isloggedIn,
    })
 }
 catch(err){
    logger.log({'level':'error','message':`failed to get recommendation for the user: ${req.session.userId}`})
    res.render('error.ejs')
 }
    
}