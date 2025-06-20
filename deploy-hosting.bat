@echo off
echo Deploying RecipeHub frontend to Firebase Hosting...

echo.
echo Step 1: Installing client dependencies...
cd client
call npm install

echo.
echo Step 2: Building client application...
call npm run build

echo.
echo Step 3: Deploying to Firebase Hosting...
cd ..
call firebase deploy --only hosting

echo.
echo Deployment completed!
echo Your app is now live at: https://recipehub-a7da3.web.app
pause
