const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendApprovalEmail(to, name, serviceName, date, time) {
  const dateFormatted = new Date(date).toLocaleDateString();

  await transporter.sendMail({
    from: `"Premium Auto Care" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Car Wash Booking is Confirmed! ✅",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f7cff;">Booking Confirmed</h2>
        <p>Hi ${name},</p>
        <p>Good news — your booking has been confirmed by our team.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Service</td><td style="padding: 6px 0; font-weight: bold;">${serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">${dateFormatted}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">${time}</td></tr>
        </table>
        <p>We look forward to seeing you. Thank you for choosing Premium Auto Care!</p>
      </div>
    `,
  });
}

module.exports = { sendApprovalEmail };
