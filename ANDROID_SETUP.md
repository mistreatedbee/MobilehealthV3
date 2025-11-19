# Android Setup Guide

## Prerequisites

1. **Android Studio** installed
2. **Java JDK** (version 11 or higher)
3. **Android SDK** installed via Android Studio
4. **Backend running** (either locally or on Render.com)

## Configuration

### 1. Environment Variables

Make sure your `.env` file in the project root has:

```env
VITE_API_URL=https://healthappbackend-my3d.onrender.com
```

**For local development with Android emulator:**
- If your backend is running on `localhost:5000` on your computer
- The Android emulator will automatically use `http://10.0.2.2:5000` (maps to host's localhost)
- No need to change `.env` for emulator testing

**For production builds:**
- Set `VITE_API_URL` to your production backend URL
- The app will use this URL on real devices

### 2. Build the App

#### Step 1: Build the Web App
```bash
npm run build
```

This creates the `dist` folder with your React app.

#### Step 2: Sync with Capacitor
```bash
npx cap sync android
```

This copies the `dist` folder to Android and updates native dependencies.

#### Step 3: Open in Android Studio
```bash
npx cap open android
```

Or manually open `android/` folder in Android Studio.

### 3. Run on Emulator or Device

#### Option A: Android Studio
1. Open Android Studio
2. Wait for Gradle sync to complete
3. Select an emulator or connected device
4. Click the "Run" button (green play icon)

#### Option B: Command Line
```bash
# List available devices/emulators
adb devices

# Run on connected device/emulator
npx cap run android
```

## Testing Login

### Test Credentials

**Admin:**
- Email: `admin@gmail.com`
- Password: `hacked`

### Steps to Test

1. **Build and run** the app on Android emulator/device
2. **Open the app** - you should see the login screen
3. **Enter credentials** and click "Login"
4. **Check Logcat** in Android Studio for:
   - `🌐 API Request: POST https://healthappbackend-my3d.onrender.com/auth/login`
   - `✅ API Response: /auth/login success`
   - Or any error messages

### Troubleshooting

#### Issue: "Network request failed" or "Connection refused"

**Solution:**
- Check if backend is running and accessible
- For emulator: Make sure backend is running on `localhost:5000` on your computer
- For real device: Make sure `VITE_API_URL` in `.env` points to a publicly accessible URL
- Check Android Logcat for detailed error messages

#### Issue: "CORS error" in logs

**Solution:**
- Backend CORS is already configured to allow all origins
- If still seeing CORS errors, check backend logs
- Make sure backend is running and accessible

#### Issue: "Invalid email or password"

**Solution:**
- Verify credentials are correct
- Check backend logs for login attempts
- Make sure user account exists and is active (`isActive: true`)

#### Issue: App crashes on startup

**Solution:**
- Check Logcat for error messages
- Make sure you ran `npm run build` before syncing
- Try `npx cap sync android` again
- Clean and rebuild in Android Studio: `Build > Clean Project`, then `Build > Rebuild Project`

#### Issue: Socket.IO not connecting

**Solution:**
- Check Logcat for Socket.IO connection errors
- Verify backend Socket.IO server is running
- Check network connectivity
- For emulator, ensure backend is accessible from host machine

## Network Configuration

The app is configured to:
- ✅ Allow HTTPS connections (production backend)
- ✅ Allow HTTP connections to localhost/10.0.2.2 (for local development)
- ✅ Use the correct API URL based on platform

## Building for Production

### 1. Update Environment
Make sure `.env` has production URL:
```env
VITE_API_URL=https://healthappbackend-my3d.onrender.com
```

### 2. Build
```bash
npm run build
npx cap sync android
```

### 3. Generate Signed APK/AAB
In Android Studio:
1. `Build > Generate Signed Bundle / APK`
2. Choose `Android App Bundle` (for Play Store) or `APK` (for direct install)
3. Follow the signing wizard

## Quick Test Checklist

- [ ] Backend is running and accessible
- [ ] `.env` file has correct `VITE_API_URL`
- [ ] Built the app: `npm run build`
- [ ] Synced with Capacitor: `npx cap sync android`
- [ ] App opens without crashing
- [ ] Login screen appears
- [ ] Can enter email and password
- [ ] Login button works
- [ ] Successfully logs in (check Logcat)
- [ ] Dashboard loads after login

## Need Help?

Check Logcat in Android Studio:
- `View > Tool Windows > Logcat`
- Filter by your app package: `com.mobilehealth`
- Look for errors or API request logs

