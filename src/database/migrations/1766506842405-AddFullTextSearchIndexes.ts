import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFullTextSearchIndexes1766506842405 implements MigrationInterface {
    name = 'AddFullTextSearchIndexes1766506842405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create GIN index for full-text search on make and model
        await queryRunner.query(`
            CREATE INDEX "IDX_report_fulltext_search" 
            ON "report" 
            USING GIN (to_tsvector('english', make || ' ' || model))
        `);

        // Create indexes for common filter columns
        await queryRunner.query(`
            CREATE INDEX "IDX_report_make" ON "report" ("make")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_report_model" ON "report" ("model")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_report_year" ON "report" ("year")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_report_price" ON "report" ("price")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_report_approved" ON "report" ("approved")
        `);

        // Composite index for common query patterns
        await queryRunner.query(`
            CREATE INDEX "IDX_report_make_model_year" 
            ON "report" ("make", "model", "year")
        `);

        // Index on tag names for faster tag searches
        await queryRunner.query(`
            CREATE INDEX "IDX_tag_name_lower" 
            ON "tag" (LOWER("name"))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_tag_name_lower"`);
        await queryRunner.query(`DROP INDEX "IDX_report_make_model_year"`);
        await queryRunner.query(`DROP INDEX "IDX_report_approved"`);
        await queryRunner.query(`DROP INDEX "IDX_report_price"`);
        await queryRunner.query(`DROP INDEX "IDX_report_year"`);
        await queryRunner.query(`DROP INDEX "IDX_report_model"`);
        await queryRunner.query(`DROP INDEX "IDX_report_make"`);
        await queryRunner.query(`DROP INDEX "IDX_report_fulltext_search"`);
    }
}