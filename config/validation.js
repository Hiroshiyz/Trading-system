const Joi = require("joi");

//register
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(6).max(1024).email().required(),
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
module.exports.registerValidation = registerValidation;
module.exports.LoginValidation = LoginValidation;
