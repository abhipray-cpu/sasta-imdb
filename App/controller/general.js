const movies =  require('../model/movies')
const shows =  require('../model/shows')
const watchList = require('../model/user')
const oscar =  require('../model/oscar')
const actor =  require('../model/actors')
const mov_review = require('../model/reviews_movie')
const show_review = require('../model/reviews_show')
exports.home = (req,res,next)=>{
    res.render('home.ejs',{
        validated:req.session.isloggedIn,
    })
} 
 
exports.results = (req,res,render)=>{
    res.render('search.ejs',{
        validated:req.session.isloggedIn,
    })
}
exports.searchMenu = (req,res,next)=>{
    res.render('search-menu.ejs',{
        validated:req.session.isloggedIn,
    })
}
//will be fetching the data for movie using the movie title
exports.movies = async (req,res,next)=>{
    let mov_name = req.params.movName;
    const movie = await movies.find({title:mov_name})
      if(movie.length>0){
        let item = movie[0]
        let mov_id = item._id;
     //fetching the reviews for movie
     try{
        let result = await movies.updateOne({_id:mov_id},{$set:{'viewCount':item.viewCount+1}}) //this will be used while finding trending items
     console.log(result) 
    }
     catch(err){
        console.log(err);
     }
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
            reviews:reviews,
            type:'movie',
            validated:req.session.isloggedIn,
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
    
     try{
        let result =  await shows.updateOne({_id:show_id},{$set:{'viewCount':item.viewCount+1}}) //this will be used while finding trending items
     console.log(result) 
    }
     catch(err){
        console.log(err);
     }
     let revs = await mov_review.find({movie:show_id})
     if(revs.length == 0)
     reviews=[]
     else
     reviews=revs
let seasons = []
for(var i=1;i<=item.season;i++){
    seasons.push(String(i))
}
req.session.episodes = {'season':seasons,'episodes':item.episodes}
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
            episodes:item.episodes,
            type:'show',
            validated:req.session.isloggedIn
        })
    }
    else{
        res.render('500.ejs')
    }
}

exports.actors = (req,res,next)=>{
    res.render('actor.ejs',{
        validated:req.session.isloggedIn,
    })
}
exports.epDetails = (req,res,next)=>{
   let season = req.session.episodes.season;
   let episodes = req.session.episodes.episodes;
    res.render('episode_detail.ejs',{
        title:req.params.title,
        air:req.params.air,
        description:req.params.description,
        image:req.params[0],
        seasons:season,
        episodes:episodes,
        validated:req.session.isloggedIn
        
    })
}
exports.trending = async(req,res,next)=>{
    const trend_movies = await movies.find({}).sort({'viewCount':1,'rating':1}).limit(15)
    const trend_shows = await shows.find({}).sort({'viewCount':1,'rating':1}).limit(15)
    res.render('trending.ejs',{
        title:"trending",
        validated:req.session.isloggedIn,
        shows:trend_shows,
        movies:trend_movies
    })
}
// since we have not create users docs therefore if it does not exists we will simply create it