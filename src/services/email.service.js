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
  logger: true,
  debug: true,
});


export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your KU MONEY Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - KU MONEY</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                        KU MONEY
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                        Personal Finance Management
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                        Verify Your Email Address
                      </h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Terima kasih telah mendaftar di <strong>KU MONEY</strong>! Untuk memastikan keamanan akun Anda, kami perlu memverifikasi alamat email Anda.
                      </p>
                      <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Klik tombol di bawah ini untuk memverifikasi email dan mulai menggunakan layanan kami.
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0;">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                              Verifikasi Email Saya
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6; text-align: center;">
                        Atau salin dan tempel link berikut di browser Anda:<br>
                        <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">
                          ${verificationUrl}
                        </a>
                      </p>
                      
                      <!-- Warning -->
                      <p style="margin: 30px 0 0 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404; font-size: 14px; line-height: 1.6;">
                        <strong>Peringatan:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                        © 2025 KU MONEY. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                        Email ini dikirim secara otomatis, mohon jangan membalas email ini.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
