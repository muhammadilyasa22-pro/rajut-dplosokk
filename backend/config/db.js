const { Pool } = require("pg");

const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${encodeURIComponent(process.env.DB_USER || "postgres")}:${encodeURIComponent(process.env.DB_PASSWORD || "")}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "postgres"}`;

const pool = new Pool({
    connectionString,
    ssl:
        process.env.PG_SSL === "true" ||
        connectionString.includes("supabase.com")
            ? { rejectUnauthorized: false }
            : false
});

function isSelectQuery(sql) {
    return /^\s*(SELECT|WITH|SHOW|DESCRIBE|EXPLAIN)/i.test(sql);
}

function isInsertQuery(sql) {
    return /^\s*INSERT\b/i.test(sql);
}

function transformQuestionMarks(sql, params = []) {
    let index = 0;
    const transformed = sql.replace(/\?/g, () => {
        index += 1;
        return `$${index}`;
    });

    return {
        text: transformed,
        values: Array.isArray(params) ? params : [params]
    };
}

async function query(sql, params = []) {
    const { text, values } = transformQuestionMarks(sql, params);
    const finalSql = isInsertQuery(sql) && !/\bRETURNING\b/i.test(sql)
        ? `${text} RETURNING *`
        : text;

    const result = await pool.query(finalSql, values);

    if (isSelectQuery(sql)) {
        return [result.rows, result.fields];
    }

    const insertId =
        result.rows && result.rows[0] && Object.prototype.hasOwnProperty.call(result.rows[0], "id")
            ? Number(result.rows[0].id)
            : null;

    return [{
        ...result,
        insertId,
        affectedRows: Number(result.rowCount || 0)
    }, result.fields];
}

module.exports = {
    query,
    pool
};