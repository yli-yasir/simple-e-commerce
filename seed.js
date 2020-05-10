const mongoose = require('mongoose');
const productModel = require("./models/product");


console.log('seeding database');

mongoose.connection.dropCollection('products',(err)=>{
    if (err){
        console.error(err.message);
        return;
    }

    console.log('dropped the products collection!') 

    productModel.insertMany(
        [
          {
            name: "camera sticker",
            price: 15,
            description: "camera sticker looks good",
            img: "https://image.flaticon.com/icons/svg/2885/2885534.svg",
          }
        ],
        (err) => {
            if (err){
                console.error(err.message);
                return;
            }
            console.log('done inserting products!')
        }
      );

})



