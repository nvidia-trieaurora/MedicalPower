import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('MedicalPower Workflow Service')
    .setDescription('Workflow engine: templates, runs, tasks')
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 4006;
  await app.listen(port);
  console.log(`workflow-service running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
