@echo off
echo Fixing Next.js configuration...

REM Check if next.config.ts exists
if exist next.config.ts (
    echo Found next.config.ts - renaming to next.config.js
    ren next.config.ts next.config.js
    echo ✅ Configuration file renamed
) else (
    echo next.config.ts not found, checking for other config files...
)

REM Create next.config.js if it doesn't exist
if not exist next.config.js (
    if not exist next.config.mjs (
        echo Creating next.config.js...
        (
            echo /** @type {import('next').NextConfig} */
            echo const nextConfig = {
            echo   reactStrictMode: true,
            echo   swcMinify: true,
            echo   images: {
            echo     domains: [],
            echo   },
            echo   env: {
            echo     API_URL: process.env.NEXT_PUBLIC_API_URL,
            echo   },
            echo ^}
            echo.
            echo module.exports = nextConfig
        ) > next.config.js
        echo ✅ next.config.js created
    )
)

echo ✅ Configuration fix complete!
echo You can now run: npm run dev