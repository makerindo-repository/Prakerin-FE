# Comment/Ulasan Integration Fix — Landing Page

## Overview
Integrate the live **Ulasan (Feedback)** system from the rating database into the landing page testimonials section, replacing hardcoded `CommentPrakerin` entries with real student-to-company feedback.

---

## Requirements & Specifications

### Display Logic
- **Source**: Fetch from `feedback` table (not `comment_prakerins`)
- **Filter**: Only feedback where `to_type = 'company'` (student → company reviews only)
- **Limit**: 6 latest entries (or random mix if preferred)
- **Fallback**: Show nothing if no feedback exists (no hardcoded backup)
- **Data per card**: Student name + Company name + Rating (stars) + Comment text
- **No logos/images**: Keep layout clean and simple

---

## Implementation Plan

### Phase 1: Backend (`Prakerin-BE`)

#### Step 1.1 — Check Existing Code
**Before making changes, AI should:**

1. **Open** `/app/Http/Controllers/HomepageController.php`
2. **Check** the `index()` method (around line 20-50):
   - Does it currently fetch from `CommentPrakerin`?
   - Is there already a `feedback` query attempt (but buggy)?
   - Look for any existing joins with `users`, `feedback`, or company tables
3. **Check** the response structure:
   - What format does it return testimonials in?
   - Is there a `comments` or `testimonials` key?
4. **Report findings** before proceeding to Step 1.2

#### Step 1.2 — Verify Database Schema
**AI should check:**

1. **Open** `/database/migrations/` and search for:
   - Migration file with `feedback` table definition
   - Check columns: `id`, `from_user_id`, `to_user_id`, `to_type`, `rating`, `text`, `created_at`
2. **Open** `/database/migrations/` and check `users` table:
   - Confirm it has: `id`, `name`, `email`, etc.
3. **Open** `/app/Models/Feedback.php` (or create if missing):
   - Does it have relationships defined?
   - Should have: `fromUser()`, `toUser()` relationships
4. **Report findings** before proceeding to Step 1.3

#### Step 1.3 — Create/Update Feedback Model Relationships
**If relationships don't exist in `Feedback.php`, add:**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    protected $fillable = ['from_user_id', 'to_user_id', 'to_type', 'rating', 'text'];

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
```

#### Step 1.4 — Modify HomepageController@index()
**Replace or update the testimonials fetch logic:**

**Current code probably looks like:**
```php
$comments = CommentPrakerin::all();
// or similar hardcoded query
```

**Replace with:**
```php
// Fetch real feedback from students to companies
$comments = Feedback::with(['fromUser', 'toUser'])
    ->where('to_type', 'company')
    ->orderBy('created_at', 'DESC')
    ->limit(6)
    ->get()
    ->map(function ($feedback) {
        return [
            'id' => $feedback->id,
            'student_name' => $feedback->fromUser->name,
            'company_name' => $feedback->toUser->name,
            'rating' => $feedback->rating,
            'text' => $feedback->text,
            'created_at' => $feedback->created_at,
        ];
    });
```

**Ensure response includes:**
```php
return response()->json([
    'data' => [
        'homepages' => $formattedKeyValue,
        'homepages_raw' => $data, // Admin use
        'partners' => $partners,
        'comments' => $comments, // <-- Add this (feedback data)
        'job_openings' => $jobOpenings,
    ]
]);
```

#### Step 1.5 — Test Backend Endpoint
**AI should:**
1. Use Postman/Insomnia to test: `GET /api/v1/homepages`
2. Verify response includes `comments` key
3. Verify each comment has: `student_name`, `company_name`, `rating`, `text`
4. Check if data is empty (expected if no feedback exists in DB)

---

### Phase 2: Frontend (`Prakerin-FE`)

#### Step 2.1 — Check Existing Frontend Code
**Before making changes, AI should:**

1. **Open** `/src/app/Landingpage.tsx`
2. **Search** for the "Success Stories" or "Ulasan" section (around line 100-150)
3. **Find** the testimonial rendering code:
   - What data source is it using? (probably `homepages?.comments` or hardcoded)
   - What's the current card structure/component?
4. **Check** `/src/app/page.tsx`:
   - How is `homepages` data passed to `Landingpage.tsx`?
   - Is `comments` already in the props?
5. **Report findings** before proceeding to Step 2.2

#### Step 2.2 — Update Data Fetching in page.tsx
**If not already done, ensure:**

```typescript
// In /src/app/page.tsx
const memoizedProps = {
    homepages: data?.data?.homepages || {},
    partners: data?.data?.partners || [],
    comments: data?.data?.comments || [], // <-- Add this
    job_openings: data?.data?.job_openings || [],
    // ... other props
};
```

#### Step 2.3 — Update Testimonial Rendering in Landingpage.tsx
**Find the testimonial card rendering section and replace with:**

```typescript
// Success Stories Section - Ulasan
{comments && comments.length > 0 ? (
    <section id="ulasan" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
                Success Stories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        {/* Star Rating */}
                        <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-lg ${
                                        i < comment.rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        {/* Comment Text */}
                        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                            "{comment.text}"
                        </p>

                        {/* Student & Company Name */}
                        <div className="border-t pt-3">
                            <p className="text-sm font-semibold text-gray-800">
                                {comment.student_name}
                            </p>
                            <p className="text-xs text-gray-500">
                                at {comment.company_name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
) : null}
```

#### Step 2.4 — Test Frontend
**AI should:**
1. Run the dev server: `npm run dev`
2. Navigate to home page `/`
3. Scroll to Success Stories section
4. Verify:
   - Cards display student name, company name, rating, and text
   - Stars show correctly (filled vs empty)
   - If no feedback in DB, section is hidden (not shown)
5. Test as both guest and logged-in user (landing page bug may still exist, but testimonials should work)

---

## Potential Issues & Debugging

### Issue 1: "Comments are empty/undefined"
**Check:**
- Backend returning `comments: []` in response?
- Frontend receiving it? (Open browser DevTools → Network → check response)
- Verify database has feedback records: `SELECT * FROM feedback WHERE to_type = 'company';`

### Issue 2: "Student/Company names are NULL"
**Check:**
- Relationships in Feedback model correctly defined?
- `users` table has records matching `from_user_id` and `to_user_id`?
- Add `->withTrashed()` if users are soft-deleted?

### Issue 3: "Still showing old hardcoded comments"
**Check:**
- Old `CommentPrakerin` query completely removed from controller?
- Frontend still referencing old data key?
- Clear browser cache

### Issue 4: "Landing page shows '-' for logged-in users"
**Note:** This is the existing bug from the audit. It's separate from this integration. The testimonials should still display, but other CMS content may show `-`. This will need the fix from the landing page audit (make response consistent).

---

## Summary of Files to Check/Modify

| File | Action | Priority |
|------|--------|----------|
| `/app/Http/Controllers/HomepageController.php` | Check existing query, update to use `feedback` table | 🔴 High |
| `/app/Models/Feedback.php` | Verify relationships exist | 🔴 High |
| `/src/app/page.tsx` | Verify `comments` is passed to component | 🟡 Medium |
| `/src/app/Landingpage.tsx` | Update testimonial rendering | 🔴 High |
| `/database/migrations/*feedback*` | Verify schema | 🟡 Medium |

---

## Rollback Plan

If something breaks:
1. Revert HomepageController to return `CommentPrakerin` data
2. Revert Landingpage.tsx to old rendering
3. Clear browser cache and restart dev server

---

## AI Checklist Before Starting

- [ ] Checked HomepageController@index() for existing code
- [ ] Verified Feedback model and relationships exist
- [ ] Confirmed feedback table schema
- [ ] Checked current testimonial rendering in Landingpage.tsx
- [ ] Understood data flow from backend to frontend
- [ ] Reviewed database for existing feedback records

**Start with: "I will check the existing code structure first before making any changes."**
