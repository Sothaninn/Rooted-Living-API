const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

//add a product to cart
router.post('/', async (req, res) => {
    try{
        const user = await User.findById(req.user.id);

        //check if the product exists in the database
        const {productId, quantity} = req.body;
        const product = await Product.findById(productId);
        if (!product){
            return res.status(404).json({message:'Product not found'});
        }
          // Log the value of productId to debug
          console.log('productId:', productId);
            // Log the value of productId to debug
        console.log('user.shoppingCart:', user.shoppingCart);

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
        res.json({message: 'Product added to shopping cart'});

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//Get all products from cart
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id);
        res.json(user.shoppingCart);        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//change the product quantity
router.put('/:id', auth, async (req, res)=>{
    try{
        const user = await User.findById(req.user.id);
        const productInCart = user.shoppingCart.find(item => item.product.toString() === req.params.id);

        if (!productInCart) {
            return res.status(404).json({ message: 'Product not found in the shopping cart' });
        }

        productInCart.quantity=req.body.quantity;

        await user.save();
        res.json({message:'Updated the quantity of the product in the shopping cart'});        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//remove a product from cart
router.delete('/:id', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id);

        //filter out the product from cart
        user.shoppingCart = user.shoppingCart.filter(item => item.product.toString() !== req.params.id)
        
        await user.save();
        res.json({message:'Product removed from shopping cart'});        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//remove all products from cart
router.delete('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id);

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