import Joi from "joi";

const adminValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name must contain only alphabets and spaces",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name cannot be more than 50 characters",
      "string.empty": "Name cannot be empty",
      "any.required": "Name is required",
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

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),

  role: Joi.string().default("Admin").messages({
    "any.required": "Role is required",
  }),

  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE").messages({
    "any.only": "Status must be either 'ACTIVE' or 'INACTIVE'",
  }),
});

export default adminValidation;
