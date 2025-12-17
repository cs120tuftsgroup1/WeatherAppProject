import { countryNameToCode, usStateAbrv } from './countryCode.js'
import { degreesToCompass } from './getWeather.js'

// Map sports to their respective leagues
const leaguesBySport = new Map([
  ['Basketball', ['NBA']],
  ['Football', ['NFL']],
  ['Baseball', ['MLB']],
  ['Hockey', ['NHL']],
  ['Soccer',
    [
      'MLS',
      'English Premier League',
      'La Liga',
      'Serie A',
      'Bundesliga',
      'Ligue 1',
      'UEFA Champions League'
    ]
  ]
])

// Map league names to their abbreviations used in the API
var abrvByLeague = new Map([
  ['NBA', 'nba'],
  ['NFL', 'nfl'],
  ['MLB', 'mlb'],
  ['NHL', 'nhl'],
  ['MLS', 'usa.1'],
  ['English Premier League', 'eng.1'],
  ['La Liga', 'esp.1'],
  ['Serie A', 'ita.1'],
  ['Bundesliga', 'ger.1'],
  ['Ligue 1', 'esp.1'],
  ['UEFA Champions League', 'uefa.champions']
])
// Populate sports and leagues dropdowns on page load
window.addEventListener('DOMContentLoaded', () => {

  var leagueSelect = document.getElementById('league-select')

  var sportsSelect = document.getElementById('sports-select')

  leaguesBySport.forEach((leagues, sport) => {
    var sportOption = document.createElement('option')
    sportOption.value = sport
    sportOption.text = sport
    sportsSelect.appendChild(sportOption)
  })

  leagueSelect.innerHTML = '' // Clear existing options

  // Get leagues for the first sport in the map
  var firstSport = leaguesBySport.keys().next().value
  var leagues = leaguesBySport.get(firstSport) || []

  // Populate league dropdown
  leagues.forEach(function (league) {
    var option = document.createElement('option')
    option.value = league
    option.text = league
    leagueSelect.appendChild(option)
  })
})

// Event listener for sport selection change
document
  .getElementById('sports-select')
  .addEventListener('change', function () {
    var selectedSport = this.value
    var leagueSelect = document.getElementById('league-select')

    // Clear existing options
    leagueSelect.innerHTML = ''

    // Get leagues for the selected sport
    var leagues = leaguesBySport.get(selectedSport) || []

    // Populate league dropdown
    leagues.forEach(function (league) {
      var option = document.createElement('option')
      option.value = league
      option.text = league
      leagueSelect.appendChild(option)
    })
  })

function closeWeatherWindow () {
  var weatherDiv = document.getElementById('weather-data-screen')
  weatherDiv.style.display = 'none'
  weatherDiv.innerHTML = ``
}

async function getWeatherForEvent (address, date, teamData, league) {
  var weatherDiv = document.getElementById('weather-data-screen')
  weatherDiv.style.display = 'flex'

  weatherDiv.innerHTML = `<p>Loading Weather Data.....`

  var locationResponse
  var locationData
  var longitude
  var latitude
  var countOrState
  if (address.state) {
    var stateName = usStateAbrv[address.state]

    locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${address.city}&countryCode=US`
    )

    locationData = await locationResponse.json()
    for (var i = 0; i < locationData.results.length; i++) {
      if (locationData.results[i].admin1 === stateName) {
        longitude = locationData.results[i].longitude
        latitude = locationData.results[i].latitude
        countOrState = stateName
        break
      }
    }
  } else {
    locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${
        address.city
      }&countryCode=${countryNameToCode[address.country]}`
    )
    locationData = await locationResponse.json()
    longitude = locationData.results[0].longitude
    latitude = locationData.results[0].latitude
    countOrState = address.country
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,windspeed_10m_max,winddirection_10m_dominant,weathercode&start_date=2025-12-14&end_date=2025-12-14&timezone=auto`
  )
  const weatherData = await response.json()
  weatherDiv.innerHTML = ``

  var weatherTitleContainer = document.createElement('div')
  var weatherTitle = document.createElement('h2')
  weatherTitle.textContent = `Weather Forecast for ${
    address.city
  }, ${countOrState} on ${new Date(date).toLocaleDateString()}`
  weatherTitle.className = 'weather-title'

  weatherTitleContainer.appendChild(weatherTitle)
  weatherDiv.appendChild(weatherTitleContainer)

  var weatherDataDiv = document.createElement('div')
  weatherDataDiv.className = 'weather-data'

  var closeButton = document.createElement('button')
  closeButton.textContent = 'Close'
  closeButton.className = 'filter-button'
  closeButton.addEventListener('click', closeWeatherWindow)

  

  const content = document.createElement('div')
  content.className = 'weather-content'
  content.innerHTML = `<p>Max Temperature: ${(
    weatherData.daily.temperature_2m_max[0] * (9 / 5) +
    32
  ).toFixed(1)} °F</p>
        <p>Min Temperature: ${(
          weatherData.daily.temperature_2m_min[0] * (9 / 5) +
          32
        ).toFixed(1)} °F</p>
        <p>Max Wind Speed: ${(
          weatherData.daily.windspeed_10m_max[0] * 0.621371
        ).toFixed(1)} mph</p>
        <p>Wind Direction: ${degreesToCompass(
          weatherData.current_weather.winddirection
        )}</p>
    `
  weatherDataDiv.appendChild(content)

  var favoriteDiv = document.createElement('div')
  favoriteDiv.className = 'fav-content'

  var awayTeamDiv = document.createElement('div')
  var awayTeamPara = document.createElement('p')
  var awayTeamButton = document.createElement('button')
  var awayTeamImg = document.createElement('img')
  var homeTeamDiv = document.createElement('div')
  var homeTeamImg = document.createElement('img')
  var homeTeamPara = document.createElement('p')
  var homeTeamButton = document.createElement('button')
  var homeTeamImg = document.createElement('img')

  awayTeamImg.className = 'team-log'
  awayTeamImg.src = teamData.awayTeamLogo
  awayTeamImg.alt = teamData.awatTeam
  awayTeamImg.style.width = '50px'
  awayTeamImg.style.height = 'auto'

  awayTeamButton.className = 'filter-button'
  awayTeamButton.textContent = 'Favorite'

  awayTeamButton.addEventListener('click', () => {
    addTeamFavorite(teamData.awayTeamId, league, awayTeamButton)
  })
  awayTeamDiv.className = 'Favorite-team-div'

  awayTeamPara.textContent = teamData.awayTeam
  awayTeamDiv.appendChild(awayTeamImg)
  awayTeamDiv.appendChild(awayTeamPara)
  awayTeamDiv.appendChild(awayTeamButton)
  favoriteDiv.appendChild(awayTeamDiv)

  homeTeamImg.className = 'team-log'
  homeTeamImg.src = teamData.homeTeamLogo
  homeTeamImg.alt = teamData.homeTeam
  homeTeamImg.style.width = '50px'
  homeTeamImg.style.height = 'auto'
  homeTeamButton.className = 'filter-button'
  homeTeamButton.textContent = 'Favorite'

  var teamArray = await getFavoriteTeams()
  // Double check we have a fav Array to split
  if(Array.isArray(teamArray) && teamArray.length > 0) 
  {

    //Check if user already selected the team as a fav. If so disable button
    if (teamArray.find(team => team.teamId == teamData.homeTeamId)) {
        homeTeamButton.disabled = true;
        homeTeamButton.style.background = '#808080';
        homeTeamButton.textContent = 'Favorited';
        homeTeamButton.style.cursor = 'default';
    }
    if (teamArray.includes(teamArray.find(team => team.teamId == teamData.awayTeamId))) {
        awayTeamButton.disabled = true
        awayTeamButton.style.background = '#808080'
        awayTeamButton.textContent = 'Favorited';
        awayTeamButton.style.cursor = 'default';
    }
  }
  homeTeamButton.addEventListener('click', () => {
    addTeamFavorite(teamData.homeTeamId,league, homeTeamButton)
  })
  homeTeamDiv.className = 'Favorite-team-div'
  homeTeamPara.textContent = teamData.homeTeam
  homeTeamDiv.appendChild(homeTeamImg)
  homeTeamDiv.appendChild(homeTeamPara)
  homeTeamDiv.appendChild(homeTeamButton)
  favoriteDiv.appendChild(homeTeamDiv)

  weatherDataDiv.appendChild(favoriteDiv)
  weatherDiv.appendChild(weatherDataDiv)
  weatherDiv.appendChild(closeButton)
  return weatherData
}

// MAIN FUNCTION TO ADD FAVORITES
async function addTeamFavorite (teamId,league, teamButton) {
  var userId = getCookie('userId');

  let favArray = await getFavoriteTeams() || [];
 

  if (Array.isArray(favArray) && favArray.length > 0) {
    var newTeam = {teamId: teamId, league: league}
    favArray.push(newTeam);


    if (updateFavoriteTeams(favArray, userId)) {
      teamButton.disabled = true
      teamButton.style.background = '#808080'
      teamButton.textContent = 'Favorited';
      teamButton.style.cursor = 'default';
      alert("The team has been added as a favorite");
    } else {
      throw new Error('Failed to update Favorites')
    }
  } else {
     
    // the user has no favorites saved.
    if (insertNewFavTeam({teamId: teamId, league: league}, userId)) {
      teamButton.disabled = true
      teamButton.style.background = '#808080'
      teamButton.textContent = 'Favorited';
      teamButton.style.cursor = 'default';
      alert("The team has been added as a favorite");
    }
  }
}

async function getFavoriteTeams () {
  var userId = getCookie('userId')
  var favs = getCookie('userFavs')
  var favArray = []
  // user doesnt have a favorite list
  if ( favs != null && favs != '') {
    const parsed = JSON.parse(favs); 
   // ensure it is an array
    if (Array.isArray(parsed)) {
      favArray.push(...parsed); // safe to spread
    } else if (parsed) {
      favArray.push(parsed); // single object, just push it
    }
  } else {
   
    var result = await getFavoriteTeamsFromDb(userId)

      if (result?.userFavs?.length) {
      favArray = result.userFavs.map(team => JSON.parse(team))
    }
    
  }
  return favArray
}

async function insertNewFavTeam (teamInfo, userId) {
  const res = await fetch('https://truesky-993c654d7f65.herokuapp.com/newFav', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, teamInfo })
  })
  const data = await res.json()
  if (data.success == true) {
    return true
  } else {
    return false
  }
}

async function updateFavoriteTeams (userFavs, userId) {
  const res = await fetch('https://truesky-993c654d7f65.herokuapp.com/updateFav', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, userFavs })
  })
  const data = await res.json()
  if (data.success == true) {
    return true
  } else {
    return false
  }
}
async function getFavoriteTeamsFromDb (userId) {
  const res = await fetch('https://truesky-993c654d7f65.herokuapp.com/getFav', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId })
  })
  const data = await res.json()
  return data
}

document.getElementById('getFavorites-btn').addEventListener('click', async function (event){
    
    event.preventDefault();
    var eventsContainer = document.getElementById('events-container')
      eventsContainer.innerHTML = '' // Clear previous results
      var sportsData = [];
    var userFavs =getCookie('userFavs');
    // Check if the user has the userFav cookie already saved.
    if( userFavs === '')
    {   
      //Check if they have any saved favorites in the database
      if(await getFavoriteTeamsFromDb().length == 0)
      {
            var eventsContainer = document.getElementById('events-container');
            eventsContainer.innerHTML = `<h2> You have no Favorite Teams </h2>`
      }  
    }    
    else
    {
      
      userFavs = JSON.parse(userFavs);

      if(!Array.isArray(userFavs))
      {
        var userFavArray = [];
        userFavArray.push(userFavs);
        userFavs = userFavArray
      }

      var todaysDate = new Date()
      todaysDate = formatDate(todaysDate, 0)
      var dateInAWeek = new Date()
      dateInAWeek = formatDate(dateInAWeek, 7)
 
   for (const team of userFavs) {
        
        var sportFound = Array.from(leaguesBySport.entries())
        .find(([sport, leagues]) => leagues.includes(team.league.toUpperCase()))?.[0];
            if(sportFound == null)
            {
               var abrvName = Array.from(abrvByLeague.entries())
              .find(([name, abrv]) => abrv.includes(team.league))?.[0];
  
              sportFound = Array.from(leaguesBySport.entries())
              .find(([sport, leagues]) => leagues.includes(abrvName))?.[0];  
            }
  
          const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${sportFound.toLowerCase()}/${team.league}/teams/${team.teamId}?dates=${todaysDate}-${dateInAWeek}`);

           const data = await response.json()
      
         var sportObject = formatTeamObject(data, team.league);
         sportsData.push(sportObject);
      }

      displaySportData(sportsData);
    }
});

// Event listener for the "Get Events" button
document
  .getElementById('get-events-btn')
  .addEventListener('click', async function (event) {
    // Prevent form submission
    event.preventDefault()

    // Get selected sport and league
    var sport = document.getElementById('sports-select').value
    var league = document.getElementById('league-select').value

    // Convert sport to lowercase for API compatibility
    var sportLower = sport.toLowerCase()

    // Map league to its abbreviation if available
    league = abrvByLeague.get(league) ? abrvByLeague.get(league) : league


    // Clear previous results
    
    // Fetch sports event data
    var eventData = await getSportsEventData(sportLower, league)

    displaySportData(eventData);
    
  })

  function displaySportData(eventData)
  {

    var eventsContainer = document.getElementById('events-container')
    eventsContainer.innerHTML = '' // Clear previous results

    // Display each event
    eventData.forEach(event => {
      var eventDiv = document.createElement('div')
      eventDiv.className = 'event'

      // Populate event details
      eventDiv.innerHTML = `
            <div class="teams-info">
                <div class ="teams-container">
                    <img class="team-logo" src="${event.awayTeamLogo}" alt="${
        event.awayTeam
      } Logo" style="width:50px; height:auto;">
                    <h3>${event.awayTeam}</h3>
                </div>
                <h3 class="at-text" >At</h3>
                <div class ="teams-container">
                    <img class="team-logo" src="${event.homeTeamLogo}" alt="${
        event.homeTeam
      } Logo" style="width:50px; height:auto;">
                    <h3>${event.homeTeam}</h3>
                </div>
            </div>
            <p><b>Location:</b> ${event.location}</p>
            <p><b>Date:</b> ${new Date(event.date).toLocaleDateString()}</p>
            <p><b>Time:</b> ${new Date(event.date).toLocaleTimeString()}</p>
        `
      const weatherBtn = document.createElement('button')
      weatherBtn.textContent = 'Check Weather'
      weatherBtn.className = 'filter-button'

      weatherBtn.addEventListener('click', () => {
        getWeatherForEvent(event.address, event.date, event, event.league)
      })

      eventsContainer.appendChild(eventDiv)
      eventDiv.appendChild(weatherBtn)
    })
  }

// Sports Event class
class SportsEvent {
  constructor (awayTeam, homeTeam, awayTeamLogo, homeTeamLogo, location, date) {
    this.awayTeamId = null;
    this.awayTeam = awayTeam
    this.awayTeamLogo = awayTeamLogo
    this.homeTeamLogo = homeTeamLogo
    this.homeTeam = homeTeam
    this.homeTeamId = null;
    this.loction = location
    this.date = date
    this.address = null
    this.league = null
  }
}

// Fetch sports event data from ESPN API
async function getSportsEventData (sport, league) {
  let sportsData = []

  var todaysDate = new Date()
  todaysDate = formatDate(todaysDate, 0)
  var dateInAWeek = new Date()
  dateInAWeek = formatDate(dateInAWeek, 7)

  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${todaysDate}-${dateInAWeek}`
  )
  const data = await response.json()  
  sportsData = formatSportsObject(data,league);
  return sportsData;
}

function formatSportsObject(data, league)
{ 
  var sportsData =[];
  data.events.forEach(eventJson => {
    var event = new SportsEvent(null, null, null, null, null, null)

    // Determine who is the home team and who is the away team
    if (eventJson.competitions[0].competitors[0].homeAway === 'home') {
      event.awayTeamId = eventJson.competitions[0].competitors[1].team.id;
      event.awayTeam = eventJson.competitions[0].competitors[1].team.displayName;
      event.awayTeamLogo = eventJson.competitions[0].competitors[1].team.logo;
      event.homeTeamId =   eventJson.competitions[0].competitors[0].team.id;
      event.homeTeamLogo = eventJson.competitions[0].competitors[0].team.logo;
      event.homeTeam = eventJson.competitions[0].competitors[0].team.displayName;
    } else {
      event.awayTeamId = eventJson.competitions[0].competitors[0].team.id;
      event.awayTeam = eventJson.competitions[0].competitors[0].team.displayName;
      event.awayTeamLogo = eventJson.competitions[0].competitors[0].team.logo;
      event.homeTeamId = eventJson.competitions[0].competitors[1].team.id;
      event.homeTeamLogo = eventJson.competitions[0].competitors[1].team.logo;
      event.homeTeam = eventJson.competitions[0].competitors[1].team.displayName;
    }

    event.location = eventJson.competitions[0].venue.fullName;
    event.date = eventJson.date;
    event.address = eventJson.competitions[0].venue.address;
    event.league = league;
    sportsData.push(event)
  })

  return sportsData
}

function formatTeamObject(eventJson, league)
{
    var sportsData = [];
   var event = new SportsEvent(null, null, null, null, null, null)
    const nextEvent = eventJson.team.nextEvent?.[0];
    const competitors = nextEvent?.competitions?.[0]?.competitors;
    if(competitors && competitors.length >= 2)
    {
      // Determine who is the home team and who is the away team
      if (competitors[0].homeAway === 'home') {
        event.awayTeamId   = competitors[1].team?.id;
        event.awayTeam     = competitors[1].team?.displayName;
        event.awayTeamLogo = competitors[1].team?.logos[0].href;
        event.homeTeamId   = competitors[0].team?.id;
        event.homeTeamLogo = competitors[0].team?.logos[0].href;
        event.homeTeam     = competitors[0].team?.displayName;
      } else {
        event.awayTeamId   = competitors[0].team?.id;
        event.awayTeam     = competitors[0].team?.displayName;
        event.awayTeamLogo = competitors[0].team?.logos[0].href;
        event.homeTeamId   = competitors[1].team?.id;
        event.homeTeamLogo = competitors[1].team?.logos[0].href;
        event.homeTeam     = competitors[1].team?.displayName;
      }
    }
    event.location = nextEvent.competitions[0].venue.fullName;
    event.date = nextEvent.date;
    event.address = nextEvent.competitions[0].venue.address;
    event.league = league;


    return event;
}

// Helper function to format date as YYYYMMDD
function formatDate (date, addDays) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate() + addDays).padStart(2, '0')

  return `${year}${month}${day}`
}

// get cookie based on name
function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}
