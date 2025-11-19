# Quick Start Guide

## ✅ Migration Completed!

The database migration has been successfully completed:
- ✅ 37 users updated
- ✅ All indexes created
- ✅ TTL indexes set up for token cleanup

## 🔧 Configuration Steps

### 1. Frontend Environment (Already Done!)
The `.env` file has been created with:
```
VITE_API_URL=https://healthappbackend-my3d.onrender.com
```

**Next Step:** Restart your frontend dev server if it's running:
```bash
# Stop the server (Ctrl+C) and restart:
npm run dev
```

### 2. Backend Environment

Update `backend/.env` file with your configuration:

```env
# MongoDB Connection
MONGO_URI=your-mongodb-connection-string

# Server Configuration  
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
# Or for local development:
# FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@mobilehealth.app
```

### 3. Backend CORS Updated ✅

The backend CORS has been updated to allow:
- Local development (http://localhost:5173)
- Your production backend URL
- Any URL set in `FRONTEND_URL` environment variable

## 🚀 Start the Application

### Backend:
```bash
cd backend
npm run dev
```

### Frontend (in new terminal):
```bash
npm run dev
```

## ✅ Doctor Approval Feature

The admin can now approve doctors:

1. **Doctors register** at `/doctor/register`
2. **Admin logs in** at `/login` (as admin)
3. **Go to Manage Doctors** at `/admin/doctors`
4. **See pending doctors** (sorted first)
5. **Click "Approve"** button
6. **Doctor receives notification** in real-time
7. **Status updates** to "approved"

### Features:
- ✅ Pending doctors shown first
- ✅ Approve/Reject buttons for pending doctors
- ✅ Real-time notifications sent to doctor
- ✅ Audit log created
- ✅ Toast notifications for success/error

## 🔍 Testing Checklist

- [ ] Frontend connects to backend API
- [ ] Socket.IO connects successfully
- [ ] Doctor registration works
- [ ] Admin can see pending doctors
- [ ] Admin can approve doctors
- [ ] Doctor receives notification
- [ ] Email verification works (if configured)
- [ ] Password reset works (if configured)

## 📝 Important Notes

1. **Environment Variables**: 
   - Frontend uses `.env` in root directory
   - Backend uses `backend/.env`
   - Restart servers after changing `.env` files

2. **CORS**: 
   - Backend now allows multiple origins
   - Update `FRONTEND_URL` in backend `.env` for production

3. **Email Service**:
   - For Gmail: Use App Password (not regular password)
   - Generate at: Google Account → Security → App Passwords
   - For production: Use SendGrid, Mailgun, or AWS SES

4. **MongoDB**:
   - Ensure replica set is configured for change streams
   - Atlas has this by default
   - Local MongoDB needs replica set setup

## 🐛 Troubleshooting

### API calls failing:
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is running
- Check browser console for errors
- Verify CORS settings

### Socket.IO not connecting:
- Check backend logs
- Verify WebSocket support on hosting
- Check browser console for connection errors

### Doctor approval not working:
- Check browser console
- Verify admin is logged in
- Check backend logs for errors
- Ensure notifications are being created

## 📚 Documentation

- **Setup Instructions**: See `SETUP_INSTRUCTIONS.md`
- **Environment Setup**: See `ENV_SETUP.md`
- **Backend README**: See `backend/README.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

**Status**: ✅ Ready to use! All features implemented and migration completed.

