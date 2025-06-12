const Joi = require("joi");

//register
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(255).required(),
    email: Joi.string()
      .min(6)
      .max(1024)
      .email({ minDomainSegments: 2 })
      .required(),
    password: Joi.string().min(8).max(255).required(),
    role: Joi.string().valid("user", "admin").required(),
  });
  return schema.validate(data);
};

//Login
const LoginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(1024).email().required(),
    password: Joi.string().min(8).max(255).required(),
  });
  return schema.validate(data);
};

//order
const orderValiadtion = (data) => {
  const schema = Joi.object({
    type: Joi.string().valid("buy", "sell").required(),
    thirdPartyId: Joi.string().required(),
    quantity: Joi.number().required(),
  });
  return schema.validate(data);
};

//alert
const alertValiadtion = (data) => {
  const schema = Joi.object({
    productId: Joi.number().required(),
    condition: Joi.string().valid("lte", "gte").required(),
    targetPrice: Joi.number().required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.LoginValidation = LoginValidation;
module.exports.orderValiadtion = orderValiadtion;
module.exports.alertValiadtion = alertValiadtion;
