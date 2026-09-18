const mysql = require("mysql2/promise");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL belum diset");
}

const pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    connectTimeout: 10000
});

pool.on("error", (err) => {
    console.error("MariaDB Pool Error:", err.message);
});

function isSelectQuery(sql) {
    return /^\s*(SELECT|WITH|SHOW|DESCRIBE|EXPLAIN)/i.test(sql);
}

function isInsertQuery(sql) {
    return /^\s*INSERT\b/i.test(sql);
}

async function query(sql, params = []) {
    try {
        const values = Array.isArray(params) ? params : [params];

        const [result, fields] = await pool.execute(sql, values);

        if (isSelectQuery(sql)) {
            return [result, fields];
        }

        return [
            {
                ...result,
                insertId: result.insertId
                    ? Number(result.insertId)
                    : null,
                affectedRows: Number(result.affectedRows || 0)
            },
            fields
        ];
    } catch (error) {
        console.error("DATABASE QUERY ERROR:");
        console.error("SQL:", sql);
        console.error("ERROR:", error.message);
        throw error;
    }
}

module.exports = {
    query,
    pool
};