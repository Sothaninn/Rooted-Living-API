const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    address:{
        type:String
    },
    number:{
        type:String
    },
    role:{
        type:String,
        required:true,
        enum: ['admin', 'user'],
        default: 'user'
    },
    shoppingCart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 0,
                min: 0
            }
        }
    ]
});

module.exports = mongoose.model('user', UserSchema);