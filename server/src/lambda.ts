import serverlessExpress from "@codegenie/serverless-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { Handler, Context, Callback } from "aws-lambda";

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      "http://localhost:3000",
      process.env.CORS_ORIGIN || "https://your-app.vercel.app",
    ],
    credentials: true,
  });

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
