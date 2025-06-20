module.exports = (err, req, res, next) => {
  console.error("Error: ", err);
  res.status(err.statusCode || 500).json({
    status: false,
    message: err.message || "Internal Server Error",
    data: null,
  });
};
