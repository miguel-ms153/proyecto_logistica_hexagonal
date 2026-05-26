const mongoose =
require('mongoose');

const conectarMongo =
async () => {

  try {

    await mongoose.connect(

      process.env.MONGO_URI

    );

    console.log(
      'MongoDB conectado'
    );

  } catch (error) {

    console.log(error);

  }

};

module.exports =
conectarMongo;