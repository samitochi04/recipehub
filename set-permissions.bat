@echo off
echo Setting Firebase Functions IAM permissions...

echo.
echo Making functions publicly accessible...
call gcloud functions add-iam-policy-binding api --region=us-central1 --member="allUsers" --role="roles/cloudfunctions.invoker" --project=recipehub-a7da3

echo.
echo IAM permissions updated!
echo Test: https://api-3dqwd2emcq-uc.a.run.app/health
pause