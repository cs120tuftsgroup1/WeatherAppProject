export async function getTodayWeather(city) {
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
  const geoRes = await fetch(geoURL);
  const geoData = await geoRes.json();

  if (!geoData.results?.length) return { error: "City not found." };

  const { latitude, longitude } = geoData.results[0];

  const weatherURL =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current_weather=true&timezone=auto`;

  const weatherRes = await fetch(weatherURL);
  const weatherData = await weatherRes.json();

  const tempF = (weatherData.current_weather.temperature * 9/5 + 32).toFixed(1);
  const wind = (weatherData.current_weather.windspeed * 0.621371).toFixed(1);
  const code = weatherData.current_weather.weathercode;

  return {
    city,
    temperature: tempF,
    wind,
    icon: getIcon(code),
    description: getDesc(code)
  };
}

function getIcon(code) {
  if (code === 0) return "pics/clear.png";
  if (code <= 2) return "pics/partlyCloudy.png";
  if (code === 3) return "pics/overcast.png";
  if (code >= 45 && code <= 48) return "pics/fog.png";
  if (code >= 51 && code <= 67) return "pics/rain.png";
  if (code >= 71 && code <= 77) return "pics/snow.png";
  if (code >= 80 && code <= 82) return "pics/rainShower.png";
  return "pics/thunderStorm.png";
}

function getDesc(code) {
  if (code === 0) return "Clear skies";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Showers";
  return "Thunderstorms";
}
