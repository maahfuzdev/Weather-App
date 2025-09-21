// WeatherPro - Advanced Weather Dashboard
// Complete JavaScript Implementation

// ===========================================
// API CONFIGURATION & GLOBAL VARIABLES
// ===========================================

const API_KEY = "e237b379bcbca1be371229d8fb8f0450";
const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API = "https://api.openweathermap.org/data/2.5/forecast";
const ONECALL_API = "https://api.openweathermap.org/data/3.0/onecall";

// Global State Management
let currentUnits = 'metric';
let currentForecastType = 'daily';
let currentWeatherData = null;
let lastUpdateTime = null;
let refreshInterval = null;
let isOnline = navigator.onLine;

// Popular cities for autocomplete functionality
const popularCities = [
    'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Dubai', 
    'Singapore', 'Barcelona', 'Amsterdam', 'Berlin', 'Rome', 'Bangkok',
    'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Rangpur',
    'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Montreal',
    'Cairo', 'Moscow', 'Istanbul', 'Seoul', 'Hong Kong'
];

// Weather condition mappings with local images
const weatherConditions = {
    'clear': { emoji: '☀️', color: '#f093fb', image: 'image/clear.png' },
    'clouds': { emoji: '☁️', color: '#667eea', image: 'image/clouds.png' },
    'rain': { emoji: '🌧️', color: '#4facfe', image: 'image/rain.png' },
    'drizzle': { emoji: '🌦️', color: '#4facfe', image: 'image/drizzle.png' },
    'thunderstorm': { emoji: '⛈️', color: '#2c3e50', image: 'image/rain.png' },
    'snow': { emoji: '❄️', color: '#e0eafc', image: 'image/snow.png' },
    'mist': { emoji: '🌫️', color: '#bdc3c7', image: 'image/mist.png' },
    'fog': { emoji: '🌫️', color: '#bdc3c7', image: 'image/mist.png' },
    'haze': { emoji: '🌫️', color: '#bdc3c7', image: 'image/mist.png' }
};

// Function to get local weather icon based on condition
function getLocalWeatherIcon(weatherCondition, isDay = true) {
    const condition = weatherCondition.toLowerCase();
    
    // Map different weather conditions to your local images
    switch (condition) {
        case 'clear':
        case 'sunny':
            return isDay ? 'image/clear.png' : 'image/clear.png';
        
        case 'clouds':
        case 'partly-cloudy':
        case 'overcast':
            return 'image/clouds.png';
        
        case 'rain':
        case 'light-rain':
        case 'heavy-rain':
        case 'shower':
            return 'image/rain.png';
        
        case 'drizzle':
        case 'light-drizzle':
            return 'image/drizzle.png';
        
        case 'thunderstorm':
        case 'thunder':
        case 'lightning':
            return 'image/rain.png'; // You can create a thunder.png if you have one
        
        case 'snow':
        case 'light-snow':
        case 'heavy-snow':
        case 'blizzard':
            return 'image/snow.png';
        
        case 'mist':
        case 'fog':
        case 'haze':
        case 'smoke':
            return 'image/mist.png';
        
        default:
            return 'image/clear.png'; // Default fallback
    }
}

// ===========================================
// APPLICATION INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌤️ WeatherPro - Advanced Weather Dashboard Initializing...');
    
    initializeApp();
    setupEventListeners();
    initializeTheme();
    fetchWeatherData('Dhaka');
    startAutoRefresh();
    
    console.log('✅ WeatherPro initialized successfully!');
});

function initializeApp() {
    // Load saved preferences from localStorage
    const savedUnits = localStorage.getItem('weatherapp_units') || 'metric';
    const savedTheme = localStorage.getItem('weatherapp_theme') || 'auto';
    const savedCity = localStorage.getItem('weatherapp_last_city') || 'Dhaka';
    
    currentUnits = savedUnits;
    updateUnitsUI();
    
    // Apply saved theme if not auto
    if (savedTheme !== 'auto') {
        applyTheme(savedTheme);
    }
    
    // Show app version or welcome message
    console.log('🚀 WeatherPro v2.0 - Premium Weather Experience');
    
    // Initialize offline/online status
    updateConnectionStatus();
}

function setupEventListeners() {
    // Search input events
    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('keypress', handleSearchKeyPress);
        cityInput.addEventListener('input', debounce(handleSearchInput, 300));
        cityInput.addEventListener('focus', showSearchSuggestions);
        cityInput.addEventListener('blur', hideSearchSuggestions);
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Window events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('beforeunload', saveAppState);
    window.addEventListener('resize', handleWindowResize);

    // Prevent right-click on weather icons (optional UX enhancement)
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('weather-icon') || e.target.classList.contains('forecast-icon')) {
            e.preventDefault();
        }
    });
}

// ===========================================
// THEME MANAGEMENT
// ===========================================

function initializeTheme() {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 19;
    const themeBtn = document.querySelector('.theme-toggle');
    
    if (isNight) {
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        if (themeBtn) themeBtn.textContent = '🌙';
    }
}

function toggleTheme() {
    const themeBtn = document.querySelector('.theme-toggle');
    const body = document.body;
    
    if (!themeBtn) return;
    
    if (themeBtn.textContent === '🌙') {
        applyTheme('dark');
        themeBtn.textContent = '☀️';
        localStorage.setItem('weatherapp_theme', 'dark');
        showSuccess('🌙 Dark theme activated');
    } else {
        applyTheme('light');
        themeBtn.textContent = '🌙';
        localStorage.setItem('weatherapp_theme', 'light');
        showSuccess('☀️ Light theme activated');
    }
}

function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        body.classList.add('dark-theme');
    } else {
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        body.classList.remove('dark-theme');
    }
    
    // Animate theme transition
    body.style.transition = 'background 0.5s ease-in-out';
    setTimeout(() => {
        body.style.transition = '';
    }, 500);
}

// ===========================================
// UNITS MANAGEMENT
// ===========================================

function setUnits(unit) {
    if (currentUnits === unit) return;
    
    currentUnits = unit;
    localStorage.setItem('weatherapp_units', unit);
    updateUnitsUI();
    
    // Show loading for better UX
    if (currentWeatherData) {
        showSuccess(`🌡️ Switched to ${unit === 'metric' ? 'Celsius' : 'Fahrenheit'}`);
        const city = currentWeatherData.name;
        fetchWeatherData(city);
    }
}

function updateUnitsUI() {
    const unitButtons = document.querySelectorAll('.unit-btn');
    unitButtons.forEach(btn => {
        btn.classList.remove('active');
        const isMetric = btn.textContent.includes('°C');
        const isImperial = btn.textContent.includes('°F');
        
        if ((currentUnits === 'metric' && isMetric) || (currentUnits === 'imperial' && isImperial)) {
            btn.classList.add('active');
        }
    });
}

// ===========================================
// UI FEEDBACK SYSTEM
// ===========================================

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('active');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('active');
    }
}

function showError(message) {
    const errorToast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorToast && errorMessage) {
        errorMessage.textContent = message;
        errorToast.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 5000);
    }

    // Log error for debugging
    console.error('🚨 WeatherPro Error:', message);
    
    // Haptic feedback on mobile devices
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
}

function showSuccess(message) {
    // Create success toast dynamically
    const successToast = document.createElement('div');
    successToast.className = 'error-toast show';
    successToast.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
    successToast.innerHTML = `<div>${message}</div>`;
    
    document.body.appendChild(successToast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        successToast.classList.remove('show');
        setTimeout(() => {
            if (successToast.parentNode) {
                successToast.remove();
            }
        }, 400);
    }, 3000);

    console.log('✅ Success:', message);
}

// ===========================================
// WEATHER DATA FETCHING
// ===========================================

async function fetchWeatherData(city) {
    if (!isOnline) {
        showError('You are offline. Please check your internet connection.');
        return;
    }

    try {
        showLoading();
        
        // Validate city name
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            throw new Error('Invalid city name provided');
        }

        const encodedCity = encodeURIComponent(city.trim());
        
        // Fetch current weather with timeout
        const weatherController = new AbortController();
        const weatherTimeout = setTimeout(() => weatherController.abort(), 10000);
        
        const weatherResponse = await fetch(
            `${WEATHER_API}?q=${encodedCity}&units=${currentUnits}&appid=${API_KEY}`,
            { signal: weatherController.signal }
        );
        
        clearTimeout(weatherTimeout);
        
        if (!weatherResponse.ok) {
            throw new Error(`HTTP ${weatherResponse.status}: Unable to fetch weather data`);
        }
        
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
            throw new Error(weatherData.message || 'City not found');
        }

        // Store current weather data
        currentWeatherData = weatherData;
        lastUpdateTime = new Date();
        
        // Save last searched city
        localStorage.setItem('weatherapp_last_city', weatherData.name);

        // Fetch forecast data
        const forecastController = new AbortController();
        const forecastTimeout = setTimeout(() => forecastController.abort(), 10000);
        
        const forecastResponse = await fetch(
            `${FORECAST_API}?q=${encodedCity}&units=${currentUnits}&appid=${API_KEY}`,
            { signal: forecastController.signal }
        );
        
        clearTimeout(forecastTimeout);
        const forecastData = await forecastResponse.json();

        // Update UI components
        await updateCurrentWeather(weatherData);
        await updateForecast(forecastData);
        updateBackground(weatherData.weather[0].main);
        displayWeatherAdvice();
        checkAndDisplayAlerts(weatherData);
        
        // Success feedback
        showSuccess(`🌍 Weather updated for ${weatherData.name}, ${weatherData.sys.country}`);
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        
        if (error.name === 'AbortError') {
            showError('Request timeout. Please try again.');
        } else {
            showError(`Unable to fetch weather data: ${error.message}`);
        }
        
        console.error('🚨 Weather fetch error:', error);
    }
}

// ===========================================
// CURRENT WEATHER UPDATE
// ===========================================

async function updateCurrentWeather(data) {
    try {
        const tempUnit = currentUnits === 'metric' ? '°C' : '°F';
        const windUnit = currentUnits === 'metric' ? 'km/h' : 'mph';
        const windSpeed = currentUnits === 'metric' ? 
            Math.round(data.wind.speed * 3.6) : 
            Math.round(data.wind.speed * 2.237);
        
        // Update main weather info with animations
        await animateTextUpdate('temperature', `${Math.round(data.main.temp)}${tempUnit}`);
        await animateTextUpdate('location', `${data.name}, ${data.sys.country}`);
        await animateTextUpdate('description', data.weather[0].description);
        await animateTextUpdate('feelsLike', `Feels like ${Math.round(data.main.feels_like)}${tempUnit}`);
        
        // Update weather icon with smooth transition using local images
        const weatherIcon = document.getElementById('weatherIcon');
        if (weatherIcon) {
            const condition = data.weather[0].main;
            const iconCode = data.weather[0].icon;
            const isDay = iconCode.includes('d'); // 'd' for day, 'n' for night
            
            // Get local image path
            const localIconSrc = getLocalWeatherIcon(condition, isDay);
            
            // Preload new local image
            const img = new Image();
            img.onload = () => {
                weatherIcon.style.opacity = '0.5';
                setTimeout(() => {
                    weatherIcon.src = localIconSrc;
                    weatherIcon.alt = `${condition} weather icon`;
                    weatherIcon.style.opacity = '1';
                }, 200);
            };
            
            // Fallback to OpenWeather icon if local image fails to load
            img.onerror = () => {
                const fallbackSrc = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                weatherIcon.style.opacity = '0.5';
                setTimeout(() => {
                    weatherIcon.src = fallbackSrc;
                    weatherIcon.alt = `${condition} weather icon`;
                    weatherIcon.style.opacity = '1';
                }, 200);
            };
            
            img.src = localIconSrc;
        }
        
        // Add pulse animation to main weather card
        const mainWeather = document.getElementById('mainWeather');
        if (mainWeather) {
            mainWeather.classList.add('pulse-animation');
            setTimeout(() => mainWeather.classList.remove('pulse-animation'), 2000);
        }
        
        // Update statistics with smooth animations
        await updateStatWithAnimation('humidity', `${data.main.humidity}%`);
        await updateStatWithAnimation('windSpeed', `${windSpeed} ${windUnit}`);
        await updateStatWithAnimation('pressure', `${data.main.pressure} hPa`);
        await updateStatWithAnimation('visibility', `${(data.visibility / 1000).toFixed(1)} km`);
        
        // Update additional details
        updateElement('cloudiness', `${data.clouds.all}%`);
        
        // Update sunrise/sunset with proper formatting
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        
        updateElement('sunrise', formatTime(sunrise));
        updateElement('sunset', formatTime(sunset));

        // Calculate and display UV Index
        await updateUVIndex(data.coord);
        
    } catch (error) {
        console.error('Error updating current weather:', error);
    }
}

function animateTextUpdate(elementId, newText) {
    return new Promise((resolve) => {
        const element = document.getElementById(elementId);
        if (!element) {
            resolve();
            return;
        }
        
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            resolve();
        }, 150);
    });
}

function updateStatWithAnimation(elementId, value) {
    return new Promise((resolve) => {
        const element = document.getElementById(elementId);
        if (!element) {
            resolve();
            return;
        }
        
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            element.textContent = value;
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            resolve();
        }, 150);
    });
}

function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

async function updateUVIndex(coords) {
    try {
        // Simulate UV index based on time and season
        const hour = new Date().getHours();
        const month = new Date().getMonth();
        let uvIndex = 0;
        
        // Calculate UV index based on time of day and season
        if (hour >= 6 && hour <= 18) {
            const peak = hour >= 10 && hour <= 14 ? 1.5 : 1;
            const seasonal = month >= 3 && month <= 8 ? 1.2 : 0.8;
            uvIndex = Math.floor(Math.random() * 8 * peak * seasonal) + 1;
        }
        
        const uvElement = document.getElementById('uvIndex');
        if (uvElement) {
            uvElement.textContent = uvIndex > 0 ? uvIndex : 'Low';
            
            // Add color coding for UV index
            if (uvIndex <= 2) {
                uvElement.style.color = '#4CAF50'; // Green - Low
            } else if (uvIndex <= 5) {
                uvElement.style.color = '#FF9800'; // Orange - Moderate
            } else if (uvIndex <= 7) {
                uvElement.style.color = '#FF5722'; // Red - High
            } else {
                uvElement.style.color = '#9C27B0'; // Purple - Very High
            }
        }
    } catch (error) {
        console.error('Error updating UV index:', error);
        updateElement('uvIndex', 'N/A');
    }
}

// ===========================================
// FORECAST MANAGEMENT
// ===========================================

async function updateForecast(data) {
    const container = document.getElementById('forecastContainer');
    if (!container) return;
    
    // Clear existing forecast with animation
    Array.from(container.children).forEach((child, index) => {
        setTimeout(() => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(-20px)';
        }, index * 50);
    });
    
    setTimeout(() => {
        container.innerHTML = '';
        
        if (currentForecastType === 'daily') {
            updateDailyForecast(data, container);
        } else {
            updateHourlyForecast(data, container);
        }
    }, 300);
}

function updateDailyForecast(data, container) {
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    const tempUnit = currentUnits === 'metric' ? '°' : '°F';

    dailyForecasts.forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Calculate high/low temperatures for better accuracy
        const dayStartIndex = index * 8;
        const dayData = data.list.slice(dayStartIndex, dayStartIndex + 8);
        const temps = dayData.map(item => item.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.style.opacity = '0';
        forecastItem.style.transform = 'translateY(20px)';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                 alt="${forecast.weather[0].description}" 
                 class="forecast-icon"
                 title="${forecast.weather[0].description}"
                 loading="lazy">
            <div class="forecast-temp">${maxTemp}${tempUnit} / ${minTemp}${tempUnit}</div>
            <div class="forecast-desc">${forecast.weather[0].main}</div>
        `;
        
        container.appendChild(forecastItem);
        
        // Animate in
        setTimeout(() => {
            forecastItem.style.opacity = '1';
            forecastItem.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function updateHourlyForecast(data, container) {
    const hourlyForecasts = data.list.slice(0, 8);
    const tempUnit = currentUnits === 'metric' ? '°C' : '°F';

    hourlyForecasts.forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const hour = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.style.opacity = '0';
        forecastItem.style.transform = 'translateY(20px)';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${hour}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                 alt="${forecast.weather[0].description}" 
                 class="forecast-icon"
                 title="${forecast.weather[0].description}"
                 loading="lazy">
            <div class="forecast-temp">${Math.round(forecast.main.temp)}${tempUnit}</div>
            <div class="forecast-desc">${forecast.weather[0].main}</div>
        `;
        
        container.appendChild(forecastItem);
        
        // Animate in
        setTimeout(() => {
            forecastItem.style.opacity = '1';
            forecastItem.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ===========================================
// BACKGROUND & VISUAL EFFECTS
// ===========================================

function updateBackground(weatherCondition) {
    const body = document.body;
    const themeBtn = document.querySelector('.theme-toggle');
    
    // Only update if in auto theme mode
    if (themeBtn && themeBtn.textContent === '🌙') {
        const condition = weatherCondition.toLowerCase();
        let gradient;

        switch (condition) {
            case 'clear':
                gradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)';
                break;
            case 'clouds':
                gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)';
                break;
            case 'rain':
            case 'drizzle':
                gradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #667eea 100%)';
                break;
            case 'snow':
                gradient = 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 50%, #a8c8f0 100%)';
                break;
            case 'thunderstorm':
                gradient = 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #4a6741 100%)';
                break;
            case 'mist':
            case 'fog':
                gradient = 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 50%, #7f8c8d 100%)';
                break;
            default:
                gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
        }

        // Smooth transition
        body.style.transition = 'background 1s ease-in-out';
        body.style.background = gradient;
        
        setTimeout(() => {
            body.style.transition = '';
        }, 1000);
    }
}

// ===========================================
// SEARCH FUNCTIONALITY
// ===========================================

function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    if (!cityInput) return;
    
    const city = cityInput.value.trim();
    
    if (city) {
        fetchWeatherData(city);
        cityInput.value = '';
        cityInput.blur(); // Remove focus
    } else {
        showError('Please enter a city name');
        cityInput.focus();
    }
}

function handleSearchKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchWeather();
    }
}

function handleSearchInput(e) {
    const value = e.target.value.toLowerCase().trim();
    
    if (value.length >= 2) {
        // Show autocomplete suggestions
        showAutocompleteSuggestions(value);
    } else {
        hideAutocompleteSuggestions();
    }
}

function showAutocompleteSuggestions(query) {
    // Filter popular cities based on query
    const matches = popularCities.filter(city => 
        city.toLowerCase().includes(query)
    ).slice(0, 5);
    
    // Create or update suggestions container
    let suggestionsContainer = document.getElementById('suggestions');
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'suggestions';
        suggestionsContainer.className = 'suggestions-container';
        
        const searchWrapper = document.querySelector('.search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(suggestionsContainer);
        }
    }
    
    // Clear existing suggestions
    suggestionsContainer.innerHTML = '';
    
    if (matches.length > 0) {
        matches.forEach(city => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.textContent = city;
            suggestion.addEventListener('click', () => {
                document.getElementById('cityInput').value = city;
                fetchWeatherData(city);
                hideAutocompleteSuggestions();
            });
            
            suggestionsContainer.appendChild(suggestion);
        });
        
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

function hideAutocompleteSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function showSearchSuggestions() {
    // Show recent searches or popular cities when input is focused
    const value = document.getElementById('cityInput').value.trim();
    if (value.length >= 2) {
        showAutocompleteSuggestions(value);
    }
}

// ===========================================
// GEOLOCATION FUNCTIONALITY
// ===========================================

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        options
    );
}

async function handleLocationSuccess(position) {
    try {
        const { latitude, longitude } = position.coords;
        
        // Fetch weather by coordinates
        const response = await fetch(
            `${WEATHER_API}?lat=${latitude}&lon=${longitude}&units=${currentUnits}&appid=${API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.cod !== 200) {
            throw new Error(data.message);
        }
        
        currentWeatherData = data;
        
        // Update current weather
        await updateCurrentWeather(data);
        
        // Fetch forecast for current location
        const forecastResponse = await fetch(
            `${FORECAST_API}?lat=${latitude}&lon=${longitude}&units=${currentUnits}&appid=${API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();
        await updateForecast(forecastData);
        updateBackground(data.weather[0].main);
        displayWeatherAdvice();
        checkAndDisplayAlerts(data);
        
        showSuccess(`📍 Located: ${data.name}, ${data.sys.country}`);
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError(`Error getting location weather: ${error.message}`);
    }
}

function handleLocationError(error) {
    hideLoading();
    
    let message = 'Unable to get your location. ';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message += 'Location access denied by user.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            message += 'Location request timed out.';
            break;
        default:
            message += 'Unknown location error occurred.';
            break;
    }
    
    showError(message);
}

// ===========================================
// FORECAST TOGGLE FUNCTIONALITY
// ===========================================

function toggleForecast(type) {
    if (currentForecastType === type) return;
    
    currentForecastType = type;
    
    // Update toggle buttons UI
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct button
    const activeButton = Array.from(document.querySelectorAll('.toggle-btn'))
        .find(btn => btn.textContent.toLowerCase().includes(type === 'daily' ? 'day' : 'hour'));
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update forecast display
    if (currentWeatherData) {
        // Re-fetch forecast data to ensure we have the latest
        const city = currentWeatherData.name;
        
        fetch(`${FORECAST_API}?q=${encodeURIComponent(city)}&units=${currentUnits}&appid=${API_KEY}`)
            .then(response => response.json())
            .then(data => updateForecast(data))
            .catch(error => console.error('Error updating forecast:', error));
    }
    
    // Provide user feedback
    const typeLabel = type === 'daily' ? '5-Day' : '24-Hour';
    showSuccess(`📊 Switched to ${typeLabel} forecast`);
}