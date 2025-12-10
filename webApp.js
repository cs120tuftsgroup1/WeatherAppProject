var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

const server = http.createServer(function (req, res) {
  
  urlObj = url.parse(req.url,true)
  path = urlObj.pathname;
  
  // Request wants to load home path
  if (path == "/")
  {
    file= __dirname + "/home.html";
    fs.readFile(file, function(err, homeView) {
    
        // Error reading file
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("Home page not found");
        }

        // Add file to the response
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(homeView);
    });
  }
  // Request wants to load style sheet
  else if("/style.css"){
    file= __dirname + "/style.css";
    fs.readFile(file, function(err, styleSheet) {
    
    // Error reading file
    if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("CSS file not found");
    }
    // Add file to the response
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.end(styleSheet);

    });
  }
  else if(path == "/account")
  {
    file= __dirname + "/account.html";
    fs.readFile(file, function(err, accountView) {
    
        // Error reading file
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("Account page not found");
        }

        // Add file to the response
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(accountView);
    });
  }
  else if (path == "/sportsEvents")
  {
    file= __dirname + "/sportsEvents.html";
    fs.readFile(file, function(err, sportsEventsView) {
    
        // Error reading file
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("Sports Events page not found");
        }

        // Add file to the response
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(sportsEventsView);
    });
  }
  // Request wants to load the favicon
  else if(path === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
    }
})

// If on local port use 8080, if deployed use system port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
