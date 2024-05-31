const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

//Add a new product
router.post('/', [auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('quantity', 'quantity is required').not().isEmpty(),
    check('type', 'type is required').not().isEmpty(),
    check('quantity', 'quantity needs to be of type Int and minumum 0').isInt({ min: 0 }),
    check('type', 'type needs to be one of our Enums').isIn(['tool', 'plant', 'seed', 'planter'])
]], async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ err: errors.array() });
    }

    const {name, price, description, quantity, type} = req.body;
    try{
        //check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin'){
            return res.status(403).json ({message:'Permission denied.'});
        }

        const newProduct = new Product({
            name,
            price,
            description,
            quantity,
            type
        });

        await newProduct.save();
        res.json(newProduct);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//Get all products *doesnt require auth*
router.get('/', async (req, res)=> {
    try{
        const products = await Product.find();
        res.json(products);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// Search: Get a product by name (case insensitive)
router.get('/search', async (req, res) => {
    const { query } = req.query;

    try {
        // Using regular expression to perform case-insensitive search
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // Search by name
                { description: { $regex: query, $options: 'i' } } // Search by description
            ]
        });

        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//Get a specific product by id *doesnt require auth*
router.get('/:id', async (req, res)=>{
    try{
        const product = await Product.findById(req.params.id)
        if(!product){
            return res.status(404).json({message:'Product not found'});
        }
        res.json(product);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//Get products by type *doesn't require auth*
router.get('/type/:type', async (req, res)=> {
    const type = req.params.type;
    try{
        if(!['tool', 'plant', 'seed', 'planter'].includes(type)){
            return res.status(400).json({message:'Invalid Product Type.'})
        }
        const products = await Product.find({type});
        res.json(products);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


//Update a product by id
router.put('/:id', auth, async (req, res) =>{
    const {name, price, description, quantity, type} = req.body;
    try{
        //check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin'){
            return res.status(403).json ({message:'Permission denied.'});
        }

        let product = await Product.findById(req.params.id);
        if(!product){
            res.status(404).json({message:'Product not found'});
        }

        if (name) product.name = name;
        if (price && price>=0) product.price = price;
        if (description) product.description = description;
        if (quantity && quantity>=0) product.quantity = quantity;
        if (type && ['tool', 'plant', 'seed', 'planter'].includes(type)) product.type = type;

        await product.save();

        res.json(product);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

// delete a product by id
router.delete('/:id', auth, async (req, res)=>{
    try{
        //check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin'){
            return res.status(403).json ({message:'Permission denied.'});
        }

        let product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }

        res.json({message: 'Product has been successfully removed'});
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});


module.exports = router;