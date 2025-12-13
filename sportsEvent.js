const leaguesBySport = new Map([
  ["Basketball", ["NBA"]],
  ["Football", ["AFL", "NFL"]],
  ["Baseball", ["MLB"]],
  ["Hockey", ["NHL"]],
  ["Soccer", [
    "MLS", 
    "English Premier League", 
    "La Liga", 
    "Serie A", 
    "Bundesliga", 
    "Ligue 1", 
    "UEFA Champions League",
  ]],
  ["Tennis", []],
  ["Golf", ["PGA Tour"]],
  ["MMA", ["UFC"]],
  ["Auto Racing", ["Formula 1"]]
]);


var abrvByLeague = new Map([
  ["NBA", "nba"],
  ["AFL", "afl"],
    ["NFL", "nfl"],
    ["MLB", "mlb"],
    ["NHL", "nhl"],
    ["MLS", "usa.1"],
    ["English Premier League", "eng.1"],
    ["La Liga", "esp.1"],
    ["Serie A", "ita.1"],
    ["Bundesliga", "ger.1"],
    ["Ligue 1", "esp.1"],
    ["UEFA Champions League", "uefa.champions"],
]);
window.addEventListener("DOMContentLoaded", () =>{

    console.log("Populating sports league dropdown");
    var leagueSelect = document.getElementById("league-select");
    

    var  sportsSelect = document.getElementById("sports-select");

    leaguesBySport.forEach((leagues, sport) => {
        var sportOption = document.createElement("option");
        sportOption.value = sport;
        sportOption.text = sport;
        sportsSelect.appendChild(sportOption);
    } );;

});

document.getElementById("sports-select").addEventListener("change", function() {
    var selectedSport = this.value;
    var leagueSelect = document.getElementById("league-select");

    // Clear existing options
    leagueSelect.innerHTML = "";

    // Get leagues for the selected sport
    var leagues = leaguesBySport.get(selectedSport) || [];

    // Populate league dropdown
    leagues.forEach(function(league) {
        var option = document.createElement("option");
        option.value = league;
        option.text = league;
        leagueSelect.appendChild(option);
    });
});

document.getElementById("get-events-btn").addEventListener("click", async function(event) {

    // Prevent form submission
    event.preventDefault();

    // Get selected sport and league
    var sport = document.getElementById("sports-select").value;
    var league = document.getElementById("league-select").value;

    // Convert sport to lowercase for API compatibility
    var sportLower = sport.toLowerCase();

    // Map league to its abbreviation if available
    league = abrvByLeague.get(league) ? abrvByLeague.get(league) : league;

    console.log("Fetching events for sport:", sport, "league:", league);
    console.log("Lowercase sport:", sportLower);
      
    // Clear previous results
    var eventsContainer = document.getElementById("events-container");
    eventsContainer.innerHTML = ""; // Clear previous results

    // Fetch sports event data
    var eventData = await getSportsEventData(sportLower, league);
    console.log("Event data length:", eventData.length);
    console.log("Data received:", eventData);
   
    // Display each event
    eventData.forEach(event => {
        var eventDiv = document.createElement("div");
        eventDiv.className = "event";

        eventDiv.innerHTML = `
            <div class="teams-info">
                <div class ="teams-container">
                    <img class="team-logo" src="${event.awayTeamLogo}" alt="${event.awayTeam} Logo" style="width:50px; height:auto;">
                    <h3>${event.awayTeam}</h3>
                </div>
                <h3 class="at-text" >At</h3>
                <div class ="teams-container">
                    <img class="team-logo" src="${event.homeTeamLogo}" alt="${event.homeTeam} Logo" style="width:50px; height:auto;">
                    <h3>${event.homeTeam}</h3>
                </div>
            </div>
            <p>Location: ${event.location}</p>
            <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
            <p>Time: ${new Date(event.date).toLocaleTimeString()}</p>
            <button id="weather-buttonclass="filter-button">Check Weather</button>
        `;

        eventsContainer.appendChild(eventDiv);  
    });
      

});

class SportsEvent {
    constructor(awayTeam, homeTeam, awayTeamLogo, homeTeamLogo, location, date) {
        this.awayTeam = awayTeam;
        this.awayTeamLogo = awayTeamLogo;
        this.homeTeamLogo = homeTeamLogo;
        this.homeTeam = homeTeam;
        this.loction = location;
        this.date = date;

    }
}

async function getSportsEventData(sport,league)
{
    let sportsData = [];

    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`);
    const data = await response.json();

    data.events.forEach(eventJson => {

        var event = new SportsEvent(null, null, null, null, null, null);

        // Determine who is the home team and who is the away team
        if(eventJson.competitions[0].competitors[0].homeAway === "home")
        {
            event.awayTeam = eventJson.competitions[0].competitors[1].team.displayName;
            event.awayTeamLogo = eventJson.competitions[0].competitors[1].team.logo;
            event.homeTeamLogo = eventJson.competitions[0].competitors[0].team.logo;
            event.homeTeam = eventJson.competitions[0].competitors[0].team.displayName;
        }
        else
        {
            event.awayTeam = eventJson.competitions[0].competitors[0].team.displayName;
            event.awayTeamLogo = eventJson.competitions[0].competitors[0].team.logo;
            event.homeTeamLogo = eventJson.competitions[0].competitors[1].team.logo;
            event.homeTeam = eventJson.competitions[0].competitors[1].team.displayName;
        }
        
        event.location = eventJson.competitions[0].venue.fullName;
        event.date = eventJson.date;
       
        sportsData.push(event);

    });

    return sportsData;
}