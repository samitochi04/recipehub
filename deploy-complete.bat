@echo off
echo Deploying RecipeHub Complete Application...

echo.
echo Step 1: Building client...
cd client
call npm run build
cd ..

echo.
echo Step 2: Deploying functions...
call firebase deploy --only functions

echo.
echo Step 3: Deploying hosting...
call firebase deploy --only hosting

echo.
echo ========================================
echo 🎉 Deployment Complete!
echo ========================================
echo Frontend: https://recipehub-a7da3.web.app
echo Functions: https://api-3dqwd2emcq-uc.a.run.app
echo.
echo Test your app now!
pause
