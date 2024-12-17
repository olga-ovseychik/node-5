'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Manager extends Model {

    static associate(models) {
      Manager.hasMany(models.Movie, {
        foreignKey: 'userId',  
        onDelete: 'CASCADE'
      });
    }
  }
  Manager.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    super: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Manager',
  });
  return Manager;
};