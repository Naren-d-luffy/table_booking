import Joi from "joi";

export const userValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/)
    .default("Guest User")
    .when('type', {
      is: 'guest',
      otherwise: Joi.required()
    })
    .messages({
      "string.pattern.base": "Name must contain only alphabets and spaces",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name cannot be more than 50 characters",
      "string.empty": "Name cannot be empty",
      "any.required": "Name is required for user accounts",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required",
    }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .allow(null, "")
    .messages({
      "string.pattern.base": "Mobile number must be between 10-15 digits",
    }),

  password: Joi.string()
    .min(8)
    .when("type", {
      is: "user",
      then: Joi.required(),
      otherwise: Joi.allow(null, "")
    })
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.empty": "Password cannot be empty for user accounts",
      "any.required": "Password is required for user accounts",
    }),

  type: Joi.string()
    .valid("user", "guest")
    .default("guest")
    .required()
    .messages({
      "any.only": "Type must be either 'user' or 'guest'",
      "any.required": "Type is required",
    }),

  verified: Joi.boolean()
    .default(false)
    .messages({
      "boolean.base": "Verified must be a boolean value",
    }),
});