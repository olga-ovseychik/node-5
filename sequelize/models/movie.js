'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {

    static associate(models) {
      Movie.belongsTo(models.Manager, {
        foreignKey: 'userId',  
        onDelete: 'CASCADE'    
      });
    }
  }
  Movie.init({
    title: DataTypes.STRING,
    rating: DataTypes.STRING,
    year: DataTypes.INTEGER,
    budget: DataTypes.INTEGER,
    gross: DataTypes.INTEGER,
    poster: DataTypes.STRING,
    position: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Movie',
  });
  return Movie;
};