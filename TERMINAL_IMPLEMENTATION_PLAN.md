# Terminal API Integration - Complete Implementation Plan

**Project**: FleetHub Terminal Integration  
**Purpose**: Unified telematics + driver safety platform integrating Terminal's multi-TSP API  
**Target Partners**: Verizon Connect (telematics) + SambaSafety (MVR/driver safety)  
**Last Updated**: February 9, 2026

---

## 🎯 Executive Summary

Terminal provides a **unified API** that connects to 30+ Telematics Service Providers (TSPs) including:
- **Verizon Connect** (fleet tracking, HOS, safety events)
- **Samsara** (cameras, sensors, compliance)
- **Geotab** (vehicle diagnostics, fuel)
- **Motive** (ELD, dashcams)
- And 26+ others

This integration will create **FleetHub** - a comprehensive dashboard that:
1. **Replaces Verizon Connect direct integration** with Terminal's unified API
2. **Adds SambaSafety MVR data** for complete driver risk profiles
3. **Supports multiple TSP connections** from a single interface
4. **Normalizes data** across different provider formats

---

## 📊 Terminal API Coverage Analysis

### Telematics Endpoints (Verizon Connect Replacement)

| Terminal API | Verizon Connect Equivalent | Priority |
|--------------|---------------------------|----------|
| **Drivers** | | |
| `GET /drivers` | `GET /cmd/v1/drivers` | HIGH |
| `GET /drivers/{id}` | `GET /cmd/v1/drivers/{drivernumber}` | HIGH |
| **Vehicles** | | |
| `GET /vehicles` | `GET /cmd/v1/vehicles` | HIGH |
| `GET /vehicles/{id}` | `GET /cmd/v1/vehicles/{vehiclenumber}` | HIGH |
| `GET /vehicles/locations/latest` | `POST /rad/v1/vehicles/locations` | HIGH |
| `GET /vehicles/locations/historical` | N/A (new capability) | MEDIUM |
| `GET /vehicles/stats/historical` | N/A (new capability) | MEDIUM |
| **Hours of Service** | | |
| `GET /hos/available-time` | `GET /logbook/v1/driver/{drivernumber}/statuscurrent` | HIGH |
| `GET /hos/logs` | N/A (new capability) | HIGH |
| `GET /hos/daily-logs` | N/A (new capability) | HIGH |
| **Safety** | | |
| `GET /safety/events` | `GET /da/v1/driversafety/{drivernumber}` | HIGH |
| `GET /safety/events/{id}` | N/A (new capability) | MEDIUM |
| `GET /safety/events/{id}/media` | `GET /video-events/{id}` | MEDIUM |
| **Groups** | | |
| `GET /groups` | `GET /cmd/v1/groups` | MEDIUM |
| **Trailers** | | |
| `GET /trailers` | N/A (new capability) | LOW |
| `GET /trailers/locations/latest` | N/A (new capability) | LOW |

### Driver Safety Endpoints (SambaSafety Integration)

| Terminal API | SambaSafety Equivalent | Integration Point |
|--------------|------------------------|-------------------|
| `GET /drivers` | `POST /people/v1/people/search` | Merge driver profiles |
| `GET /drivers/{id}` | `GET /people/v1/people/{personId}` | Enrich with MVR data |
| `GET /safety/events` | `GET /people/{personId}/mvr-reports` | Combine telematics + MVR |

### Unique Terminal Capabilities

| Feature | Description | Value |
|---------|-------------|-------|
| **Multi-TSP Support** | Single API for 30+ providers | Switch TSPs without code changes |
| **Data Sync Management** | Request/track data syncs | Control data freshness |
| **Webhook Events** | Real-time notifications | Proactive alerts |
| **IFTA Reporting** | Fuel tax calculations | Compliance automation |
| **Issues Management** | Track data quality issues | Data integrity |
| **Passthrough API** | Direct TSP API access | Fallback for custom needs |

---

## 🏗️ Architecture (Based on Existing Patterns)

### Infrastructure Stack (CarrierOK + Verizon Connect Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS CloudFormation                        │
│  (Single template - complete infrastructure as code)         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Route53    │───▶│   CloudFront     │───▶│      S3      │
│     DNS      │    │   Distribution   │    │Static Website│
│              │    │   + SSL/TLS      │    │   (React)    │
└──────────────┘    └──────────────────┘    └──────────────┘
                              │
                              │ API Calls
                              ▼
                    ┌──────────────────┐
                    │   API Gateway    │
                    │   (HTTP API)     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Lambda Proxy    │
                    │  (Node.js 18.x)  │
                    │                  │
                    │ • Authentication │
                    │ • CORS handling  │
                    │ • Error handling │
                    │ • Response cache │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Terminal API    │
                    │ api.terminal.co  │
                    └──────────────────┘
```

### Data Flow (SambaSafety Pattern)

```
User Request
    │
    ▼
React Dashboard
    │
    ├─▶ Terminal API (via Lambda)
    │   ├─▶ GET /drivers
    │   ├─▶ GET /vehicles/locations/latest
    │   ├─▶ GET /hos/available-time
    │   └─▶ GET /safety/events
    │
    └─▶ SambaSafety API (via Lambda)
        ├─▶ GET /people/{personId}/mvr-reports
        └─▶ GET /api/risk-assessment
    │
    ▼
Merged Data Response
    │
    ▼
Dashboard Display
```

---

## 📦 Phase 1: API Discovery & Parsing (Week 1)

### Objective
Parse Terminal Postman collection and generate comprehensive API documentation

### Tasks

#### 1.1 Create Postman Collection Parser
**File**: `scripts/parse-terminal-collection.js`

```javascript
// Parse Terminal Postman collection
// Extract: endpoints, methods, parameters, responses
// Generate: API catalog, endpoint list, request examples
```

**Deliverables**:
- `api-collection/parsed-collection.json` - Full API structure
- `api-collection/API_SUMMARY.md` - Human-readable summary
- `api-collection/endpoint-list.json` - Simple endpoint list
- `api-collection/verizon-connect-mapping.json` - VC → Terminal mapping
- `api-collection/sambasafety-integration.json` - SambaSafety merge points

#### 1.2 Identify Priority Endpoints
**Focus**: Endpoints that replace Verizon Connect + integrate with SambaSafety

**High Priority** (MVP):
- Authentication (Public Token Exchange)
- Connections (List/Get/Update)
- Drivers (List/Get)
- Vehicles (List/Get/Locations)
- HOS (Available Time, Logs)
- Safety Events (List/Get)

**Medium Priority** (Phase 2):
- Groups
- Trailers
- Vehicle Stats
- Safety Event Media
- IFTA

**Low Priority** (Phase 3):
- Webhook Events
- Data Sync Management
- Issues
- Passthrough

#### 1.3 Generate API Documentation
**Output**: `TERMINAL_API_CATALOG.md`

**Sections**:
- Authentication flow
- Connection management
- Endpoint reference (all 40+ endpoints)
- Request/response examples
- Error handling
- Rate limits
- Webhook events

**Estimated Time**: 8 hours

---

## 🔧 Phase 2: Backend API Proxy (Week 2)

### Objective
Build Node.js/Express Lambda proxy with Terminal API integration

### Architecture Pattern (SambaSafety + Verizon Connect)

**File Structure**:
```
lambda/
├── index.js                          # Lambda handler
├── terminal-api-proxy.js             # Main proxy logic
├── auth-endpoints.js                 # Public token exchange
├── connection-endpoints.js           # Connection management
├── driver-endpoints.js               # Driver operations
├── vehicle-endpoints.js              # Vehicle operations
├── hos-endpoints.js                  # Hours of Service
├── safety-endpoints.js               # Safety events
├── sambasafety-integration.js        # MVR data merge
└── package.json
```

### 2.1 Authentication Handler
**File**: `lambda/auth-endpoints.js`

**Endpoints**:
- `POST /auth/exchange` - Exchange public token for connection token
- `GET /auth/connections` - List all connections
- `GET /auth/connections/{id}` - Get specific connection

**Features**:
- Store connection tokens securely (environment variables)
- Auto-refresh expired tokens
- Support multiple connections (multi-TSP)

### 2.2 Core API Endpoints
**Pattern**: Same as SambaSafety implementation

**Features**:
- CORS handling (dual configuration: API Gateway + Lambda)
- Error handling with fallback
- Response caching (reduce API calls)
- Request logging (CloudWatch)
- Content-type detection (JSON/XML/binary)

### 2.3 SambaSafety Integration Layer
**File**: `lambda/sambasafety-integration.js`

**Purpose**: Merge Terminal driver data with SambaSafety MVR data

**Flow**:
```javascript
// 1. Get driver from Terminal
const terminalDriver = await getTerminalDriver(driverId);

// 2. Match to SambaSafety person (by license number or name)
const sambaPerson = await findSambaPersonByLicense(terminalDriver.licenseNumber);

// 3. Get MVR reports
const mvrReports = await getSambaMVRReports(sambaPerson.personId);

// 4. Merge data
return {
  ...terminalDriver,
  mvrData: mvrReports,
  riskScore: calculateRiskScore(terminalDriver, mvrReports),
  violations: mvrReports.violations,
  accidents: mvrReports.accidents
};
```

### 2.4 CloudFormation Template
**File**: `cloudformation/terminal-complete.yaml`

**Resources** (CarrierOK pattern):
- Lambda Function (Node.js 18.x, 512MB memory)
- API Gateway HTTP API (CORS-enabled)
- S3 Bucket (static website hosting)
- CloudFront Distribution (SSL/TLS)
- Route53 DNS Record
- IAM Role (Lambda execution)
- Secrets Manager (API keys - optional)

**Parameters**:
- `DomainName`: terminal.rhythminnovations.info
- `CertificateArn`: (wildcard cert)
- `HostedZoneName`: rhythminnovations.info
- `TerminalSecretKey`: (Terminal API secret key)
- `SambaApiKey`: (SambaSafety API key)

**Estimated Time**: 16 hours

---

## 🎨 Phase 3: React Dashboard (Week 3-4)

### Objective
Build comprehensive fleet management dashboard with Terminal + SambaSafety data

### 3.1 Project Setup (Verizon Connect Pattern)

**Tech Stack**:
- React 18.2
- TypeScript 5.3
- Vite 5.0
- Tailwind CSS 3.3
- Lucide React (icons)
- Recharts (data visualization)
- Leaflet (maps)

**File Structure**:
```
fleethub-terminal/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── ConnectionSelector.tsx      # NEW: Multi-TSP support
│   │   ├── DriverDirectory.tsx
│   │   ├── DriverDetailPanel.tsx
│   │   ├── MVRReportViewer.tsx         # From SambaSafety
│   │   ├── VehicleDirectory.tsx
│   │   ├── VehicleMap.tsx
│   │   ├── HOSCompliance.tsx
│   │   ├── SafetyEvents.tsx
│   │   ├── RiskAssessment.tsx          # From SambaSafety
│   │   └── AdminConsole.tsx            # From Verizon Connect
│   ├── services/
│   │   ├── terminalAPI.ts
│   │   ├── sambasafetyAPI.ts
│   │   └── dataIntegration.ts          # Merge logic
│   ├── types/
│   │   ├── terminal.ts
│   │   └── sambasafety.ts
│   └── App.tsx
├── public/
├── docs/                                # Documentation (auto-deployed)
├── package.json
└── vite.config.ts
```

### 3.2 Dashboard Overview

**Layout** (Verizon Connect pattern):
```
┌─────────────────────────────────────────────────────────┐
│  FleetHub Terminal                    [Connection: ▼]   │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐  │
│  │Dashboard│ Drivers │Vehicles │  HOS   │ Safety  │  │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘  │
├─────────────────────────────────────────────────────────┤
│  KPI Cards                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 825      │ │ 36       │ │ 92/100   │ │ 3        │ │
│  │ Drivers  │ │ Vehicles │ │ Safety   │ │ HOS      │ │
│  │          │ │          │ │ Score    │ │ Violations│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────┤
│  Live Fleet Map                    │  Recent Activity  │
│  ┌──────────────────────────────┐  │  ┌──────────────┐│
│  │                              │  │  │ Safety Event ││
│  │     [Interactive Map]        │  │  │ HOS Alert    ││
│  │                              │  │  │ MVR Update   ││
│  │                              │  │  └──────────────┘│
│  └──────────────────────────────┘  │                  │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Connection selector (switch between TSPs)
- Real-time metrics
- Live vehicle map
- Activity feed (Terminal + SambaSafety events)
- Quick actions

### 3.3 Driver Management (Enhanced with MVR)

**Layout** (SambaSafety pattern):
```
┌─────────────────────────────────────────────────────────┐
│  Drivers                              [Search: ____]    │
├─────────────────────────────────────────────────────────┤
│  Driver List (20/page)                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │ John Smith (#1234)          🟢 Green Risk          ││
│  │ CDL: A | HOS: 8.5h remaining | Last MVR: 30d ago   ││
│  ├─────────────────────────────────────────────────────┤│
│  │ Amanda Davis (#5678)        🔴 Red Risk            ││
│  │ CDL: B | HOS: 2.1h remaining | Last MVR: 7d ago    ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  Driver Detail Panel                                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Amanda Davis (#5678)                    [View MVR] ││
│  │ ┌─────────┬─────────┬─────────┬─────────┐         ││
│  │ │Terminal │   MVR   │  HOS    │ Safety  │         ││
│  │ └─────────┴─────────┴─────────┴─────────┘         ││
│  │                                                     ││
│  │ Terminal Data:                                      ││
│  │ • License: CA-D1234567                             ││
│  │ • Status: Active                                    ││
│  │ • Current Vehicle: Truck #42                       ││
│  │                                                     ││
│  │ SambaSafety MVR:                                    ││
│  │ • Risk Score: 7.2/10 (High)                        ││
│  │ • Violations: 3 (last 12 months)                   ││
│  │ • At-fault accidents: 1                            ││
│  │ • Recommendations: Weekly monitoring required      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Data Integration**:
```typescript
interface EnhancedDriver {
  // Terminal data
  id: string;
  name: string;
  licenseNumber: string;
  licenseState: string;
  status: 'active' | 'inactive';
  currentVehicle?: string;
  
  // SambaSafety data
  mvrData?: {
    personId: string;
    riskScore: number;
    violations: Violation[];
    accidents: Accident[];
    licenseStatus: string;
    lastMVRDate: string;
  };
  
  // Calculated fields
  combinedRiskScore: number;
  riskLevel: 'green' | 'yellow' | 'red';
}
```

### 3.4 Admin Console (Verizon Connect Pattern)

**Features**:
- Connection management (add/remove TSP connections)
- API playground (test Terminal endpoints)
- Token generation/refresh
- Webhook configuration
- Data sync management
- SambaSafety API testing

**Estimated Time**: 32 hours

---
