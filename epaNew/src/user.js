// models/User.js
import { Sequelize, DataTypes, Model } from 'sequelize';

// Initialize Sequelize to use SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

class User extends Model {}

User.init({
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'User',
});

// Export the Sequelize instance and the User model
export { sequelize, User };