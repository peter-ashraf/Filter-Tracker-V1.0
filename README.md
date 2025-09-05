# 🌊 AquaTracker PWA
## Smart Water Filter Management with Offline Support

AquaTracker is a Progressive Web App (PWA) designed to help you track and manage water filter cartridge replacements with smart notifications and full offline functionality.

![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen)
![iOS Compatible](https://img.shields.io/badge/iOS-Compatible-blue)
![Android Compatible](https://img.shields.io/badge/Android-Compatible-green)
![Windows Compatible](https://img.shields.io/badge/Windows-Compatible-blue)

## ✨ Features

### 🔧 Core Functionality
- **Filter Management Dashboard** with real-time status indicators
- **9 Filter Types Supported**: Sediment, Carbon, RO Membrane, Whole House, Pitcher, Faucet Mount, Shower, Refrigerator, UV Lamp
- **Smart Notifications**: Customizable reminders for buying and replacing filters
- **Replacement History**: Complete log with dates, costs, and notes
- **Statistics Dashboard**: Track savings vs bottled water and environmental impact

### 📱 PWA Features  
- **Offline Support**: Works completely offline after initial load
- **Cross-Platform**: Install on iPhone, Android, Windows, and Mac
- **Push Notifications**: Smart reminders even when app is closed
- **Home Screen Installation**: Native app-like experience
- **Responsive Design**: Optimized for mobile and desktop

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme switching
- **Search & Filter**: Find specific filters quickly  
- **Quick Actions**: One-tap filter replacement marking
- **Onboarding Flow**: Guided setup for new users
- **Export/Import**: Backup and restore filter data

## 📋 Filter Types & Default Intervals

| Filter Type | Default Interval | Common Applications |
|-------------|------------------|-------------------|
| Pitcher Filter | 3 months | Brita, PUR pitchers |
| Faucet Mount Filter | 4 months | Countertop attachments |
| Carbon Filter | 6 months | Taste & odor removal |
| Sediment Filter | 6 months | Pre-filtration stage |
| Shower Filter | 6 months | Chlorine removal |
| Refrigerator Filter | 6 months | Built-in fridge systems |
| Whole House Filter | 12 months | Main water line filtration |
| UV Lamp | 12 months | Sterilization systems |
| RO Membrane | 24 months | Reverse osmosis systems |

## 🚀 Installation

### For iPhone (iOS 16.4+)
1. Open **Safari** browser
2. Visit your GitHub Pages URL  
3. Tap **Share button** (square with arrow)
4. Select **"Add to Home Screen"**
5. Tap **"Add"** to confirm

### For Android
1. Open **Chrome** browser
2. Visit the PWA URL
3. Tap **"Install"** when prompted
4. Or use menu → **"Add to Home screen"**

### For Windows  
1. Open **Microsoft Edge** or **Chrome**
2. Visit the PWA URL
3. Click **install icon** in address bar
4. Click **"Install"** to add to Windows

## 🔧 Development

### File Structure
```
aquatracker-pwa/
├── index.html          # Main application
├── style.css           # Responsive design system  
├── app.js              # Core functionality
├── manifest.json       # PWA configuration
├── sw.js              # Service worker
├── offline.html       # Offline fallback
└── README.md          # Documentation
```

### Key Technologies
- **Vanilla JavaScript**: No frameworks, maximum compatibility
- **CSS Grid & Flexbox**: Responsive layouts
- **Service Workers**: Advanced caching strategies
- **Web App Manifest**: Native installation support
- **Local Storage**: Offline data persistence
- **Push API**: Background notifications

## 🎯 Usage Guide

### Adding a New Filter
1. Click **"Add Filter"** button
2. Select filter type from dropdown  
3. Enter location (e.g., "Kitchen Sink")
4. Set replacement interval
5. Configure notification preferences
6. Save filter details

### Managing Notifications
1. Go to **Settings** tab
2. Enable push notifications when prompted
3. Set reminder timing:
   - **Buy Reminder**: 7-60 days before due date
   - **Replace Reminder**: 1-14 days before due date
4. Customize notification messages

### Marking Filter as Replaced
1. Find filter on dashboard
2. Click **"Mark Replaced"** button  
3. Enter replacement date and cost (optional)
4. Add notes about the replacement
5. New due date automatically calculated

### Viewing Statistics  
- **Filters Managed**: Total count of active filters
- **Money Saved**: Savings vs buying bottled water
- **Environmental Impact**: Plastic bottles saved
- **Upcoming Replacements**: Next 30 days overview

## 🔒 Privacy & Security

- **Local Data Storage**: All filter data stored on your device
- **No External APIs**: Works completely offline
- **HTTPS Required**: Secure connection for PWA features  
- **No Tracking**: Privacy-focused design
- **Data Export**: Full control of your information

## 📊 Technical Specifications

### PWA Requirements Met
- ✅ **Web App Manifest** with required fields
- ✅ **Service Worker** with offline functionality  
- ✅ **HTTPS** served (automatic with GitHub Pages)
- ✅ **Responsive Design** for all devices
- ✅ **App Icons** in multiple sizes (72px to 512px)

### Browser Support
| Browser | Installation | Offline | Notifications |
|---------|--------------|---------|---------------|
| Safari (iOS 16.4+) | ✅ | ✅ | ✅ |
| Chrome (Android) | ✅ | ✅ | ✅ |
| Edge (Windows) | ✅ | ✅ | ✅ |
| Chrome (Desktop) | ✅ | ✅ | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`  
3. Make your changes
4. Test on multiple devices/browsers
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

**Common Issues:**

**PWA won't install on iPhone:**
- Must use Safari browser (not Chrome or Firefox)
- Requires iOS 16.4 or later
- Ensure site is served over HTTPS

**Notifications not working:**
- Check browser notification permissions
- Ensure service worker is registered properly
- Test with browser developer tools

**Offline mode issues:**
- Clear browser cache and reload
- Check service worker in developer tools
- Verify all files are cached properly

## 📈 Roadmap

- [ ] Cloud sync for multi-device support
- [ ] Barcode scanning for filter identification  
- [ ] Integration with smart home systems
- [ ] Water quality tracking
- [ ] Bulk filter purchase reminders
- [ ] Filter recycling location finder

---

**Made with 💧 for cleaner water and better health**

*AquaTracker helps you maintain optimal water quality by never missing a filter replacement again.*