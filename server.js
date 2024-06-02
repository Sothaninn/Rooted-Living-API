const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser') ;
const app = express();

const cors = require('cors') ;

//connect to the database
connectDB();

// middleware to parse JSON bodies
app.use(express.json());

// Use cookie parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

//define the routes
app.use('/users',require('./routes/users'));
app.use('/auth',require('./routes/auth'));
app.use('/products',require('./routes/products'));
app.use('/cart',require('./routes/cart'));
app.use('/payment',require('./routes/payment'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));




