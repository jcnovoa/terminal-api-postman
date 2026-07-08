# SaferFleetExpress (VZC Direct) vs Terminal API — Capability Comparison

**Date**: July 8, 2026  
**Purpose**: Compare SaferFleetExpress platform capabilities (built on VZC direct APIs) against what Terminal API can and cannot provide  
**Verdict**: Terminal API covers a fraction of what SaferFleetExpress requires

---

## Executive Summary

SaferFleetExpress has evolved into a **23-module fleet safety platform** integrating 8+ external services. Terminal API — as a read-only telematics aggregator — can only address a subset of the *monitoring* capabilities and none of the *management, AI, compliance, training, insurance, or video* capabilities.

| Metric | SaferFleetExpress | Terminal API Coverage |
|--------|-------------------|---------------------|
| Total Modules | 23 | 6 (partial) |
| External Integrations | 8+ | 1 (VZC only, read-only) |
| VZC Endpoints Used | 13 GET + Video | 8 GET (normalized) |
| Write Operations | Planned (CRUD) | ❌ None |
| Video Telematics | ✅ Full playback + AI analysis | ⚠️ Media URL only (no search/filter) |
| ELD/HOS | ✅ Full status + remaining time | ❌ Permission-gated |
| FMCSA/Compliance | ✅ 483-field carrier profiles | ❌ Not available |
| Training/LMS | ✅ Full Sentix integration | ❌ Not available |
| Insurance/Underwriting | ✅ MVR + PDF parsing | ❌ Not available |
| AI/SafetyGPT | ✅ Multi-context advisor | ❌ Not available |
| Multi-Tenant | ✅ Full isolation + RBAC | ❌ Not available |
| Webhooks | ✅ GPS + Alerts (DynamoDB) | ⚠️ Generic events only |

---

## Module-by-Module Comparison

### 1. Dashboard & KPIs

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| Total Drivers/Vehicles KPIs | `GET /cmd/v1/drivers`, `GET /cmd/v1/vehicles` | `GET /drivers`, `GET /vehicles` | ✅ None |
| Live Fleet Status (speed, location, status) | `GET /rad/v1/vehicles/{id}/location`, `/status` | `GET /vehicles/locations` | ⚠️ Terminal combines into one call but loses `status` detail |
| Safety Event Feed | `POST /video/video-events/search` | `GET /safety/events` | ⚠️ Terminal has events but NO video search, no filtering |
| HOS Widget | `GET /logbook/v1/driver/{id}/statuscurrent` | `GET /hos/available-time` | ❌ **Permission-gated** (`hos:read` required) |
| GPS Webhook Feed | DynamoDB webhook table | Webhook events | ⚠️ Terminal webhooks are generic, no GPS-specific |

---

### 2. Live Operations / Map

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| All vehicle locations | `GET /rad/v1/vehicles/{id}/location` (per vehicle) | `GET /vehicles/locations` | ✅ Terminal provides bulk latest locations |
| Vehicle status (Moving/Idle/Stopped/Charging) | `GET /rad/v1/vehicles/{id}/status` | Included in locations | ⚠️ Limited status values |
| Driver assignment for popup | `GET /da/v1/driverassignments/vehicles/{id}/currentassignment` | Location includes `driver` field | ✅ Available |
| Journey Replay (GPS trail) | Webhook GPS data (DynamoDB, 30-day) | `GET /vehicles/:id/locations` (historical) | ⚠️ Terminal has historical but sandbox only had 3 days |
| Job Site Overlay / Route Lines | Custom (Crew API) | ❌ Not available | ❌ **Critical gap** |
| Weather Overlay | AccuWeather/Open-Meteo | ❌ Not available | ❌ **Not in scope** |

---

### 3. Drivers

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| Paginated directory (825 drivers) | `GET /cmd/v1/drivers` | `GET /drivers` | ✅ Available |
| Driver detail | `GET /cmd/v1/drivers/{id}` | `GET /drivers/:id` | ✅ Available |
| Driver-Vehicle assignment | `GET /da/v1/driverassignments/drivers/{id}/currentassignment` | Via `vehicleLocations[].driver` | ⚠️ Indirect — no dedicated endpoint |
| Key Fobs | `GET /cmd/v1/drivers/{id}/keys` | ❌ Not available | ❌ **Gap** |
| Samba Safety profile | Samba Safety API | ❌ Not available | ❌ **Not in scope** |
| Crew Manifest | Custom DynamoDB | ❌ Not available | ❌ **Not in scope** |
| Driver CRUD | `POST/PUT/DELETE /cmd/v1/drivers` | ❌ Read-only | ❌ **Critical gap** |

---

### 4. Vehicles

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| Vehicle directory | `GET /cmd/v1/vehicles` | `GET /vehicles` | ✅ Available |
| Vehicle detail | `GET /cmd/v1/vehicles/{id}` | `GET /vehicles/:id` | ✅ Available |
| NHTSA VIN Decode | NHTSA API (direct) | ❌ Not available | ❌ **Not in scope** |
| Vehicle diagnostics (DTC codes) | `GET /rad/v1/vehicles/getvehiclesactivedtcs` | ❌ Not available | ❌ **Gap** |
| Vehicle CRUD | `PUT /cmd/v1/vehicles/{id}` | ❌ Read-only | ❌ **Critical gap** |
| Historical stats | `GET /rad/v1/vehicles/{id}/segments` | `GET /vehicles/:id/stats/historical` | ✅ Available |
| Vehicle utilization | Custom calculation | `GET /vehicles/utilization` | ❌ **Permission-gated** |

---

### 5. Risk & Safety / Video Telematics

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| Video event search (7-field filter) | `POST /video/video-events/search` | `GET /safety/events` | ❌ **No video search/filter** |
| Animated thumbnails | `media.animatedThumbnailUrl` | ❌ Not available | ❌ **Gap** |
| Full video playback (15-sec clips) | `GET /video/video-events/{id}?fields=media` | ❌ Not available | ❌ **Critical gap** |
| Multi-camera switching | Video `media.video[].channel` | ❌ Not available | ❌ **Critical gap** |
| Speed overlay on video | Tracking data from event | ❌ Not available | ❌ **Gap** |
| Incident Reconstruction (GPS trail + chart) | GPS tracking points | `startLocation` only | ❌ **Critical gap** |
| Weather context on events | AccuWeather + Open-Meteo | ❌ Not available | ❌ **Not in scope** |
| Coaching workflow | VZC coaching API | ❌ Not available | ❌ **Gap** |
| AI analysis (SafetyGPT) | Google Gemini | ❌ Not available | ❌ **Not in scope** |
| Camera media URLs | — | `GET /safety/events/:id/camera-media` | ⚠️ URL only, no search/filter/playback |

**Terminal's video coverage**: Can retrieve a presigned URL for front/rear cameras on a known event ID. Cannot search events, cannot filter by driver/vehicle/date/type, no thumbnails, no tracking data, no speed overlay.

---

### 6. ELD / HOS Compliance

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| Current HOS status per driver | `GET /logbook/v1/driver/{id}/statuscurrent` | `GET /hos/available-time` | ❌ **Permission-gated** |
| Drive/Shift time remaining | TimeRemaining fields | `GET /hos/available-time` | ❌ **Permission-gated** |
| Critical alerts (<60 min) | Frontend logic | — | ❌ (No data source) |
| HOS logs history | Not yet implemented | `GET /hos/logs`, `GET /hos/daily-logs` | ❌ **Permission-gated** |

**Key finding**: All HOS endpoints in Terminal require `hos:read` permission which our sandbox account does NOT have. Cannot even test these.

---

### 7. Maintenance / DVIR Inspections

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| Inspection report list | `GET /inspections/reports` | ❌ Not available | ❌ **Critical gap** |
| Inspection detail | `GET /inspections/reports/{id}` | ❌ Not available | ❌ **Critical gap** |
| Defect resolution | `PATCH /inspections/defects/{id}` | ❌ Not available | ❌ **Critical gap** |
| Submit inspection | `POST /inspections/reports` | ❌ Not available | ❌ **Critical gap** |

**Terminal has zero DVIR/inspection support.**

---

### 8. Training & Coaching (Sentix LMS)

| SaferFleetExpress Capability | Terminal API Equivalent | Gap |
|------------------------------|------------------------|-----|
| Full LMS integration | ❌ Not available | ❌ **Not in scope** |
| Course catalog (200+ courses) | ❌ Not available | ❌ **Not in scope** |
| Assign/track training | ❌ Not available | ❌ **Not in scope** |
| Compliance metrics | ❌ Not available | ❌ **Not in scope** |

---

### 9. FMCSA / CarrierOK / Historical Records

| SaferFleetExpress Capability | Terminal API Equivalent | Gap |
|------------------------------|------------------------|-----|
| 483-field carrier profiles | ❌ Not available | ❌ **Not in scope** |
| BASIC safety scores | ❌ Not available | ❌ **Not in scope** |
| Crash/violation history | ❌ Not available | ❌ **Not in scope** |
| 6-layer cache architecture | ❌ Not available | ❌ **Not in scope** |

---

### 10. Insurance Underwriting

| SaferFleetExpress Capability | Terminal API Equivalent | Gap |
|------------------------------|------------------------|-----|
| PDF parsing | ❌ Not available | ❌ **Not in scope** |
| MVR ordering (Samba Safety) | ❌ Not available | ❌ **Not in scope** |
| Report generation (Gemini) | ❌ Not available | ❌ **Not in scope** |

---

### 11. Multi-Tenant & Authentication

| SaferFleetExpress Capability | Terminal API Equivalent | Gap |
|------------------------------|------------------------|-----|
| Domain-based tenant resolution | ❌ Not available | ❌ **Not in scope** |
| Per-tenant module licensing | ❌ Not available | ❌ **Not in scope** |
| RBAC (5 roles) | ❌ Not available | ❌ **Not in scope** |
| Impersonation | ❌ Not available | ❌ **Not in scope** |
| OTP auth | ❌ Not available | ❌ **Not in scope** |

---

### 12. Webhooks

| SaferFleetExpress Capability | VZC Direct | Terminal API Equivalent | Gap |
|------------------------------|-----------|------------------------|-----|
| GPS webhooks (every 30-60s per vehicle) | SNS → Lambda → DynamoDB | `vehicle.modified` event | ⚠️ Terminal event frequency unknown |
| Alert webhooks (ignition, speeding, geofence) | SNS → Lambda → DynamoDB | Generic `safety_event.added` | ⚠️ No alert type granularity |
| GPS data query (last 100, filter by vehicle) | Direct DynamoDB scan | ❌ Not available | ❌ **Gap** |
| 30-day GPS retention | DynamoDB TTL | Historical endpoint (unknown retention) | ⚠️ Sandbox had 3 days |
| 90-day alert retention | DynamoDB TTL | ❌ Not available | ❌ **Gap** |

---

## Terminal API Endpoints We Would Leverage (If We Used Terminal)

### ✅ Would Work (Read-Only Monitoring)

| Terminal Endpoint | SaferFleet Module | Replaces VZC |
|-------------------|-------------------|--------------|
| `GET /drivers` | Drivers tab | `GET /cmd/v1/drivers` |
| `GET /drivers/:id` | Driver detail | `GET /cmd/v1/drivers/{id}` |
| `GET /vehicles` | Vehicles tab | `GET /cmd/v1/vehicles` |
| `GET /vehicles/:id` | Vehicle detail | — |
| `GET /vehicles/locations` | Map (latest) | `GET /rad/v1/vehicles/{id}/location` |
| `GET /vehicles/:id/locations` | Journey Replay | Webhook GPS data |
| `GET /vehicles/:id/stats/historical` | Vehicle analytics | `GET /rad/v1/vehicles/{id}/segments` |
| `GET /groups` | Groups tab | `GET /cmd/v1/groups` |
| `GET /trailers` | Assets tab | — (currently Not Powered Assets) |
| `GET /safety/events` | Risk & Safety (basic list only) | `POST /video/video-events/search` (partial) |
| `GET /safety/events/:id/camera-media` | Video URL retrieval only | `GET /video/video-events/{id}?fields=media` (partial) |
| `GET /connections` | Admin (Terminal-specific) | — |
| `GET /trips` | Trip analytics | — |
| `GET /devices` | Device inventory | — |
| `GET /fault-codes` | Vehicle diagnostics | `GET /rad/v1/vehicles/getvehiclesactivedtcs` |
| `GET /ifta/summary` | IFTA compliance | — |
| `POST /syncs` | Manual data refresh | — |
| `PATCH /connections/current` | Connection management | — |

### ❌ Permission-Gated (Cannot Access Without Upgrade)

| Terminal Endpoint | SaferFleet Module | Permission Required |
|-------------------|-------------------|---------------------|
| `GET /hos/available-time` | ELD/HOS | `hos:read` |
| `GET /hos/logs` | HOS history | `hos:read` |
| `GET /hos/daily-logs` | HOS daily | `hos:read` |
| `GET /vehicles/utilization` | Vehicle analytics | `vehicle-utilization:read` |

### ❌ Not Available in Terminal (Must Use VZC Direct or Other APIs)

| Capability | Required API | SaferFleet Module |
|-----------|--------------|-------------------|
| Video Event Search | VZC `POST /video/video-events/search` | Risk & Safety |
| Video Playback (media URLs, tracking) | VZC `GET /video/video-events/{id}?fields=media&embed=tracking` | Video Player |
| Coaching Workflow | VZC coaching API | Safety coaching |
| DVIR Inspections | VZC `GET /inspections/reports` | Maintenance |
| Users Management | VZC `GET/POST/PUT /cmd/v1/users` | Users tab |
| Driver Assignments | VZC `GET/POST/DELETE /da/v1/driverassignments` | Drivers/Vehicles |
| Key Fobs | VZC `GET /cmd/v1/drivers/{id}/keys` | Driver detail |
| Geofences | VZC `/geo/v1/geofences/*` | Location intelligence |
| Non-Powered Assets | VZC `/AST/v1/assets/*` | Asset tracking |
| Training/LMS | Sentix API | Training module |
| MVR/Background Checks | Samba Safety API | Insurance/Compliance |
| FMCSA Carrier Data | CarrierOK API | Historical Records |
| Weather Context | AccuWeather/Open-Meteo | Safety events |
| AI Analysis | Google Gemini | SafetyGPT |
| NHTSA VIN Decode | NHTSA API | Vehicle detail |
| Entity CRUD (create/update/delete) | VZC POST/PUT/DELETE | All modules |

---

## Quantified Coverage

### Terminal API covers SaferFleetExpress:

| Category | Total Features | Terminal Covers | % |
|----------|:--------------:|:--------------:|:-:|
| Core Fleet Monitoring | 12 | 8 | 67% |
| Video Telematics | 10 | 1 (URL only) | 10% |
| ELD/HOS | 5 | 0 (permission-gated) | 0% |
| DVIR/Inspections | 4 | 0 | 0% |
| FMCSA/Compliance | 8 | 0 | 0% |
| Training/LMS | 6 | 0 | 0% |
| Insurance | 5 | 0 | 0% |
| AI/SafetyGPT | 4 | 0 | 0% |
| Multi-Tenant | 8 | 0 | 0% |
| Webhooks/Real-time | 5 | 2 | 40% |
| Entity Management (CRUD) | 10 | 0 | 0% |
| **TOTAL** | **77** | **11** | **14%** |

---

## Final Assessment

### Terminal API provides 14% of SaferFleetExpress capabilities.

The 14% it covers is limited to:
- Basic driver/vehicle/group/trailer listing (read-only)
- Latest vehicle locations (bulk)
- Historical GPS data (limited retention)
- Safety event listing (no search/filter)
- Camera media URL retrieval (no playback infrastructure)
- Basic webhook events

### Everything else requires direct VZC integration + 7 other APIs.

Terminal would only be useful if:
1. We needed to support **multiple telematics providers** simultaneously
2. We only needed **monitoring** (not management)
3. HOS permissions were granted (currently blocked)
4. We accepted losing **all video capabilities** (search, playback, thumbnails, tracking)

### Recommendation: Terminal is not viable for SaferFleetExpress.

The platform has grown far beyond basic telematics monitoring. It's a multi-integration safety management platform where VZC is just one of 8+ data sources. Adding Terminal as an intermediary would:
- Cover only 14% of needs
- Add latency and cost
- Provide zero write capability
- Lose video telematics entirely
- Gate HOS behind permissions
- Require all other integrations anyway

**Continue with VZC direct integration.**

---

## Appendix: Terminal API Full Endpoint Reference

### Available (18 endpoints)
```
GET  /drivers                          - List drivers
GET  /drivers/:id                      - Get single driver
GET  /vehicles                         - List vehicles
GET  /vehicles/:id                     - Get single vehicle
GET  /vehicles/locations               - Latest locations (all)
GET  /vehicles/:id/locations           - Historical locations
GET  /vehicles/:id/stats/historical    - Historical stats
GET  /vehicles/utilization             - Vehicle utilization ⚠️ PERMISSION-GATED
GET  /groups                           - List groups
GET  /trailers                         - List trailers
GET  /trailers/locations               - Trailer locations
GET  /safety/events                    - List safety events
GET  /safety/events/:id                - Get single event
GET  /safety/events/:id/camera-media   - Camera media URLs
GET  /hos/available-time               - HOS available time ⚠️ PERMISSION-GATED
GET  /hos/logs                         - HOS logs ⚠️ PERMISSION-GATED
GET  /hos/daily-logs                   - HOS daily logs ⚠️ PERMISSION-GATED
GET  /trips                            - Historical trips
GET  /devices                          - List devices
GET  /fault-codes                      - Fault code events
GET  /ifta/summary                     - IFTA summary
GET  /connections                      - List connections
GET  /connections/current              - Current connection
GET  /syncs                            - Sync history
GET  /syncs/:id                        - Sync status
GET  /issues                           - List issues
GET  /providers                        - List providers
```

### Write Operations (7 endpoints)
```
POST   /public-token/exchange          - Auth token exchange
PATCH  /connections/current            - Update connection settings
POST   /syncs                          - Request manual sync
POST   /syncs/:id/retry                - Retry failed sync
POST   /syncs/:id/cancel               - Cancel running sync
POST   /issues/:id/resolve             - Resolve issue
POST   /passthrough                    - Direct provider call ❌ BROKEN IN SANDBOX
```

---

*Document created: July 8, 2026*  
*Source: SaferFleetExpress ARCHITECTURE.md, SAFERFLEET_USER_GUIDE.md, API_CATALOG.md, DATA_SOURCE_AUDIT.md + Terminal Postman Collection*
