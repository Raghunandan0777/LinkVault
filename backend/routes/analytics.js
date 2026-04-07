import { Router } from 'express';
import {  syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();

// GET /api/analytics/overview
router.get('/overview', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id, plan').eq('clerk_id', clerkId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Total links
    const { count: totalLinks } = await supabase.from('links').select('id', { count: 'exact' }).eq('user_id', user.id);

    // Total clicks (all time)
    const { data: clickSum } = await supabase.from('links').select('click_count').eq('user_id', user.id);
    const totalClicks = clickSum?.reduce((sum, l) => sum + (l.click_count || 0), 0) || 0;

    // Profile views (from link_clicks on public links)
    const { count: profileViews } = await supabase
      .from('profile_views')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('viewed_at', since);

    // Daily clicks for chart (last 30 days)
    const linkIds = (await supabase.from('links').select('id').eq('user_id', user.id)).data?.map(l => l.id) || [];
    let dailyClicks = [];
    
    if (linkIds.length > 0) {
      const { data } = await supabase
        .from('link_clicks')
        .select('clicked_at, link_id')
        .in('link_id', linkIds)
        .gte('clicked_at', since)
        .order('clicked_at');
      dailyClicks = data || [];
    }


    // Group by day
    const clicksByDay = {};
    (dailyClicks || []).forEach(click => {
      const day = click.clicked_at.split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    });

    const chartData = Array.from({ length: Number(days) }, (_, i) => {
      const date = new Date(Date.now() - (Number(days) - 1 - i) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      return { date: key, clicks: clicksByDay[key] || 0 };
    });

    // Top links by clicks
    const { data: topLinks } = await supabase
      .from('links')
      .select('id, title, url, domain, thumbnail_url, favicon_url, click_count, created_at')
      .eq('user_id', user.id)
      .order('click_count', { ascending: false })
      .limit(10);

    // Tag distribution
    const { data: allLinks } = await supabase
      .from('links')
      .select('link_tags(tags(name))')
      .eq('user_id', user.id);

    const tagCounts = {};
    allLinks?.forEach(link => {
      link.link_tags?.forEach(lt => {
        const name = lt.tags?.name;
        if (name) tagCounts[name] = (tagCounts[name] || 0) + 1;
      });
    });

    const tagDistribution = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const total = tagDistribution.reduce((s, t) => s + t.count, 0);
    const tagDistributionPct = tagDistribution.map(t => ({
      ...t,
      percent: total ? Math.round((t.count / total) * 100) : 0,
    }));

    res.json({
      totalLinks,
      totalClicks,
      profileViews: profileViews || 0,
      topCategory: tagDistribution[0]?.name || 'None',
      chartData,
      topLinks: topLinks || [],
      tagDistribution: tagDistributionPct,
    });
  } catch (err) { next(err); }
});

export default router;
