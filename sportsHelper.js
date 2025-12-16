export async function getNextGame(teamName) {
  const leagues = ["nba", "nfl", "mlb", "nhl", "usa.1"]; // expand if needed

  for (let league of leagues) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${league}/${league}/scoreboard`;
    const res = await fetch(url);
    const data = await res.json();

    for (let event of data.events) {
      const comp = event.competitions[0].competitors;

      if (comp.some(c => c.team?.displayName?.includes(teamName))) {
        return {
          opponent: comp.find(c => !c.team.displayName.includes(teamName)).team.displayName,
          location: event.competitions[0].venue.fullName,
          date: event.date,
          latitude: event.competitions[0].venue.address.latitude,
          longitude: event.competitions[0].venue.address.longitude
        };
      }
    }
  }

  return null;
}
