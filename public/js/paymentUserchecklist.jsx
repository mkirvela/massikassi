/** @jsx React.DOM */

"use strict";

var React = require("react");

var UserChecklist = require("./userChecklist.jsx");

module.exports = React.createClass({
    getDefaultProps: function() {
        return { checked: [] };
    },

    checkAll: function(e) {
        e.preventDefault();
        var checked = false;
        if ($("#check-all").hasClass("glyphicon-check")) {
            checked = true;
        }
        $("#check-all").toggleClass("glyphicon-unchecked glyphicon-check");
        $("#payment-shared-by input:checkbox").prop("checked", checked);
    },

    render: function() {
        var usersChecklist = this.props.data.map(function (user, i) {
            var checked = this.props.checked.filter(function(u) {
                return u.name === user.name;
            });
            // TODO: use ternary
            // TODO: maybe use }.bind(this) instead
            if (checked.length > 0) {
                return <UserChecklist preChecked="true" key={i} name={user.name} />
            } else {
                return <UserChecklist preChecked="false" key={i} name={user.name} />
            }
        }, this);
        var elem_id = "payment-shared-by";
        if (this.props.title === "Paid by") {
            elem_id = "payment-paid-by";
        }
        return (
            <div id={elem_id} className="form-group">
                <label htmlFor="checklist">{this.props.title}  <a href="#" onClick={this.checkAll}><span id="check-all" className="glyphicon glyphicon-check"></span> Toggle</a></label>
               {usersChecklist}
            </div>
        );
    }
});
