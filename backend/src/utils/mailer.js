async function sendApprovalEmail(to, name, serviceName, date, time) {
  const dateFormatted = new Date(date).toLocaleDateString();

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Premium Auto Care", email: process.env.EMAIL_USER },
      to: [{ email: to, name }],
      subject: "Your Car Wash Booking is Confirmed! ✅",
      htmlContent: `
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
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errText}`);
  }
}

async function sendLoginAlert({ to, email, ip, userAgent, time, success }) {
  const timeFormatted = new Date(time).toLocaleString();
  const subject = success
    ? "✅ Admin Dashboard Login"
    : "⚠️ Failed Admin Login Attempt";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "Premium Auto Care Security",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: to }],
      subject,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: ${success ? "#22c55e" : "#ef4444"};">${subject}</h2>
          <p>${success ? "A successful login was recorded on the admin dashboard." : "A failed login attempt was detected on the admin dashboard."}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 6px 0; color: #666;">Email tried</td><td style="padding: 6px 0; font-weight: bold;">${email}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">IP address</td><td style="padding: 6px 0; font-weight: bold;">${ip}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Device/Browser</td><td style="padding: 6px 0; font-weight: bold;">${userAgent}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">${timeFormatted}</td></tr>
          </table>
          <p>If this wasn't you, please review admin access immediately.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errText}`);
  }
}

module.exports = { sendApprovalEmail, sendLoginAlert };
