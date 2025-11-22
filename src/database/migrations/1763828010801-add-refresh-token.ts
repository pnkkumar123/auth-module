import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshToken1763828010801 implements MigrationInterface {
    name = 'AddRefreshToken1763828010801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenHash" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenHash"`);
    }

}
