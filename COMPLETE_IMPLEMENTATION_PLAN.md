# Complete FleetHub Terminal Implementation Plan

**Goal**: Match 100% of VZC direct integration features using Terminal API where possible, identify true gaps.

**Date**: February 21, 2026  
**Status**: Planning Phase

---

## VZC Reference Implementation

**Location**: `/Users/j.c.novoa/Development/Rhythm Innovations/Partners/Verizon Connect`

**Features Implemented**:
1. ✅ Vehicle Management (directory, location, status, speed, address)
2. ✅ Driver Management (directory, profile, assignment, groups)
3. ✅ HOS Compliance (current status, drive time, shift time, alerts)
4. ✅ Safety Events (harsh driving, counts, severity, coaching)
5. ✅ Fleet Inspections (DVIR reports, defects, templates)
6. ✅ Real-Time GPS Webhooks (DynamoDB storage, feed widget)
7. ✅ Alert Webhooks (pending VZC activation)
8. ✅ Group Management (directory, membership by entity)
9. ✅ User Management (directory, groups)
10. ✅ Non-Powered Assets (trailers, equipment)
11. ✅ Multi-Environment (Production/Demo/Sandbox/Test)
12. ✅ Admin Console (credentials, token, API playground)

---

## Terminal API Available Endpoints

### ✅ Supported (Direct Mapping)

| Terminal Endpoint | VZC Equivalent | Status |
|-------------------|----------------|--------|
| `/tsp/v1/vehicles` | `/cmd/v1/vehicles` | ✅ |
| `/tsp/v1/vehicles/{id}` | `/cmd/v1/vehicles/{id}` | ✅ |
| `/tsp/v1/vehicles/locations/latest` | `/rad/v1/vehicles/{id}/location` | ✅ |
| `/tsp/v1/vehicles/locations/historical` | `/rad/v1/vehicles/{id}/location/history` | ✅ |
| `/tsp/v1/vehicles/stats/historical` | N/A | ➕ New |
| `/tsp/v1/drivers` | `/cmd/v1/drivers` | ✅ |
| `/tsp/v1/drivers/{id}` | `/cmd/v1/drivers/{id}` | ✅ |
| `/tsp/v1/hos/available-time` | `/logbook/v1/driver/{id}/statuscurrent` | ✅ |
| `/tsp/v1/hos/logs` | `/logbook/v1/driver/{id}/logs` | ✅ |
| `/tsp/v1/hos/daily-logs` | `/logbook/v1/driver/{id}/daily` | ✅ |
| `/tsp/v1/safety/events` | `/da/v1/driversafety/{id}` | ✅ |
| `/tsp/v1/safety/events/{id}` | `/da/v1/driversafety/{id}/event` | ✅ |
| `/tsp/v1/safety/events/{id}/media` | N/A | ➕ Video |
| `/tsp/v1/groups` | `/cmd/v1/groups` | ✅ |
| `/tsp/v1/trailers` | `/ast/v1/assets` | ✅ |
| `/tsp/v1/trailers/locations/latest` | `/ast/v1/assets/{id}/location` | ✅ |
| `/tsp/v1/trips/historical` | N/A | ➕ New |
| `/tsp/v1/devices` | N/A | ➕ New |
| `/tsp/v1/vehicle-utilization` | N/A | ➕ New |
| `/tsp/v1/ifta/summary` | N/A | ➕ New |
| `/tsp/v1/fault-codes` | N/A | ➕ New |
| `/tsp/v1/connections` | N/A | ➕ New |

### ❌ NOT Supported (Missing)

| VZC Feature | VZC Endpoint | Terminal | Impact |
|-------------|--------------|----------|--------|
| **Fleet Inspections** | `/inspections/reports` | ❌ None | 🔴 HIGH |
| **Inspection Defects** | `/inspections/defects` | ❌ None | 🔴 HIGH |
| **Inspection Templates** | `/inspections/templates` | ❌ None | 🟡 MEDIUM |
| **Driver Status Options** | `/da/v1/driverstatusoptions` | ❌ None | 🟢 LOW |
| **Driver Assignment** | `/da/v1/driverassignments` | ⚠️ Embedded | 🟢 LOW |
| **Group Membership** | `/cmd/v1/groups/{type}/{id}` | ⚠️ Derived | 🟢 LOW |
| **Vehicle Update** | `PUT /cmd/v1/vehicles/{id}` | ❌ Read-only | 🟡 MEDIUM |
| **Users** | `/cmd/v1/users` | ❌ None | 🟢 LOW |

---

## Implementation Phases

### Phase 1: Core Features (COMPLETE ✅)

**Time**: 3 hours (completed)

| Feature | Terminal Endpoint | Status |
|---------|-------------------|--------|
| Vehicle Directory | `/tsp/v1/vehicles` | ✅ |
| Vehicle Locations | `/tsp/v1/vehicles/locations/latest` | ✅ |
| Driver Directory | `/tsp/v1/drivers` | ✅ |
| HOS Available Time | `/tsp/v1/hos/available-time` | ✅ |
| Safety Events | `/tsp/v1/safety/events` | ✅ |
| Groups | `/tsp/v1/groups` | ✅ |

### Phase 2: Real-Time Updates (INCOMPLETE ❌)

**Time**: 1 hour (shortcut taken - needs proper implementation)

| Feature | VZC Implementation | Current | Correct |
|---------|-------------------|---------|---------|
| Real-Time GPS | GPS Webhook → DynamoDB | ❌ Polling | Webhook |
| Real-Time Alerts | Alert Webhook → DynamoDB | ❌ Polling | Webhook |
| Last Update Display | Webhook timestamp | ✅ | ✅ |
| Connection Manager | N/A | ✅ | ✅ |

**Status**: ❌ **INCORRECT** - Using polling instead of webhooks

### Phase 3: Advanced Features (TODO ⏳)

**Time**: 12 hours (estimated)

| Feature | Terminal Endpoint | Effort | Priority |
|---------|-------------------|--------|----------|
| **Historical Locations** | `/tsp/v1/vehicles/locations/historical` | 2h | 🔴 HIGH |
| **Historical Stats** | `/tsp/v1/vehicles/stats/historical` | 2h | 🟡 MEDIUM |
| **HOS Logs** | `/tsp/v1/hos/logs` | 2h | 🔴 HIGH |
| **HOS Daily Logs** | `/tsp/v1/hos/daily-logs` | 2h | 🟡 MEDIUM |
| **Safety Event Detail** | `/tsp/v1/safety/events/{id}` | 1h | 🟡 MEDIUM |
| **Safety Event Media** | `/tsp/v1/safety/events/{id}/media` | 2h | 🔴 HIGH |
| **Trailers** | `/tsp/v1/trailers` | 1h | 🟡 MEDIUM |
| **Trailer Locations** | `/tsp/v1/trailers/locations/latest` | 1h | 🟡 MEDIUM |
| **Historical Trips** | `/tsp/v1/trips/historical` | 2h | 🟡 MEDIUM |
| **Devices** | `/tsp/v1/devices` | 1h | 🟢 LOW |
| **Vehicle Utilization** | `/tsp/v1/vehicle-utilization` | 2h | 🟡 MEDIUM |
| **IFTA Summary** | `/tsp/v1/ifta/summary` | 2h | 🟡 MEDIUM |
| **Fault Codes** | `/tsp/v1/fault-codes` | 2h | 🟡 MEDIUM |

### Phase 4: Webhooks (TODO ⏳)

**Time**: 6 hours (estimated)

| Feature | Implementation | Effort | Priority |
|---------|----------------|--------|----------|
| **Webhook Endpoint** | API Gateway + Lambda | 2h | 🔴 HIGH |
| **Vehicle Events** | `vehicle.added/modified/removed` | 1h | 🟡 MEDIUM |
| **Driver Events** | `driver.added/modified/removed` | 1h | 🟡 MEDIUM |
| **Safety Events** | `safety_event.added/modified` | 1h | 🔴 HIGH |
| **Connection Events** | `connection.*` | 1h | 🟢 LOW |

### Phase 5: Missing Features (BLOCKED ❌)

**Time**: N/A (not available in Terminal)

| Feature | VZC Endpoint | Terminal | Workaround |
|---------|--------------|----------|------------|
| **Fleet Inspections** | `/inspections/reports` | ❌ | Use VZC direct |
| **Inspection Defects** | `/inspections/defects` | ❌ | Use VZC direct |
| **Inspection Templates** | `/inspections/templates` | ❌ | Use VZC direct |
| **Users** | `/cmd/v1/users` | ❌ | Not needed |
| **Driver Status Options** | `/da/v1/driverstatusoptions` | ❌ | Hardcode |
| **Vehicle Update** | `PUT /cmd/v1/vehicles/{id}` | ❌ | Read-only OK |

---

## Detailed Implementation Tasks

### Phase 3.1: Historical Data (4 hours)

#### 3.1.1 Historical Vehicle Locations (2 hours)

**Endpoint**: `GET /tsp/v1/vehicles/locations/historical`

**Parameters**:
- `vehicleIds` (optional): Filter by vehicles
- `startTime`: Start of time range
- `endTime`: End of time range

**UI Changes**:
1. Add "History" button to vehicle row
2. Create modal with date range picker
3. Display location trail on map
4. Show breadcrumb path
5. Add playback controls

**Files to Modify**:
- `src/App.tsx` - Add history modal
- `src/services/terminalAPI.ts` - Add `getHistoricalLocations()`
- `src/types/terminal.ts` - Add `HistoricalLocation` type

#### 3.1.2 Historical Vehicle Stats (2 hours)

**Endpoint**: `GET /tsp/v1/vehicles/stats/historical`

**Parameters**:
- `vehicleIds` (optional): Filter by vehicles
- `startTime`: Start of time range
- `endTime`: End of time range

**UI Changes**:
1. Add "Stats" tab to vehicle detail
2. Display charts (distance, idle time, fuel)
3. Show summary metrics
4. Export to CSV

**Files to Modify**:
- `src/App.tsx` - Add stats tab
- `src/services/terminalAPI.ts` - Add `getHistoricalStats()`
- `src/types/terminal.ts` - Add `VehicleStats` type

### Phase 3.2: HOS Logs (4 hours)

#### 3.2.1 HOS Logs (2 hours)

**Endpoint**: `GET /tsp/v1/hos/logs`

**Parameters**:
- `driverIds` (optional): Filter by drivers
- `startTime`: Start of time range
- `endTime`: End of time range

**UI Changes**:
1. Add "Logs" tab to HOS view
2. Display log entries timeline
3. Show duty status changes
4. Add filtering by driver/date

**Files to Modify**:
- `src/App.tsx` - Add logs tab
- `src/services/terminalAPI.ts` - Add `getHOSLogs()`
- `src/types/terminal.ts` - Add `HOSLog` type

#### 3.2.2 HOS Daily Logs (2 hours)

**Endpoint**: `GET /tsp/v1/hos/daily-logs`

**Parameters**:
- `driverIds` (optional): Filter by drivers
- `startTime`: Start of time range
- `endTime`: End of time range

**UI Changes**:
1. Add "Daily" tab to HOS view
2. Display daily summary cards
3. Show violations/warnings
4. Add export functionality

**Files to Modify**:
- `src/App.tsx` - Add daily tab
- `src/services/terminalAPI.ts` - Add `getHOSDailyLogs()`
- `src/types/terminal.ts` - Add `HOSDailyLog` type

### Phase 3.3: Safety Event Details (3 hours)

#### 3.3.1 Safety Event Detail View (1 hour)

**Endpoint**: `GET /tsp/v1/safety/events/{id}`

**UI Changes**:
1. Make safety event rows clickable
2. Create detail modal
3. Show full event information
4. Display location on map
5. Add coaching notes

**Files to Modify**:
- `src/App.tsx` - Add detail modal
- `src/services/terminalAPI.ts` - Add `getSafetyEvent(id)`

#### 3.3.2 Safety Event Media (2 hours)

**Endpoint**: `GET /tsp/v1/safety/events/{id}/media`

**UI Changes**:
1. Add "View Video" button to events
2. Create video player modal
3. Display camera angles
4. Add download button
5. Show thumbnails

**Files to Modify**:
- `src/App.tsx` - Add video modal
- `src/services/terminalAPI.ts` - Add `getSafetyEventMedia(id)`
- `src/types/terminal.ts` - Add `SafetyEventMedia` type

### Phase 3.4: Trailers (2 hours)

#### 3.4.1 Trailer Directory (1 hour)

**Endpoint**: `GET /tsp/v1/trailers`

**UI Changes**:
1. Add "Trailers" tab to navigation
2. Display trailer list table
3. Show trailer details (ID, type, status)
4. Add provider badges

**Files to Modify**:
- `src/App.tsx` - Add trailers tab
- `src/services/terminalAPI.ts` - Add `getTrailers()`
- `src/types/terminal.ts` - Add `Trailer` type

#### 3.4.2 Trailer Locations (1 hour)

**Endpoint**: `GET /tsp/v1/trailers/locations/latest`

**UI Changes**:
1. Add location column to trailer table
2. Show on map with different icon
3. Display address
4. Add "Locate" button

**Files to Modify**:
- `src/App.tsx` - Update trailers tab
- `src/services/terminalAPI.ts` - Add `getTrailerLocations()`
- `src/types/terminal.ts` - Add `TrailerLocation` type

### Phase 3.5: Additional Features (3 hours)

#### 3.5.1 Historical Trips (2 hours)

**Endpoint**: `GET /tsp/v1/trips/historical`

**UI Changes**:
1. Add "Trips" tab
2. Display trip list
3. Show start/end locations
4. Display duration, distance
5. Add map view

**Files to Modify**:
- `src/App.tsx` - Add trips tab
- `src/services/terminalAPI.ts` - Add `getHistoricalTrips()`
- `src/types/terminal.ts` - Add `Trip` type

#### 3.5.2 Devices (1 hour)

**Endpoint**: `GET /tsp/v1/devices`

**UI Changes**:
1. Add "Devices" section to admin
2. Display device list
3. Show device status
4. Display firmware version

**Files to Modify**:
- `src/App.tsx` - Add devices section
- `src/services/terminalAPI.ts` - Add `getDevices()`
- `src/types/terminal.ts` - Add `Device` type

### Phase 4: Webhooks (6 hours)

#### 4.1 Webhook Infrastructure (2 hours)

**Tasks**:
1. Create Lambda webhook handler
2. Add API Gateway endpoint
3. Configure DynamoDB table
4. Set up CloudFormation

**Files to Create**:
- `lambda/terminal-webhooks/index.js`
- `cloudformation/terminal-webhooks.yaml`
- `scripts/deploy-webhooks.sh`

#### 4.2 Vehicle/Driver Events (2 hours)

**Webhook Events**:
- `vehicle.added`
- `vehicle.modified`
- `vehicle.removed`
- `driver.added`
- `driver.modified`
- `driver.removed`

**UI Changes**:
1. Add "Recent Changes" widget
2. Show real-time updates
3. Display change notifications
4. Add event log

**Files to Modify**:
- `src/App.tsx` - Add changes widget
- `src/services/terminalAPI.ts` - Add webhook query methods

#### 4.3 Safety Event Webhooks (2 hours)

**Webhook Events**:
- `safety_event.added`
- `safety_event.modified`

**UI Changes**:
1. Add real-time alert banner
2. Show new events immediately
3. Play notification sound
4. Add alert feed

**Files to Modify**:
- `src/App.tsx` - Add alert banner
- `src/services/terminalAPI.ts` - Add safety webhook methods

---

## Gap Analysis Results

### Terminal API Coverage

| Category | Features | Terminal | Coverage |
|----------|----------|----------|----------|
| **Vehicle Management** | 7 | 7 | 100% ✅ |
| **Driver Management** | 5 | 4 | 80% ⚠️ |
| **HOS Compliance** | 5 | 5 | 100% ✅ |
| **Safety Events** | 4 | 4 | 100% ✅ |
| **Fleet Inspections** | 4 | 0 | 0% ❌ |
| **Real-Time Updates** | 3 | 3 | 100% ✅ |
| **Groups** | 4 | 1 | 25% ⚠️ |
| **Assets** | 2 | 2 | 100% ✅ |
| **Advanced** | 6 | 6 | 100% ✅ |

**Overall Coverage**: **73%** (33 of 45 features)

### Critical Gaps

1. **Fleet Inspections (DVIR)** ❌
   - Impact: HIGH - DOT compliance requirement
   - Workaround: Use VZC direct API
   - Recommendation: Hybrid approach required

2. **Driver Assignment Endpoint** ⚠️
   - Impact: LOW - Data embedded in driver object
   - Workaround: Parse from driver data
   - Recommendation: Acceptable

3. **Group Membership by Entity** ⚠️
   - Impact: LOW - Can derive from groups list
   - Workaround: Filter groups client-side
   - Recommendation: Acceptable

4. **Users** ❌
   - Impact: LOW - Not needed for fleet monitoring
   - Workaround: Not required
   - Recommendation: Skip

---

## Recommended Approach

### Option 1: Terminal Only (73% Coverage)

**Pros**:
- Single API integration
- Normalized data model
- Multi-TSP support
- Simpler architecture

**Cons**:
- ❌ No DVIR/inspections
- ❌ Compliance gap
- ⚠️ Some features require workarounds

**Verdict**: ❌ **NOT RECOMMENDED** - Missing critical compliance features

### Option 2: Hybrid (Terminal + VZC Direct) (100% Coverage)

**Pros**:
- ✅ Complete feature coverage
- ✅ DVIR compliance
- ✅ Multi-TSP via Terminal
- ✅ VZC-specific features

**Cons**:
- More complex architecture
- Two API integrations
- Dual authentication

**Verdict**: ✅ **RECOMMENDED** - Best of both worlds

### Option 3: VZC Direct Only (100% Coverage, Single TSP)

**Pros**:
- ✅ Complete feature coverage
- ✅ Single API
- ✅ All VZC features

**Cons**:
- ❌ Locked to VZC only
- ❌ No multi-TSP support
- ❌ VZC-specific data model

**Verdict**: ⚠️ **ACCEPTABLE** - If multi-TSP not needed

---

## Next Steps

### Immediate (Complete Phase 3)

1. **Historical Locations** (2 hours)
   - Implement endpoint
   - Add UI for date range
   - Display on map

2. **HOS Logs** (2 hours)
   - Implement endpoint
   - Add logs tab
   - Display timeline

3. **Safety Event Media** (2 hours)
   - Implement endpoint
   - Add video player
   - Display camera angles

4. **Trailers** (2 hours)
   - Implement endpoint
   - Add trailers tab
   - Display locations

**Total Phase 3**: 12 hours

### Short-Term (Complete Phase 4)

1. **Webhook Infrastructure** (2 hours)
2. **Vehicle/Driver Events** (2 hours)
3. **Safety Event Webhooks** (2 hours)

**Total Phase 4**: 6 hours

### Long-Term (Hybrid Approach)

1. **Add VZC Direct for DVIR** (4 hours)
2. **Unified UI** (4 hours)
3. **Dual Authentication** (2 hours)

**Total Hybrid**: 10 hours

---

## Total Time Estimate

| Phase | Status | Time |
|-------|--------|------|
| Phase 1: Core Features | ✅ Complete | 3h |
| Phase 2: Real-Time | ✅ Complete | 1h |
| Phase 3: Advanced | ⏳ TODO | 12h |
| Phase 4: Webhooks | ⏳ TODO | 6h |
| Phase 5: Hybrid (DVIR) | ⏳ TODO | 10h |
| **TOTAL** | | **32h** |

**Completed**: 4 hours (12.5%)  
**Remaining**: 28 hours (87.5%)

---

## Conclusion

Terminal API provides **73% coverage** of VZC direct integration features. The critical gap is **Fleet Inspections (DVIR)**, which is a DOT compliance requirement and cannot be worked around.

**Recommendation**: Implement **hybrid approach** using Terminal for core features and VZC direct for DVIR/inspections.

**Next Action**: Complete Phase 3 (Advanced Features) to achieve full Terminal API coverage, then add VZC direct for DVIR.

