sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
			"FSC360NEW/model/formatter"

], function(Controller, Filter, FilterOperator,formatter) {
	"use strict";

	var gArguments = {};

	return Controller.extend("FSC360NEW.controller.Invoice", {

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			/*	oRouterInvoice.getRoute("Invoice").attachMatched(this.onRouteMatched, this);
			 */
			this.oRouterInvoice = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Invoice").attachMatched(this.onRouteMatched, this);

		},
		onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			gArguments = oArguments;
			this.fn_listexpen();

		},
		fn_listexpen: function() {
			var QueueID = gArguments.QueueID;
			var Wi_id = gArguments.Wi_id;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var that = this;
			oModel.read("/DeepHeadSet", {
				filters: [
					new Filter("WiId", FilterOperator.EQ, Wi_id),
					new Filter("Qid", FilterOperator.EQ, QueueID)
				],
				urlParameters: {
					$expand: "NavTrigger,NavItemDet,NavItemPODet"

				},

				success: function(oData, oResponse) {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavTrigger.results);
					that.getView().setModel(oModel, 'JMInvdet');

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavItemDet.results);
					that.getView().setModel(oModel, 'JMItemdet');

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavItemPODet.results);
					that.getView().setModel(oModel, 'JMItemdetPO');

					var vComData = [];

					if (oData.results[0].NavTrigger.results[0].Tdstring !== "") {
						var vTdline = oData.results[0].NavTrigger.results[0].Tdstring;
						// for (var i = 0; i < (oData.results[0].NavTrigger.results[0].Tdstring.match(/commented/g)).length; i++) {
						// 	var user = vTdline.split(':-')[0].replaceAll('-', '').replace(/\s+/g, '').replaceAll(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
						// 	// var vComent = vTdline.split(':-')[1].replaceAll('-', '').replace(/\s+/g, '');
						// 	var vComent = vTdline.split(':-')[2].trim();
						// 	vComent = vComent.slice(0, vComent.indexOf('$$'));
						// 	var temp = {
						// 		"From": user.split('commentedon')[0],
						// 		"Comment": vComent,
						// 		"Time": vTdline.split(':-')[3].trim()
						// 	};
						// 	vComData.push(temp);
						// 	var indx = vTdline.indexOf('commented')[1];
						// 	if (indx >= 1) {
						// 		vTdline = vTdline.slice(indx - 5);
						// 	}
						// }
						var linebreak = vTdline.split('\n');
						var userind = 0;
						var comind = 1;
						var temp = {};
						var len = linebreak.length - 1;
						for (var i = 0; i < len; i++) {
							if (i === userind) {
								temp.From = linebreak[i].slice(0, linebreak[i].indexOf('comment'));
								temp.From = temp.From.replaceAll('$', "");
								userind = userind + 2;
							} else if (i === comind) {
								temp.Comment = linebreak[i];
								temp.Comment = temp.Comment.replaceAll('&', "");
								comind = comind + 2;
							}
							temp.Time = linebreak[len];
							temp.Time = temp.Time.replaceAll('%', "");
							if (typeof(temp.From) !== "undefined" && typeof(temp.Comment) !== "undefined" && typeof(temp.Time) !== "undefined") {
								vComData.push(temp);
								temp = {};
							}
						}
						var oCommentJSON = new sap.ui.model.json.JSONModel();
						oCommentJSON.setData(vComData);
						that.getView().setModel(oCommentJSON, 'JMInvComment');

					}else{
						var vComData1 = [];
						var oCommentJSON = new sap.ui.model.json.JSONModel();
						oCommentJSON.setData(vComData1);
						that.getView().setModel(oCommentJSON, 'JMInvComment');
					}

					var vTranstype = oData.results[0].NavTrigger.results[0].Transtype;
					if (vTranstype <= 3) {
						that.getView().byId('id_polist').setVisible(true);
						that.getView().byId('id_nonpolist').setVisible(false);
					} else if (vTranstype >= 4) {
						that.getView().byId('id_polist').setVisible(false);
						that.getView().byId('id_nonpolist').setVisible(true);
					}

				},
				error: function(oRes) {

					sap.m.MessageBox.error("Error");

				}

			});

			var array = {
				"list": [{
					"profit": "Profit Centre ",
					"cost": "Cost Centre",
					"currency": "Currency",
					":": ":",
					"Accounting": "Accounting",
					"6000": "6,000",
					"inr": "INR",
					"tax": "Tax code",
					"amount": "Amount :",
					"400": "â‚¹ 400.00"

				}]

			};

			var oJSonModel = new sap.ui.model.json.JSONModel();
			oJSonModel.setData(array);
			this.getView().setModel(oJSonModel, "JMList");

			var arr = {
				"list": [{

					"user": "DINESH",
					"comment": "Testing comment approval",
					"time": "2 Hours ago"

				}, {

					"user": "RAAJ",
					"comment": "Testing comment approval",
					"time": "8 Hours ago"

				}, {

					"user": "DINESH",
					"comment": "Testing comment approval",
					"time": "2 Hours ago"

				}, {

					"user": "RAAJ",
					"comment": "Testing comment approval",
					"time": "8 Hours ago"

				}]

			};

			var oJSonModel1 = new sap.ui.model.json.JSONModel();
			oJSonModel1.setData(arr);
			this.getView().setModel(oJSonModel1, "JMList1");
			var length = this.getView().getModel("JMList1").getData().list.length;
			/*	formatter.fn_list(length);*/
			/*	this.getView().byId("id_hbox").removeStyleClass("cl_invuservbox");*/
			/*	for (var i = 0; i < length; i++) {*/

			/*	this.getView().byId("id_hbox").addStyleClass("cl_invuservbox");*/

			/*	this.getView().byId("id_hbox").addStyleClass("cl_invuservbox1");*/

			/*	}*/
		},

		fn_accept: function() {
			if (!this.Confirm) {
				this.Confirm = sap.ui.xmlfragment("Invoice_Approval.Fragment.Confirm", this);
				this.getView().addDependent(this.Confirm);
			}
			this.Confirm.open();
		},
		fn_navback: function() {

			if (gArguments.flagid === '1') {
				this.oRouterInvoice.navTo("History");
			} else {
				this.oRouterInvoice.navTo("Dashboard");
			}
		},
		fn_fragclose: function() {
			this.Confirm.close();
		},
		fn_pdf: function(oEvent) {
			if (!this.pdf) {
				this.pdf = sap.ui.xmlfragment("Invoice_Approval.Fragment.Viewpdf", this);
				this.getView().addDependent(this.pdf);
			}
			this.pdf.open();
			var Queid = gArguments.QueueID;
			this.fnGetPDF(Queid);
		},
		fnfragPDFClose: function() {
			this.pdf.close();
		},
		fnGetPDF: function(Queid) {

			sap.ui.getCore().byId("id_scrllview").setBusy(false);
			var oScorl = sap.ui.getCore().byId("id_scrllview");

			oScorl.destroyContent();
			var Url = "/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/ImageSet('" + Queid + "')/$value";

			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div class='overlay'><iframe src=" + Url + " id='id_scrllview' '  height='400' width='300'></iframe></div>";

			oHtml.setContent(oContent);

			var oScrl = sap.ui.getCore().byId("id_scrllview");
			oScrl.addContent(oHtml);

			oScrl.setVisible(true);

			$('id_scrll').click(false);

		},
		fn_approve: function() {
			if (!this.Success) {
				this.Success = sap.ui.xmlfragment("Invoice_Approval.Fragment.success", this);
				this.getView().addDependent(this.Success);
			}
			this.Success.open();
		},
		fn_fragokay: function() {
			this.Success.close();
			this.Confirm.close();
		}
	});

});