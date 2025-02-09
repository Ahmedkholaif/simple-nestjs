import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { DatabaseExceptionFilter } from './common/db-exception.filter';
// import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const configService = app.get(ConfigService);
  // const PORT = configService.get<number>('PORT') || 3000;

  const PORT = process.env.PORT || 3000;

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // remove non-whitelisted properties from the request body
      // forbidNonWhitelisted: true, // throw error if there are non-whitelisted properties in the request body
      transform: true, // transform payload to their respective types
      transformOptions: {
        enableImplicitConversion: true, // convert query params to their respective types
      },
    }),
  );

  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DatabaseExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Voucher API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('explore', app, document);

  await app.listen(PORT, () => {
    console.log(`
      Server is running on http://localhost:${PORT} \n
      Explore at http://localhost:${PORT}/explore
    `);
  });
}
bootstrap();
