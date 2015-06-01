/** @jsx React.DOM */

"use strict";

var React = require("react");

module.exports = React.createClass({
    getInitialState: function() {
        return { };
    },

    toggleInput: function() {
        $("#event-info-header").toggle();
        $("#event-info-form").toggle();
        $("#event-name-form").focus();
        this.refs.name.getDOMNode().value = this.props.eventData.name;
        return false;
    },

    showPaymentForm: function() {
        this.props.showPaymentForm(true);
        return false;
    },

    formHandler: function() {
        var name = this.refs.name.getDOMNode().value.trim();
        if (name == "") {
            $("#event-group").addClass("has-error");
            return false;
        }
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'PUT',
            data: { name: name },
            success: function(data) {
                var exEventInfo = this.props.eventData;
                var newEventInfo = $.extend(exEventInfo, data);
                this.setState({ eventData: exEventInfo });
                this.toggleInput();
            }.bind(this),
            error: function(xhr, status, err) {
                // error handling?
            }.bind(this)
        });
        return false;
    },

    render: function() {
        var style = { display: "none" };
        var otherStyle = { color: "#777" };

        var date = new Date(this.props.eventData.created);
        var when = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + "  " +
            (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

        return (
            <div>
            <div id="event-info-header">
                <h3 onClick={this.toggleInput}>{this.props.eventData.name}</h3>
                <small style={otherStyle}>created by {this.props.eventData.created_by} on {when}</small>
                <div><a href="#" onClick={this.showPaymentForm}>Add payment</a></div>
            </div>
            <div className="well" id="event-info-form" style={style}>
                <form action="PUT" onSubmit={this.formHandler}>
                    <div id="event-group" className="form-group">
                        <label htmlFor="event-name-form">Edit your event</label>
                        <input id="event-name-form" type="text" className="form-control" defaultValue={this.props.eventData.name} ref="name" autofocus />
                    </div>
                        <button type="submit" className="btn btn-primary">Save</button>&nbsp;
                        <button type="submit" className="btn btn-danger" onClick={this.toggleInput}>Cancel</button>
                </form>
            </div>
            </div>
        );
    }
});
