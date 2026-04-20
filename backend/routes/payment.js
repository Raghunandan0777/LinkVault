import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import {  syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  pro: { amount: 29900, currency: 'INR', name: 'LinkVault Pro', description: 'Unlimited links, AI tagging, analytics' },
  teams: { amount: 99900, currency: 'INR', name: 'LinkVault Teams', description: 'Team workspaces, custom domains, priority support' },
};

// POST /api/payment/order - create Razorpay order
router.post('/order', requireAuth, syncUser, async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_key') ||
        !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('your_')) {
      return res.status(503).json({ error: 'Payment gateway is being set up. Please try again later or contact support.' });
    }

    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id, email, display_name').eq('clerk_id', clerkId).single();

    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: PLANS[plan].currency,
      receipt: `lv_${user.id.substring(0,8)}_${Date.now()}`,
      notes: { user_id: user.id, plan, clerk_id: clerkId },
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      name: 'LinkVault',
      description: PLANS[plan].description,
      prefill: { name: user.display_name || '', email: user.email || '' },
    });
  } catch (err) {
    console.error('Payment order error:', err.message || err);
    next(err);
  }
});

// POST /api/payment/verify - verify & activate plan
router.post('/verify', requireAuth, syncUser, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const clerkId = req.auth.userId;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update user plan
    const planExpiry = new Date();
    planExpiry.setMonth(planExpiry.getMonth() + 1);

    const { data: user, error } = await supabase
      .from('users')
      .update({
        plan,
        plan_expires_at: planExpiry.toISOString(),
        razorpay_payment_id,
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) throw error;

    // Save payment record
    await supabase.from('payments').insert({
      user_id: user.id,
      razorpay_order_id,
      razorpay_payment_id,
      plan,
      amount: PLANS[plan]?.amount,
      currency: 'INR',
      status: 'success',
    });

    res.json({ success: true, plan, expires_at: planExpiry });
  } catch (err) { next(err); }
});

// GET /api/payment/status
router.get('/status', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('plan, plan_expires_at').eq('clerk_id', clerkId).single();
    res.json({ plan: user?.plan || 'free', expires_at: user?.plan_expires_at });
  } catch (err) { next(err); }
});

export default router;
