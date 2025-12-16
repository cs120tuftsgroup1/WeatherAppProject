import { countryNameToCode,usStateAbrv } from './countryCode.js'
import { degreesToCompass } from './getWeather.js'

// Map sports to their respective leagues
const leaguesBySport = new Map([
  ['Basketball', ['NBA']],
  ['Football', ['UFL', 'NFL']],
  ['Baseball', ['MLB']],
  ['Hockey', ['NHL']],
  [
    'Soccer',
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
  ['UFL', 'ufl'],
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
  console.log('Populating sports league dropdown')
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

async function getWeatherForEvent (address, date) {
  var weatherDiv = document.getElementById('weather-data-screen')
  weatherDiv.style.display = 'flex'

  weatherDiv.innerHTML = `<p>Loading Weather Data.....`

    var locationResponse;
    var locationData;
    var longitude;
    var latitude;
    var countOrState;
    if(address.state)
    {
        var stateName = usStateAbrv[address.state];
        console.log(stateName);
        locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${address.city}&countryCode=US` )
       
        locationData = await locationResponse.json()
        for(var i = 0; i < locationData.results.length; i++)
        {
            console.log(locationData.results[i].admin1)
            if(locationData.results[i].admin1 === stateName)
            {
                longitude = locationData.results[i].longitude;
                latitude = locationData.results[i].latitude;
                countOrState = stateName;
                break;
            }
        }
    }
    else
    {
        locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${address.city}&countryCode=${countryNameToCode[address.country]}`)
        locationData = await locationResponse.json();
        longitude = locationData.results[0].longitude;
        latitude = locationData.results[0].latitude;
        countOrState = address.country;
    }


  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,windspeed_10m_max,winddirection_10m_dominant,weathercode&start_date=2025-12-14&end_date=2025-12-14&timezone=auto`
  )
    const weatherData = await response.json()

  var weatherTitle = document.createElement('h2');
  weatherTitle.textContent = `Weather Forecast for ${address.city}, ${countOrState} on ${new Date(date).toLocaleDateString()}`;
  weatherTitle.className = 'weather-title';

  var weatherTitleContainer = document.getElementById('title-containerId');
  console.log(weatherTitleContainer);
  weatherTitleContainer.innerHTML = ``;
  weatherTitleContainer.appendChild(weatherTitle);


  weatherDiv.innerHTML = ``;
  var closeButton = document.createElement('button')
  closeButton.textContent = 'Close'
  closeButton.className = 'closeButton'
  closeButton.addEventListener('click', closeWeatherWindow)

  weatherDiv.appendChild(closeButton)

  
  const content = document.createElement('div');
  content.className = 'weather-content';
  content.innerHTML = `<p>Max Temperature: ${((weatherData.daily.temperature_2m_max[0] * (9 / 5) + 32).toFixed(1))} °F</p>
        <p>Min Temperature: ${( (weatherData.daily.temperature_2m_min[0] * (9 / 5) + 32 ).toFixed(1))} °F</p>
        <p>Max Wind Speed: ${(weatherData.daily.windspeed_10m_max[0] * 0.621371).toFixed(1)} mph</p>
        <p>Wind Direction: ${degreesToCompass(weatherData.current_weather.winddirection)}</p>
    `
  weatherDiv.appendChild(content)
  var favoriteDiv = document.createElement('div');
  favoriteDiv.className = 'fav-content'
  favoriteDiv.innerHTML = `<h3>Favorite?</h3>`;
  weatherDiv.appendChild(favoriteDiv);


  return weatherData
}

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

    console.log('Fetching events for sport:', sport, 'league:', league)
    console.log('Lowercase sport:', sportLower)

    // Clear previous results
    var eventsContainer = document.getElementById('events-container')
    eventsContainer.innerHTML = '' // Clear previous results

    // Fetch sports event data
    var eventData = await getSportsEventData(sportLower, league)
    console.log('Event data length:', eventData.length)
    console.log('Data received:', eventData)

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
            <p>Location: ${event.location}</p>
            <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
            <p>Time: ${new Date(event.date).toLocaleTimeString()}</p>
        `
      const weatherBtn = document.createElement('button')
      weatherBtn.textContent = 'Check Weather'
      weatherBtn.className = 'filter-button'

      weatherBtn.addEventListener('click', () => {
        getWeatherForEvent(event.address, event.date)
      })

      eventsContainer.appendChild(eventDiv)
      eventDiv.appendChild(weatherBtn)
    })
  })

// Sports Event class
class SportsEvent {
  constructor (awayTeam, homeTeam, awayTeamLogo, homeTeamLogo, location, date) {
    this.awayTeam = awayTeam
    this.awayTeamLogo = awayTeamLogo
    this.homeTeamLogo = homeTeamLogo
    this.homeTeam = homeTeam
    this.loction = location
    this.date = date
    this.address = null
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
  console.log('Raw data from API:', data.events.length)

  data.events.forEach(eventJson => {
    var event = new SportsEvent(null, null, null, null, null, null)

    // Determine who is the home team and who is the away team
    if (eventJson.competitions[0].competitors[0].homeAway === 'home') {
      event.awayTeam = eventJson.competitions[0].competitors[1].team.displayName
      event.awayTeamLogo = eventJson.competitions[0].competitors[1].team.logo
      event.homeTeamLogo = eventJson.competitions[0].competitors[0].team.logo
      event.homeTeam = eventJson.competitions[0].competitors[0].team.displayName
    } else {
      event.awayTeam = eventJson.competitions[0].competitors[0].team.displayName
      event.awayTeamLogo = eventJson.competitions[0].competitors[0].team.logo
      event.homeTeamLogo = eventJson.competitions[0].competitors[1].team.logo
      event.homeTeam = eventJson.competitions[0].competitors[1].team.displayName
    }

    event.location = eventJson.competitions[0].venue.fullName
    event.date = eventJson.date
    event.address = eventJson.competitions[0].venue.address

    sportsData.push(event)
  })

  return sportsData
}

// Helper function to format date as YYYYMMDD
function formatDate (date, addDays) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate() + addDays).padStart(2, '0')

  return `${year}${month}${day}`
}
