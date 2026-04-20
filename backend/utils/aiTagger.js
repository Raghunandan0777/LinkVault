import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_TAGS = {
  'github.com': ['Development', 'Open Source'],
  'stackoverflow.com': ['Development', 'Q&A'],
  'medium.com': ['Article', 'Blog'],
  'youtube.com': ['Video', 'Entertainment'],
  'twitter.com': ['Social Media'],
  'x.com': ['Social Media'],
  'reddit.com': ['Community', 'Discussion'],
  'dev.to': ['Development', 'Blog'],
  'figma.com': ['Design', 'UI/UX'],
  'dribbble.com': ['Design', 'Inspiration'],
  'behance.net': ['Design', 'Portfolio'],
  'npmjs.com': ['Development', 'Package'],
  'docs.google.com': ['Document', 'Productivity'],
  'notion.so': ['Productivity', 'Notes'],
  'vercel.com': ['Development', 'Hosting'],
  'netlify.com': ['Development', 'Hosting'],
  'aws.amazon.com': ['Cloud', 'Infrastructure'],
  'linkedin.com': ['Professional', 'Social Media'],
  'instagram.com': ['Social Media', 'Visual'],
  'producthunt.com': ['Startup', 'Product'],
};

/**
 * Uses Gemini Flash to auto-classify a link into 2-3 semantic tags.
 * Falls back to domain-based heuristics if API fails or key is missing.
 */
export async function generateAITags({ title, description, domain, url }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Try domain-based fallback first if no API key
  if (!apiKey) {
    console.log('[AI Tagger] No GEMINI_API_KEY set — using domain fallback');
    return getDomainFallbackTags(domain, title);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a link classification engine. Given a saved bookmark, suggest exactly 2-3 short category tags (1-2 words each).

Link details:
- Title: "${title || 'Untitled'}"
- Description: "${(description || '').slice(0, 200)}"
- Domain: "${domain || 'unknown'}"
- URL: "${url}"

Rules:
- Return ONLY a JSON array of strings, e.g. ["Design", "UI/UX", "Inspiration"]
- Tags should be general categories, NOT specific to this link
- Use Title Case
- Maximum 3 tags
- No explanations, just the JSON array`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse the JSON array from response
    const match = text.match(/\[.*\]/s);
    if (match) {
      const tags = JSON.parse(match[0]);
      if (Array.isArray(tags) && tags.length > 0) {
        return tags.slice(0, 3).map(t => String(t).trim()).filter(Boolean);
      }
    }

    console.warn('[AI Tagger] Could not parse AI response:', text);
    return getDomainFallbackTags(domain, title);
  } catch (err) {
    console.error('[AI Tagger] Gemini API error:', err.message);
    return getDomainFallbackTags(domain, title);
  }
}

/**
 * Fallback: generates simple tags based on domain and title keywords.
 */
function getDomainFallbackTags(domain, title) {
  const cleanDomain = (domain || '').replace('www.', '');
  
  // Check direct domain match
  for (const [key, tags] of Object.entries(FALLBACK_TAGS)) {
    if (cleanDomain.includes(key)) return tags;
  }

  // Keyword-based fallback from title
  const lower = (title || '').toLowerCase();
  const keywordMap = {
    'tutorial': 'Tutorial', 'guide': 'Guide', 'docs': 'Documentation',
    'api': 'API', 'design': 'Design', 'react': 'React', 'next': 'Next.js',
    'python': 'Python', 'javascript': 'JavaScript', 'typescript': 'TypeScript',
    'css': 'CSS', 'html': 'HTML', 'node': 'Node.js', 'database': 'Database',
    'ai': 'AI/ML', 'machine learning': 'AI/ML', 'startup': 'Startup',
    'product': 'Product', 'marketing': 'Marketing', 'seo': 'SEO',
    'video': 'Video', 'podcast': 'Podcast', 'news': 'News',
    'tool': 'Tool', 'free': 'Resource', 'open source': 'Open Source',
  };

  const matched = [];
  for (const [keyword, tag] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      matched.push(tag);
      if (matched.length >= 2) break;
    }
  }

  return matched.length > 0 ? matched : ['Bookmark'];
}
