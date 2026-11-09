/**
 * CSV Import Script
 * Reads EC_SpatialTemporal_Bapatla_Predicted_2026_2030.csv
 * Parses .geo GeoJSON, extracts coordinates, inserts into PostgreSQL/PostGIS
 *
 * Usage: npm run import-csv
 * (from the /backend directory)
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'soil_salinity_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 10,
});

interface CsvRow {
  'system:index': string;
  '0_EC_2015': string;
  '1_EC_2016': string;
  '2_EC_2017': string;
  '3_EC_2018': string;
  '4_EC_2019': string;
  '5_EC_2020': string;
  '6_EC_2021': string;
  '7_EC_2022': string;
  '8_EC_2023': string;
  '9_EC_2024': string;
  '10_EC_2025': string;
  '11_EC_2026': string;
  '12_EC_2027': string;
  '13_EC_2028': string;
  '14_EC_2029': string;
  '15_EC_2030': string;
  '.geo': string;
}

interface GeoPoint {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

const parseGeo = (geoStr: string): { longitude: number; latitude: number } | null => {
  try {
    const geo: GeoPoint = JSON.parse(geoStr);
    if (geo.type === 'Point' && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      return {
        longitude: geo.coordinates[0],
        latitude: geo.coordinates[1],
      };
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

const parseEc = (value: string): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const importCsv = async () => {
  const csvPath = path.resolve(
    __dirname,
    '..',
    process.env.CSV_FILE_PATH || '../data/EC_SpatialTemporal_Bapatla_Predicted_2026_2030.csv'
  );

  if (!fs.existsSync(csvPath)) {
    console.error(`\n❌ CSV file not found at: ${csvPath}`);
    console.error('   Please place your CSV file in the /data directory.');
    process.exit(1);
  }

  console.log(`\n🌱 Starting CSV import from: ${csvPath}`);
  console.log('   This may take a few minutes for 100,000 records...\n');

  // Test DB connection
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection OK');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const BATCH_SIZE = 500;
  const rows: CsvRow[] = [];

  // Read all rows first
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CsvRow) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Total rows read from CSV: ${rows.length}`);
  console.log('   Importing in batches...\n');

  // Process in batches
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const row of batch) {
        const systemIndex = row['system:index'];
        const geoStr = row['.geo'];

        const coords = parseGeo(geoStr);
        if (!coords) {
          skipped++;
          continue;
        }

        const { latitude, longitude } = coords;

        const ec2015 = parseEc(row['0_EC_2015']);
        const ec2016 = parseEc(row['1_EC_2016']);
        const ec2017 = parseEc(row['2_EC_2017']);
        const ec2018 = parseEc(row['3_EC_2018']);
        const ec2019 = parseEc(row['4_EC_2019']);
        const ec2020 = parseEc(row['5_EC_2020']);
        const ec2021 = parseEc(row['6_EC_2021']);
        const ec2022 = parseEc(row['7_EC_2022']);
        const ec2023 = parseEc(row['8_EC_2023']);
        const ec2024 = parseEc(row['9_EC_2024']);
        const ec2025 = parseEc(row['10_EC_2025']);
        const ec2026 = parseEc(row['11_EC_2026']);
        const ec2027 = parseEc(row['12_EC_2027']);
        const ec2028 = parseEc(row['13_EC_2028']);
        const ec2029 = parseEc(row['14_EC_2029']);
        const ec2030 = parseEc(row['15_EC_2030']);

        await client.query(
          `INSERT INTO soil_salinity (
            system_index, latitude, longitude, geom,
            ec_2015, ec_2016, ec_2017, ec_2018,
            ec_2019, ec_2020, ec_2021, ec_2022, ec_2023, ec_2024, ec_2025,
            ec_2026, ec_2027, ec_2028, ec_2029, ec_2030,
            district
          ) VALUES (
            $1, $2, $3, ST_SetSRID(ST_MakePoint($4, $2), 4326)::geography,
            $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20,
            'Bapatla'
          )
          ON CONFLICT (district, system_index) DO NOTHING`,
          [
            systemIndex, latitude, longitude, longitude,
            ec2015, ec2016, ec2017, ec2018,
            ec2019, ec2020, ec2021, ec2022, ec2023, ec2024, ec2025,
            ec2026, ec2027, ec2028, ec2029, ec2030,
          ]
        );

        imported++;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`\n❌ Batch error at row ${i}:`, err);
      errors += batch.length;
    } finally {
      client.release();
    }

    // Progress update every 10 batches
    if ((i / BATCH_SIZE) % 10 === 0) {
      const percent = Math.round((i / rows.length) * 100);
      process.stdout.write(`\r   Progress: ${percent}% (${imported} imported, ${skipped} skipped, ${errors} errors)`);
    }
  }

  console.log('\n\n✅ Import complete!');
  console.log(`   Rows imported:  ${imported}`);
  console.log(`   Rows skipped:   ${skipped} (invalid geo data)`);
  console.log(`   Rows with error: ${errors}`);

  // Final count
  const countResult = await pool.query('SELECT COUNT(*) AS count FROM soil_salinity');
  console.log(`   Total records in DB: ${countResult.rows[0].count}`);

  await pool.end();
  console.log('\n🎉 Database is ready. You can now start the backend server.\n');
};

importCsv().catch((err) => {
  console.error('\n❌ Import failed:', err);
  pool.end();
  process.exit(1);
});
