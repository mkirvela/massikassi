/** @jsx React.DOM */

"use strict";

var React = require("react");

var User = require("./user.jsx");

module.exports = React.createClass({
    render: function() {
        var users = this.props.data.map(function (user, i) {
            return <User balance={this.props.balance} key={i} name={user.name} />
        }, this);

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Users&nbsp;&nbsp;<span className="glyphicon glyphicon-user pull-right"></span></h3>
                </div>
                <div className="panel-body">
                    <ul className="user-list">
                        {users}
                    </ul>
                </div>
            </div>
        );
    }
});
