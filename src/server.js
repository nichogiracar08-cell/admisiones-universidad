require('dotenv').config();
const app = require('./app');
const conectarDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const iniciar = async (uri) => {
  await conectarDB(uri);
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 API en http://localhost:${PORT}/api`);
  });
};

if (require.main === module) iniciar();

module.exports = iniciar;
