import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const extDir = path.join(process.cwd(), 'public', 'extension_src');
const zipPath = path.join(process.cwd(), 'public', 'linkvault-extension.zip');

if (!fs.existsSync(extDir)) {
  fs.mkdirSync(extDir, { recursive: true });
}

fs.writeFileSync(path.join(extDir, 'manifest.json'), JSON.stringify({
  manifest_version: 3,
  name: 'LinkVault Extension',
  version: '1.0',
  description: 'Save links to your vault directly from your browser.',
  action: { default_popup: 'popup.html' },
  permissions: ['activeTab', 'storage']
}, null, 2));

const html = `<!DOCTYPE html><html><head><style>
body { width: 300px; padding: 15px; font-family: sans-serif; text-align: center; border: 2px solid #1E293B; border-radius: 12px; background: #FFFDF5; }
h2 { font-weight: 800; color: #1E293B; }
p { font-size: 14px; color: #64748B; }
button { background: #8B5CF6; color: white; border: 2px solid #1E293B; box-shadow: 3px 3px 0px 0px #1E293B; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
button:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0px 0px #1E293B; }
</style></head>
<body>
  <h2>LinkVault</h2>
  <p>Save pages to your vault.</p>
  <button id="saveBtn">Save to Vault</button>
  <script>
    document.getElementById("saveBtn").onclick = () => { alert("Feature coming soon!"); window.close(); };
  </script>
</body></html>`;

fs.writeFileSync(path.join(extDir, 'popup.html'), html);

try {
  // Try tar command (available natively on modern Windows 10/11)
  execSync(`tar -a -c -f "${zipPath}" -C "${extDir}" *`);
  console.log("Zip created successfully.");
} catch (e) {
  // Fallback to powershell Compress-Archive
  console.log("Tar failed, trying PowerShell Compress-Archive...");
  execSync(`powershell -command "Compress-Archive -Path '${extDir}\\*' -DestinationPath '${zipPath}' -Force"`);
  console.log("Zip created with powershell.");
}

// Clean up
try { fs.rmSync(extDir, { recursive: true, force: true }); } catch (e) {}
console.log('Done!');
