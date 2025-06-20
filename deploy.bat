@echo off
echo Building and deploying RecipeHub to Firebase...

echo.
echo Step 1: Installing dependencies...
call npm run install-all

echo.
echo Step 2: Building client application...
call npm run build

echo.
echo Step 3: Deploying to Firebase...
call firebase deploy

echo.
echo Deployment completed!
echo Your app is now live at: https://your-firebase-project-id.web.app
pause
