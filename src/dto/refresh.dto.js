import Joi from 'joi';

export const refreshDto = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Refresh token cannot be empty',
    }),
})

