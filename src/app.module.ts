import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { UserEntity } from './users/users.entity';
import { UsersModule } from './users/users.module';

// 추후 옵션에 대한 공부 필요
const typeOrmModuleOptions = {
  // useFactory: 함수에 대해서 모듈 설정을 해주는 것
  useFactory: async (
    // configService를 이용한 환경변수 사용
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [UserEntity],
    // 동기화를 말한다. 강의에서는 개발 단계에서 true, 데이터를 사용하게 된다면 false로 진행
    synchronize: true, //! set 'false' in production
    autoLoadEntities: true,
    // 개발단계에서만 true, 이유: 프로더션에서 필요없는 로그가 찍히기 때문
    logging: true,
    keepConnectionAlive: true,
  }),
  // configService를 사용하기 위한 의존성 주입
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(5000),
        SECRET_KEY: Joi.string().required(),
        ADMIN_USER: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    // TypeORM 모듈과 연결
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
