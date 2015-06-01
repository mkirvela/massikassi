/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({
    render: function() {
        var balance = this.props.balance;
        var name = this.props.name;
        var amount = balance.filter(function(u) {
            return name === u.name;
        });
        var bal = "";
        if (amount.length == 1) {
            bal = amount[0].balance / 100;
        }
        var color = "red pull-right";
        if (parseInt(bal) > 0) {
            color = "green pull-right";
        }
        return (
            <li>{this.props.name}  <small className={color}> {bal}</small></li>
        );
    }
});
