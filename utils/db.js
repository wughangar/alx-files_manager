const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });

    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        console.log('Connected to MongoDB');
      }
    });
  }

  isAlive() {
    return !!this.client && this.client.isConnected();
  }

  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('MongoDB connection is not alive');
    }
    const db = this.client.db();
    const usersCount = await db.collection('users').countDocuments();
    return usersCount;
  }

  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('MongoDB connection is not alive');
    }
    const db = this.client.db();
    const filesCount = await db.collection('files').countDocuments();
    return filesCount;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
