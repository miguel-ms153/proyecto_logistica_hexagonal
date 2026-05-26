const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const Embarque = sequelize.define(
  'embarque',
  {
    id_embarque: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    origen: {
      type: DataTypes.STRING
    },

    destino: {
      type: DataTypes.STRING
    },

    estado: {
      type: DataTypes.STRING
    },

    id_orden: {
      type: DataTypes.INTEGER
    }
  },
  {
    timestamps: false
  }
);

module.exports = Embarque;