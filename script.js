// Icon selector function
function getWeatherIconClass(code) {
  if (code === 0) return "fa-sun";
  if (code >= 1 && code <= 3) return "fa-cloud-sun";
  if (code === 45 || code === 48) return "fa-smog";
  if (code >= 51 && code <= 67) return "fa-cloud-showers-heavy";
  if (code >= 71 && code <= 77) return "fa-snowflake";
  if (code >= 95 && code <= 99) return "fa-cloud-bolt";
  return "fa-cloud";
}

async function getWeather() {
  const cityInput = document.getElementById('cityInput');
  const city = cityInput.value.trim();
  
  const loader = document.getElementById('loader');
  const errorMsg = document.getElementById('errorMessage');
  const weatherInfo = document.getElementById('weatherInfo');

  // Reset states
  errorMsg.style.display = 'none';
  errorMsg.innerText = '';

  if (!city) {
    errorMsg.innerText = 'দয়া করে একটি শহরের নাম লিখুন!';
    errorMsg.style.display = 'block';
    return;
  }

  // Show loading
  loader.style.display = 'block';
  weatherInfo.style.opacity = '0.3';

  try {
    // Step 1: Geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding HTTP error: ${geoResponse.status}`);
    }
    
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMsg.innerText = 'শহরটি খুঁজে পাওয়া যায়নি! সঠিক বানান লিখুন।';
      errorMsg.style.display = 'block';
      return;
    }

    const firstResult = geoData.results[0];
    const latitude = firstResult.latitude;
    const longitude = firstResult.longitude;
    const cityName = firstResult.name;
    const countryName = firstResult.country || '';

    // Step 2: Fetch Weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Weather HTTP error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      throw new Error('API response does not contain current_weather data');
    }

    const temp = weatherData.current_weather.temperature;
    const wind = weatherData.current_weather.windspeed;
    const code = weatherData.current_weather.weathercode;

    // Step 3: Update DOM Elements safely
    const nameElem = document.getElementById('cityName');
    const tempElem = document.getElementById('temperature');
    const windElem = document.getElementById('windSpeed');
    const iconElem = document.getElementById('weatherIcon');

    if (nameElem) nameElem.innerText = countryName ? `${cityName}, ${countryName}` : cityName;
    if (tempElem) tempElem.innerText = `${temp} °C`;
    if (windElem) windElem.innerText = `বাতাসের গতি: ${wind} km/h`;
    if (iconElem) iconElem.className = `fa-solid ${getWeatherIconClass(code)}`;

  } catch (error) {
    console.error('Full Error:', error);
    // স্ক্রিনেই আসল এরর মেসেজটি দেখাবে
    errorMsg.innerText = `Error: ${error.message}`;
    errorMsg.style.display = 'block';
  } finally {
    loader.style.display = 'none';
    weatherInfo.style.opacity = '1';
  }
}

// Enter Key Event Listener
document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('cityInput');
  if (cityInput) {
    cityInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        getWeather();
      }
    });
  }
});