/** @jsx React.DOM */

"use strict";

var React = require('react');

module.exports = React.createClass({
    handleSubmit: function() {
        var user = this.refs.user.getDOMNode().value.trim();
        if (user === "") {
            return false;
        }
        this.props.onUserSubmit({ name: user });
        this.refs.user.getDOMNode().value = '';
        return false;
    },
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-body">
                    <form role="form" onSubmit={this.handleSubmit}>
                        <div id="add-user-group" className="form-group">
                            <label htmlFor="add-new-user">Add new user</label>
                            <input required className="form-control" type="text" placeholder="new user" ref="user" id="add-new-user" />
                        </div>
                        <button type="submit" className="btn btn-primary">Add</button>
                    </form>
                </div>
            </div>
        );
    }
});
