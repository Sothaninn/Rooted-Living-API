const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

module.exports = function(req, res, next){
    // //get token from header
    // const token = req.header('x-auth-token');
    
    //just storing it in cookies for now
    const token = req.cookies.token;
    
    //check token
    if(!token){
        return res.status(401).json({msg: 'No token, authentication denied :('})
    }

    //verify token
    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded.user;

        //next() passes control to the next middleware function or route handler in the Express application.
        next();
    } catch (err){
        res.status(401).json({msg: 'Token is not valid'})
    }
};