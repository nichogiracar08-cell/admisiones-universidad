require('dotenv').config();
require('./config/dns');
const mongoose = require('mongoose');
const Facultad = require('./models/Facultad');
const Programa = require('./models/Programa');
const Estudiante = require('./models/Estudiante');
const Usuario = require('./models/Usuario');
const Sesion = require('./models/Sesion');

// Carga datos de ejemplo. Se puede ejecutar solo (npm run seed) o desde memoria.js
const sembrar = async () => {
  await Promise.all([
    Estudiante.deleteMany(),
    Programa.deleteMany(),
    Facultad.deleteMany(),
    Usuario.deleteMany(),
    Sesion.deleteMany(),
  ]);

  // Usuarios para iniciar sesión (create() dispara el hash de la contraseña)
  await Usuario.create([
    { nombre: 'Administrador', email: 'admin@universidad.edu', password: 'Admin123*', rol: 'admin' },
    { nombre: 'Asesor de Admisiones', email: 'asesor@universidad.edu', password: 'Asesor123*', rol: 'asesor' },
  ]);

  const [ing, salud, eco] = await Facultad.create([
    { nombre: 'Facultad de Ingeniería', codigo: 'ING', decano: 'Dra. Laura Gómez', descripcion: 'Ingenierías y tecnología' },
    { nombre: 'Facultad de Ciencias de la Salud', codigo: 'SAL', decano: 'Dr. Andrés Restrepo', descripcion: 'Medicina, enfermería y afines' },
    { nombre: 'Facultad de Ciencias Económicas', codigo: 'ECO', decano: 'Mg. Carolina Ruiz', descripcion: 'Administración, economía y contaduría' },
  ]);

  const programas = await Programa.create([
    { nombre: 'Ingeniería de Sistemas', codigo: 'ING-SIS', facultad: ing._id, duracionSemestres: 10, cupos: 60, valorSemestre: 5200000 },
    { nombre: 'Ingeniería Civil', codigo: 'ING-CIV', facultad: ing._id, duracionSemestres: 10, cupos: 40, valorSemestre: 5400000 },
    { nombre: 'Medicina', codigo: 'SAL-MED', facultad: salud._id, duracionSemestres: 12, cupos: 30, valorSemestre: 12500000 },
    { nombre: 'Enfermería', codigo: 'SAL-ENF', facultad: salud._id, duracionSemestres: 8, cupos: 45, valorSemestre: 4800000 },
    { nombre: 'Administración de Empresas', codigo: 'ECO-ADM', facultad: eco._id, modalidad: 'Híbrida', duracionSemestres: 9, cupos: 70, valorSemestre: 4300000 },
    { nombre: 'Maestría en Analítica de Datos', codigo: 'ING-MAD', facultad: ing._id, nivel: 'Maestría', modalidad: 'Virtual', duracionSemestres: 4, cupos: 25, valorSemestre: 9800000 },
  ]);

  await Estudiante.create([
    { documento: '1001234567', nombres: 'Valentina', apellidos: 'Martínez', email: 'valentina@correo.com', telefono: '3001112233', puntajeIcfes: 385, colegio: 'Colegio San José', programa: programas[0]._id, estadoAdmision: 'Admitido' },
    { documento: '1009876543', nombres: 'Santiago', apellidos: 'López', email: 'santiago@correo.com', telefono: '3014445566', puntajeIcfes: 342, colegio: 'IE La Esperanza', programa: programas[2]._id, estadoAdmision: 'En revisión' },
    { documento: '1005556677', nombres: 'Mariana', apellidos: 'Rodríguez', email: 'mariana@correo.com', puntajeIcfes: 298, programa: programas[4]._id },
  ]);

  console.log('🌱 Datos de ejemplo cargados: 2 usuarios, 3 facultades, 6 programas, 3 estudiantes');
  console.log('   🔑 admin@universidad.edu / Admin123*   |   asesor@universidad.edu / Asesor123*');
};

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(sembrar)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error('❌ Error en seed:', err.message);
      process.exit(1);
    });
}

module.exports = sembrar;
