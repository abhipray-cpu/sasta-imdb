const movies =  require('../model/movies')
const shows =  require('../model/shows')
const watchList = require('../model/user')
const oscar =  require('../model/oscar')
const actor =  require('../model/actors')
exports.home = (req,res,next)=>{
    res.render('home.ejs')
} 
 
exports.results = (req,res,render)=>{
    res.render('search.ejs')
}
exports.searchMenu = (req,res,next)=>{
    res.render('search-menu.ejs')
}
exports.movies = (req,res,next)=>{
  res.render('movies.ejs')
}
exports.shows = (req,res,next)=>{
   res.render('shows.ejs')
}

exports.actors = (req,res,next)=>{
    res.render('actor.ejs')
}