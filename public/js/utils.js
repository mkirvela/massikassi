"use strict";

function _filterPayer(users, payer_id) {
    return users.filter(function(user) {
        return user.id == payer_id;
    })
    .map(function(u) {
        return { id: u.id, name: u.name, payer: true };
    });
}

function resolve(payments) {    
    var totalMoneySpent = payments.map(function(payment) {
        return payment.amount;
    })
    .reduce(function(prev, cur, i) {
        return prev + (cur * 100);
    }, 0);
    totalMoneySpent = (totalMoneySpent / 100);
    var dues = payments.map(function(payment) {
        return payment.sharers;
    })
    .map(function(dues) {
        return dues;
    });
    dues = dues.concat.apply([], dues);
    var test = {};
    dues.forEach(function(due) {
        var user = due["name"];
        
        if (test[user] == null) {
            test[user] = { amount: 0 };
        }
        test[user]["amount"] = 100 * due["amount"] + test[user]["amount"];
    });
    var all = [];
    var balance = [];
    for (var key in test) {
        var obj = test[key];
        for (var prop in obj) {
            // important check that this is objects own property 
            // not from prototype prop inherited
            if(obj.hasOwnProperty(prop)) {
                all.push([key, obj[prop]]);
                balance.push({ name: key, balance: parseInt(obj[prop]) });
                //alert(prop + " = " + obj[prop]);
            }
        }
    }
    var debtors = all.filter(function(d) {
        return d[1] > 0;
    });
    var debtees = all.filter(function(d) {
        return d[1] < 0;
    })
    //all.sort(function(a, b) { return a[1] - b[1] });
    // sort so that the one who is owed the most is 0
    debtors.sort(function(a, b) { return b[1] - a[1] });
    // sort so that the one who owes the most is 0
    debtees.sort(function(a, b) { return a[1] - b[1] });
    var processDebt = debtors.shift();

    var leftover = -1;
    var resolved = [];
    debtees.forEach(function(debt) {
        var debtAmount = Math.round(debt[1]);
        do {
            if (processDebt[1] === 0) {
                processDebt = debtors.shift();
            } else {
            }
            processDebt[1] = Math.round(processDebt[1]);
            leftover = debtAmount + processDebt[1];
            if (leftover > 0) {
                resolved.push(debt[0] + " owes " + ((-debtAmount) / 100) + " to " + processDebt[0]);
                // let's mark this
                processDebt[1] = leftover;
            } else if (leftover < 0) {
                resolved.push(debt[0] + " owes " + ((processDebt[1]) / 100) + " to " + processDebt[0]);
                processDebt[1] = 0;
                debtAmount = leftover;
            } else if (leftover === 0) {
                resolved.push(debt[0] + " owes " + ((-debtAmount) / 100) + " to " + processDebt[0]);
                processDebt[1] = 0;
            }
        } while (leftover < 0);
    });
    return { balance: balance, resolved: resolved, total: totalMoneySpent };
}

exports.resolve = resolve;
exports.filterPayer = _filterPayer;