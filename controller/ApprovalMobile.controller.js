sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
		"FSC360NEW/model/formatter"
], function(Controller, MessageToast, MessageBox, Filter, FilterOperator, formatter ) {
	"use strict";

	var oGlobalBusyDialog = new sap.m.BusyDialog();

	return Controller.extend("FSC360NEW.controller.ApprovalMobile", {

	onInit: function() {
		
    this.oRouterDashboard = sap.ui.core.UIComponent.getRouterFor(this);
    this.oRouterDashboard.getRoute("ApprovalMobile").attachPatternMatched(this._onRouteMatched, this);
    this.fn_list();
    
},

_onRouteMatched: function() {
    var oSplitApp = sap.ui.getCore().byId("id_split");
    if (oSplitApp) {
        oSplitApp.setShowSecondaryContent(false);
        var oSidebar = oSplitApp.byId("idMainSidebar");
        if (oSidebar) {
            oSidebar.setVisible(false);
        }
    }
}
,

		fn_list: function() {
			var val_flag = 'I';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var that = this;
			oModel.read("/DeepHeadSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, val_flag)
					// new Filter("Qid", FilterOperator.EQ, QueueID)
				],
				urlParameters: {
					$expand: "NavTrigger"

				},

				success: function(oData, oResponse) {
					var oReadyData = [];
					var oCompleted = [];

					for (var i = 0; i < oData.results[0].NavTrigger.results.length; i++) {
						if (oData.results[0].NavTrigger.results[i].WiStat === "READY" || oData.results[0].NavTrigger.results[1].WiStat === "STARTED") {
							oReadyData.push(oData.results[0].NavTrigger.results[i]);
						} else {
							oCompleted.push(oData.results[0].NavTrigger.results[i]);
						}
					}

					for (var j = 0; j < oReadyData.length; j++) {
						if (oReadyData[j].Transtype <= 3) {
							oReadyData[j].PO = true;
							oReadyData[j].NPO = false;
						} else if (oReadyData[j].Transtype >= 4) {
							oReadyData[j].PO = false;
							oReadyData[j].NPO = true;
						}
					}
					var jsonData = {
						oList: oReadyData
					};

					var oLocJsonModel = new sap.ui.model.json.JSONModel();
					oLocJsonModel.setData(jsonData.oList);
					that.getView().setModel(oLocJsonModel, 'JMQidlist');

					// sap.m.MessageToast.show('Success');

				},
				error: function(oRes) {

					sap.m.MessageBox.error("Error");

				}

			});
			// var arraylist = {
			// 	"list": [{
			// 		"stovendor": "STO Vendor",
			// 		"400": "400.00 INR",
			// 		"inv": "#INV-450000352",
			// 		"date": "01/12/2020,15:30",
			// 		"view": "View Details"

			// 	}, {
			// 		"stovendor": "STO Vendor",
			// 		"400": "400.00 INR",
			// 		"inv": "#INV-450000352",
			// 		"date": "01/12/2020,15:30",
			// 		"view": "View Details"
			// 	}, {
			// 		"stovendor": "STO Vendor",
			// 		"400": "400.00 INR",
			// 		"inv": "#INV-450000352",
			// 		"date": "01/12/2020,15:30",
			// 		"view": "View Details"
			// 	}, {
			// 		"stovendor": "STO Vendor",
			// 		"400": "400.00 INR",
			// 		"inv": "#INV-450000352",
			// 		"date": "01/12/2020,15:30",
			// 		"view": "View Details"
			// 	}, {
			// 		"stovendor": "STO Vendor",
			// 		"400": "400.00 INR",
			// 		"inv": "#INV-450000352",
			// 		"date": "01/12/2020,15:30",
			// 		"view": "View Details"

			// 	}]

			// };

			// var oJSonModel = new sap.ui.model.json.JSONModel();
			// oJSonModel.setData(arraylist);
			// this.getView().setModel(oJSonModel, "JMItem");
		},
		fn_pdf: function(oEvent) {
			if (!this.pdf) {
				this.pdf = sap.ui.xmlfragment("Invoice_Approval.Fragment.getPDF", this);
				this.getView().addDependent(this.pdf);
			}
			this.pdf.open();
			var Queid = oEvent.getSource().getBindingContext('JMQidlist').getProperty('Qid');
			this.fnGetPDF(Queid);
		},
		fnfragPDFClose: function() {
			this.pdf.close();
		},
		fnGetPDF: function(Queid) {

			sap.ui.getCore().byId("id_scrll").setBusy(false);
			var oScorl = sap.ui.getCore().byId("id_scrll");

			oScorl.destroyContent();
			var Url = "/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/ImageSet('" + Queid + "')/$value";

			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div class='overlay'><iframe src=" + Url + " id='id_scrll' ' class='cl_pdfali'></iframe></div>";

			oHtml.setContent(oContent);

			var oScrl = sap.ui.getCore().byId("id_scrll");
			oScrl.addContent(oHtml);

			oScrl.setVisible(true);

			$('id_scrll').click(false);

		},

		// fn_viewdet: function(oEvent) {
		// 	var oModel = this.getOwnerComponent().getModel("JMFlag");
		// 	var QueueID = oEvent.getSource().getBindingContext('JMQidlist').getProperty('Qid');
		// 	var Wi_id = oEvent.getSource().getBindingContext('JMQidlist').getProperty('WiId');
		// 	var Stats = oEvent.getSource().getBindingContext('JMQidlist').getProperty('Stats');
		// 	// if (Stats === 'S30') {
		// 	// 	var arr = [{
		// 	// 		"flag": true
		// 	// 	}];
		// 	// } else {
		// 	// 	 arr = [{
		// 	// 		"flag": false
		// 	// 	}];
		// 	// }

		// 	var arr = [{
		// 		"flag": false
		// 	}];

		// 	oModel.setData(arr);
		// 	this.getView().setModel(oModel, "JMFlag");

		// 	var flagid = 0;
		// 	this.oRouterDashboard.navTo("Invoice", {
		// 		"flagid": flagid,
		// 		"QueueID": QueueID,
		// 		"Wi_id": Wi_id
		// 	});
		// },
	fn_viewdet: function (oEvent) {
	var oItem = oEvent.getSource();
	var oCtx = oItem.getBindingContext("JMQidlist");

	if (!oCtx) {
		console.error("No binding context found.");
		return;
	}

	var QueueID = oCtx.getProperty("Qid");
	var Wi_id = oCtx.getProperty("WiId");

	// Initialize or get the model
	var oModel = this.getOwnerComponent().getModel("JMFlag");
	if (!oModel) {
		oModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oModel, "JMFlag");
	}
	oModel.setData([{ flag: false }]);

	this.oRouterDashboard.navTo("Invoice", {
		"flagid": 0,
		"QueueID": QueueID,
		"Wi_id": Wi_id
	});
}

,
		fn_acceptrejpress: function(oEvent) {
			var that = this;
			this.oBoundData = oEvent.getSource().getParent().getParent().getBindingContext("JMQidlist");
			var vOperation = oEvent.getSource().getProperty("text");
			var oRemarkDialog = new sap.m.Dialog({
				title: 'Remarks',
				icon: 'sap-icon://message',
				type: 'Message',
				styleClass: 'cl_remarksBox',
				content: new sap.m.TextArea({
					id: 'id_remarks',
					placeholder: 'Remarks',
					width: '100%'
				}),
				beginButton: new sap.m.Button({
					text: 'Cancel',
					press: function(oEvent) {

						oRemarkDialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'Submit',
					press: function(oEvent) {
						var vRemarks = sap.ui.getCore().byId("id_remarks").getValue();
						that.fnConfirmation(that.oBoundData, vRemarks, vOperation);
						oRemarkDialog.close(); // Closing the message box
					}
				}),

				afterClose: function() {
					oRemarkDialog.destroy(); // Destroying sall message boxes
				}
			});
			oRemarkDialog.open(); // To open the Remarks dialog box 
		},

		fnConfirmation: function(oEvent, vRemarks, vOperation) {
			var that = this;
			// this.oEvtAgr = this.oMainEvent.getParent().getParent().getAggregation("content");
			// var oAggregations = this.oEvtAgr[0].getAggregation("content");
			// var vQID = oAggregations[0].mProperties.text;
			// vQID = vQID.split("Queid : ");
			// vQID = vQID[1];

			var vQID = oEvent.getProperty("Qid");
			var vQueid = +vQID;
			var vTrntp = oEvent.getProperty("Trntp");
			// var vTitle = oEvent.getProperty("Name1");
			var vWiId = oEvent.getProperty("WiId");
			//		var vComments;

			// var vBtnText = this.oMainEvent.getText();
			if (vOperation == "Accept") {
				var vState = "A";
				var vMessage = "has been approved";
				var vType = "Success";
			} else {
				var vState = "R";
				var vMessage = "has been rejected";
				var vType = "Error";
			}

			var oEntity = {
				WiId: vWiId,
				WiText: vState,
				Imgurl: vRemarks,
				Qid: vQID
			};

			var oModel = this.getOwnerComponent().getModel();
			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				icon: 'sap-icon://question-mark',
				type: 'Message',
				state: vType,
				content: new sap.m.Text({
					text: 'Are you sure you want to ' + vOperation
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function() {

						oGlobalBusyDialog.open();

						var oModelC = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
						var obj = {};
						obj.NavTrigger = [];
						obj.NavReturn = [];
						obj.NavTrigger.push(oEntity);
						oModelC.create("/DeepHeadSet", obj, {
							success: function(oData, oResponse) {
								dialog.close();
								var type = oData.NavReturn.results[0].MsgType;
								if (type === 'S') {
									// sap.m.MessageBox.success(oData.NavReturn.results[0].Line);

									sap.m.MessageBox.success(oData.NavReturn.results[0].Line, {
										actions: [MessageBox.Action.OK],
										styleClass: "cl_message_box",
										emphasizedAction: MessageBox.Action.OK,
										onClose: function(sAction) {
											if (sAction === "OK") {
												that.fn_list();
											}
										}
									});

								} else if (type === 'E') {
									sap.m.MessageBox.error(oData.NavReturn.results[0].Line);
								}

								that.fn_list();
								oGlobalBusyDialog.close();
							},

							fail: function(oResponse) {
								sap.m.MessageBox.error("Error");
								oGlobalBusyDialog.close();
								dialog.close();

							}
						});
					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function() {
						dialog.close(); // Closing the message box
					}
				}),

				afterClose: function() {
					dialog.destroy(); // Destroying sall message boxes
				}
			});

			dialog.open(); // To open the dialog box
		},
		fn_navHistory: function() {
			this.oRouterDashboard.navTo("History");
		},
		fn_navCapture: function() {
			this.oRouterDashboard.navTo("Capture");
		}
	});

});