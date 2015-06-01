/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({
    render: function() {
        return (
            <option value={this.props.id}>{this.props.name}</option>
        );
    }
});
