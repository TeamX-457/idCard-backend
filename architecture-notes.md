## Device and card assumptions
- Card hardware will be configured with student IDs.
- The card's own ID and the student ID is stored alongside each other in the database. However, in the database, ID is the primary key.
- Devices will be registered from the admin's side, and as soon as they are registered, a key is generated. Said key will be inputed into the device's internal hardware.
- If a device is lost or stolen, we immediately reset the key on the admin's side, for security.
- If a card is lost or stolen, we re-register a new card with the student's ID card, and revoke access to the old card.

## Things we're noting
Attendance event integrity
Idempotency keys — flagged just now. A retrying device (network flake, double-tap) will currently create duplicate events with nothing stopping it. PRD explicitly calls this out under reliability.
Check-in/check-out sequencing — nothing currently stops two check_ins in a row with no check_out between. Deferred intentionally to the rules/detection layer rather than the raw event writer.
Device-timestamp vs server-received-timestamp — PRD says delayed events should be accepted but marked with both times. Your AttendanceEvent only has one timestamp field right now, defaulted server-side.
Replay protection — PRD mentions signed requests/replay protection for device endpoints; currently just secret-comparison, no nonce/signature/expiry on the request itself.
Cards & devices (things we assumed, not confirmed)
Multiple active cards per student — PRD open question #4 (temporary replacement cards while a lost one's replacement is pending). Current design assumes one active card per student at a time.
Device secret transport — currently plain header over HTTPS; fine only as long as TLS is non-negotiable in deployment. Worth re-confirming at deploy time, not now.
Rate limiting on device-auth — bcrypt is intentionally slow, so a flood of bad secrets is a mild DoS path. Not addressed yet.
Offline device behavior — PRD Q8: reject scans, store-and-sync-later, or alert admins immediately if a reader goes offline? Completely undecided.
Live status / infra
Redis (or similar) for live status + recent coordinates — new infrastructure, not just more Prisma models. Hasn't been scoped as its own decision yet.
WebSocket/SSE gateway for pushing live updates to the dashboard — depends on live status existing first.
Notifications
SMS provider choice — PRD Q5, completely open. Also Q6: SMS plain text vs link vs WhatsApp vs email vs dashboard-only.
notification_logs schema — not modeled yet at all.
Access / compliance
Super Admin scope — flagged early: requireSchoolAdmin doesn't yet account for a Super Admin managing/impersonating a school; their token has no schoolId at all under current schema.
Admin action audit logging — PRD explicitly wants sensitive actions logged (card assignment/revocation, manual SMS). Nothing logs this yet beyond the DB row changes themselves.
Guardian data privacy / government policy — PRD Q10, entirely open, likely the one with real legal weight given "government schools" in the brief.
Delete/detach guardian — already sitting in your manual-test parking lot as "not built yet, worth deciding if needed."