const { MongoClient } = require('mongodb');
const { env } = process;

class DBClient {
  constructor() {
    const host = env.DB_HOST || 'localhost';
    const port = env.DB_PORT || 27017;
    const database = env.DB_DATABASE || 'files_manager';

    this.uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(this.uri);
    this.db = null;

    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        console.log('Connected to MongoDB');
	this.db = this.client.db();
      }
    });

  }

  isAlive() {
    return !!this.client && this.client.isConnected();
  }

  async nbUsers() {
    const usersCount = await this.db.collection('users').countDocuments();
    return usersCount;
  }

  async nbFiles() {
    const filesCount = await this.db.collection('files').countDocuments();
    return filesCount;
  }

  async findUserByEmail(email) {
    const user = await this.db.collection('users').findOne({ email });
    return user;
  }
  async getUserById(id) {
    const user = await this.db.collection('users').findOne({ _id: id });
    return user;
  }

  async createUser({ email, password }) {
    const newUser = await this.db.collection('users').insertOne({ email, password });
    return {
      email: newUser.ops[0].email,
      id: newUser.ops[0]._id,
    };
  }
  
 async getFileById(id) {
    const file = await this.db.collection('files').findOne({ _id: id });
    return file;
  }

  async createFile(fileData) {
    const newFile = await this.db.collection('files').insertOne(fileData);
    return newFile.ops[0];
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
