#!/bin/bash
set -e

# Configuration
STACK_NAME="fleethub-terminal"
REGION="us-east-1"
PROFILE="rii"
TEMPLATE="cloudformation/terminal-infrastructure.yaml"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 FleetHub Terminal - Infrastructure Deployment${NC}"
echo ""

# Check if stack exists
echo -e "${BLUE}📊 Checking if stack exists...${NC}"
if aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION &> /dev/null; then
  
  echo -e "${YELLOW}Stack exists. Updating...${NC}"
  
  aws cloudformation update-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE \
    --parameters \
      ParameterKey=TerminalSecretKey,ParameterValue=sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A \
      ParameterKey=ConnectionToken,ParameterValue=con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF \
    --capabilities CAPABILITY_IAM \
    --profile $PROFILE \
    --region $REGION
  
  echo -e "${BLUE}Waiting for stack update...${NC}"
  aws cloudformation wait stack-update-complete \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION
  
  echo -e "${GREEN}✅ Stack updated successfully${NC}"
  
else
  
  echo -e "${YELLOW}Stack does not exist. Creating...${NC}"
  
  TERMINAL_KEY="sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A"
  CONNECTION_TOKEN="con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF"
  
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE \
    --parameters \
      ParameterKey=TerminalSecretKey,ParameterValue=$TERMINAL_KEY \
      ParameterKey=ConnectionToken,ParameterValue=$CONNECTION_TOKEN \
    --capabilities CAPABILITY_IAM \
    --profile $PROFILE \
    --region $REGION
  
  echo -e "${BLUE}Waiting for stack creation...${NC}"
  aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION
  
  echo -e "${GREEN}✅ Stack created successfully${NC}"
  
fi

# Get stack outputs
echo ""
echo -e "${BLUE}📊 Stack Outputs:${NC}"
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table

echo ""
echo -e "${GREEN}✅ Infrastructure deployment complete!${NC}"
echo ""
echo -e "${BLUE}🎯 Next steps:${NC}"
echo "  1. Build React frontend"
echo "  2. Deploy frontend to S3"
echo "  3. Test API endpoints"
echo "  4. Implement real Terminal API integration"
