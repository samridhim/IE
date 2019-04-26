var mongoose = require('mongoose');


//genre schema

var tempratureSchema = mongoose.Schema({
    ts:{
        type:Date,
        required:true
    },
    val:{
        type:Number,
        required:true
    }
});
var Temprature = module.exports = mongoose.model('Temprature', tempratureSchema);

module.exports.addTemprature = function(temp, callback){
    Temprature.create(temp, callback)
}
