const mongoose = require('mongoose');
require('dotenv').config();

async function removeUsernameIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    
    // Drop the problematic index
    await db.collection('users').dropIndex('username_1');
    console.log('Successfully removed username index');
  } catch (error) {
    if (error.code === 27) {
      console.log('Index does not exist - already removed');
    } else {
      console.error('Error removing index:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

removeUsernameIndex().catch(console.error); 