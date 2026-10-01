# Security Specification for Sadika Studio

## 1. Data Invariants
1. Global Denial: All unmatched document paths are denied by default (`match /{document=**} { allow read, write: if false; }`).
2. Enquiries:
   - Any client (authenticated or prospective customer) can create an enquiry with valid schema and bounded field lengths.
   - Only authorized studio admins or owners can update, review, or archive enquiries.
3. Appointments:
   - Customers can create consultation requests within valid operating parameters.
   - Only authorized studio admins or the booking customer can reschedule/cancel an appointment.
4. Orders & Invoices:
   - Core financial records (Invoices) and atelier production workflows (Orders) can only be created, modified, or transitioned by authenticated studio admins.
   - Customers can read orders and invoices related to their phone/email or order number.
5. Measurements & Customer Confidentiality:
   - Personal customer records and anatomical measurements are restricted to authorized studio personnel (`isAdmin()`) or the verified customer.
6. Admin Bootstrapping:
   - The user email `daneen4tune2@gmail.com` is bootstrapped as authorized studio owner/admin.

## 2. The "Dirty Dozen" Payloads (Must be Denied)
1. **Unbounded ID Poisoning**: An enquiry with a 2KB junk character document ID. (Denied by `isValidId(id)`).
2. **Ghost Field Injection**: Adding `isAdmin: true` or `bypassed: true` into an enquiry document. (Denied by strict field checks).
3. **Impersonation Attack**: Setting `authorId` to another user's UID on order updates. (Denied by ownership invariants).
4. **Terminal State Violation**: Changing an order status from `Completed` to `Draft` arbitrarily without admin override.
5. **Unauthorized Invoice Modification**: A non-admin updating invoice totals or marking an invoice `Paid` without authorization.
6. **Weekend Appointment Exploitation**: An attacker attempting to write an appointment on Saturday/Sunday directly into Firestore.
7. **Negative or Inflated Invoicing**: Creating an invoice with negative prices or malicious NaN values.
8. **PII Scraping via Blanket List**: Attempting `collection('customers')` read without authentication or query restrictions.
9. **Oversized String Buffer Overflow**: Submitting a 1MB garment description intended to exhaust database quotas. (Denied by `.size() <= 1500`).
10. **Spoofed Email Claim**: A user with `email_verified: false` claiming to be `daneen4tune2@gmail.com`.
11. **Orphaned Order Creation**: Creating an order referencing a non-existent customer ID.
12. **Malicious Admin Promotion**: A regular user writing a document into `/admins/{uid}` to self-promote.
