# 🏥 Mobile Health App V3.2

A comprehensive mobile health application built for South Africa, featuring real-time updates, email verification, admin controls, and cross-platform support (Web & Android).

## ✨ Features

### 🔐 Authentication & Security
- **User Registration** - Patients and Doctors can register with email verification
- **Email Verification** - Secure email verification flow with token-based authentication
- **Password Reset** - Forgot password functionality with secure token reset
- **Role-Based Access Control** - Patient, Doctor, and Admin roles with appropriate permissions
- **Session Management** - Secure session handling with token invalidation

### 👨‍⚕️ Doctor Features
- **Dashboard** - View appointments, patient list, and statistics
- **Appointment Management** - Accept, reject, or reschedule appointments
- **Availability Management** - Set available time slots (online/in-person)
- **Patient Notes** - Create and manage patient consultation notes
- **Prescription Management** - Issue and manage prescriptions
- **Telehealth** - Video consultation support

### 👤 Patient Features
- **Dashboard** - View appointments, prescriptions, and health information
- **Doctor Search** - Browse and search for doctors by specialty and location
- **Appointment Booking** - Book appointments with preferred doctors
- **Appointment History** - View past and upcoming appointments
- **Prescription Viewing** - Access prescribed medications
- **Profile Management** - Update personal information

### 👨‍💼 Admin Features
- **Dashboard** - Overview of system statistics and activity
- **Doctor Management** - Approve, reject, or delete doctor accounts
- **Patient Management** - View and manage patient accounts
- **Appointment Oversight** - Monitor and manage all appointments
- **Audit Logs** - Track all administrative actions
- **Soft/Hard Delete** - Safely remove doctors with appointment cancellation

### 🔔 Real-Time Features
- **Live Notifications** - Real-time notifications via Socket.IO
- **MongoDB Change Streams** - Automatic updates when data changes
- **Push Notifications** - Firebase Cloud Messaging (FCM) support
- **Live Updates** - Appointments, availability, and notifications update instantly

### 📱 Platform Support
- **Web Application** - React-based responsive web app
- **Android App** - Native Android app via Capacitor
- **Cross-Platform** - Shared codebase for web and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.IO Client** - Real-time communication
- **Capacitor** - Mobile app framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Socket.IO** - WebSocket server
- **MongoDB Change Streams** - Real-time data synchronization
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing
- **Firebase Admin SDK** - Push notifications

### Infrastructure
- **MongoDB Atlas** - Cloud database
- **Render.com** - Backend hosting
- **Firebase** - Push notification service

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Git**
- **Android Studio** (for Android development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mistreatedbee/MobilehealthV3.git
cd MobilehealthV3
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

#### Frontend `.env` (root directory)

```env
VITE_API_URL=https://healthappbackend-my3d.onrender.com
```

For local development:
```env
VITE_API_URL=http://localhost:5000
```

#### Backend `.env` (backend directory)

```env
# MongoDB Connection
MONGO_URI=your-mongodb-connection-string

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@mobilehealth.app
```

### 4. Run the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
# From root directory
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Create Admin Account

```bash
cd backend
node scripts/createAdmin.js
```

Follow the prompts to create your admin account.

## 📱 Android Setup

### 1. Build the Web App

```bash
npm run build
```

### 2. Sync with Capacitor

```bash
npx cap sync android
```

### 3. Open in Android Studio

```bash
npx cap open android
```

### 4. Run on Emulator/Device

- Select an emulator or connected device in Android Studio
- Click the "Run" button (green play icon)

For detailed Android setup, see [ANDROID_SETUP.md](./ANDROID_SETUP.md)

## 🗄️ Database Setup

### MongoDB Collections

The application uses the following MongoDB collections:

- **users** - Patients, Doctors, and Admins
- **appointments** - Appointment bookings
- **notifications** - User notifications
- **doctorAvailability** - Doctor availability slots
- **notes** - Consultation notes
- **prescriptions** - Patient prescriptions
- **auditLogs** - Administrative action logs

### Run Migrations

```bash
cd backend
node scripts/migrate.js
```

This will:
- Add `isActive` and `deletedAt` fields to existing users
- Create all necessary indexes
- Set up TTL indexes for token expiry

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register patient
- `POST /api/auth/register-doctor` - Register doctor
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me/:id` - Get current user

### Appointments
- `GET /api/appointments` - Get appointments (filtered by user role)
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/:id/status` - Update doctor status (admin)

### Admin
- `GET /api/admin/doctors` - Get all doctors (with filters)
- `DELETE /api/admin/doctors/:doctorId` - Delete doctor (soft/hard)
- `POST /api/admin/doctors/:doctorId/restore` - Restore deleted doctor
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/appointments` - Get all appointments

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🔒 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **Token Hashing** - SHA-256 for email verification and password reset tokens
- **TTL Indexes** - Automatic token expiry cleanup
- **MongoDB Transactions** - Atomic multi-document operations
- **CORS Protection** - Configured for allowed origins
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Server-side validation for all inputs

## 📡 Real-Time Architecture

The application uses **MongoDB Change Streams** + **Socket.IO** for real-time updates:

- **Change Streams** monitor collections (users, appointments, notifications, availability)
- **Socket.IO** emits events to connected clients
- **Room-based messaging** - Users join role-specific rooms
- **Automatic updates** - UI updates when data changes

### Socket.IO Rooms
- `user:<userId>` - User-specific updates
- `doctor:<doctorId>` - Doctor-specific updates
- `patient:all` - All patients
- `admin:all` - All admins
- `notifications:<userId>` - User notifications

## 📁 Project Structure

```
MobilehealthV3/
├── backend/                 # Backend server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── scripts/            # Migration and setup scripts
│   └── server.js           # Express server
├── src/                     # Frontend source
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── utils/               # Utilities
│   └── context/             # React context
├── android/                 # Android native project
├── public/                  # Static assets
└── dist/                     # Build output
```

## 🧪 Testing

### Test Admin Login

```bash
cd backend
node scripts/debugLogin.js
```

### Test Email Service

Ensure your email credentials are correctly configured in `backend/.env`

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `backend/.env`
- Verify `MONGO_URI` is set correctly
- Ensure MongoDB is accessible

### Frontend can't connect to backend
- Verify `VITE_API_URL` in root `.env`
- Check CORS settings in `backend/server.js`
- Ensure backend is running

### Android app won't connect
- Check `VITE_API_URL` in `.env`
- For emulator: Use `http://10.0.2.2:5000` for local backend
- For device: Use production URL or your computer's IP address
- Check network security config in `AndroidManifest.xml`

### Email not sending
- Verify email credentials in `backend/.env`
- For Gmail: Use App Password (not regular password)
- Check email service configuration

## 📝 Environment Variables Reference

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://healthappbackend-my3d.onrender.com` |

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `EMAIL_SERVICE` | Email service provider | `gmail` |
| `EMAIL_USER` | Email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email password/app password | `your-password` |
| `EMAIL_FROM` | From email address | `noreply@mobilehealth.app` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - [@mistreatedbee](https://github.com/mistreatedbee)

## 🙏 Acknowledgments

- MongoDB for database hosting
- Render.com for backend hosting
- Firebase for push notifications
- All open-source contributors

## 📞 Support

For support, email support@mobilehealth.app or open an issue in the repository.

---

**Made with ❤️ for South Africa**
