require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 LeadFlow API Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
