const API_URL = "https://car-wash-booking-website.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  fetchServices();
  setupBookingForm();
  setupMobileNav();
});

// Fetch active services and populate components
async function fetchServices() {
  try {
    const res = await fetch(`${API_URL}/services`);
    const services = await res.json();

    const servicesContainer = document.getElementById("services-container");
    const pricingContainer = document.getElementById("pricing-container");
    const serviceSelect = document.getElementById("service_id");

    // Define Icon Maps for the predefined catalog
    const iconMap = {
      "Exterior Wash": "fa-solid fa-soap",
      "Interior Cleaning": "fa-solid fa-vacuum",
      "Full Detailing": "fa-solid fa-wand-magic-sparkles",
      "Engine Cleaning": "fa-solid fa-gears",
      "Ceramic Coating": "fa-solid fa-shield-halved",
    };

    servicesContainer.innerHTML = "";
    pricingContainer.innerHTML = "";
    serviceSelect.innerHTML = '<option value="">Select Package</option>';

    services.forEach((srv) => {
      const icon = iconMap[srv.name] || "fa-solid fa-car";

      // 1. Inject Service Cards
      servicesContainer.innerHTML += `
                <div class="service-card">
                    <i class="${icon}"></i>
                    <h3>${srv.name}</h3>
                    <p>${srv.description}</p>
                </div>
            `;

      // 2. Inject Pricing Cards
      pricingContainer.innerHTML += `
                <div class="price-card">
                    <div>
                        <h3>${srv.name}</h3>
                        <p>${srv.description}</p>
                    </div>
                    <div>
                        <div class="price-value">$${Math.floor(srv.price)}<span> / session</span></div>
                        <a href="#booking" onclick="selectServiceInForm(${srv.id})" class="btn btn-primary btn-sm" style="width:100%">Choose Plan</a>
                    </div>
                </div>
            `;

      // 3. Populate Booking Dropdown Selection options
      serviceSelect.innerHTML += `<option value="${srv.id}">${srv.name} ($${srv.price})</option>`;
    });
  } catch (err) {
    console.error("Data hydration pipeline error:", err);
  }
}

function selectServiceInForm(id) {
  document.getElementById("service_id").value = id;
}

// Manage booking creation sequences
function setupBookingForm() {
  const form = document.getElementById("booking-form");
  const msgEl = document.getElementById("booking-message");

  // Prevent past dates
  const dateInput = document.getElementById("booking_date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.className = "form-message";
    msgEl.innerText = "Processing your order...";

    const payload = {
      name: document.getElementById("customer_name").value.trim(),
      phone: document.getElementById("customer_phone").value.trim(),
      email: document.getElementById("customer_email").value.trim(),
      vehicle_type: document.getElementById("vehicle_type").value,
      registration_number: document
        .getElementById("registration_number")
        .value.trim()
        .toUpperCase(),
      service_id: document.getElementById("service_id").value,
      booking_date: document.getElementById("booking_date").value,
      booking_time: document.getElementById("booking_time").value,
    };

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        msgEl.classList.add("success");
        msgEl.innerText = `Success! Booking secure. Order Ref: #${data.bookingId}`;
        form.reset();
      } else {
        msgEl.classList.add("error");
        msgEl.innerText = data.error || "Submission rejected by server.";
      }
    } catch (err) {
      msgEl.classList.add("error");
      msgEl.innerText = "Network error occurred. Try again later.";
    }
  });
}

function setupMobileNav() {
  const toggle = document.querySelector(".mobile-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    links.style.display = links.style.display === "flex" ? "none" : "flex";
    links.style.flexDirection = "column";
    links.style.position = "absolute";
    links.style.top = "100%";
    links.style.left = "0";
    links.style.width = "100%";
    links.style.background = "var(--bg-dark-base)";
    links.style.padding = "20px";
  });
}
