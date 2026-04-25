import { Router } from 'express'
import Stripe from 'stripe'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'egp' } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true }
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature']

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break
    }

    res.json({ received: true })
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
})

export default router