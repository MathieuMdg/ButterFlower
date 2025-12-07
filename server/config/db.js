const mysql = require('mysql2');

// SKIP DATABASE
if (process.env.SKIP_DB === 'true') {
    console.warn('SKIP_DB=true: using stubbed DB (no real DB connection).');
    module.exports = {
        query: (sql, params, cb) => {
            if (typeof params === 'function') cb = params;
            if (typeof cb === 'function') return cb(null, []);
            return Promise.resolve([]);
        },
        getConnection: (cb) => {
            if (typeof cb === 'function') return cb(null, { release: () => {} });
            return Promise.resolve({ release: () => {} });
        },
        end: async () => {}
    };
} else {
    const host = process.env.DB_HOST || '127.0.0.1';
    const user = process.env.DB_USER || 'root';

    const password = process.env.DB_PASS || 'password';

    const database = process.env.DB_NAME || 'butterflower';
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

    const basePool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const promisePool = basePool.promise();

    promisePool.getConnection()
        .then(conn => {
            console.log('Connected to MySQL database.');
            conn.release();
        })
        .catch(err => {
            console.error('Database connection failed:', err.message || err);
        });

    module.exports = {
        query: (sql, params, cb) => {
            if (typeof params === 'function') {
                cb = params;
                params = undefined;
            }

            if (typeof cb === 'function') {
                return basePool.query(sql, params, cb);
            } else {
                return promisePool.query(sql, params).then(([rows]) => rows);
            }
        },
        getConnection: (cb) => {
            if (typeof cb === 'function') {
                return basePool.getConnection(cb);
            } else {
                return promisePool.getConnection();
            }
        },
        end: () => basePool.end()
    };
}
