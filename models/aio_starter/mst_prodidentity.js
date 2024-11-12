const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('mst_prodidentity', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tgl: {
      type: DataTypes.DATE,
      allowNull: true
    },
    target: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lotno: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    line: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    prod_order: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    prod_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prod_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    product: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isActive: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cycle_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status_calculate: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    capacity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    setup_change_lot: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    lost_time: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    produk: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    batch_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    kode_produk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    order: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'mst_prodidentity',
    timestamps: false,
    indexes: [{
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [{
        name: "id"
      }]
    }]
  });
};