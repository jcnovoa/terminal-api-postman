# FleetHub - Powered by Terminal
## Complete Implementation Plan

**Project**: FleetHub Terminal Edition  
**Purpose**: Multi-TSP Fleet Management Platform  
**Based on**: Proven FleetSync (Verizon Connect) architecture  
**Date**: February 21, 2026

---

## Executive Summary

Build a **TSP-agnostic fleet management platform** using Terminal's unified API, leveraging 80% of existing FleetSync codebase while gaining support for 30+ telematics providers.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Code Reuse** | 80% from FleetSync |
| **Development Time** | 2-3 days |
| **TSP Support** | 30+ providers |
| **Feature Parity** | 95% (Phase 1), 85% (Phase 2) |
| **Monthly Cost** | ~$8.50 (same as current) |

### Strategic Value

✅ **Multi-TSP Support**: Works with any fleet system  
✅ **Reduced Maintenance**: Terminal handles TSP API changes  
✅ **Competitive Advantage**: "Works with your existing system"  
✅ **Future-Proof**: Easy to add new TSPs  
✅ **Proven Architecture**: Based on working FleetSync solution

---

## Architecture Overview

### Current State (FleetSync)
```
React Dashboard → Lambda Proxy → Verizon Connect API
                                      ↓
                              (Verizon data only)
```

### Future State (FleetHub Terminal)
```
React Dashboard → Lambda Proxy → Terminal API
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                 ↓                 ↓
              Verizon Connect    Samsara           Geotab
                                                (30+ TSPs)
```

### Technology Stack (Unchanged)

**Frontend**:
- React 18.2 + TypeScript 5.3
- Vite 5.0 + Tailwind CSS 3.3
- Leaflet 1.9.4 (maps)
- Lucide React (icons)

**Backend**:
- AWS Lambda (Node.js 18.x)
- AWS API Gateway (HTTP API)
- AWS S3 + CloudFront
- AWS Route53 + ACM

**APIs**:
- Terminal API (unified)
- SambaSafety API (MVR - future)

---

## Implementation Phases

### Phase 1: Core Features (Week 1)

**Goal**: Replace Verizon Connect API calls with Terminal API calls

#### 1.1 Update Lambda Proxy (4 hours)

**File**: `lambda/terminal-proxy.js`

```javascript
// Replace Verizon Connect authentication
const TERMINAL_SECRET_KEY = process.env.TERMINAL_SECRET_KEY;
const CONNECTION_TOKEN = process.env.CONNECTION_TOKEN;
const BASE_URL = 'https://api.sandbox.withterminal.com/tsp/v1';

// Update API calls
async function getVehicles() {
  const response = await fetch(`${BASE_URL}/vehicles`, {
    headers: {
      'Authorization': `Bearer ${TERMINAL_SECRET_KEY}`,
      'Connection-Token': CONNECTION_TOKEN
    }
  });
  return response.json();
}

async function getDrivers() {
  const response = await fetch(`${BASE_URL}/drivers`, {
    headers: {
      'Authorization': `Bearer ${TERMINAL_SECRET_KEY}`,
      'Connection-Token': CONNECTION_TOKEN
    }
  });
  return response.json();
}

async function getVehicleLocations() {
  const response = await fetch(`${BASE_URL}/vehicles/locations/latest`, {
    headers: {
      'Authorization': `Bearer ${TERMINAL_SECRET_KEY}`,
      'Connection-Token': CONNECTION_TOKEN
    }
  });
  return response.json();
}

async function getHOSStatus() {
  const response = await fetch(`${BASE_URL}/hos/available-time`, {
    headers: {
      'Authorization': `Bearer ${TERMINAL_SECRET_KEY}`,
      'Connection-Token': CONNECTION_TOKEN
    }
  });
  return response.json();
}

async function getSafetyEvents() {
  const response = await fetch(`${BASE_URL}/safety/events`, {
    headers: {
      'Authorization': `Bearer ${TERMINAL_SECRET_KEY}`,
      'Connection-Token': CONNECTION_TOKEN
    }
  });
  return response.json();
}

async function getGroups() {
  const response = await fetch(`${BASE_URL}/groups`, {
    headers: {
      'Authorization': `Bearer ${TERMINAL_SECRET_KEY}`,
      'Connection-Token': CONNECTION_TOKEN
    }
  });
  return response.json();
}
```

**Changes**:
- Replace Verizon Connect base URL with Terminal API
- Update authentication (Bearer + Connection-Token)
- Map Verizon response format to Terminal format
- Update error handling

#### 1.2 Update Frontend Data Models (2 hours)

**File**: `src/types/terminal.ts`

```typescript
// Terminal API Types
export interface Vehicle {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  sourceId: string;
  provider: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate: {
    number: string;
    state: string;
  };
  fuelType?: string;
  fuelTankCapacity?: number;
  groups: string[];
  devices: string[];
  metadata: {
    addedAt: string;
    modifiedAt: string;
    visibility: string;
  };
}

export interface VehicleLocation {
  vehicle: {
    id: string;
    name: string;
  };
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    address?: string;
    recordedAt: string;
  };
}

export interface Driver {
  id: string;
  status: 'active' | 'inactive';
  sourceId: string;
  provider: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  license: {
    number: string;
    state: string;
  };
  username?: string;
  groups: string[];
  metadata: {
    addedAt: string;
    modifiedAt: string;
    visibility: string;
  };
}

export interface HOSStatus {
  id: string;
  driver: {
    id: string;
    name: string;
  };
  status: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  availableTime: {
    drive: number;
    shift: number;
    cycle: number;
  };
  lastStatusChange: string;
}

export interface SafetyEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  driver: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    name: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  speed?: number;
  speedLimit?: number;
  timestamp: string;
  media?: {
    available: boolean;
    url?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  sourceId: string;
  provider: string;
  parentGroup?: string;
  vehicles: string[];
  drivers: string[];
}
```

#### 1.3 Update React Components (4 hours)

**Files to Update**:
- `src/VerizonConnect.tsx` → `src/FleetHub.tsx`
- `src/services/verizonConnectAPI.ts` → `src/services/terminalAPI.ts`

**Changes**:
```typescript
// Update API service
export const terminalAPI = {
  async getVehicles() {
    const response = await fetch('/api/vehicles');
    const data = await response.json();
    return data.results; // Terminal uses "results" array
  },

  async getDrivers() {
    const response = await fetch('/api/drivers');
    const data = await response.json();
    return data.results;
  },

  async getVehicleLocations() {
    const response = await fetch('/api/vehicles/locations/latest');
    const data = await response.json();
    return data.results;
  },

  async getHOSStatus() {
    const response = await fetch('/api/hos/available-time');
    const data = await response.json();
    return data.results;
  },

  async getSafetyEvents() {
    const response = await fetch('/api/safety/events');
    const data = await response.json();
    return data.results;
  }
};

// Update component to use new data structure
function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="vehicle-card">
      <h3>{vehicle.name}</h3>
      <p>VIN: {vehicle.vin}</p>
      <p>{vehicle.year} {vehicle.make} {vehicle.model}</p>
      <p>License: {vehicle.licensePlate.number} ({vehicle.licensePlate.state})</p>
      <span className={`status-${vehicle.status}`}>{vehicle.status}</span>
      <span className="provider-badge">{vehicle.provider}</span>
    </div>
  );
}
```

#### 1.4 Update CloudFormation (1 hour)

**File**: `cloudformation/fleethub-terminal.yaml`

```yaml
Parameters:
  TerminalSecretKey:
    Type: String
    NoEcho: true
    Description: Terminal API Secret Key
  
  ConnectionToken:
    Type: String
    NoEcho: true
    Description: Terminal Connection Token

Resources:
  TerminalProxyFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: fleethub-terminal-proxy
      Runtime: nodejs18.x
      Handler: index.handler
      Environment:
        Variables:
          TERMINAL_SECRET_KEY: !Ref TerminalSecretKey
          CONNECTION_TOKEN: !Ref ConnectionToken
          TERMINAL_BASE_URL: https://api.sandbox.withterminal.com/tsp/v1
```

#### 1.5 Deploy & Test (1 hour)

```bash
# Update Lambda environment variables
aws lambda update-function-configuration \
  --function-name fleethub-terminal-proxy \
  --environment Variables="{
    TERMINAL_SECRET_KEY=sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A,
    CONNECTION_TOKEN=con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF
  }" \
  --profile rii \
  --region us-east-1

# Deploy frontend
cd fleethub-terminal
npm run build
aws s3 sync dist/ s3://terminal.rhythminnovations.info-fleethub --delete --profile rii
aws cloudfront create-invalidation --distribution-id E26E7SI577MZI4 --paths "/*" --profile rii
```

**Phase 1 Deliverables**:
- ✅ Lambda proxy updated with Terminal API
- ✅ Frontend updated with Terminal data models
- ✅ All core features working (vehicles, drivers, HOS, safety, groups)
- ✅ Deployed to https://terminal.rhythminnovations.info

**Phase 1 Time**: 12 hours (1.5 days)

---

### Phase 2: Advanced Features (Week 2)

**Goal**: Implement Terminal-specific features and enhancements

#### 2.1 Webhook Integration (4 hours)

**File**: `lambda/webhooks/terminal-webhook-handler.js`

```javascript
// Terminal Webhook Handler
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  
  // Handle different webhook events
  switch (body.event) {
    case 'vehicle.location.updated':
      await handleLocationUpdate(body.data);
      break;
    
    case 'safety.event.created':
      await handleSafetyEvent(body.data);
      break;
    
    case 'sync.completed':
      await handleSyncCompleted(body.data);
      break;
    
    default:
      console.log('Unknown event:', body.event);
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};

async function handleLocationUpdate(data) {
  // Store in DynamoDB
  await dynamodb.put({
    TableName: 'fleethub-terminal-locations',
    Item: {
      vehicleId: data.vehicle.id,
      timestamp: data.location.recordedAt,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      speed: data.location.speed,
      heading: data.location.heading,
      address: data.location.address,
      ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    }
  }).promise();
}
```

**Configure Webhooks**:
```bash
# Register webhook endpoint with Terminal
curl -X POST "https://api.sandbox.withterminal.com/tsp/v1/webhook-events" \
  -H "Authorization: Bearer sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A" \
  -H "Connection-Token: con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_API_GATEWAY/webhooks/terminal",
    "events": [
      "vehicle.location.updated",
      "safety.event.created",
      "sync.completed"
    ]
  }'
```

#### 2.2 Connection Manager UI (3 hours)

**File**: `src/components/ConnectionManager.tsx`

```typescript
function ConnectionManager() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<string>('');

  useEffect(() => {
    loadConnections();
  }, []);

  async function loadConnections() {
    const response = await fetch('/api/connections');
    const data = await response.json();
    setConnections(data.results);
  }

  async function switchConnection(connectionId: string) {
    // Update active connection
    setActiveConnection(connectionId);
    
    // Reload all data with new connection
    await Promise.all([
      loadVehicles(),
      loadDrivers(),
      loadHOSStatus(),
      loadSafetyEvents()
    ]);
  }

  return (
    <div className="connection-manager">
      <h3>Active Connection</h3>
      <select 
        value={activeConnection} 
        onChange={(e) => switchConnection(e.target.value)}
      >
        {connections.map(conn => (
          <option key={conn.id} value={conn.id}>
            {conn.company.name} ({conn.provider.name})
          </option>
        ))}
      </select>

      <div className="connection-details">
        <p>Provider: {activeConnection?.provider.name}</p>
        <p>Status: {activeConnection?.status}</p>
        <p>Sync Mode: {activeConnection?.syncMode}</p>
      </div>

      <button onClick={() => window.open(activeConnection?.linkUrl)}>
        Add New Connection
      </button>
    </div>
  );
}
```

#### 2.3 Real-Time Data Polling (2 hours)

**File**: `src/hooks/useRealTimeData.ts`

```typescript
export function useRealTimeData(interval = 30000) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<VehicleLocation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial load
    loadData();

    // Set up polling
    const intervalId = setInterval(loadData, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  async function loadData() {
    try {
      const [vehiclesData, locationsData] = await Promise.all([
        terminalAPI.getVehicles(),
        terminalAPI.getVehicleLocations()
      ]);

      setVehicles(vehiclesData);
      setLocations(locationsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  return { vehicles, locations, lastUpdate, refresh: loadData };
}
```

#### 2.4 Provider Badge Component (1 hour)

**File**: `src/components/ProviderBadge.tsx`

```typescript
function ProviderBadge({ provider }: { provider: string }) {
  const providerInfo = {
    'verizon-fleet': { name: 'Verizon Fleet', color: 'red' },
    'verizon-reveal': { name: 'Verizon Reveal', color: 'red' },
    'samsara': { name: 'Samsara', color: 'blue' },
    'geotab': { name: 'Geotab', color: 'green' },
    'motive': { name: 'Motive', color: 'purple' }
  };

  const info = providerInfo[provider] || { name: provider, color: 'gray' };

  return (
    <span 
      className={`provider-badge bg-${info.color}-100 text-${info.color}-800`}
    >
      {info.name}
    </span>
  );
}
```

**Phase 2 Deliverables**:
- ✅ Webhook integration for real-time updates
- ✅ Connection manager UI
- ✅ Real-time data polling (30s interval)
- ✅ Provider badges on all entities
- ✅ Multi-connection support

**Phase 2 Time**: 10 hours (1.25 days)

---

## Total Implementation Time

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1: Core Features | Lambda, Frontend, Deploy | 12 hours |
| Phase 2: Advanced Features | Webhooks, UI, Polling | 10 hours |
| **Total** | | **22 hours (2.75 days)** |

---

## Deployment Plan

### Step 1: Update Existing Infrastructure

```bash
# Use existing CloudFormation stack
aws cloudformation update-stack \
  --stack-name fleethub-terminal \
  --template-body file://cloudformation/fleethub-terminal.yaml \
  --parameters \
    ParameterKey=TerminalSecretKey,ParameterValue=sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A \
    ParameterKey=ConnectionToken,ParameterValue=con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF \
  --capabilities CAPABILITY_IAM \
  --profile rii \
  --region us-east-1
```

### Step 2: Deploy Lambda Code

```bash
cd lambda
zip -r terminal-proxy.zip .
aws lambda update-function-code \
  --function-name fleethub-terminal-proxy \
  --zip-file fileb://terminal-proxy.zip \
  --profile rii \
  --region us-east-1
```

### Step 3: Deploy Frontend

```bash
cd fleethub-terminal
npm run build
aws s3 sync dist/ s3://terminal.rhythminnovations.info-fleethub --delete --profile rii
aws cloudfront create-invalidation \
  --distribution-id E26E7SI577MZI4 \
  --paths "/*" \
  --profile rii
```

### Step 4: Configure Webhooks

```bash
# Register webhook with Terminal
curl -X POST "https://api.sandbox.withterminal.com/tsp/v1/webhook-events" \
  -H "Authorization: Bearer sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A" \
  -H "Connection-Token: con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://wer6tsu3ul.execute-api.us-east-1.amazonaws.com/api/webhooks/terminal",
    "events": ["vehicle.location.updated", "safety.event.created", "sync.completed"]
  }'
```

---

## Testing Plan

### Phase 1 Testing

```bash
# Test vehicles endpoint
curl https://terminal.rhythminnovations.info/api/vehicles

# Test drivers endpoint
curl https://terminal.rhythminnovations.info/api/drivers

# Test locations endpoint
curl https://terminal.rhythminnovations.info/api/vehicles/locations/latest

# Test HOS endpoint
curl https://terminal.rhythminnovations.info/api/hos/available-time

# Test safety events endpoint
curl https://terminal.rhythminnovations.info/api/safety/events
```

### Phase 2 Testing

```bash
# Test webhook delivery
curl -X POST https://terminal.rhythminnovations.info/api/webhooks/terminal \
  -H "Content-Type: application/json" \
  -d '{
    "event": "vehicle.location.updated",
    "data": {
      "vehicle": {"id": "vcl_test", "name": "Test Truck"},
      "location": {"latitude": 40.7128, "longitude": -74.0060}
    }
  }'

# Test connection switching
# (Manual UI testing)

# Test real-time polling
# (Monitor network tab for 30s intervals)
```

---

## Success Criteria

### Phase 1
- ✅ All vehicles display correctly
- ✅ All drivers display correctly
- ✅ Vehicle locations show on map
- ✅ HOS status displays for all drivers
- ✅ Safety events list populated
- ✅ Groups/fleet organization working
- ✅ Provider badges show correct TSP

### Phase 2
- ✅ Webhooks receiving data
- ✅ Real-time updates every 30 seconds
- ✅ Connection manager functional
- ✅ Can switch between connections
- ✅ Multi-TSP data displays correctly

---

## Cost Analysis

### Monthly AWS Costs (Unchanged)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100K invocations | ~$0.20 |
| API Gateway | 100K requests | ~$0.10 |
| S3 | Storage + requests | ~$0.50 |
| CloudFront | Data transfer | ~$1.50 |
| Route53 | Hosted zone | ~$0.50 |
| DynamoDB | Webhook storage | ~$1.50 |
| CloudWatch | Logs | ~$0.50 |
| **Total** | | **~$5.30/month** |

**Terminal API Costs**: Included in Terminal subscription (not AWS)

---

## Risk Mitigation

### Risk 1: Real-Time Data Latency
**Impact**: Medium  
**Mitigation**: 
- Configure 30-second polling interval
- Use webhooks for critical events
- Set user expectations (near real-time vs real-time)

### Risk 2: TSP-Specific Features
**Impact**: Low  
**Mitigation**:
- Use Terminal passthrough API for custom features
- Document TSP-specific limitations
- Provide fallback to direct integration if needed

### Risk 3: Data Model Changes
**Impact**: Low  
**Mitigation**:
- Terminal handles TSP API changes
- Normalized schema reduces breaking changes
- Version API responses

### Risk 4: Webhook Reliability
**Impact**: Low  
**Mitigation**:
- Implement retry logic
- Store webhook events in DynamoDB
- Fall back to polling if webhooks fail

---

## Next Steps

### Immediate (This Week)
1. ✅ Review gap analysis documents
2. ✅ Approve implementation plan
3. [ ] Begin Phase 1 implementation
4. [ ] Test with sandbox data

### Next Week
1. [ ] Complete Phase 1 deployment
2. [ ] Begin Phase 2 implementation
3. [ ] Test webhook integration
4. [ ] Deploy to production

### Future Enhancements
1. [ ] Add SambaSafety MVR integration
2. [ ] Support multiple simultaneous connections
3. [ ] Add TSP comparison dashboard
4. [ ] Implement advanced analytics
5. [ ] Build mobile app

---

## Conclusion

**Recommendation**: ✅ **PROCEED WITH TERMINAL INTEGRATION**

**Rationale**:
- 95% feature parity for core features
- 85% feature parity for advanced features
- 30+ TSP support vs 1 TSP
- Reduced maintenance burden
- Proven architecture (80% code reuse)
- Acceptable trade-offs (real-time → near real-time)
- 2-3 day implementation time
- Same AWS costs

**Strategic Value**:
- Future-proof platform
- Competitive advantage
- Easier customer onboarding
- Reduced integration complexity

**Next Action**: Begin Phase 1 implementation (12 hours)

---

**Project Lead**: J.C. Novoa  
**Organization**: Rhythm Innovations  
**Date**: February 21, 2026  
**Status**: Ready for Implementation

