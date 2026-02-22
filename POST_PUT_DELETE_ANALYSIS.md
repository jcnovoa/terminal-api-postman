# Terminal API - POST/PUT/DELETE Operations Analysis

**Date**: February 22, 2026  
**Source**: Postman Collection (`terminal.postman_collection.json`)  
**Status**: Analysis Complete

---

## Summary

**Total Endpoints**: 41  
**GET Operations**: 34 (83%)  
**POST Operations**: 6 (15%)  
**PATCH Operations**: 1 (2%)  
**PUT Operations**: 0 (0%)  
**DELETE Operations**: 0 (0%)

---

## ❌ Critical Finding: No CRUD Operations for Core Entities

Terminal API is **read-only** for core fleet entities:
- ❌ No POST/PUT/DELETE for Drivers
- ❌ No POST/PUT/DELETE for Vehicles
- ❌ No POST/PUT/DELETE for Groups
- ❌ No POST/PUT/DELETE for Trailers
- ❌ No POST/PUT/DELETE for Safety Events

**Implication**: Terminal API is designed for **data consumption**, not **data management**. All entity management must be done through the source TSP (e.g., Verizon Connect).

---

## Available Write Operations

### 1. Authentication
| Endpoint | Method | Purpose | Sandbox Support |
|----------|--------|---------|-----------------|
| `/public-token/exchange` | POST | Exchange public token for connection token | ✅ Yes |

**Use Case**: Initial connection setup (already implemented in infrastructure)

---

### 2. Connection Management
| Endpoint | Method | Purpose | Sandbox Support |
|----------|--------|---------|-----------------|
| `/connections/current` | PATCH | Update connection settings | ✅ Yes |

**Body Parameters**:
```json
{
  "status": "active|paused",
  "syncMode": "automatic|manual",
  "company": {
    "name": "Acme Inc.",
    "dotNumbers": ["123456"]
  },
  "filters": {
    "vehicles": {
      "status": "active|inactive",
      "includeIds": ["vcl_01D8..."],
      "excludeIds": ["vcl_01D8..."]
    },
    "drivers": {
      "status": "active|inactive",
      "includeIds": ["drv_01D8..."],
      "excludeIds": ["drv_01D8..."]
    }
  },
  "tags": ["tag1", "tag2"],
  "externalId": "custom-id"
}
```

**Use Cases**:
- ✅ Pause/resume data sync
- ✅ Filter which vehicles/drivers to sync
- ✅ Update company information
- ✅ Add custom tags for organization

**Implementation Priority**: HIGH - Useful for connection management UI

---

### 3. Data Synchronization
| Endpoint | Method | Purpose | Sandbox Support |
|----------|--------|---------|-----------------|
| `/syncs` | POST | Request manual data sync | ✅ Yes |
| `/syncs/:id/retry` | POST | Retry failed sync | ✅ Yes |
| `/syncs/:id/cancel` | POST | Cancel running sync | ✅ Yes |

**Request Sync Body**:
```json
{
  "days": 7  // Number of days of historical data to sync
}
```

**Use Cases**:
- ✅ Manual refresh button in UI
- ✅ Sync historical data
- ✅ Retry failed syncs
- ✅ Cancel long-running syncs

**Implementation Priority**: MEDIUM - Nice-to-have for admin console

---

### 4. Issue Resolution
| Endpoint | Method | Purpose | Sandbox Support |
|----------|--------|---------|-----------------|
| `/issues/:issueId/resolve` | POST | Mark issue as resolved | ✅ Yes |

**Use Cases**:
- ✅ Acknowledge sync errors
- ✅ Resolve connection issues
- ✅ Clear issue notifications

**Implementation Priority**: MEDIUM - Useful for error handling

---

### 5. Passthrough API
| Endpoint | Method | Purpose | Sandbox Support |
|----------|--------|---------|-----------------|
| `/passthrough` | POST | Direct call to provider API | ⚠️ Limited |

**Body Parameters**:
```json
{
  "method": "POST|PUT|DELETE|GET",
  "path": "/reports",
  "headers": {},
  "body": "{\"reportId\":\"1234\"}"
}
```

**Use Cases**:
- ✅ Access provider-specific features not in Terminal
- ✅ Create/update/delete entities directly with provider
- ✅ Bypass Terminal's read-only limitation

**Limitations**:
- Requires knowledge of provider's API
- Not normalized across providers
- May not work in sandbox (depends on provider)

**Implementation Priority**: LOW - Advanced feature, provider-specific

---

## Read-Only Endpoints (Already Implemented)

### Drivers
- ✅ GET `/drivers` - List all drivers
- ✅ GET `/drivers/:id` - Get single driver

### Vehicles
- ✅ GET `/vehicles` - List all vehicles
- ✅ GET `/vehicles/:id` - Get single vehicle
- ✅ GET `/vehicles/locations` - Latest locations
- ✅ GET `/vehicles/locations/historical` - Historical locations
- ✅ GET `/vehicles/stats/historical` - Historical stats

### Groups
- ✅ GET `/groups` - List all groups

### Trailers
- ✅ GET `/trailers` - List all trailers
- ✅ GET `/trailers/locations` - Latest locations

### Safety
- ✅ GET `/safety/events` - List safety events
- ✅ GET `/safety/events/:id` - Get single event
- ✅ GET `/safety/events/:id/media` - Get camera media

### HOS
- ✅ GET `/hos/available-time` - Available time for drivers
- ✅ GET `/hos/logs` - List HOS logs
- ✅ GET `/hos/daily-logs` - Daily logs

### Additional
- ✅ GET `/trips/historical` - Historical trips
- ✅ GET `/devices` - List devices
- ✅ GET `/fault-codes` - Fault code events
- ✅ GET `/ifta/summary` - IFTA summary
- ✅ GET `/vehicle-utilization` - Vehicle utilization

---

## Implementation Recommendations

### Phase 3A: Connection Management (HIGH Priority)

**Features to Implement**:
1. **Connection Settings UI**
   - View current connection settings
   - Pause/resume sync
   - Update company information
   - Configure vehicle/driver filters

2. **Manual Sync Button**
   - "Refresh Data" button in admin console
   - Shows sync progress
   - Displays last sync time
   - Option to sync historical data (X days)

**Endpoints to Use**:
- PATCH `/connections/current` - Update settings
- POST `/syncs` - Request manual sync
- GET `/syncs` - List sync history
- GET `/syncs/:id` - Get sync status

**Estimated Effort**: 4-6 hours

---

### Phase 3B: Issue Management (MEDIUM Priority)

**Features to Implement**:
1. **Issues Dashboard**
   - List all connection/sync issues
   - Show issue severity and type
   - "Resolve" button for each issue
   - Filter by status (open/resolved)

2. **Issue Notifications**
   - Badge count on admin console tab
   - Toast notifications for new issues
   - Auto-refresh issue list

**Endpoints to Use**:
- GET `/issues` - List issues
- POST `/issues/:issueId/resolve` - Resolve issue

**Estimated Effort**: 3-4 hours

---

### Phase 3C: Advanced Features (LOW Priority)

**Features to Implement**:
1. **Passthrough API Explorer**
   - Form to build passthrough requests
   - Method selector (GET/POST/PUT/DELETE)
   - Path input
   - Headers editor
   - Body editor
   - Response display

2. **Provider-Specific Actions**
   - Create driver (via passthrough)
   - Update vehicle (via passthrough)
   - Delete entity (via passthrough)

**Endpoints to Use**:
- POST `/passthrough` - Direct provider API calls

**Estimated Effort**: 6-8 hours

**Note**: Requires provider API documentation and may not work in sandbox

---

## What We CANNOT Do with Terminal API

### ❌ Direct Entity Management
- Cannot create drivers
- Cannot update drivers
- Cannot delete drivers
- Cannot create vehicles
- Cannot update vehicles
- Cannot delete vehicles
- Cannot create groups
- Cannot update groups
- Cannot delete groups
- Cannot create trailers
- Cannot update trailers
- Cannot delete trailers

### ❌ Safety Event Management
- Cannot create safety events
- Cannot update safety events
- Cannot delete safety events
- Cannot add coaching notes

### ❌ HOS Management
- Cannot create HOS logs
- Cannot update HOS logs
- Cannot delete HOS logs

### ⚠️ Workaround: Passthrough API
All entity management can potentially be done via `/passthrough` endpoint, but:
- Requires provider-specific API knowledge
- Not normalized across providers
- May not work in sandbox
- Defeats purpose of Terminal's unified API

---

## Comparison with VZC Direct Integration

| Operation | VZC Direct | Terminal API | Gap |
|-----------|------------|--------------|-----|
| **Read Operations** |
| List Drivers | ✅ | ✅ | None |
| Get Driver | ✅ | ✅ | None |
| List Vehicles | ✅ | ✅ | None |
| Get Vehicle | ✅ | ✅ | None |
| List Groups | ✅ | ✅ | None |
| List Safety Events | ✅ | ✅ | None |
| Get HOS Data | ✅ | ✅ | None |
| **Write Operations** |
| Create Driver | ✅ | ❌ | **CRITICAL** |
| Update Driver | ✅ | ❌ | **CRITICAL** |
| Delete Driver | ✅ | ❌ | **CRITICAL** |
| Create Vehicle | ✅ | ❌ | **CRITICAL** |
| Update Vehicle | ✅ | ❌ | **CRITICAL** |
| Delete Vehicle | ✅ | ❌ | **CRITICAL** |
| Create Group | ✅ | ❌ | **CRITICAL** |
| Update Group | ✅ | ❌ | **CRITICAL** |
| Delete Group | ✅ | ❌ | **CRITICAL** |
| **Connection Management** |
| Update Connection | ❌ | ✅ | Terminal advantage |
| Manual Sync | ❌ | ✅ | Terminal advantage |
| Sync History | ❌ | ✅ | Terminal advantage |

**Conclusion**: Terminal API is excellent for **monitoring** but not suitable for **management** without using passthrough API.

---

## Recommended Implementation Plan

### Option 1: Read-Only Dashboard (Current State)
**Status**: ✅ Complete  
**Coverage**: 100% of read operations  
**Use Case**: Fleet monitoring, reporting, analytics

### Option 2: Add Connection Management (Recommended)
**Effort**: 4-6 hours  
**Features**:
- Connection settings UI
- Manual sync button
- Sync history
- Issue management

**Value**: Improves admin experience, no provider-specific code

### Option 3: Add Passthrough API (Advanced)
**Effort**: 6-8 hours  
**Features**:
- Generic passthrough explorer
- Provider-specific entity management
- Full CRUD operations

**Limitations**: Requires provider API knowledge, not portable

### Option 4: Hybrid Approach (Complete Solution)
**Effort**: 10-15 hours  
**Features**:
- Terminal API for monitoring (current)
- VZC Direct API for management (new)
- Unified UI for both

**Value**: Best of both worlds, but more complex

---

## Next Steps

### Immediate (Phase 3A)
1. ✅ Analyze Postman collection (complete)
2. ⏳ Implement connection management UI
3. ⏳ Add manual sync button
4. ⏳ Display sync history

### Short-term (Phase 3B)
1. ⏳ Implement issues dashboard
2. ⏳ Add issue resolution
3. ⏳ Add issue notifications

### Long-term (Phase 3C)
1. ⏳ Evaluate passthrough API feasibility
2. ⏳ Consider hybrid approach with VZC direct
3. ⏳ Document provider-specific operations

---

## Conclusion

Terminal API provides **excellent read capabilities** but is **intentionally read-only** for core entities. This is by design - Terminal acts as a **data aggregation layer**, not a **management layer**.

**For FleetHub Terminal**:
- ✅ Current implementation (read-only) is **complete and appropriate**
- ✅ Can add connection management for better admin experience
- ⚠️ Entity management requires either:
  - Passthrough API (provider-specific, complex)
  - Direct TSP integration (defeats Terminal's purpose)
  - Hybrid approach (best solution, more effort)

**Recommendation**: Implement Phase 3A (connection management) for improved admin experience, then evaluate if entity management is needed based on user requirements.
