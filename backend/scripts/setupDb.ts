/**
 * Database Setup Script
 * Creates the PostgreSQL database and applies schema.sql (including PostGIS).
 * Usage: npm run setup-db  (from the /backend directory)
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_NAME     = process.env.DB_NAME     || 'soil_salinity_db';
const DB_USER     = process.env.DB_USER     || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = process.env.DB_PORT     || '5432';

const setupDatabase = async () => {
  console.log('\n🌱 Setting up Soil Salinity Database...\n');

  // Connect to the default postgres DB to create our DB
  const adminPool = new Pool({
    host: DB_HOST, port: parseInt(DB_PORT),
    database: 'postgres', user: DB_USER, password: DB_PASSWORD,
  });

  try {
    const check = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]
    );
    if (check.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅ Database "${DB_NAME}" created`);
    } else {
      console.log(`ℹ️  Database "${DB_NAME}" already exists`);
    }
  } catch (err) {
    console.error('❌ Failed to create database:', err);
    await adminPool.end();
    process.exit(1);
  }
  await adminPool.end();

  // Connect to the target DB and apply schema
  const pool = new Pool({
    host: DB_HOST, port: parseInt(DB_PORT),
    database: DB_NAME, user: DB_USER, password: DB_PASSWORD,
  });

  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis');
    console.log('✅ PostGIS extension enabled');

    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found at: ${schemaPath}`);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Schema applied successfully');

    console.log('\n🎉 Database ready!');
    console.log('   Next steps:');
    console.log('   1. npm run import-csv          (Bapatla data)');
    console.log('   2. npm run import-godavari     (Godavari data)\n');
  } catch (err) {
    console.error('❌ Schema setup failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

setupDatabase().catch((err) => {
  console.error('Fatal setup error:', err);
  process.exit(1);
});
