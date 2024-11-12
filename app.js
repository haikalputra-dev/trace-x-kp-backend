//library
process.title = "MANUFACTURE - TRACEX";
require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var bodyParser = require("body-parser");
var http = require("http");
var cors = require("cors");
var debug = require("debug")("express-template-master:server");

// routing
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var routesMasterData = require("./routes/routesMasterData");
var routesStorage = require("./routes/routesStorage");
var routesAuthentication = require("./routes/routesAuthentication");
var routesData = require("./routes/routesData");
var routesDataUtility = require("./routes/routesDataUtility");
var routesDataProduction = require("./routes/routesDataProduction");
var routesDataCleaningSanitation = require("./routes/routesDataCleaningSanitation");
var routesDataInspectionCamera = require("./routes/routesDataInspectionCamera");
// var cron = require('./controllers/Scheduller.controller')

//Settings
var settings = require("./config/config");

// view engine setup
var app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

var synologyPATH = "";
app.use(express.static(path.join(__dirname, "app/public")));
app.use("/app", express.static(path.join(synologyPATH)));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cors());
app.use(function (req, res, next) {
  const allowedOrigins = [
    "http://localhost:4200",
    "https://myapps.aio.co.id",
    "https://otsuka-ilmu.aio.co.id",
  ];
  // Mengizinkan akses hanya dari daftar origin yang telah didefinisikan
  const origin = req.headers.origin;
  console.log("asd" + origin);
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log("oke");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  if (req.method == "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(
  express.urlencoded({
    extended: true,
  })
);

// path base
app.use(cors());
app.use("/api", routesAuthentication);
app.use("/api/data", routesData);
app.use("/api/data-utility", routesDataUtility);
app.use("/api/data-production", routesDataProduction);
app.use("/api/cleaning-sanitation", routesDataCleaningSanitation);
app.use("/api/inspection-camera", routesDataInspectionCamera);
app.use("/api/master", routesMasterData);
app.use("/api/storage", routesStorage);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || settings.server.port);
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
  console.log("Server Running On PORT : " + port);
}

// module.exports = app;
module.exports = server;