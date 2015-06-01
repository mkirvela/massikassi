/** @jsx React.DOM */

"use strict";

var React = require("react");

var UserList = require("./userList.jsx");
var UserForm = require("./userForm.jsx");

module.exports = React.createClass({
    getInitialState: function() {
        return {data: [ { name: "" } ]};
    },

    componentWillMount: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.props.onUserChange({ data: data });
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                // error handling?
            }.bind(this)
        });
    },

    handleUserSubmit: function(user) {
        var found = this.state.data.filter(function (name) {
            return name.name === user.name;
        })[0];

        if (found) {
            $("#add-user-group").addClass("has-error");
            return false;
        }
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: user,
            success: function(data) {
                $("#add-user-group").removeClass("has-error");
                var users = this.state.data;
                var newUsers = users.concat([data]);
                this.props.onUserChange({ data: newUsers });
                this.setState({ data: newUsers });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    render: function() {
        return (
            <div>
                <UserList balance={this.props.balance} data={this.state.data} />
                <UserForm onUserSubmit={this.handleUserSubmit} />
            </div>
        );
    }
});
