import { Router } from 'express';
import { requireAuth, syncUser } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = Router();

// GET /api/teams - list user's teams
router.get('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get teams where user is a member
    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id, role, teams(id, name, created_at, owner_id)')
      .eq('user_id', user.id);

    // For each team, get member count
    const teams = await Promise.all(
      (memberships || []).map(async (m) => {
        const { count } = await supabase
          .from('team_members')
          .select('user_id', { count: 'exact' })
          .eq('team_id', m.team_id);

        const { count: sharedCount } = await supabase
          .from('collections')
          .select('id', { count: 'exact' })
          .eq('team_id', m.team_id);

        return {
          ...m.teams,
          role: m.role,
          member_count: count || 0,
          shared_collections: sharedCount || 0,
        };
      })
    );

    res.json(teams);
  } catch (err) { next(err); }
});

// POST /api/teams - create team
router.post('/', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id, plan').eq('clerk_id', clerkId).single();

    // Only pro/teams users can create teams
    if (user.plan === 'free') {
      return res.status(403).json({ error: 'Upgrade to Pro or Teams plan to create teams.' });
    }

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Team name is required' });

    const { data: team, error } = await supabase
      .from('teams')
      .insert({ name: name.trim(), owner_id: user.id })
      .select()
      .single();

    if (error) throw error;

    // Add owner as member
    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner',
    });

    res.status(201).json({ ...team, role: 'owner', member_count: 1, shared_collections: 0 });
  } catch (err) { next(err); }
});

// POST /api/teams/:id/invite - invite member by email
router.post('/:id/invite', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const teamId = req.params.id;

    // Check if user is owner/admin
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Only team owners and admins can invite members' });
    }

    const { email, role = 'member' } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });

    // Find user by email
    const { data: invitedUser } = await supabase
      .from('users')
      .select('id, email, display_name')
      .eq('email', email.trim())
      .single();

    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found. They need a LinkVault account first.' });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('user_id', invitedUser.id)
      .single();

    if (existing) return res.status(409).json({ error: 'User is already a team member' });

    // Add to team
    await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: invitedUser.id,
      role: role,
    });

    res.json({ success: true, invited: { email: invitedUser.email, display_name: invitedUser.display_name, role } });
  } catch (err) { next(err); }
});

// GET /api/teams/:id/members - get team members
router.get('/:id/members', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const teamId = req.params.id;

    // Verify membership
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return res.status(403).json({ error: 'Not a member of this team' });

    const { data: members } = await supabase
      .from('team_members')
      .select('role, joined_at, users(id, display_name, email, avatar_url, username)')
      .eq('team_id', teamId)
      .order('joined_at');

    res.json(members || []);
  } catch (err) { next(err); }
});

// DELETE /api/teams/:id/members/:userId - remove member
router.delete('/:id/members/:userId', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { id: teamId, userId: targetUserId } = req.params;

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only team owner can remove members' });
    }

    await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', targetUserId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/teams/:id/collections/:collectionId - share collection with team
router.post('/:id/collections/:collectionId', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const { id: teamId, collectionId } = req.params;

    // Verify team membership
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return res.status(403).json({ error: 'Not a member of this team' });

    // Verify collection ownership
    const { data: collection } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single();

    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    // Share with team
    const { data, error } = await supabase
      .from('collections')
      .update({ team_id: teamId })
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/teams/:id/collections - get team's shared collections
router.get('/:id/collections', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();
    const teamId = req.params.id;

    // Verify membership
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return res.status(403).json({ error: 'Not a member of this team' });

    const { data: collections } = await supabase
      .from('collections')
      .select('*, links(count), users(display_name, avatar_url)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    res.json(collections || []);
  } catch (err) { next(err); }
});

// DELETE /api/teams/:id
router.delete('/:id', requireAuth, syncUser, async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single();

    // Unshare all collections
    await supabase.from('collections').update({ team_id: null }).eq('team_id', req.params.id);
    // Remove members
    await supabase.from('team_members').delete().eq('team_id', req.params.id);
    // Delete team
    const { error } = await supabase.from('teams').delete().eq('id', req.params.id).eq('owner_id', user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
