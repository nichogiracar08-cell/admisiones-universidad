const { Schema, model } = require('mongoose');

const programaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del programa es obligatorio'],
      trim: true,
    },
    codigo: {
      type: String,
      required: [true, 'El código es obligatorio'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    facultad: {
      type: Schema.Types.ObjectId,
      ref: 'Facultad',
      required: [true, 'El programa debe pertenecer a una facultad'],
    },
    nivel: {
      type: String,
      enum: ['Pregrado', 'Especialización', 'Maestría', 'Doctorado'],
      default: 'Pregrado',
    },
    modalidad: {
      type: String,
      enum: ['Presencial', 'Virtual', 'Híbrida'],
      default: 'Presencial',
    },
    duracionSemestres: { type: Number, min: 1, default: 10 },
    cupos: { type: Number, min: 0, default: 40 },
    valorSemestre: { type: Number, min: 0, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Programa', programaSchema);
