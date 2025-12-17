import { getTodayWeather } from "./weatherHelper.js";
import { getNextGame } from "./sportsHelper.js";

/* ----------------------------------
   GET COOKIES
-------------------------------------*/
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/* ----------------------------------
   LOAD USER PROFILE
-------------------------------------*/
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  document.getElementById("username").textContent = user.username || "Not set";
  document.getElementById("email").textContent = user.email || "Not set";
}

/* ----------------------------------
   FAVORITE TEAMS EDITOR
-------------------------------------*/
function loadFavoriteTeams() {
  const favList = document.getElementById("favorite-teams");
  favList.innerHTML = "";

  const teams = JSON.parse(localStorage.getItem("favoriteTeams")) || [];

  if (!teams.length) {
    favList.innerHTML = "<li>No favorite teams saved.</li>";
    return;
  }

  teams.forEach((team, index) => {
    const li = document.createElement("li");
    li.textContent = team;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.className = "remove-team-btn";
    removeBtn.onclick = () => removeTeam(index);

    li.appendChild(removeBtn);
    favList.appendChild(li);
  });
}

function addTeam() {
  const input = document.getElementById("team-input");
  const newTeam = input.value.trim();

  if (!newTeam) return;

  const teams = JSON.parse(localStorage.getItem("favoriteTeams")) || [];
  teams.push(newTeam);

  localStorage.setItem("favoriteTeams", JSON.stringify(teams));

  input.value = "";
  loadFavoriteTeams();
  loadNextGamesWeather();
}

function removeTeam(index) {
  const teams = JSON.parse(localStorage.getItem("favoriteTeams")) || [];
  teams.splice(index, 1);
  localStorage.setItem("favoriteTeams", JSON.stringify(teams));

  loadFavoriteTeams();
  loadNextGamesWeather();
}

document.getElementById("add-team-btn").addEventListener("click", addTeam);

/* ----------------------------------
   AUTO-DETECT LOCATION WEATHER
-------------------------------------*/
function loadLocalWeather() {
  const box = document.getElementById("weather-box");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const weather = await getWeatherForCoords(lat, lon);
      updateWeatherBox(weather);
    }, async () => {
      // fallback default city
      const weather = await getTodayWeather("Boston");
      updateWeatherBox(weather);
    });
  } else {
    getTodayWeather("Boston").then(updateWeatherBox);
  }
}

function updateWeatherBox(weather) {
  const box = document.getElementById("weather-box");

  if (weather.error) {
    box.textContent = weather.error;
    return;
  }

  box.innerHTML = `
    <div class="weather-widget">
      <img src="${weather.icon}" class="weather-icon">
      <div class="weather-info">
        <p><strong>${weather.city}</strong></p>
        <p>${weather.temperature}°F — ${weather.description}</p>
        <small>Wind: ${weather.wind} mph</small>
      </div>
    </div>
  `;
}

/* ----------------------------------
   NEXT GAME FORECAST SECTION
-------------------------------------*/
async function loadNextGamesWeather() {
  const container = document.getElementById("next-games-container");
  container.innerHTML = "Loading...";

  const teams = JSON.parse(localStorage.getItem("favoriteTeams")) || [];

  if (!teams.length) {
    container.innerHTML = "<p>No favorite teams saved.</p>";
    return;
  }

  container.innerHTML = ""; // clear

  for (let team of teams) {
    const game = await getNextGame(team);

    if (!game) {
      container.innerHTML += `<p>No upcoming game found for ${team}.</p>`;
      continue;
    }

    const weather = await getWeatherForCoords(
      game.latitude,
      game.longitude
    );

    container.innerHTML += `
      <div class="game-card">
        <h3>${team} — Next Game</h3>
        <p><strong>${game.opponent}</strong></p>
        <p>${game.location}</p>
        <p>${new Date(game.date).toLocaleString()}</p>
        <div class="weather-widget">
          <img src="${weather.icon}" class="weather-icon">
          <div>
            ${weather.temperature}°F — ${weather.description}<br>
            Wind: ${weather.wind} mph
          </div>
        </div>
      </div>
    `;
  }
}

/* ----------------------------------
   Save weather settings
-------------------------------------*/
async function saveSettings() {
  const userId = getCookie("userId");
  if (!userId) return;

  const weatherSettings = {
    "7-day": document.getElementById("forecast-days").value === "7" ? 1 : 0,
    "10-day": document.getElementById("forecast-days").value === "10" ? 1 : 0,
    WindDirection: document.getElementById("show-wind-Direction").checked ? 1 : 0,
    WindSpeed: document.getElementById("show-wind-Speed").checked ? 1 : 0,
    Icons: document.getElementById("show-icon").checked ? 1 : 0,
    Celcius: document.getElementById("temperature-unit").value === "celcius" ? 1 : 0
  };

  try {
    const res = await fetch("https://truesky-993c654d7f65.herokuapp.com/weatherSave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weatherSettings, userId })
    });

    const data = await res.json()
    if (res.ok) {
      console.log(data);
    }
  } catch {

  }
}
/* ----------------------------------
   Load weather settings
-------------------------------------*/
async function loadSettings() {
  var userId = getCookie('userId')
  var settings = getCookie('weatherSettings')
 
  var weatherSettingsArray = []
  // user doesnt have a favorite list
  if (settings != null && settings != '') {
    const parsed = JSON.parse(settings);
    // ensure it is an array
    if (Array.isArray(parsed)) {
      weatherSettingsArray.push(...parsed); // safe to spread
    } else if (parsed) {
      weatherSettingsArray.push(parsed); // single object, just push it
    }
  } else {

    var result = await getWeatherSettingsFromDb(userId)

    if (result?.weatherSettings?.length) {
      weatherSettingsArray = result.weatherSettings.map(team => JSON.parse(team))
    }

  }
  return weatherSettingsArray
}



async function getWeatherSettingsFromDb(userId) {
  const res = await fetch('https://truesky-993c654d7f65.herokuapp.com/getWeather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId })
  })
  const data = await res.json()
  return data
}



/* ----------------------------------
   LOGOUT
-------------------------------------*/
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

/* ----------------------------------
   INITIAL PAGE LOAD
-------------------------------------*/
window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadFavoriteTeams();
  loadLocalWeather();
  loadNextGamesWeather();
  loadSettings();

  document
    .getElementById("save-settings-btn")
    .addEventListener("click", saveSettings);
});
