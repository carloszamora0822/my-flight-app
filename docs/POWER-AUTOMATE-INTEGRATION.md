# Power Automate Integration Guide

This document explains how to integrate Microsoft Power Automate with the Flight and Event Management application.

## Overview

The integration allows you to:
- Add new flights and events from Power Automate
- Automatically update the Vestaboard when data is added
- Keep the MongoDB database in sync with Power Automate workflows

## Setup Instructions

### 1. Configure API Key

First, set up a secure API key for Power Automate:

1. Add the following to your `.env.local` file:
   ```
   POWER_AUTOMATE_API_KEY=your-secure-api-key-here
   ```
   
2. Use a strong, unique key. This key will be used to authenticate Power Automate requests.

### 2. Create a Power Automate Flow

1. In Power Automate, create a new flow with your preferred trigger (e.g., when an item is created in SharePoint, when a form is submitted, or on a schedule).

2. Add an HTTP action with the following settings:
   - Method: POST
   - URL: `https://your-app-url.com/api/power-automate`
   - Headers:
     ```
     Content-Type: application/json
     x-api-key: your-secure-api-key-here
     ```
   - Body:
     ```json
     {
       "type": "flight", // or "event"
       "data": {
         // For flights:
         "time": "1230",
         "callsign": "DL123",
         "type": "PPL",  // optional, defaults to "PPL"
         "destination": "N32851"
         
         // For events:
         // "date": "02/28",
         // "time": "1230",
         // "description": "Meeting"
       }
     }
     ```

### 3. Test Your Flow

1. Run your Power Automate flow manually to test the integration.
2. Check the application and Vestaboard to confirm the data was added correctly.

## API Endpoint Specifications

### URL
`/api/power-automate`

### Method
`POST`

### Headers
- `Content-Type: application/json`
- `x-api-key: your-secure-api-key-here`

### Request Body

#### For Flights
```json
{
  "type": "flight",
  "data": {
    "time": "1230",     // 4-digit military time (required)
    "callsign": "DL123", // Up to 6 characters (required)
    "type": "PPL",      // Flight type (optional, defaults to "PPL")
    "destination": "N32851" // Up to 6 characters (required)
  }
}
```

#### For Events
```json
{
  "type": "event",
  "data": {
    "date": "02/28",   // 5-character date MM/DD (required)
    "time": "1230",    // 4-digit military time (required)
    "description": "Meeting" // Up to 10 characters (required)
  }
}
```

### Response

#### Success
```json
{
  "success": true,
  "message": "Flight/Event added successfully and Vestaboard updated",
  "flights/events": [/* array of all current flights/events */]
}
```

#### Error
```json
{
  "success": false,
  "message": "Error message description"
}
```

## Limitations

- The system maintains a maximum of 5 flights and 5 events
- Character limits:
  - Flight time: 4 characters
  - Flight callsign: 6 characters
  - Flight destination: 6 characters
  - Event date: 5 characters
  - Event time: 4 characters
  - Event description: 10 characters

## Troubleshooting

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify your API key is correctly set in both the environment variables and Power Automate
3. Ensure the data format matches the specifications exactly
4. Check your MongoDB connection is working properly
