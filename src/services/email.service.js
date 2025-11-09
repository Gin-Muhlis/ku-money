import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import {
  buildVerificationEmailHtml,
  buildSubscriptionExpiringEmailHtml,
  buildSubscriptionExpiredEmailHtml,
} from './emailTemplates.js';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: false,
  debug: false,
});


export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your KU MONEY Account',
    html: buildVerificationEmailHtml(verificationUrl),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
    return Promise.reject({
      statusCode: 400,
      message: 'Error sending verification email:'
    })
  }
};

/**
 * Send subscription expiration reminder email (1 day before)
 */
export const sendSubscriptionExpiringEmail = async (email, userName, expiredDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Pengingat: Subscription Anda Akan Kedaluwarsa Besok',
    html: buildSubscriptionExpiringEmailHtml(userName, expiredDate),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Subscription expiring email sent to:', email);
  } catch (error) {
    console.error('Error sending subscription expiring email:', error);
    throw error;
  }
};

/**
 * Send subscription expired notification email
 */
export const sendSubscriptionExpiredEmail = async (email, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Pemberitahuan: Subscription Anda Telah Kedaluwarsa',
    html: buildSubscriptionExpiredEmailHtml(userName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Subscription expired email sent to:', email);
  } catch (error) {
    console.error('Error sending subscription expired email:', error);
    throw error;
  }
};
