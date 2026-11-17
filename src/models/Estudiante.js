const { Schema, model } = require('mongoose');

const estudianteSchema = new Schema(
  {
    tipoDocumento: {
      type: String,
      enum: ['CC', 'TI', 'CE', 'Pasaporte'],
      default: 'CC',
    },
    documento: {
      type: String,
      required: [true, 'El documento es obligatorio'],
      unique: true,
      trim: true,
    },
    nombres: { type: String, required: [true, 'Los nombres son obligatorios'], trim: true },
    apellidos: { type: String, required: [true, 'Los apellidos son obligatorios'], trim: true },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    telefono: { type: String, trim: true },
    fechaNacimiento: { type: Date },
    colegio: { type: String, trim: true },
    puntajeIcfes: { type: Number, min: 0, max: 500 },
    programa: {
      type: Schema.Types.ObjectId,
      ref: 'Programa',
      required: [true, 'Debe seleccionar un programa'],
    },
    estadoAdmision: {
      type: String,
      enum: ['Inscrito', 'En revisión', 'Admitido', 'Rechazado'],
      default: 'Inscrito',
    },
  },
  { timestamps: true }
);

module.exports = model('Estudiante', estudianteSchema);
