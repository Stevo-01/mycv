console.log('Loading ormconfig for:', process.env.NODE_ENV || 'development');

const env = process.env.NODE_ENV || 'development';

const dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
  cli: {
    migrationsDir: 'migration'
  },
  
};

switch (env) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['dist/**/*.entity.js'],
    });
    break;

  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['src/**/*.entity.ts'],
      migrationsRun: true
    });
    break;

  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity.js'],
      ssl: { rejectUnauthorized: false },
      migrationsRun: true
    });
    break;

  default:
    throw new Error(`Unknown NODE_ENV: ${env}`);
}

module.exports = dbConfig;
