# Remaining Work to Match VZC

## 1. Map - Replace placeholder with real Leaflet map
**Status**: Component created, needs integration
**File**: `src/components/VehicleMap.tsx` ✅ Created
**TODO**: Import and use in App.tsx map tab

## 2. API Playground - Full implementation like VZC
**VZC Features**:
- Method selector (GET/POST/PUT/DELETE)
- Endpoint dropdown with all available endpoints
- Dynamic parameter inputs (drivernumber, vehiclenumber, date)
- Request body textarea for POST/PUT
- Response display with JSON formatting
- cURL command generator
- Request URL preview

**Current**: Basic placeholder
**TODO**: Copy exact implementation from VZC Admin Console

## 3. Credential Storage - Session-based like VZC
**VZC Approach**:
- Stores credentials in sessionStorage
- No hardcoded keys in UI
- User enters Terminal secret key
- Key used for API playground testing

**Current**: Hardcoded in backend Lambda
**TODO**: Add credential input form in Admin Console

---

## Quick Fix Plan

1. Update map tab to use `<VehicleMap />` component
2. Copy API Playground JSX from VZC (lines 780-890)
3. Add Terminal credential storage (secret key input)
4. Update API playground to call Terminal endpoints

Should I proceed with these changes now?
