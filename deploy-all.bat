@echo off
echo Deploying RecipeHub (Frontend + Backend) to Firebase...

echo.
echo Step 1: Installing functions dependencies...
cd functions
call npm install
cd ..

echo.
echo Step 2: Building client application...
cd client
call npm run build
cd ..

echo.
echo Step 3: Deploying to Firebase...
call firebase deploy

echo.
echo Deployment completed!
echo Frontend: https://recipehub-a7da3.web.app
echo API: https://recipehub-a7da3.web.app/api
pause
