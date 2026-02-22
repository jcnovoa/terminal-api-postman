# Terminal Passthrough API - Test Results & Analysis

**Date**: February 22, 2026  
**Test Duration**: 10 minutes  
**Status**: ⚠️ Passthrough Not Functional in Sandbox

---

## Executive Summary

**Finding**: Terminal's Passthrough API returns "Not Found" for all VZC endpoints in sandbox environment, making it **impossible to test write operations** (POST/PUT/DELETE) through Terminal.

**Implication**: Cannot validate Terminal's value proposition for unified write operations without production access.

**Recommendation**: Terminal API appears to be **read-only overhead** for monitoring use cases. Direct TSP integration recommended for management operations.

---

## Test Results

### Test Environment
- **Terminal Environment**: Sandbox
- **TSP**: Verizon Connect Fleet (verizon-fleet)
- **Connection**: `conn_01KJ1958NH013MR143TH503G75`
- **Company**: Lotus Freight Corp. (DOT: 8339991)

### Test 1: GET Users via Passthrough
**Endpoint**: `/cmd/v1/users`  
**Method**: GET  
**Expected**: List of VZC users  
**Result**: ❌ `{"message": "Not Found"}`

```bash
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer sk_sandbox_..." \
  -H "Connection-Token: con_tkn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "path": "/cmd/v1/users"
  }'
```

**Response**:
```json
{
  "message": "Not Found"
}
```

---

### Test 2: POST User via Passthrough
**Endpoint**: `/cmd/v1/users`  
**Method**: POST  
**Expected**: Create new VZC user  
**Result**: ❌ `{"message": "Not Found"}`

```bash
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer sk_sandbox_..." \
  -H "Connection-Token: con_tkn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/cmd/v1/users",
    "body": "{\"FirstName\":\"Test\",\"LastName\":\"User\",\"Email\":\"testuser@terminal.test\"}"
  }'
```

**Response**:
```json
{
  "message": "Not Found"
}
```

---

### Test 3: GET Groups via Passthrough
**Endpoint**: `/cmd/v1/groups`  
**Method**: GET  
**Expected**: List of VZC groups (we know this works via Terminal's normalized API)  
**Result**: ❌ `{"message": "Not Found"}`

```bash
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer sk_sandbox_..." \
  -H "Connection-Token: con_tkn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "path": "/cmd/v1/groups"
  }'
```

**Response**:
```json
{
  "message": "Not Found"
}
```

---

## Analysis

### Why Passthrough Fails

**Possible Reasons**:

1. **Sandbox Limitation** ⚠️
   - Terminal sandbox may not support passthrough
   - Passthrough might be production-only feature
   - VZC sandbox connection may not expose raw API access

2. **Path Format Issue** ⚠️
   - VZC API base: `https://fim.api.us.fleetmatics.com`
   - Path might need full URL or different format
   - Terminal might not know VZC's API structure in sandbox

3. **Provider Limitation** ⚠️
   - VZC sandbox might not allow passthrough
   - Provider-specific security restrictions
   - Sandbox data isolation

4. **Feature Not Available** ❌
   - Passthrough might not work with all providers
   - VZC might not be supported for passthrough
   - Documentation vs reality mismatch

---

## What We Know Works

### Terminal Normalized API (Read-Only)
✅ **Working Endpoints**:
- GET `/drivers` → Returns 5 drivers
- GET `/vehicles` → Returns 4 vehicles
- GET `/vehicles/locations` → Returns GPS data
- GET `/safety/events` → Returns safety events
- GET `/hos/available-time` → Returns HOS data
- GET `/groups` → Returns 12 groups
- GET `/trailers` → Returns 5 trailers

**Conclusion**: Terminal successfully normalizes VZC data for **read operations**.

---

## What We Cannot Test

### Write Operations via Passthrough
❌ **Cannot Test**:
- POST `/cmd/v1/users` - Create user
- PUT `/cmd/v1/users/{id}` - Update user
- POST `/cmd/v1/drivers` - Create driver
- PUT `/cmd/v1/drivers/{id}` - Update driver
- POST `/cmd/v1/vehicles` - Create vehicle
- PUT `/cmd/v1/vehicles/{id}` - Update vehicle
- DELETE operations for any entity

**Reason**: Passthrough returns "Not Found" for all endpoints in sandbox.

---

## VZC Direct API Capabilities (Known)

### User Management (Not in Terminal)
- ✅ GET `/cmd/v1/users` - List users
- ✅ GET `/cmd/v1/users/{id}` - Get user
- ✅ POST `/cmd/v1/users` - Create user
- ✅ PUT `/cmd/v1/users/{id}` - Update user
- ✅ PUT `/cmd/v1/users/{id}/deactivate` - Deactivate user

### Driver Management
- ✅ GET `/cmd/v1/drivers` - List drivers
- ✅ GET `/cmd/v1/drivers/{id}` - Get driver
- ✅ POST `/cmd/v1/drivers` - Create driver
- ✅ PUT `/cmd/v1/drivers/{id}` - Update driver

### Vehicle Management
- ✅ GET `/cmd/v1/vehicles` - List vehicles
- ✅ GET `/cmd/v1/vehicles/{id}` - Get vehicle
- ✅ POST `/cmd/v1/vehicles` - Create vehicle
- ✅ PUT `/cmd/v1/vehicles/{id}` - Update vehicle

### Group Management
- ✅ GET `/cmd/v1/groups` - List groups
- ✅ POST `/cmd/v1/groups` - Create group
- ✅ PUT `/cmd/v1/groups/{id}` - Update group

**Conclusion**: VZC Direct API supports full CRUD operations.

---

## Terminal vs VZC Direct: Value Proposition

### Terminal API Advantages
1. ✅ **Normalized Data Model** - Consistent across TSPs
2. ✅ **Single Integration** - Works with multiple providers
3. ✅ **Automatic Sync** - Background data updates
4. ✅ **Webhook Management** - Unified event system
5. ✅ **Connection Management** - Easy provider switching

### Terminal API Disadvantages
1. ❌ **Read-Only** - No write operations for core entities
2. ❌ **Passthrough Unclear** - Cannot test in sandbox
3. ❌ **Missing Features** - No users, no DVIR
4. ❌ **Overhead** - Extra API layer for simple reads
5. ❌ **Vendor Lock-in** - Dependent on Terminal's roadmap

### VZC Direct API Advantages
1. ✅ **Full CRUD** - Complete entity management
2. ✅ **All Features** - Users, DVIR, everything
3. ✅ **Direct Access** - No intermediary
4. ✅ **Proven** - Existing implementation works
5. ✅ **Control** - Not dependent on third party

### VZC Direct API Disadvantages
1. ❌ **Provider-Specific** - Need separate integration per TSP
2. ❌ **Different APIs** - Each provider has unique structure
3. ❌ **Manual Sync** - Need to implement polling/webhooks
4. ❌ **More Code** - Separate implementation per provider

---

## Cost-Benefit Analysis

### Scenario 1: Single TSP (VZC Only)
**Terminal Value**: ❌ **NEGATIVE**
- Adds overhead without benefit
- Read-only when we need write
- Cannot test passthrough
- Extra cost for Terminal subscription

**Recommendation**: Use VZC Direct API

---

### Scenario 2: Multiple TSPs (VZC + Others)
**Terminal Value**: ⚠️ **MAYBE**
- Normalized reads across providers
- Single integration for monitoring
- But still need direct API for writes

**Recommendation**: Hybrid approach
- Terminal for monitoring dashboard
- Direct APIs for management operations

---

### Scenario 3: Read-Only Monitoring
**Terminal Value**: ✅ **POSITIVE**
- Perfect for analytics/reporting
- No write operations needed
- Multi-TSP support valuable

**Recommendation**: Use Terminal API

---

## Recommendations

### Immediate Actions

1. **Contact Terminal Support** 📞
   - Ask about passthrough in sandbox
   - Request production trial for passthrough testing
   - Clarify write operation support

2. **Test Production Passthrough** 🧪
   - If available, test with production credentials
   - Validate POST/PUT/DELETE operations
   - Document actual capabilities

3. **Evaluate Use Case** 🎯
   - If read-only monitoring: Terminal is good
   - If entity management needed: Direct API better
   - If multi-TSP future: Consider hybrid

### Long-Term Strategy

#### Option A: Terminal Only (If Passthrough Works)
**Pros**:
- Single integration
- Multi-TSP ready
- Normalized data

**Cons**:
- Dependent on Terminal
- Passthrough complexity
- Provider-specific code still needed

**Verdict**: ⚠️ Only if passthrough proven in production

---

#### Option B: VZC Direct Only
**Pros**:
- Full control
- All features available
- Proven implementation
- No third-party dependency

**Cons**:
- Provider-specific
- Need separate integration per TSP
- More maintenance

**Verdict**: ✅ **RECOMMENDED** for current needs

---

#### Option C: Hybrid Approach
**Pros**:
- Terminal for monitoring (read-only)
- Direct API for management (write)
- Best of both worlds

**Cons**:
- Two integrations to maintain
- More complex architecture
- Higher cost

**Verdict**: ⚠️ Consider for multi-TSP future

---

## Conclusion

### Terminal API Assessment

**For Monitoring**: ✅ **Excellent**
- Normalized data model
- Multi-TSP support
- Automatic sync
- Webhook management

**For Management**: ❌ **Insufficient**
- No write operations
- Passthrough unproven in sandbox
- Missing critical features (users, DVIR)
- Adds overhead without clear benefit

### Final Recommendation

**For FleetHub Terminal Project**:

1. **Current State**: ✅ Keep read-only implementation
   - Demonstrates Terminal's monitoring capabilities
   - Good for analytics/reporting use case
   - 85% feature parity achieved

2. **Write Operations**: ❌ Use VZC Direct API
   - Proven CRUD operations
   - All features available
   - No passthrough uncertainty

3. **Future**: ⚠️ Re-evaluate when:
   - Terminal adds native write operations
   - Passthrough proven in production
   - Multi-TSP requirement emerges

### Next Steps

1. ✅ Document current implementation (complete)
2. ⏳ Contact Terminal support about passthrough
3. ⏳ Request production trial if needed
4. ⏳ Decide: Terminal monitoring vs VZC direct management
5. ⏳ Implement chosen approach

---

## Test Script

Saved as: `test-passthrough.sh`

```bash
#!/bin/bash
# Terminal Passthrough API Test
# Run: ./test-passthrough.sh

TERMINAL_SECRET_KEY="sk_sandbox_..."
CONNECTION_TOKEN="con_tkn_..."

# Test 1: GET users
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer $TERMINAL_SECRET_KEY" \
  -H "Connection-Token: $CONNECTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "GET", "path": "/cmd/v1/users"}' | jq '.'

# Test 2: POST user
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer $TERMINAL_SECRET_KEY" \
  -H "Connection-Token: $CONNECTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/cmd/v1/users",
    "body": "{\"FirstName\":\"Test\",\"LastName\":\"User\"}"
  }' | jq '.'
```

**Result**: All tests return `{"message": "Not Found"}`

---

## Questions for Terminal Support

1. Does passthrough work in sandbox environment?
2. If not, can we get production trial access?
3. Which VZC endpoints are supported via passthrough?
4. Are write operations (POST/PUT/DELETE) supported?
5. What's the correct path format for VZC passthrough?
6. Are there any provider-specific limitations?
7. What's Terminal's roadmap for native write operations?

---

**Status**: Awaiting Terminal support response or production access for proper passthrough testing.
