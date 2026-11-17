// Arranca el servidor con una MongoDB en memoria (no necesita tener MongoDB instalado).
// Los datos se pierden al cerrar. Útil para probar rápido: npm run dev:memoria
const { MongoMemoryServer } = require('mongodb-memory-server');
const iniciar = require('./server');
const sembrar = require('./seed');

(async () => {
  const mongo = await MongoMemoryServer.create();
  await iniciar(mongo.getUri('admisiones_universidad'));
  await sembrar();
})();
