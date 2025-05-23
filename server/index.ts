import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { populateFoodDatabase } from "./populate-food-database";
import http from "http";
import chalk from "chalk";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Choose emoji based on response status
      let statusEmoji = "✅";
      let statusColor = chalk.green;
      
      if (res.statusCode >= 400 && res.statusCode < 500) {
        statusEmoji = "⚠️";
        statusColor = chalk.yellow;
      } else if (res.statusCode >= 500) {
        statusEmoji = "🔥";
        statusColor = chalk.red;
      }
      
      // Choose emoji for request method
      let methodEmoji = "🔍";
      if (req.method === "POST") methodEmoji = "📝";
      else if (req.method === "PUT") methodEmoji = "📤";
      else if (req.method === "DELETE") methodEmoji = "🗑️";
      
      let logLine = `${statusEmoji} ${methodEmoji} ${chalk.bold(req.method)} ${chalk.blue(path)} ${statusColor(res.statusCode)} ${chalk.gray(`in ${duration}ms`)}`;
      
      if (capturedJsonResponse) {
        const responsePreview = JSON.stringify(capturedJsonResponse).slice(0, 50);
        logLine += ` ${chalk.dim("data:")} ${responsePreview}${responsePreview.length >= 50 ? "..." : ""}`;
      }

      log(logLine, "api");
    }
  });

  next();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(chalk.bgRed.white.bold(" 🚨 SERVER ERROR 🚨 "));
  console.error(chalk.red(`❌ Status: ${chalk.bold(status)}`));
  console.error(chalk.red(`❌ Message: ${chalk.bold(message)}`));
  console.error(chalk.red(`🔍 Stack: \n${chalk.dim(err.stack)}`));
  console.error(chalk.red.bold("====================="));

  res.status(status).json({ message });
  // We don't throw the error again to prevent the server from crashing
});

(async () => {
  await registerRoutes(app);
  
  // Initialize food database with Brazilian nutritional data
  try {
    await populateFoodDatabase();
  } catch (error) {
    console.error("Failed to populate food database:", error);
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  // Verificar se a porta está em uso e tentar novamente se necessário
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Porta ${port} já está em uso. Tentando novamente em 3 segundos...`);
      setTimeout(() => {
        server.close();
        server.listen({
          port,
          host: "0.0.0.0",
        });
      }, 3000);
    } else {
      console.error('Erro ao iniciar o servidor:', error);
    }
  });
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log("\n" + chalk.bgGreen.black(" 🚀 NUTRI SNAP SERVER ") + "\n");
    console.log(`📡 ${chalk.green("API Server")}: ${chalk.blue.bold(`http://localhost:${port}/api`)}`);
    console.log(`🌐 ${chalk.green("Web App")}: ${chalk.blue.bold(`http://localhost:${port}`)}`);
    console.log(`🔧 ${chalk.green("Environment")}: ${chalk.yellow(app.get("env"))}`);
    console.log(`⏱️  ${chalk.green("Started at")}: ${chalk.magenta(new Date().toLocaleString())}`);
    console.log(chalk.dim("───────────────────────────────────────────"));
    log(`🌟 Server is ${chalk.green.bold("running")} on port ${chalk.cyan(port)}`);
  });
})();