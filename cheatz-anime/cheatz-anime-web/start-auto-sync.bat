@echo off
echo ================================================
echo    SC-ANIME KH - Auto Sync Service
echo ================================================
echo.
echo Starting auto-sync service...
echo This will sync anime catalog every 1 hour
echo.
echo Press Ctrl+C to stop
echo ================================================
echo.

npm run sync:auto

pause
