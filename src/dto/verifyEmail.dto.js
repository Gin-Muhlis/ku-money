import Joi from 'joi';

export const verifyEmailDto = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Verification token is required',
      'any.required': 'Verification token is required',
    }),
});

