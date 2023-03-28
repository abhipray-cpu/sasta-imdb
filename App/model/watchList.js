const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const watchlistSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        require:true,
        unique:true
    },
    movieCount:{
        type:Number,
        default:0
    },
    showsCount:{
        type:Number,
        default:0
    },
    movies:[{
        type:Schema.Types.ObjectId,
        ref:'Movies',
    }],
    shows:[{
        type:Schema.Types.ObjectId,
        ref:'Shows',
    }],
})

module.exports = mongoose.model('WatchList',watchlistSchema)