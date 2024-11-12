function ok(res, data) {
    return res.status(200).json({
        success: true,
        status: 200,
        data: data
    });
}

function error(res, message, code) {

    return res.status(code).json({
        success: false,
        status : code,
        error : {
            message : message
        }
    });
}


function badRequest(res, data, message) {
    return res.status(400).json({
        isSuccess: false,
        status: "error",
        message: message ? message : "Bad Request",
        data: data,
        errorCode: "400"
    });
}

function serverError(res, data, message) {
    return res.status(500).json({
        isSuccess: false,
        status: "error",
        message: message ? message : "Internal Server Error",
        data: data,
        errorCode: "500"
    });
}

function dataCreated(res, data, message) {
    return res.status(201).json({
        isSuccess: true,
        status: "success",
        code : 201,
        message: message ? message : "Data added successfully",
        data: data
    });
}

function success(res, data, message) {
    return res.status(200).json({
        isSuccess: true,
        status: "success",
        code : 200,
        message: message ? message : "The requested operation was successful",
        data: data
    });
}


function forbiddenError(res, data, message) {
    return res.status(403).json({
        isSuccess: false,
        status: "error",
        message: message ? message : "Request requires authorization, please provide a token",
        data: data,
        errorCode: "403"
    });
}

function errorToken(res, data, message) {
    return res.status(401).json({
        isSuccess: false,
        status: "error",
        message: message ? message : "Token consistency error",
        data: data,
        errorCode: "401"
    });
}

function handleError(obj, req, res) {
    const wrappedObject = Object.create(obj);
  
    for (const key in obj) {
      if (typeof obj[key] === 'function') {
        const originalMethod = obj[key];
        wrappedObject[key] = async function () {
          try {
              await originalMethod.apply(this, arguments);
          } catch (error) {
            console.error(error);
            return arguments[1].status(400).json({
                'status': false,
                'data': {
                    'message': error.toString()
                }
            });
          }
        };
      }
    }
  
    return wrappedObject;
  }

module.exports = {
    ok,
    error,
    badRequest,
    serverError,
    dataCreated,
    success,
    forbiddenError,
    handleError
}