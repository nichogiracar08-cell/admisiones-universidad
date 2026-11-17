const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener mínimo 6 caracteres'],
      select: false, // nunca se devuelve en las consultas
    },
    rol: { type: String, enum: ['admin', 'asesor'], default: 'asesor' },
    activo: { type: Boolean, default: true },
    ultimoAcceso: { type: Date },
  },
  { timestamps: true }
);

// Encripta la contraseña antes de guardar
usuarioSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

usuarioSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = model('Usuario', usuarioSchema);
