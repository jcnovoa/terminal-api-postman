# Terminal Implementation Plan - Part 2: Deployment & Operations

---

## 🚀 Phase 4: AWS Deployment Automation (Week 5)

### Objective
Automated CloudFormation deployment with complete infrastructure as code

### 4.1 CloudFormation Template Structure

**File**: `cloudformation/terminal-complete.yaml`

**Pattern**: CarrierOK + Verizon Connect combined

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'FleetHub Terminal - Complete Infrastructure'

Parameters:
  DomainName:
    Type: String
    Default: terminal.rhythminnovations.info
  
  CertificateArn:
    Type: String
    Description: ACM Certificate ARN for *.rhythminnovations.info
  
  HostedZoneName:
    Type: String
    Default: rhythminnovations.info
  
  TerminalSecretKey:
    Type: String
    NoEcho: true
    Description: Terminal API Secret Key
  
  SambaApiKey:
    Type: String
    NoEcho: true
    Description: SambaSafety API Key

Resources:
  # Lambda Function
  TerminalProxyFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: fleethub-terminal-proxy
      Runtime: nodejs18.x
      Handler: index.handler
      MemorySize: 512
      Timeout: 30
      Role: !GetAtt LambdaExecutionRole.Arn
      Environment:
        Variables:
          TERMINAL_SECRET_KEY: !Ref TerminalSecretKey
          SAMBA_API_KEY: !Ref SambaApiKey
          TERMINAL_BASE_URL: https://api.terminal.co
          SAMBA_BASE_URL: https://api.sambasafety.com
      Code:
        ZipFile: |
          # Embedded Lambda code (or reference S3 bucket)
  
  # API Gateway HTTP API
  TerminalApiGateway:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: fleethub-terminal-api
      ProtocolType: HTTP
      CorsConfiguration:
        AllowOrigins:
          - !Sub 'https://${DomainName}'
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - OPTIONS
        AllowHeaders:
          - '*'
        MaxAge: 3600
  
  # S3 Bucket (Static Website)
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${DomainName}-fleethub'
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
  
  # CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Aliases:
          - !Ref DomainName
        ViewerCertificate:
          AcmCertificateArn: !Ref CertificateArn
          SslSupportMethod: sni-only
          MinimumProtocolVersion: TLSv1.2_2021
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt FrontendBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${CloudFrontOAI}'
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          Compress: true
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
  
  # Route53 DNS Record
  DNSRecord:
    Type: AWS::Route53::RecordSet
    Properties:
      HostedZoneName: !Sub '${HostedZoneName}.'
      Name: !Ref DomainName
      Type: A
      AliasTarget:
        DNSName: !GetAtt CloudFrontDistribution.DomainName
        HostedZoneId: Z2FDTNDATAQYW2  # CloudFront hosted zone ID
  
  # IAM Role for Lambda
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: SecretsManagerAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - secretsmanager:GetSecretValue
                Resource: '*'

Outputs:
  WebsiteURL:
    Description: Website URL
    Value: !Sub 'https://${DomainName}'
  
  ApiProxyEndpoint:
    Description: API Gateway endpoint
    Value: !Sub 'https://${TerminalApiGateway}.execute-api.${AWS::Region}.amazonaws.com'
  
  CloudFrontDistributionId:
    Description: CloudFront distribution ID
    Value: !Ref CloudFrontDistribution
  
  S3BucketName:
    Description: S3 bucket name
    Value: !Ref FrontendBucket
```

### 4.2 Deployment Script

**File**: `deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Starting FleetHub Terminal deployment..."

# Configuration
STACK_NAME="fleethub-terminal"
REGION="us-east-1"
PROFILE="rii"
DOMAIN="terminal.rhythminnovations.info"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Build frontend
echo -e "${BLUE}📦 Building frontend...${NC}"
cd fleethub-terminal
npm run build

# Step 2: Copy documentation (CRITICAL)
echo -e "${BLUE}📚 Copying documentation...${NC}"
cp -r ../docs build/

# Step 3: Deploy infrastructure (if not exists)
echo -e "${BLUE}☁️ Checking CloudFormation stack...${NC}"
if ! aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION &> /dev/null; then
  
  echo -e "${BLUE}Creating new stack...${NC}"
  read -sp "Enter Terminal Secret Key: " TERMINAL_KEY
  echo
  read -sp "Enter SambaSafety API Key: " SAMBA_KEY
  echo
  
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://cloudformation/terminal-complete.yaml \
    --parameters \
      ParameterKey=TerminalSecretKey,ParameterValue=$TERMINAL_KEY \
      ParameterKey=SambaApiKey,ParameterValue=$SAMBA_KEY \
    --capabilities CAPABILITY_IAM \
    --profile $PROFILE \
    --region $REGION
  
  echo -e "${BLUE}Waiting for stack creation...${NC}"
  aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION
fi

# Step 4: Get stack outputs
echo -e "${BLUE}📊 Getting stack outputs...${NC}"
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# Step 5: Deploy to S3
echo -e "${BLUE}☁️ Deploying to S3...${NC}"
aws s3 sync build/ s3://$BUCKET_NAME --delete --profile $PROFILE

# Step 6: Invalidate CloudFront cache
echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --profile $PROFILE

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Website: https://$DOMAIN${NC}"
echo -e "${GREEN}📖 Documentation:${NC}"
echo -e "   - API Catalog: https://$DOMAIN/docs/terminal_api_catalog.html"
echo -e "   - Integration Guide: https://$DOMAIN/docs/terminal_integration_guide.html"
```

### 4.3 Lambda Deployment Package

**File**: `scripts/package-lambda.sh`

```bash
#!/bin/bash
set -e

echo "📦 Packaging Lambda function..."

# Create temp directory
mkdir -p /tmp/lambda-package
cd /tmp/lambda-package

# Copy Lambda code
cp -r /path/to/lambda/* .

# Install dependencies
npm install --production

# Create ZIP
zip -r lambda.zip .

# Update Lambda function
aws lambda update-function-code \
  --function-name fleethub-terminal-proxy \
  --zip-file fileb://lambda.zip \
  --profile rii \
  --region us-east-1

echo "✅ Lambda function updated"
```

**Estimated Time**: 8 hours

---

## 🧪 Phase 5: Testing & Validation (Week 6)

### 5.1 API Integration Testing

**File**: `tests/api-integration.test.js`

```javascript
describe('Terminal API Integration', () => {
  test('Authentication - Public Token Exchange', async () => {
    const response = await fetch('/auth/exchange', {
      method: 'POST',
      body: JSON.stringify({ publicToken: 'test_token' })
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('connectionToken');
  });
  
  test('Drivers - List All', async () => {
    const response = await fetch('/drivers');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
  });
  
  test('Vehicles - Latest Locations', async () => {
    const response = await fetch('/vehicles/locations/latest');
    expect(response.status).toBe(200);
    expect(response.data.data[0]).toHaveProperty('latitude');
    expect(response.data.data[0]).toHaveProperty('longitude');
  });
  
  test('SambaSafety Integration - Driver with MVR', async () => {
    const response = await fetch('/drivers/123?includeMVR=true');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('mvrData');
    expect(response.data.mvrData).toHaveProperty('violations');
  });
});
```

### 5.2 Frontend Testing

**File**: `tests/dashboard.test.tsx`

```typescript
describe('Dashboard Component', () => {
  test('Renders KPI cards', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Drivers/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicles/i)).toBeInTheDocument();
  });
  
  test('Connection selector switches TSPs', async () => {
    render(<Dashboard />);
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'connection_2' } });
    await waitFor(() => {
      expect(screen.getByText(/Verizon Connect/i)).toBeInTheDocument();
    });
  });
  
  test('Driver list displays MVR risk scores', async () => {
    render(<DriverDirectory />);
    await waitFor(() => {
      expect(screen.getByText(/Risk Score/i)).toBeInTheDocument();
    });
  });
});
```

### 5.3 End-to-End Testing

**Scenarios**:
1. **User Journey: View Driver with MVR**
   - Navigate to Drivers tab
   - Search for driver
   - Click driver card
   - View Terminal data + SambaSafety MVR
   - Verify risk score calculation

2. **User Journey: Track Vehicle**
   - Navigate to Vehicles tab
   - Click vehicle
   - View on map
   - Check real-time location
   - View historical stats

3. **User Journey: HOS Compliance**
   - Navigate to HOS tab
   - View driver available time
   - Check for violations
   - View daily logs

4. **User Journey: Safety Event Investigation**
   - Dashboard shows safety event
   - Click event
   - View driver profile
   - Check MVR history
   - View event media (if available)

**Estimated Time**: 16 hours

---

## 📊 Phase 6: Monitoring & Optimization (Week 7)

### 6.1 CloudWatch Monitoring

**Metrics to Track**:
- Lambda invocations
- API Gateway requests
- Error rates
- Response times
- CloudFront cache hit ratio
- S3 request counts

**Alarms**:
- Lambda errors > 5% (5 minutes)
- API Gateway 5xx errors > 10 (5 minutes)
- Lambda duration > 10 seconds
- CloudFront 4xx/5xx errors > 100 (5 minutes)

**Dashboard**: `cloudformation/monitoring-dashboard.yaml`

### 6.2 Cost Optimization

**Expected Monthly Costs**:
- Lambda: ~$2.00 (1M requests, 512MB, 500ms avg)
- API Gateway: ~$3.50 (1M requests)
- S3: ~$0.50 (20GB storage, 100K requests)
- CloudFront: ~$1.50 (100GB transfer)
- Route53: ~$1.00 (hosted zone + queries)
- **Total**: ~$8.50/month

**Optimization Strategies**:
- Enable CloudFront caching (reduce API calls)
- Implement response caching in Lambda
- Use S3 Intelligent-Tiering
- Compress assets (gzip)
- Lazy load components

### 6.3 Performance Optimization

**Frontend**:
- Code splitting (reduce bundle size)
- Lazy loading (load data on demand)
- Virtual scrolling (large lists)
- Debounce search inputs
- Cache API responses (React Query)

**Backend**:
- Connection pooling (reuse HTTP connections)
- Response caching (Redis/ElastiCache - optional)
- Batch API requests
- Parallel processing (Promise.all)
- Compression (gzip responses)

**Estimated Time**: 8 hours

---

## 📚 Phase 7: Documentation (Week 8)

### 7.1 Technical Documentation

**Files to Create**:
1. `TERMINAL_API_CATALOG.md` - Complete API reference
2. `TERMINAL_INTEGRATION_GUIDE.md` - Integration patterns
3. `SAMBASAFETY_MERGE_GUIDE.md` - MVR data integration
4. `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
5. `TROUBLESHOOTING.md` - Common issues and fixes
6. `ARCHITECTURE.md` - System architecture diagrams
7. `TESTING_GUIDE.md` - Testing procedures
8. `ADMIN_GUIDE.md` - Admin console usage

### 7.2 User Documentation

**Files to Create**:
1. `USER_GUIDE.md` - End-user instructions
2. `QUICK_START.md` - Getting started guide
3. `FAQ.md` - Frequently asked questions
4. `VIDEO_TUTORIALS.md` - Links to video guides

### 7.3 API Playground Documentation

**Interactive Documentation** (Admin Console):
- Endpoint explorer
- Request builder
- Response viewer
- Code examples (curl, JavaScript, Python)
- Authentication tester

**Estimated Time**: 16 hours

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ 100% Terminal API coverage (40+ endpoints)
- ✅ SambaSafety MVR integration (driver risk scores)
- ✅ Multi-TSP support (switch connections)
- ✅ Response time < 500ms (95th percentile)
- ✅ Error rate < 1%
- ✅ Uptime > 99.9%

### Business Metrics
- ✅ Replace Verizon Connect direct integration
- ✅ Add 30+ TSP support (via Terminal)
- ✅ Unified driver risk profiles (Terminal + SambaSafety)
- ✅ Reduce integration maintenance (single API)
- ✅ Cost reduction (~$8.50/month vs. multiple integrations)

### User Experience Metrics
- ✅ Dashboard load time < 2 seconds
- ✅ Search response < 300ms
- ✅ Map rendering < 1 second
- ✅ Mobile responsive
- ✅ Accessibility compliant (WCAG 2.1 AA)

---

## 📅 Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1**: API Discovery | 1 week | API catalog, endpoint mapping |
| **Phase 2**: Backend Proxy | 1 week | Lambda proxy, CloudFormation |
| **Phase 3**: React Dashboard | 2 weeks | Complete UI with Terminal + SambaSafety |
| **Phase 4**: AWS Deployment | 1 week | Automated deployment scripts |
| **Phase 5**: Testing | 1 week | Integration, E2E, performance tests |
| **Phase 6**: Monitoring | 1 week | CloudWatch, optimization |
| **Phase 7**: Documentation | 1 week | Technical + user docs |
| **Total** | **8 weeks** | Production-ready FleetHub Terminal |

---

## 🔄 Next Steps

### Immediate Actions (This Week)
1. ✅ Parse Terminal Postman collection
2. ✅ Generate API catalog
3. ✅ Create Verizon Connect → Terminal mapping
4. ✅ Identify SambaSafety integration points
5. ✅ Set up project structure

### Week 2
1. Build Lambda proxy (authentication + core endpoints)
2. Create CloudFormation template
3. Deploy backend infrastructure
4. Test Terminal API integration

### Week 3-4
1. Build React dashboard
2. Implement driver management with MVR
3. Add vehicle tracking
4. Create HOS compliance view
5. Build safety events feed

### Week 5
1. Automated deployment scripts
2. Frontend + backend deployment
3. DNS configuration
4. SSL/TLS setup

---

## 📞 Support & Resources

### Terminal API
- **Documentation**: https://docs.terminal.co
- **Dashboard**: https://dashboard.terminal.co
- **Support**: support@terminal.co

### SambaSafety API
- **Documentation**: https://developer.sambasafety.com
- **Support**: apisupport@sambasafety.com

### AWS Resources
- **CloudFormation**: https://docs.aws.amazon.com/cloudformation
- **Lambda**: https://docs.aws.amazon.com/lambda
- **API Gateway**: https://docs.aws.amazon.com/apigateway

---

**Status**: 📋 **Ready to Start**  
**Next Action**: Parse Terminal Postman collection and generate API catalog  
**Estimated Completion**: 8 weeks from start date
