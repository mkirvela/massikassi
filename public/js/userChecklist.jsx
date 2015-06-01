/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({
    render: function() {
        var input;
        if (this.props.preChecked === "true") {
            input = <label><input type="checkbox" defaultChecked value={this.props.name} /> {this.props.name}</label>
        } else {
            input = <label><input type="checkbox" value={this.props.name} /> {this.props.name}</label>
        }
        return (
            <div className="checkbox">{input}</div>
        );
    }
});
