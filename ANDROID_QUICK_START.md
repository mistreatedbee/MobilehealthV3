# 🚀 Android Quick Start

## Before Running in Android Studio

### 1. ✅ Build the Web App
```bash
npm run build
```

### 2. ✅ Sync with Capacitor
```bash
npx cap sync android
```

### 3. ✅ Open in Android Studio
```bash
npx cap open android
```

## In Android Studio

1. **Wait for Gradle sync** to complete (bottom right corner)
2. **Select a device/emulator** from the device dropdown
3. **Click Run** (green play button) or press `Shift+F10`

## Test Login

**Admin Credentials:**
- Email: `admin@gmail.com`
- Password: `hacked`

## What Was Configured

✅ **API URL Configuration**
- Automatically uses production URL from `.env` (`VITE_API_URL`)
- Falls back to `http://10.0.2.2:5000` for Android emulator (maps to your computer's localhost)
- Falls back to `http://localhost:5000` for web

✅ **Network Security**
- Allows HTTPS connections (production backend)
- Allows HTTP for localhost/emulator testing
- Configured in `AndroidManifest.xml`

✅ **All API Calls**
- `src/services/api.ts` - Uses centralized API URL
- `src/utils/socket.ts` - Uses centralized API URL  
- `src/App.tsx` - Uses centralized API URL

## Troubleshooting

### App won't connect to backend?

1. **Check `.env` file** - Should have:
   ```env
   VITE_API_URL=https://healthappbackend-my3d.onrender.com
   ```

2. **Rebuild and resync:**
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Check Logcat** in Android Studio:
   - View → Tool Windows → Logcat
   - Filter by: `com.mobilehealth`
   - Look for: `🌐 API Request` or error messages

### Login not working?

1. **Check backend is running** (if using local backend)
2. **Verify credentials** are correct
3. **Check Logcat** for API response errors
4. **Try in browser first** to verify backend is accessible

## Next Steps

1. ✅ Build: `npm run build`
2. ✅ Sync: `npx cap sync android`  
3. ✅ Open: `npx cap open android`
4. ✅ Run in Android Studio
5. ✅ Test login with admin credentials

---

**Need more details?** See `ANDROID_SETUP.md` for comprehensive guide.

