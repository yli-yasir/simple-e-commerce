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
          },
          {
            name:"flower sticker",
            price: 20,
            description: "flowers are awesome!",
            img: "https://image.flaticon.com/icons/svg/2926/2926413.svg" 
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



