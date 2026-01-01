import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsAndCascade1766368748280 implements MigrationInterface {
    name = 'AddTagsAndCascade1766368748280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "report" DROP CONSTRAINT "FK_e347c56b008c2057c9887e230aa"
        `);
        await queryRunner.query(`
            CREATE TABLE "tag" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"),
                CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "report_tags" (
                "reportId" integer NOT NULL,
                "tagId" integer NOT NULL,
                CONSTRAINT "PK_887e3897869105d22afba9100ad" PRIMARY KEY ("reportId", "tagId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_28348255d45e77993f135bd91e" ON "report_tags" ("reportId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9911220f036168c200b87d9e55" ON "report_tags" ("tagId")
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD CONSTRAINT "FK_e347c56b008c2057c9887e230aa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "report_tags"
            ADD CONSTRAINT "FK_28348255d45e77993f135bd91e2" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "report_tags"
            ADD CONSTRAINT "FK_9911220f036168c200b87d9e557" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "report_tags" DROP CONSTRAINT "FK_9911220f036168c200b87d9e557"
        `);
        await queryRunner.query(`
            ALTER TABLE "report_tags" DROP CONSTRAINT "FK_28348255d45e77993f135bd91e2"
        `);
        await queryRunner.query(`
            ALTER TABLE "report" DROP CONSTRAINT "FK_e347c56b008c2057c9887e230aa"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9911220f036168c200b87d9e55"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_28348255d45e77993f135bd91e"
        `);
        await queryRunner.query(`
            DROP TABLE "report_tags"
        `);
        await queryRunner.query(`
            DROP TABLE "tag"
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD CONSTRAINT "FK_e347c56b008c2057c9887e230aa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
