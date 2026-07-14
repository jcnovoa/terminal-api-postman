# Terminal API — Usable Endpoints & Product Roadmap Analysis

**Date**: July 14, 2026  
**Scope**: Endpoints we currently use + endpoints we can leverage for product roadmap  
**Context**: SaferFleetExpress comparison — what Terminal offers that maps to our existing or planned capabilities

---

## Currently Active Endpoints

These are the Terminal endpoints our FleetHub Terminal implementation actively calls today:

| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 1 | `/drivers` | GET | Driver directory (5 drivers in sandbox) |
| 2 | `/vehicles` | GET | Vehicle directory (4 vehicles in sandbox) |
| 3 | `/vehicles/locations` | GET | Latest GPS position for all vehicles (bulk) |
| 4 | `/safety/events` | GET | Safety event feed (harsh braking, speeding, etc.) |
| 5 | `/groups` | GET | Fleet organization groups (12 groups) |
| 6 | `/trailers` | GET | Non-powered asset inventory (5 trailers) |
| 7 | `/connections` | GET | TSP connection status |
| 8 | `/hos/available-time` | GET | HOS compliance (**returns empty — permission-gated**) |

---

## Additional Endpoints Available for Product Roadmap

These Terminal endpoints are documented, accessible (unless noted), and map to features we either already deliver in SaferFleetExpress via VZC direct or plan to build:

### Historical Vehicle Locations

| Endpoint | `GET /vehicles/:vehicleId/locations?startAt=&endAt=` |
|----------|------------------------------------------------------|
| **Status** | ✅ Available (confirmed working in sandbox) |
| **Description** | Returns GPS breadcrumbs for a specific vehicle within a time range |
| **Response fields** | latitude, longitude, speed, heading, engineState, odometer, locatedAt, address |
| **Date filtering** | `startAt` (ISO timestamp), `endAt` (ISO timestamp) — defaults to "beginning of history" |
| **Pagination** | `cursor`, `limit` |

**Product Use Case: Incident Reconstruction / Journey Replay**

In SaferFleetExpress, we reconstruct accident timelines using GPS webhook data stored in DynamoDB (30-day retention). Terminal's historical endpoint would serve the same purpose without webhook infrastructure:

```
GET /vehicles/vcl_01KJ195EB2E309FSTDY4R63YTN/locations
  ?startAt=2026-07-01T10:00:00Z
  &endAt=2026-07-01T10:30:00Z
```

Returns the vehicle's GPS path around the incident time — enabling:
- Speed-colored polyline on map
- Breadcrumb trail visualization
- Speed at moment of impact
- Location at specific timestamp

**⚠️ Open Question**: How far back does Terminal retain historical location data in production? Sandbox had ~3 days. Documentation says "defaults to beginning of history" but does not specify a hard retention limit.

---

### Historical Vehicle Stats

| Endpoint | `GET /vehicles/:vehicleId/stats/historical?startAt=&endAt=&types=` |
|----------|---------------------------------------------------------------------|
| **Status** | ✅ Available (not permission-gated) |
| **Description** | Historical vehicle statistics over a time range |
| **Filterable by** | `types` (comma-separated list of stat types) |
| **Date filtering** | `startAt`, `endAt` |
| **Pagination** | `cursor`, `limit` |

**Product Use Case: Vehicle Health Trending / Fleet Analytics**

Provides odometer, fuel levels, engine hours over time. Useful for:
- Mileage reports
- Fuel consumption trending
- Engine hour tracking for maintenance scheduling
- Pre/post-trip comparisons

---

### Safety Event Camera Media

| Endpoint | `GET /safety/events/:id/camera-media` |
|----------|----------------------------------------|
| **Status** | ✅ Available (confirmed working — returns presigned S3 URLs) |
| **Response** | `frontFacing.videoUrl`, `rearFacing.videoUrl` |

**Product Use Case: Video Evidence Retrieval**

Returns direct video URLs for a known safety event. In sandbox:
```json
{
  "frontFacing": {
    "videoUrl": "https://prod-terminal-sandbox-media.s3.amazonaws.com/front-facing.mp4"
  },
  "rearFacing": {
    "videoUrl": "https://prod-terminal-sandbox-media.s3.amazonaws.com/rear-facing.mp4"
  }
}
```

**Limitation vs VZC**: No search/filter capability. No tracking data (GPS per second). No thumbnails. No coaching workflow. Must already know the event ID.

---

### Fault Codes (DTC)

| Endpoint | `GET /fault-codes` |
|----------|---------------------|
| **Status** | ✅ Available |
| **Description** | Active and historical diagnostic trouble codes across fleet |
| **Pagination** | `cursor`, `limit` |

**Product Use Case: Vehicle Diagnostics / Predictive Maintenance**

Maps to VZC's `GET /rad/v1/vehicles/getvehiclesactivedtcs` (planned for SaferFleetExpress). Provides:
- Active fault codes per vehicle
- DTC code descriptions
- Severity indicators
- Timestamps

---

### Historical Trips

| Endpoint | `GET /trips?startedAfter=&startedBefore=&driverIds=&vehicleIds=` |
|----------|-------------------------------------------------------------------|
| **Status** | ✅ Available (sandbox returned 0 results — may need production data) |
| **Filterable by** | `startedAfter`, `startedBefore`, `endedAfter`, `endedBefore`, `driverIds` (up to 50), `vehicleIds` (up to 50) |
| **Pagination** | `cursor`, `limit` |

**Product Use Case: Trip History / Mileage Reporting**

Provides trip-level data: origin, destination, distance, duration, driver, vehicle. Maps to VZC's `/rad/v1/vehicles/{id}/segments` (planned). Useful for:
- Driver trip logs
- Mileage verification
- Route analysis
- Billable hours/miles

---

### IFTA Summary

| Endpoint | `GET /ifta/summary?startMonth=&endMonth=&groupBy=` |
|----------|------------------------------------------------------|
| **Status** | ✅ Available (**Terminal exclusive — not available in VZC Reveal API**) |
| **Required params** | `startMonth` (YYYY-MM), `endMonth` (YYYY-MM) |
| **Group by** | `vehicle`, `jurisdiction`, or `vehicle,jurisdiction` |

**Product Use Case: Fuel Tax Compliance**

Computes miles driven per jurisdiction per vehicle for IFTA quarterly filings. This is a **Terminal advantage** — VZC Reveal doesn't expose this natively.

---

### Trailer Locations

| Endpoint | `GET /trailers/locations` |
|----------|----------------------------|
| **Status** | ✅ Available |
| **Description** | Latest GPS positions for all trailers (non-powered assets) |

**Product Use Case: Trailer Tracking**

Maps to VZC's `/AST/v1/assets/{id}/location` (planned). Provides real-time trailer positions for yard management and asset recovery.

---

### Devices

| Endpoint | `GET /devices` |
|----------|-----------------|
| **Status** | ✅ Available |
| **Description** | ELD/GPS hardware device inventory |
| **Pagination** | `cursor`, `limit` |

**Product Use Case: Device Management / Compliance Audit**

Inventory of physical ELD and telematics devices installed in fleet. Useful for:
- Device compliance tracking (FMCSA ELD mandate)
- Serial number inventory
- Device-to-vehicle mapping

---

## Permission-Gated Endpoints (Require Account Upgrade)

These endpoints return `403 Forbidden` with our current sandbox credentials:

| # | Endpoint | Permission Required | Product Use Case |
|---|----------|---------------------|------------------|
| 1 | `GET /hos/available-time` | `hos:read` | Current HOS status (bulk — better than VZC's per-driver calls) |
| 2 | `GET /hos/logs` | `hos:read` | ELD log history with date range + driver filters |
| 3 | `GET /hos/daily-logs` | `hos:read` | Daily HOS summaries per driver |
| 4 | `GET /vehicles/utilization` | `vehicle-utilization:read` | Drive time, idle time, distance per vehicle per period |

**Note**: If these were unlocked, HOS endpoints would be **superior to VZC** for our use case — Terminal provides bulk queries with date/driver filters in a single call, while VZC requires individual calls per driver (`/logbook/v1/driver/{driverNumber}/statuscurrent`).

---

## Latest vs Historical Locations — Decision Matrix

### Latest Vehicle Locations (`GET /vehicles/locations`)
- Returns: Current position of ALL vehicles in one call
- Use case: **Live map, real-time fleet view**
- Limitations: Only shows where vehicles are *right now*

### Historical Vehicle Locations (`GET /vehicles/:id/locations?startAt=&endAt=`)
- Returns: GPS breadcrumbs for ONE vehicle within a time window
- Use case: **Incident reconstruction, journey replay, route audits**
- Limitations: Per-vehicle (not bulk), unknown production retention

### Why We Need Both

| Scenario | Endpoint Needed |
|----------|----------------|
| "Show me where all my trucks are right now" | Latest (bulk) |
| "A driver had an accident 2 days ago — show me the path" | **Historical** |
| "A client claims delivery was late 2 weeks ago — prove the route" | **Historical** |
| "Reconstruct the 5 minutes before a harsh braking event" | **Historical** |
| "Track vehicle speed approaching an intersection on July 1st" | **Historical** |
| "Real-time dispatch — which truck is closest?" | Latest (bulk) |

**Conclusion**: For a safety platform, **both are essential**. Latest for operations, historical for investigations and compliance.

---

## Consolidated Endpoint Summary

### ✅ Confirmed Usable (14 endpoints)

| # | Endpoint | Category | Product Feature |
|---|----------|----------|-----------------|
| 1 | `GET /drivers` | Fleet | Driver directory |
| 2 | `GET /drivers/:id` | Fleet | Driver detail |
| 3 | `GET /vehicles` | Fleet | Vehicle directory |
| 4 | `GET /vehicles/:id` | Fleet | Vehicle detail |
| 5 | `GET /vehicles/locations` | GPS | Live fleet map |
| 6 | `GET /vehicles/:id/locations` | GPS | **Incident reconstruction / Journey replay** |
| 7 | `GET /vehicles/:id/stats/historical` | Analytics | Vehicle health trending |
| 8 | `GET /safety/events` | Safety | Safety event feed |
| 9 | `GET /safety/events/:id/camera-media` | Video | Video evidence retrieval |
| 10 | `GET /fault-codes` | Maintenance | Vehicle diagnostics (DTC) |
| 11 | `GET /trips` | Analytics | Trip history and mileage |
| 12 | `GET /groups` | Fleet | Fleet organization |
| 13 | `GET /trailers` | Assets | Trailer inventory |
| 14 | `GET /trailers/locations` | GPS | Trailer tracking |
| 15 | `GET /devices` | Hardware | ELD device inventory |
| 16 | `GET /ifta/summary` | Compliance | **Fuel tax reporting (Terminal exclusive)** |
| 17 | `GET /connections` | Admin | TSP connection management |
| 18 | `GET /providers` | Admin | Available TSP list |

### ⚠️ Permission-Gated (4 endpoints)

| # | Endpoint | Category | Product Feature |
|---|----------|----------|-----------------|
| 19 | `GET /hos/available-time` | ELD | Bulk HOS status |
| 20 | `GET /hos/logs` | ELD | ELD log history |
| 21 | `GET /hos/daily-logs` | ELD | Daily HOS summaries |
| 22 | `GET /vehicles/utilization` | Analytics | Vehicle utilization metrics |

### ❌ Not Available in Terminal

| Category | VZC Feature | Impact |
|----------|-------------|--------|
| Video | Search/filter events, playback, tracking data, coaching | **Critical** |
| DVIR | Inspection reports, defects, templates | **Critical** |
| Users | User management | **High** |
| Geofences | Create/manage geofences | **Medium** |
| Assignments | Driver ↔ Vehicle CRUD | **Medium** |
| All CRUD | Create/Update/Delete any entity | **Critical** |

---

## Key Takeaways

1. **We should use both Latest AND Historical locations** — Latest for live ops, Historical for incident investigation
2. **Vehicle Stats Historical is available** and not gated — good for fleet analytics
3. **IFTA is a Terminal exclusive** — valuable for carriers with fuel tax obligations
4. **Fault Codes works** — equivalent to what we'd get from VZC for diagnostics
5. **Trips endpoint** is available with rich filtering — better bulk access than VZC segments
6. **Camera media** exists but is a thin wrapper — no replacement for VZC's full video platform
7. **HOS would be Terminal's biggest advantage** (bulk queries) — but locked behind permissions

---

## Unanswered Questions for Terminal Support

1. What is the **historical location data retention** in production? (Days? Months? Unlimited?)
2. Can `hos:read` and `vehicle-utilization:read` permissions be added to our sandbox for testing?
3. Does the historical endpoint support **bulk vehicle queries** or only per-vehicle?
4. What is the **GPS ping frequency** in historical data? (Every 30s? 1 min? 5 min?)
5. Is IFTA summary available for the `verizon-fleet` provider specifically?

---

*Document: TERMINAL_USABLE_ENDPOINTS_ANALYSIS.md*  
*Created: July 14, 2026*
