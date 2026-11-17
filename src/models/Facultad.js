const { Schema, model } = require('mongoose');

const facultadSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la facultad es obligatorio'],
      unique: true,
      trim: true,
    },
    codigo: {
      type: String,
      required: [true, 'El código es obligatorio'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    decano: { type: String, trim: true },
    descripcion: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Relación virtual: programas que pertenecen a esta facultad
facultadSchema.virtual('programas', {
  ref: 'Programa',
  localField: '_id',
  foreignField: 'facultad',
});

module.exports = model('Facultad', facultadSchema);
