import Joi from 'joi';

/**
 * DTO for user registration
 */
export const registerDto = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
});

/**
 * DTO for user login
 */
export const loginDto = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

/**
 * DTO for refresh token
 */
export const refreshDto = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Refresh token cannot be empty',
    }),
});

/**
 * DTO for email verification
 */
export const verifyEmailDto = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Verification token is required',
      'any.required': 'Verification token is required',
    }),
});

/**
 * DTO for resending verification email
 */
export const resendVerificationDto = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
});

