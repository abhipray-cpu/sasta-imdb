const mongoose = require('mongoose')

const Schema = mongoose.Schema

const moviesSchema = new Schema({
    title:{
      type:String,
      require:true,
      unique:true
    },
    images:{
        type:Array
    },
    description:{
        type:String
    },
    casts:{
        type:Array
    },
    likeCount:{
        type:Number
    },
    movieListCount:{
        type:Number
    },
    viewCount:{
        type:Number
    },
    rank:{
        type:Number
    },
    category:{
        type:Array// have to add these
    },
    ratings:{
        type:Number
    }
})

module.exports = mongoose.model('Movies',moviesSchema)