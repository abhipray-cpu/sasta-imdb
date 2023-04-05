const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const showSchema = new Schema({
  title:{
    type:String,
    require:true,
  },
  images:{
    type:Array
  },
  description:{
    type:String
  },
  season:{
    type:Number
  },
  category:{
    type:Array
  },
  casts:{
    type:Array
  },
  likeCount:{
    type:Number
  },
  episodes:{
    type:Object
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
  ratings:{
    type:Number
  }
})

module.exports = mongoose.model('Shows',showSchema)

