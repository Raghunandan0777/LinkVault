import { Router } from 'express';
import { requireAuth, syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { enrichUrl } from '../utils/enrichUrl.js';
import { generateAITags } from '../utils/aiTagger.js';
import { checkUserLinks } from '../utils/healthChecker.js';

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

// GET /api/links/health-check - check health of user's links (MUST be above /:id)
router.get('/health-check', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await checkUserLinks(user.id);
    res.json(result);
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

    // Check for duplicate URL
    const { data: existingLink } = await supabase
      .from('links')
      .select('id, title, url, domain, created_at')
      .eq('user_id', user.id)
      .eq('url', url)
      .single();

    if (existingLink && !req.body.force_save) {
      return res.status(409).json({
        error: 'duplicate',
        message: 'This URL is already in your vault',
        existing_link: existingLink,
      });
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

    // AI auto-tagging: generate semantic tags from enriched metadata (Pro feature)
    let allTagIds = [...(tags || [])];
    if (user.plan !== 'free') {
      try {
        const aiTagNames = await generateAITags({
          title: linkData.title,
          description: linkData.description,
          domain: linkData.domain,
          url,
        });

        if (aiTagNames.length > 0) {
          for (const tagName of aiTagNames) {
            // Check if tag already exists for this user
            const { data: existing } = await supabase
              .from('tags')
              .select('id')
              .eq('user_id', user.id)
              .ilike('name', tagName)
              .single();

            if (existing) {
              if (!allTagIds.includes(existing.id)) allTagIds.push(existing.id);
            } else {
              // Auto-create the tag
              const TAG_COLORS = ['#8B5CF6','#F472B6','#34D399','#FBBF24','#0EA5E9','#14B8A6','#F97316','#EF4444'];
              const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
              const { data: newTag } = await supabase
                .from('tags')
                .insert({ user_id: user.id, name: tagName, color_hex: color })
                .select()
                .single();
              if (newTag) allTagIds.push(newTag.id);
            }
          }
        }
      } catch (aiErr) {
        console.error('[AI Tagger] Error during auto-tagging:', aiErr.message);
      }
    }

    // Add all tags (manual + AI)
    if (allTagIds.length > 0) {
      const uniqueIds = [...new Set(allTagIds)];
      const tagInserts = uniqueIds.map(tagId => ({ link_id: link.id, tag_id: tagId }));
      await supabase.from('link_tags').insert(tagInserts);
    }

    // Record save analytics
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


// POST /api/links/import - import bookmarks from HTML file
router.post('/import', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id, plan').eq('clerk_id', clerkId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'HTML content is required' });

    // Parse bookmarks from HTML (Chrome/Firefox format)
    const { load } = await import('cheerio');
    const $ = load(html);
    const bookmarks = [];

    $('a[href]').each((_, el) => {
      const url = $(el).attr('href');
      const title = $(el).text().trim();
      if (url && url.startsWith('http')) {
        bookmarks.push({ url, title: title || url });
      }
    });

    if (bookmarks.length === 0) return res.status(400).json({ error: 'No bookmarks found in the file' });

    // Check free tier limit
    if (user.plan === 'free') {
      const { count } = await supabase.from('links').select('id', { count: 'exact' }).eq('user_id', user.id);
      const remaining = 200 - (count || 0);
      if (remaining <= 0) return res.status(403).json({ error: 'Free plan limit (200 links) reached.' });
      bookmarks.splice(remaining); // trim to remaining capacity
    }

    // Limit to 500 per import
    const toImport = bookmarks.slice(0, 500);
    let imported = 0;
    let skipped = 0;

    for (const bm of toImport) {
      try {
        // Check for duplicate
        const { data: existing } = await supabase.from('links').select('id').eq('user_id', user.id).eq('url', bm.url).single();
        if (existing) { skipped++; continue; }

        // Basic enrichment (just domain + favicon, skip full scraping for speed)
        let domain = 'unknown';
        let favicon_url = null;
        try {
          const parsed = new URL(bm.url);
          domain = parsed.hostname;
          favicon_url = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
        } catch {}

        await supabase.from('links').insert({
          user_id: user.id,
          url: bm.url,
          title: bm.title,
          domain,
          favicon_url,
          click_count: 0,
          is_public: false,
        });
        imported++;
      } catch { skipped++; }
    }

    res.json({ success: true, imported, skipped, total: toImport.length });
  } catch (err) { next(err); }
});

// GET /api/links/export - export links as JSON
router.get('/export', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { format = 'json' } = req.query;

    const { data: links } = await supabase
      .from('links')
      .select('url, title, description, domain, notes, is_public, click_count, created_at, link_tags(tags(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (format === 'csv') {
      const header = 'URL,Title,Description,Domain,Tags,Notes,Public,Clicks,Created\n';
      const rows = (links || []).map(l => {
        const tags = l.link_tags?.map(lt => lt.tags?.name).filter(Boolean).join(';') || '';
        return [l.url, l.title, l.description, l.domain, tags, l.notes, l.is_public, l.click_count, l.created_at]
          .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`)
          .join(',');
      }).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="linkvault-export.csv"');
      return res.send(header + rows);
    }

    // JSON format
    const clean = (links || []).map(l => ({
      url: l.url, title: l.title, description: l.description, domain: l.domain,
      tags: l.link_tags?.map(lt => lt.tags?.name).filter(Boolean) || [],
      notes: l.notes, is_public: l.is_public, click_count: l.click_count, created_at: l.created_at,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="linkvault-export.json"');
    res.json({ exported_at: new Date().toISOString(), count: clean.length, links: clean });
  } catch (err) { next(err); }
});

// POST /api/links/search/ai - AI semantic search
router.post('/search/ai', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Search query is required' });

    // Get all user's links
    const { data: links } = await supabase
      .from('links')
      .select('id, url, title, description, domain, thumbnail_url, favicon_url, click_count, created_at, link_tags(tags(id, name, color_hex))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (!links || links.length === 0) return res.json({ results: [], query });

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback: simple keyword search across title + description + domain
      const q = query.toLowerCase();
      const results = links.filter(l =>
        (l.title || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (l.domain || '').toLowerCase().includes(q) ||
        l.link_tags?.some(lt => (lt.tags?.name || '').toLowerCase().includes(q))
      ).slice(0, 10);
      return res.json({ results, query, method: 'keyword' });
    }

    // Use Gemini to rank links by semantic relevance
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const linkSummaries = links.slice(0, 100).map((l, i) => {
      const tags = l.link_tags?.map(lt => lt.tags?.name).filter(Boolean).join(', ') || '';
      return `[${i}] "${l.title || 'Untitled'}" - ${l.domain || ''} ${tags ? `(${tags})` : ''}`;
    }).join('\n');

    const prompt = `You are a bookmark search engine. Given a user's search query and their saved bookmarks, return the indexes of the most relevant bookmarks.

Search query: "${query}"

Bookmarks:
${linkSummaries}

Return ONLY a JSON array of the top 10 most relevant bookmark indexes, ordered by relevance. Example: [5, 12, 3, 0, 8]
If no bookmarks are relevant, return [].`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const match = text.match(/\[.*\]/s);

      if (match) {
        const indexes = JSON.parse(match[0]);
        const results = indexes
          .filter(i => typeof i === 'number' && i >= 0 && i < links.length)
          .slice(0, 10)
          .map(i => links[i]);
        return res.json({ results, query, method: 'ai' });
      }
    } catch (aiErr) {
      console.error('[AI Search] Gemini error:', aiErr.message);
    }

    // Fallback if AI fails
    const q = query.toLowerCase();
    const results = links.filter(l =>
      (l.title || '').toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q) ||
      (l.domain || '').toLowerCase().includes(q)
    ).slice(0, 10);
    res.json({ results, query, method: 'keyword_fallback' });
  } catch (err) { next(err); }
});

export default router;
