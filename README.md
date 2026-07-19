# Car Wash Booking Website

A full-stack web application that lets customers book car wash services online, with an admin panel to manage bookings.

## Features

- Browse available car wash services and packages
- Book a car wash appointment online
- Form validation for booking details
- Admin dashboard to view and manage bookings
- Responsive design for mobile and desktop

## Tech Stack

**Frontend**

- HTML5, CSS3, JavaScript
- Admin panel for managing bookings

**Backend**

- Node.js
- Express.js
- (Add your database here, e.g. MongoDB / MySQL / PostgreSQL)

## Project Structure

```

car-wash-booking-website/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Auth, booking, and service logic
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # User model
│   │   ├── routes/          # API routes
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables (not committed)
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── admin/                # Admin dashboard
│   ├── css/
│   ├── js/
│   └── index.html
├── .gitignore
└── README.md

```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/YourUsername/car-wash-booking-website.git
   cd car-wash-booking-website
   ```

2. Install backend dependencies

   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the `backend` folder (see `.env.example` if provided):

   ```
   PORT=5000
   DATABASE_URL=your_database_connection_string
   ```

4. Run the backend server

   ```bash
   npm start
   ```

5. Open the frontend
   Open `frontend/index.html` in your browser, or serve it with a local dev server (e.g. Live Server in VS Code).

## Usage

- Visit the homepage to browse services and book a car wash.
- Admins can log in via the admin panel to view and manage incoming bookings.

## Roadmap

- [ ] Payment integration
- [ ] SMS/email booking confirmations
- [ ] User accounts and booking history

## Author

Leonard Korir (Korirdev.)
Portfolio: https://korirleonard.github.io/portfolio/

## License

This project is licensed under the MIT License.
