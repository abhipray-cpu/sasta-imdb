const movies =  require('../model/movies')
const shows =  require('../model/shows')
const watchList = require('../model/user')
const oscar =  require('../model/oscar')
const Actor =  require('../model/actors')
const mov_review = require('../model/reviews_movie')
const show_review = require('../model/reviews_show')
const { name } = require('ejs')
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

exports.actors = async(req,res,next)=>{
    try{
        let actor_name = req.params.name;
    let actor = await Actor.find({name:actor_name})
    if(actor){
        console.log(actor)
   // parsing actor details
   let name = actor[0].name;
   let bio = actor[0].bio;
   let about = actor[0].phy_attributes;
   let trivia = actor[0].trivia;
   // parsing images in write format:
   let raw_images = actor[0].images;
   let processed_img =[]
   
   raw_images.forEach(img=>{
  processed_img.push({'name':Object.keys(img)[0],
  'large':img[Object.keys(img)].large,
  'small':img[Object.keys(img)].small
})
   })
   let image = processed_img[0].large
   // parsing family
   let raw_fam  = actor[0].family;
   let processed_fam = []
   raw_fam.forEach(fam=>{
     let key = fam[0].trim().replace('\n','')
     let val = fam[1]
     processed_fam.push({'key':key,'val':val});
   })
         //finding all the movies and shows of the actor
    let actor_movies = await movies.find({'casts.actor_name':{$in:[actor_name]}})
    let actor_shows = await shows.find({'casts.actor_name':{$in:[actor_name]}})
    //images ke liye dubara script run karni pdegi
    res.render('actor.ejs',{
        validated:req.session.isloggedIn,
        record:true,
        actor_movies:actor_movies,
        actor_shows:actor_shows,
        name:name,
        description:bio,
        trivia:trivia,
        about:about,
        images:processed_img,
        family:processed_fam,
        dp:image
    })
    }
    else{
          res.render('actor.ejs',{
        validated:req.session.isloggedIn,
        record:false,
        actor:'',
        actor_movies:[],
        actor_shows:[],
        name:'',
        description:'',
        trvia:'',
        about:'',
        family:[],
        images:[],
        dp:''

})
    }
    }
    catch(err){
        console.log(err)
        res.render('actor.ejs',{
            validated:req.session.isloggedIn,
            record:false,
            actor:'',
            actor_movies:[],
            actor_shows:[],
            name:'',
            description:'',
            trvia:'',
            about:'',
            family:[],
            images:[],
            dp:''
    
    })
    }
  
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