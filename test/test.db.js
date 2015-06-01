var chai = require("chai");
var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var _ = require("underscore");
var db = require("../server/db");
var utils = require("../public/js/utils.js");

function countTotals(payments) {
    return payments.reduce(function(prev, cur) {
        return prev + parseInt((cur.amount * 100), 10);
    }, 0);
}

describe("Dividing payments", function() {
    describe("fairly among", function() {
        it("one payer and three sharers and with 100", function(done) {
        
            var payload = {
                "description": "Test payment",
                "amount": "100",
                "dues": [
                    {
                        "id": 77,
                        "name": "testuser",
                        "payer": true
                    }, {
                        "id": 78,
                        "name": "jeee",
                        "payer": false
                    }, {
                        "id": 79,
                        "name": "Liisa",
                        "payer": false
                    }, {
                        "id": 81,
                        "name": "Matti",
                        "payer": false
                    }
                    ]
            };

            var dividedPayment = db.dividePayment(payload);
            assert.operator(dividedPayment.length, "==", 4, "payment should be divided into 4 dues");
            var total = countTotals(dividedPayment);
            assert.operator(total, "==", 0, "dues summed up should be zero")
            dividedPayment.map(function(payment) {

            });
            done();
        });

        it("one payer and two sharers and 100", function(done) {
        
            var payload = {
                "description": "Test payment",
                "amount": "100",
                "dues": [
                    {
                        "id": 77,
                        "name": "testuser",
                        "payer": true
                    }, {
                        "id": 78,
                        "name": "jeee",
                        "payer": false
                    }, {
                        "id": 79,
                        "name": "Liisa",
                        "payer": false
                    }
                    ]
            };

            var dividedPayment = db.dividePayment(payload);
            assert.operator(dividedPayment.length, "==", 3, "payment should be divided into 3 dues");
            var total = countTotals(dividedPayment);
            assert.operator(total, "==", 0, "dues summed up should be zero")
            dividedPayment.map(function(payment) {

            });
            done();
        });
        it("one payer and three sharers and 16.67", function(done) {
        
            var payload = {
                "description": "Test payment",
                "amount": "16.67",
                "dues": [
                    {
                        "id": 77,
                        "name": "testuser",
                        "payer": true
                    }, {
                        "id": 78,
                        "name": "jeee",
                        "payer": false
                    }, {
                        "id": 79,
                        "name": "Liisa",
                        "payer": false
                    }, {
                        "id": 81,
                        "name": "Matti",
                        "payer": false
                    }
                    ]
            };

            var dividedPayment = db.dividePayment(payload);
            assert.operator(dividedPayment.length, "==", 4, "payment should be divided into 4 dues");
            // we're dealing with floats here, multiply by 100
            var total = countTotals(dividedPayment);
            assert.operator(total, "==", 0, "dues summed up should be zero")
            dividedPayment.map(function(payment) {

            });
            done();
        });

        it("two payers and one sharer and 100", function(done) {
        
            var payload = {
                "description": "Test payment",
                "amount": "100",
                "dues": [
                    {
                        "id": 77,
                        "name": "testuser",
                        "payer": true
                    }, {
                        "id": 78,
                        "name": "jeee",
                        "payer": true
                    }, {
                        "id": 79,
                        "name": "Liisa",
                        "payer": false
                    }
                    ]
            };

            var dividedPayment = db.dividePayment(payload);
            assert.operator(dividedPayment.length, "==", 3, "payment should be divided into 3 dues");
            var total = countTotals(dividedPayment);
            assert.operator(total, "==", 0, "dues summed up should be zero")
            var payers = dividedPayment.filter(function(payment) {
                return payment.payer === true;
            });
            payload.sharers = dividedPayment;
            assert.operator(payers.length, "==", 2, "there should be two payers");
            // why is this an array? sigh
            var results = utils.resolve([payload]);
            var first = _.find(results.balance, function(name) {
                return name.name === "Liisa";
            });
            var second = _.find(results.balance, function(name) {
                return name.name === "testuser";
            });
            var third = _.find(results.balance, function(name) {
                return name.name === "jeee";
            })
            assert.operator(results.total, "==", 100);
            // balance still needs to be multiplied
            assert.operator(first.balance, "==", -10000);
            assert.operator(second.balance, "==", 5000);
            assert.operator(third.balance, "==", 5000);
            done();
        });

        it("two payments and it's total", function(done) {
        
            var payload = {
                "description": "Test payment",
                "amount": "100",
                "dues": [
                    {
                        "id": 77,
                        "name": "testuser",
                        "payer": true
                    }, {
                        "id": 78,
                        "name": "jeee",
                        "payer": false
                    }, {
                        "id": 79,
                        "name": "Liisa",
                        "payer": false
                    }
                    ]
            };

            var payload2 = {
                "description": "Test payment",
                "amount": "100",
                "dues": [
                    {
                        "id": 77,
                        "name": "testuser",
                        "payer": true
                    }, {
                        "id": 78,
                        "name": "jeee",
                        "payer": false
                    }, {
                        "id": 79,
                        "name": "Liisa",
                        "payer": false
                    }
                    ]
            };

            payload.sharers = db.dividePayment(payload);
            payload2.sharers = db.dividePayment(payload2);
            var payments = [payload, payload2];
            //payload.sharers = [dividedPayment, dividedPayment2];
            // why is this an array? sigh
            var results = utils.resolve(payments);
            /*
            var first = _.find(results.balance, function(name) {
                return name.name === "Liisa";
            });
            var second = _.find(results.balance, function(name) {
                return name.name === "testuser";
            });
            var third = _.find(results.balance, function(name) {
                return name.name === "jeee";
            })
            */
            assert.operator(results.total, "==", 200);
            // balance still needs to be multiplied
            /*
            assert.operator(first.balance, "==", -10000);
            assert.operator(second.balance, "==", 5000);
            assert.operator(third.balance, "==", 5000);
            */
            done();
        });

    });
});
