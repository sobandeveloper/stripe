const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Use env variable for Stripe secret key

app.use(cors());
app.use(express.json());

app.post('/create-checkout', async (req, res) => {
  const { name, email, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Marriage Coaching Session' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      client_reference_id: `${email}-${Date.now()}`, // Ensures a fresh session each time
      success_url: 'https://ivory-chinchilla-459851.hostingersite.com/form/?stripe=success',
      cancel_url: 'https://ivory-chinchilla-459851.hostingersite.com/form/?stripe=cancel',
    });

    res.json({ success: true, redirect_url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Stripe proxy is running!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
