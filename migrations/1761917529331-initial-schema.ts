import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761917529331 implements MigrationInterface {
  name = 'InitialSchema1761917529331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                                    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                                    "email" varchar NOT NULL,
                                    "password" varchar NOT NULL,
                                    "admin" boolean NOT NULL DEFAULT (1)
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "report" (
                                      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                                      "approved" boolean NOT NULL DEFAULT (0),
                                      "price" integer NOT NULL,
                                      "make" varchar NOT NULL,
                                      "model" varchar NOT NULL,
                                      "year" integer NOT NULL,
                                      "lng" integer NOT NULL,
                                      "lat" integer NOT NULL,
                                      "mileage" integer NOT NULL,
                                      "userId" integer,
                                      CONSTRAINT "FK_e347c56b008c2057c9887e230aa"
                                          FOREIGN KEY ("userId") REFERENCES "user" ("id")
                                              ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "report"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
