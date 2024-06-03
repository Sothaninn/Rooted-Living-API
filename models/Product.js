const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    picture:{
        type:String,
    },    
    price:{
        type:Number,
        required:true,
        min: 0
    },    
    description:{
        type:String,

    },    
    quantity:{
        type:Number,
        required:true,
        min: 0
    },
    type:{
        type:String,
        enum:['tool', 'plant', 'seed', 'planter'],
    },
});

module.exports = mongoose.model('product', ProductSchema);