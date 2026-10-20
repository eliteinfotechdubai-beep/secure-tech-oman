# WhatsApp Cloud API — Quote Request Notifications

When a customer submits the **Request For Quote** form, the filled-in details reach your
WhatsApp. There are two delivery modes, and the form picks one automatically:

| Mode | When it is used | What happens |
|---|---|---|
| **Deep link** | Cloud API not configured, or a send fails | WhatsApp opens with every detail pre-filled; the customer presses send. Works with the WhatsApp Business app on `+968 96079052` — **no Meta setup needed.** |
| **Cloud API** | `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_RECIPIENTS` are all set | The server sends it to your sales team automatically. The customer does nothing. |

**The form works right now in deep-link mode.** Everything below is only needed to upgrade
to the fully automatic Cloud API mode — setting the environment variables switches it over
with no code change.

The trade-off: in deep-link mode the customer must press send in WhatsApp, so a customer
who closes the tab is not captured. Cloud API removes that gap.

---

## ⚠️ Step 0 — The phone number conflict (read first)

**A phone number cannot be on the WhatsApp Business app and the Cloud API at the same time.**

`+968 96079052` is currently logged into WhatsApp on a phone. To register it with the
Cloud API you must first **delete the WhatsApp account from that phone**
(Settings → Account → Delete my account). This:

- **permanently deletes the chat history** for that number — it does not transfer to the API
- removes the number from the app, so staff can no longer reply from the phone;
  all replies then happen through the Cloud API or Meta Business Suite

**Recommended instead: use a second number for the Cloud API.** Keep `+968 96079052`
on the Business app so the existing WhatsApp buttons on the site keep working as they
do today, and let the new number handle automated quote notifications.

Decide this before starting — changing it later means redoing the registration.

---

## Step 1 — Accounts

1. **Meta Business Account** at [business.facebook.com](https://business.facebook.com).
2. Start **business verification** (Business Settings → Security Centre). You will
   need a trade licence and proof of address. This gates going Live, and it can take
   several days — **start it now, do the rest while it runs.**
3. **Meta developer account** at [developers.facebook.com](https://developers.facebook.com)
   → *Create App* → add the **WhatsApp** product.

## Step 2 — Register the number

In the app dashboard → **WhatsApp → API Setup**:

1. Add and verify the phone number from Step 0.
2. Copy the **Phone Number ID** (a long number, *not* the phone number itself).
3. Copy the **WhatsApp Business Account ID** — needed if you ever use a BSP or the
   management API.

## Step 3 — Permanent access token

The token shown on the API Setup page **expires in 24 hours**. Do not use it in production.

Business Settings → **System Users** → *Add*:

1. Create a system user with the **Admin** role.
2. **Add Assets** → assign both the app and the WhatsApp Business Account, with full control.
3. **Generate New Token** → select the app → set expiry to **Never** → grant:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - `business_management`
4. **Copy it immediately.** It is shown once and cannot be retrieved later.

## Step 4 — Create the message template

You cannot send free-form text to someone who has not messaged you in the last 24 hours.
Business-initiated messages must use a pre-approved template.

**WhatsApp Manager → Message Templates → Create Template**

| Setting | Value |
|---|---|
| Name | `quote_request_notification` |
| Category | **Utility** (not Marketing — cheaper and approves more reliably) |
| Language | English (`en`) |

**Body — copy exactly:**

```
New quote request from {{1}}.

Company: {{2}}
Phone: {{3}}
Email: {{4}}

Product: {{5}}
SKU: {{6}}
Quantity: {{7}}

Notes: {{8}}

Open the site admin to follow up on this lead.
```

Meta requires a sample value for all 8 variables before it will accept the submission.
Approval usually takes minutes; allow up to 24 hours.

> The closing line is deliberate — a body ending on a variable is a common rejection reason.

**If you change this wording, you must change `src/lib/whatsapp/format-quote.ts` to match,
and resubmit for approval.** The parameter order is defined in that file.

## Step 5 — Choose recipients

**You cannot send a WhatsApp message from your business number to itself.** Notifications
must go to your sales staff's own WhatsApp numbers.

While the app is in **Development** mode, you can only message numbers explicitly added
to the recipient list in API Setup. Switching to **Live** requires the business
verification from Step 1.

## Step 6 — Configure the app

Add to `.env` (the file this project already uses for the Shopify keys):

```env
WHATSAPP_PHONE_NUMBER_ID=1234567890123456
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_RECIPIENTS=96879000000,96899000000
```

`WHATSAPP_RECIPIENTS` is comma-separated, **digits only, with country code, no `+`**.
Every listed number receives its own copy and each one is billed separately.

**Restart the dev server after editing `.env`** — Next.js reads it at startup, so the
form keeps reporting "temporarily unavailable" until you do.

Optional overrides (sensible defaults are built in):

```env
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_TEMPLATE_NAME=quote_request_notification
WHATSAPP_TEMPLATE_LANG=en
```

For **production**, add the same variables in the **AWS Amplify Console → Environment
variables**. `amplify.yml` copies them into the build with:

```yaml
env | grep -e SHOPIFY_ -e WHATSAPP_ >> .env.production
```

> Any future variable that does not start with `SHOPIFY_` or `WHATSAPP_` will be silently
> missing in production. Widen that grep if you add one.

---

## Verifying

**1. Test Meta directly first**, so a failure points at the setup rather than the app:

```bash
curl -X POST "https://graph.facebook.com/v23.0/<PHONE_NUMBER_ID>/messages" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "96879000000",
    "type": "template",
    "template": {
      "name": "quote_request_notification",
      "language": { "code": "en" },
      "components": [{
        "type": "body",
        "parameters": [
          {"type":"text","text":"John Doe"},
          {"type":"text","text":"Acme Trading"},
          {"type":"text","text":"+968 9123 4567"},
          {"type":"text","text":"john@example.com"},
          {"type":"text","text":"Seagate IronWolf 8TB"},
          {"type":"text","text":"ST8000VN004"},
          {"type":"text","text":"25"},
          {"type":"text","text":"Delivery to Muscat"}
        ]
      }]
    }
  }'
```

**2. Then the local route**, with newlines deliberately in the message:

```bash
pnpm dev
curl -X POST http://localhost:3000/api/quote \
  -H 'Content-Type: application/json' \
  -d '{"name":"John Doe","email":"john@example.com","phone":"+968 9123 4567",
       "company":"Acme Trading","quantity":"25",
       "message":"Need urgently.\n\n- delivery to Muscat\n- warranty terms",
       "productName":"Seagate IronWolf 8TB","productSku":"ST8000VN004"}'
```

**3. In the browser**, submit from a product card, a product detail page, and the
quick-view modal, and confirm the SKU appears in all three messages.

---

## Common errors

| Code | Meaning | Fix |
|---|---|---|
| `132000` | Parameter count or format mismatch | The template has a different number of variables than `buildQuoteParams` sends, or a parameter contains a newline/tab/4+ spaces |
| `132001` | Template does not exist | Name or language code does not match the approved template |
| `131026` | Message undeliverable | Recipient is not on WhatsApp, or is not on the allow-list while the app is in Development mode |
| `190` | Invalid/expired access token | The 24-hour token was used instead of the permanent System User token |
| `131047` | Outside the 24-hour window | A free-form message was attempted; only templates work here |
| `100` | Invalid parameter | Usually a wrong Phone Number ID |

Failures are logged server-side with Meta's own message. In production, look in
**CloudWatch logs** for `WhatsApp send failed`.

---

## Costs and behaviour

- Utility templates are **billed per delivered message** (Meta moved to per-message
  pricing on 1 July 2025). Rates depend on the **recipient's** country — check Meta's
  current rate card. Two recipients means two billed messages per quote.
- The route rate-limits to **5 submissions per IP per 10 minutes** because this endpoint
  is public and each call costs money. This is per server instance and resets on cold
  start, so it is a speed-bump, not a guarantee.
- **Quote requests are no longer saved to Shopify.** WhatsApp is the only delivery.
  Every submission is written to the server log before sending, so CloudWatch is the
  only record if delivery fails.
- If the Cloud API rejects every send, the form silently falls back to the deep link
  rather than losing the lead. That means a broken token or an unapproved template shows
  up as "customers are suddenly being asked to press send", not as an outage — so treat
  `WhatsApp send failed` in CloudWatch as something to actually watch.
