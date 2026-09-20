const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL belum diset");
}

const isPostgres = /^postgres(ql)?:\/\//i.test(
    connectionString || ""
);

let pool;

// ============================================================
// DATABASE CONNECTION
// Supabase menggunakan PostgreSQL.
// Jika DATABASE_URL masih MySQL/MariaDB, tetap gunakan mysql2.
// ============================================================

if (isPostgres) {
    const { Pool } = require("pg");

    pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        max: 1,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000
    });

    pool.on("error", (err) => {
        console.error("PostgreSQL Pool Error:", err.message);
    });
} else {
    const mysql = require("mysql2/promise");

    pool = mysql.createPool({
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0,
        connectTimeout: 10000
    });

    pool.on("error", (err) => {
        console.error("MySQL Pool Error:", err.message);
    });
}

function isSelectQuery(sql) {
    return /^\s*(SELECT|WITH|SHOW|DESCRIBE|EXPLAIN)/i.test(sql);
}

function isInsertQuery(sql) {
    return /^\s*INSERT\b/i.test(sql);
}

// MySQL memakai ? sedangkan PostgreSQL memakai $1, $2, dst.
function convertPlaceholders(sql) {
    let index = 0;

    return sql.replace(/\?/g, () => {
        index += 1;
        return `$${index}`;
    });
}

async function query(sql, params = []) {
    try {
        const values = Array.isArray(params) ? params : [params];

        // ========================================================
        // POSTGRESQL / SUPABASE
        // ========================================================
        if (isPostgres) {
            let postgresSql = convertPlaceholders(sql);

            // Model lama menggunakan result.insertId seperti MySQL.
            // RETURNING dipakai agar ID tetap tersedia di PostgreSQL.
            if (
                isInsertQuery(postgresSql) &&
                !/\bRETURNING\b/i.test(postgresSql)
            ) {
                postgresSql += " RETURNING *";
            }

            const result = await pool.query(
                postgresSql,
                values
            );

            if (isSelectQuery(postgresSql)) {
                return [result.rows, result.fields];
            }

            return [
                {
                    rows: result.rows,
                    insertId: isInsertQuery(postgresSql)
                        ? Number(result.rows?.[0]?.id || 0)
                        : null,
                    affectedRows: Number(result.rowCount || 0)
                },
                result.fields
            ];
        }

        // ========================================================
        // MYSQL / MARIADB
        // ========================================================
        const [result, fields] = await pool.execute(
            sql,
            values
        );

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
