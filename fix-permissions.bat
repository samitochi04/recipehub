@echo off
echo Fixing Firebase Functions permissions...

echo.
echo Step 1: Deploy functions with public access...
call firebase deploy --only functions

echo.
echo Step 2: Make function publicly accessible...
call firebase functions:config:set runtime.public=true

echo.
echo Step 3: Set IAM policy (manual command)...
echo Run this command manually if the above doesn't work:
echo gcloud functions add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/cloudfunctions.invoker" --project=recipehub-a7da3

echo.
echo Functions should now be accessible!
pause