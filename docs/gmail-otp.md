# Gmail Self-Registration + OTP Verification

## Overview

Users self-register with a Gmail address. A 6-digit OTP is emailed (or echoed in DEV mode).
Only `@gmail.com` addresses are accepted — matching the student wellbeing scope.

## Flow

1. `POST /api/register` → validate email domain → hash OTP in Redis (TTL 10 min) → send email
2. `POST /api/verify-otp` → check hash → mark `email_verified=True` → return JWT
3. `POST /api/resend-otp` → cooldown 60s enforced → send new OTP

## DEV Mode

When `SMTP_HOST` is empty, OTP is logged to console and echoed in API response (`dev_otp` field).
Set `OTP_DEV_ECHO=false` in production.

## Security

- OTP stored as SHA-256 hash in Redis (never plaintext)
- Max 5 attempts before lockout
- Resend cooldown: 60 seconds
- TTL: 10 minutes
