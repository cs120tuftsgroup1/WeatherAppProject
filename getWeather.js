
const temp = "C";
const wind = true;        // Show wind speed
const direction = true;   // Show wind direction
const showIcons = true;
const weatherBtn = document.querySelector("#get-weather-button");

if (weatherBtn) {
    weatherBtn.addEventListener("click", getWeather);
}

 function getWeather () {

  const city = document.getElementById('city').value.trim();
  const country = document.getElementById('country').value;

  if (!city) {
    alert("Please enter a city.");
    return;
  }
  if (!country) {
    alert("Please select a country.");
    return;
  }

  const geoLocation = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json&country=${country}`;

  fetch(geoLocation)
    .then(response => response.json())
    .then(geoLocationData => {
      if (!geoLocationData.results || geoLocationData.results.length === 0) {
        document.getElementById('weather').innerText = "Location not found.";
        return;
      }

      const results = geoLocationData.results;
      const matches = results.filter(
        place => place.name.toLowerCase() === city.toLowerCase() && place.country_code === country
      );

      if (matches.length === 0) {
        document.getElementById('weather').innerText = "Location not found.";
        return;
      }

      const chosen = matches[0];
      const latitude = chosen.latitude;
      const longitude = chosen.longitude;

      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current_weather=true` +
        `&daily=temperature_2m_max,temperature_2m_min,` +
        `apparent_temperature_max,apparent_temperature_min,` +
        `windspeed_10m_max,winddirection_10m_dominant,weathercode` +
        `&forecast_days=14&timezone=auto`;

      return fetch(forecastUrl);
    })
    .then(response => response.json())
    .then(weatherData => {
      if (!weatherData || !weatherData.daily) {
        document.getElementById('weather').innerText = "No forecast data.";
        return;
      }


      function formatTemp(value) {
        return temp === "C" ? value.toFixed(1) : (value * 9 / 5 + 32).toFixed(1);
      }

      let temperatureUnit;

      if (temp === "C") {
        temperatureUnit = "°C";
      } else {
        temperatureUnit = "°F";
      }

      // Current weather
      const currentTemp = formatTemp(weatherData.current_weather.temperature);
      const currentWindMph = (weatherData.current_weather.windspeed * 0.621371).toFixed(1);
      const currentDirection = degreesToCompass(weatherData.current_weather.winddirection);
      const currentWeatherIcon = getWeatherIcon(weatherData.current_weather.weathercode);

      const days = weatherData.daily.time;
      const maxTemps = weatherData.daily.temperature_2m_max;
      const minTemps = weatherData.daily.temperature_2m_min;
      const feelsLikeMax = weatherData.daily.apparent_temperature_max;
      const feelsLikeMin = weatherData.daily.apparent_temperature_min;
      const weatherCodes = weatherData.daily.weathercode;
      const windSpeeds = weatherData.daily.windspeed_10m_max;
      const windDirections = weatherData.daily.winddirection_10m_dominant;

      let html = `
                <div class="current">
                    <h3>Current Weather in ${city}</h3>
                    <div class="current-day">
                        <strong>Now</strong>
                        ${showIcons ? `<div class="icon"><img src="${currentWeatherIcon}" alt="Current Weather Icon"></div>` : ""}
                        High: ${currentTemp} ${temperatureUnit}<br>
                        ${wind ? `Wind: ${currentWindMph} mph ${direction ? " from " + currentDirection : ""}` : ""}
                    </div>
                </div>

                <h3 class="forecast-title">7-Day Forecast</h3>
                <div class="forecast-grid">
            `;

      for (let i = 0; i < 7; i++) {
        const maxT = formatTemp(maxTemps[i]);
        const minT = formatTemp(minTemps[i]);
        const feelsMax = formatTemp(feelsLikeMax[i]);
        const feelsMin = formatTemp(feelsLikeMin[i]);
        const windMph = (windSpeeds[i] * 0.621371).toFixed(1);
        const windDir = degreesToCompass(windDirections[i]);
        const icon = getWeatherIcon(weatherCodes[i]);

        html += `
                    <div class="day">
                        <strong>${days[i]}</strong>
                        ${showIcons ? `<div class="icon"><img src="${icon}" alt="Weather icon"></div>` : ""}
                        High: ${maxT} ${temperatureUnit} (Feels like ${feelsMax} ${temperatureUnit})<br>
                        Low: ${minT} ${temperatureUnit} (Feels like ${feelsMin} ${temperatureUnit})<br>
                        ${wind ? `Wind: ${windMph} mph ${direction ? " from " + windDir : ""}` : ""}
                    </div>
                `;
            }

      html += `</div>`;
      document.getElementById('weather').innerHTML = html;
    })
    .catch(error => {
      console.error(error);
      document.getElementById('weather').innerText = "Failed to retrieve weather data.";
    });
  }


//https://open-meteo.com/en/docs?hourly=temperature_2m,weather_code&daily=weather_code&timezone=America%2FNew_York#data_sources
/* Code	Description
0	Clear sky
1, 2, 3	Mainly clear, partly cloudy, and overcast
45, 48	Fog and depositing rime fog
51, 53, 55	Drizzle: Light, moderate, and dense intensity
56, 57	Freezing Drizzle: Light and dense intensity
61, 63, 65	Rain: Slight, moderate and heavy intensity
66, 67	Freezing Rain: Light and heavy intensity
71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
77	Snow grains
80, 81, 82	Rain showers: Slight, moderate, and violent
85, 86	Snow showers slight and heavy
95 *	Thunderstorm: Slight or moderate
96, 99 *	Thunderstorm with slight and heavy hail
https://www.flaticon.com/search?word
*/
function getWeatherIcon(code) {
  if (code === 0) return "pics/clear.png";
  if (code <= 2) return "pics/partlyCloudy.png";
  if (code === 3) return "pics/overcast.png";
  if (code >= 45 && code <= 48) return "pics/fog.png";
  if (code >= 51 && code <= 67) return "pics/rain.png";
  if (code >= 71 && code <= 77) return "pics/snow.png";
  if (code >= 80 && code <= 82) return "pics/rainShower.png";
  if (code >= 95) return "pics/thunderStorm.png";
}

/* ---------- WIND DIRECTION ---------- */
export function degreesToCompass(deg) {
  if (deg >= 315 || deg < 45) return "North";
  if (deg < 135) return "East";
  if (deg < 225) return "South";
  return "West";
}


window.onload = function () {
  const name = getCookie("userId");
  if (!name) {
    window.location.href = "logIn.html";
  } 
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}










