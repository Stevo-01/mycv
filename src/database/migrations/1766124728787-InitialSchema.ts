import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1766124728787 implements MigrationInterface {
    name = 'InitialSchema1766124728787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "report" (
                "id" SERIAL NOT NULL,
                "approved" boolean NOT NULL DEFAULT false,
                "price" integer NOT NULL,
                "make" character varying NOT NULL,
                "model" character varying NOT NULL,
                "year" integer NOT NULL,
                "lng" integer NOT NULL,
                "lat" integer NOT NULL,
                "mileage" integer NOT NULL,
                "userId" integer,
                CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "admin" boolean NOT NULL DEFAULT true,
                "refreshToken" text,
                "resetPasswordToken" text,
                "resetPasswordExpires" TIMESTAMP,
                "roles" text NOT NULL DEFAULT 'user',
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "report"
            ADD CONSTRAINT "FK_e347c56b008c2057c9887e230aa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "report" DROP CONSTRAINT "FK_e347c56b008c2057c9887e230aa"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "report"
        `);
    }

}
