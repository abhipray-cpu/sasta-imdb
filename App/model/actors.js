const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const actorsSchema = new Schema({
    name:{
       type: String,
        require:true,
        
    },
    physical:{
        born:{
            type:String
        },
        birthName:{
            type:String
        },
        nickName:{
            type:String
        }
    },
    bio:{
        type:String,
 },
 family:{
    type:Array
 },
 trivia:{
    type:Array
 },
//this will be an array of objects in the format:  key:{smallImg:val,largeImg:val}
 images:{
    type:Array
 },
 rank:{
    type:Number
 },
// need to add reference to movies collection here
})

module.exports = mongoose.model('Actors',actorsSchema)