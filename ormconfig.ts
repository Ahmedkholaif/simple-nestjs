// npx dotenv -e .env -- typeorm migration:run

import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Customer } from './src/entities/customer.entity';
import { SpecialOffer } from './src/entities/special-offer.entity';
import { Voucher } from './src/entities/voucher.entity';

ConfigModule.forRoot(); // Load environment variables

const configService = new ConfigService();
const isProduction = configService.get('NODE_ENV') === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST') || 'localhost',
  port: configService.get('POSTGRES_PORT') || 5432,
  username: configService.get('POSTGRES_USER') || 'postgres',
  password: configService.get('POSTGRES_PASSWORD') || 'password',
  database: configService.get('POSTGRES_DB') || 'mydb',
  entities: [Customer, SpecialOffer, Voucher],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: isProduction ? false : true, // Disable synchronize and use migrations instead
  logging: true,
});
