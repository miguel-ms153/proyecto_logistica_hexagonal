const { DataTypes } = require('sequelize');
const sequelize = require('../database/mysql');

const ProductoModel = sequelize.define('Producto', {
  id_producto: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },

  precio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General'
  }
}, {
  tableName: 'producto',
  timestamps: false
});

module.exports = ProductoModel;