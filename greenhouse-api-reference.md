# Greenhouse API Reference Guide

This document contains all the API endpoints and data structures needed to build a job application interface with Greenhouse.

## Authentication

All requests require Basic Authentication with the API key as the username and an empty password.

```
Authorization: Basic ZjA2YjJiMTUzZTAxNmY4ZTdjMzYzMjYyN2FmNTZiMWQtNzo=
```

- API Key: `f06b2b153e016f8e7c3632627af56b1d-7`
- Base64 encoded: `ZjA2YjJiMTUzZTAxNmY4ZTdjMzYzMjYyN2FmNTZiMWQtNzo=`
- User ID (for On-Behalf-Of header): `4280249007`

## Endpoints

### 1. List All Jobs
**GET** `https://harvest.greenhouse.io/v1/jobs`

Returns an array of all jobs. Key fields for each job:

```json
{
  "id": 4063668007,
  "name": "Founding Full Stack Engineer",
  "requisition_id": "M49",
  "status": "open",
  "created_at": "2023-09-29T14:34:57.109Z",
  "opened_at": "2023-09-29T14:34:57.112Z",
  "departments": [
    {
      "id": 4024407007,
      "name": "Marketing"
    }
  ],
  "offices": [
    {
      "id": 4022637007,
      "name": "Sydney",
      "location": { "name": null }
    }
  ],
  "openings": [
    {
      "id": 4527220007,
      "status": "open",
      "opened_at": "2024-06-12T05:58:43.166Z"
    }
  ],
  "custom_fields": {
    "employment_type": "Contract",
    "salary_range": {
      "min_value": "150000.0",
      "max_value": "180000.0",
      "unit": "USD"
    }
  }
}
```

### 2. Get Specific Job
**GET** `https://harvest.greenhouse.io/v1/jobs/{id}`

Example: `https://harvest.greenhouse.io/v1/jobs/4285367007`

Returns detailed information about a specific job:

```json
{
  "id": 4285367007,
  "name": "Founding Engineer",
  "requisition_id": "4",
  "status": "open",
  "created_at": "2024-07-26T21:26:19.079Z",
  "departments": [
    {
      "id": 4024406007,
      "name": "IT"
    }
  ],
  "offices": [
    {
      "id": 4022635007,
      "name": "San Francisco"
    }
  ],
  "openings": [
    {
      "id": 4574004007,
      "opening_id": "4-1",
      "status": "open"
    }
  ],
  "custom_fields": {
    "salary_range": {
      "min_value": "10.0",
      "max_value": "20.0",
      "unit": "USD"
    }
  }
}
```

### 3. Create Candidate with Application
**POST** `https://harvest.greenhouse.io/v1/candidates`

Headers:
```
Authorization: Basic [base64_api_key]
Content-Type: application/json
On-Behalf-Of: 4280249007
```

Request Body:
```json
{
  "first_name": "Test",
  "last_name": "Candidate",
  "email_addresses": [
    {
      "value": "test.candidate@example.com",
      "type": "personal"
    }
  ],
  "phone_numbers": [
    {
      "value": "+1234567890",
      "type": "mobile"
    }
  ],
  "applications": [
    {
      "job_id": 4285367007
    }
  ],
  "attachments": [
    {
      "filename": "resume.pdf",
      "type": "resume",
      "content": "[base64_encoded_content]",
      "content_type": "application/pdf"
    }
  ]
}
```

Response includes:
- Candidate ID
- Application ID
- Current stage (usually "Application Review")
- All submitted information

### 4. Create Application for Existing Candidate
**POST** `https://harvest.greenhouse.io/v1/candidates/{candidate_id}/applications`

Request Body:
```json
{
  "job_id": 4285367007,
  "source_id": 7,
  "initial_stage_id": 2708728
}
```

## Data Models

### Job Object
- `id`: Unique identifier
- `name`: Job title
- `status`: "open" or "closed"
- `departments`: Array of department objects
- `offices`: Array of office locations
- `custom_fields`: Contains employment type and salary range
- `openings`: Array of job openings (check if status is "open")

### Candidate Object
- `id`: Unique identifier
- `first_name`, `last_name`: Required fields
- `email_addresses`: Array of email objects
- `phone_numbers`: Array of phone objects
- `applications`: Array of application IDs
- `attachments`: Array of attached documents

### Application Object
- `id`: Unique identifier
- `candidate_id`: Reference to candidate
- `applied_at`: Timestamp
- `status`: "active", etc.
- `current_stage`: Object with stage name
- `jobs`: Array of associated jobs

## Implementation Notes

1. **Job Listings Page**:
   - Use GET /v1/jobs to fetch all jobs
   - Filter by status === "open"
   - Display job name, department, office, and salary range

2. **Job Details Page**:
   - Use GET /v1/jobs/{id} for specific job
   - Show all available information
   - Include apply button linking to application form

3. **Application Form**:
   - Collect: first name, last name, email, phone, resume
   - Use job_id: 4285367007 (hardcoded)
   - Convert resume to base64 before submission

4. **Submission**:
   - POST to /v1/candidates with application data
   - Include On-Behalf-Of header with user ID 4280249007
   - Handle success/error responses appropriately

5. **Resume Upload**:
   - Accept PDF, DOCX, DOC, TXT formats
   - Convert to base64
   - Include in attachments array with proper content_type

## Error Handling

Common error responses:
- 401: Authentication failed (check API key)
- 422: Validation error (check required fields)
- 404: Resource not found (invalid job/candidate ID)

## Security Considerations

- Never expose API key in client-side code
- All API calls should be made from server-side
- Validate and sanitize all user inputs
- Use HTTPS for all communications