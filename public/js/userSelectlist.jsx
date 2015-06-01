/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({

    render: function() {
        return (
            <div className="row">
                <div className="col-md-4 col-sm-6">
                    <div className="form-group">
                        <label htmlFor="select">{this.props.paid}</label>&nbsp;
                        {this.props.more}
                        <select disabled={this.props.disabled} ref="payer" className="form-control">
                            {this.props.users}
                        </select>
                    </div>
                </div>
            </div>
        );
    }
});
