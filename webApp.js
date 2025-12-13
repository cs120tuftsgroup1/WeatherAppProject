var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var pathModule = require('path');
const path = require('path');

const server = http.createServer(function (req, res) {
  
  urlObj = url.parse(req.url,true)
  let path = urlObj.pathname;
  
  // Request wants to load home path
  if (path === "/")
  {
   path = "/home.html";
  }
  else if (path === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }
  // MIME types
    const mimeTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".jsx": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon"
    };
  // Get the full path
  const fullPath = __dirname + path;
  // Get the exetension
  const extn = pathModule.extname(fullPath);

  // Set the correct content type
  const contentType = mimeTypes[extn] || 'text/plain';

  fs.readFile(fullPath, function(err, content) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("File not found");
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });


});




//   // Request wants to load style sheet
//   else if("/style.css"){
//     file= __dirname + "/style.css";
//     fs.readFile(file, function(err, styleSheet) {
    
//     // Error reading file
//     if (err) {
//         res.writeHead(404, { "Content-Type": "text/plain" });
//         return res.end("CSS file not found");
//     }
//     // Add file to the response
//     res.writeHead(200, {'Content-Type': 'text/css'});
//     res.end(styleSheet);

//     });
//   }
//   else if(path == "/account")
//   {
//     file= __dirname + "/account.html";
//     fs.readFile(file, function(err, accountView) {
    
//         // Error reading file
//         if (err) {
//             res.writeHead(404, { "Content-Type": "text/plain" });
//             return res.end("Account page not found");
//         }

//         // Add file to the response
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.end(accountView);
//     });
//   }
//   else if (path == "/sportsEvents")
//   {
//     file= __dirname + "/sportsEvents.html";
//     fs.readFile(file, function(err, sportsEventsView) {
    
//         // Error reading file
//         if (err) {
//             res.writeHead(404, { "Content-Type": "text/plain" });
//             return res.end("Sports Events page not found");
//         }

//         // Add file to the response
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.end(sportsEventsView);
//     });
//   }
//   else if (path == "/layer.js")
//   {
//     file= __dirname + "/layer.js";  
//     fs.readFile(file, function(err, layerScript) {

//         // Error reading file 
//         if (err) {  
//             res.writeHead(404, { "Content-Type": "text/plain" });
//             return res.end("Layer script not found");
//         }

//         // Add file to the response
//         res.writeHead(200, {'Content-Type': 'application/javascript'});
//         res.end(layerScript);
//     });
//   }
//   // Request wants to load the favicon
//   else if(path === "/favicon.ico") {
//     res.writeHead(204);
//     res.end();
//     return;
//     }
// })

// If on local port use 8080, if deployed use system port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



