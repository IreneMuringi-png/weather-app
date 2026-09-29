
const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('error');
const weatherCard = document.getElementById('weather-card');
const cityEl = document.getElementById('weather-city');
const iconEl = document.getElementById('weather-icon');
const tempEl = document.getElementById('weather-temp');
const descEl = document.getElementById('weather-desc');
const feelsEl = document.getElementById('weather-feels');
const humidityEl = document.getElementById('weather-humidity');
const windEl = document.getElementById('weather-wind');
const forecastBox = document.getElementById('forecast');
const forecastList = document.getElementById('forecast-list');
const locationBtn = document.getElementById('location-btn');

function getWeatherEmoji(code) {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌦️';
    if (code >= 500 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code > 800) return '☁️';
    return '🌡️';
}
function setBackground(weatherCode) {
    document.body.classList.remove(
        'weather-clear',
        'weather-clouds',
        'weather-rain',
        'weather-thunder',
        'weather-snow',
        'weather-mist'

    );
     if (weatherCode >= 200 && weatherCode < 300) {
    document.body.classList.add('weather-thunder');
  } else if (weatherCode >= 300 && weatherCode < 600) {
    document.body.classList.add('weather-rain');
  } else if (weatherCode >= 600 && weatherCode < 700) {
    document.body.classList.add('weather-snow');
  } else if (weatherCode >= 700 && weatherCode < 800) {
    document.body.classList.add('weather-mist');
  } else if (weatherCode === 800) {
    document.body.classList.add('weather-clear');
  } else if (weatherCode > 800) {
    document.body.classList.add('weather-clouds');
  }
} 

function showLoading() {
    loading.style.display = 'block';
    errorBox.style.display = 'none';
    weatherCard.style.display = 'none';
}
function showError(message) {
    loading.style.display = 'none';
    weatherCard.style.display = 'none';
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}
function showWeather() {
    loading.style.display = 'none';
    errorBox.style.display = 'none';
    weatherCard.style.display = 'block';

}
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${CONFIG.API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('City not found. Please check the spelling and try again.');

    }
    return response.json();

}
async function getForecast(city) {
  const url =  `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${CONFIG.API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load forecast.');

  }
  return response.json();
}
async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Could not load weather for your location.');

    }
    return response.json();
}

function renderWeather(data) {

    cityEl.textContent = `${data.name}, ${data.sys.country}`;
    iconEl.textContent = getWeatherEmoji(data.weather[0].id);
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    descEl.textContent = data.weather[0].description;
    feelsEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} m/s`;
    setBackground(data.weather[0].id);

    showWeather();

}
function renderForecast(data) {
  forecastList.innerHTML = '';
const seenDates = new Set ();
  const dailyForecasts = [];
  for(let i = 0; i < data.list.length; i++) {
    const entry = data.list[i];
    const date = new Date(entry.dt * 1000);
    const dateKey = date.toDateString();
    if(!seenDates.has(dateKey)) {
      seenDates.add(dateKey);
      dailyForecasts.push(entry);
    }
if (dailyForecasts.length === 5) break;

  }
  dailyForecasts.forEach(entry => {
    const date = new Date(entry.dt * 1000);
    const dayName = date.toLocaleDateString('en-KE', { weekday: 'short' });
    const icon = getWeatherEmoji(entry.weather[0].id);
    const high = Math.round(entry.main.temp_max);
    const low = Math.round(entry.main.temp_min);
    const div = document.createElement('div');
    div.className = 'forecast-day';
    div.innerHTML = `
    <div class="forecast-day-name">${dayName}</div>
    <div class="forecast-day-icon">${icon}</div>
    <div class="forecast-day-temp">${high}°/ <span class="low">${low}° </span></div>
    `;
    forecastList.appendChild(div);
  

  });
  forecastBox.style.display = 'block';

}
form.addEventListener('submit', async e=>{
    e.preventDefault();
      const city = cityInput.value.trim();
      if (!city) return;
      showLoading();
      try {
        const data = await getWeather(city);
        renderWeather(data);
        const forecastData = await getForecast(city);
        renderForecast(forecastData);
        cityInput.value = '';
      }
      catch (err) {
        showError(err.message);
      }
});
locationBtn.addEventListener('click', () => {
  if(!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
  return;
  }
  showLoading();
navigator.geolocation.getCurrentPosition(
  async position => {
    const { latitude, longitude } = position.coords;
    try {
      const data = await getWeatherByCoords(latitude, longitude);
      renderWeather(data);
      const forecastData = await getForecast(data.name);
      renderForecast(forecastData);

    } catch (err) {
      showError(err.message);

    }
  },
  error => {
    showError('Could not get your location. Please allow access and try again.');

  }
);
});