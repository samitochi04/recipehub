@echo off
echo Deploying Firebase Functions only (quick deploy)...

echo.
echo Deploying functions...
call firebase deploy --only functions

echo.
echo ========================================
echo 🎉 Functions Deployment Complete!
echo ========================================
echo Functions URL: https://api-3dqwd2emcq-uc.a.run.app
echo Test: https://recipehub-a7da3.web.app/api/test
echo.
echo Test your app now!
pause