import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReportCoordinates1766333364770 implements MigrationInterface {
    name = 'UpdateReportCoordinates1766333364770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "lng"
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "lng" numeric(10, 6) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "lat"
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "lat" numeric(10, 6) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "lat"
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "lat" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "lng"
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "lng" integer NOT NULL
        `);
    }

}
