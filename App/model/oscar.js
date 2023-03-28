const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const oscarSchema = new Schema({
     movie:{
        type:Schema.Types.ObjectId,
        ref:"Movies"
     },
     nominations:{
        type:Array
     },
     won:{
        type:Array
     }
})

module.exports = mongoose.model('Oscars',oscarSchema)