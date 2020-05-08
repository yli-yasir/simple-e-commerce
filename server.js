const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();


mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(()=>{console.log('Connected to MongoDB!')})
.catch(()=>{console.error('MongoDB connection error!')});


app.get('/',(req,res,next)=>{
    res.send('hi')
});

app.listen(process.env.PORT,()=>{console.log('listening')});