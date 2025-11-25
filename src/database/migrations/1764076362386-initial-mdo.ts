import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMdo1764076362386 implements MigrationInterface {
    name = 'InitialMdo1764076362386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "obras" ("obra" nvarchar(50) NOT NULL, "nome" nvarchar(255) NOT NULL, "situacao" nvarchar(10) NOT NULL, CONSTRAINT "PK_28705f352d28e6a8ec3808c4024" PRIMARY KEY ("obra"))`);
        await queryRunner.query(`CREATE TABLE "MapaDiarioObra_Headers" ("bostamp" nvarchar(30) NOT NULL, "userid" int NOT NULL, "data" date NOT NULL, "obra" nvarchar(50) NOT NULL, "encarregado" nvarchar(255) NOT NULL, "createdAt" datetime NOT NULL CONSTRAINT "DF_c8e1459eb923a50742c2c5d3007" DEFAULT GETDATE(), CONSTRAINT "PK_0f4b636c6be477a33028cc48d5f" PRIMARY KEY ("bostamp"))`);
        await queryRunner.query(`CREATE TABLE "equipamentos" ("codviat" nvarchar(50) NOT NULL, "desig" nvarchar(255) NOT NULL, "inactivo" int NOT NULL, CONSTRAINT "PK_daaae7674ddb6d9228d82151e48" PRIMARY KEY ("codviat"))`);
        await queryRunner.query(`CREATE TABLE "MapaDiarioObra_Details" ("bistamp" nvarchar(30) NOT NULL, "bostamp" nvarchar(30) NOT NULL, "empresa" nvarchar(50), "nfunc" nvarchar(50), "codviat" nvarchar(50), "design" nvarchar(255), "qtt" float NOT NULL CONSTRAINT "DF_c8837ee09a3e70a4ad4622954ed" DEFAULT 0, CONSTRAINT "PK_a11e77ebdac4992697bb04bab30" PRIMARY KEY ("bistamp"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "MapaDiarioObra_Details"`);
        await queryRunner.query(`DROP TABLE "equipamentos"`);
        await queryRunner.query(`DROP TABLE "MapaDiarioObra_Headers"`);
        await queryRunner.query(`DROP TABLE "obras"`);
    }

}
