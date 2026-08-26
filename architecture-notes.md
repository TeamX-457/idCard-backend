## Device and card assumptions
- Card hardware will be configured with student IDs.
- The card's own ID and the student ID is stored alongside each other in the database. However, in the database, ID is the primary key.
- Devices will be registered from the admin's side, and as soon as they are registered, a key is generated. Said key will be inputed into the device's internal hardware.
- If a device is lost or stolen, we immediately reset the key on the admin's side, for security.
- If a card is lost or stolen, we re-register a new card with the student's ID card, and revoke access to the old card.