const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('mst_cleaning_sanitation', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    line_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    detail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    url_pdf: {
      type: DataTypes.TEXT,
      allowNull: true
    },

  }, {
    sequelize,
    tableName: 'mst_cleaning_sanitation',
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