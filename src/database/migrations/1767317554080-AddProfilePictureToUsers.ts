import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfilePictureToUsers1735786800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',  
      new TableColumn({
        name: 'profilePicture',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'profilePicture');
  }
}