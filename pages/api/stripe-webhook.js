import Stripe from "stripe";
import { buffer } from "micro";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    const session = event.data.object;
    const name = session.customer_details?.name || "未入力";
    const email = session.customer_details?.email || "未入力";
    const address = session.customer_details?.address?.line1 || "未入力";
    const amount = (session.amount_total / 100).toLocaleString("ja-JP");

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `✅ サブスク決済完了\n👤 名前: ${name}\n📧 メール: ${email}`,
      }),
    });
  }

  res.status(200).send("ok");
}
