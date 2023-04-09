const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reviewSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'Users'
    },
    movie:{
        type:String,
        require:true
    },
    catg:{
        type:'String',
        enum:['movie','show']
    },
    rating:{
        type:Number,
        require:true
    },
    content:{
        type:String,
        require:true
    }
})
module.exports = mongoose.model('Movie_review',reviewSchema)