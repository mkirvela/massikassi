var pg = require('pg');
var _ = require('underscore');

var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/massikassi";

exports.addEvent = function(payload, callback) {
    pg.connect(connectionString, function(err, client, done) {
        function generateAndCheckHash(callback) {
            var hash = Math.random().toString(36).substr(9);
            client.query("SELECT name FROM api_event WHERE hash = $1", [hash], function(err, result) {
                if (result.rowCount === 0) {
                    callback(hash);
                } else {
                    generateAndCheckHash(callback);
                }
            });
        }

        generateAndCheckHash(function(hash) {
            client.query("INSERT INTO api_event (name, hash, created, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
                [payload.name, hash, new Date(), payload.user],
                function(err, result) {
                    // TODO: handle possible error somehow
                    client.query("INSERT INTO api_user (event_id, name, email) VALUES ($1, $2, $3)",
                        [result.rows[0].id, payload.user, payload.email],
                        function(err) {
                            done();
                            callback(err, hash);
                        });
                });
        });
    });
};

exports.getEvent = function(hash, callback) {
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            return callback(err);
        }
        client.query("SELECT * FROM api_event WHERE hash = $1", [hash], function(err, result) {
            // TODO: handle possible errors
            done();
            if (err) callback(err, null);
            if (result.rowCount === 1) {
                callback(err, result.rows[0]);
            } else {
                callback(err, null);
            }
        });
    });
};

exports.getUsersForEvent = function(hash, callback) {
    pg.connect(connectionString, function(err, client, done) {
        client.query("SELECT api_user.id, api_user.name FROM api_user, api_event " +
            "WHERE api_user.event_id = api_event.id AND api_event.hash = $1;", [hash], function(err, result) {
            done();
            if (err) callback(err, null);
            if (result.rowCount > 0) {
                callback(err, result.rows);
            } else {
                callback(err, null);
            }
        });
    });
};

exports.addUserToEvent = function(hash, payload, callback) {
    pg.connect(connectionString, function(err, client, done) {
        client.query("SELECT * FROM api_event WHERE hash = $1", [hash], function(err, result) {
            if (err) callback(err, null);
            if (result.rowCount === 1) {
                var event_id = result.rows[0].id;
                client.query("SELECT * FROM api_user WHERE name = $1 AND event_id = $2", [payload.name, event_id], function(err, result) {
                    if (err) callback(err, null);
                    if (result.rowCount > 0) {
                        done();
                        callback(null, null);
                        return;
                    } else {
                        client.query("INSERT INTO api_user (event_id, name) VALUES ($1, $2) RETURNING id", [event_id, payload.name], function(err, result) {
                            done();
                            if (err) { return callback(err, null); }
                            var user = { id: result.rows[0].id, name: payload.name };
                            callback(err, user);
                        });
                    }
                });
            } else {
                callback(err, null);
            }
        });
    });
};

exports.editEventName = function(hash, payload, callback) {
    pg.connect(connectionString, function(err, client, done) {
        client.query("SELECT * FROM api_event WHERE hash = $1", [hash], function(err, result) {
            if (err) callback(err, null);
            if (result.rowCount === 1) {
                var event_id = result.rows[0].id;
                client.query("UPDATE api_event SET name = $1 WHERE id = $2 returning name", [payload.name, event_id], function(err, result) {
                    done();
                    callback(err, result.rows[0]);
                });
            }
        });
    });
};

function handleLeftovers(value, key, list) {
    // times that the amount has to be divided for this group
    var times = list.length;
    var dividedAmount = this.amount / times;
    // the modulus leftover
    var leftover = this.amount % times;
    // we can now floor the amount
    var amount = Math.floor(this.amount);
    // and the divided amount
    dividedAmount = Math.floor(dividedAmount);
    // pennies that will be dealt among participants
    var pennies = 0;
    if (leftover > 0) {
        pennies++;
        this.leftover--;
    }
    var scaledAmount = dividedAmount + pennies;
    if (due.payer) {
        return { id: value.id, name: value.name, payer: value.payer, amount: (scaledAmount/ 100) };
    } else {
        return { id: value.id, name: value.name, payer: value.payer, amount: -(scaledAmount/ 100) };
    }
}

function divideFairly(dues, amount) {
    var times = dues.length;
    var dividedAmount = amount / times;
    var leftover = amount % times;
    var flooredAmount = Math.floor(amount);
    dividedAmount = Math.floor(dividedAmount);
    var pennies = 0;
    return _.map(dues, function(due) {
        if (leftover > 0) {
            pennies = 1;
            leftover--;
        } else {
            pennies = 0;
        }
        var scaledAmount = dividedAmount + pennies;
        if (due.payer) {
            return { id: due.id, name: due.name, payer: due.payer, amount: (scaledAmount / 100) };
        } else {
            return { id: due.id, name: due.name, payer: due.payer, amount: -(scaledAmount / 100) };
        }
    });
}

function dividePayment(payment) {
    // TODO: refactor, poor implementation
    var amount = parseInt((payment.amount * 100), 10);
    var payers = _.filter(payment.dues, function(due) {
        return due.payer === true;
    });

    payers = divideFairly(payers, amount);
    var sharers = _.filter(payment.dues, function(due) {
        return due.payer === false;
    });
    sharers = divideFairly(sharers, amount);
    return sharers.concat(payers);
}

// for testing
exports.dividePayment = dividePayment;

exports.addPayment = function(hash, payload, edit, callback) {
    pg.connect(connectionString, function(err, client, done) {
        client.query("SELECT * FROM api_event WHERE hash = $1", [hash], function(err, result) {
            if (err) callback(err, null);
            if (result.rowCount === 1) {
                var event_id = result.rows[0].id;
                var description = payload.description;
                var dividedPayment = dividePayment(payload);
                var amount = payload.amount;
                var payment_id, new_created, new_modified;
                var created = new Date();
                var modified = created;
                var original = null;
                if (edit) {
                    created = new Date(payload.created);
                    original = payload.original;
                }
                client.query("INSERT INTO api_payment (event_id, description, amount, created, modified, original) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created, modified",
                    [event_id, description, amount, created, modified, original], function(err, result) {
                    // TODO: error handling
                    payment_id = result.rows[0].id;
                    new_created = result.rows[0].created;
                    new_modified = result.rows[0].modified;
                    dividedPayment.forEach(function(due) {
                        client.query("INSERT INTO api_due (user_id, amount, payment_id, payer) VALUES ($1, $2, $3, $4)",
                            [due.id, due.amount, payment_id, due.payer],
                            function(err, result) {
                                // TODO: error handling
                        });
                    });
                    client.query("SELECT api_user.name, api_due.amount, api_due.payer FROM api_user, api_due WHERE api_user.id = api_due.user_id AND " +
                        "api_due.payment_id = $1", [payment_id],
                    //client.query("SELECT api_payment.description, api_payment.amount, api_payment.payer, api_payment.created, " +
                    //     "FROM api_payment, api_due WHERE api_due.payment_id = api_payment.id AND api_payment.id = $1;", [payment_id],
                        function(err, result) {
                            done();
                            // TODO: error handling
                            // TODO: created field is bollocks!
                            var resultJson = { description: description,
                                amount: amount,
                                id: payment_id,
                                created: new_created,
                                modified: new_modified };
                            var dues = [];
                            result.rows.forEach(function(row) {
                                dues.push({ name: row.name, amount: row.amount, payer: row.payer });
                            });
                            resultJson.sharers = dues;
                            if (edit) {
                                client.query("UPDATE api_payment SET deleted = true WHERE id = $1", [payload.original], function(err, result) {
                                    done();
                                    callback(null, resultJson);
                                });
                            } else {
                                callback(null, resultJson);
                            }
                        });
                    });
            }
        });
    });
};

exports.getEventInfo = function(hash, callback) {
    pg.connect(connectionString, function(err, client, done) {
        client.query("SELECT * FROM api_event WHERE hash = $1", [hash], function(err, result) {
            if (err) callback(err, null);
            if (result.rowCount === 1) {
                var eventName = result.rows[0].name;
                var createdBy = result.rows[0].created_by;
                var created = result.rows[0].created;
                var eventId = result.rows[0].id;
                client.query("SELECT api_payment.id as payment_id, api_payment.description, api_payment.amount as payment_amount, api_payment.created, api_due.amount as due_amount, api_due.payer, api_user.name, api_user.id as user_id " +
                             "FROM api_event " +
                             "JOIN api_payment ON " +
                             "  api_payment.event_id = api_event.id AND " +
                             "  api_payment.deleted = false " +
                             "JOIN api_due ON api_due.payment_id = api_payment.id " +
                             "JOIN api_user ON api_user.id = api_due.user_id " +
                             "WHERE api_event.id = $1 ORDER BY api_payment.created DESC;", [eventId], function(err, result) {
                        done();
                        var eventInfo = {};
                        eventInfo.name = eventName;
                        eventInfo.createdBy = createdBy;
                        eventInfo.created = created;
                        eventInfo.payments = result.rows;
                        callback(err, eventInfo);
                    });
            }
        });
    });
};

exports.deletePayment = function(hash, payload, callback) {
    pg.connect(connectionString, function(err, client, done) {
        client.query("SELECT api_event.id FROM api_event, api_payment WHERE api_event.hash = $1 AND api_payment.id = $2 AND api_payment.event_id = api_event.id;", [hash, payload.id], function(err, result) {
            if (err) {
                done();
                callback(err, null);
                return;
            }
            if (result.rowCount === 1) {
                client.query("DELETE FROM api_payment WHERE id = $1", [payload.id], function(err, result) {
                    done();
                    callback(err, result);
                });
            }
        });
    });
};
