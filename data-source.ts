import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false, // ✅ IMPORTANT
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],

  options: {
    trustServerCertificate: true,
  },
});
