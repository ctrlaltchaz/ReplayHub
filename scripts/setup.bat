@echo off
REM Esports Operations Platform - Windows Setup Script

echo 🏗️  Setting up Esports Operations Platform Monorepo...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please review and update the .env file with your specific configuration.
)

REM Start infrastructure services first
echo 🚀 Starting infrastructure services PostgreSQL, Redis, MinIO...
docker-compose up -d postgres redis minio

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak

echo ✅ Infrastructure services are ready!

REM Initialize database schema
echo 🗄️  Initializing database schema...
docker-compose exec -T postgres psql -U postgres -d esports_ops -f /docker-entrypoint-initdb.d/schema.sql

REM Seed demo data
echo 🌱 Seeding demo data...
docker-compose exec -T postgres psql -U postgres -d esports_ops -f /docker-entrypoint-initdb.d/seed.sql

REM Start application services
echo 🚀 Starting application services...
docker-compose up -d backend frontend nginx

echo.
echo 🎉 Setup complete!
echo.
echo 📍 Access Points:
echo    Frontend: http://localhost
echo    API Docs: http://localhost/api/docs
echo    MinIO Console: http://localhost/minio
echo.
echo 🔐 Demo Credentials:
echo    Global Admin: admin@demo.com / demo123
echo    Org Admin: admin@demoorg.local / demo123
echo    Demo Player: player1@demoorg.local / demo123
echo.
echo 🏢 Demo Organization: demo-esports
echo    Access at: http://localhost/org/demo-esports
echo.
echo 🔧 Management Commands:
echo    Stop: docker-compose down
echo    Restart: docker-compose restart  
echo    Logs: docker-compose logs -f [service]
echo    Reset: docker-compose down -v && scripts\setup.bat