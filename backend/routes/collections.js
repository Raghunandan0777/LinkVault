import { Router } from 'express';
import {  syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();

// GET all collections
router.get('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id, plan').eq('clerk_id', clerkId).single();

    const { data, error } = await supabase
      .from('collections')
      .select('*, links(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// GET single collection with links
router.get('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();

    const { data, error } = await supabase
      .from('collections')
      .select('*, links(*, link_tags(tags(*)))')
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Collection not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// POST create collection
router.post('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id, plan').eq('clerk_id', clerkId).single();

    // Free tier: max 5 collections
    if (user.plan === 'free') {
      const { count } = await supabase.from('collections').select('id', { count: 'exact' }).eq('user_id', user.id);
      if (count >= 5) return res.status(403).json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited collections.' });
    }

    const { name, description, is_public, cover_image_url, slug } = req.body;

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        is_public: is_public || false,
        cover_image_url: cover_image_url || null,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// PATCH update collection
router.patch('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.user_id; // safety

    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// DELETE collection
router.delete('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();

    // Unlink all links from this collection
    await supabase.from('links').update({ collection_id: null }).eq('collection_id', req.params.id).eq('user_id', user.id);
    const { error } = await supabase.from('collections').delete().eq('id', req.params.id).eq('user_id', user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
