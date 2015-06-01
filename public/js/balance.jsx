/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({

    render: function() {
        return (
            <span>{ this.props.name } <span className={ this.props.color }>{ this.props.balance }</span><br /></span>
        );
    }
});
