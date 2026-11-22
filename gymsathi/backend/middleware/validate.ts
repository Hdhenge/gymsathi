module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    convert: true,
    stripUnknown: { objects: true },
  });

  if (error) {
    return res.status(400).json({
      msg: "Please check the submitted fields.",
      details: error.details.map((detail) => ({ field: detail.path.join("."), message: detail.message })),
    });
  }

  req.body = value;
  next();
};
