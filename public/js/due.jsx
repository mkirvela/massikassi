/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({

    render: function() {
        // exclude trailing comma
        var comma = "";
        if (this.props.key !== 0) {
            comma = ", ";
        }
        return (
            <span>{ comma }{ this.props.due.name }</span>
        );
    }
});
