const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('mst_standard', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    data_item: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    min: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    max: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    product_category: {
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
    }

  }, {
    sequelize,
    tableName: 'mst_standard',
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