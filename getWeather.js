function getWeather() {
  const city = document.getElementById('city').value.trim();

  if (!city) {
    alert("Please enter a city.");
    return;
  }

  const geoLocation =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

  fetch(geoLocation)
    .then(response => response.json())
    .then(geoLocationData => {
      if (!geoLocationData.results || geoLocationData.results.length === 0) {
        document.getElementById('weather').innerText = "Location not found.";
        return;
      }

      const latitude = geoLocationData.results[0].latitude;
      const longitude = geoLocationData.results[0].longitude;

      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,windspeed_10m_max,weathercode` +
        `&timezone=auto`;

      return fetch(forecastUrl);
    })
    .then(response => response.json())
    .then(weatherData => {
      if (!weatherData || !weatherData.daily) {
        document.getElementById('weather').innerText = "No forecast data.";
        return;
      }

      const days = weatherData.daily.time;
      const maxTemps = weatherData.daily.temperature_2m_max;
      const minTemps = weatherData.daily.temperature_2m_min;
      const feelsLikeMax = weatherData.daily.apparent_temperature_max;
      const feelsLikeMin = weatherData.daily.apparent_temperature_min;
      const weatherCodes = weatherData.daily.weathercode;
      const windSpeeds = weatherData.daily.windspeed_10m_max;

      let html = `<h3>7-Day Forecast for ${city}</h3>`;

      for (let i = 0; i < 7; i++) {
        const maxF = (maxTemps[i] * 9 / 5 + 32).toFixed(1);
        const minF = (minTemps[i] * 9 / 5 + 32).toFixed(1);
        const feelsMaxF = (feelsLikeMax[i] * 9 / 5 + 32).toFixed(1);
        const feelsMinF = (feelsLikeMin[i] * 9 / 5 + 32).toFixed(1);
        const windMph = (windSpeeds[i] * 0.621371).toFixed(1);

        const icon = getWeatherIcon(weatherCodes[i]);

        html += `
          <div class="day">
            <strong>${days[i]}</strong>
            <div class="icon">
              <img src="${icon}" alt="Weather icon">
            </div>
            High: ${maxF} °F (Feels like ${feelsMaxF} °F)<br>
            Low: ${minF} °F (Feels like ${feelsMinF} °F)<br>
            Wind: ${windMph} mph
          </div>
        `;
      }

      document.getElementById('weather').innerHTML = html;
    })
    .catch(error => {
      console.error(error);
      document.getElementById('weather').innerText =
        "Failed to retrieve weather data.";
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
96, 99 *	Thunderstorm with slight and heavy hail*/
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