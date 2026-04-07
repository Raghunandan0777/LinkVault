import { getAuth } from '@clerk/express';
import supabase from '../config/supabase.js';

// Custom requireAuth middleware (replaces @clerk/express requireAuth which hangs on Express 5)
export const requireAuth = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.auth = auth;
  next();
};

// Sync Clerk user to Supabase
export const syncUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    if (!userId) return next();

    await supabase
      .from('users')
      .upsert({ clerk_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'clerk_id' });

    next();
  } catch (err) {
    next(err);
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      req.auth = auth;
    }
  } catch {
    // Continue without auth
  }
  next();
};
