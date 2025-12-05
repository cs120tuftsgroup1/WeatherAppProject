//File to hold database endpoints
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ngasto01_db_user:test123@weatherappcluster.bzidb06.mongodb.net/?appName=weatherAppCluster";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }

  await insertUser("Bob Smith", "bobbySmith@aol.com", "password123");

}

async function insertUser(fullName, email, password ) {

    try{
        // Connect to database
        await client.connect();

        // Get database
        var db = client.db("weatherApp");
        
        // Get collection 
        var collection = db.collection("userData");

        // Fill in new userData
        var newData = {"name": fullName, "email": email, "password": password};
        
        // Send the newData to the database
        await collection.insertOne(newData, function(err,res){
            
            // Error handling for incase insert fails
            if(err){ return console.log(err);}
        
        });
         // If insert is succsseful send message to console 
        console.log("A new user has been inserted into the database");

    } 
   finally{

    await client.close();
   }
}
run().catch(console.dir);
