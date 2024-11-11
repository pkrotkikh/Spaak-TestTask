import { config } from 'dotenv';
import { PgConnectionConfig } from 'node-pg-migrate';

config();

const dbConfig: PgConnectionConfig = {
    databaseUrl: process.env.DATABASE_URL || '',
    migrationsTable: 'pgmigrations',
    dir: 'migrations',
};

if (!dbConfig.databaseUrl) {
    throw new Error('DATABASE_URL is not set in the environment variables');
}

export default dbConfig;
