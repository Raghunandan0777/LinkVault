import { Router } from 'express';
import { requireAuth, syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { enrichUrl } from '../utils/enrichUrl.js';

const router = Router();

// ── Tag routes (MUST be above /:id to avoid route shadowing) ──

// GET /api/links/tags/all - get user tags
router.get('/tags/all', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { data, error } = await supabase.from('tags').select('*').eq('user_id', user.id).order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/links/tags/create - create tag
router.post('/tags/create', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { name, color_hex } = req.body;
    const { data, error } = await supabase.from('tags').insert({ user_id: user.id, name, color_hex: color_hex || '#6366F1' }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// GET /api/links/enrich - enrich a URL (for client-side preview)
router.get('/enrich', requireAuth, async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const enriched = await enrichUrl(url);
    res.json(enriched);
  } catch (err) { next(err); }
});

// GET /api/links - list user's links
router.get('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { search, tag, collection_id, folder, page = 1, limit = 50, sort = 'created_at' } = req.query;

    // Get user
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let query = supabase
      .from('links')
      .select(`*, link_tags(tags(id, name, color_hex)), collections(id, name)`)
      .eq('user_id', user.id)
      .order(sort, { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.ilike('title', `%${search}%`);
    if (collection_id) query = query.eq('collection_id', collection_id);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ links: data, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/links/:id
router.get('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();

    const { data, error } = await supabase
      .from('links')
      .select(`*, link_tags(tags(*)), collections(*)`)
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Link not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/links - create link
router.post('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { url, title, description, collection_id, tags, notes, is_public } = req.body;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    const { data: user } = await supabase.from('users').select('id, plan').eq('clerk_id', clerkId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check free tier limit
    if (user.plan === 'free') {
      const { count } = await supabase.from('links').select('id', { count: 'exact' }).eq('user_id', user.id);
      if (count >= 200) return res.status(403).json({ error: 'Free plan limit (200 links) reached. Upgrade to Pro.' });
    }

    // Enrich URL in background
    const enriched = await enrichUrl(url);

    const linkData = {
      user_id: user.id,
      url,
      title: title || enriched.title,
      description: description || enriched.description,
      thumbnail_url: enriched.thumbnail_url,
      favicon_url: enriched.favicon_url,
      domain: enriched.domain,
      collection_id: collection_id || null,
      notes: notes || null,
      is_public: is_public || false,
      click_count: 0,
    };

    const { data: link, error } = await supabase.from('links').insert(linkData).select().single();
    if (error) throw error;

    // Add tags
    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tagId => ({ link_id: link.id, tag_id: tagId }));
      await supabase.from('link_tags').insert(tagInserts);
    }

    // Record click analytics
    await supabase.from('link_saves').insert({ user_id: user.id, link_id: link.id });

    // Re-query with joins so frontend gets complete data for instant display
    const { data: fullLink } = await supabase
      .from('links')
      .select('*, link_tags(tags(id, name, color_hex)), collections(id, name)')
      .eq('id', link.id)
      .single();

    res.status(201).json(fullLink || link);
  } catch (err) { next(err); }
});

// PATCH /api/links/:id
router.patch('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { title, description, notes, is_public, collection_id, tags } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (notes !== undefined) updates.notes = notes;
    if (is_public !== undefined) updates.is_public = is_public;
    if (collection_id !== undefined) updates.collection_id = collection_id;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update tags if provided
    if (tags !== undefined) {
      await supabase.from('link_tags').delete().eq('link_id', req.params.id);
      if (tags.length > 0) {
        await supabase.from('link_tags').insert(tags.map(t => ({ link_id: req.params.id, tag_id: t })));
      }
    }

    res.json(data);
  } catch (err) { next(err); }
});

// DELETE /api/links/:id
router.delete('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();

    const { error } = await supabase.from('links').delete().eq('id', req.params.id).eq('user_id', user.id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/links/:id/click - track click
router.post('/:id/click', async (req, res, next) => {
  try {
    const { country_code, referrer } = req.body;
    await supabase.from('link_clicks').insert({
      link_id: req.params.id,
      clicked_at: new Date().toISOString(),
      country_code: country_code || null,
      referrer: referrer || null,
    });
    // Increment click count
    await supabase.rpc('increment_click_count', { link_id_param: req.params.id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Tag routes moved above /:id — see top of file

export default router;
