@echo off

echo 🚀 Starting development environment...

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Build shared packages first
echo 🔨 Building shared packages...
npm run build --workspace=@esports-ops/ui

REM Start development servers
echo 🌐 Starting development servers...
npm run dev