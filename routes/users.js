const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const {check, validationResult} = require('express-validator');
const auth = require('../middleware/auth');

const User = require('../models/User');

//generates a salt, which is a random string added to the password 
//before hashing to ensure that even if two users have the same password, 
//their hashed passwords will be different.

// Register a user and login
router.post(
    '/',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Email is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('email', 'Please enter a password with 6 or more characters').isLength({min:6}),
        check('role', 'Role is required').not().isEmpty(),
        check('role', 'Invalid role').isIn(['admin', 'user']),
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors:errors.array() });
        }

        const { username, email, password, address, number, role } = req.body;
        try{
            //check if email exists
            let user = await User.findOne({email});
            if (user){
                return res.status(400).json({errors: [{msg: 'User already exists'}] });
            }

            //create a new user
            user = new User({
                username, 
                email,
                password,
                role,
                address,
                number,
                shoppingCart:[]
            });

            user.password = await bcrypt.hash(password, 10);

            await user.save();

            // //create a payload that contains the user id, encrypt it with the secret key to generate a token
            // const payload = {
            //     user:{
            //         id:user._id
            //     }
            // };
            
            // const token = jwt.sign(payload, jwtSecret);
            // console.log(token);
            // //just storing it in cookies for testing purpose
            // res.cookie('token', token, { httpOnly: true });
            // res.json({token});

            // // jwt.sign(payload, jwtSecret , (err, token) => {
            // //     if (err) throw err;
            // //     res.json({token});
            // // });

            res.json({user, message:"Account has been successfully created!"})

        }catch (err){
            console.error(err);
            res.status(500).send('Server error')
        }

    }
);

//update user profile
router.put('/', async (req, res)=>{
    const {userId, username, email, password, address, number} = req.body;   
    //try to find the current user and update
    try{
        let user = await User.findById(userId);

        //update
        if (username) user.username = username;
        if (email) {
            //check if email exists
            let user = await User.findOne({email});
            if (!user){
                user.email = email;
            }
        }
        if (password) user.password = await bcrypt.hash(password, 10);
        if (address) user.address = address;
        if (number) user.number = number;

        await user.save();

        // Convert user document to object and exclude the password field
        let updatedUser = user.toObject();
        delete updatedUser.password;

        return res.status(200).json({ user: updatedUser });
        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;