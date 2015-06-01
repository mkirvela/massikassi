/** @jsx React.DOM */

"use strict";
var utils = require("./utils.js");

var React = require("react");

var EventBox = require("./event.jsx");
var PaymentBox = require("./paymentBox.jsx");
var UserBox = require("./userBox.jsx");
var ResolveBox = require("./resolve.jsx");

var App = React.createClass({
    componentWillMount: function() {
        $.ajax({
            url: eventUrl,
            dataType: "json",
            success: function(data) {
                eventDetails = data;
                var eventData = { created_by: data.created_by, name: data.name, created: data.created };
                this.setProps(eventData);
                this.setState({ payments: data.payments });
                this.resolve(data.payments);
            }.bind(this),
            error: function(xhr, status, err) {
                // error handling?
            }.bind(this)
        });
    },

    resolve: function(payments) {
        var resolved = utils.resolve(payments);
        this.setState({ balance: resolved.balance, resolved: resolved.resolved, total: resolved.total });
    },

    getInitialState: function() {
        return { data: [ { name: "" }],
            payments: [],
            balance: [],
            resolved: [],
            total: 0,
            shown: false };
    },

    bubbleDues: function(dues) {
        this.setState({ balance: [ "jee"] });
        //this.setState({ balance: dues });
    },

    signalUsersChange: function(data) {
        this.setState(data);
    },

    showPaymentForm: function(value) {
        //$("#payment-form").toggle();
        this.setState({ shown: value });
    },

    deletePayment: function(id) {
        var payments = this.state.payments;
        var newPayments = payments.filter(function(elem) {
            return elem.id != id;
        });
        this.resolve(newPayments);
        this.setState({payments: newPayments});
    },

    updatePayments: function(data) {
        var oldPayments = this.state.payments;
        oldPayments.push(data.added);

        var payments = oldPayments.filter(function(elem) {
            return elem.id != data.deleted.id;
        });

        payments.sort(function(a, b) {
            if (a.created < b.created) { return 1; }
            if (a.created > b.created) { return -1; }
            // this should happen since all keys are unique
            return 0;
        });
        this.resolve(payments);
        //var newPayments = oldPayments.concat([data]);
        this.setState({ payments: payments });
    },

    render: function() {
        return (
            <div>
                <div className="col-md-9">
                    <div id="event_info">
                        <EventBox toggleInput={this.toggleInput} showPaymentForm={this.showPaymentForm} eventData={this.props.eventData} url={this.props.eventUrl} />
                    </div>
                    <div id="payment-add">
                        <PaymentBox shown={this.state.shown} showPaymentForm={this.showPaymentForm} deletePayment={this.deletePayment} updatePayments={this.updatePayments} url={this.props.paymentUrl} payments={this.state.payments} data={this.state.data} />
                    </div>
                </div>
                <div className="col-md-3" id="user_list">
                    <UserBox balance={this.state.balance} url={this.props.userUrl} onUserChange={this.signalUsersChange}/>
                    <ResolveBox total={this.state.total} resolved={this.state.resolved} bubble={this.bubbleDues} payments={this.state.payments} />
                </div>
            </div>
        );
    }
});

var eventUrl = "/api/event?hash=" + eventInfo.hash;
var userUrl = "/api/users?hash=" + eventInfo.hash;
var paymentUrl = "/api/payment?hash=" + eventInfo.hash;
var payments = {};
var eventDetails;


React.renderComponent(
    <App eventData={eventInfo} paymentUrl={paymentUrl} eventUrl={eventUrl} userUrl={userUrl} />,
    document.getElementById("massikassi-app")
);
