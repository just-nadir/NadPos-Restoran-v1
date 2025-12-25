const { db } = require('./database.cjs');
const log = require('electron-log');

const CLOUD_API_URL = 'https://halboldi.uz/api'; // Production URL
const SYNC_INTERVAL_MS = 10000; // 10 seconds

let isSyncing = false;

// Tables to sync
const TABLES = [
    'users', 'kitchens', 'halls', 'tables', 'categories', 'products',
    'customers', 'sales', 'sale_items', 'shifts', 'settings', 'sms_templates', 'sms_logs'
];

let mainWindow = null;

function setMainWindow(win) {
    mainWindow = win;
}

function notifyUI(status, lastSync) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('sync-status', { status, lastSync });
    }
}

function getCredentials() {
    try {
        const idRow = db.prepare("SELECT value FROM settings WHERE key = 'restaurant_id'").get();
        const keyRow = db.prepare("SELECT value FROM settings WHERE key = 'access_key'").get();

        if (idRow && keyRow) {
            return { restaurantId: idRow.value, accessKey: keyRow.value };
        }
    } catch (e) {
        log.error("Credential fetch error:", e);
    }
    return null;
}

async function pushChanges() {
    const creds = getCredentials();
    if (!creds) {
        console.log("⏳ Sync Skipped: No credentials found.");
        return false;
    }
    const { restaurantId, accessKey } = creds;

    const payload = {
        restaurantId,
        tables: {}
    };
    let hasChanges = false;
    let recordCounts = {};

    // 1. Collect Unsynced Data
    for (const table of TABLES) {
        try {
            const rows = db.prepare(`SELECT * FROM ${table} WHERE is_synced = 0 LIMIT 50`).all();
            if (rows.length > 0) {
                payload.tables[table] = rows;
                recordCounts[table] = rows.length;
                hasChanges = true;
            }
        } catch (e) {
            log.warn(`Sync: Table ${table} check failed`, e);
        }
    }

    if (!hasChanges) return false;

    console.log("📤 Pushing changes:", recordCounts);
    notifyUI('syncing', null);

    // 2. Send to Cloud
    try {
        const response = await fetch(`${CLOUD_API_URL}/sync/push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-key': accessKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Cloud error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
            console.log("✅ Sync Success. Marking records...");
            markAsSynced(payload.tables);
            notifyUI('online', new Date().toISOString());
            return true;
        }

    } catch (e) {
        log.error("Sync Push Error:", e);
        console.error("Sync Push Error:", e);
        notifyUI('error', null);
    }
    return false;
}

function markAsSynced(tablesData) {
    db.transaction(() => {
        for (const [table, rows] of Object.entries(tablesData)) {
            if (table === 'settings') {
                const stmt = db.prepare(`UPDATE settings SET is_synced = 1 WHERE key = ?`);
                for (const row of rows) {
                    stmt.run(row.key);
                }
            } else {
                const stmt = db.prepare(`UPDATE ${table} SET is_synced = 1 WHERE id = ?`);
                for (const row of rows) {
                    if (row.id) stmt.run(row.id);
                }
            }
        }
    })();
}

let heartbeatCounter = 0;

function startSyncService() {
    console.log("🔄 Sync Service Started...");
    setInterval(async () => {
        if (isSyncing) return;
        isSyncing = true;

        const pushed = await pushChanges();
        const pulled = await pullChanges();

        // Always notify online if we successfully checked (didn't catch an error)
        // Since error states are handled inside push/pull, if we are here we are "online"
        if (!pushed && !pulled) {
            const creds = getCredentials();
            if (creds) { // Only notify online if we are actually allowed to sync
                notifyUI('online', new Date().toISOString());

                heartbeatCounter++;
                if (heartbeatCounter >= 6) { // Every 1 minute
                    console.log(`💓 Sync Heartbeat: ${new Date().toLocaleTimeString()} (All synced)`);
                    heartbeatCounter = 0;
                }
            }
        }

        isSyncing = false;
    }, SYNC_INTERVAL_MS);
}

async function pullChanges() {
    const creds = getCredentials();
    if (!creds) return false;
    const { restaurantId, accessKey } = creds;

    // 1. Get last pulled time
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'last_pulled_at'").get();
    const lastPulledAt = setting ? setting.value : '1970-01-01T00:00:00.000Z';

    // 2. Fetch from Cloud
    try {
        const queryParams = new URLSearchParams({
            restaurantId: restaurantId,
            lastSyncTime: lastPulledAt
        });

        const response = await fetch(`${CLOUD_API_URL}/sync/pull?${queryParams}`, {
            headers: { 'x-access-key': accessKey }
        });
        if (!response.ok) {
            throw new Error(`Cloud error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const tables = data.changes || {};

        if (Object.keys(tables).length === 0) return; // No updates

        console.log("📥 Pulling changes:", Object.keys(tables));

        // 3. Apply changes to Local DB
        applyChanges(tables);

        // 4. Update timestamp
        const now = new Date().toISOString();
        db.prepare("INSERT INTO settings (key, value) VALUES ('last_pulled_at', ?) ON CONFLICT(key) DO UPDATE SET value = ?").run(now, now);
        console.log("✅ Pull Success. Updated to:", now);
        notifyUI('online', now);
        return true;

    } catch (e) {
        log.error("Sync Pull Error:", e);
        console.error("Sync Pull Error:", e);
        notifyUI('error', null);
    }
    return false;
}

function applyChanges(tablesData) {
    db.transaction(() => {
        for (const [table, rows] of Object.entries(tablesData)) {
            // Skip invalid tables
            if (!TABLES.includes(table)) continue;

            for (const row of rows) {
                // Remove server-specific fields not in local schema if any (e.g. deleted_at might be handled differently, but schema matches mostly)
                // Local schema: id, ..., is_synced.
                // Server schema: id, ..., deleted_at.

                // We must ensure 'is_synced' = 1 for these records
                const record = { ...row, is_synced: 1 };

                // Remove fields that might cause issues or generate dynamically
                // server_id is local only, but server doesn't send it. 
                // restaurant_id is in schema.

                // Construct INSERT OR REPLACE
                // We need to know columns. 
                // Simplest way: use dynamic columns from the row keys that exist in DB.
                // But safer to assume row keys match columns.

                const columns = Object.keys(record);
                const placeholders = columns.map(() => '?').join(',');
                const setClause = columns.map(c => `${c}=excluded.${c}`).join(',');

                // We need to filter keys that actually exist in local DB? 
                // Assuming sync guarantees schema match. 
                // EXCEPT: 'is_synced' is local. 'record' has it.
                // 'server_id' is local. Server doesn't send it.
                // 'deleted_at' is both.

                // Clean record for Settings table 
                if (table === 'settings') {
                    // Settings PK is key.
                    db.prepare(`INSERT INTO settings (key, value, updated_at, is_synced) VALUES (@key, @value, @updated_at, 1) 
                        ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at, is_synced=1`).run(record);
                } else {
                    // Generic table PK is id.
                    // Filter out keys not in valid payload? 
                    // For now trust the payload matches.

                    // Use better-sqlite3 named parameters helper if possible, or dynamic
                    // INSERT OR REPLACE INTO table (col1, col2) VALUES (@col1, @col2)
                    const cols = Object.keys(record).map(k => `"${k}"`).join(',');
                    const vals = Object.keys(record).map(k => `@${k}`).join(',');

                    try {
                        db.prepare(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) 
                            ON CONFLICT(id) DO UPDATE SET ${Object.keys(record).map(k => `"${k}"=@${k}`).join(',')}`).run(record);
                    } catch (err) {
                        console.error(`Failed to apply sync for ${table} ${row.id}`, err);
                    }
                }
            }
        }
    })();
}

module.exports = { startSyncService, pushChanges, pullChanges, setMainWindow };
