const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const {check, validationResult} = require('express-validator');
const auth = require('../middleware/auth');

const User = require('../models/User');

//get logged in user without password
router.get('/', async (req,res)=>{
    try{
        const user = await User.findById(req.query.userId).select('-password');
        res.status(200).json({user: user});
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//login: authenticate user and get token
router.post('/',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Password is required').not().isEmpty()
    ],
    async (req, res) => {
        console.log(req.body)
        const errors= validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const {email, password} = req.body;

        try{
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({msg:'The Email is invalid'})
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json({msg:'The Password is invalid'});
            }

            // const payload = {
            //     user:
            //     {
            //         id:user._id
            //     }
            // };

            // const token = jwt.sign(payload, jwtSecret);
            // console.log(token);
            // //just storing it in cookies for testing purpose
            // res.cookie('token', token, { httpOnly: true });
            // res.json({user});
            res.status(201).json({user: user});

        } catch(err){
            console.error(err.message);
            res.status(500).send('server error');
        }
    }
)

//LOGOUT
router.post('/logout', (req, res) => {
    //res.clearCookie('token');
    res.json({ message: 'Logout successful' });
});


module.exports = router;