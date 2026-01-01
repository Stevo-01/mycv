import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteAndTimestamps1766457300759 implements MigrationInterface {
    name = 'AddSoftDeleteAndTimestamps1766457300759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add timestamp columns to Tag
        await queryRunner.query(`
            ALTER TABLE "tag"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "tag"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "tag"
            ADD "deletedAt" TIMESTAMP
        `);

        // Add timestamp columns to Report
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD "deletedAt" TIMESTAMP
        `);

        // Add timestamp columns to User
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "deletedAt" TIMESTAMP
        `);

        // ✨ Add indexes for better query performance
        await queryRunner.query(`
            CREATE INDEX "IDX_user_deletedAt" ON "user" ("deletedAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_report_deletedAt" ON "report" ("deletedAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_tag_deletedAt" ON "tag" ("deletedAt")
        `);
        
        // ✨ Add indexes for common sorting columns
        await queryRunner.query(`
            CREATE INDEX "IDX_user_createdAt" ON "user" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_report_createdAt" ON "report" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_user_email" ON "user" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_user_email"`);
        await queryRunner.query(`DROP INDEX "IDX_report_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_user_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_tag_deletedAt"`);
        await queryRunner.query(`DROP INDEX "IDX_report_deletedAt"`);
        await queryRunner.query(`DROP INDEX "IDX_user_deletedAt"`);

        // Remove columns from User
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "createdAt"
        `);

        // Remove columns from Report
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "report" DROP COLUMN "createdAt"
        `);

        // Remove columns from Tag
        await queryRunner.query(`
            ALTER TABLE "tag" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "tag" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "tag" DROP COLUMN "createdAt"
        `);
    }
}