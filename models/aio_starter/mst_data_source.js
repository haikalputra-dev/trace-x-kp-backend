const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('mst_data_source', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    database: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    query: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    ring: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    data_item: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    line: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    adjust_time: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    range: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type_data: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

  }, {
    sequelize,
    tableName: 'mst_data_source',
    timestamps: false,
    indexes: [{
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [{
        name: "id"
      }, ]
    }, ]
  });
};