const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema(
    {
        username: String, 
        email: String,
        password: String,
        cart: [{ type: ObjectId, ref: 'product' }]
    }
);


module.exports = mongoose.model('user',userSchema);
