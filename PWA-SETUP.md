# PWA Setup - Workout Tracker

Your Workout Tracker app is now a Progressive Web App (PWA) and can be installed on Android devices!

## What's Been Added

### 1. Web App Manifest (`public/manifest.json`)
- Defines app name, icons, colors, and display preferences
- Enables "Add to Home Screen" functionality on Android
- Sets standalone display mode (full-screen without browser UI)

### 2. App Icons (`public/icons/`)
- 8 different icon sizes (72x72 to 512x512)
- Blue gradient design with dumbbell icon
- Compatible with all Android devices

### 3. Service Worker (`public/service-worker.js`)
- Enables offline functionality
- Caches app assets for faster loading
- Provides a better user experience

### 4. PWA Meta Tags (in `public/index.html`)
- iOS support (apple-mobile-web-app tags)
- Theme color for Android status bar
- App description for search engines

## How to Install on Android

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Access the app from your Android phone:**
   - Connect your phone to the same network as your computer
   - Open Chrome browser on Android
   - Navigate to: `http://[YOUR_COMPUTER_IP]:3000`

3. **Install the app:**
   - Tap the menu (three dots) in Chrome
   - Select "Add to Home Screen" or "Install App"
   - Confirm the installation
   - The app icon will appear on your home screen!

4. **For production deployment:**
   - Deploy to a hosting service with HTTPS (required for PWA)
   - Users can install directly from your website
   - Examples: Heroku, Vercel, Railway, DigitalOcean

## Features

✅ **Installable** - Add to home screen like a native app  
✅ **Offline Support** - Works without internet connection  
✅ **Fast Loading** - Assets cached for instant startup  
✅ **Full Screen** - Runs without browser UI  
✅ **Theme Colors** - Matches Android system colors  
✅ **App Shortcuts** - Quick actions from home screen  

## Testing PWA Features

### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section - verify all icons load
4. Check "Service Workers" - verify it's registered
5. Use "Lighthouse" tab - run PWA audit

### On Android Device:
1. Open Chrome browser
2. Navigate to your app
3. Look for "Install" prompt at bottom of screen
4. OR tap menu → "Add to Home Screen"

## Regenerating Icons

If you need to regenerate the app icons with a different design:

```bash
node generate-icons.js
```

This will create new PNG icons in the `public/icons/` directory.

## Important Notes

- **HTTPS Required for Production**: PWAs require HTTPS in production
- **Service Worker Updates**: When you update the app, the service worker will automatically update
- **Cache Version**: Update `CACHE_NAME` in `service-worker.js` when deploying changes
- **iOS Support**: iOS devices can add to home screen but have limited PWA features

## Troubleshooting

**App won't install:**
- Check console for errors
- Verify manifest.json is accessible at `/manifest.json`
- Ensure service worker registered successfully
- Use HTTPS (for production)

**Icons don't show:**
- Verify icons exist in `public/icons/` directory
- Check icon paths in manifest.json
- Clear browser cache and try again

**Offline mode not working:**
- Check service worker is registered in DevTools
- Verify cache is populated in Application → Cache Storage
- Try hard refresh (Ctrl+Shift+R)

## Next Steps

Consider adding:
- Push notifications
- Background sync
- Periodic background updates
- More app shortcuts
- Better offline fallback pages
