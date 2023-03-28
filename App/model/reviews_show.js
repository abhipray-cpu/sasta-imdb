const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reviewSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    show:{
        type:Schema.Types.ObjectId,
        ref:'Shows'
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
module.exports = mongoose.model('Shows_review',reviewSchema)