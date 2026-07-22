// Holds a reference to the WebSocket server instance so any controller can broadcast
let wssInstance = null;

function setWss(wss) {
  wssInstance = wss;
}

function broadcast(event) {
  if (!wssInstance) return;
  const payload = JSON.stringify(event);
  wssInstance.clients.forEach((client) => {
    // readyState 1 === OPEN
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

async function sendAdminAlertEmail(subject, htmlContent) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "Premium Auto Care Alerts",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: process.env.EMAIL_USER }],
      subject,
      htmlContent,
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errText}`);
  }
}

async function notifyNewBooking(booking) {
  broadcast({
    type: "new_booking",
    message: `New booking from ${booking.name} for ${booking.serviceName}`,
    timestamp: new Date().toISOString(),
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #4f7cff;">New Booking Received</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Customer</td><td style="padding: 6px 0; font-weight: bold;">${booking.name}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Service</td><td style="padding: 6px 0; font-weight: bold;">${booking.serviceName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">${booking.date}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">${booking.time}</td></tr>
      </table>
      <p>Log in to the admin dashboard to review and confirm.</p>
    </div>
  `;

  await sendAdminAlertEmail("New Booking Received 🚗", html).catch((err) =>
    console.error("Admin booking alert email failed:", err),
  );
}

async function notifyFailedLogins(username, attemptCount) {
  broadcast({
    type: "failed_login",
    message: `${attemptCount} failed login attempts for username "${username}"`,
    timestamp: new Date().toISOString(),
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #d64545;">Suspicious Login Activity</h2>
      <p><strong>${attemptCount}</strong> failed login attempts detected for username <strong>${username}</strong>.</p>
      <p>If this wasn't you, consider reviewing your admin credentials.</p>
    </div>
  `;

  await sendAdminAlertEmail("⚠️ Suspicious Login Activity", html).catch((err) =>
    console.error("Admin login alert email failed:", err),
  );
}

module.exports = {
  setWss,
  broadcast,
  notifyNewBooking,
  notifyFailedLogins,
};
