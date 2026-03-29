const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  console.log("Downloading/Starting in-memory MongoDB... Please wait.");
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'wemu'
      }
    });
    
    const uri = mongod.getUri();
    console.log("\n==================================================");
    console.log("✅ WEMU TEMPORARY DATABASE IS RUNNING!");
    console.log("==================================================");
    console.log(`URI: ${uri}`);
    console.log("⚠️  IMPORTANT: Keep this terminal window open!");
    console.log("⚠️  Closing this window will stop the DB and erase data.");
    console.log("==================================================\n");
  } catch (error) {
    if (error.message.includes('EADDRINUSE')) {
      console.log("\n==================================================");
      console.log("✅ A database is already running on port 27017!");
      console.log("==================================================\n");
    } else {
      console.error("Failed to start MongoDB Memory Server:");
      console.error(error);
      process.exit(1);
    }
  }
}

start();
