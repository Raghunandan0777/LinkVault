// LinkVault Browser Extension - Popup Script

const $ = (id) => document.getElementById(id);

// Storage helpers
async function getConfig() {
  const result = await chrome.storage.local.get(['apiUrl', 'authToken']);
  return {
    apiUrl: result.apiUrl || '',
    authToken: result.authToken || '',
  };
}

async function saveConfig(apiUrl, authToken) {
  await chrome.storage.local.set({ apiUrl, authToken });
}

// API helper
async function apiCall(endpoint, method = 'GET', body = null) {
  const config = await getConfig();
  if (!config.apiUrl || !config.authToken) throw new Error('Not connected');

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.authToken}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${config.apiUrl}${endpoint}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Status display
function showStatus(type, message) {
  const el = $('status');
  el.className = `status ${type}`;
  el.innerHTML = type === 'loading'
    ? `<div class="spinner"></div>${message}`
    : message;
}

function hideStatus() {
  $('status').className = 'status';
  $('status').innerHTML = '';
}

// Initialize
async function init() {
  try {
    const cookie = await new Promise(resolve => {
      chrome.cookies.get({ url: 'http://localhost:5173', name: '__session' }, resolve);
    });
    if (cookie && cookie.value) {
      await saveConfig('http://localhost:5000/api', cookie.value);
    }
  } catch (e) {
    console.log("Could not auto-fetch connect token.");
  }

  const config = await getConfig();

  if (config.apiUrl && config.authToken) {
    showMainView();
  } else {
    showSetupView();
  }
}

function showSetupView() {
  $('setupView').classList.remove('hidden');
  $('mainView').classList.add('hidden');
}

async function showMainView() {
  $('setupView').classList.add('hidden');
  $('mainView').classList.remove('hidden');

  // Get current tab info
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      $('pageTitle').textContent = tab.title || 'Untitled';
      $('pageUrl').textContent = tab.url;
      try {
        const url = new URL(tab.url);
        $('pageDomain').textContent = url.hostname;
        $('pageFavicon').src = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
      } catch {
        $('pageDomain').textContent = 'unknown';
      }
    }
  } catch {}

  // Load collections
  try {
    const collections = await apiCall('/collections');
    const select = $('collectionSelect');
    select.innerHTML = '<option value="">No collection</option>';
    (collections || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.log('Could not load collections:', err.message);
  }
}

// Connect account
$('connectBtn').addEventListener('click', async () => {
  const apiUrl = $('apiUrl').value.trim();
  const authToken = $('authToken').value.trim();

  if (!apiUrl || !authToken) {
    alert('Please fill in both fields');
    return;
  }

  $('connectBtn').disabled = true;
  $('connectBtn').textContent = '🔄 Connecting...';

  try {
    // Test the connection
    const res = await fetch(`${apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) throw new Error('Invalid token or URL');

    await saveConfig(apiUrl, authToken);
    $('badge').textContent = 'Connected';
    $('badge').style.background = '#34D39920';
    $('badge').style.color = '#059669';
    showMainView();
  } catch (err) {
    alert(`Connection failed: ${err.message}`);
  } finally {
    $('connectBtn').disabled = false;
    $('connectBtn').textContent = '🔗 Connect Account';
  }
});

// Save link
$('saveBtn').addEventListener('click', async () => {
  const btn = $('saveBtn');
  btn.disabled = true;
  showStatus('loading', 'Saving to your vault...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) throw new Error('No active tab');

    const body = { url: tab.url };
    const collectionId = $('collectionSelect').value;
    if (collectionId) body.collection_id = collectionId;

    const result = await apiCall('/links', 'POST', body);

    // Show AI tags if present
    if (result.link_tags?.length > 0) {
      const tagsEl = $('aiTags');
      tagsEl.innerHTML = '';
      result.link_tags.forEach(lt => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = lt.tags?.name || 'Tag';
        if (lt.tags?.color_hex) {
          tag.style.background = `${lt.tags.color_hex}15`;
          tag.style.color = lt.tags.color_hex;
          tag.style.borderColor = `${lt.tags.color_hex}30`;
        }
        tagsEl.appendChild(tag);
      });
    }

    showStatus('success', '✅ Saved to LinkVault! AI tags applied.');
    btn.textContent = '✅ Saved!';
    btn.style.background = '#34D399';

    // Auto-close after 2 seconds
    setTimeout(() => window.close(), 2000);
  } catch (err) {
    showStatus('error', `❌ ${err.message}`);
    btn.disabled = false;
    btn.textContent = '⚡ Save to Vault';
  }
});

// Settings link
$('settingsLink').addEventListener('click', () => {
  showSetupView();
  $('badge').textContent = 'Settings';
});

// Init
init();
