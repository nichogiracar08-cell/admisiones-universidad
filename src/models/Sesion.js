const { Schema, model } = require('mongoose');

// Cada inicio de sesión queda registrado aquí. El token JWT solo es válido
// mientras su sesión esté activa (así el logout invalida el token de verdad).
const sesionSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tokenId: { type: String, required: true, unique: true }, // "jti" del JWT
    ip: { type: String },
    navegador: { type: String },
    activa: { type: Boolean, default: true },
    expiraEn: { type: Date, required: true },
    cerradaEn: { type: Date },
  },
  { timestamps: true }
);

module.exports = model('Sesion', sesionSchema, 'sesiones');
