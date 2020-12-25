let pg;
let options;
let pool;

module.exports = (injectedPg, injectedOptions) => {
    pg = injectedPg;
    options = injectedOptions;
    pool = new pg.Pool(options);

    return {
        query: query,
        transaction: transaction,
    };
}

function query(queryString, cbFunc) {
    pool.query(queryString, (err, results) => {
        cbFunc(err, results ? results : null);
    });
}


function transaction(getFirstQuery, getSecondQuery, cbFunc) {
    pool.connect((err, client, done) => {
        if (err) return cbFunc(err);

        client.query('BEGIN', err => {
            if (rollback(err, client)) return cbFunc(err);

            let firstQuery = getFirstQuery();
            client.query(firstQuery, (err, firstRes) => {
                if (rollback(err, client)) return cbFunc(err);

                let secondQuery = getSecondQuery(firstRes);
                client.query(secondQuery, (err, secondRes) => {
                    if (rollback(err, client)) return cbFunc(err);

                    client.query('COMMIT', err => {
                        done();
                        if (err) return cbFunc(err);
                        cbFunc(false, firstRes, secondRes);
                    })
                })
            })
        })
    })
}

function rollback(err, client) {
    if (err) {
        console.error('Error in transaction', err.stack);
        client.query('ROLLBACK', err => {
            if (err) {
                console.error('Error rolling back client', err.stack);
            }
            done();
        });
    }
    return !!err;
}
