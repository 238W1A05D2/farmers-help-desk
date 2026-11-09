/**
 * Godavari CSV Import Script
 *
 * CSV format (from screenshots):
 *   point_id, latitude, longitude, SSI 2010, SSI 2011, ..., SSI 2035
 *   (direct lat/lon columns — no .geo GeoJSON field)
 *
 * Usage: npm run import-godavari
 * Run from the /backend directory.
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

const GODAVARI_CSV =
  process.env.GODAVARI_CSV_PATH ||
  '../data/Godavari_SSI_Wide_Format_2010_2035.csv';

const parseEc = (value: string): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Map possible column name variants to canonical year
const YEAR_COL_VARIANTS: Record<number, string[]> = {};
for (let y = 2010; y <= 2035; y++) {
  YEAR_COL_VARIANTS[y] = [
    `SSI ${y}`, `SSI_${y}`, `ssi_${y}`, `ssi ${y}`,
    `EC_${y}`, `ec_${y}`, `${y}`,
  ];
}

const findColValue = (row: Record<string, string>, year: number): string => {
  for (const variant of (YEAR_COL_VARIANTS[year] ?? [])) {
    if (row[variant] !== undefined) return row[variant];
  }
  return '';
};

const importGodavariCsv = async () => {
  const csvPath = path.resolve(__dirname, '..', GODAVARI_CSV);

  if (!fs.existsSync(csvPath)) {
    console.error(`\n❌ Godavari CSV not found at: ${csvPath}`);
    console.error('   Place the file at: data/Godavari_SSI_Wide_Format_2010_2035.csv');
    process.exit(1);
  }

  console.log(`\n🌊 Starting Godavari CSV import from: ${csvPath}`);

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
  const rows: Record<string, string>[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: Record<string, string>) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Total rows read: ${rows.length}`);

  // Print first row headers to help diagnose column names
  if (rows.length > 0) {
    console.log('   Column names detected:', Object.keys(rows[0]).join(', '));
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const row of batch) {
        // Handle latitude/longitude column name variations
        const latRaw = row['latitude'] ?? row['Latitude'] ?? row['lat'] ?? row['LAT'] ?? '';
        const lonRaw = row['longitude'] ?? row['Longitude'] ?? row['lon'] ?? row['LON'] ?? row['long'] ?? '';
        const pointId = row['point_id'] ?? row['point_ID'] ?? row['id'] ?? String(i + imported);

        const latitude = parseFloat(latRaw);
        const longitude = parseFloat(lonRaw);

        if (isNaN(latitude) || isNaN(longitude)) {
          skipped++;
          continue;
        }

        // Build unique system_index for Godavari
        const systemIndex = `godavari_${pointId}`;

        await client.query(
          `INSERT INTO soil_salinity (
            system_index, latitude, longitude, geom, district,
            ec_2010, ec_2011, ec_2012, ec_2013, ec_2014,
            ec_2015, ec_2016, ec_2017, ec_2018, ec_2019, ec_2020,
            ec_2021, ec_2022, ec_2023, ec_2024, ec_2025,
            ec_2026, ec_2027, ec_2028, ec_2029, ec_2030,
            ec_2031, ec_2032, ec_2033, ec_2034, ec_2035
          ) VALUES (
            $1, $2, $3, ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, 'Godavari',
            $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24,
            $25, $26, $27, $28, $29
          )
          ON CONFLICT (district, system_index) DO NOTHING`,
          [
            systemIndex, latitude, longitude,
            parseEc(findColValue(row, 2010)), parseEc(findColValue(row, 2011)),
            parseEc(findColValue(row, 2012)), parseEc(findColValue(row, 2013)),
            parseEc(findColValue(row, 2014)), parseEc(findColValue(row, 2015)),
            parseEc(findColValue(row, 2016)), parseEc(findColValue(row, 2017)),
            parseEc(findColValue(row, 2018)), parseEc(findColValue(row, 2019)),
            parseEc(findColValue(row, 2020)), parseEc(findColValue(row, 2021)),
            parseEc(findColValue(row, 2022)), parseEc(findColValue(row, 2023)),
            parseEc(findColValue(row, 2024)), parseEc(findColValue(row, 2025)),
            parseEc(findColValue(row, 2026)), parseEc(findColValue(row, 2027)),
            parseEc(findColValue(row, 2028)), parseEc(findColValue(row, 2029)),
            parseEc(findColValue(row, 2030)), parseEc(findColValue(row, 2031)),
            parseEc(findColValue(row, 2032)), parseEc(findColValue(row, 2033)),
            parseEc(findColValue(row, 2034)), parseEc(findColValue(row, 2035)),
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

    if ((i / BATCH_SIZE) % 10 === 0) {
      const pct = Math.round((i / rows.length) * 100);
      process.stdout.write(`\r   Progress: ${pct}% (${imported} imported, ${skipped} skipped)`);
    }
  }

  console.log('\n\n✅ Godavari import complete!');
  console.log(`   Imported: ${imported} | Skipped: ${skipped} | Errors: ${errors}`);

  const cnt = await pool.query(
    "SELECT COUNT(*) AS count FROM soil_salinity WHERE district = 'Godavari'"
  );
  console.log(`   Godavari records in DB: ${cnt.rows[0].count}`);
  await pool.end();
};

importGodavariCsv().catch((err) => {
  console.error('\n❌ Import failed:', err);
  pool.end();
  process.exit(1);
});
