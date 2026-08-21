# ID Card Attendance and Student Tracking System Design

## 1. Goal

Build a school ID card platform for government schools that supports student registration, attendance tracking, live status updates, parent notifications, and automated reports.

(student registration per school, indicator for hardware specific databases)
starting point should be student registration and attendance tracking. 
general users table. that way it's easy to transfer from one school to another.
role based architecture, student, teache

The system must support many schools, thousands of students, ID card readers such as Raspberry Pi devices, and near real-time updates for school admins.

## 2. Core Assumptions

- Each student has one active ID card with a unique card ID.
- A card scan from a reader represents a student event at a known school location, such as gate, classroom, bus point, or hostel.
- If the hardware supports GPS, recent coordinates may be sent to the backend, but full coordinate history is not stored permanently.
- Parents or guardians receive SMS notifications for attendance events, alerts, and reports.
- School admins can configure attendance rules, sign-in windows, sign-out windows, and alert behavior.

## 3. Main Users

- **Super Admin:** Manages schools, global settings, billing or deployment configuration.
- **School Admin:** Manages students, cards, devices, attendance windows, notifications, and reports for one school.
- **Reader Device:** Raspberry Pi or ID card reader that sends scan/location events to the backend.
- **Parent/Guardian:** Receives SMS alerts and reports.

## 4. High-Level Architecture

```text
ID Card Reader / Raspberry Pi
        |
        | HTTPS / MQTT
        v
Backend API  <---->  Database
        |
        | WebSocket / Server-Sent Events
        v
Admin Dashboard
        |
        v
SMS Provider
```

Recommended services:

- **Backend API:** Handles auth, schools, students, cards, devices, attendance events, live status, reports, and notifications.
- **Database:** Stores schools, admins, students, cards, guardians, devices, attendance logs, reports, and notification logs.
- **In-memory cache/queue:** Stores live status and last 3-5 coordinates per student/device, using Redis or similar.
- **Background workers:** Send SMS, generate reports, detect missed sign-in/sign-out events, and process scheduled jobs.
- **Realtime gateway:** Pushes live student status updates to the admin dashboard.

## 5. Data Model

Core tables:

- `schools`: school name, address, contact info, status.
- `users`: admin accounts, role, school ID, password hash, status.
- `students`: school ID, name, class, admission number, status, metadata.
- `guardians`: student ID, name, phone number, relationship, notification preference.
- `id_cards`: card UID, student ID, school ID, active status, issued date, revoked date.
- `devices`: device ID, school ID, location name, device secret/public key, status.
- `attendance_events`: student ID, card ID, device ID, event type, timestamp, reader location.
- `attendance_rules`: school ID, sign-in window, sign-out window, late threshold, absent threshold.
- `notification_logs`: student ID, guardian ID, channel, message type, delivery status, timestamp.
- `reports`: student ID, report type, generated file or content reference, sent status, period.

Live-only data:

- `student_live_status`: latest known state per student, stored in cache.
- `recent_coordinates`: queue/list of last 3-5 coordinates per student or device, stored in cache with expiry.

## 6. Key Workflows

### Student and Card Registration

1. School admin creates or imports student records.
2. Parent or guardian contact information is added.
3. Admin assigns a unique ID card UID to the student.
4. Backend validates that the card UID is not already active.
5. Card becomes usable by registered reader devices.

### Card Scan / Attendance Event

1. Reader scans card.
2. Reader sends event to backend with card UID, device ID, timestamp, and optional coordinates.
3. Backend authenticates the device.
4. Backend resolves the card to a student.
5. Backend stores the attendance event.
6. Backend updates the student's live status in cache.
7. Backend pushes update to the admin dashboard.
8. Backend queues SMS notification if the event matches notification rules.

### Live Whereabouts

The admin dashboard subscribes to realtime updates for the school. Each student can show:

- Current attendance state: signed in, signed out, late, absent, unknown.
- Last scanned location.
- Last event time.
- Optional last 3-5 coordinates if GPS is available.

### Automatic Alerts

Background workers check configured school attendance windows.

Examples:

- If no sign-in event is received by the absent threshold, mark student absent and notify guardian.
- If a student signs in after the late threshold, mark late and notify guardian if enabled.
- If a student does not sign out by the configured time, trigger an alert for admins and optionally parents.

### Manual SMS From Dashboard

1. Admin selects a student, class, or group.
2. Admin writes or selects a message template.
3. Backend validates permissions and queues SMS jobs.
4. SMS delivery status is stored in notification logs.

### Automated Reports

Reports can be generated daily, weekly, or monthly.

Report contents may include:

- Attendance summary.
- Late arrivals.
- Absences.
- Sign-in/sign-out times.
- Last known school reader locations.

Reports are generated by background workers and sent to guardians by SMS link, email, or downloadable dashboard file.

## 7. API Surface

Suggested endpoint groups:

- `POST /auth/login`
- `POST /schools`
- `POST /students`
- `GET /students`
- `POST /students/import`
- `POST /cards/assign`
- `POST /cards/revoke`
- `POST /devices/register`
- `POST /device-events/scan`
- `POST /device-events/location`
- `GET /attendance/events`
- `GET /attendance/live`
- `POST /notifications/sms`
- `GET /reports`
- `POST /reports/generate`
- `GET /settings/attendance-rules`
- `PUT /settings/attendance-rules`

Device endpoints should use device authentication, rate limiting, replay protection, and idempotency keys.

## 8. Scalability Requirements

- Target at least 1000 concurrent requests.
- Use stateless backend instances behind a load balancer.
- Use database indexes on `school_id`, `student_id`, `card_uid`, `device_id`, and event timestamps.
- Store long-term attendance records in the database.
- Store live status and short coordinate queues in Redis or another fast in-memory store.
- Process SMS and reports asynchronously through a job queue.
- Use pagination, filtering, and date ranges for admin dashboard queries.

For 8000+ students, a relational database such as PostgreSQL is enough for the core data model if indexes and query patterns are designed correctly.

## 9. Security Requirements

- Use HTTPS for all API traffic.
- Hash passwords with a strong password hashing algorithm.
- Use role-based access control.
- Scope every school admin query by `school_id`.
- Authenticate every reader device with a device secret, signed request, or certificate.
- Rotate or revoke compromised device credentials.
- Validate card UIDs and reject unknown or revoked cards.
- Avoid exposing parent phone numbers except to authorized users.
- Log sensitive admin actions such as card assignment, revocation, and manual SMS.

## 10. Reliability Requirements

- Reader devices should retry failed requests with idempotency keys.
- Backend should accept delayed events but mark them with original device timestamp and server received timestamp.
- SMS sending should use retry logic and delivery status tracking.
- Background jobs should be restartable and safe to run more than once.
- Dashboard live updates should recover by reloading current live status after reconnecting.

## 11. Suggested MVP Scope

Build first:

- School admin auth.
- Student, guardian, card, and device registration.
- Device scan endpoint.
- Attendance event storage.
- Live dashboard status.
- Automatic late/absent detection.
- Manual and automatic SMS.
- Basic attendance reports.

Defer until hardware is confirmed:

- GPS coordinate ingestion.
- Geofencing.
- Offline device sync.
- Advanced route/bus tracking.
- Parent mobile app.

## 12. Open Questions

1. Will the ID card itself contain GPS/tracking hardware, or will location only come from fixed readers and Raspberry Pi devices?
2. Should the system track students only inside school premises, or also during transport between home and school?
3. What ID card technology will be used: RFID, NFC, QR code, barcode, or another option?
4. Should one student be allowed to have multiple active cards, for example temporary replacement cards?
5. Which SMS provider should be used, and should the system support provider fallback?
6. Should reports be sent by SMS as plain text, SMS link, WhatsApp, email, or downloaded only from the dashboard?
7. What counts as sign-in and sign-out: first/last scan of the day, specific gate devices only, or admin-configured device groups?
8. What should happen if a reader is offline: reject scans, store locally and sync later, or alert admins immediately?
9. How long should attendance records, notification logs, and reports be retained?
10. Are there privacy or government policy requirements for storing student and guardian data?
