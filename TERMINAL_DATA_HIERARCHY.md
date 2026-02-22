# Terminal API Data Hierarchy

**Source**: Terminal API Documentation + API Response Analysis  
**Date**: February 22, 2026

---

## Entity Relationships

### Core Entities
Terminal has three main entities:
1. **Vehicle** (`vcl_*`) - Trucks, vans, cars, motorized assets
2. **Driver** (`drv_*`) - Individuals who operate vehicles
3. **Trailer** (`trl_*`) - Non-motorized assets (trailers, equipment)

### Group Entity
**Group** (`group_*`) - A collection of assets (vehicles, trailers, drivers) defined by the provider

---

## Hierarchy Structure

```
Group
├── Drivers (many-to-many)
│   └── driver.groups: ["group_01KJ...", "group_01KJ..."]
│
└── Vehicles (many-to-many)
    └── vehicle.groups: ["group_01KJ...", "group_01KJ..."]

Vehicle
└── Current Driver (one-to-one, temporary)
    └── vehicleLocation.driver: "drv_01KJ..."

Trailer
└── (No direct relationships in API)
```

---

## Detailed Relationships

### 1. Groups → Drivers (Many-to-Many)
**Direction**: Drivers belong to Groups  
**Field**: `driver.groups` (array of group IDs)

**Example**:
```json
{
  "id": "drv_01KJ195EBAWG5Y1CXDTF52NM52",
  "firstName": "Harold",
  "lastName": "Johnson",
  "groups": [
    "group_01KJ195CDW4HTWGDP5G55CR4H6"
  ]
}
```

**Drill-down**: Click Group → Show all Drivers in that group

---

### 2. Groups → Vehicles (Many-to-Many)
**Direction**: Vehicles belong to Groups  
**Field**: `vehicle.groups` (array of group IDs)

**Example**:
```json
{
  "id": "vcl_01KJ195EB2E309FSTDY4R63YTN",
  "name": "Truck 1",
  "groups": [
    "group_01KJ195CDXZGDM6ZR7E4YNBNQQ",
    "group_01KJ195CDX9N0K8EPPNKNV8N96"
  ]
}
```

**Drill-down**: Click Group → Show all Vehicles in that group

---

### 3. Vehicles → Drivers (One-to-One, Temporary)
**Direction**: Vehicle has current driver assignment  
**Field**: `vehicleLocation.driver` (driver ID)

**Example**:
```json
{
  "vehicle": "vcl_01KJ195EB2E309FSTDY4R63YTN",
  "driver": "drv_01KJ195EBG6KYJEJRHVGQJ4JDF",
  "location": { "latitude": 45.35477372, "longitude": -75.75579012 }
}
```

**Drill-down**: Click Vehicle → Show current driver (if assigned)

---

### 4. Trailers (No Direct Relationships)
**Status**: Trailers are standalone entities in Terminal API  
**No Fields**: No `groups`, `driver`, or `vehicle` fields

**Example**:
```json
{
  "id": "trl_01KJ195CE1A1HKVCNTDS9FMRY2",
  "name": "Trailer #10101",
  "make": "Utility Trailer",
  "model": "4000D-X Composite TBR",
  "vin": "2HGCM82633A004856"
}
```

**Note**: Some TSPs may track trailer-vehicle assignments, but Terminal API doesn't expose this relationship in the current implementation.

---

## Navigation Patterns

### Pattern 1: Group → Drivers
```
Groups Tab → Click "Longueuil Terminal" → Drivers Tab (filtered)
Shows: All drivers where driver.groups includes clicked group ID
```

### Pattern 2: Group → Vehicles
```
Groups Tab → Click "Longueuil Terminal" → Vehicles Tab (filtered)
Shows: All vehicles where vehicle.groups includes clicked group ID
```

### Pattern 3: Vehicle → Driver
```
Vehicles Tab → Click "Truck 1" → Shows current driver assignment
Uses: vehicleLocation.driver to find current driver
```

### Pattern 4: Trailer (Standalone)
```
Assets Tab → Click "Trailer #10101" → No drill-down available
Reason: No relationships exposed in Terminal API
```

---

## Implementation Strategy

### Groups Table
Add "View Members" action that shows:
1. **Option 1**: Navigate to Drivers tab filtered by group
2. **Option 2**: Navigate to Vehicles tab filtered by group
3. **Option 3**: Show modal with both drivers and vehicles

**Recommended**: Option 3 (modal) - matches VZC pattern

### Assets/Trailers Table
**No drill-down needed** - trailers are standalone entities with no relationships

---

## API Response Examples

### Driver with Groups
```json
{
  "id": "drv_01KJ195EBAWG5Y1CXDTF52NM52",
  "firstName": "Harold",
  "lastName": "Johnson",
  "groups": ["group_01KJ195CDW4HTWGDP5G55CR4H6"],
  "license": { "number": "Z0RC6F7H7", "state": "AK" }
}
```

### Vehicle with Groups
```json
{
  "id": "vcl_01KJ195EB2E309FSTDY4R63YTN",
  "name": "Truck 1",
  "groups": [
    "group_01KJ195CDXZGDM6ZR7E4YNBNQQ",
    "group_01KJ195CDX9N0K8EPPNKNV8N96"
  ],
  "make": "PETERBILT",
  "model": "579"
}
```

### Vehicle Location with Driver
```json
{
  "vehicle": "vcl_01KJ195EB2E309FSTDY4R63YTN",
  "driver": "drv_01KJ195EBG6KYJEJRHVGQJ4JDF",
  "location": { "latitude": 45.35477372, "longitude": -75.75579012 }
}
```

### Group
```json
{
  "id": "group_01KJ195CDW2A1FMEHQKWPKTMXW",
  "name": "Longueuil Terminal",
  "sourceId": "6f64c99a39a046bcf95a9bd45e0f22f9",
  "provider": "verizon-fleet"
}
```

### Trailer (No Relationships)
```json
{
  "id": "trl_01KJ195CE1A1HKVCNTDS9FMRY2",
  "name": "Trailer #10101",
  "make": "Utility Trailer",
  "model": "4000D-X Composite TBR"
}
```

---

## Summary

**Groups contain**:
- ✅ Drivers (via `driver.groups[]`)
- ✅ Vehicles (via `vehicle.groups[]`)

**Vehicles have**:
- ✅ Current driver assignment (via `vehicleLocation.driver`)
- ✅ Group memberships (via `vehicle.groups[]`)

**Drivers have**:
- ✅ Group memberships (via `driver.groups[]`)

**Trailers have**:
- ❌ No relationships exposed in Terminal API

---

## References

- [Terminal API - Group Model](https://docs.withterminal.com/models/group)
- [Terminal API - Entity Status & Visibility](https://docs.withterminal.com/advanced/entity-status-visibility)
- [Terminal API - Vehicle Model](https://docs.withterminal.com/models/vehicle)
