# Moderating BFK reviews

Every review a client sends is saved as **pending** (hidden). Nothing appears on the site until you approve it.

## Approve (publish) a review
1. Log in at https://supabase.com and open the BFK project.
2. Click **Table Editor** in the left menu, then the **reviews** table.
3. Find the new row (newest at the bottom; sort by `created_at` if you like). Read the name, rating and text, and click the `photo_url` link to see the photo if there is one.
4. Tick the **approved** box (set it to `true`) and save. The review now shows on byfaisalkhan.com/reviews/.

To hide it again later, untick **approved**.

## Reject a review
Right-click the row and choose **Delete row** (or tick it and press Delete). If it had a photo, you can also remove the file in **Storage → review-photos → pending**.

## Optional: get an email when a review arrives (note only, not set up)
Supabase can call a URL whenever a row is added: **Database → Webhooks → Create webhook**, table `reviews`, event `INSERT`. Point it at an email service (for example a Supabase Edge Function that sends via Resend, or a Zapier/Make "catch hook" that emails you). Not required; you can simply check the table now and then.

Share link for clients: **byfaisalkhan.com/review/**
