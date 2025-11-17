import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { traceScheduling } from './middleware/trace-scheduling.middleware';

function dumpRoutes(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return;

  try {
    const server = app.getHttpServer();
    const router = server._router;

    const routes: any[] = [];

    if (router && router.stack) {
      router.stack.forEach((layer: any) => {
        if (layer.route) {
          // Express route
          const path = layer.route.path;
          const methods = Object.keys(layer.route.methods);
          methods.forEach(method => {
            routes.push({
              method: method.toUpperCase(),
              path: path,
              type: 'express'
            });
          });
        } else if (layer.name === 'router') {
          // Nested router
          if (layer.regexp && layer.keys) {
            const basePath = layer.keys.length > 0 ? `/${layer.keys.map((k: any) => `:${k.name}`).join('/')}` : '';
            if (layer.handle && layer.handle.stack) {
              layer.handle.stack.forEach((nestedLayer: any) => {
                if (nestedLayer.route) {
                  const fullPath = basePath + nestedLayer.route.path;
                  const methods = Object.keys(nestedLayer.route.methods);
                  methods.forEach(method => {
                    routes.push({
                      method: method.toUpperCase(),
                      path: fullPath,
                      type: 'nested'
                    });
                  });
                }
              });
            }
          }
        }
      });
    }

    require('fs').writeFileSync('route-manifest.json', JSON.stringify(routes, null, 2));
    console.log('[ROUTES] Route manifest written to route-manifest.json');
    console.log(`[ROUTES] Found ${routes.length} routes`);

    // Log reports routes specifically
    const reportsRoutes = routes.filter(r => r.path.includes('reports'));
    console.log('[ROUTES] Reports routes found:', reportsRoutes);
  } catch (error) {
    console.error('[ROUTES] Error dumping routes:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy - Plesk/nginx terminates SSL
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Serve static files from data directory (where uploads are stored)
  const express = require('express');
  const path = require('path');
  const uploadDir = process.env.ASSET_UPLOAD_DIR || './data';
  app.use('/uploads', express.static(path.resolve(uploadDir)));

  // Optionally serve frontend from the same server (solves cookie issues in dev)
  // Set SERVE_FRONTEND=true in .env to enable
  if (process.env.SERVE_FRONTEND === 'true') {
    const frontendPath = process.env.FRONTEND_PATH || path.resolve(__dirname, '../../web/out');
    console.log(`[Frontend] Serving frontend from: ${frontendPath}`);

    // Serve Next.js static files
    app.use('/_next', express.static(path.join(frontendPath, '_next')));
    app.use('/static', express.static(path.join(frontendPath, 'static')));

    // Serve frontend index for all non-API routes
    app.use((req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow uploads to be accessed
  }));
  app.use(compression());
  app.use(cookieParser());

  // Session configuration with standardized cookie options
  // Detect production by checking for SESSION_SECRET or explicit COOKIE_DOMAIN env var
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const forceSecureCookies = process.env.FORCE_SECURE_COOKIES === 'true';
  const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? '.replayhub.app' : undefined);
  const cookieSecure = forceSecureCookies || (isProduction && cookieDomain !== undefined);

  const sessionSameSiteRaw = process.env.SESSION_COOKIE_SAMESITE?.toLowerCase();
  const allowedSameSite: Array<'lax' | 'strict' | 'none'> = ['lax', 'strict', 'none'];
  let cookieSameSite: boolean | 'lax' | 'strict' | 'none' = cookieSecure ? 'none' : 'lax';

  if (sessionSameSiteRaw === 'true') {
    cookieSameSite = true;
  } else if (sessionSameSiteRaw === 'false') {
    cookieSameSite = false;
  } else if (sessionSameSiteRaw && allowedSameSite.includes(sessionSameSiteRaw as 'lax' | 'strict' | 'none')) {
    cookieSameSite = sessionSameSiteRaw as 'lax' | 'strict' | 'none';
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      name: 'sessionId',
      cookie: {
        secure: cookieSecure,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours (can be extended by rememberMe)
        sameSite: cookieSameSite,
        path: '/',
        domain: cookieDomain, // '.replayhub.app' in prod, undefined in dev
      },
      rolling: true, // Extend session on each request to prevent logout during active use
    }),
  );

  console.log('[Session] Cookie config:', {
    environment: nodeEnv,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    domain: cookieDomain || 'undefined (localhost)',
    forceSecureCookies,
    note: cookieSecure ? 'Secure cookies enabled' : 'DEV: Secure cookies disabled for localhost compatibility',
  });

  // Trace scheduling middleware (temporary for debugging) - AFTER session middleware
  app.use(traceScheduling);

  // CORS with enhanced credential support
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (corsOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Essential for session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cookie',
      'Set-Cookie',
      'x-org-slug',
    ],
    exposedHeaders: ['Set-Cookie'], // Allow frontend to see Set-Cookie headers
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false,
  });

  console.log('[CORS] Allowed origins:', corsOrigins);
  console.log('[CORS] Credentials enabled: true');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Esports Operations API')
      .setDescription('Multi-tenant esports operations platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('session')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Dump routes for debugging (non-production only)
  dumpRoutes(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
