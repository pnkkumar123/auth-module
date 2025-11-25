import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyFields1764094747312 implements MigrationInterface {
    name = 'AddCompanyFields1764094747312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "MapaDiarioObra_Headers"
            ADD "companyName" nvarchar(255) NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "MapaDiarioObra_Headers"
            ADD "employeeNumber" nvarchar(50) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "MapaDiarioObra_Headers"
            DROP COLUMN "employeeNumber"
        `);

        await queryRunner.query(`
            ALTER TABLE "MapaDiarioObra_Headers"
            DROP COLUMN "companyName"
        `);
    }
}
