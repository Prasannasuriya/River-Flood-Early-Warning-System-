const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'flood_system.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs();
    let db;

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    dbInstance = {
        db,
        save() {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(DB_PATH, buffer);
        },
        all(sqlQuery, params = []) {
            try {
                const stmt = db.prepare(sqlQuery);
                if (params.length) stmt.bind(params);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            } catch (err) {
                console.error("DB Query Error:", err, sqlQuery);
                throw err;
            }
        },
        get(sqlQuery, params = []) {
            const res = this.all(sqlQuery, params);
            return res.length > 0 ? res[0] : null;
        },
        run(sqlQuery, params = []) {
            try {
                db.run(sqlQuery, params);
                this.save();
                // Return last inserted ID or changes count
                const lastIdRes = db.exec("SELECT last_insert_rowid() AS id");
                const lastId = lastIdRes[0]?.values[0][0] || null;
                return { lastInsertRowid: lastId, success: true };
            } catch (err) {
                console.error("DB Exec Error:", err, sqlQuery);
                throw err;
            }
        },
        execScript(script) {
            db.exec(script);
            this.save();
        }
    };

    // Ensure Schema & Seed
    initSchemaAndSeed(dbInstance);

    return dbInstance;
}

function initSchemaAndSeed(db) {
    if (fs.existsSync(SCHEMA_PATH)) {
        const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        db.execScript(schemaSql);
    }

    const countRes = db.get("SELECT COUNT(*) AS count FROM readings");
    if (!countRes || countRes.count === 0) {
        if (fs.existsSync(SEED_PATH)) {
            console.log("Seeding initial 40 records into database...");
            const seedSql = fs.readFileSync(SEED_PATH, 'utf-8');
            db.execScript(seedSql);
        }
    }
}

module.exports = { getDb };
