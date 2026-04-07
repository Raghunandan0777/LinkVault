import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/public/:username - public profile page
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, bio, avatar_url, website_url, twitter_handle, github_handle, linkedin_handle, instagram_handle')
      .eq('username', username)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    // Track profile view
    await supabase.from('profile_views').insert({ user_id: user.id, viewed_at: new Date().toISOString() });

    // Get public collections
    const { data: collections } = await supabase
      .from('collections')
      .select('id, name, description, cover_image_url, slug')
      .eq('user_id', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // Get recently vaulted public links
    const { data: recentLinks } = await supabase
      .from('links')
      .select('id, title, url, domain, thumbnail_url, favicon_url, created_at, link_tags(tags(name))')
      .eq('user_id', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({ user, collections: collections || [], recentLinks: recentLinks || [] });
  } catch (err) { next(err); }
});

// GET /api/public/:username/collections/:slug
router.get('/:username/collections/:slug', async (req, res, next) => {
  try {
    const { username, slug } = req.params;
    const { data: user } = await supabase.from('users').select('id').eq('username', username).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: collection } = await supabase
      .from('collections')
      .select('*, links(*, link_tags(tags(*)))')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .eq('is_public', true)
      .single();

    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) { next(err); }
});

export default router;
