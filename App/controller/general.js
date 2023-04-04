const movies =  require('../model/movies')
const shows =  require('../model/shows')
const watchList = require('../model/user')
const oscar =  require('../model/oscar')
const actor =  require('../model/actors')
const mov_review = require('../model/reviews_movie')
const show_review = require('../model/reviews_show')
exports.home = (req,res,next)=>{
    res.render('home.ejs')
} 
 
exports.results = (req,res,render)=>{
    res.render('search.ejs')
}
exports.searchMenu = (req,res,next)=>{
    res.render('search-menu.ejs')
}
//will be fetching the data for movie using the movie title
exports.movies = async (req,res,next)=>{
    let mov_name = req.params.movName;
    const movie = await movies.find({title:mov_name})
      if(movie.length>0){
        let item = movie[0]
        let mov_id = item._id;
     //fetching the reviews for movie
     await movies.updateOne({_id:mov_id},{$set:{'viewCount':item.viewCount+1}}) //this will be used while finding trending items
     let revs = await mov_review.find({movie:mov_id})
     if(revs.length == 0)
     reviews=[]
     else
     reviews=revs
//update the viewcount of the movie

        res.render('movies.ejs',{
            id:item._id,
            title:item.title,
            images:item.images,
            description:item.description,
            category:item.category,
            casts:item.casts,
            likeCount:item.likeCount,
            watchlist:item.movieListCount,
            rank:item.rank,
            views:item.viewCount,
            rating:item.ratings,
            reviews:reviews
        })
    }
    else{
        res.render('500.ejs')
    }

}

exports.shows = async (req,res,next)=>{
    let show_name = req.params.showName;
    const show = await shows.find({title:show_name})
      if(show.length>0){
        let item = show[0]
        let show_id = item._id;
     //fetching the reviews for movie
     await movies.updateOne({_id:show_id},{$set:{'viewCount':item.viewCount+1}}) //this will be used while finding trending items
     let revs = await mov_review.find({movie:show_id})
     if(revs.length == 0)
     reviews=[]
     else
     reviews=revs
let seasons = []
for(var i=1;i<=item.season;i++){
    seasons.push(String(i))
}
//update the viewcount of the movie
        res.render('shows.ejs',{
            id:item._id,
            title:item.title,
            images:item.images,
            description:item.description,
            category:item.category,
            season:item.season,
            seasons:seasons,
            casts:item.casts,
            likeCount:item.likeCount,
            watchlist:item.movieListCount,
            rank:item.rank,
            views:item.viewCount,
            rating:item.ratings,
            reviews:reviews,
            episodes:item.episodes
        })
    }
    else{
        res.render('500.ejs')
    }
}

exports.actors = (req,res,next)=>{
    res.render('actor.ejs')
}
exports.epDetails = (req,res,next)=>{
    res.render('episode_detail.ejs',{
        title:req.params.title,
        air:req.params.air,
        description:req.params.description,
        image:req.params[0]
    })
}

// since we have not create users docs therefore if it does not exists we will simply create it