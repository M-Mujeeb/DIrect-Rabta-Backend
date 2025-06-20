exports.successResponse = (res, message = "Success", data = {}) => {
  return res.status(200).json({
    status: true,
    message,
    data,
  });
};

exports.errorResponse = (res, message = "Something went wrong", statusCode = 400) => {
  return res.status(statusCode).json({
    status: false,
    message,
    data: null,
  });
};
