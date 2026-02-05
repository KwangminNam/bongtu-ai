import { StackContext, Function } from "sst/constructs";

export function Api({ stack }: StackContext) {
  const api = new Function(stack, "Api", {
    handler: "server/src/lambda.handler",
    runtime: "nodejs20.x",
    timeout: 30,
    memorySize: 512,
    url: true,
    environment: {
      DATABASE_URL: process.env.DATABASE_URL!,
      JWT_SECRET: process.env.JWT_SECRET!,
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      CORS_ORIGIN: process.env.CORS_ORIGIN || "",
      NODE_ENV: "production",
    },
    nodejs: {
      install: [
        "@prisma/client",
        "@nestjs/core",
        "@nestjs/common",
        "@nestjs/platform-express",
        "@codegenie/serverless-express",
        "reflect-metadata",
        "rxjs",
        "class-validator",
        "class-transformer",
        "@nestjs/config",
        "@nestjs/jwt",
        "@nestjs/passport",
        "passport",
        "passport-jwt",
      ],
      esbuild: {
        external: [
          "@nestjs/websockets",
          "@nestjs/websockets/socket-module",
          "@nestjs/microservices",
          "@nestjs/microservices/microservices-module",
          "class-transformer/storage",
          "cache-manager",
          "ioredis",
          "kafkajs",
          "mqtt",
          "amqplib",
          "amqp-connection-manager",
          "nats",
          "@grpc/grpc-js",
          "@grpc/proto-loader",
        ],
      },
    },
    copyFiles: [
      {
        from: "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma",
        to: "node_modules/.prisma",
      },
    ],
  });

  stack.addOutputs({
    ApiUrl: api.url || "",
  });

  return { api };
}
