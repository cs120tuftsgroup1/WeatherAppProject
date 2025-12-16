var http = require('http')
var url = require('url')
var qs = require('querystring')
var fs = require('fs')
var pathModule = require('path')
const path = require('path')

const { MongoClient, ServerApiVersion } = require('mongodb')
const uri =
  'mongodb+srv://ngasto01_db_user:test123@weatherappcluster.bzidb06.mongodb.net/?appName=weatherAppCluster'

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB connected");
    const server = http.createServer(function (req, res) {
      urlObj = url.parse(req.url, true)
      let path = urlObj.pathname


      // MIME types
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.jsx': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }

      // Request wants to load home path
      if (path === '/') {
        path = '/home.html'
      } else if (path === '/favicon.ico') {
        res.writeHead(204)
        res.end()
        return
      } else if (path === '/logMeIn' && req.method === 'POST') {
        let body = ''

        req.on('data', chunk => (body += chunk.toString()))

        req.on('end', async () => {
          try {
            const { email, password } = JSON.parse(body)

            const exists = await checkForUser(email, password)

            if (exists) {
              const cookie = [
                `userId=${exists}`,
                'SameSite=Strict',
                'Path=/',
                'Max-Age=86400' // 1 day
                // 'Secure' // enable in production with HTTPS
              ].join('; ')
              res.writeHead(
                200,
                { 'Content-Type': 'application/json' },
                { 'Set-Cookie': cookie }
              )
              res.end(
                JSON.stringify({
                  success: true,
                  id: exists,
                  message: 'Login successful'
                })
              )
            } else {
              res.end(
                JSON.stringify({
                  message: 'Invalid email or password'
                })
              )
            }
          } catch (err) {
            res.end(JSON.stringify({ success: false, message: 'Bad request' }))
          }
        })
      } else if (path === '/signUp' && req.method === 'POST') {
        let body = ''

        req.on('data', chunk => (body += chunk.toString()))
        req.on('end', async () => {
          try {
            if (await !checkUserExists(JSON.parse(body).email)) {
              console.log("User already exists");
              throw new Error('User already exists');
            }
            else {
              // Basic validation
              if (!JSON.parse(body).email.includes('@') && !JSON.parse(body).email.includes('.')) {
                throw new Error('Invalid email format');
              }
              else if (JSON.parse(body).password.length < 6) {
                throw new Error('Password too short');
              }
            }

            const { username, email, password } = JSON.parse(body)
            if (await !insertUser(username, email, password)) {
              throw new Error('Failed to insert user');
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                success: true,
                message: 'User registered successfully'
              })
            );
          } catch (err) {
            res.end(JSON.stringify({ success: false, message: err.message }));
          }
        })
      }


      /* ----------------------------------
         Save weather settings
      -------------------------------------*/


      else if (path === '/weather' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => body += chunk.toString());

        req.on('end', async () => {
          try {
            const settings = JSON.parse(body);

            const db = client.db("weatherApp");
            const collection = db.collection("userSettings");

            // Save or update settings for this user
            await collection.updateOne(
              { userID: settings.userID },
              { $set: settings },
              { upsert: true }
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false }));
          }
        });
      }



      /* ----------------------------------
         Save weather settings
      -------------------------------------*/

      /* ----------------------------------
               load weather settings
            -------------------------------------*/
      else if (path === '/weather' && req.method === 'GET') {
        const userID = urlObj.query.userID;

        try {
          const db = client.db("weatherApp");
          const collection = db.collection("userSettings");

          const settings = await collection.findOne({ userID });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(settings));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(null));
        }
      }

      /* ----------------------------------
               load weather settings
            -------------------------------------*/
      else {
        // Get the full path
        const fullPath = __dirname + path
        // Get the exetension
        const extn = pathModule.extname(fullPath)

        // Set the correct content type
        const contentType = mimeTypes[extn] || 'text/plain'

        fs.readFile(fullPath, function (err, content) {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            return res.end('File not found')
          }
          res.writeHead(200, { 'Content-Type': contentType })
          res.end(content)
        })
      }
    });
    // If on local port use 8080, if deployed use system port
    const PORT = process.env.PORT || 8080
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (e) {
    console.error(e);
  }


}
// Check if a userExists
async function checkForUser(emailTofind, passwordToFind) {
  // Connect to database

  // Get database
  var db = client.db('weatherApp')

  // Get collection
  var collection = db.collection('userData')

  //  Construct query
  var query = { email: emailTofind, password: passwordToFind }

  // Run the query
  var result = await collection.findOne(query)

  // If result is null then the user does not exist.
  if (result == null) return null
  else {
    return result._id
  }
}


// Function to insert a new user into the database
async function insertUser(fullName, email, password) {
  try {
    // Get database
    var db = client.db('weatherApp')

    // Get collection
    var collection = db.collection('userData')

    // Fill in new userData
    var newData = { name: fullName, email: email, password: password }

    // Send the newData to the database
    await collection.insertOne(newData, function (err, res) {
      // Error handling for incase insert fails
      if (err) {
        return console.log(err)
      }
    })
    // If insert is succsseful send message to console
    console.log('A new user has been inserted into the database')
  } catch (e) {
    console.error(e)
    return false;
  }
  return true;
}

// Check if a userExists
async function checkForUser(emailTofind, passwordToFind) {
  // Get database
  var db = client.db("weatherApp");

  // Get collection 
  var collection = db.collection("userData");

  //  Construct query
  var query = { email: emailTofind, password: passwordToFind };

  // Run the query 
  var result = await collection.findOne(query);

  // If result is null then the user does not exist.
  if (result == null) return null;
  else {
    return result._id;
  }

}

// Check if a userExists
async function checkUserExists(emailTofind) {
  // Get database
  var db = client.db("weatherApp");

  // Get collection 
  var collection = db.collection("userData");

  //  Construct query
  var query = { email: emailTofind };

  // Run the query 
  var result = await collection.findOne(query);

  // If result is null then the user does not exist.
  return result != null;

}



startServer();