# VZC Direct API vs Terminal API — Technical Gap Assessment

**Date**: July 8, 2026  
**Scope**: API-level parity only (VZC 75 endpoints vs Terminal 27 endpoints)  
**Focus**: What Terminal provides, what it doesn't, and where it's gated

---

## Summary

| | VZC Direct | Terminal |
|--|:----------:|:-------:|
| Total Endpoints | 75 | 27 |
| GET | 47 | 21 |
| POST | 13 | 6 |
| PUT | 7 | 0 |
| PATCH | 1 | 1 |
| DELETE | 7 | 0 |
| Entity CRUD | ✅ Full | ❌ None |
| Video Telematics | ✅ Full (search, playback, coaching) | ⚠️ Media URL only |
| HOS/ELD | ✅ Available | ❌ Permission-gated |
| DVIR/Inspections | ✅ Full | ❌ Not available |
| Geofences | ✅ 10 endpoints | ❌ Not available |
| Diagnostics (DTC) | ✅ 3 endpoints | ✅ 1 endpoint (fault-codes) |

---

## Category-by-Category Comparison

---

### 1. DRIVERS

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/cmd/v1/drivers` | GET | `GET /drivers` | ✅ Full |
| `/cmd/v1/drivers/{drivernumber}` | GET | `GET /drivers/:id` | ✅ Full |
| `/cmd/v1/drivers?driverId={id}` | GET | `GET /drivers/:id` | ✅ Full |
| `/cmd/v1/drivers/{drivernumber}/keys` | GET | — | ❌ Not available |
| `/cmd/v1/drivers` | POST | — | ❌ Read-only |
| `/cmd/v1/drivers/{drivernumber}/keys` | POST | — | ❌ Read-only |
| `/cmd/v1/drivers/{drivernumber}` | PUT | — | ❌ Read-only |
| `/cmd/v1/drivers/{drivernumber}` | DELETE | — | ❌ Read-only |
| `/cmd/v1/drivers/{drivernumber}/keys` | DELETE | — | ❌ Read-only |

**Terminal coverage: 3 of 9 (33%) — Read-only listing and detail**

---

### 2. VEHICLES

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/cmd/v1/vehicles` | GET | `GET /vehicles` | ✅ Full |
| `/cmd/v1/vehicles?vehiclenumber={num}` | GET | `GET /vehicles/:id` | ✅ Full |
| `/cmd/v1/vehicles?vehicleids={ids}` | GET | `GET /vehicles` (filter) | ⚠️ No multi-ID filter |
| `/cmd/v1/vehicles/group?groupid={id}` | GET | — (derive from vehicle.groups[]) | ⚠️ Client-side filter |
| `/cmd/v1/vehicles/{vehiclenumber}` | PUT | — | ❌ Read-only |
| `/cmd/v1/vehicles/{vehiclenumber}/odometer` | PUT | — | ❌ Read-only |
| `/cmd/v1/groups/vehicles/{vehiclenumber}` | PUT | — | ❌ Read-only |

**Terminal coverage: 2 of 7 (29%) — Read-only listing and detail**

---

### 3. REAL-TIME ASSET DATA (GPS, Status, Diagnostics)

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/rad/v1/vehicles/{id}/location` | GET | `GET /vehicles/locations` (bulk latest) | ✅ Available (bulk instead of per-vehicle) |
| `/rad/v1/vehicles/{id}/status` | GET | Included in `/vehicles/locations` | ⚠️ Partial (engineState only, no Moving/Idle/Stopped/Charging) |
| `/rad/v1/vehicles/{id}/status/history` | GET | `GET /vehicles/:id/stats/historical` | ⚠️ Different format |
| `/rad/v1/vehicles/{id}/segments` | GET | `GET /trips` | ⚠️ Different model (trips vs segments) |
| `/rad/v1/drivers/{id}/segments` | GET | `GET /trips?driverIds=` | ⚠️ Different model |
| `/rad/v1/vehicles/getvehiclesactivedtcs` | GET | `GET /fault-codes` | ✅ Available |
| `/rad/v1/vehicles/{id}/getdtchistorybyvehiclenumber` | GET | `GET /fault-codes` (filter) | ⚠️ Single endpoint covers both |
| `/rad/v1/vehicles/getvecmstatusbyvehiclenumber` | GET | — | ❌ Not available |
| `/rad/v1/vehicles/locations` | POST | `GET /vehicles/locations` | ✅ Terminal provides bulk by default |
| `/rad/v1/vehicles/statuses` | POST | `GET /vehicles/locations` | ⚠️ Partial (status embedded in location) |

**Terminal coverage: 5 of 10 (50%) — Good for location/GPS, weaker for status detail and diagnostics**

---

### 4. DRIVER ASSIGNMENT

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/da/v1/driverassignments/drivers/{id}/currentassignment` | GET | `vehicleLocations[].driver` field | ⚠️ Indirect (no dedicated endpoint) |
| `/da/v1/driverassignments/vehicles/{id}/currentassignment` | GET | `vehicleLocations[].driver` field | ⚠️ Indirect |
| `/da/v1/driverassignments` | POST | — | ❌ Read-only |
| `/da/v1/driverassignments` | DELETE | — | ❌ Read-only |

**Terminal coverage: 0 of 4 (0%) — Assignment info exists but only as a field on location, no dedicated endpoints, no CRUD**

---

### 5. DRIVER SAFETY

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/da/v1/driversafety/{id}?requesteddate=` | GET | `GET /safety/events` | ⚠️ Different model (global list vs per-driver) |
| `/da/v1/driversafety/{id}/counts?requesteddate=` | GET | — (client-side count) | ⚠️ Must calculate client-side |

**Terminal coverage: 1 of 2 (50%) — Events available but structured differently, no per-driver counts**

---

### 6. VIDEO TELEMATICS

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `POST /video/video-events/search` | POST | `GET /safety/events` | ❌ **No video search** — Terminal safety events lack video-specific filters (trigger type, classification, coaching status, date range filtering) |
| `GET /video/video-events/{id}?fields=media&embed=tracking,activities` | GET | `GET /safety/events/:id/camera-media` | ❌ **Partial** — Terminal returns media URLs only. No tracking data, no activities, no coaching status |
| `PATCH /video/video-events/{id}` (coaching status) | PATCH | — | ❌ Not available |
| `POST /video/video-events/{id}/activities` (notes) | POST | — | ❌ Not available |

**Terminal coverage: 0.5 of 4 (12%) — Can get a media URL for a known event. Cannot search, filter, get tracking data, or manage coaching.**

**Critical detail**: VZC video events include:
- `media.video[].url` (presigned S3 URLs per camera channel)
- `media.thumbnailUrl`, `media.animatedThumbnailUrl`
- `tracking[]` (GPS points with speed/heading per second)
- `activities[]` (coaching history)
- `classification` (MINOR/MODERATE/MAJOR/CRITICAL)
- `triggers[]` (harsh_brake, speed, distraction, etc.)
- `coachingStatus` (review_pending, coaching_needed, complete)

Terminal provides: `frontFacing.videoUrl`, `rearFacing.videoUrl` — that's it.

---

### 7. LOGBOOK / HOS / ELD

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/logbook/v1/driver/{id}/statuscurrent` | GET | `GET /hos/available-time` | ❌ **Permission-gated** (requires `hos:read`) |
| `/logbook/v1/driver/{id}/` (logs) | GET | `GET /hos/logs` | ❌ **Permission-gated** |
| — | — | `GET /hos/daily-logs` | ❌ **Permission-gated** |

**Terminal coverage: 0 of 2 (0%) — All HOS endpoints require `hos:read` permission not included in sandbox. Cannot validate.**

**What VZC provides** (confirmed working in SaferFleetExpress):
- Current driver status (Driving, On-Duty, Off-Duty, Sleeper)
- `TimeRemaining.DailyDrivingMinutes`
- `TimeRemaining.ShiftOnDutyMinutes`
- `TimeRemaining.CycleDutyMinutes`
- `StatusStartDate`

---

### 8. USER MANAGEMENT

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/cmd/v1/users` | GET | — | ❌ Not available |
| `/cmd/v1/users?userId={id}` | GET | — | ❌ Not available |
| `/cmd/v1/users/{userid}` | GET | — | ❌ Not available |
| `/cmd/v1/users` | POST | — | ❌ Not available |
| `/cmd/v1/users/{userid}` | PUT | — | ❌ Not available |

**Terminal coverage: 0 of 5 (0%) — No user management whatsoever**

---

### 9. GROUP MANAGEMENT

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/cmd/v1/groups` | GET | `GET /groups` | ✅ Full |
| `/cmd/v1/groups/{groupid}` | GET | — (filter from list) | ⚠️ No individual get |
| `/cmd/v1/groups/drivers/{drivernumber}` | GET | `driver.groups[]` field | ⚠️ Indirect |
| `/cmd/v1/groups/vehicles/{vehiclenumber}` | GET | `vehicle.groups[]` field | ⚠️ Indirect |
| `/cmd/v1/groups/users/{employeeid}` | GET | — | ❌ Not available |
| `/cmd/v1/groups/{id}/drivers` | POST | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/vehicles` | POST | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/users` | POST | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/geofences` | POST | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/drivers/` | DELETE | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/vehicles/` | DELETE | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/users/` | DELETE | — | ❌ Read-only |
| `/cmd/v1/groups/{id}/geofences/` | DELETE | — | ❌ Read-only |

**Terminal coverage: 1 of 13 (8%) — Can list groups. Membership info is indirect (embedded in entity). Zero CRUD.**

---

### 10. FLEET INSPECTIONS / DVIR

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/inspections/reports` | GET | — | ❌ Not available |
| `/inspections/reports/{id}` | GET | — | ❌ Not available |
| `/inspections/defects` | GET | — | ❌ Not available |
| `/inspections/templates` | GET | — | ❌ Not available |
| `/inspections/reports` | POST | — | ❌ Not available |
| `/inspections/defects/{id}` | PATCH | — | ❌ Not available |

**Terminal coverage: 0 of 6 (0%) — No DVIR/inspection support at all**

---

### 11. GEOFENCES

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| All 10 geofence endpoints | GET/POST/PUT | — | ❌ Not available |

**Terminal coverage: 0 of 10 (0%)**

---

### 12. NON-POWERED ASSETS

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/AST/v1/assets/{assetnumber}` | GET | `GET /trailers` | ⚠️ Different model (trailers only) |
| `/AST/v1/assets/{assetnumber}/location` | GET | `GET /trailers/locations` | ✅ Available |
| `/AST/v1/assets/group/{groupid}` | GET | — | ❌ Not available |
| `/AST/v1/groups/assets/{assetnumber}` | GET | — | ❌ Not available |
| `/AST/v1/assets/locations` | POST | `GET /trailers/locations` | ✅ Terminal does bulk by default |
| `/AST/v1/groups/{id}/assets/{id}` | POST | — | ❌ Read-only |
| `/AST/v1/assets/{assetnumber}` | PUT | — | ❌ Read-only |

**Terminal coverage: 2 of 7 (29%) — Can list trailers and locations. No group assignment, no update.**

---

### 13. AUTHENTICATION

| VZC Endpoint | Method | Terminal Equivalent | Parity |
|--------------|--------|---------------------|--------|
| `/token/` (Basic Auth → Bearer) | GET | `POST /public-token/exchange` | ✅ Different mechanism but same outcome |

**Terminal coverage: 1 of 1 (100%)**

---

## Terminal-Exclusive Endpoints (Not in VZC Direct)

Terminal provides some capabilities that don't map to VZC direct endpoints:

| Terminal Endpoint | Purpose | Value |
|-------------------|---------|-------|
| `GET /connections` | List TSP connections | Multi-TSP management |
| `GET /connections/current` | Current connection details | — |
| `PATCH /connections/current` | Update connection settings | Filter entities, pause sync |
| `POST /syncs` | Trigger manual data sync | Force refresh |
| `POST /syncs/:id/retry` | Retry failed sync | Error recovery |
| `POST /syncs/:id/cancel` | Cancel running sync | Control |
| `GET /syncs`, `GET /syncs/:id` | Sync history/status | Observability |
| `GET /issues` | Connection issues | Monitoring |
| `POST /issues/:id/resolve` | Resolve issues | Issue management |
| `GET /providers` | List available TSPs | Discovery |
| `GET /devices` | Device inventory | Not in VZC standard API |
| `GET /ifta/summary` | IFTA fuel tax reporting | Not in VZC Reveal API |
| `GET /vehicles/utilization` | Utilization metrics | Not in VZC (⚠️ permission-gated) |
| `GET /vehicles/:id/stats/historical` | Historical stats | Richer than VZC segments |
| `POST /passthrough` | Raw provider API call | ❌ Broken in sandbox |

---

## Consolidated Scoring

| VZC Category | VZC Endpoints | Terminal Covers | % | Notes |
|--------------|:-------------:|:--------------:|:-:|-------|
| Drivers (Read) | 4 | 3 | 75% | Missing keys |
| Drivers (Write) | 5 | 0 | 0% | — |
| Vehicles (Read) | 4 | 2 | 50% | — |
| Vehicles (Write) | 3 | 0 | 0% | — |
| Real-time/GPS | 10 | 5 | 50% | Bulk locations good; status/diagnostics partial |
| Driver Assignment | 4 | 0 | 0% | Indirect only |
| Driver Safety | 2 | 1 | 50% | Different model |
| Video Telematics | 4 | 0.5 | 12% | Media URL only |
| HOS/ELD | 2 | 0 | 0% | Permission-gated |
| Users | 5 | 0 | 0% | Not available |
| Groups (Read) | 5 | 1 | 20% | List only |
| Groups (Write) | 8 | 0 | 0% | — |
| Inspections/DVIR | 6 | 0 | 0% | Not available |
| Geofences | 10 | 0 | 0% | Not available |
| Non-Powered Assets | 7 | 2 | 29% | Trailers only |
| Authentication | 1 | 1 | 100% | — |
| **TOTAL** | **75** | **15.5** | **21%** | — |

---

## Historical Data Comparison

| Capability | VZC Direct | Terminal | Notes |
|-----------|-----------|---------|-------|
| GPS history | Via webhooks (DynamoDB, 30-day retention) | `GET /vehicles/:id/locations?startAt=&endAt=` | Terminal has endpoint; sandbox only returned 3 days. Docs say "defaults to beginning of history" |
| Trip history | `/rad/v1/vehicles/{id}/segments` | `GET /trips?startedAfter=&startedBefore=` | Terminal has it; sandbox returned 0 results |
| Status history | `/rad/v1/vehicles/{id}/status/history` | `GET /vehicles/:id/stats/historical?startAt=&endAt=` | Available, different format |
| HOS logs | `/logbook/v1/driver/{id}/` | `GET /hos/logs?startedAfter=&startedBefore=` | ❌ Permission-gated |
| Safety event history | `POST /video/video-events/search` (date range) | `GET /safety/events` (no date filter in Postman) | ⚠️ Terminal safety events may support modifiedAfter but no date range search |
| IFTA (fuel tax) | Not in VZC Reveal | `GET /ifta/summary?startMonth=&endMonth=` | Terminal advantage |

**Retention**: Terminal documentation doesn't specify a hard limit. Actual retention depends on what the TSP provides. In sandbox, only ~3 days was available.

---

## Key Takeaways

### What Terminal does well (like-for-like):
1. **Bulk vehicle locations** — one call gets all vehicles (VZC requires per-vehicle calls)
2. **Normalized data model** — consistent schema regardless of TSP
3. **Fault codes** — available (VZC has it too)
4. **Trailers** — basic list and locations
5. **Historical GPS** — endpoint exists with date filtering
6. **Trips** — historical trips endpoint
7. **IFTA** — fuel tax summary (not in VZC Reveal API)
8. **Connection management** — unique to Terminal (sync, issues, filters)

### What Terminal cannot do:
1. **Any write operation** — no create, update, or delete for any entity
2. **Video telematics** — no search, no playback, no tracking data, no coaching
3. **HOS/ELD** — permission-gated, untestable
4. **DVIR inspections** — completely absent
5. **User management** — completely absent
6. **Geofences** — completely absent
7. **Driver assignments** — no dedicated endpoint, no CRUD
8. **Group management** — list only, no membership CRUD
9. **Vehicle diagnostics (ECM)** — absent

### Permission-gated (unknown):
1. `hos:read` — blocks all HOS endpoints
2. `vehicle-utilization:read` — blocks utilization endpoint

---

## Verdict

**Terminal API provides 21% functional coverage** of VZC's 75-endpoint API surface.

That 21% is exclusively **read-only monitoring**. For a platform like SaferFleetExpress that requires video search/playback, coaching workflows, DVIR compliance, ELD data, and eventually entity CRUD — Terminal cannot serve as the sole integration layer.

---

*Document: VZC_VS_TERMINAL_API_GAP_ASSESSMENT.md*  
*Created: July 8, 2026*
