# 📋 TECHNICAL SPEC: Hubungi kami (Contact Form)

## Feature Requirements

**What it does:**
- Public visitors and logged-in users can submit contact messages
- Messages get stored in database
- Admin gets notified via email
- Admin can reply to messages
- Users can view replies to their messages

---

## DATABASE SCHEMA

### Table: contact_messages

```sql
Schema::create('contact_messages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('email');
    $table->enum('category')->values(['general', 'bug', 'feedback']);
    $table->string('subject');
    $table->text('message');
    $table->enum('status')->values(['new', 'read', 'replied'])->default('new');
    $table->uuid('user_id')->nullable(); // If logged-in user submitted
    $table->timestamps();
    
    $table->index('email');
    $table->index('status');
});

Schema::create('contact_replies', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('contact_message_id');
    $table->uuid('replied_by_id'); // Admin/staff user
    $table->text('reply_message');
    $table->timestamps();
    
    $table->foreign('contact_message_id')->references('id')->on('contact_messages')->onDelete('cascade');
    $table->foreign('replied_by_id')->references('id')->on('users')->onDelete('cascade');
});
```

---

## BACKEND REQUIREMENTS

### Models

**ContactMessage.php:**
```
- Attributes: id, name, email, category, subject, message, status, user_id, created_at, updated_at
- Relationships:
  - hasMany('replies') → ContactReply
  - belongsTo('user') → User (nullable, for logged-in users)
- Methods:
  - markAsRead()
  - markAsReplied()
```

**ContactReply.php:**
```
- Attributes: id, contact_message_id, replied_by_id, reply_message, created_at, updated_at
- Relationships:
  - belongsTo('contactMessage') → ContactMessage
  - belongsTo('repliedBy', 'replied_by_id') → User
```

### Controller: ContactController

**Endpoints:**

1. **POST /api/v1/contacts** (PUBLIC - no auth required)
   - Store contact message
   - Validate: name, email, category, subject, message (all required)
   - Auto-attach current user_id if logged-in
   - Send email to admin (see Mail section)
   - Return: `{success: true, message_id: uuid}`

2. **GET /api/v1/contacts** (ADMIN ONLY - ability: admin-access)
   - List all contact messages
   - Paginate (20 per page)
   - Show: name, email, subject, category, status, created_at
   - Include count of replies per message
   - Order by: newest first
   - Support filters: status, category, date range (optional)

3. **GET /api/v1/contacts/{id}** (ADMIN ONLY)
   - Show single message with all replies
   - Include: message details + all replies + replier info
   - Auto-mark message as "read" on first view

4. **POST /api/v1/contacts/{id}/reply** (ADMIN ONLY)
   - Add reply to message
   - Validate: reply_message (required)
   - Auto-set replied_by to current user
   - Auto-mark contact message status as "replied"
   - Send email notification to original sender (see Mail section)
   - Return: reply data

5. **GET /api/v1/contacts/user/{email}** (PUBLIC - can check by email)
   - For users to check replies to their messages
   - Require email + confirm identity (or use if logged-in)
   - Return: message + all replies

---

## MAIL / EMAIL NOTIFICATIONS

### Mailable 1: ContactFormSubmitted
- **Triggered:** When contact form is submitted
- **Recipient:** Admin email (from config)
- **Content:**
  ```
  Subject: New Contact Message - [Category]
  
  From: {name} ({email})
  Category: {category}
  Subject: {subject}
  
  Message:
  {message}
  ```
- **Action Button:** Link to admin dashboard to view/reply

### Mailable 2: ContactReplyNotification
- **Triggered:** When admin replies to message
- **Recipient:** Original sender's email
- **Content:**
  ```
  Subject: Re: {original_subject}
  
  Your message has been replied to:
  
  Admin Reply:
  {reply_message}
  
  You can view more details here: [link to check replies]
  ```

---

## FRONTEND REQUIREMENTS

### 1. Contact Form Page (PUBLIC)
**Route:** `/hubungi-kami` or `/contact`

**Components:**
- Form with fields:
  - Name (text input, required)
  - Email (email input, required)
  - Category (dropdown: General / Bug / Feedback, required)
  - Subject (text input, required)
  - Message (textarea, required, min 10 chars)
  
**Behavior:**
- Submit button sends POST to `/api/v1/contacts`
- Show loading state while sending
- On success:
  - Show toast: "Message sent successfully. We'll get back to you soon."
  - If user is logged-in: show "Check your replies here" link
  - If guest: show "Check your replies by email" message
  - Clear form
- On error: Show error toast with message
- Pre-fill email field if user is logged-in

**Styling:**
- Use Tailwind + Lucide icons
- Responsive (mobile-friendly)
- Contact form card centered on page
- Optional: Add FAQ or support info nearby

---

### 2. Admin Dashboard: Contact Messages
**Route:** `/dashboard/contact-messages` (admin only)

**List View Page:**
- Table showing:
  - From (name/email)
  - Subject
  - Category (badge: General/Bug/Feedback with different colors)
  - Status (badge: new/read/replied)
  - Date submitted
  - Actions (View button)
  
- Features:
  - Sort by: newest/oldest
  - Filter by: status (dropdown), category (dropdown), date range (optional)
  - Pagination (20 per page)
  - Search by name/email (optional)
  - Click row or "View" button → detail page

**Detail View Page:**
- Show full message:
  - From: {name} ({email})
  - Category, Subject, Message
  - Submitted date
  
- Show all replies (if any):
  - Reply from {admin_name} on {date}: {reply_message}
  - Multiple replies possible, show in chronological order
  
- Reply form at bottom:
  - Textarea for reply message (required)
  - Submit button: "Send Reply"
  - On success: show toast, reload replies, clear textarea
  - On error: show error toast
  
- Back button: go back to list

---

## API INTEGRATION

**Frontend calls:**
- `POST /api/v1/contacts` → submit form (public)
- `GET /api/v1/contacts` → list messages (admin)
- `GET /api/v1/contacts/{id}` → view message + replies (admin)
- `POST /api/v1/contacts/{id}/reply` → add reply (admin)
- `GET /api/v1/contacts/user/{email}` → check replies (public)

---

## AUTHORIZATION & VALIDATION

**Public endpoints:**
- No authentication required
- CSRF protection (Laravel default)
- Rate limiting recommended (prevent spam)

**Admin endpoints:**
- Require `auth:sanctum` + `abilities:admin-access`
- Only super_admin or staff roles can access

**Validation Rules:**
- name: required, string, max:255
- email: required, email, max:255
- category: required, in:general,bug,feedback
- subject: required, string, max:255
- message: required, string, min:10, max:5000
- reply_message: required, string, min:5, max:5000

---

## FILE CHECKLIST FOR AI

**Backend to create/modify:**
- [ ] Migration: create_contact_messages_table.php
- [ ] Migration: create_contact_replies_table.php
- [ ] Model: app/Models/ContactMessage.php
- [ ] Model: app/Models/ContactReply.php
- [ ] Controller: app/Http/Controllers/ContactController.php
- [ ] Request: app/Http/Requests/StoreContactMessageRequest.php
- [ ] Request: app/Http/Requests/StoreContactReplyRequest.php
- [ ] Mail: app/Mail/ContactFormSubmitted.php
- [ ] Mail: app/Mail/ContactReplyNotification.php
- [ ] Routes: Add routes in routes/api.php

**Frontend to create/modify:**
- [ ] Page: src/app/hubungi-kami/page.tsx (contact form)
- [ ] Component: src/components/ContactForm.tsx (reusable form)
- [ ] Page: src/app/dashboard/contact-messages/page.tsx (list view)
- [ ] Page: src/app/dashboard/contact-messages/[id]/page.tsx (detail view)
- [ ] Component: src/components/ContactReplyForm.tsx (reply form)

---

Ready for AI to build. Let them rip! 🚀
