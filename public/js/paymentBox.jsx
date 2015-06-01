/** @jsx React.DOM */

"use strict";

var React = require("react");

//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var PaymentForm = require("./paymentForm.jsx");
var PaymentList = require("./paymentList.jsx");

module.exports = React.createClass({
    deletePayment: function(id) {
        $.ajax({
            url: this.props.url,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            type: "DELETE",
            data: JSON.stringify({ id: id }),
            success: function(data) {
                this.props.deletePayment(id);
            }.bind(this),
            error: function(xhr, status, err) {
                // error handling?
            }.bind(this)
        });
        return false;
    },

    updatePayments: function(data) {
        this.props.updatePayments(data);
    },

    editPayment: function(data) {
        this.setState({ payment: data.payment });
    },

    showPaymentForm: function(value) {
        this.props.showPaymentForm(value);
    },

    render: function() {
        var content = "";
        if (this.props.shown === true) {
            content = (
                <div>
                    <PaymentForm showPaymentForm={this.showPaymentForm} updatePayments={this.updatePayments} url={this.props.url} data={this.props.data} />
                    <PaymentList deleteFromUI={this.props.deletePayment} url={this.props.url} users={this.props.data} deletePayment={this.deletePayment} editPayment={this.editPayment} payments={this.props.payments} />
                </div>
            );
        }
        else {
            content = (
                <div>
                    <PaymentList deleteFromUI={this.props.deletePayment} updatePayments={this.updatePayments} url={this.props.url} users={this.props.data} deletePayment={this.deletePayment} editPayment={this.editPayment} payments={this.props.payments} />
                </div>
            );
        }
        return content;
    }
});
