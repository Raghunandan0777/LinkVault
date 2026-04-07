import { Router } from 'express';
import {  syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data, error } = await supabase.from('users').select('*').eq('clerk_id', clerkId).single();
    if (error || !data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// PATCH /api/profile
router.patch('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const allowed = ['username', 'display_name', 'bio', 'avatar_url', 'website_url', 'twitter_handle', 'github_handle', 'linkedin_handle', 'instagram_handle'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    updates.updated_at = new Date().toISOString();

    if (updates.username) {
      // Check username uniqueness
      const { data: existing } = await supabase.from('users').select('id').eq('username', updates.username).neq('clerk_id', clerkId).single();
      if (existing) return res.status(409).json({ error: 'Username already taken' });
    }

    const { data, error } = await supabase.from('users').update(updates).eq('clerk_id', clerkId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
