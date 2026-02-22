#!/bin/bash

STACK_NAME="fleethub-terminal-webhooks"
REGION="us-east-1"
PROFILE="rii"

echo "Deploying Terminal webhook infrastructure..."

aws cloudformation deploy \
  --template-file cloudformation/terminal-webhooks.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    TerminalSecretKey="sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A" \
  --region $REGION \
  --profile $PROFILE

if [ $? -eq 0 ]; then
  echo "✅ Webhook infrastructure deployed successfully"
  
  WEBHOOK_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`WebhookUrl`].OutputValue' \
    --output text \
    --region $REGION \
    --profile $PROFILE)
  
  echo ""
  echo "📍 Webhook URL: $WEBHOOK_URL"
  echo ""
  echo "Next steps:"
  echo "1. Register this URL in Terminal dashboard (https://app.svix.com/app_39lkx671XDarIEK58PJ3TUrfY5r/endpoints)"
  echo "2. Subscribe to events: vehicle.modified, safety_event.added, driver.modified"
else
  echo "❌ Deployment failed"
  exit 1
fi
