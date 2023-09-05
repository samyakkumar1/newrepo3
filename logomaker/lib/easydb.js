function EasyDb(pool) {
    this.queries = [];
    this.successH = [];
    this.errorH = null;
    this.alwaysH = null;
    this.client = null;
    this.transaction = false;
    this.doneH = null;
    this.pool = pool;
}

EasyDb.prototype.query = function (q) {
    if (this.successH.length < this.queries.length)
        this.successH.push(null);
    this.queries.push(q);
    this.lastCallWasQuery = true;
    return this;
};

EasyDb.prototype.success = function (s) {
    this.successH.push(s);
    return this;
};

EasyDb.prototype.error = function (e) {
    this.errorH = e;
    return this;
};

EasyDb.prototype.always = function (a) {
    this.alwaysH = a;
    return this;
};

EasyDb.prototype.done = function (d) {
    this.doneH = d;
    return this;
};


EasyDb.prototype.clear = function () {
    if (this.alwaysH)
        this.alwaysH();
    //this.pool.release(this.client);
    if (this.client){
        this.client.release();
    }
    this.transaction = false;
    this.client = null;
};


EasyDb.prototype.cancel = function () {//cancel pending queries.
    this.queries = [];
    this.successH = [];
};

function _execute_queries(easyDb) {
    if (easyDb.queries.length == 0) {
        if (easyDb.transaction) {
            easyDb.client.query("COMMIT",
                function (err, rows) {
                    if (err) {
                        logger.error("COMMIT failed: " + err);
                        easyDb.errorH(err);
                    } else {
                        if (easyDb.doneH)
                            easyDb.doneH();
                    }
                    easyDb.clear();
                }
            );
        } else {
            if (easyDb.doneH)
                easyDb.doneH();
            easyDb.clear();
        }
        return;
    }

    var queryF = easyDb.queries.shift();
    var query = queryF(); //generate query
    var qry = easyDb.client.query(query.query, query.params,
        function (err, rows) {
            if (err) {
                logger.error("Query failed: " + query.query + ", params: " + JSON.stringify(query.params) + " error: " + err);
                if (easyDb.errorH)
                    easyDb.errorH(err);
                _rollback_txn(easyDb);
            } else {
                var successF = easyDb.successH.shift();
                var proceed = true;
                if (successF) {
                    try {
                        successF(rows);
                    }
                    catch (e) {
                        if (easyDb.errorH)
                            easyDb.errorH(e);
                        _rollback_txn(easyDb);
                        proceed = false;
                    }
                }
                if (proceed) {
                    _execute_queries(easyDb);
                }
            }
        }
    );
    console.log(qry.sql);
}

function _rollback_txn(easyDb) {
    if (easyDb.transaction) {
        easyDb.transaction = false;
        easyDb.client.query("ROLLBACK",
            function (err, rows) {
                if (err) {
                    logger.error("cannot rollback transaction %s", err);
                }
                easyDb.clear();
            }
        );
    } else {
        easyDb.clear();
    }
}
EasyDb.prototype.execute = function (options) {
    if (!options)
        options = {};
    var easyDb = this;
    this.pool.getConnection(
        function (err, client) {
            if (err) {
                logger.error("cannot acquire pool instance %s", err);
                if (easyDb.errorH)
                    easyDb.errorH(err);
                easyDb.clear();
            }
            else {
                easyDb.client = client;
                easyDb.transaction = options.transaction ? options.transaction : false;
                if (easyDb.transaction) {
                    client.query("START TRANSACTION",
                        function (err, rows) {
                            if (err) {
                                logger.error("start transaction failed: %s", err);
                                if (easyDb.errorH)
                                    easyDb.errorH(err);
                                easyDb.clear();
                            } else {
                                _execute_queries(easyDb);
                            }
                        }
                    );
                } else
                    _execute_queries(easyDb);
            }
        }
    );
};

module.exports = function (pool) {
    return new EasyDb(pool);
};
