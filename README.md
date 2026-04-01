# WeatherPro

A modern responsive weather dashboard built with HTML, CSS and JavaScript.

## 🚀 Overview

`WeatherPro` fetches real-time weather and forecast data from OpenWeather Map and displays it elegantly with animated cards, live UI updates, dark/light theme toggle, and unit switching (°C/°F).

## 🌐 Live Demo

- https://maahfuzdev.github.io/Weather-App/

## 📦 Project Structure

- `index.html` - User interface markup
- `styles.css` - Glassmorphism UI styles, responsive layout, animations
- `script.js` - App logic (API calls, rendering, units, theme, search, geolocation, offline handling)
- `image/` - Local weather icons (clear, clouds, rain, snow, mist)

## 💡 Features

- Search any city worldwide
- Use current location via Geolocation API
- Display:
  - temperature with feels-like
  - humidity, wind speed, pressure, visibility
  - sunrise, sunset, cloudiness, UV index
  - 5-day and 24-hour forecast
- Switch units between metric (°C/km/h) and imperial (°F/mph)
- Theme toggle (light/dark mode)
- Auto-refresh and saved preferences (localStorage)
- Network offline/online handling
- Animated transitions and toasts for success/error

## 🛠️ Requirements

- Modern browser with JavaScript enabled
- Internet connection for OpenWeather API

## ▶️ Run Locally

1. Open `index.html` directly in your browser.
2. Or use a local server (recommended):
   - VS Code Live Server
   - `python -m http.server 8000` (from project folder)

## 🔧 API Key

The app uses a hardcoded OpenWeather API key in `script.js`:

```js
const API_KEY = "e237b379bcbca1be371229d8fb8f0450";
```

For production, replace this with your own key and avoid checking it into source control.

## 🛡️ CORS / Security Notes

- To avoid key exposure, use backend proxy or serverless function in real deployment.
- OpenWeather API endpoints used:
  - `https://api.openweathermap.org/data/2.5/weather`
  - `https://api.openweathermap.org/data/2.5/forecast`
  - `https://api.openweathermap.org/data/3.0/onecall`

## 🪬 Customization

- Add/replace local icons in `image/`
- Alter theme gradients in `styles.css`
- Extend city autocomplete list in `script.js` -> `popularCities`

## 🧪 Troubleshooting

- If weather does not load, check console for errors and validate you have network connectivity
- City not found: check spelling and retry
- If geolocation fails, ensure browser location permission is granted

## 📝 Contribution

Feel free to fork, improve the forecast algorithm, or add more weather details like pollen, air quality, or map integration.
