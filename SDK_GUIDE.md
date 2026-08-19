# EvidCheck Developer SDK Guide

Welcome to the EvidCheck Developer Program. This guide provides the technical specifications required to integrate EvidCheck's identity and compliance verification engine directly into your own applications via our REST API.

---

## 1. Quick Start

### Authentication
All requests to the EvidCheck REST API must be authenticated using your Secret API Key in the `x-api-key` header.

```bash
curl -X POST https://api.evidcheck.com/v1/verifications \
  -H "x-api-key: evid_live_sk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "business_registration",
    "entityData": {
      "companyNumber": "PVT-2022/94821",
      "country": "KE"
    }
  }'
```

---

## 2. API Environments

EvidCheck enforces strict key environment separation:

| Environment | Base URL | Supported Key Prefix |
| :--- | :--- | :--- |
| **Production** | `https://api.evidcheck.com/v1/verifications` | `evid_live_sk_*` |
| **Sandbox** | `https://sandbox.evidcheck.com/v1/sandbox/verifications` | `evid_test_sk_*` |

---

## 3. Webhook Integration

EvidCheck can send real-time POST notifications to your server when a verification changes status.

### Event Payload Example

```json
{
  "event": "verification.completed",
  "jobId": "job_9482014829",
  "serviceType": "business_registration",
  "resultStatus": "approved",
  "data": {
    "companyName": "TERVIO ANALYTICS LIMITED",
    "registrationNumber": "PVT-2022/94821",
    "status": "ACTIVE"
  },
  "timestamp": "2026-08-19T13:45:00Z"
}
```

---

## 4. Official SDK Libraries

### Node.js (JavaScript / TypeScript)

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.evidcheck.com/v1',
  headers: {
    'x-api-key': process.env.EVIDCHECK_API_KEY,
    'Content-Type': 'application/json'
  }
});

async function verifyCompany(companyNumber) {
  const response = await client.post('/verifications', {
    serviceType: 'business_registration',
    entityData: { companyNumber, country: 'KE' }
  });
  return response.data;
}
```

### Python

```python
import requests
import os

BASE_URL = "https://api.evidcheck.com/v1"
API_KEY = os.getenv("EVIDCHECK_API_KEY")

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def verify_id(id_number):
    payload = {
        "serviceType": "national_id",
        "entityData": {"idNumber": id_number, "country": "KE"}
    }
    response = requests.post(f"{BASE_URL}/verifications", json=payload, headers=headers)
    return response.json()
```
