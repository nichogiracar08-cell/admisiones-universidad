require('./dns');
const mongoose = require('mongoose');

const conectarDB = async (uri = process.env.MONGO_URI) => {
  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;
