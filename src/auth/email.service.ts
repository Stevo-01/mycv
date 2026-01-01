// src/email/email.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    // Create a test account for local development
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Ethereal test account created:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!this.transporter) throw new Error('Transporter not initialized');

    const resetUrl = `http://localhost:8501/reset-password?token=${token}`;

    const info = await this.transporter.sendMail({
      from: '"MyApp Support" <noreply@myapp.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log('Password reset email sent. Preview URL:');
    console.log(nodemailer.getTestMessageUrl(info));
  }
}
