# Power Automate Presentation Integration Guide

This guide explains how to integrate your Flight and Event Management app data into a PowerPoint presentation that's controlled by Power Automate.

## Overview

This solution allows you to:
- Pull real-time flight and event data from your MongoDB database
- Display this data as the last two slides in your presentation
- Automatically update the slides when your Power Automate workflow runs

## Integration Steps

### 1. For the Flights Slide:

1. In your Power Automate workflow, add an **HTTP action** before your presentation update:
   - Method: `GET`
   - URL: `https://your-app-url.com/api/presentation/flights`
   - No authentication required

2. Parse the JSON response:
   - Add a **Parse JSON** action after the HTTP request
   - Use the Body from the previous HTTP request
   - The schema will include: title, subtitle, tableHeaders, tableData, totalCount, updateTimestamp

3. Update your PowerPoint slide:
   - Use the **Update PowerPoint presentation** action
   - Map the fields from the Parse JSON output to your slide
   - For the table, use the tableHeaders for the header row and tableData for the data rows

### 2. For the Events Slide:

1. Add another **HTTP action**:
   - Method: `GET`
   - URL: `https://your-app-url.com/api/presentation/events`

2. Parse the JSON response:
   - Add another **Parse JSON** action
   - Use the Body from the events HTTP request
   - Similar schema to the flights data

3. Update your PowerPoint events slide:
   - Use the parsed data to populate your events slide

## Sample Power Automate Flow Configuration

```
Trigger (your existing trigger)
|
|--> [Existing steps in your workflow]
|
|--> HTTP - Get Flights Data
|     Method: GET
|     URI: https://your-app-url.com/api/presentation/flights
|
|--> Parse JSON - Flights Data
|     Content: Body from previous step
|
|--> HTTP - Get Events Data
|     Method: GET
|     URI: https://your-app-url.com/api/presentation/events
|
|--> Parse JSON - Events Data
|     Content: Body from previous step
|
|--> Update PowerPoint Presentation
     [Your existing slide update logic, with added mapping for the flights and events slides]
```

## API Response Format

### Flights Data Format:

```json
{
  "title": "Flight Schedule",
  "subtitle": "Updated: 2/27/2025, 11:45:29 PM",
  "tableHeaders": ["Time", "Name", "Type", "Flight #"],
  "tableData": [
    ["08:30", "JohnD", "PPL", "N12345"],
    ["10:15", "SarahM", "IFR", "N54321"],
    // More flight entries...
  ],
  "totalCount": 5,
  "updateTimestamp": "2025-02-27T23:45:29.000Z"
}
```

### Events Data Format:

```json
{
  "title": "Upcoming Events",
  "subtitle": "Updated: 2/27/2025, 11:45:29 PM",
  "tableHeaders": ["Date", "Time", "Description"],
  "tableData": [
    ["02/28", "09:00", "Meeting"],
    ["03/01", "14:30", "Workshop"],
    // More event entries...
  ],
  "totalCount": 5,
  "updateTimestamp": "2025-02-27T23:45:29.000Z"
}
```

## Using with Microsoft PowerPoint Online

1. The JSON data is formatted to be easily mapped to a table in PowerPoint
2. Use the Dynamic Content feature in Power Automate to map the JSON fields to your PowerPoint elements
3. For tables, you can use the "Create table" action in Power Automate

## Troubleshooting

If you encounter issues:

1. Check that your app is running and the API endpoints are accessible
2. Verify the data in your MongoDB database is correctly formatted
3. Check Power Automate run history for detailed error messages
4. Test the API endpoints directly using a tool like Postman to ensure they return the expected data format
