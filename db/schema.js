var pg = require("pg");
var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/massikassi";
var client;
var api_due, api_event, api_payment, api_user;


client = new pg.Client(connectionString);

client.connect(function(err) {
    if (err) {
        return console.error("error in connecting", err);
    }

    client.query("CREATE TABLE api_event (" +
    "id SERIAL PRIMARY KEY, " +
    "name text NOT NULL, " +
    "hash character varying(10) NOT NULL, " +
    "created timestamp without time zone NOT NULL, " +
    "created_by text NOT NULL, " +
    "timeline_hash character varying(10) DEFAULT substr(md5((random())::text), 0, 8) NOT NULL);", function(err, result) {
        if (err) {
            return console.error("error running query", err);
        }
    });

    client.query("CREATE TABLE api_payment (" +
    "id SERIAL PRIMARY KEY, " +
    "event_id integer NOT NULL, " +
    "description text NOT NULL, " +
    "amount numeric(10,2) NOT NULL, " +
    "created timestamp without time zone NOT NULL, " +
    "modified timestamp without time zone, " +
    "payment_type character varying(20) DEFAULT 'web', " +
    "deleted boolean DEFAULT false, " +
    "original int DEFAULT null, " +
    "picture_url character varying(200), " +
    "FOREIGN KEY (event_id) REFERENCES api_event(id));", function(err, result) {
        if (err) {
            return console.error("error running query", err);
        }
    });

    client.query("CREATE TABLE api_due (" +
        "id SERIAL PRIMARY KEY, " +
        "user_id integer NOT NULL, " +
        "amount numeric(10,2) NOT NULL, " +
        "payer boolean DEFAULT false NOT NULL, " +
        "payment_id integer NOT NULL, " +
        "FOREIGN KEY (payment_id) REFERENCES api_payment(id) ON DELETE CASCADE);", function(err, result) {
        if (err) {
            return console.error("error running query", err);
        }
    });

    client.query("CREATE TABLE api_user ( " +
    "id SERIAL PRIMARY KEY, " +
    "name character varying(20) NOT NULL, " +
    "event_id integer NOT NULL, " +
    "email character varying(254), " +
    "deleted boolean, " +
    "FOREIGN KEY (event_id) REFERENCES api_event(id));", function(err, result) {
        if (err) {
            return console.error("error running query", err);
        }
        client.end();
    });
});