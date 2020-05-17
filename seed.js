const mongoose = require('mongoose');
const productModel = require("./models/product");


console.log('seeding database');

mongoose.connection.dropCollection('users',(err)=>{

  if (err){
    console.error(err.message);
    console.log('^^^ users collection couldnt be dropped')
  }
  else{
    console.log('users collection was dropped');
  }

});

mongoose.connection.dropCollection('products',(err)=>{

    if (err){
        console.error(err.message);
        console.log("^^^ products collection couldn't be dropped")
    }
    else{
      console.log('products collection was dropped!')
    }

    productModel.insertMany(
        [
          {
            name: "Camera Sticker",
            price: 15,
            description: "Camera sticker looks good!",
            img: "https://image.flaticon.com/icons/svg/2885/2885534.svg",
          },
          {
            name:"Flower Sticker",
            price: 20,
            description: "Flowers are awesome!",
            img: "https://image.flaticon.com/icons/svg/2926/2926413.svg" 
          },
          {
            name:"Scroll Sticker",
            price: 20,
            description: "Egyptian scroll!",
            img: "https://image.flaticon.com/icons/svg/119/119458.svg" 
          },
          {
            name:"Ninja Sticker",
            price: 25,
            description: "flowers are awesome!",
            img: "https://image.flaticon.com/icons/svg/435/435061.svg" 
          },
          {
            name:"Dracula Sticker",
            price: 30,
            description: "Vampires!",
            img: "https://image.flaticon.com/icons/svg/435/435036.svg" 
          },
          {
            name:"Pirate Sticker",
            price: 20,
            description: "Arghh!",
            img: "https://image.flaticon.com/icons/svg/435/435025.svg" 
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



