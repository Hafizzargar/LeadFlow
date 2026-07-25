const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup - start in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set env vars for tests
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.JWT_EXPIRE = '1h';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(mongoUri);
});

// Cleanup - clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Teardown - close connection and stop server after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});
