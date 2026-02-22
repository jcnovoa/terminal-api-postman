# VZC Direct Integration → Terminal API Feature Mapping

**Purpose**: Map every feature in the VZC direct integration to Terminal API equivalents to identify gaps.

**Date**: February 21, 2026  
**Status**: Gap Analysis In Progress

---

## VZC Implementation Features (Baseline)

### ✅ Implemented in VZC Direct Integration

| # | Feature | VZC Endpoint | Status | Notes |
|---|---------|--------------|--------|-------|
| **1. VEHICLE MANAGEMENT** |
| 1.1 | Vehicle Directory | `/cmd/v1/vehicles` | ✅ Live | Pagination (20/page) |
| 1.2 | Vehicle Location | `/rad/v1/vehicles/{id}/location` | ✅ Live | Real-time GPS |
| 1.3 | Vehicle Status | `/rad/v1/vehicles/{id}/status` | ✅ Live | Moving/Idle/Stopped/Charging |
| 1.4 | Vehicle Speed | `/rad/v1/vehicles/{id}/status` | ✅ Live | Current speed |
| 1.5 | Vehicle Address | `/rad/v1/vehicles/{id}/location` | ✅ Live | Reverse geocoding |
| 1.6 | Vehicle Groups | `/cmd/v1/groups/vehicles/{id}` | ✅ Live | Group membership |
| 1.7 | Vehicle Update | `/cmd/v1/vehicles/{id}` | ✅ Live | PUT method |
| **2. DRIVER MANAGEMENT** |
| 2.1 | Driver Directory | `/cmd/v1/drivers` | ✅ Live | Pagination (20/page) |
| 2.2 | Driver Profile | `/cmd/v1/drivers/{id}` | ✅ Live | Full details |
| 2.3 | Driver Assignment | `/da/v1/driverassignments/drivers/{id}/currentassignment` | ✅ Live | Current vehicle |
| 2.4 | Driver Groups | `/cmd/v1/groups/drivers/{id}` | ✅ Live | Group membership |
| 2.5 | Driver Status Options | `/da/v1/driverstatusoptions` | ✅ Live | Available statuses |
| **3. HOS COMPLIANCE** |
| 3.1 | Current HOS Status | `/logbook/v1/driver/{id}/statuscurrent` | ✅ Live | Real-time |
| 3.2 | Drive Time Remaining | `/logbook/v1/driver/{id}/statuscurrent` | ✅ Live | Hours left |
| 3.3 | Shift Time Remaining | `/logbook/v1/driver/{id}/statuscurrent` | ✅ Live | Hours left |
| 3.4 | Driver Status | `/logbook/v1/driver/{id}/statuscurrent` | ✅ Live | Driving/On-Duty/Off-Duty |
| 3.5 | Critical Alerts | Frontend logic | ✅ Live | <2 hours warning |
| **4. SAFETY EVENTS** |
| 4.1 | Driver Safety Events | `/da/v1/driversafety/{id}` | 🔄 Pending | Harsh braking, speeding |
| 4.2 | Safety Event Counts | `/da/v1/driversafety/{id}/counts` | 🔄 Pending | Event statistics |
| 4.3 | Severity Classification | Frontend logic | 🔄 Pending | Critical/Moderate/Minor |
| 4.4 | Coaching Status | Frontend logic | 🔄 Pending | Tracked per event |
| **5. FLEET INSPECTIONS (DVIR)** |
| 5.1 | Inspection Reports | `/inspections/reports` | 🔄 Mock | Pre/post-trip |
| 5.2 | Inspection Report Detail | `/inspections/reports/{id}` | 🔄 Mock | Full report |
| 5.3 | Inspection Defects | `/inspections/defects` | 🔄 Mock | Defect list |
| 5.4 | Inspection Templates | `/inspections/templates` | 🔄 Mock | Form templates |
| **6. REAL-TIME GPS WEBHOOKS** |
| 6.1 | GPS Webhook Endpoint | Custom webhook | ✅ Live | DynamoDB storage |
| 6.2 | GPS Data Query | `/webhooks/gps` | ✅ Live | Last 100 updates |
| 6.3 | GPS Feed Widget | Frontend component | ✅ Live | Auto-refresh 30s |
| 6.4 | Vehicle Filter | Query param | ✅ Live | Filter by vehicle |
| **7. ALERT WEBHOOKS** |
| 7.1 | Alert Webhook Endpoint | Custom webhook | 🔄 Pending | Waiting for VZC |
| 7.2 | Alert Data Query | `/webhooks/alerts` | 🔄 Pending | Last 50 alerts |
| 7.3 | Alert Types | Webhook payload | 🔄 Pending | Ignition, Speeding, Geofence |
| **8. GROUP MANAGEMENT** |
| 8.1 | Group Directory | `/cmd/v1/groups` | ✅ Live | All groups |
| 8.2 | Groups by Driver | `/cmd/v1/groups/drivers/{id}` | ✅ Live | Driver membership |
| 8.3 | Groups by Vehicle | `/cmd/v1/groups/vehicles/{id}` | ✅ Live | Vehicle membership |
| 8.4 | Groups by User | `/cmd/v1/groups/users/{id}` | ✅ Live | User membership |
| **9. USER MANAGEMENT** |
| 9.1 | User Directory | `/cmd/v1/users` | ✅ Live | All users |
| 9.2 | User Groups | `/cmd/v1/groups/users/{id}` | ✅ Live | Group membership |
| **10. ASSET MANAGEMENT** |
| 10.1 | Non-Powered Assets | `/ast/v1/assets` | ✅ Live | Trailers, equipment |
| **11. MULTI-ENVIRONMENT** |
| 11.1 | Production Environment | Query param | ✅ Live | 5 vehicles |
| 11.2 | Demo Environment | Query param | ✅ Live | 475 vehicles |
| 11.3 | Sandbox Environment | Query param | ✅ Live | 36 vehicles |
| 11.4 | Test Environment | Query param | ✅ Live | 79 vehicles |
| 11.5 | Environment Selector | Frontend UI | ✅ Live | Admin console |
| **12. ADMIN CONSOLE** |
| 12.1 | Credential Management | Session storage | ✅ Live | App ID + Secret |
| 12.2 | Token Generation | Backend | ✅ Live | Basic Auth |
| 12.3 | API Playground | Frontend UI | ✅ Live | Test endpoints |
| 12.4 | Dynamic Parameters | Frontend logic | ✅ Live | Path params |
| 12.5 | Request/Response View | Frontend UI | ✅ Live | JSON display |

---

## Terminal API Mapping

### Terminal API Endpoints Available

| Terminal Endpoint | VZC Equivalent | Coverage |
|-------------------|----------------|----------|
| `/tsp/v1/drivers` | `/cmd/v1/drivers` | ✅ Full |
| `/tsp/v1/drivers/{id}` | `/cmd/v1/drivers/{id}` | ✅ Full |
| `/tsp/v1/vehicles` | `/cmd/v1/vehicles` | ✅ Full |
| `/tsp/v1/vehicles/{id}` | `/cmd/v1/vehicles/{id}` | ✅ Full |
| `/tsp/v1/vehicles/locations/latest` | `/rad/v1/vehicles/{id}/location` | ✅ Full |
| `/tsp/v1/hos/available-time` | `/logbook/v1/driver/{id}/statuscurrent` | ✅ Full |
| `/tsp/v1/hos/logs` | `/logbook/v1/driver/{id}/logs` | ⚠️ Partial |
| `/tsp/v1/safety/events` | `/da/v1/driversafety/{id}` | ✅ Full |
| `/tsp/v1/groups` | `/cmd/v1/groups` | ✅ Full |
| `/tsp/v1/connections` | N/A | ➕ New |
| `/tsp/v1/webhooks` | Custom webhooks | ⚠️ Different |

---

## Feature Gap Analysis

### ✅ FULL PARITY (Terminal = VZC)

| Feature | VZC | Terminal | Notes |
|---------|-----|----------|-------|
| Vehicle Directory | ✅ | ✅ | Same data |
| Vehicle Locations | ✅ | ✅ | Real-time GPS |
| Driver Directory | ✅ | ✅ | Same data |
| Driver Details | ✅ | ✅ | Full profile |
| HOS Status | ✅ | ✅ | Current status |
| HOS Available Time | ✅ | ✅ | Drive/shift time |
| Safety Events | ✅ | ✅ | Harsh driving |
| Groups | ✅ | ✅ | Fleet organization |

### ⚠️ PARTIAL PARITY (Terminal ≈ VZC)

| Feature | VZC | Terminal | Gap |
|---------|-----|----------|-----|
| Vehicle Status | ✅ Moving/Idle/Stopped | ⚠️ Limited | Terminal doesn't have "Charging" state |
| Driver Assignment | ✅ Dedicated endpoint | ⚠️ Embedded | Terminal includes in driver object, not separate |
| HOS Logs | ✅ Full history | ⚠️ Limited | Terminal has logs but different format |
| Webhooks | ✅ GPS + Alerts | ⚠️ Generic | Terminal has webhooks but different structure |

### ❌ MISSING IN TERMINAL (VZC Only)

| Feature | VZC | Terminal | Impact |
|---------|-----|----------|--------|
| Fleet Inspections (DVIR) | ✅ | ❌ | **HIGH** - Compliance requirement |
| Inspection Defects | ✅ | ❌ | **HIGH** - Maintenance tracking |
| Inspection Templates | ✅ | ❌ | **MEDIUM** - Custom forms |
| Non-Powered Assets | ✅ | ❌ | **MEDIUM** - Trailer tracking |
| Driver Status Options | ✅ | ❌ | **LOW** - Predefined statuses |
| Group Membership by Entity | ✅ | ❌ | **LOW** - Can derive from groups |
| Vehicle Update API | ✅ | ❌ | **MEDIUM** - Can't modify vehicles |
| Multi-Environment | ✅ | ❌ | **LOW** - Terminal uses connections |
| Safety Event Counts | ✅ | ❌ | **LOW** - Can calculate from events |
| Video Events | ✅ | ❌ | **HIGH** - Dashcam integration |

### ➕ TERMINAL EXCLUSIVE (Not in VZC)

| Feature | Terminal | VZC | Benefit |
|---------|----------|-----|---------|
| Connection Management | ✅ | ❌ | Multi-TSP support |
| Normalized Schema | ✅ | ❌ | Consistent data model |
| Provider Field | ✅ | ❌ | TSP identification |
| Unified API | ✅ | ❌ | Single integration |
| Automatic Sync | ✅ | ❌ | Background updates |

---

## Implementation Status

### Current FleetHub Terminal Implementation

| Feature | Status | Notes |
|---------|--------|-------|
| Vehicle Tracking | ✅ Complete | 4 vehicles displayed |
| Driver Management | ✅ Complete | 5 drivers displayed |
| HOS Compliance | ✅ Complete | Available time shown |
| Safety Events | ✅ Complete | Events displayed |
| Groups | ✅ Complete | Organization shown |
| Real-Time Updates | ✅ Complete | 30-second polling |
| Connection Manager | ✅ Complete | Connections tab |
| Last Update Display | ✅ Complete | Timestamp shown |

### Missing from FleetHub Terminal (vs VZC)

| Feature | Priority | Effort | Blocker? |
|---------|----------|--------|----------|
| **Fleet Inspections** | 🔴 HIGH | 8 hours | ❌ **YES** - Not in Terminal API |
| **Video Events** | 🔴 HIGH | 4 hours | ❌ **YES** - Not in Terminal API |
| **Non-Powered Assets** | 🟡 MEDIUM | 4 hours | ❌ **YES** - Not in Terminal API |
| **Vehicle Update** | 🟡 MEDIUM | 2 hours | ❌ **YES** - Not in Terminal API |
| **GPS Webhooks** | 🟡 MEDIUM | 4 hours | ⚠️ **MAYBE** - Different structure |
| **Alert Webhooks** | 🟡 MEDIUM | 4 hours | ⚠️ **MAYBE** - Different structure |
| **Driver Assignment** | 🟢 LOW | 2 hours | ✅ NO - Can derive |
| **Group Membership** | 🟢 LOW | 2 hours | ✅ NO - Can derive |
| **Multi-Environment** | 🟢 LOW | 2 hours | ✅ NO - Use connections |
| **Admin Console** | 🟢 LOW | 4 hours | ✅ NO - Different auth |
| **API Playground** | 🟢 LOW | 4 hours | ✅ NO - Not needed |

---

## Gap Analysis Summary

### Coverage Percentage

**Core Features (Phase 1)**:
- Vehicle Tracking: **100%** ✅
- Driver Management: **100%** ✅
- HOS Compliance: **100%** ✅
- Safety Events: **100%** ✅
- Groups: **100%** ✅

**Advanced Features (Phase 2)**:
- Real-Time Updates: **100%** ✅ (polling instead of webhooks)
- Connection Manager: **100%** ✅
- Fleet Inspections: **0%** ❌ (not in Terminal API)
- Video Events: **0%** ❌ (not in Terminal API)
- Non-Powered Assets: **0%** ❌ (not in Terminal API)

**Overall Coverage**: **62%** (8 of 13 feature categories)

### Critical Gaps (Blockers)

1. **Fleet Inspections (DVIR)** ❌
   - **Impact**: HIGH - DOT compliance requirement
   - **Workaround**: None - must use VZC direct for DVIR
   - **Recommendation**: Keep VZC direct integration for inspections

2. **Video Events** ❌
   - **Impact**: HIGH - Safety/liability evidence
   - **Workaround**: None - dashcam integration not available
   - **Recommendation**: Keep VZC direct integration for video

3. **Non-Powered Assets** ❌
   - **Impact**: MEDIUM - Trailer tracking
   - **Workaround**: Manual tracking or separate system
   - **Recommendation**: Acceptable gap for MVP

### Non-Critical Gaps (Workarounds Available)

4. **Vehicle Update API** ⚠️
   - **Impact**: MEDIUM - Can't modify vehicle data
   - **Workaround**: Read-only dashboard acceptable
   - **Recommendation**: Acceptable for monitoring use case

5. **GPS Webhooks** ⚠️
   - **Impact**: MEDIUM - Real-time updates
   - **Workaround**: 30-second polling implemented
   - **Recommendation**: Polling sufficient for fleet management

6. **Alert Webhooks** ⚠️
   - **Impact**: MEDIUM - Real-time alerts
   - **Workaround**: Poll safety events endpoint
   - **Recommendation**: Polling sufficient for MVP

---

## Recommendation

### ❌ **Terminal API Alone: NOT SUFFICIENT**

**Reason**: Critical features missing (DVIR, Video Events)

### ✅ **Hybrid Approach: RECOMMENDED**

**Use Terminal API for**:
- ✅ Vehicle tracking
- ✅ Driver management
- ✅ HOS compliance
- ✅ Safety events
- ✅ Groups
- ✅ Multi-TSP support

**Use VZC Direct for**:
- ✅ Fleet inspections (DVIR)
- ✅ Video events
- ✅ Non-powered assets (if needed)
- ✅ Vehicle updates (if needed)

### Architecture

```
┌─────────────────────────────────────────┐
│         FleetHub Application            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Terminal   │    │  VZC Direct  │  │
│  │     API      │    │     API      │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
│         ├─ Vehicles          ├─ DVIR   │
│         ├─ Drivers           ├─ Video  │
│         ├─ HOS               └─ Assets │
│         ├─ Safety                       │
│         └─ Groups                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Next Steps

### 1. Complete Terminal Implementation ✅
- [x] Vehicle tracking
- [x] Driver management
- [x] HOS compliance
- [x] Safety events
- [x] Groups
- [x] Real-time updates (polling)
- [x] Connection manager

### 2. Add VZC Direct Features ⏳
- [ ] Fleet inspections (DVIR)
- [ ] Video events
- [ ] Non-powered assets (optional)

### 3. Build Hybrid Dashboard ⏳
- [ ] Combine Terminal + VZC data
- [ ] Unified UI
- [ ] Single authentication
- [ ] Consistent data model

### 4. Production Deployment ⏳
- [ ] Deploy hybrid backend
- [ ] Configure both APIs
- [ ] Test end-to-end
- [ ] Monitor performance

---

## Conclusion

**Terminal API provides 62% coverage** of VZC direct integration features.

**Critical gaps exist** in fleet inspections (DVIR) and video events that cannot be worked around.

**Recommendation**: Use **hybrid approach** with Terminal for core features and VZC direct for compliance/safety features.

**Next Action**: Implement missing VZC features in FleetHub Terminal to achieve 100% parity.

