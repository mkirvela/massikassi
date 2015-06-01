/** @jsx React.DOM */
"use strict";

var React = require("react");

var PaymentUsersChecklist = require("./paymentUserchecklist.jsx");
var Due = require("./due.jsx");
var utils = require("./utils.js");
var Balance = require("./balance.jsx");

module.exports = React.createClass({
    getInitialState: function() {
        return { editing: false };
    },

    deletePayment: function() {
        this.props.deletePayment(this.props.payment.id);
        return false;
    },

    editPayment: function(e) {
        e.preventDefault();
        //this.props.editPayment({ payment: this.props.payment });
        this.setState({ editing: true });
    },

    formHandler: function(e) {
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
            "dues": [],
            "created": this.refs.created.getDOMNode().value.trim(),
            "original": this.props.payment.id
        };
        var users = this.props.users;
        var dues = [];
        // payers
        $("#payment-paid-by :checked").each(function() {
            var name = $(this).val();
            var user = users.filter(function(u) {
                return u.name == name;
            })
            .map(function(p) {
                return { id: p.id, name: p.name, payer: true };
            });
            dues.push(user[0]);
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
        payload.dues = dues;
        $.ajax({
            url: this.props.url,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            type: "PUT",
            data: JSON.stringify(payload),
            success: function(data) {
                //this.props.showPaymentForm();
                //this.props.deleteFromUI(this.props.payment.id);
                this.setState({ editing: false });
                this.props.updatePayments({ added: data, deleted: this.props.payment });
            }.bind(this),
            error: function(xhr, status, err) {
                // error handling?
            }.bind(this)
        });
        return false;
    },

    hideForm: function(e) {
        e.preventDefault();
        this.setState({ editing: false });
    },

    showForm: function() {
        var payers = this.props.payment.sharers.filter(function(d) {
            return d.payer == true;
        });
        var sharers = this.props.payment.sharers.filter(function(d) {
            return d.payer == false;
        });
        var titlePayer = "Paid by";
        var titleSharer = "Shared by";
        var style = { display: "none" };
        // needs proper fallbacks for nonexisting html5 form input types (ie. datetime)
        var date = new Date(this.props.payment.created);
        var when = date.getFullYear() + "/" + (date.getMonth() < 10 ? "0" : "") + (date.getMonth() + 1) + "/" + date.getDate() + " " +
            (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

        return (
            <div className="well payment-form" id="payment-form">
                <h3>Edit payment</h3>
                <div id="payment-msg" style={style} className="alert alert-danger">Correct errors below</div>
                <form id="payment-form-form" role="form" onSubmit={this.formHandler}>
                    <div id="desc-group" className="form-group">
                        <label htmlFor="description">Description</label>
                        <input ref="description" defaultValue={this.props.payment.description} type="text" className="form-control" id="description" />
                    </div>
                    <div className="row">
                        <div className="col-md-4 col-sm-6">
                            <div className="form-group">
                                <label htmlFor="payment-amount">Amount</label>
                                <div className="input-group">
                                    <input ref="amount" type="text" defaultValue={this.props.payment.amount} className="form-control" placeholder="Amount spent" />
                                    <span className="input-group-addon">units</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 col-sm-6">
                            <div className="form-group">
                                <label htmlFor="payment-date">Change payment date</label>
                                <input ref="created" type="datetime" defaultValue={when} className="form-control" id="payment-date" />
                            </div>
                        </div>
                    </div>
                    <PaymentUsersChecklist title={titlePayer} checked={payers} data={this.props.users} />
                    <PaymentUsersChecklist title={titleSharer} checked={sharers} data={this.props.users} />
                    <button type="submit" className="btn btn-primary">Save</button>&nbsp;
                    <button onClick={this.hideForm} type="cancel" className="btn btn-danger">Cancel</button>
                </form>
            </div>);
    },

    render: function() {
        var resolved = utils.resolve([this.props.payment]);
        var users = [];
        this.props.users.forEach(function(u) {
            users.push(u.name);
        });
        var payers = this.props.payment.sharers.filter(function(due, i) {
            var temp = resolved.balance.filter(function(d) {
                return d.name === due.name;
            });
            due.balance = temp[0];
            return due.payer === true;
        })
        .map(function(p, i) {
            return <span>{p.name}</span>;
        });

        var dues = this.props.payment.sharers.filter(function (due, i) {
            return due.payer === false;
        })
        .map(function(d, i) {
            return <Due key={i} due={d} />;
        });

        var balance = resolved.balance.map(function (b) {
            var bal = b.balance / 100;
            var color = { color: "red" };
            if (parseInt(bal) > 0) {
                color = { color: "green" };
            }
            return <span>{b.name} <span style={color}>{bal}</span><br /></span>;
        });

        // remove to show balance
        balance = "";

        var payer = payers.name;
        var date = new Date(this.props.payment.created)
        var when = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + "  " +
            (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
        var style = { color: "#777" };
        var otherStyle = { color: "#2a6496" };
        var testStyle = { paddingBottom: "20px" };
        var content = (
            <div className="row" style={testStyle}>
                <div className="col-xs-10">
                    <div className="payment">
                        <span style={otherStyle}>{ this.props.payment.amount }</span> »{ this.props.payment.description }
                    </div>
                    <div>
                        <div>
                            <small style={style}>{when}</small> <br />
                        </div>
                        <div>{payers} &#8594; {dues}</div>
                        <div>{balance}</div>
                    </div>
                </div>
                <div className="col-xs-2">
                    <a onClick={this.editPayment} href="#"><span className="glyphicon glyphicon-edit"></span></a>&nbsp;
                    <a onClick={this.deletePayment} href="#"><span className="glyphicon glyphicon-remove-circle"></span></a>
                </div>
            </div>
        );
        if (this.state.editing) {
            content = this.showForm();
        }
        return content;
    }
});
