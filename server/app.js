var express = require('express');
var cons = require('consolidate');
var clientSessions = require('client-sessions');
var expressValidator = require('express-validator');
var i18n = require("i18n");

var views = require('./views');

module.exports = function(secret, viewspath, staticpath) {
    if (!secret || !viewspath || !staticpath) {
        throw new Error("App parameter missing!");
    }

    i18n.configure({
        locales: ["en", "fi"],
        directory: __dirname + "/../locales"
    });

    var app = express();
    app.configure(function() {
        app.use(expressValidator());
        app.use(express.compress());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.logger("dev"));  // log every request to the console
        app.use(express.json());       // to support JSON-encoded bodies
        app.use(clientSessions({
            cookieName: 'session',
            secret: secret
        }));
        app.use(express.static(staticpath));
        app.use(i18n.init);

        // Set rendering engine for HTML
        app.engine('html', cons.underscore);

        // Default engine HTML, set template path
        app.set('view engine', 'html');
        app.set('views', viewspath);
    });

    views.setup(app);

    return app;
};
