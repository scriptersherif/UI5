sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
		"FSC360NEW/model/formatter"
], function(Controller, Filter, FilterOperator,formatter) {
	"use strict";

	return Controller.extend("FSC360NEW.controller.History", {

		onInit: function() {
			this.oRouterHistory = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouterHistory.attachRoutePatternMatched(this.fnHistory, this);
			// this.fn_list();
		},
		fnHistory: function(oEvent) {
			var val_flag = 'H';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var that = this;
			oModel.read("/DeepHeadSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, val_flag)
				],
				urlParameters: {
					$expand: "NavTrigger"

				},

				success: function(oData, oResponse) {
					var len = oData.results[0].NavTrigger.results.length;
					var oHisJson = {
						"Details": oData.results[0].NavTrigger.results
					};

					var jsonApprData = {
						oAprList: []
					};
					var jsonRejData = {
						oRejList: []
					};
					var jsonCapData = {
						oCapList: []
					};

					for (var i = 0; i < len; i++) {
						if (oHisJson.Details[i].Stats === "S41") {
							jsonApprData.oAprList.push(oData.results[0].NavTrigger.results[i]);
						} else if (oHisJson.Details[i].Stats === "S50") {
							jsonRejData.oRejList.push(oData.results[0].NavTrigger.results[i]);
						} else if (oHisJson.Details[i].Stats === "S10") {
							jsonCapData.oCapList.push(oData.results[0].NavTrigger.results[i]);
						}

					}

					var oApprJsonModel = new sap.ui.model.json.JSONModel();
					oApprJsonModel.setData(jsonApprData);
					that.getView().setModel(oApprJsonModel, "JMApproved");

					var oRejJsonModel = new sap.ui.model.json.JSONModel();
					oRejJsonModel.setData(jsonRejData);
					that.getView().setModel(oRejJsonModel, "JMRejected");

					var oCapJsonModel = new sap.ui.model.json.JSONModel();
					oCapJsonModel.setData(jsonCapData);
					oCapJsonModel.setSizeLimit(1000);
					that.getView().setModel(oCapJsonModel, "JMCaptured");

					// sap.m.MessageToast.show('Success');

				},
				error: function(oRes) {

					sap.m.MessageBox.error("Error");

				}

			});
		},
		/*	fn_list: function() {
				var array = {
					"list": [{
						"stovendor": "STO Vendor",
						"400": "400.00 INR",
						"inv": "#INV-450000352",
						"date": "01/12/2020",
						"view": "View Details >>"

					}, {
						"stovendor": "STO Vendor",
						"400": "400.00 INR",
						"inv": "#INV-450000352",
						"date": "01/12/2020",
						"view": "View Details >>"

					}, {
						"stovendor": "STO Vendor",
						"400": "400.00 INR",
						"inv": "#INV-450000352",
						"date": "01/12/2020",
						"view": "View Details >>"

					}, {
						"stovendor": "STO Vendor",
						"400": "400.00 INR",
						"inv": "#INV-450000352",
						"date": "01/12/2020",
						"view": "View Details >>"

					}, {
						"stovendor": "STO Vendor",
						"400": "400.00 INR",
						"inv": "#INV-450000352",
						"date": "01/12/2020",
						"view": "View Details >>"

					}, {
						"stovendor": "STO Vendor",
						"400": "400.00 INR",
						"inv": "#INV-450000352",
						"date": "01/12/2020",
						"view": "View Details >>"

					}]

				};

				var oJSonModel = new sap.ui.model.json.JSONModel();
				oJSonModel.setData(array);
				this.getView().setModel(oJSonModel, "JMList");

			},*/
		fn_navback: function() {
			this.oRouterHistory.navTo("Dashboard");
		},
		fn_icontabPress: function(oEvent) {
			var vBtnPressed = oEvent;
		},

		fn_onviewpress: function(oEvent) {
			// oEvent.getSource().getModel('APR').getData();
			/*	if (vBtnPressed == "Approved") {
					var oBindingData = oEvent.getSource().getParent().getParent().getBindingContext("JMApproved");
				} else if (vBtnPressed === "Rejected") {
					var oBindingData = oEvent.getSource().getParent().getParent().getBindingContext("JMRejected");
				} else if (vBtnPressed === "Captured") {
					var oBindingData = oEvent.getSource().getParent().getParent().getBindingContext("JMCaptured");
				}*/
			/*	var vQID = oBindingData.getProperty('Queid');
				var vWiId = oBindingData.getProperty('WiId');*/

			var approved = oEvent.getSource().getBindingContext('JMApproved');
			var rejected = oEvent.getSource().getBindingContext('JMRejected');
			var captured = oEvent.getSource().getBindingContext('JMCaptured');

			if (approved != undefined) {
				var vQID = oEvent.getSource().getBindingContext('JMApproved').getProperty('Qid');
			} else if (rejected != undefined) {
				vQID = oEvent.getSource().getBindingContext('JMRejected').getProperty('Qid');
			} else if (captured != undefined) {
				vQID = oEvent.getSource().getBindingContext('JMCaptured').getProperty('Qid');
			}

			var oModel = this.getOwnerComponent().getModel("JMFlag");
			var arr = [{
				"flag": false
			}];

			oModel.setData(arr);
			this.getView().setModel(oModel, "JMFlag");
			var flagid = 1;
			var vWiId = ' ';
			this.oRouterHistory.navTo("Invoice", {
				"flagid": flagid,
				"QueueID": vQID,
				"Wi_id": vWiId
			});
		}

	});

});