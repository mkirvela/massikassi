var express = require('express');
var cons = require('consolidate');
var clientSessions = require('client-sessions');
var expressValidator = require('express-validator');
var i18n = require("i18n");
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');

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
    //app.configure(function() {
        //app.use(expressValidator());
        app.use(compression());
        //app.use(bodyParser());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(methodOverride());
        app.use(morgan("dev"));    // log every request to the console
        //app.use(express.json()); // to support JSON-encoded bodies
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
    //});

    views.setup(app);

    return app;
};
