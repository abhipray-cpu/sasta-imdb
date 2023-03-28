const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    // this will refer to the genres user is interested in
    interests:{
        type:Array
    },
    email:{
        type:String,
        require:true
    },
    contact:{
        type:String,
        require:true
    },
    ratings:{
        type:Number
    }

})

module.exports = mongoose.model('Users',userSchema);