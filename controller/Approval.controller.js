sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageToast, MessageBox, Filter, FilterOperator, formatter, BusyIndicator) {
	"use strict";

	return Controller.extend("FSC360NEW.controller.Approval", {
		formatter: formatter,

		onInit: function() {
						this.fn_LoadInitial();
			this.getView().byId('id_statusBtn_app').setVisible(false);

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Approval").attachPatternMatched(this.FnonRouteMatched, this);
		},
		FnonRouteMatched: function() {

			this.fn_list();
			this.fnHistory();
			this.fn_LoadInitial();
			this.getView().byId('id_statusBtn_app').setVisible(false);
			var oView = this.getView();
			var aModels = ["JMInvComment", "JMItemdet", "JMItemdetPO", "JMQidlist", "JMRejected", "JMApproved"];
			this.byId("idvendorname").setText("");
			this.byId("idinvoiceno").setText("");
			this.byId("idDateText").setText("");
			this.byId("idvendaddress").setText("");
			aModels.forEach(function(sName) {
				var oModel = oView.getModel(sName);
				if (oModel) {
					oModel.setData([]);
				}
			});
		 var oList = this.byId("id_qidList");
		    if (oList) {
		        var oItems = oList.getItems();
		        oItems.forEach(function(item) {
		            var oCtx = item.getBindingContext("JMQidlist");
		            if (oCtx) {
		                oCtx.getModel().setProperty(oCtx.getPath() + "/selected", false);
		            }
		        });
		    }
		
		    // Reset Select All checkbox and counter
		    var oSelectAll = this.byId("idSelectAll");
		    if (oSelectAll) {
		        oSelectAll.setSelected(false);
		        oSelectAll.removeStyleClass("partialSelectedCheckbox");
		    }
		    this.byId("id_selected").setText("0");
		
		    this.onItemSelect();

		},
		fn_detail_call: function(oEvent) {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			BusyIndicator.show(0);
			oModel.read("/SummarySet", {

				urlParameters: {
					$expand: "SummarySet,Det_summarySet"
				},
				success: function(oData, oResponse) {

					BusyIndicator.hide();
					if (oData.results[0].SummarySet.results) {
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].SummarySet.results);
						that.getView().setModel(oModel, 'Sumary');
						that._allDetails = oData.results[0].Det_summarySet.results;

					}

				},

				fail: function(oResponse) {
					BusyIndicator.hide();
					MessageToast.show("Failed to perform the operation");

				}
			});

		},

		fnitempress: function(oEvent) {
			// Show invoice summary
			var oInvoiceSummary = this.byId("idinvoicesummary");
			if (oInvoiceSummary) {
				oInvoiceSummary.setVisible(true);
			}

			// Hide action box
			var oActionBox = this.byId("idActionBox");
			if (oActionBox) {
				oActionBox.setVisible(false);
			}

			// Highlight clicked item
			var oClickedItem = oEvent.getParameter("listItem");
			var oList = this.byId("id_summaryList");
			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});
			oClickedItem.addStyleClass("selectedListItem");

			// Get data from selected Summary row
			var oContext = oClickedItem.getBindingContext("Sumary");
			var vAgent = oContext.getProperty("DueWithId");
			var vStatus = oContext.getProperty("Status");

			// Get all details from controller memory (set in fn_detail_call)
			var aAllDetails = this._allDetails || [];

			// Filter only matching rows
			var aFiltered = aAllDetails.filter(function(item) {
				return item.Agent === vAgent && item.Status === vStatus;
			});

			// Bind filtered data to detail model
			var oDetModel = new sap.ui.model.json.JSONModel({
				results: aFiltered
			});
			this.getView().setModel(oDetModel, "Sumary_Det");

			// Show the table
			var oDetailTable = this.byId("id_table_1");
			if (oDetailTable) {
				oDetailTable.setVisible(true);

				// Dynamically set visible row count
				var iCount = aFiltered.length;
				if (iCount > 0) {
					oDetailTable.setVisibleRowCount(Math.min(iCount, 10)); // cap at 10
				} else {
					oDetailTable.setVisibleRowCount(1); // show empty row
				}
			}
		}

		,
		// onpressdownicon: function(oEvent) {
		// 	this.getView().byId("id_table_1").setVisible(false);
		// },
		// onpressexcelicon: function(oEvent) {
		// 	var that = this;
		// 	var aData = this.getView().getModel("Sumary_Det").getProperty("/");
		// 	var oExport = new sap.ui.core.util.Export({
		// 		exportType: new sap.ui.core.util.ExportTypeCSV({
		// 			fileExtension: "csv",
		// 			separatorChar: ",",
		// 			charset: "utf-8"
		// 		}),
		// 		models: this.getView().getModel("Sumary_Det"),
		// 		rows: {
		// 			path: "/"
		// 		},
		// 		columns: [{
		// 			label: "Vendor",
		// 			property: "Lifnr"
		// 		}, {
		// 			label: "Email",
		// 			property: "Email"
		// 		}, {
		// 			label: "Agent",
		// 			property: "Agent"
		// 		}, {
		// 			label: "Vendor Name",
		// 			property: "Name1"
		// 		}, {
		// 			label: "Status",
		// 			property: "Status"
		// 		}, {
		// 			label: "Invoice Number",
		// 			property: "Invno"
		// 		}, {
		// 			label: "Amount",
		// 			property: "Ntamt",
		// 			type: "number",
		// 			scale: 0
		// 		}, {
		// 			label: "Ageing",
		// 			property: "AgeingDet"
		// 		}]
		// 	});

		// 	oExport.saveFile("Template").catch(function(oError) {
		// 		that.fnShowErrorDialog("Error when downloading data..." + oError);
			
		// 	}).then(function() {
		// 		oExport.destroy();
		// 	});
		// },
		onItemSelect: function(oEvent) {
			const oList = this.byId("id_qidList");
			const oItems = oList.getItems();
			let selectedCount = 0;

			oItems.forEach((item) => {
				const context = item.getBindingContext("JMQidlist");
				if (context.getProperty("selected")) {
					selectedCount++;

				}
			});

			// Update "Select All" checkbox status
			const oSelectAll = this.byId("idSelectAll");
			const total = oItems.length;

			if (total > 0 &&  selectedCount === total) {
				oSelectAll.setSelected(true);
				oSelectAll.removeStyleClass("partialSelectedCheckbox");
			} else if (selectedCount > 0) {
				oSelectAll.setSelected(false);
				oSelectAll.addStyleClass("partialSelectedCheckbox");
			} else {
				oSelectAll.setSelected(false);
				oSelectAll.removeStyleClass("partialSelectedCheckbox");
			}

			// Show/hide the boxes based on count
			const oActionBox = this.byId("idActionBox");
			const oHiddenBox = this.byId("idHiddenBox");
			const footerbox = this.byId("web_app_footer");

			if (selectedCount < 2) {
				oActionBox.setVisible(true);
				oHiddenBox.setVisible(false);
				footerbox.setVisible(false);
			} else {
				oActionBox.setVisible(false);
				oHiddenBox.setVisible(true);
				footerbox.setVisible(true);
			}
			this.byId("id_selected").setText(selectedCount);
		},
		onSelectAllChange: function(oEvent) {
			const bSelected = oEvent.getParameter("selected");
			const oList = this.byId("id_qidList");
			const oItems = oList.getItems();

			let selectedCount = 0;

			oItems.forEach((item) => {
				const context = item.getBindingContext("JMQidlist");
				const path = context.getPath();
				const model = context.getModel();

				// Set the selected state
				model.setProperty(path + "/selected", bSelected);

				// Count selected items
				if (bSelected) {
					selectedCount++;
				}
			});

			this.byId("id_selected").setText(selectedCount);

			// Remove partial class when all are selected
			const oSelectAll = this.byId("idSelectAll");
			if (bSelected) {
				oSelectAll.removeStyleClass("partialSelectedCheckbox");
			}

			// show or hide boxes based on selection
			const oActionBox = this.byId("idActionBox");
			const oHiddenBox = this.byId("idHiddenBox");
			const footerbox = this.byId("web_app_footer");

			if (bSelected) {
				oActionBox.setVisible(false);
				oHiddenBox.setVisible(true);
				footerbox.setVisible(true);
			} else {
				oActionBox.setVisible(true);
				oHiddenBox.setVisible(false);
				footerbox.setVisible(false);
			}
		}
		,
		onSearchList: function(oEvent) {
			var sQuery = oEvent.getParameter("value").toLowerCase();
			var oList = this.byId("id_qidList");
			var oBinding = oList.getBinding("items");

			if (!sQuery) {
				oBinding.filter([]);
				return;
			}

			var oFilter1 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery);
			var oFilter2 = new sap.ui.model.Filter("Invno", sap.ui.model.FilterOperator.Contains, sQuery);
			var oCombinedFilter = new sap.ui.model.Filter([oFilter1, oFilter2], false); // false = OR

			oBinding.filter([oCombinedFilter]);
		},
		onSearchApproved: function(oEvent) {
			var sQuery = oEvent.getParameter("value").toLowerCase(); // get the typed value
			var oList = this.byId("id_approved_list");
			var oBinding = oList.getBinding("items");

			if (!sQuery) {
				oBinding.filter([]); // clear filter if input is empty
				return;
			}

			var oFilter1 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery);
			var oFilter2 = new sap.ui.model.Filter("Invno", sap.ui.model.FilterOperator.Contains, sQuery);
			var oCombinedFilter = new sap.ui.model.Filter([oFilter1, oFilter2], false); // false = OR

			oBinding.filter([oCombinedFilter]);
		},
		onSearchRejected: function(oEvent) {
			var sQuery = oEvent.getParameter("value").toLowerCase(); // get the typed value
			var oList = this.byId("id_rejected_list");
			var oBinding = oList.getBinding("items");

			if (!sQuery) {
				oBinding.filter([]); // clear filter if input is empty
				return;
			}

			var oFilter1 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery);
			var oFilter2 = new sap.ui.model.Filter("Invno", sap.ui.model.FilterOperator.Contains, sQuery);
			var oCombinedFilter = new sap.ui.model.Filter([oFilter1, oFilter2], false); // false = OR

			oBinding.filter([oCombinedFilter]);
		},
		onSearchSummary: function(oEvent) {
			var sQuery = oEvent.getParameter("value").toLowerCase(); // get the typed value
			var oList = this.byId("id_summaryList");
			var oBinding = oList.getBinding("items");

			if (!sQuery) {
				oBinding.filter([]); // clear filter if input is empty
				return;
			}

			var oFilter1 = new sap.ui.model.Filter("DueWithId", sap.ui.model.FilterOperator.Contains, sQuery);
			var oFilter2 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, sQuery);
			var oFilter3 = new sap.ui.model.Filter("Amount", sap.ui.model.FilterOperator.Contains, sQuery);
			var oCombinedFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3], false); // false = OR

			oBinding.filter([oCombinedFilter]);
		},
		fn_LoadInitial: function() {

			var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
			if (oKeyDataModel) {
				var oData = oKeyDataModel.getData(); // { UserName: "John", ... }
				// create a new JSONModel from the plain object
				var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
				// set this JSONModel to your view
				this.getView().setModel(oJSONUserName, "JSusername");
			}

		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		onSegmentPress: function(oEvent) {
			// location.reload();
			var oHBox = this.byId("idCustomSegmentGroup");
			var aButtons = oHBox.getItems();

			// Remove selected style from all buttons
			aButtons.forEach(function(btn) {
				btn.removeStyleClass("cl_segmentBtnSelectedap");
				btn.addStyleClass("cl_segmentBtnUnselectedap");
			});

			// Add selected style to clicked button
			var oClickedBtn = oEvent.getSource();
			oClickedBtn.removeStyleClass("cl_segmentBtnUnselectedap");
			oClickedBtn.addStyleClass("cl_segmentBtnSelectedap");

			// Get the clicked button's value
			var selectedValue = oClickedBtn.getCustomData().find(d => d.getKey() === "value").getValue();

			// Show/hide VBoxes based on value
			if (selectedValue === "L") {
				this.getView().byId('id_statusBtn_app').setVisible(false);
				this.byId("idMyListVBox").setVisible(selectedValue === "L");
				this.byId("idHistoryVBox").setVisible(selectedValue === "H");
				this.byId("idSummaryVBox").setVisible(selectedValue === "S");
				this.byId("idActionBox").setVisible(selectedValue === "L");
				this.byId("idinvoicesummary").setVisible(selectedValue === "S");
				this.byId("btnMyList").setIcon("Images/mylistwhite.svg");
				this.byId("btnHistory").setIcon("Images/histblack.svg");
				this.byId("btnSummary").setIcon("Images/summaryblack1.svg");

				var oList_qid = this.byId("id_qidList");
				if (oList_qid) {
					oList_qid.getItems().forEach(function(item) {
						// remove both UI5 selection state (if any) and your custom class
						if (item.setSelected) {
							item.setSelected(false);
						}
						item.removeStyleClass("selectedListItem");
					});
				}
				this.byId("idvendorname").setText("");
				this.byId("idinvoiceno").setText("");
				this.byId("idDateText").setText("");
				this.byId("idvendaddress").setText("");
				var oItemdetPOModel = this.getView().getModel("JMItemdetPO");
				if (oItemdetPOModel) {
					oItemdetPOModel.setData([]);
				}

				var oItemdetModel = this.getView().getModel("JMItemdet");
				if (oItemdetModel) {
					oItemdetModel.setData([]);
				}

				var oInvCommentModel = this.getView().getModel("JMInvComment");
				if (oInvCommentModel) {
					oInvCommentModel.setData([]);
				}

			} else if (selectedValue === "S") {

				this.byId("idMyListVBox").setVisible(selectedValue === "L");
				this.byId("idHistoryVBox").setVisible(selectedValue === "H");
				this.byId("idSummaryVBox").setVisible(selectedValue === "S");
				this.byId("idinvoicesummary").setVisible(selectedValue === "S");
				this.byId("idActionBox").setVisible(selectedValue === "H");
				this.byId("btnMyList").setIcon("Images/mylistblack.svg");
				this.byId("btnHistory").setIcon("Images/histblack.svg");
				this.byId("btnSummary").setIcon("Images/summarywhite1.svg");
				this._unselectSummaryAndClearDetail();

				this.fn_detail_call();
			} else if (selectedValue === "H") {

				this.byId("idMyListVBox").setVisible(selectedValue === "L");
				this.byId("idHistoryVBox").setVisible(selectedValue === "H");
				this.byId("idActionBox").setVisible(selectedValue === "H");
				this.byId("idSummaryVBox").setVisible(selectedValue === "S");
				this.byId("idinvoicesummary").setVisible(selectedValue === "S");
				this.byId("btnMyList").setIcon("Images/mylistblack.svg");
				this.byId("btnHistory").setIcon("Images/histwhite.svg");
				this.byId("btnSummary").setIcon("Images/summaryblack1.svg");
				this.getView().byId('id_accept').setVisible(false); //Added by Manosankari on 03.11.2025
				this.getView().byId('id_reject').setVisible(false);//Added by Manosankari on 03.11.2025

				var oList_appr = this.byId("id_approved_list");
				if (oList_appr) {
					oList_appr.getItems().forEach(function(item) {

						if (item.setSelected) {
							item.setSelected(false);
						}
						item.removeStyleClass("selectedListItem");
					});
				}

				var oList_rej = this.byId("id_rejected_list");
				if (oList_rej) {
					oList_rej.getItems().forEach(function(item) {

						if (item.setSelected) {
							item.setSelected(false);
						}
						item.removeStyleClass("selectedListItem");
					});
				}
				var oSummaryList = this.byId("id_summaryList");
				if (oSummaryList) {
					oSummaryList.removeSelections(true);
				}

				this.byId("idvendorname").setText("");
				this.byId("idinvoiceno").setText("");
				this.byId("idDateText").setText("");
				this.byId("idvendaddress").setText("");
				var oItemdetPOModel = this.getView().getModel("JMItemdetPO");
				if (oItemdetPOModel) {
					oItemdetPOModel.setData([]);
				}

				var oItemdetModel = this.getView().getModel("JMItemdet");
				if (oItemdetModel) {
					oItemdetModel.setData([]);
				}

				var oInvCommentModel = this.getView().getModel("JMInvComment");
				if (oInvCommentModel) {
					oInvCommentModel.setData([]);
				}

			}
		},
		_unselectSummaryAndClearDetail: function() {
			var oList = this.byId("id_summaryList");
			if (oList) {
				oList.getItems().forEach(function(item) {

					if (item.setSelected) {
						item.setSelected(false);
					}
					item.removeStyleClass("selectedListItem");
				});
			}

			var oDetailModel = this.getView().getModel("Sumary_Det");
			if (oDetailModel) {
				oDetailModel.setData({
					results: []
				});
			}

			var oDetailTable = this.byId("id_table_1");
			if (oDetailTable) {

				oDetailTable.setVisibleRowCount(0);

			}
		}

		,
		fn_list: function() {

			var val_flag = 'I';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var that = this;
			BusyIndicator.show(0);
			oModel.read("/DeepHeadSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, val_flag)

				],
				urlParameters: {
					$expand: "NavTrigger"

				},

				success: function(oData, oResponse) {
					BusyIndicator.hide();
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
					BusyIndicator.hide();
					that.fnShowErrorDialog('Error');
	

				}

			});

		},

		fn_viewdet: function(oEvent) {
			var oClickedItem = oEvent.getSource();
			var oList = this.byId("id_qidList");

			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});

			oClickedItem.addStyleClass("selectedListItem");
			this.getView().byId('id_accept').setVisible(true);
			this.getView().byId('id_reject').setVisible(true);

			var oBindingContext = oEvent.getSource().getBindingContext('JMQidlist');
			var oBoundObject = oBindingContext.getObject();

			this.QueueID = oBoundObject.Qid;
			this.Wi_id = oBoundObject.WiId;
			this.oBoundData = oBoundObject;

			this.fn_listexpen();
		},

		fn_listexpen: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var that = this;
			BusyIndicator.show(0);
			oModel.read("/DeepHeadSet", {
				filters: [
					new Filter("WiId", FilterOperator.EQ, that.Wi_id),
					new Filter("Qid", FilterOperator.EQ, that.QueueID)
				],
				urlParameters: {
					$expand: "NavTrigger,NavItemDet,NavItemPODet"
				},
				success: function(oData) {
					BusyIndicator.hide();
					that.byId("idvendorname").setText(" ");
					that.byId("idinvoiceno").setText(" ");
					that.byId("idvendaddress").setText(" ");
					that.byId("idDateText").setText(" ");
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavTrigger.results[0]);
					that.getView().setModel(oModel, 'JMInvdet');
					var sName = oModel.getProperty("/Name1");
					var sInvno = oModel.getProperty("/Invno");
					var sVendaddr = oModel.getProperty("/VendAddr");
					var sCurrency = oModel.getProperty("/Waers");
					that.byId("idvendorname").setText(sName);
					that.byId("idinvoiceno").setText("#INV-" + sInvno);
					that.byId("idvendaddress").setText(sVendaddr);
					var oDate = oModel.getProperty("/Scandate");
					var oFormattedDate = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					}).format(new Date(oDate));
					that.byId("idDateText").setText(oFormattedDate);

					var aPOItems = oData.results[0].NavTrigger.results[0].NavPOItems?.results || [];
					var oPOModel = new sap.ui.model.json.JSONModel();
					oPOModel.setData({
						results: aPOItems
					});
					that.getView().setModel(oPOModel, "JMItemdetPO");
					// Set visible row count based on data length
					var iRowCount = aPOItems.length;
					var oTable = that.byId("id_polist");
					oTable.setVisibleRowCount(iRowCount > 0 ? iRowCount : 1);
					var aNonPOItems = oData.results[0].NavItemDet?.results || [];

					// Set model for Non-PO items
					var oNonPOModel = new sap.ui.model.json.JSONModel();
					oNonPOModel.setData({
						results: aNonPOItems
					});
					that.getView().setModel(oNonPOModel, "JMItemdet");

					// Set visible row count dynamically
					var iNonPoRowCount = aNonPOItems.length;
					var oNonPoTable = that.byId("id_nonpolist");
					oNonPoTable.setVisibleRowCount(iNonPoRowCount > 0 ? iNonPoRowCount : 1);

					var sCurrency = oModel.getProperty("/Waers");

					// --- Inject currency into Non-PO Items ---
					var aNonPOItems = oData.results[0].NavItemDet.results;
					aNonPOItems.forEach(function(item) {
						item.Currency = sCurrency;
					});
					var oNonPOModel = new sap.ui.model.json.JSONModel();
					oNonPOModel.setData(aNonPOItems);
					that.getView().setModel(oNonPOModel, 'JMItemdet');

					// --- Inject currency into PO Items ---
					var aPOItems = oData.results[0].NavItemPODet.results;
					aPOItems.forEach(function(item) {
						item.Currency = sCurrency;
					});
					var oPOModel = new sap.ui.model.json.JSONModel();
					oPOModel.setData(aPOItems);
					that.getView().setModel(oPOModel, 'JMItemdetPO');

					//line added by yasin on 13-09-2025 start 

					var vComData = [];
					var Tdline = oData.results[0].NavTrigger.results[0].Tdstring.split("* *");
					for (var i = 0; i < Tdline.length; i++) {
						if (Tdline[i] !== "") {
							// remove leading/trailing stars and spaces
							var vTdline = Tdline[i].replace(/^\*+|\*+$/g, "").trim();

							// split into [header, comment]
							var vComent = vTdline.split(":-");

							var vFrom = vComent[0] ? vComent[0].replace(/^\*+/, "").trim() : "";
							var vComment = vComent[1] ? vComent[1].replace(/^\*+/, "").trim() : "";

							var vComobj = {
								"From": vFrom,
								"Comment": vComment
							};

							vComData.push(vComobj);
						}
					}

					vComData.forEach(function(comment, index) {
						if (index !== vComData.length - 1) {
							comment.VBoxClr = true; 
							comment.VBoxWhite = false;
						} else {
							comment.VBoxClr = false; 
							comment.VBoxWhite = false;
						}
					});

					var oCommentJSON = new sap.ui.model.json.JSONModel();
					oCommentJSON.setData(vComData);
					that.getView().setModel(oCommentJSON, 'JMInvComment');

					var vPOlen = oData.results[0].NavItemPODet?.results?.length || 0;
					var vGLlen = oData.results[0].NavItemDet?.results?.length || 0;
					var vTranstype = parseInt(oData.results[0].NavTrigger.results[0].Transtype, 10);

					if (vTranstype <= 3 || vTranstype === 8) {
						// Normal transactions → Show PO list only
						that.getView().byId('id_polist').setVisible(true);
						that.getView().byId('id_nonpolist').setVisible(false);

					} else if (vTranstype === 6) {
						// Down Payment
						if (vPOlen !== 0) {
							that.getView().byId('id_polist').setVisible(true);
							that.getView().byId('id_nonpolist').setVisible(false);
						} else {
							that.getView().byId('id_polist').setVisible(false);
							that.getView().byId('id_nonpolist').setVisible(true);
						}

					} else if (vTranstype === 4 || vTranstype === 5) {
						// GL transactions → Show Non-PO list only
						that.getView().byId('id_polist').setVisible(false);
						that.getView().byId('id_nonpolist').setVisible(true);
					}

				},
				error: function(oRes) {
					BusyIndicator.hide();
					that.fnShowErrorDialog('Error');
				

				}

			});

		},

		fnHistory: function(oEvent) {

			var val_flag = 'H';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var that = this;
			BusyIndicator.show(0);
			oModel.read("/DeepHeadSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, val_flag)
				],
				urlParameters: {
					$expand: "NavTrigger"

				},

				success: function(oData, oResponse) {
					BusyIndicator.hide();
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
						if (oHisJson.Details[i].Stats === "S41" || oHisJson.Details[i].Stats === "S20" || oHisJson.Details[i].Stats === "S60" ||
							oHisJson.Details[i].Stats === "S15" || oHisJson.Details[i].Stats === "S30") {
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
					BusyIndicator.hide();
					that.fnShowErrorDialog('Error');


				}

			});
		},
		onIconTabSelect: function(oEvent) {
			var sKey = oEvent.getParameter("key");

			// Reset all icons to default
			this.byId("tabApproved").setIcon("Images/approveblack.svg");
			this.byId("tabRejected").setIcon("Images/rejblack.svg");

			// Change the selected one
			if (sKey === "approved") {
				this.byId("tabApproved").setIcon("Images/approved_white.svg");
			} else if (sKey === "rejected") {
				this.byId("tabRejected").setIcon("Images/rejected_white.svg");
			}
		},
		fn_onviewpress: function(oEvent) {
			const oActionBox = this.byId("idActionBox");
			const oHiddenBox = this.byId("idHiddenBox");
			const footerbox = this.byId("web_app_footer");

			oActionBox.setVisible(true);
			oHiddenBox.setVisible(false);
			footerbox.setVisible(false);

			this.getView().byId("id_accept").setVisible(false);
			this.getView().byId("id_reject").setVisible(false);
			this.getView().byId("id_statusBtn_app").setVisible(false);

			var approved = oEvent.getSource().getBindingContext("JMApproved");
			var rejected = oEvent.getSource().getBindingContext("JMRejected");
			var captured = oEvent.getSource().getBindingContext("JMCaptured");

			const oStatusBtn = this.byId("id_statusBtn_app");

			let vQID, vWiId = " ";

			// remove old customData (to reset previous status)
			oStatusBtn.removeAllCustomData();

			if (approved) {
				this.getView().byId("id_statusBtn_app").setVisible(true);
				vQID = approved.getProperty("Qid");

				oStatusBtn.setIcon("sap-icon://accept");
				oStatusBtn.setText("Approved");

				oStatusBtn.addCustomData(new sap.ui.core.CustomData({
					key: "status",
					value: "Completed",
					writeToDom: true
				}));

				this._highlightListItem(oEvent, "id_approved_list");

			} else if (rejected) {
				this.getView().byId("id_statusBtn_app").setVisible(true);
				vQID = rejected.getProperty("Qid");

				oStatusBtn.setIcon("sap-icon://decline");
				oStatusBtn.setText("Rejected");

				oStatusBtn.addCustomData(new sap.ui.core.CustomData({
					key: "status",
					value: "Escalated",
					writeToDom: true
				}));

				this._highlightListItem(oEvent, "id_rejected_list");

			} else if (captured) {
				vQID = captured.getProperty("Qid");

				oStatusBtn.setIcon("sap-icon://attachment");
				oStatusBtn.setText("Captured");

				oStatusBtn.addCustomData(new sap.ui.core.CustomData({
					key: "status",
					value: "Captured",
					writeToDom: true
				}));
			}

			this.QueueID = vQID;
			this.Wi_id = vWiId;

			this.fn_listexpen();
		},
		_highlightListItem: function(oEvent, listId) {
			var oClickedItem = oEvent.getSource();
			var oList = this.byId(listId);

			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});

			oClickedItem.addStyleClass("selectedListItem");
		},
		fn_pdf: function(oEvent) {
			if (!this.pdf) {
				this.pdf = sap.ui.xmlfragment(this.getView().getId(), "FSC360NEW.fragment.getPDF", this);
				this.getView().addDependent(this.pdf);
			}
			this.pdf.open();
			if(!QueueID){
				var	QueueID = this.QueueID;
			}
			this.fnGetPDF(QueueID);
		},
		fnfragPDFClose: function() {
			this.pdf.close();
			// this.pdf.destroy();
			// this.pdf=null;
		},
		fnGetPDF: function(Queid) {

			var oScorl = this.getView().byId("id_scrll");

			oScorl.destroyContent();
			var Url = "/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/ImageSet('" + Queid + "')/$value";

			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div class='overlay'><iframe src=" + Url + " id='id_scrll' ' class='cl_pdfali'></iframe></div>";

			oHtml.setContent(oContent);

			var oScrl = this.getView().byId("id_scrll");
			oScrl.addContent(oHtml);

			oScrl.setVisible(true);

			$('id_scrll').click(false);

		},
	

		fn_acceptrejpress: function(oEvent) {
			var that = this;

			if (!this.oBoundData) {
				sap.m.MessageToast.show("Please select an item first.");
				return;
			}

			this._vOperation = oEvent.getSource().getProperty("text");

			if (!this._oRemarkDialog ) {
			    this._oRemarkDialog = sap.ui.xmlfragment(
			        this.getView().getId(),
			        "FSC360NEW.fragment.RemarkDialog",
			        this
			    );
			    this.getView().addDependent(this._oRemarkDialog);
			}
		
			this._oRemarkDialog.open();
				this.getView().byId("id_remarks").setValue("");
		
		},


		

		onRemarkDialogClose1: function() {
			this._oRemarkDialog.destroy();
			this._oRemarkDialog = null;
		},

		fnConfirmation: function(oBoundData, vRemarks, vOperation) {
			this._confirmData = {
				oBoundData: oBoundData,
				vRemarks: vRemarks,
				vOperation: vOperation
			};

			// Set confirmation message text
			var vMsg = 'Are you sure you want to ' + vOperation + '?';

			if (!this._oConfirmDialog || !this._oConfirmDialog.bIsDestroyed) {
				this._oConfirmDialog = sap.ui.xmlfragment(this.getView().getId(),"FSC360NEW.fragment.ConfirmDialog", this);
				this.getView().addDependent(this._oConfirmDialog);
			}

			this.getView().byId("confirmText").setText(vMsg);
			this._oConfirmDialog.open();
		},

		onConfirmNoPress: function() {
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
			this._oConfirmDialog = null;
		},
		onConfirmYesPress: function() {
			var that = this;
			var oModelC = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/");
			var aEntities = [];

			// 1. Check if it's mass approval or single approval
			if (this._aMassPayload && this._aMassPayload.aSelectedItems) {
				// Mass Approval
				var aSelectedItems = this._aMassPayload.aSelectedItems;
				var vRemarks = this._aMassPayload.vRemarks;
				var vState = this._aMassPayload.vState;

				aEntities = aSelectedItems.map(function(item) {
					return {
						WiId: item.WiId,
						WiText: vState,
						Imgurl: vRemarks,
						Qid: item.Qid
					};
				});
			} else if (this._confirmData) {
				// Single Approval
				var oData = this._confirmData;
				var vQID = oData.oBoundData.Qid;
				var vWiId = oData.oBoundData.WiId;
				var vState = (oData.vOperation === "Accept") ? "A" : "R";

				aEntities.push({
					WiId: vWiId,
					WiText: vState,
					Imgurl: oData.vRemarks,
					Qid: vQID
				});
			}

			var oPayload = {
				NavTrigger: aEntities,
				NavReturn: []
			};

			// Show busy indicator
			BusyIndicator.show(0);
			this.onConfirmNoPress();
			// Call OData
			oModelC.create("/DeepHeadSet", oPayload, {
				success: function(oData) {
					BusyIndicator.hide();

					var type = oData.NavReturn.results[0].MsgType;
					var sMessage = oData.NavReturn.results[0].Line;

					if (type === "S") {
						// Success flow
						var oSuccessModel = new sap.ui.model.json.JSONModel({
							message: sMessage
						});
						that.getView().setModel(oSuccessModel, "successModel");

						if (!that._oSuccessDialog) {
							that._oSuccessDialog = sap.ui.xmlfragment(that.getView().getId(),"FSC360NEW.fragment.SuccessReuse", that);
							that.getView().addDependent(that._oSuccessDialog);
						}
						that._oSuccessDialog.open();

						setTimeout(function() {
							that.fn_closeSuccess();                   
							that.FnonRouteMatched();
						}, 3000);
					} else {
				
						that.fnShowErrorDialog('Unexpected response received.');
					}
					that._aMassPayload = null;
					that._confirmData = null;
				},
				error: function() {
					BusyIndicator.hide();

					var sMessage = "Unexpected error occurred. Please try again.";
					var oErrorModel = new sap.ui.model.json.JSONModel({
						message: sMessage
					});
					that.getView().setModel(oErrorModel, "errorModel");

					if (!that._oErrorDialog) {
						that._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ErrorReuse", that);
						that.getView().addDependent(that._oErrorDialog);
					}
					that._oErrorDialog.open();
					that._aMassPayload = null;
					that._confirmData = null;
					setTimeout(function() {
						if (that._oErrorDialog) {
							that._oErrorDialog.close();
							that._oErrorDialog.destroy();
							that._oErrorDialog = null;
						}
						that.FnonRouteMatched();
					}, 3000);
				}
			});
		},

		onConfirmDialogClose: function() {
			this._oConfirmDialog.destroy();
			this._oConfirmDialog = null;
		},

		fn_acceptrejpressmass: function(oEvent) {
			var that = this;
			this._vOperationMass = oEvent.getSource().data("action"); // Accept / Reject

			var oModel = this.getView().getModel("JMQidlist");
			var aItems = oModel.getProperty("/");
			var aSelectedItems = aItems.filter(function(item) {
				return item.selected;
			});

			if (aSelectedItems.length === 0) {
				sap.m.MessageToast.show("Please select at least one item to " + that._vOperationMass);
				return;
			}

			this._aSelectedMassItems = aSelectedItems;

			// Check if fragment already exists
			if (!this._oRemarkDialog) {
				this._oRemarkDialog = sap.ui.xmlfragment(this.getView().getId(),"FSC360NEW.fragment.RemarkDialog", this);
				this.getView().addDependent(this._oRemarkDialog);
			}

			
			this._oRemarkDialog.open();
	
		},
		onCancelRemarkPress: function() {
			this.getView().byId("id_remarks").setValue("");
			this._oRemarkDialog.close();
			// this._oRemarkDialog.destroy();
			// this._oRemarkDialog=null;
		},

		onSubmitRemarkPress: function() {
			var vRemarks =this.getView().byId("id_remarks").getValue();;
	

			if (this._aSelectedMassItems && this._vOperationMass) {
				this._processMassAction(this._aSelectedMassItems, vRemarks, this._vOperationMass);
				this._aSelectedMassItems = null;
				this._vOperationMass = null;
			} else if (this.oBoundData && this._vOperation) {
				this.fnConfirmation(this.oBoundData, vRemarks, this._vOperation);
				this.oBoundData = null;
				this._vOperation = null;
			}

					this.getView().byId("id_remarks").setValue("");
			this._oRemarkDialog.close();
		},

		onRemarkDialogClose: function() {
				this._oRemarkDialog.close();
			// this._oRemarkDialog.destroy();
			this._pRemarkDialogMass = null; 
		},
		_processMassAction: function(aSelectedItems, vRemarks, vOperation) {
			var that = this;
			var vState = (vOperation === "Accept") ? "A" : "R";
			var vType = (vState === "A") ? "Success" : "Error";

			this._aMassPayload = {
				aSelectedItems: aSelectedItems,
				vRemarks: vRemarks,
				vOperation: vOperation,
				vState: vState
			};

			// Load classical confirm dialog
			if (!this._oConfirmDialog) {
				this._oConfirmDialog = sap.ui.xmlfragment(this.getView().getId(),"FSC360NEW.fragment.ConfirmDialog", this);
				this.getView().addDependent(this._oConfirmDialog);
			}

			// Set the message text dynamically
			

			this._oConfirmDialog.open();
			var oText = this.getView().byId("confirmText");
			if (oText) {
				oText.setText("Are you sure you want to " + vOperation + " " + aSelectedItems.length + " item(s)?");
			}
		},

		onConfirmNoPress: function() {
			if (this._oConfirmDialog) {
				this._oConfirmDialog.close();
				this._oConfirmDialog.destroy();
				this._oConfirmDialog=null;
			}
		},
		fn_onZoomIn: function() {
			var oScroll = sap.ui.getCore().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale, default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;
			var newScale = currentScale + 0.1;
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // scale from top-left corner
		},

		fn_onZoomOut: function() {
			var oScroll = sap.ui.getCore().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale or default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;

			// Reduce scale but don’t go below 0.5
			var newScale = Math.max(currentScale - 0.1, 0.5);
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // Keep same origin as Zoom In
		},


		fn_onPrint: function() {
			var iframe = sap.ui.getCore().byId("id_scrll").getContent()[0].getDomRef().querySelector('iframe');
			if (iframe) {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			}
		},

		fn_onDownload: function() {
			var QueueID = this.QueueID;
			var that = this;
			var url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value";

			fetch(url, {
					method: "GET",
					headers: {
						"Accept": "application/pdf"
					}
				})
				.then(response => {
					if (!response.ok) throw new Error("Failed to download");
					return response.blob();
				})
				.then(blob => {
					var link = document.createElement('a');
					var objectURL = URL.createObjectURL(blob);
					link.href = objectURL;
					link.download = "Invoice_" + QueueID + ".pdf";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					that.fnShowErrorDialog("Error while downloading: " + err.message);

				});
		},
		fnShowErrorDialog: function(message) {
			var oView = this.getView();
			var that = this;
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: message
			});
			that.getView().setModel(oErrorModel, "errorModel");

			if (!that._oErrorDialog) {
				that._oErrorDialog = sap.ui.xmlfragment(
					oView.getId(),
					"FSC360NEW.fragment.ErrorReuse",
					that
				);
				that.getView().addDependent(that._oErrorDialog);
			}
			that._oErrorDialog.open();
			setTimeout(function() {
				that.fn_onCloseErrorDialog();
			}, 3000);

		},
		fn_onCloseErrorDialog: function() {
			this._oErrorDialog.destroy();
			this._oErrorDialog = null;
			// this._oErrorDialog.close();
		},
	fn_closeSuccess: function() {
    if (this._oSuccessDialog && !this._oSuccessDialog.bIsDestroyed) {
        this._oSuccessDialog.close();
        this._oSuccessDialog.destroy();
        this._oSuccessDialog = null;
    }
}

	});

});