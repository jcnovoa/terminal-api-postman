# Terminal API Summary

**Generated**: 2026-02-09T21:23:59.174Z
**Total Categories**: 17
**Total Endpoints**: 34

---

## Authentication

**Endpoints**: 1

### Public Token Exchange

- **Method**: `POST`
- **Path**: `/public-token/exchange`
- **Description**: Exchange the `publicToken` returned by our hosted authentication flow for a long lived connection token that will be used when requesting data from a customer's TSP.

---

## Connections

**Endpoints**: 3

### List All Connections

- **Method**: `GET`
- **Path**: `/connections`
- **Description**: List all of the connections you have for your application. Connections represent the authenticated access you have to your customer's TSP data.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `externalId`: 
- `dotNumber`: 
- `tag` (required): Filter connections by tag
- `updatedAfter` (required): Filter connections that were last updated on or after a given time.
- `updatedBefore` (required): Filter connections that were last updated on or before a given time.
- `status` (required): Filter connections by status
- `provider` (required): Filter connections by provider

### Get Current Connection

- **Method**: `GET`
- **Path**: `/connections/current`
- **Description**: Get the details of the current active connection. The current connection is derived from the provided connection token.

### Update Current Connection

- **Method**: `PATCH`
- **Path**: `/connections/current`
- **Description**: Update the details of the current active connection. The current connection is derived from the provided connection token.

---

## Data Management

**Endpoints**: 6

### Request Sync

- **Method**: `POST`
- **Path**: `/syncs`
- **Description**: Manually request to sync the current connections data.

By default, Terminal will sync all connections where `syncMode = automatic` on a regular cadence. For customers that may not need a fleet's data to be kept up to date and want to reduce their active tracked trucks, you can set `syncMode = manual` and invoke this endpoint when you want to sync data.

If you're wondering if this is relevent to your use case then feel free to reach out and we'd be happy to assist.

### List Sync History

- **Method**: `GET`
- **Path**: `/syncs`
- **Description**: List a log of all batch sync jobs for the current connection.

**Query Parameters**:
- `limit`: The maximum number of results to return in a page.
- `cursor`: Pagination cursor to start requests from
- `status`: 
- `expand`: Expand related resources in the response to reduce requests.

### Get Sync Job Status

- **Method**: `GET`
- **Path**: `/syncs/:id`
- **Description**: Get the status of a sync job by ID.

**Query Parameters**:
- `expand`: Expand related resources in the response to reduce requests.

**Path Parameters**:
- `id`: [object Object]

### Retry Sync

- **Method**: `POST`
- **Path**: `/syncs/:id/retry`
- **Description**: Retry a failed sync job with the same parameters. This is useful for retrying syncs that failed due to temporary issues.

**Path Parameters**:
- `id`: [object Object]

### Cancel Sync

- **Method**: `POST`
- **Path**: `/syncs/:id/cancel`
- **Description**: Cancel a sync job mid-way through. This is useful for cancelling syncs that are no longer needed. Cancelled syncs will be marked as failed and can be retried.

**Path Parameters**:
- `id`: [object Object]

### Passthrough

- **Method**: `POST`
- **Path**: `/passthrough`
- **Description**: Make an authenticated request to the underlying telematics provider. 

This endpoint helps ensure that you are never limited by Terminal. You can use passthrough requests to access capabilities that may be limited to a specific TSP or not yet in the normalized model.

Our team is here and ready to support custom use cases that may need `/passthrough`.

---

## Drivers

**Endpoints**: 2

### List Drivers

- **Method**: `GET`
- **Path**: `/drivers`
- **Description**: List all of the drivers in the connected account

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `hidden` (required): Show hidden records that don't match the configured filters. Defaults to false.
- `deleted` (required): Show "soft-deleted" records that have been deleted from the provider. Defaults to false.
- `expand`: Expand resources in the returned response

### Get Driver

- **Method**: `GET`
- **Path**: `/drivers/:id`
- **Description**: Get the details of a specific driver

**Query Parameters**:
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `expand`: Expand resources in the returned response

**Path Parameters**:
- `id`: [object Object]

---

## Groups

**Endpoints**: 1

### List Groups

- **Method**: `GET`
- **Path**: `/groups`

**Query Parameters**:
- `limit`: The maximum number of results to return in a page.
- `cursor`: Pagination cursor to start requests from
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `deleted` (required): Show "soft-deleted" records that have been deleted from the provider. Defaults to false.

---

## Hours of Service

**Endpoints**: 3

### Available Time for Drivers

- **Method**: `GET`
- **Path**: `/hos/available-time`
- **Description**: List available time for the driver. This endpoint provides live access to the driver's available time. Different than most endpoints, this endpoint calls the provider's API in real time to get the latest available time for the driver. This endpoint is useful for building real time applications that need to know the driver's available time.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `driverIds`: Comma separated list of driver IDs to filter for. Can filter up to 50 drivers at a time.
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

### List HOS Logs

- **Method**: `GET`
- **Path**: `/hos/logs`
- **Description**: List all hours of service logs. HOS logs are tracked as the distinct changes in duty status.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `startedAfter`: Only include records of statuses that started after a provided date.
- `startedBefore`: Only include records of statuses that started before a provided date.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `driverIds`: Comma separated list of driver IDs to filter for. Can filter up to 50 drivers at a time.
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

### List HOS Daily Logs

- **Method**: `GET`
- **Path**: `/hos/daily-logs`
- **Description**: List daily summary of hours of service. Each daily log represents the time a driver spent in each duty status for a given day.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `startDate`: Include records from on or after a specific date. Defaults to beginning of history
- `endDate`: Include records from on or before a specific date. Defaults to now
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `driverIds`: Comma separated list of driver IDs to filter for. Can filter up to 50 drivers at a time.
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `expand`: Expand resources in the returned response

---

## IFTA

**Endpoints**: 1

### Get IFTA Summary

- **Method**: `GET`
- **Path**: `/ifta/summary`
- **Description**: Get all vehicle IFTA reports for the requested time span.

Currently can only increment by full months. 

_Note:_ data may change for a few days after the month. We will continue to update those reports to ensure you get accurate results.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `startMonth` (required): (Required) The month from which to start including vehicle reports
- `endMonth` (required): (Required) Include vehicle reports up to and including this month
- `groupBy` (required): Computes the total distance traversed within a specified month range, with the results grouped by either jurisdiction, vehicle, or both. If no grouping parameter is provided, the default grouping is `vehicle,jurisdiction`.

---

## Issues

**Endpoints**: 2

### List Issues

- **Method**: `GET`
- **Path**: `/issues`
- **Description**: List all issues that have been observed by Terminal.
Issues are generated when we observe something that may impact the completeness or accuracy of the data we provide but do not justify a full error.
For example, if we lack permissions for a specific resource or need to skip an item due to invalid data.

**Query Parameters**:
- `limit`: The maximum number of results to return in a page.
- `cursor`: Pagination cursor to start requests from
- `lastReportedAfter` (required): Timestamp to start when the issue was last observed
- `lastReportedBefore` (required): Timestamp to end when the issue was last observed
- `expand`: Expand related resources to see all details
- `connectionId`: Filter issues to a specific connection
- `errorCode` (required): Filter issues to a specific error code
- `status` (required): Filter issues to a specific status

### Resolve Issue

- **Method**: `POST`
- **Path**: `/issues/:issueId/resolve`
- **Description**: Mark an issue's status as `resolved` until the issue is observed again.

**Path Parameters**:
- `issueId`: [object Object]

---

## Providers

**Endpoints**: 1

### List Providers

- **Method**: `GET`
- **Path**: `/providers`
- **Description**: Retrieve a list of the providers Terminal supports. This endpoint will grow to include additional details about the supported capabilities of each provider.

---

## Safety

**Endpoints**: 3

### List Safety Events

- **Method**: `GET`
- **Path**: `/safety/events`
- **Description**: List all safety events detected by the provider.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `startedAfter`: Only include records of statuses that started after a provided date.
- `startedBefore`: Only include records of statuses that started before a provided date.
- `driverIds`: Comma separated list of driver IDs to filter for. Can filter up to 50 drivers at a time.
- `vehicleIds`: Comma separated list of vehicle IDs to filter for. Can filter up to 50 vehicles at a time.
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

### Get Safety Event

- **Method**: `GET`
- **Path**: `/safety/events/:id`
- **Description**: Get a safety event by id.

**Query Parameters**:
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

**Path Parameters**:
- `id`: [object Object]

### Get Event Camera Media

- **Method**: `GET`
- **Path**: `/safety/events/:id/camera-media`
- **Description**: Get camera media for a given safety event.

**Query Parameters**:
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

**Path Parameters**:
- `id`: [object Object]

---

## Trailers

**Endpoints**: 2

### List Trailers

- **Method**: `GET`
- **Path**: `/trailers`

**Query Parameters**:
- `limit`: The maximum number of results to return in a page.
- `cursor`: Pagination cursor to start requests from
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `deleted` (required): Show "soft-deleted" records that have been deleted from the provider. Defaults to false.

### Latest Trailer Locations

- **Method**: `GET`
- **Path**: `/trailers/locations`

**Query Parameters**:
- `limit`: The maximum number of results to return in a page.
- `cursor`: Pagination cursor to start requests from
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

---

## Vehicles

**Endpoints**: 5

### List Vehicles

- **Method**: `GET`
- **Path**: `/vehicles`
- **Description**: List all of the vehicles in the connected account

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `hidden` (required): Show hidden records that don't match the configured filters. Defaults to false.
- `deleted` (required): Show "soft-deleted" records that have been deleted from the provider. Defaults to false.
- `expand`: Expand resources in the returned response

### Get Vehicle

- **Method**: `GET`
- **Path**: `/vehicles/:id`
- **Description**: Get the details of a specific vehicle

**Query Parameters**:
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `expand`: Expand resources in the returned response

**Path Parameters**:
- `id`: [object Object]

### Latest Vehicle Locations

- **Method**: `GET`
- **Path**: `/vehicles/locations`
- **Description**: List the latest location of the vehicles in the connected account.
This endpoint will call the provider's API in real time to get the latest location of the vehicle. 
_Please note: this endpoint will exclude vehicles that have no last known location._

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `vehicleIds`: Comma separated list of vehicle IDs to filter for. Can filter up to 50 vehicles at a time.
- `driverIds`: Comma separated list of driver IDs to filter for. Can filter up to 50 drivers at a time.
- `expand`: Expand resources in the returned response

### Historical Vehicle Locations

- **Method**: `GET`
- **Path**: `/vehicles/:vehicleId/locations`
- **Description**: List the historical breadcrumb locations for a vehicle.

_Note:_

Given the large volume of location data available, we encourage customers to accept compressed (`gzip`) responses in order to maximize throughput. This is supported with many popular HTTP clients. Result limits vary depending on if results are compressed or not.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `startAt`: Timestamp to start from - defaults to beginning of history
- `endAt`: Timestamp to end at - defaults to now
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

**Path Parameters**:
- `vehicleId`: [object Object]

### Historical Vehicle Stats

- **Method**: `GET`
- **Path**: `/vehicles/:vehicleId/stats/historical`
- **Description**: List historical stats and logs about the vehicle.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `expand`: Expand resources in the returned response
- `startAt`: Timestamp to start from - defaults to beginning of history
- `endAt`: Timestamp to end at - defaults to now
- `types`: Comma separated list of vehicle stats to filter for
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

**Path Parameters**:
- `vehicleId`: [object Object]

---

## Vehicle Utilization

**Endpoints**: 1

### Get Vehicle Utilization

- **Method**: `GET`
- **Path**: `/vehicles/utilization`
- **Description**: Get vehicle utilization days containing information about fuel consumption, distance traveled, and operational time metrics.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `startDate`: Include records from on or after a specific date. Defaults to beginning of history
- `endDate`: Include records from on or before a specific date. Defaults to now
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `vehicleIds`: Comma separated list of vehicle IDs to filter for. Can filter up to 50 vehicles at a time.
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

---

## Webhook Events

**Endpoints**: 0

---

## Trips

**Endpoints**: 1

### List Historical Trips

- **Method**: `GET`
- **Path**: `/trips`
- **Description**: List all historical trips in the connected account. Trips define a period of time where a vehicle is in motion.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `startedAfter`: Only include trips that started after a provided date.
- `startedBefore`: Only include trips that started before a provided date.
- `endedAfter` (required): Only include trips that ended after a provided date.
- `endedBefore` (required): Only include trips that ended before a provided date.
- `driverIds`: Comma separated list of driver IDs to filter for. Can filter up to 50 drivers at a time.
- `vehicleIds`: Comma separated list of vehicle IDs to filter for. Can filter up to 50 vehicles at a time.
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `expand`: Expand resources in the returned response

---

## Devices

**Endpoints**: 1

### List Devices

- **Method**: `GET`
- **Path**: `/devices`
- **Description**: List all devices in the connected account.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.
- `deleted` (required): Show "soft-deleted" records that have been deleted from the provider. Defaults to false.
- `expand`: Expand resources in the returned response

---

## Fault Codes

**Endpoints**: 1

### List Fault Code Events

- **Method**: `GET`
- **Path**: `/fault-codes/events`
- **Description**: List all fault code events detected by the provider.

**Query Parameters**:
- `cursor`: Pagination cursor to start requests from
- `limit`: The maximum number of results to return in a page.
- `modifiedAfter`: Only include records that were last modified after a provided date.
- `modifiedBefore`: Only include records that were last modified before a provided date.
- `startAt`: Only include fault code events after a provided date.
- `endAt`: Only include fault code events before a provided date.
- `vehicleIds`: Comma separated list of vehicle IDs to filter for. Can filter up to 50 vehicles at a time.
- `expand`: Expand resources in the returned response
- `raw`: Include raw responses used to normalize model. Used for debugging or accessing unique properties that are not unified.

---

