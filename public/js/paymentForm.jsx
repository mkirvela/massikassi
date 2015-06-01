/** @jsx React.DOM */
"use strict";

var React = require("react");

var utils = require("./utils.js");

var PaymentUsersDropdown = require("./paymentUsersDropdown.jsx");
var PaymentUsersChecklist = require("./paymentUserchecklist.jsx");

module.exports = React.createClass({
    formHandler: function() {
        var paymentDesc = this.refs.description.getDOMNode().value.trim();
        if (paymentDesc == "") {
            $("#payment-msg").toggle();
            $("#desc-group").addClass("has-error");
            return false;
        }
        var paymentAmount = this.refs.amount.getDOMNode().value.trim();

        var payload = {
            "description": paymentDesc,
            "amount": paymentAmount,
            "dues": []
        };
        var users = this.props.data;
        var dues = [];
        // payers
        $("#user-dropdown select").each(function(k, v) {
            var selectedPayer = $(v).find("option:selected");
            dues.push(utils.filterPayer(users, parseInt(selectedPayer[0].value))[0]);
        });
        //payload.dues.push(payers[0]);
        $("#payment-shared-by :checked").each(function() {
            var name = $(this).val();
            var user = users.filter(function(u) {
                return u.name == name;
            })
            .map(function(p) {
                return { id: p.id, name: p.name, payer: false };
            });
            dues.push(user[0]);
        });
        // disable send / cancel buttons until request is ready
        $("#payment-buttons > button").prop("disabled", true);
        payload.dues = dues;
        $.ajax({
            url: this.props.url,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            type: "POST",
            data: JSON.stringify(payload),
            success: function(data) {
                this.props.showPaymentForm();
                this.render();
                this.props.updatePayments({ added: data, deleted: [] });
                $("#payment-buttons > button").prop("disabled", false);

            }.bind(this),
            error: function(xhr, status, err) {
                $("#payment-buttons > button").prop("disabled", false);
            }.bind(this)
        });
        return false;
    },

    handleChange: function(event) {
        this.setState({ desc: event.target.value });
    },

    handleAmountChange: function(event) {
        this.setState({ amount: event.target.value });
    },

    showPaymentForm: function() {
        this.props.showPaymentForm(false);
        return false;
    },

    render: function() {
        var style = { display: "none" };
        return (
            <div className="panel panel-default payment-form" id="payment-form">
               <div className="panel-body">
                    <h3>Add new payment</h3>
                    <div id="payment-msg" style={style} className="alert alert-danger">Correct errors below</div>
                    <form id="payment-form-form" role="form" onSubmit={this.formHandler}>
                        <div id="desc-group" className="form-group">
                            <label htmlFor="description">Description</label>
                            <input required ref="description" onChange={this.handleChange} type="text" className="form-control" id="description" placeholder="Add a description, such as &quot;Lunch at ..&quot;" />
                        </div>
                        <div className="row">
                            <div className="col-md-4 col-sm-6">
                                <div className="form-group">
                                    <label htmlFor="payment-amount">Amount</label>
                                    <div className="input-group">
                                        <input required ref="amount" type="text" onChange={this.handleAmountChange} className="form-control" placeholder="Amount spent" />
                                        <span className="input-group-addon">units</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="user-dropdown">
                            <PaymentUsersDropdown ref="payer" users={this.props.data} />
                        </div>
                        <PaymentUsersChecklist title="Shared by" data={this.props.data} />
                        <div id="payment-buttons">
                            <button type="submit" className="btn btn-primary">Add</button>&nbsp;
                            <button onClick={this.showPaymentForm} type="cancel" className="btn btn-danger">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});
