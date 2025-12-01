const mysql = require('mysql2');

// pour skip la db si le pelo le demande
if (process.env.SKIP_DB === 'true') {
    console.warn('SKIP_DB=true: using stubbed DB (no real DB connection).');
    module.exports = {
        // callback-compatible stub
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

    // create a callback-capable pool and a promise wrapper
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

    // quick connection test (use promise for cleaner logs)
    promisePool.getConnection()
        .then(conn => {
            console.log('Connected to MySQL database.');
            conn.release();
        })
        .catch(err => {
            console.error('Database connection failed:', err.message || err);
        });

    // export an API that supports both callbacks and promises
    module.exports = {
        query: (sql, params, cb) => {
            // signature flexibility: query(sql, cb) or query(sql, params, cb)
            if (typeof params === 'function') {
                cb = params;
                params = undefined;
            }

            if (typeof cb === 'function') {
                // use callback API on basePool
                return basePool.query(sql, params, cb);
            } else {
                // return promise that resolves to rows (not [rows, fields])
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
