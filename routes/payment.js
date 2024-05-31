const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// pay for the products in cart
router.post('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id);

        for (const item of user.shoppingCart){
            //check if the product exists in the database
            const product = await Product.findById(item.product);
            if (!product || product.quantity<item.quantity){
                return res.status(400).json({message:'Inssufficient quantity for product: ' + product.name});
            }
            //reduce the item in database
            product.quantity -= item.quantity;
            await product.save();
        }

        //Clear the users cart
        user.shoppingCart = [];
        await user.save();
        
        res.json({message:'Payment successful'});
        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
})

module.exports = router;