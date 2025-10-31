import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  entities: ['src/**/*.entity.ts'],
  // migrations: [
  // /*...*/
  // ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsRun: true, // ← Auto-run migrations on startup
  synchronize: false,
  migrationsTableName: 'dev_migration_table',
});
// npx typeorm-ts-node-esm migration:generate ./src/migrations/update-post-table -d ./src/data-source.ts
// npx typeorm-ts-node-esm migration:run -- -d path-to-datasource-config
// npx typeorm-ts-node-commonjs migration:run -- -d path-to-datasource-config
// npm run typeorm -- migration:generate ./migrations/initial-schema -d
