import nodemailer from 'nodemailer';
import dotenv from "dotenv";
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
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
            KU MONEY
          </h1>
          <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">
            Personal Finance Management
          </p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px 20px; border-radius: 0 0 8px 8px;">
          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
            Verify Your Email Address
          </h2>
          <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Terima kasih telah mendaftar di <strong>KU MONEY</strong>! Untuk memastikan keamanan akun Anda, kami perlu memverifikasi alamat email Anda.
          </p>
          <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Klik tombol di bawah ini untuk memverifikasi email dan mulai menggunakan layanan kami.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
              Verifikasi Email Saya
            </a>
          </div>
          
          <p style="margin: 25px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6; text-align: center;">
            Atau salin dan tempel link berikut di browser Anda:
          </p>
          <p style="margin: 5px 0 0 0; text-align: center;">
            <a href="${verificationUrl}" style="color: #6366f1; text-decoration: none; font-size: 12px; word-break: break-all;">
              ${verificationUrl}
            </a>
          </p>
          
          <div style="margin: 25px 0 0 0; padding: 12px; background-color: #fef3c7; border-left: 3px solid #f59e0b; color: #92400e;">
            <p style="margin: 0; font-size: 13px; line-height: 1.5;">
              <strong>Peringatan:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam.
            </p>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">
            © 2025 KU MONEY. All rights reserved.
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 11px;">
            Email ini dikirim secara otomatis, mohon jangan membalas.
          </p>
        </div>
      </div>
    `,
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
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
            KU MONEY
          </h1>
          <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">
            Personal Finance Management
          </p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px 20px; border-radius: 0 0 8px 8px;">
          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
            ⏰ Subscription Akan Kedaluwarsa
          </h2>
          <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Halo <strong>${userName}</strong>,
          </p>
          <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Kami ingin memberitahu Anda bahwa subscription <strong>KU MONEY</strong> Anda akan kedaluwarsa dalam <strong style="color: #6366f1;">1 hari</strong> (${expiredDate}).
          </p>
          <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Agar Anda dapat terus menikmati fitur premium kami, segera perpanjang subscription Anda sekarang!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/app/subscription" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
              Perpanjang Sekarang
            </a>
          </div>
        
        <div style="margin-top: 20px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">
            © 2025 KU MONEY. All rights reserved.
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 11px;">
            Email ini dikirim secara otomatis, mohon jangan membalas.
          </p>
        </div>
      </div>
    `,
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
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
            KU MONEY
          </h1>
          <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">
            Personal Finance Management
          </p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px 20px; border-radius: 0 0 8px 8px;">
          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
            ⚠️ Subscription Telah Kedaluwarsa
          </h2>
          <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Halo <strong>${userName}</strong>,
          </p>
          <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Kami informasikan bahwa subscription <strong>KU MONEY</strong> Anda telah kedaluwarsa.
          </p>
          <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Untuk kembali menikmati fitur premium dan manfaat yang lebih banyak, silakan upgrade atau perpanjang subscription Anda.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/app/subscription" style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
              Upgrade Sekarang
            </a>
          </div>
          
        <div style="margin-top: 20px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">
            © 2025 KU MONEY. All rights reserved.
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 11px;">
            Email ini dikirim secara otomatis, mohon jangan membalas.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Subscription expired email sent to:', email);
  } catch (error) {
    console.error('Error sending subscription expired email:', error);
    throw error;
  }
};
