var models = require("../../config/sequelizeORM");
var sequelizeQuery = require("../../config/sequelizeQuery");
var api = require("../../tools/common");
const {
  Op
} = require("sequelize");
const {
  Client,
  Pool
} = require("pg");
let client;
let pool;
var Sequelize = require("sequelize");
const axios = require("axios");
const {
  query
} = require("express");

const formatIjp = (timeStr, max) => {
  const h = Number(timeStr.slice(0, 2));
  const m = Number(timeStr.slice(2));
  if (h >= 24 || m >= 60 || isNaN(h) || isNaN(m)) return "00:00";
  const totalMinutes = h * 60 + m + max;
  if (totalMinutes < 0) return "00:00";
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};


function createSequelizeInstance(config) {
  return new Sequelize(config.name, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    dialectOptions: {
      multipleStatements: true // Enable cross-database queries
    }
  });
}

async function executeQueryWithDynamicConfig(config, query) {
  const sequelize = createSequelizeInstance(config);
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return results;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

const getDataEfficiency = async (req, res) => {
  try {
    const {
      lotno,
      pro_order,
      line,
      tag
    } = req.body;

    const data = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT a.*, b.line_code FROM mst_data_source a 
         LEFT JOIN mst_line b ON a.line = b.id 
         WHERE b.line_code = :line AND a.data_item = :tag`, {
      replacements: {
        line,
        tag,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (data.length === 0) {
      return api.error(res, "Record not found", 200);
    }

    const database = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT * FROM mst_database WHERE id = :databaseId`, {
      replacements: {
        databaseId: data[0].database,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (database.length === 0) {
      return api.error(res, "Database configuration not found", 200);
    }
    // Asumsikan data[0].query memiliki placeholder untuk lotno dan pro_order
    const modifiedQuery = data[0].query
      .replace(/:lotno/g, `'${lotno}'`)
      .replace(/:pro_order/g, `'${pro_order}'`);

    const result = await executeQueryWithDynamicConfig(
      database[0],
      modifiedQuery
    );

    // Ubah format data
    const formattedResult = result.reduce((acc, item) => {
      acc[item.Item] = item.Value;
      return acc;
    }, {});

    api.ok(res, [formattedResult]);
  } catch (e) {
    api.error(res, e, 500);
  }
};


async function getDataSourceAndDatabase(line, tag, ring, type_data) {
  const datasource = await sequelizeQuery.sequelizeTraceXProject.query(
    `SELECT a.*, b.line_code 
     FROM mst_data_source a 
     LEFT JOIN mst_line b ON a.line = b.id 
     WHERE b.line_code = :line AND a.data_item = :tag AND a.ring = :ring AND a.type_data = :type_data`, {
    replacements: { line, tag, ring, type_data },
    type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
  });

  if (!datasource.length) {
    throw new Error("Record not found");
  }

  const database = await sequelizeQuery.sequelizeTraceXProject.query(
    `SELECT * FROM mst_database WHERE id = :databaseId`, {
    replacements: { databaseId: datasource[0].database },
    type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
  });

  if (database.length === 0) {
    throw new Error("Database configuration not found");
  }

  return { datasource: datasource[0], database: database[0] };
}

const handleRequestError = (res, e) => {
  console.error(e);
  const status = e.message === "Record not found" || e.message === "Database configuration not found" ? 200 : 500;
  api.error(res, e.message || "Server Error", status);
};

const getLotnoBeforeAfter = async (line, tag, ring, lotno) => {
  try {
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, "Data");
    
    const query = datasource.query
      .replace(/:lotno/g, `'${lotno}'`)
    
    const data = await executeQueryWithDynamicConfig(database, query);
    const { lotno_before, lotno_after } = data[0];
    
    return `('${lotno_before}', '${lotno}', '${lotno_after}')`;
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Error fetching lot numbers");
  }
};

const handleIpcQualityData = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const lotnoString = await getLotnoBeforeAfter(line, 'ipcquality_lotnoBeforeAfter', ring, lotno);
    
    const query = datasource.query
      .replace(/:lotno/g, lotnoString); // Using global replace to handle multiple occurrences
    
    console.log("ini query", query);
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultIpcQualityTable = async (req, res) => {
  return handleIpcQualityData(req, res);
};

const getDataResultIpcQualityData = async (req, res) => {
  return handleIpcQualityData(req, res);
};

const getDataResultMicrobiologyTable = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const lotnoString = await getLotnoBeforeAfter(line, 'result_preform_check_lotnoBeforeAfter', ring, lotno);
    
    const query = datasource.query.replace(/:lotno/g, lotnoString);
    const data = await executeQueryWithDynamicConfig(database, query);
    
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const handleBottleDimensionData = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query.replace(/:lotno/g, `'${lotno}'`);
    console.log("ini query", query);
    const data = await executeQueryWithDynamicConfig(database, query);
    
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultBottleDimensionTable = async (req, res) => {
  return handleBottleDimensionData(req, res);
};

const getDataResultBottleDimensionChart = async (req, res) => {
  return handleBottleDimensionData(req, res);
};

const handleCappingPerformanceData = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query.replace(/:lotno/g, `'${lotno}'`);
    
    console.log("ini query", query);
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultCappingPerformanceTable = async (req, res) => {
  return handleCappingPerformanceData(req, res);
}

const getDataResultCappingPerformanceData = async (req, res) => {
  return handleCappingPerformanceData(req, res);
}

const handlePreformCheckData = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const lotnoString = await getLotnoBeforeAfter(line, 'result_preform_check_lotnoBeforeAfter', ring, lotno);
    
    const query = datasource.query.replace(/:lotno/g, lotnoString);
    const data = await executeQueryWithDynamicConfig(database, query);
    
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultPreformCheckTable = async (req, res) => {
  return handlePreformCheckData(req, res);
};

const getDataResultPreformCheckData = async (req, res) => {
  return handlePreformCheckData(req, res);
};

const getDataResultCCPChart = async (req, res) => {
  try {
    const {
      lotno,
      line,
      tag,
      ring,
      tanggal,
      ijp,
      type_data,
      data_atribut,
      min,
      max,
      product_category,
      prod_start,
      prod_end
    } = req.body;

    console.log(prod_start)
    console.log(prod_end)

    const datasource = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT a.*, b.line_code 
       FROM mst_data_source a 
       LEFT JOIN mst_line b ON a.line = b.id 
       WHERE b.line_code = :line AND a.data_item = :tag AND a.ring = :ring AND a.type_data = :type_data`, {
      replacements: {
        line,
        tag,
        ring,
        type_data,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (!datasource.length) {
      return api.error(res, "Record not found", 500);
    }
    const database = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT * FROM mst_database WHERE id = :databaseId`, {
      replacements: {
        databaseId: datasource[0].database,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (database.length === 0) {
      return api.error(res, "Database configuration not found", 500);
    }

    console.log(min);
    console.log(max);
    const standard = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT * FROM mst_standard WHERE data_item = :data_atribut`, {
      replacements: {
        data_atribut: datasource[0].data_item,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (standard.length === 0) {
      return api.error(res, "Eror standard tidak ditemukan", 500);
    }
    console.log(standard, "yey");
    console.log(data_atribut);
    console.log(product_category);
    let status;
    let dataStandard;
    if (standard.length > 1) {
      const filteredDataStandard = standard.find(
        (item) => item.product_category === product_category
      );
      console.log(filteredDataStandard);
      if (min < filteredDataStandard.min && max > filteredDataStandard.max) {
        status = "Not Comply";
      } else {
        status = "Comply";
      }
      dataStandard = {
        status: status,
        min: filteredDataStandard.min,
        max: filteredDataStandard.max,
        unit: filteredDataStandard.unit,
      };
    } else {
      if (standard[0].min < min && max < standard[0].max) {
        status = "Comply";
      } else {
        status = "Not Comply";
      }
      dataStandard = {
        status: status,
        min: standard[0].min,
        max: standard[0].max,
        unit: standard[0].unit,
      };
    }
    
    let ijp_start;
    let ijp_end;
    let start_time;
    let end_time
    if (ijp == "") {
      start_time = formatTime(prod_start)
      end_time = formatTime(prod_end)
    } else {
      ijp_start = formatIjp(ijp, datasource[0].range);
      ijp_end = formatIjp(ijp, datasource[0].range);
      start_time = `${tanggal} ${ijp_start}:00`;
      end_time = `${tanggal} ${ijp_end}:00`;
    }

    let query = datasource[0].query;
    query = query
      .replace(":data_item", `${data_atribut}`)
      .replace(":lotno", `'${lotno}'`)
      .replace(":start_time", `'${start_time}'`)
      .replace(":end_time", `'${end_time}'`);
    console.log({
      query
    });
    const dataTrend = await executeQueryWithDynamicConfig(database[0], query);

    console.log(dataTrend);
    if (dataTrend.length == 0) {
      return api.error(res, "Record Not Found", 200);
    }
    api.ok(res, {
      dataStandard,
      dataTrend,
    });
  } catch (e) {
    console.error(e);
    api.error(res, e.message || "Server Error", 500);
  }
};

const formatTime = (time) => {
  const date = new Date(time);
  const formattedDate = date.toISOString().split('T')[0];
  const formattedTime = date.toISOString().split('T')[1].split('.')[0];
  return `${formattedDate} ${formattedTime}`;
};

const getDataResultCCPTable = async (req, res) => {
  try {
    const {
      lotno,
      line,
      tag,
      ring,
      tanggal,
      ijp,
      type_data,
      prod_start,
      prod_end
    } = req.body;

    console.log(prod_start)
    console.log(prod_end)

    const datasource = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT a.*, b.line_code 
       FROM mst_data_source a 
       LEFT JOIN mst_line b ON a.line = b.id 
       WHERE b.line_code = :line AND a.data_item = :tag AND a.ring = :ring AND a.type_data = :type_data`, {
      replacements: {
        line,
        tag,
        ring,
        type_data,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (!datasource.length) {
      return api.error(res, "Record not found", 200);
    }
    const database = await sequelizeQuery.sequelizeTraceXProject.query(
      `SELECT * FROM mst_database WHERE id = :databaseId`, {
      replacements: {
        databaseId: datasource[0].database,
      },
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
    }
    );

    if (database.length === 0) {
      return api.error(res, "Database configuration not found", 200);
    }

    let ijp_start;
    let ijp_end;
    let start_time;
    let end_time
    if (ijp == "") {
      start_time = formatTime(prod_start)
      end_time = formatTime(prod_end)
      console.log(start_time, "ok");
      console.log(end_time, "ok");
    } else {
      ijp_start = formatIjp(ijp, datasource[0].range);
      ijp_end = formatIjp(ijp, datasource[0].range);
      start_time = `${tanggal} ${ijp_start}:00`;
      end_time = `${tanggal} ${ijp_end}:00`;
      console.log(ijp);
      console.log(ijp_start);
      console.log(ijp_end, "ok");
      console.log(start_time, "ok");
      console.log(end_time, "ok");
    }

    let query = datasource[0].query;
    query = query
      .replace(":lotno", `'${lotno}'`)
      .replace(":start_time", `'${start_time}'`)
      .replace(":end_time", `'${end_time}'`);

    console.log("ini query", query)

    const data = await executeQueryWithDynamicConfig(database[0], query);
    api.ok(res, data);
  } catch (e) {
    console.error(e);
    api.error(res, e.message || "Server Error", 500);
  }
};

const handlePreparationSyrup = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const lotnoString = await getLotnoBeforeAfter(line, 'ipcquality_lotnoBeforeAfter', ring, lotno);
    
    const query = datasource.query
      .replace(/:lotno/g, lotnoString); // Using global replace to handle multiple occurrences
    
    console.log("ini query", query);
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultPreparationSyrupTable = async (req, res) => {
  return handlePreparationSyrup(req, res);
}

const getDataResultPreparationSyrupData = async (req, res) => {
  return handlePreparationSyrup(req, res);
}

const handleAbnormallyData = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query.replace(":lotno", `'${lotno}'`);
    console.log("ini query", query);
    const data = await executeQueryWithDynamicConfig(database, query);
    
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultAbnormallyTable = async (req, res) => {
  return handleAbnormallyData(req, res)
}

const getDataResultAbnormallyChart = async (req, res) => {
  return handleAbnormallyData(req, res)
}

const getDataResultBottlePressureTable = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query.replace(/:lotno/g, `'${lotno}'`);
    
    console.log("ini query", query);
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultBottlePressureChart = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data, ijp } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query
    .replace(/:lotno/g, `'${lotno}'`)
    .replace(/:ijp/g, `'${ijp}'`);
    
    console.log("ini query", query);
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

const getDataResultPackagingMaterialLotnoMaterial = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query.replace(/:lotno/g, `'${lotno}'`);
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
}

const getDataResultPackagingMaterialTable = async (req, res) => {
  try {
    const { lotno, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const lotnoString = await getLotnoBeforeAfter(line, 'ipcquality_lotnoBeforeAfter', ring, lotno);
    
    const query = datasource.query
      .replace(/:lotno/g, lotnoString); // Using global replace to handle multiple occurrences
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
}

const getDataResultPackagingMaterialData = async (req, res) => {
  try {
    const { lotno_cap, lotno_label, lotno_box, line, tag, ring, type_data } = req.body;
    
    const { datasource, database } = await getDataSourceAndDatabase(line, tag, ring, type_data);
    const query = datasource.query
      .replace(":lotno_cap", `'${lotno_cap}'`)
      .replace(":lotno_label", `'${lotno_label}'`)
      .replace(":lotno_box", `'${lotno_box}'`);
    
    const data = await executeQueryWithDynamicConfig(database, query);
    api.ok(res, data);
  } catch (e) {
    handleRequestError(res, e);
  }
};

module.exports = {
  getDataEfficiency,
  getDataResultIpcQualityTable,
  getDataResultIpcQualityData,
  getDataResultBottleDimensionTable,
  getDataResultBottleDimensionChart,
  getDataResultMicrobiologyTable,
  getDataResultCappingPerformanceTable,
  getDataResultCappingPerformanceData,
  getDataResultPreformCheckTable,
  getDataResultPreformCheckData,
  getDataResultCCPTable,
  getDataResultCCPChart,
  getDataResultPreparationSyrupTable,
  getDataResultPreparationSyrupData,
  getDataResultAbnormallyChart,
  getDataResultAbnormallyTable,
  getDataResultBottlePressureTable,
  getDataResultBottlePressureChart,
  getDataResultPackagingMaterialLotnoMaterial,
  getDataResultPackagingMaterialTable,
  getDataResultPackagingMaterialData
};