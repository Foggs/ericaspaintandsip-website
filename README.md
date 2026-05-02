# Erica's Paint & Sip — Site Admin Guide

Welcome! This guide explains how to manage your website content — no coding required. Everything is done through the **Admin Panel**, a simple dashboard where you can add events, respond to bookings, update your gallery, write blog posts, and more.

---

## Table of Contents

1. [Getting Into the Admin Panel](#1-getting-into-the-admin-panel)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Managing Events](#3-managing-events)
4. [Viewing Bookings](#4-viewing-bookings)
5. [Private Event Inquiries](#5-private-event-inquiries)
6. [Photo Gallery](#6-photo-gallery)
7. [Blog & News](#7-blog--news)
8. [Newsletter Subscribers](#8-newsletter-subscribers)
9. [Media Library](#9-media-library)
10. [Your Admin Account](#10-your-admin-account)
11. [What Visitors See](#11-what-visitors-see)
12. [Quick Reference](#12-quick-reference)

---

## 1. Getting Into the Admin Panel

Open your browser and go to:

```
https://ericaspaintandsip.com/cms/admin
```

You'll see a login screen. Enter your **email address** and **password**, then click **Login**.

> **Tip:** Bookmark this URL so you can get back to it quickly.

If you've forgotten your password, contact your developer to reset it.

---

## 2. Dashboard Overview

After logging in you'll see the main dashboard. On the left side is the **navigation sidebar** — this is how you get to everything.

| Sidebar Item | What it manages |
|---|---|
| **Events** | Your public paint-and-sip classes |
| **Bookings** | Registrations from your events |
| **Private Inquiries** | Private party booking requests |
| **Gallery Photos** | Your photo gallery |
| **Posts** | Blog articles and news |
| **Newsletter Subscribers** | Your email list |
| **Media** | All uploaded images and files |

Click any item to open that section.

---

## 3. Managing Events

Events are the heart of the site. This is where you create and manage all your public paint-and-sip classes.

### Creating a New Event

1. Click **Events** in the sidebar
2. Click the **Create New** button (top right)
3. Fill in the event details:

| Field | What to enter | Required? |
|---|---|---|
| **Title** | Name of the event, e.g. "Wine & Van Gogh Night" | ✅ Yes |
| **Slug** | Auto-fills from the title — leave it as-is | Auto |
| **Date** | Date and time the event starts | ✅ Yes |
| **Duration** | How long in minutes (e.g. 120 for 2 hours) | Optional |
| **Location** | Room or address, e.g. "Main Studio" | Optional |
| **Price** | Ticket price in dollars, e.g. 45 | Optional |
| **Capacity** | Max number of attendees | Optional |
| **Description** | Full details about the event — use the rich text editor | Optional |
| **Cover Image** | The main photo for this event | Optional |
| **Published** | Toggle ON to make it visible on the website | ✅ Must be ON |

4. Click **Save** when you're done

> ⚠️ **Important:** An event will NOT appear on the website until you turn on the **Published** toggle. This lets you draft events in advance and publish them when you're ready.

### Editing an Event

1. Click **Events** in the sidebar
2. Find the event in the list and click its title
3. Make your changes
4. Click **Save**

### Taking an Event Offline

If an event is cancelled or you want to hide it from the site:

1. Open the event
2. Turn the **Published** toggle OFF
3. Click **Save**

The event will immediately disappear from the public website but remains in your admin panel.

### Deleting an Event

1. Open the event
2. Click the **⋮ menu** (three dots) or the **Delete** button
3. Confirm the deletion

> ⚠️ Deleting an event also removes it from your records permanently. Consider unpublishing instead if you may need it later.

---

## 4. Viewing Bookings

When someone registers and pays for an event through the website, a booking is automatically created here.

### Viewing All Bookings

1. Click **Bookings** in the sidebar
2. You'll see a list of all registrations with name, event, seats, and status

### Understanding Booking Status

| Status | Meaning |
|---|---|
| **paid** | Payment was completed — confirmed registration |
| **pending** | Payment was started but not completed |
| **cancelled** | Booking was cancelled |

### Viewing a Single Booking

Click any booking to see full details:
- Customer name, email, and phone number
- Which event they booked
- Number of seats
- PayPal order ID (for payment reference)
- Date and time the booking was made

> **Note:** Bookings are created automatically by the website when PayPal payment is confirmed. You don't need to create bookings manually.

### Exporting Bookings

To get a list of attendees for an event, use the filter at the top of the Bookings list to filter by event name, then use the **Export** option if available, or screenshot/copy the list for your records.

---

## 5. Private Event Inquiries

When someone fills out the **Private Event Booking Form** on your site, their inquiry lands here. You'll also receive a notification email automatically.

### Viewing Inquiries

1. Click **Private Inquiries** in the sidebar
2. Click any inquiry to view the full details

Each inquiry contains:
- Customer name, email, and phone number
- Preferred date (if they provided one)
- Number of guests (or "Not sure yet")
- Their message with event details

### Responding to an Inquiry

Responses are handled **outside the website** — simply reply to the customer directly by phone or email using the contact details in the inquiry. There is no built-in reply feature in the admin panel.

> **Tip:** A notification email is sent to you automatically when a new inquiry is submitted, so you'll know right away without having to check the admin panel.

---

## 6. Photo Gallery

The gallery page on your site pulls directly from this collection.

### Adding Photos

1. Click **Gallery Photos** in the sidebar
2. Click **Create New**
3. Fill in the details:

| Field | What to enter | Required? |
|---|---|---|
| **Image** | Upload your photo | ✅ Yes |
| **Caption** | A short description of the photo | Optional |
| **Category** | Choose from: Events, Behind the Scenes, Paintings, Other | Optional |
| **Sort Order** | A number that controls display order — lower numbers appear first | Optional |

4. Click **Save**

### Reordering Photos

The gallery displays photos in order of their **Sort Order** number (lowest first). To change the order:

1. Open the photo you want to move
2. Change the **Sort Order** number
3. Save

> **Example:** If you want a photo to appear first, give it Sort Order **1**. Second gets **2**, and so on. You can leave gaps (e.g. 10, 20, 30) so you have room to insert photos between existing ones later.

### Editing or Deleting Photos

1. Click **Gallery Photos** in the sidebar
2. Click the photo you want to change
3. Update the fields or click **Delete**
4. Save

### Category Filters

Visitors on your gallery page can filter photos by category. Make sure you assign the right category when uploading so the filters work correctly.

---

## 7. Blog & News

Use the blog to share event recaps, painting tips, announcements, or anything you want your audience to read.

### Writing a New Post

1. Click **Posts** in the sidebar
2. Click **Create New**
3. Fill in the details:

| Field | What to enter | Required? |
|---|---|---|
| **Title** | Headline of your post | ✅ Yes |
| **Slug** | Auto-fills from the title — leave it as-is | Auto |
| **Published Date** | When the post should appear as published | ✅ Yes |
| **Excerpt** | A short 1–2 sentence summary shown on the blog listing page | Optional |
| **Content** | The full body of your post — use the rich text editor | Optional |
| **Cover Image** | Header image for the post | Optional |
| **Published** | Toggle ON to make it visible on the website | ✅ Must be ON |

4. Click **Save**

### Using the Rich Text Editor

The content editor works like a simple word processor:

- **Bold**: Highlight text and click **B**
- **Italic**: Highlight text and click **I**
- **Headings**: Use the format dropdown to choose Heading 2, Heading 3, etc.
- **Links**: Highlight text and click the link icon, then paste the URL
- **Lists**: Click the bullet or numbered list icon

### Saving a Draft

You can write a post without it going live. Just leave the **Published** toggle OFF and click **Save**. Come back and turn Published ON when you're ready to post it.

### Editing or Deleting Posts

1. Click **Posts** in the sidebar
2. Find the post and click its title
3. Make your changes or click **Delete**
4. Save

---

## 8. Newsletter Subscribers

Everyone who signs up through your website's newsletter form is stored here.

### Viewing Your List

1. Click **Newsletter Subscribers** in the sidebar
2. You'll see each subscriber's name, email address, and the date they signed up

### Using Your List

The website stores your subscribers but does not send emails automatically. To send a newsletter:

1. Export or copy the email addresses from the admin panel
2. Paste them into your email platform of choice (Mailchimp, Gmail, etc.)
3. Send your newsletter from there

### If Someone Wants to Unsubscribe

1. Find their email in the **Newsletter Subscribers** list
2. Click their record to open it
3. Click **Delete** to remove them

---

## 9. Media Library

The media library is where all uploaded images and files are stored. When you upload a cover image for an event, a gallery photo, or a blog post image, it gets saved here automatically.

### Uploading a File Directly

1. Click **Media** in the sidebar
2. Click **Create New**
3. Click the upload area and choose your file
4. Click **Save**

### Reusing an Existing Image

When adding an image to an event, post, or gallery item, you can click **Choose Existing** to pick from images already in your media library instead of uploading a new copy.

### Supported File Types

- Images: JPG, PNG, WebP, GIF
- Keep file sizes reasonable — images under 2MB load fastest on the site

---

## 10. Your Admin Account

### Changing Your Password

1. Click your name or avatar in the top right corner of the admin panel
2. Select **Account**
3. Enter your new password and confirm it
4. Click **Save**

### Logging Out

Click your name or avatar in the top right corner and select **Logout**.

---

## 11. What Visitors See

Here's how your admin content maps to what people see on the website:

| In Admin | Visible on Website at |
|---|---|
| Published Events | `/events` and `/events/[event-name]` |
| Gallery Photos | `/gallery` |
| Published Posts | `/blog` and `/blog/[post-title]` |
| Private Inquiries form | `/private-events` (form submissions come to you) |
| Newsletter Signup | Homepage and footer |

Changes you make in the admin appear on the live site **immediately** after saving.

---

## 12. Quick Reference

### Most Common Tasks

| I want to… | Go to… |
|---|---|
| Add a new event | Events → Create New |
| Publish a draft event | Events → open event → turn Published ON → Save |
| See who registered for an event | Bookings → filter by event name |
| Read a new private inquiry | Private Inquiries → click the inquiry |
| Add photos to the gallery | Gallery Photos → Create New |
| Write a blog post | Posts → Create New |
| See newsletter signups | Newsletter Subscribers |
| Upload a photo for later use | Media → Create New |
| Change my password | Top right avatar → Account |

### If Something Looks Wrong on the Site

1. Check that the item is **Published** (events and posts require this to be ON)
2. Check that the **date** on an event hasn't already passed — past events don't show on the listing page
3. If a gallery photo isn't showing in the right category, check its **Category** field
4. If you still can't find the problem, contact your developer

---

*Last updated: May 2026 — ericaspaintandsip.com*
