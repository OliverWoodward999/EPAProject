// models/Downtime.js
import { DataTypes } from 'sequelize';
import { sequelize } from './user.js'; // Adjust the import if your Sequelize instance is elsewhere

const Downtime = sequelize.define('Downtime', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clockIn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clockOut: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default Downtime;