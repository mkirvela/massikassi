/** @jsx React.DOM */

"use strict";

var React = require("react");

var UserDropdown = require("./userDropdown.jsx");
var UserSelectList = require("./userSelectlist.jsx");

module.exports = React.createClass({
    handleChange: function(id) {
    },

    getInitialState: function() {
        return { number: 1, selected: [] };
    },

    getValue: function() {
        return this.refs.payer.getDOMNode().value.trim();
    },

    addDropdown: function(e) {
        e.preventDefault();
        var state = [];
        var number = this.state.number;
        $("#user-dropdown select").each(function(k, v) {
            var selectedPayer = $(v).find("option:selected");
            state.push(parseInt(selectedPayer[0].value));
        });
        this.setState({ number: this.state.number + 1 , selected: state });
    },

    clearDrops: function(e) {
        e.preventDefault();
        this.setState({ number: this.state.number - 1 });
    },

    render: function() {
        var number = this.state.number;
        var selected = this.state.selected;
        var users = this.props.users;
        var content = [];
        var usersToPick;
        var paid = "Paid by";
        //if (this.isMounted()) {
            for (var i = 0; i < number; i++) {
                var icon = [];
                var disabled = "";
                if (i > 0) {
                    paid = "..and";
                }
                if ((i == number - 1) && (i != users.length - 1)) {
                    icon.push(<a href="#" onClick={this.addDropdown}><span className="glyphicon glyphicon-plus"></span> Add more payers</a>);
                    if (i !== 0) {
                        icon.push(<a className="pull-right" href="#" onClick={this.clearDrops}><span className="glyphicon glyphicon-minus"></span></a>);
                    }
                } else if (i == users.length - 1) {
                    icon.push(<a className="pull-right" href="#" onClick={this.clearDrops}><span className="glyphicon glyphicon-minus"></span></a>);
                } else {
                    disabled = "disabled";
                }
                usersToPick = users.filter(function(user) {
                    var toCheck = selected.slice(0, i);
                    var condition = toCheck.indexOf(user.id);
                    if (condition !== -1) {
                        return false;
                    } else {
                        return true;
                    }
                })
                .map(function(user, i) {
                    return <UserDropdown key={i} id={user.id} name={user.name} />
                });
                content.push(<UserSelectList paid={paid} handleChange={this.handleChange} disabled={disabled} users={usersToPick} more={icon} />);
            }
        //}
        return (
            <div>{content}</div>
        );
    }
});
