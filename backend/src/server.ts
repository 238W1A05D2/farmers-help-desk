import app from './app';
import { testConnection } from './db/pool';

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('\n❌ Could not connect to the database.');
    console.error('   Check your .env credentials and that PostgreSQL is running.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🌱 Smart Soil Salinity API — http://localhost:${PORT}`);
    console.log(`   Health:    GET /api/health`);
    console.log(`   Districts: GET /api/districts`);
    console.log(`   Salinity:  GET /api/soil-salinity?latitude=15.8625&longitude=80.4965&year=2025&district=Bapatla`);
    console.log(`   Nearby:    GET /api/nearby-locations?latitude=15.8625&longitude=80.4965&year=2025&district=Bapatla`);
    console.log(`   Trend:     GET /api/overall-ec-trend?district=Godavari\n`);
  });
};

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
