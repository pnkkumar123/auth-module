import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { ModulesModule } from './rbac/modules/modules.module';
import { RolesModule } from './rbac/roles/roles.module';
import { UserModuleRolesModule } from './rbac/user-module-roles/user-module-roles.module';
import { DatabaseModule } from './database/database.module';
import { SeederService } from './database/seeder.service';

@Module({
  imports: [
    // ✅ load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ MSSQL database connection
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      options: {
        trustServerCertificate: true,
      },
    }),

    // ✅ your feature modules
    UsersModule,
    AuthModule,
    EmployeeModule,
    ModulesModule,
    RolesModule,
    UserModuleRolesModule,
    DatabaseModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    await this.seederService.seed();
  }
}
