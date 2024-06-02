const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

//add a product to cart
router.post('/', async (req, res) => {
    try{
        

        
        const {userId, productId, quantity} = req.body;
        //check if the product exists in the database
        const product = await Product.findById(productId);
        if (!product){
            return res.status(404).json({message:'Product not found'});
        }

        const user = await User.findById(userId);
        console.log(user);
        //check if the product is already in the cart
        const inCart = user.shoppingCart.find(item => item.product.toString() === productId);
        if (inCart){
            inCart.quantity += quantity;
        }
        else{
            //add to user's cart
            user.shoppingCart.push({product: productId, quantity});
        }
        await user.save();
        res.status(201).json({message: 'Product added to shopping cart'});

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//Get all products from cart
router.get('/', async (req, res) => {
    try{
        console.log(req.query.userId);
        const user = await User.findById(req.query.userId);
        res.status(200).json({ cart: user.shoppingCart });        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//change the product quantity
router.put('/:id', async (req, res)=>{
    try{
        const user = await User.findById(req.body.userId);
        const productInCart = user.shoppingCart.find(item => item.product.toString() === req.params.id);

        if (!productInCart) {
            return res.status(404).json({ message: 'Product not found in the shopping cart' });
        }

        productInCart.quantity=req.body.quantity;

        await user.save();
        res.status(200).json({message:'Updated the quantity of the product in the shopping cart'});        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//remove a product from cart
router.delete('/:id', async (req, res) => {
    try{
        const user = await User.findById(req.body.userId);

        //filter out the product from cart
        user.shoppingCart = user.shoppingCart.filter(item => item.product.toString() !== req.params.id)
        
        await user.save();
        res.status(200).json({message:'Product removed from shopping cart', cart: user.shoppingCart});        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//remove all products from cart
router.delete('/', async (req, res) => {
    try{
        const user = await User.findById(req.body.userId);

        //filter out the product from cart
        user.shoppingCart = [];
        
        await user.save();
        res.json({message:'All products removed from shopping cart'});        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

module.exports = router;