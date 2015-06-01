/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({
    render: function() {
        var test = this.props.resolved.map(function(r) {
            return <li>{r}</li>;
        });

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Resolves</h3>
                </div>
                <div className="panel-body">
                    <ul className="list-unstyled">
                    { test.length > 0 ? test : "Debts are settled." }
                    </ul>
                    Total money spent: { this.props.total }
                </div>
            </div>
        );
    }
});