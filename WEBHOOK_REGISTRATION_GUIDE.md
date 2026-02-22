# Terminal Webhook Registration Guide

**Date**: February 21, 2026  
**Purpose**: Register webhook endpoint with Terminal to receive real-time events

---

## Prerequisites

- ✅ Webhook infrastructure deployed to AWS
- ✅ Webhook URL: `https://yge0ao3kba.execute-api.us-east-1.amazonaws.com/webhooks/terminal`
- ✅ Terminal account with Svix dashboard access

---

## Step 1: Access Svix Dashboard

1. Navigate to: https://app.svix.com/app_39lkx671XDarIEK58PJ3TUrfY5r/endpoints
2. Log in with Terminal credentials
3. You should see the "Endpoints" page

---

## Step 2: Create New Endpoint

1. Click **"+ Create Endpoint"** button (top right)
2. Fill in the form:

**Endpoint URL**:
```
https://yge0ao3kba.execute-api.us-east-1.amazonaws.com/webhooks/terminal
```

**Description** (optional):
```
FleetHub Terminal - Real-time event receiver
```

**Rate Limit** (optional):
```
Leave default or set to 1000 requests/second
```

3. Click **"Create"**

---

## Step 3: Subscribe to Event Types

After creating the endpoint, you'll see the endpoint details page.

1. Click **"Event Types"** tab
2. Click **"Add Event Types"** button
3. Select the following events:

### Vehicle Events
- ☑️ `vehicle.added` - New vehicle added to fleet
- ☑️ `vehicle.modified` - Vehicle data changed
- ☑️ `vehicle.removed` - Vehicle removed from fleet

### Driver Events
- ☑️ `driver.added` - New driver added
- ☑️ `driver.modified` - Driver data changed
- ☑️ `driver.removed` - Driver removed

### Safety Events
- ☑️ `safety_event.added` - New safety event (harsh braking, speeding, etc.)
- ☑️ `safety_event.modified` - Safety event updated

### Connection Events (Optional)
- ☑️ `connection.disconnected` - Connection lost
- ☑️ `connection.reconnected` - Connection restored

4. Click **"Save"**

---

## Step 4: Test Webhook

1. In the endpoint details page, click **"Testing"** tab
2. Select an event type (e.g., `vehicle.modified`)
3. Click **"Send Example"**
4. Verify the webhook receives the test event

**Check AWS CloudWatch Logs**:
```bash
aws logs tail /aws/lambda/fleethub-terminal-webhooks --follow --profile rii --region us-east-1
```

You should see:
```
Webhook received: {
  "id": "evt_...",
  "type": "vehicle.modified",
  "timestamp": "2026-02-21T...",
  "detail": { ... }
}
```

---

## Step 5: Verify Event Storage

Check if events are being stored in DynamoDB:

```bash
# Query vehicle events
aws dynamodb scan \
  --table-name fleethub-terminal-vehicle-events \
  --limit 10 \
  --profile rii \
  --region us-east-1

# Query safety events
aws dynamodb scan \
  --table-name fleethub-terminal-safety-events \
  --limit 10 \
  --profile rii \
  --region us-east-1
```

---

## Step 6: Monitor Webhook Deliveries

1. In Svix dashboard, go to **"Logs"** tab
2. You'll see all webhook deliveries:
   - ✅ Green = Success (200 response)
   - ❌ Red = Failed (non-200 response)
   - 🔄 Yellow = Retrying

3. Click on any delivery to see:
   - Request payload
   - Response status
   - Response body
   - Retry attempts

---

## Webhook Event Payload Format

All Terminal webhooks follow this structure:

```json
{
  "id": "evt_01GV12VR4DJP70GD1ZBK0SDWFH",
  "type": "vehicle.modified",
  "timestamp": "2021-01-06T03:24:53.000Z",
  "detail": {
    "connection": {
      "id": "conn_01KJ1958NH013MR143TH503G75",
      "provider": {
        "code": "verizon-fleet",
        "name": "Verizon Connect Fleet"
      }
    },
    "vehicle": {
      "id": "vcl_...",
      "sourceId": "...",
      "provider": "verizon-fleet",
      "vin": "...",
      "name": "...",
      "make": "...",
      "model": "...",
      "year": 2022,
      ...
    }
  }
}
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. **Check endpoint status** in Svix dashboard
   - Should show "Active" with green indicator
   - If disabled, click "Enable"

2. **Verify URL is correct**
   ```bash
   curl -X POST https://yge0ao3kba.execute-api.us-east-1.amazonaws.com/webhooks/terminal \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
   Should return: `{"received": true}`

3. **Check Lambda logs**
   ```bash
   aws logs tail /aws/lambda/fleethub-terminal-webhooks --follow --profile rii --region us-east-1
   ```

4. **Verify event subscriptions**
   - Go to endpoint → Event Types tab
   - Ensure events are checked

### Events Not Storing in DynamoDB

1. **Check Lambda permissions**
   ```bash
   aws iam get-role-policy \
     --role-name fleethub-terminal-webhooks-WebhookLambdaRole-... \
     --policy-name DynamoDBAccess \
     --profile rii
   ```

2. **Check DynamoDB table exists**
   ```bash
   aws dynamodb describe-table \
     --table-name fleethub-terminal-vehicle-events \
     --profile rii \
     --region us-east-1
   ```

3. **Check Lambda environment variables**
   ```bash
   aws lambda get-function-configuration \
     --function-name fleethub-terminal-webhooks \
     --profile rii \
     --region us-east-1 \
     --query 'Environment.Variables'
   ```

---

## Expected Webhook Frequency

Based on Terminal documentation and testing:

| Event Type | Frequency | Notes |
|------------|-----------|-------|
| `vehicle.modified` | ❓ Unknown | **TEST NEEDED** - Does this fire on GPS updates? |
| `safety_event.added` | Real-time | Fires when harsh driving event occurs |
| `driver.modified` | Rare | Only when driver data changes |
| `vehicle.added` | Rare | Only when new vehicle added |
| `connection.disconnected` | Rare | Only when connection lost |

**Critical Test**: Monitor `vehicle.modified` events to determine if they fire on GPS location updates (every 30-60 seconds) or only on metadata changes (rare).

---

## Next Steps After Registration

1. ✅ Register webhook in Svix dashboard
2. ✅ Subscribe to event types
3. ✅ Send test event
4. ⏳ Monitor for 24 hours to see actual event frequency
5. ⏳ Document which events fire and when
6. ⏳ Compare with VZC webhook behavior
7. ⏳ Update gap analysis with findings

---

## Comparison with VZC Webhooks

### VZC GPS Webhook
- **Frequency**: Every 30-60 seconds per vehicle
- **Payload**: GPS coordinates, speed, heading, address, driver
- **Storage**: DynamoDB with 30-day TTL
- **UI**: Real-time feed widget

### Terminal vehicle.modified Webhook
- **Frequency**: ❓ **TO BE DETERMINED**
- **Payload**: Vehicle metadata (VIN, name, make, model)
- **Storage**: DynamoDB with 90-day TTL
- **UI**: To be implemented after testing

**Key Question**: Does `vehicle.modified` include location data and fire on GPS updates?

---

## Webhook URLs

| Purpose | URL |
|---------|-----|
| **Receive Webhooks** | `https://yge0ao3kba.execute-api.us-east-1.amazonaws.com/webhooks/terminal` |
| **Query Vehicle Events** | `https://yge0ao3kba.execute-api.us-east-1.amazonaws.com/webhooks/events` |
| **Query Safety Events** | `https://yge0ao3kba.execute-api.us-east-1.amazonaws.com/webhooks/safety` |

---

## Security

Terminal webhooks use **Svix signature verification**. To verify webhook authenticity:

1. Get webhook signing secret from Svix dashboard
2. Verify `svix-signature` header
3. See: https://docs.svix.com/receiving/verifying-payloads/how

**Note**: Current Lambda does not verify signatures. Add verification for production:

```javascript
const { Webhook } = require('svix');

const wh = new Webhook(WEBHOOK_SECRET);
const payload = wh.verify(body, headers);
```

---

## Status

- ✅ Webhook infrastructure deployed
- ⏳ Webhook registered in Svix (manual step)
- ⏳ Events subscribed (manual step)
- ⏳ Testing in progress
- ⏳ Gap analysis pending results

