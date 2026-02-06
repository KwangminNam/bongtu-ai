import serverlessExpress from "@codegenie/serverless-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { Handler, Context, Callback } from "aws-lambda";
import { json } from "express";

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  // 이미지 업로드를 위해 body 크기 제한 증가 (10MB)
  app.use(json({ limit: "10mb" }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: unknown,
  context: Context,
  callback: Callback
) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(event, context, callback);
};
