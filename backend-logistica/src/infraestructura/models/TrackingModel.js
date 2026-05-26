const mongoose = require('mongoose');

const TrackingSchema = new mongoose.Schema({
  id_orden: Number,

  ubicacion: String,

  origen: {
    type: String,
    default: 'Shanghai'
  },

  destino: {
    type: String,
    default: 'Guayaquil'
  },

  tipo_transporte: {
    type: String,
    enum: ['Marítimo', 'Aéreo', 'Terrestre'],
    default: 'Marítimo'
  },

  estado: String,

  fecha: {
    type: Date,
    default: Date.now
  },

  latitud: Number,

  longitud: Number,

  riesgo: String,

  observacion: String
});

module.exports = mongoose.model(
  'Tracking',
  TrackingSchema
);