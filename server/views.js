var _ = require('underscore');
var db = require('./db');
var i18n = require("i18n");

function getRoot(req, res) {
    res.render("landing.html", { errors: {} });
}

function postRoot(req, res) {
    // honeycomb check, maybe robots will fill this as well
    if (req.body.business !== '') {
        res.render("landing.html", { errors: {} });
        return;
    }
    req.assert("name", "Name is required").notEmpty();
    req.assert("user", "A first user must be provided").notEmpty();
    if (req.body.email) {
        req.assert("email", "A valid email must be provided").isEmail();
    }
    var errors = req.validationErrors(true);
    if (errors) {
        res.render("landing", { errors: errors });
    } else {
        db.addEvent(req.body, function(err, hash) {
            var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
            var body =
"Hello! " +
"\n\n" +
"You have been invited to share expenses for the event: " + req.body.name +
"\n\n" +
"Click this link to access the event: http://www.massikassi.com/event/" + hash +
"\n\n" +
"Massikassi is a free expense sharing service with the guiding design principle of keeping shit " +
"simple. If you have problems using our service, let us know what we have done wrong." +
"\n\n" +
"Read more about us at: www.massikassi.com \n \n Cheers, \n Massikassi-team";
            sendgrid.send({
                to: req.body.email,
                from: "massikassi@massikassi.com",
                subject: "Your massikassi event #" + hash,
                text: body
            }, function(err, json) {
                if (err) { 
                    return console.error(err);
                }
            });
            res.redirect("/event/" + hash);
        });
    }
}

function getEvent(req, res) {
    db.getEvent(req.params.hash, function(err, result) {
        if (err) {
            res.send(500);
            return;
        }
        if (_.isEmpty(result)) {
            res.status(404).render("404.html");
        } else {
            res.render("event", { event: result });
        }
    });
}

function getUsersForEvent(req, res) {
    if (!req.query.hash) {
        res.send(500, "Mandatory parameters missing");
        return;
    }
    db.getUsersForEvent(req.query.hash, function(err, result) {
        if (err) {
            res.send(500);
            return;
        }
        if (_.isEmpty(result)) {
            res.send(404);
        } else {
            res.json(result);
        }
    });
}

function addUserToEvent(req, res) {
    if (!req.query.hash) {
        res.send(500, "Mandatory parameters missing");
        return;
    }

    req.assert("name", "Name is required").notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        res.send(400, JSON.stringify(errors));
        return;

    }

    db.addUserToEvent(req.query.hash, req.body, function(err, result) {
        if (err) {
            res.send(500);
            return;
        }
        if(!err && !result) {
            res.send(400, "User already exists");
            return;
        }
        res.json(result);
    });
}

function editEventName(req, res) {
    if (!req.query.hash) {
        res.send(400, "Mandatory parameters missing");
        return;
    }
    req.assert("name", "Name is required").notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        res.send(400, JSON.stringify(errors));
        return;
    }

    db.editEventName(req.query.hash, req.body, function(err, result) {
        res.json(result);
    });
}

function addPayment(req, res, edit) {
    if (!req.query.hash) {
        res.send(400, "Mandatory parameters missing");
        return;
    }
    req.checkBody("description", "Description is required").notEmpty();
    req.sanitize("amount").toFloat();
    req.checkBody("amount", "Amount required in numbers").notEmpty().isFloat();
    // TODO: validate that at least one of dues has "payer": false
    req.checkBody("dues", "Must have dues").notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        res.send(400, errors);
        return;
    }

    db.addPayment(req.query.hash, req.body, edit, function(err, result) {
        res.json(result);
    });
}

function handleDues(dues) {
    return _.map(dues, function(u) {
            return { id: u.user_id, name: u.name, payer: u.payer, amount: u.due_amount };
        });
}

function getEventInfo(req, res) {
    if (!req.query.hash) {
        res.send(400, "Mandatory parameters missing");
        return;
    }
    db.getEventInfo(req.query.hash, function(err, result) {
        result.payments = _.chain(result.payments)
            .flatten()
            .groupBy(function(payment) {
                return payment.payment_id;
            })
            // TODO: fix sharers -> dues
            .map(function(payment) {
                return {
                    description: payment[0].description,
                    created: payment[0].created,
                    amount: payment[0].payment_amount,
                    id: payment[0].payment_id,
                    sharers: handleDues(payment)
                };
            })
            .sortBy(function(c) {
                return -c.created;
            })
            .value();
        res.json(result);
    });
}

function deletePayment(req, res) {
    if (!req.query.hash) {
        res.send(400, "Mandatory parameters missing");
        return;
    }
    db.deletePayment(req.query.hash, req.body, function(err, result) {
        if (!err) {
            res.json(200, "ok");
        } else {
            res.send(500, err);
        }
    });
}

function wtfaq(req, res) {
    res.render("wtfaq.html");
}

function examples(req, res) {
    res.render("examples.html");
}

function feedback(req, res) {
    var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    var body = req.body.body;
    // make this configurable, it's the feedback receiver address
    var to = ["youremail@example.com"];
    sendgrid.send({
        to: to,
        from: "massikassi@massikassi.com",
        subject: "Feedback",
        text: body
    }, function(err, json) {
        if (err) { 
            return console.error(err);
        }
    });
    res.send(200);
    return;
}

exports.setup = function(app) {
    app.get("/", function(req, res) { getRoot(req, res); });
    app.post("/", function(req, res) { postRoot(req, res); });
    app.get("/event/:hash", function(req, res) { getEvent(req, res); });
    app.get("/events/:hash", function(req, res) { res.redirect("/event/" + req.params.hash); });
    app.get("/wtfaq", function(req, res) { wtfaq(req, res); });
    app.get("/examples", function(req, res) { examples(req, res); });
    app.get("/tutorial", function(req, res) { res.render("tutorial.html"); });
    // API
    app.put("/api/event", function(req, res) { editEventName(req, res); });
    app.get("/api/event", function(req, res) { getEventInfo(req, res); });
    app.post("/api/users", function(req, res) { addUserToEvent(req, res); });
    app.get("/api/users", function(req, res) { getUsersForEvent(req, res); });
    app.post("/api/payment", function(req, res) { addPayment(req, res, false); });
    app.put("/api/payment", function(req, res) { addPayment(req, res, true); });
    app.delete("/api/payment", function(req, res) { deletePayment(req, res); });
    app.post("/feedback", function(req, res) { feedback(req, res); });
    
    // 404
    app.get('*', function(req, res){
      res.status(404).render("404.html");
    });
};
