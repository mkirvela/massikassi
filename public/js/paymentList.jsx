/** @jsx React.DOM */

"use strict";

var React = require("react");
var Payment = require("./payment.jsx");

module.exports = React.createClass({
    deletePayment: function(id) {
        this.props.deletePayment(id);
    },

    editPayment: function(data) {
    },

    render: function() {
        // bind it to 'this' for context
        var payments = this.props.payments.map(function (payment, i) {
            var key = payment.id;
            //key = "time-" + key.getTime();
            return <Payment deleteFromUI={this.props.deleteFromUI} updatePayments={this.props.updatePayments} url={this.props.url} users={this.props.users} deletePayment={this.deletePayment} key={key} payment={payment} editPayment={this.editPayment} />
        }, this);
        return (
            <div>
                <h4>PAYMENTS</h4>
                    { payments.length > 0 ? payments : <div className="row"><div className="col-xs-12">No payments yet!</div></div> }
             </div>
        );
    }
});
