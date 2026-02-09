# Terminal API - Verizon Connect & SambaSafety Integration Points

**Purpose**: Map Terminal API endpoints to existing Verizon Connect and SambaSafety integrations  
**Goal**: Identify which Terminal endpoints replace/enhance current implementations  
**Last Updated**: February 9, 2026

---

## 🎯 Integration Strategy

### Current State
- **Verizon Connect**: Direct API integration for telematics (vehicles, drivers, HOS, safety)
- **SambaSafety**: Direct API integration for MVR reports and driver risk assessment
- **Challenge**: Two separate integrations, different data formats, manual correlation

### Future State with Terminal
- **Terminal**: Unified API for 30+ TSPs (including Verizon Connect)
- **SambaSafety**: Enhanced with Terminal driver data
- **Benefit**: Single telematics integration + enriched MVR data

---

## 📊 Endpoint Mapping: Verizon Connect → Terminal

### 1. Driver Management

| Verizon Connect Endpoint | Terminal Endpoint | Status | Notes |
|--------------------------|-------------------|--------|-------|
| `GET /cmd/v1/drivers` | `GET /drivers` | ✅ REPLACE | Terminal provides normalized driver data across all TSPs |
| `GET /cmd/v1/drivers/{drivernumber}` | `GET /drivers/{id}` | ✅ REPLACE | Single driver detail |
| `GET /cmd/v1/driverassignments` | `GET /drivers` (includes vehicle assignment) | ✅ REPLACE | Terminal includes current vehicle in driver object |
| `GET /groups/drivers/number` | `GET /groups` + filter | ✅ REPLACE | Terminal groups include member lists |

**Terminal Advantages**:
- Normalized data format across TSPs
- Consistent field names
- Built-in pagination
- Webhook support for driver changes

**Migration Path**:
1. Replace `verizonConnectAPI.getDrivers()` with `terminalAPI.getDrivers()`
2. Update data mapping (DriverNumber → id, FirstName → firstName, etc.)
3. Test with Verizon Connect connection first
4. Add support for other TSPs (Samsara, Geotab, etc.)

---

### 2. Vehicle Management

| Verizon Connect Endpoint | Terminal Endpoint | Status | Notes |
|--------------------------|-------------------|--------|-------|
| `GET /cmd/v1/vehicles` | `GET /vehicles` | ✅ REPLACE | Terminal provides normalized vehicle data |
| `GET /cmd/v1/vehicles/{vehiclenumber}` | `GET /vehicles/{id}` | ✅ REPLACE | Single vehicle detail |
| `POST /rad/v1/vehicles/locations` | `GET /vehicles/locations/latest` | ✅ REPLACE | Terminal uses GET instead of POST |
| `POST /rad/v1/vehicles/statuses` | `GET /vehicles/locations/latest` | ✅ REPLACE | Location includes status (moving/idle/stopped) |
| N/A | `GET /vehicles/locations/historical` | ✅ NEW | Historical location tracking (not in VC) |
| N/A | `GET /vehicles/stats/historical` | ✅ NEW | Historical stats (odometer, fuel, etc.) |

**Terminal Advantages**:
- RESTful GET endpoints (no POST for reads)
- Historical data built-in
- Consistent location format (lat/lng/address)
- Real-time status included

**Migration Path**:
1. Replace `verizonConnectAPI.getVehicles()` with `terminalAPI.getVehicles()`
2. Replace `verizonConnectAPI.getVehicleLocations()` with `terminalAPI.getLatestVehicleLocations()`
3. Update map component to use Terminal location format
4. Add historical tracking feature (new capability)

---

### 3. Hours of Service (HOS)

| Verizon Connect Endpoint | Terminal Endpoint | Status | Notes |
|--------------------------|-------------------|--------|-------|
| `GET /logbook/v1/driver/{drivernumber}/statuscurrent` | `GET /hos/available-time` | ✅ REPLACE | Terminal provides available time for all drivers |
| N/A | `GET /hos/logs` | ✅ NEW | Complete HOS logs (not in VC) |
| N/A | `GET /hos/daily-logs` | ✅ NEW | Daily log summaries (not in VC) |

**Terminal Advantages**:
- Batch endpoint (all drivers at once)
- Complete log history
- Daily summaries
- Violation tracking

**Migration Path**:
1. Replace individual driver HOS calls with batch `terminalAPI.getHOSAvailableTime()`
2. Add HOS logs view (new feature)
3. Add daily log summaries (new feature)
4. Implement violation alerts

---

### 4. Safety Events

| Verizon Connect Endpoint | Terminal Endpoint | Status | Notes |
|--------------------------|-------------------|--------|-------|
| `GET /da/v1/driversafety/{drivernumber}` | `GET /safety/events` | ✅ REPLACE | Terminal provides all safety events |
| `GET /video-events/{id}` | `GET /safety/events/{id}` | ✅ REPLACE | Single event detail |
| N/A | `GET /safety/events/{id}/media` | ✅ NEW | Camera footage/images (if available) |

**Terminal Advantages**:
- Unified safety event format
- Includes video/image media
- Severity classification
- Coaching status tracking

**Migration Path**:
1. Replace `verizonConnectAPI.getSafetyEvents()` with `terminalAPI.getSafetyEvents()`
2. Update event type mapping (hard braking, speeding, etc.)
3. Add media viewer for camera footage
4. Integrate with SambaSafety MVR data

---

### 5. Groups

| Verizon Connect Endpoint | Terminal Endpoint | Status | Notes |
|--------------------------|-------------------|--------|-------|
| `GET /cmd/v1/groups` | `GET /groups` | ✅ REPLACE | Terminal provides normalized groups |
| `GET /groups/drivers/number` | `GET /groups` (includes members) | ✅ REPLACE | Terminal includes member lists |
| `GET /groups/vehicles/number` | `GET /groups` (includes members) | ✅ REPLACE | Terminal includes member lists |

**Terminal Advantages**:
- Single endpoint for groups + members
- Consistent format
- Supports nested groups

**Migration Path**:
1. Replace `verizonConnectAPI.getGroups()` with `terminalAPI.getGroups()`
2. Update group member display logic
3. Remove separate member API calls

---

### 6. Trailers (NEW)

| Verizon Connect Endpoint | Terminal Endpoint | Status | Notes |
|--------------------------|-------------------|--------|-------|
| N/A | `GET /trailers` | ✅ NEW | Trailer inventory (not in VC) |
| N/A | `GET /trailers/locations/latest` | ✅ NEW | Trailer tracking (not in VC) |

**Terminal Advantages**:
- Trailer management (not available in VC)
- Location tracking for trailers
- Assignment tracking

**Migration Path**:
1. Add Trailers tab to dashboard
2. Implement trailer directory
3. Add trailer location map
4. Track trailer assignments

---

## 🔗 SambaSafety Integration Points

### Current SambaSafety Implementation

**Endpoints Used**:
- `POST /oauth2/v1/token` - Authentication
- `POST /people/v1/people/search` - Find drivers
- `GET /people/v1/people/{personId}` - Driver profile
- `GET /people/{personId}/mvr-reports` - MVR reports
- `POST /api/risk-assessment` - Risk scoring

**Data Flow**:
```
User searches driver → SambaSafety API → MVR reports → Risk score
```

### Enhanced with Terminal

**New Data Flow**:
```
User views driver → Terminal API (driver + telematics) 
                 ↓
                 SambaSafety API (MVR + risk)
                 ↓
                 Merged response (complete driver profile)
```

### Integration Points

#### 1. Driver Profile Enhancement

**Terminal Data** (from `GET /drivers/{id}`):
```json
{
  "id": "driver_123",
  "firstName": "John",
  "lastName": "Smith",
  "licenseNumber": "D1234567",
  "licenseState": "CA",
  "status": "active",
  "currentVehicle": "vehicle_456",
  "phone": "555-1234",
  "email": "john.smith@example.com"
}
```

**SambaSafety Match** (by license number):
```javascript
// 1. Get driver from Terminal
const terminalDriver = await terminalAPI.getDriver(driverId);

// 2. Search SambaSafety by license
const sambaSearch = await sambasafetyAPI.searchPeople({
  criteria: [{
    field: 'licenseNumber',
    value: terminalDriver.licenseNumber
  }]
});

// 3. Get MVR reports
const mvrReports = await sambasafetyAPI.getMVRReports(sambaSearch.personId);

// 4. Merge data
return {
  ...terminalDriver,
  mvrData: mvrReports,
  riskScore: calculateRiskScore(terminalDriver, mvrReports)
};
```

#### 2. Safety Event Correlation

**Terminal Safety Event**:
```json
{
  "id": "event_789",
  "type": "harsh_braking",
  "severity": "moderate",
  "driverId": "driver_123",
  "vehicleId": "vehicle_456",
  "timestamp": "2026-02-09T10:30:00Z",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA"
  }
}
```

**Enhanced with SambaSafety MVR**:
```javascript
// Get safety event from Terminal
const event = await terminalAPI.getSafetyEvent(eventId);

// Get driver MVR data
const driver = await terminalAPI.getDriver(event.driverId);
const mvrData = await sambasafetyAPI.getMVRReports(driver.sambaPersonId);

// Calculate enhanced risk
return {
  ...event,
  driver: {
    ...driver,
    mvrData: mvrData,
    recentViolations: mvrData.violations.filter(v => 
      new Date(v.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ),
    riskLevel: calculateRiskLevel(event, mvrData)
  }
};
```

#### 3. Risk Assessment Enhancement

**Current Risk Factors** (SambaSafety only):
- MVR violations
- Accidents
- License status
- Points

**Enhanced Risk Factors** (Terminal + SambaSafety):
- MVR violations (SambaSafety)
- Accidents (SambaSafety)
- License status (SambaSafety)
- Points (SambaSafety)
- **Telematics safety events** (Terminal)
- **HOS violations** (Terminal)
- **Speeding incidents** (Terminal)
- **Harsh driving events** (Terminal)

**Enhanced Risk Calculation**:
```javascript
function calculateEnhancedRiskScore(terminalData, sambaData) {
  // Base risk from SambaSafety MVR
  let riskScore = sambaData.riskScore || 0;
  
  // Add Terminal telematics factors
  const recentSafetyEvents = terminalData.safetyEvents.filter(e => 
    new Date(e.timestamp) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  );
  
  // +1 point per safety event (last 90 days)
  riskScore += recentSafetyEvents.length;
  
  // +2 points for HOS violations
  if (terminalData.hosViolations > 0) {
    riskScore += terminalData.hosViolations * 2;
  }
  
  // +1 point for excessive speeding events
  const speedingEvents = recentSafetyEvents.filter(e => e.type === 'speeding');
  riskScore += speedingEvents.length;
  
  // Classify risk level
  if (riskScore <= 2) return { score: riskScore, level: 'green' };
  if (riskScore <= 5) return { score: riskScore, level: 'yellow' };
  return { score: riskScore, level: 'red' };
}
```

---

## 🔄 Data Synchronization Strategy

### Challenge
- Terminal data updates in real-time (telematics)
- SambaSafety data updates periodically (MVR reports)
- Need to keep data in sync

### Solution: Webhook + Polling Hybrid

#### 1. Terminal Webhooks (Real-time)
```javascript
// Subscribe to Terminal webhooks
await terminalAPI.subscribeWebhook({
  url: 'https://api.fleethub.com/webhooks/terminal',
  events: [
    'driver.created',
    'driver.updated',
    'safety_event.created',
    'hos_violation.created'
  ]
});

// Webhook handler
app.post('/webhooks/terminal', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'driver.updated') {
    // Check if license number changed
    if (event.data.licenseNumber !== event.previousData.licenseNumber) {
      // Re-match with SambaSafety
      await rematchDriverWithSambaSafety(event.data.id);
    }
  }
  
  if (event.type === 'safety_event.created') {
    // Update driver risk score
    await updateDriverRiskScore(event.data.driverId);
  }
  
  res.sendStatus(200);
});
```

#### 2. SambaSafety Polling (Periodic)
```javascript
// Poll SambaSafety for MVR updates (daily)
cron.schedule('0 2 * * *', async () => {
  const drivers = await terminalAPI.getDrivers();
  
  for (const driver of drivers) {
    if (driver.sambaPersonId) {
      // Check for new MVR reports
      const mvrReports = await sambasafetyAPI.getMVRReports(driver.sambaPersonId);
      
      // Update if new reports found
      if (hasNewReports(mvrReports, driver.lastMVRCheck)) {
        await updateDriverMVRData(driver.id, mvrReports);
      }
    }
  }
});
```

---

## 📋 Migration Checklist

### Phase 1: Backend Migration
- [ ] Set up Terminal API credentials
- [ ] Create Terminal connection (Verizon Connect TSP)
- [ ] Implement Terminal API proxy endpoints
- [ ] Test Terminal endpoints with Verizon Connect data
- [ ] Implement SambaSafety integration layer
- [ ] Test merged driver profiles (Terminal + SambaSafety)
- [ ] Deploy Lambda proxy with both integrations

### Phase 2: Frontend Migration
- [ ] Update API service layer (replace Verizon Connect calls)
- [ ] Update data models (Terminal format)
- [ ] Test driver directory with Terminal data
- [ ] Test vehicle tracking with Terminal data
- [ ] Test HOS compliance with Terminal data
- [ ] Test safety events with Terminal data
- [ ] Add MVR data display (SambaSafety integration)
- [ ] Test enhanced risk scoring

### Phase 3: Feature Enhancements
- [ ] Add connection selector (multi-TSP support)
- [ ] Add trailer management (new feature)
- [ ] Add historical vehicle stats (new feature)
- [ ] Add HOS logs view (new feature)
- [ ] Add safety event media viewer (new feature)
- [ ] Add webhook event feed (new feature)

### Phase 4: Testing & Validation
- [ ] Test with Verizon Connect connection
- [ ] Test with Samsara connection (if available)
- [ ] Test SambaSafety MVR integration
- [ ] Test enhanced risk scoring
- [ ] Performance testing (response times)
- [ ] Load testing (concurrent users)
- [ ] Security testing (authentication, authorization)

### Phase 5: Deployment
- [ ] Deploy backend (Lambda + API Gateway)
- [ ] Deploy frontend (S3 + CloudFront)
- [ ] Configure DNS (Route53)
- [ ] Set up monitoring (CloudWatch)
- [ ] Configure alarms (errors, latency)
- [ ] Document deployment process

### Phase 6: Decommission Verizon Connect
- [ ] Verify all features working with Terminal
- [ ] Monitor for 2 weeks (no issues)
- [ ] Remove Verizon Connect API calls
- [ ] Remove Verizon Connect credentials
- [ ] Update documentation
- [ ] Archive Verizon Connect integration code

---

## 🎯 Success Criteria

### Technical
- ✅ All Verizon Connect features replicated with Terminal
- ✅ SambaSafety MVR data integrated with Terminal drivers
- ✅ Response times < 500ms (95th percentile)
- ✅ Error rate < 1%
- ✅ Uptime > 99.9%

### Business
- ✅ Single API integration (Terminal) replaces Verizon Connect
- ✅ Support for 30+ TSPs (not just Verizon Connect)
- ✅ Enhanced driver risk profiles (telematics + MVR)
- ✅ Reduced maintenance (one integration vs. two)
- ✅ Cost savings (consolidated API usage)

### User Experience
- ✅ No disruption to existing workflows
- ✅ New features available (trailers, historical stats, HOS logs)
- ✅ Faster data loading (Terminal's optimized API)
- ✅ Better data quality (Terminal's normalization)

---

**Status**: 📋 **Ready for Implementation**  
**Next Action**: Parse Terminal Postman collection and generate detailed endpoint documentation  
**Priority**: HIGH - Replaces existing Verizon Connect integration
