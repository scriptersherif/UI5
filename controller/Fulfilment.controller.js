sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter"
], function(Controller, MessageBox, MessageToast, Filter, FilterOperator, formatter) {
	"use strict";

	var QueueID = "";
	var PrevQid = "";
	var Bukrs = "";
	var QueueIDs = [];
	var Docid = "";
	var FilterParameter = "";
	var Current_User = "";
	var UserType = "";
	var arrQid = [];
	var arrHead = [];
	var WIindic = "W";
	var holdflag;
	var Userbulk = "";
	var oGlobalBusyDialog = new sap.m.BusyDialog();

	return Controller.extend("FSC360NEW.controller.Fulfilment", {
		formatter: formatter,

		onInit: function() {
		
			this.getOwnerComponent().getRouter()
				.getRoute("Fulfilment")
				.attachPatternMatched(this.fn__onRouteMatched, this);

			this.aFullDatainitial = [];
			this.aFullData = [];
			this.iRowsPerPage = 10;
			this.iCurrentPage = 1;
			this.iPickCurrentPage = 1;

			this.iPickRowsPerPage = 10;

			var oViewData = this.getView().getViewData();
			if (oViewData && oViewData.appStateModel) {
				this.getView().setModel(oViewData.appStateModel, "appState");
			}

			var oStaticModel = new sap.ui.model.json.JSONModel();
			oStaticModel.loadData("model/fulfillmentData.json");
			this.getView().setModel(oStaticModel, "jsDet");

			var arr = [{
				"Key": true
			}];
			var oVisModel = new sap.ui.model.json.JSONModel();
			oVisModel.setData(arr);
			this.getView().setModel(oVisModel, 'JSBTNVisible');
			this.fn_LoadData();
			this.fnGetF4Help();

			var oTable = this.byId("id_table_width");

			var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {

			});
			this.getView().setModel(oTemplateModel, "TemplateModel");
			const aColumnMeta = [{
				key: "Qid",
				label: "QID",
				visible: true
			}, {
				key: "Qiddate",
				label: "Invoice Date",
				visible: true
			}, {
				key: "Qidtime",
				label: "Created Time",
				visible: true
			}, {
				key: "Invbtn",
				label: "Scan Copy",
				visible: true
			}, {
				key: "Invno",
				label: "Invoice No",
				visible: true
			}, {
				key: "Invdesc",
				label: "Type",
				visible: true
			}, {
				key: "Name1",
				label: "Vendor Name",
				visible: true
			}, {
				key: "Bukrs",
				label: "Company Code",
				visible: false
			}, {
				key: "Username",
				label: "Agent",
				visible: true
			}, {
				key: "Ntamt",
				label: "Amount",
				visible: false
			}, {
				key: "Waers",
				label: "Currency",
				visible: false
			}, {
				key: "Mwskz",
				label: "Tax Code",
				visible: false
			}, {
				key: "Bupla",
				label: "Business Place",
				visible: false
			}, {
				key: "Secco",
				label: "Section Code",
				visible: false
			}, {
				key: "Lifnr",
				label: "Vendor Code",
				visible: false
			}, {
				key: "Werks",
				label: "Plant",
				visible: false
			}, {
				key: "DisplayStatus",
				label: "Status",
				visible: false
			}];

			const oColModel = new sap.ui.model.json.JSONModel(aColumnMeta);
			this.getView().setModel(oColModel, "FilterTableModel");
			// ViewModel for templates
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				selectedTemplate: "",
				templates: [],
				forceFullWidth: false,
				wrapText: false
			}), "viewModel1");

			this.aSelectedVendors = [];
			this.aInvoiceNumbers = [];
			this.aDocumentNumbers = [];
			this.aPoNumbers = [];
			
			var oWarnModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oWarnModel, "warnModel");
			
				var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");
			
			
			// 	var ErrorModel = new sap.ui.model.json.JSONModel({
			// 	message: ""
			// });
			// this.getView().setModel(ErrorModel, "Modelerror");

			// error popup model added by Manosankari 
			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");
			  var oView = this.getView();
		},

		fn_onInvSubmit: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue().trim();

			if (sValue) {
				// Check for duplicate
				var bExists = oInput.getTokens().some(function(token) {
					return token.getText() === sValue;
				});

				if (!bExists) {
					// Add token
					oInput.addToken(new sap.m.Token({
						text: sValue
					}));
					this.aInvoiceNumbers.push(sValue);
				}

				oInput.setValue(""); // clear text field
			}
			oInput.setTooltip(this.aInvoiceNumbers.join(", "));
		
		},

		fn_onInvTokenUpdate: function(oEvent) {
			var oMultiInput = oEvent.getSource();
			this.aInvoiceNumbers = oMultiInput.getTokens().map(token => token.getText());

			// Update tooltip dynamically
			oMultiInput.setTooltip(this.aInvoiceNumbers.join(", "));
		
		},
		fn_onDocSubmit: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue().trim();

			if (sValue) {
				// Avoid duplicate tokens
				var bExists = oInput.getTokens().some(function(token) {
					return token.getText() === sValue;
				});

				if (!bExists) {
					oInput.addToken(new sap.m.Token({
						text: sValue
					}));
					this.aDocumentNumbers.push(sValue);
				}
				oInput.setValue(""); // clear after entry
			}
			oInput.setTooltip(this.aDocumentNumbers.join(", "));
		
		},

		// Called when user deletes a token
		fn_onDocTokenUpdate: function(oEvent) {
		
			var oMultiInput = oEvent.getSource();
			this.aDocumentNumbers = oMultiInput.getTokens().map(token => token.getText());

			// Update tooltip dynamically
			oMultiInput.setTooltip(this.aDocumentNumbers.join(", "));
		
		},
		fn_onPoSubmit: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue().trim();

			if (sValue) {
				var bExists = oInput.getTokens().some(token => token.getText() === sValue);
				if (!bExists) {
					oInput.addToken(new sap.m.Token({
						text: sValue
					}));
					this.aPoNumbers.push(sValue);
				}
				oInput.setValue("");
			}

			// Update tooltip dynamically
			oInput.setTooltip(this.aPoNumbers.join(", "));
		},

		fn_onPoTokenUpdate: function(oEvent) {
			var oMultiInput = oEvent.getSource();
			this.aPoNumbers = oMultiInput.getTokens().map(token => token.getText());

			// Update tooltip dynamically
			oMultiInput.setTooltip(this.aPoNumbers.join(", "));
		},
	
		fn__onRouteMatched: function(oEvent) {

			var oArgs = oEvent.getParameter("arguments") || {};
			var sKey = oArgs.btnstat;
			this.fn_LoadData(sKey);
			this.byId("id_search_field").setValue("");
	
			this.fn_close_pdf();
			// Clear all card highlights
			$(".cl_container").removeClass(
				"clicked-total clicked-msme clicked-ontime clicked-escalated clicked-longpending clicked-withyou clicked-withothers clicked-unassign clicked-onhold"
			);

			// Remove all color highlights from amounts
			$(".cl_card_invamt, .cl_card_msmeamt, .cl_card_tdypostamt, .cl_card_escamt, .cl_card_pendingamt")
				.removeClass("text-blue text-green text-red text-orange");

			// Remove all active icons
			$(".iconBackgroundtodayinvff, .iconBackgroundmsmeff, .iconBackgroundorangeff, .iconBackgroundgreenff, .iconBackgroundredff")
				.removeClass("iconBackgroundactiveff");

			var that = this;
			var oTitle = that.getView().byId("idCardTitle");

			var $card = $(".total_card");
			$card.addClass("clicked-total");
			$card.find(".cl_card_invamt").addClass("text-blue");
			$card.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");

			oTitle.setText("Total Invoices");

			var todayassign = that.getView().byId("id_total").getText();
			that.getView().byId("id_total_1").setText(todayassign);

			var oPickTable = that.getView().byId("id_pick_table");
			var oMainTable = that.getView().byId("id_table_width");
			if (oPickTable) oPickTable.setVisible(false);
			if (oMainTable) oMainTable.setVisible(true);

			var oPickPagination = that.getView().byId("fultabPick");
			var oMainPagination = that.getView().byId("fultab");
			if (oPickPagination) oPickPagination.setVisible(false);
			if (oMainPagination) oMainPagination.setVisible(true);

			that.fn_all();
		},
		fn_LoadData: function(sKey) {
			var vKey;
			if(!vKey && sKey== " "){
					vKey = "W";
					sKey="W";
			}
			if(sKey == "H"){
				vKey = "W";
			}
			else{
				if(sKey){
				vKey = sKey;
				}
				else{
					vKey = "W";
				}
			}
			this.getView().byId("id_search_field").setValue("");
			this.getView().byId("id_search_field").fireSearch();
			var oScrlModel = new sap.ui.model.json.JSONModel();
			oScrlModel.setData([{
				"Key": false
			}]);
			this.getView().setModel(oScrlModel, 'JsScrl');

			oGlobalBusyDialog.open();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/DEEPHEADSet", {
				filters: [
					// new Filter("Flag", FilterOperator.EQ, "F"),
					  new Filter("Flag", FilterOperator.EQ, vKey || "F"), 
					// new Filter("IvText", FilterOperator.EQ, WIindic)
					new Filter("IvText", FilterOperator.EQ, vKey || "")
					// // new Filter("Flag", FilterOperator.EQ, "F"),
					//   new Filter("Flag", FilterOperator.EQ, sKey || "F"),  // <--- use passed user type
					// new Filter("IvText", FilterOperator.EQ, WIindic)
				],
				urlParameters: {
					$expand: "NavHead,NavHeadSt,NavGetCount,NavUsername,NavHold,NavGetDash,NavRevReasons,NavTriggerType,NavUsername,NavCurrency"
				},
				success: function(oData) {
					var result = oData.results[0];
					var oUserModel = new sap.ui.model.json.JSONModel();
					oUserModel.setData(result);
					that.getView().setModel(oUserModel, 'JSusername');
					// that.getView().byId('id_userfirst').setText(result.UserName.charAt(0));

					// var oRevModel = new sap.ui.model.json.JSONModel(result.NavRevReasons.results);
					// that.getView().setModel(oRevModel, 'JSRevReasons');

					// var oTriggerModel = new sap.ui.model.json.JSONModel(result.NavTriggerType.results);
					// that.getView().setModel(oTriggerModel, 'JSTriggerType');
					Current_User = result.Userid;
					var oModel = new sap.ui.model.json.JSONModel();
						oModel.setSizeLimit(3000);
						oModel.setData(oData.results[0].NavCurrency.results);
						that.getView().setModel(oModel, 'JSCurrency');
					// that.fn_set_Data(oData);
					that.fn_set_Data(oData, sKey); 
					oGlobalBusyDialog.close();
				},
				error: function() {
					oGlobalBusyDialog.close();
					MessageBox.error('Http Error');
				}
			});
		},

		// fn_set_Data: function(oData) {
		

		fn_set_Data: function(oData, sUserType) {

			if (sUserType == "W") {
				holdflag = false;
				var Getdata = oData.results[0].NavGetDash.results;
				var Ontime = parseInt(Getdata[12].CountTxt);
				var Escalated = parseInt(Getdata[13].CountTxt);
				var Hold = parseInt(Getdata[5].CountTxt);
				var total = parseInt(Getdata[3].CountTxt);
				var Todaypostedamt = parseInt(Getdata[20].CountTxt);
				var Msme = parseInt(Getdata[21].CountTxt);
				var Totalinvamt = parseInt(Getdata[4].CountTxt);
				var Msmeinvamt = parseInt(Getdata[22].CountTxt);
				var Longpending = parseInt(Getdata[23].CountTxt);
				var Longpendingamt = parseInt(Getdata[24].CountTxt);
				var Escalate = parseInt(Getdata[25].CountTxt);
				var Escalateamt = parseInt(Getdata[26].CountTxt);

				this.getView().byId("id_total").setText(total);
				this.getView().byId("id_msme").setText(Msme);
				this.getView().byId("id_longpend").setText(Longpending);
				this.getView().byId("id_escalate").setText(Escalate);
				this.getView().byId("id_totamt").setText(this.formatter.formatAmountInLakhs(Totalinvamt));
				this.getView().byId("msmeamt").setText(this.formatter.formatAmountInLakhs(Msmeinvamt));
				this.getView().byId("todayamt").setText(this.formatter.formatAmountInLakhs(Todaypostedamt));
				this.getView().byId("longpendamt").setText(this.formatter.formatAmountInLakhs(Longpendingamt));
				this.getView().byId("escalateamt").setText(this.formatter.formatAmountInLakhs(Escalateamt));

			} else if (sUserType == "I") {
				holdflag = false;
				var ntamtTotal = oData.results[0].NavHeadSt.results.reduce(function(sum, item) {
					return sum + (parseFloat(item.ntamt) || 0);
				}, 0);

				var Getdata = oData.results[0].NavGetDash.results;
				var Ontime = 0;
				var Escalated = 0;
				var Hold = 0;
				var total = oData.results[0].NavHeadSt.results.length;
				var Todaypostedamt = 0;
				var Msme = 0;
				var Totalinvamt = ntamtTotal;
				var Msmeinvamt = 0;
				var Longpending = 0;
				var Longpendingamt = 0;
				var Escalate = 0;
				var Escalateamt = 0;
				this.getView().byId("id_total").setText(total);
				this.getView().byId("id_msme").setText(Msme);
				this.getView().byId("id_longpend").setText(Longpending);
				this.getView().byId("id_escalate").setText(Escalate);
				this.getView().byId("id_totamt").setText(this.formatter.formatAmountInLakhs(Totalinvamt));
				this.getView().byId("msmeamt").setText(this.formatter.formatAmountInLakhs(Msmeinvamt));
				this.getView().byId("todayamt").setText(this.formatter.formatAmountInLakhs(Todaypostedamt));
				this.getView().byId("longpendamt").setText(this.formatter.formatAmountInLakhs(Longpendingamt));
				this.getView().byId("escalateamt").setText(this.formatter.formatAmountInLakhs(Escalateamt));
			} else if (sUserType == "H") {
				holdflag = true;
				var ntamtTotal = oData.results[0].NavHold.results.reduce(function(sum, item) {
					return sum + (parseFloat(item.Ntamt) || 0);
				}, 0);
				var Ontime = 0;
				var Escalated = 0;
				var Hold = 0;
				var total = oData.results[0].NavHold.results.length;
				var Todaypostedamt = 0;
				var Msme = 0;
				var Totalinvamt = ntamtTotal;
				var Msmeinvamt = 0;
				var Longpending = 0;
				var Longpendingamt = 0;
				var Escalate = 0;
				var Escalateamt = 0;
				this.getView().byId("id_total").setText(total);
				this.getView().byId("id_msme").setText(Msme);
				this.getView().byId("id_longpend").setText(Longpending);
				this.getView().byId("id_escalate").setText(Escalate);
				this.getView().byId("id_totamt").setText(this.formatter.formatAmountInLakhs(Totalinvamt));
				this.getView().byId("msmeamt").setText(this.formatter.formatAmountInLakhs(Msmeinvamt));
				this.getView().byId("todayamt").setText(this.formatter.formatAmountInLakhs(Todaypostedamt));
				this.getView().byId("longpendamt").setText(this.formatter.formatAmountInLakhs(Longpendingamt));
				this.getView().byId("escalateamt").setText(this.formatter.formatAmountInLakhs(Escalateamt));
			}

		

			if (oData.results[0].NavGetCount.results.length > 0) {
			
				this.getView().byId("id_total_1").setText(parseInt(oData.results[0].NavGetCount.results[0].CountQid));
			}
			//var UserType = oData.results[0].Flag; // "I", "W", or "A"
			var UserType = sUserType || oData.results[0].Flag;

			var oHBox = this.getView().byId("id_usertype");

			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn"); // clear previous selection
				var sKey = btn.getCustomData().find(cd => cd.getKey() === "key").getValue();
				if (sKey === UserType) {
					btn.addStyleClass("activeGroupBtn");
				}
			});
			// var oModel = this.getOwnerComponent().getModel("jsTab")

			// UserType = oData.results[0].Flag;
			if (UserType === "I") {
			
				var oModel = this.getOwnerComponent().getModel("jsTab");
				oModel.setProperty("/Indexer", true);
				oModel.setProperty("/Workbench", false);
		
				var rowData = oData.results[0].NavHeadSt.results;

			} else if (UserType === "W") {
			
				var oModel = this.getOwnerComponent().getModel("jsTab");
				oModel.setProperty("/Indexer", false);
				var rowData = oData.results[0].NavHeadSt.results.filter(function(item) {
					return item.Stats === "S15" || item.Stats === "S20";
				});
			} else if (UserType === "H") {
				holdflag = true;
				var rowData = oData.results[0].NavHold.results
			}
			var rowDatainitial = oData.results[0].NavHeadSt.results;
			
			this.aFullDatainitial = rowDatainitial; //line changed by yasin 
			// 			}
			this.aFullDatainitial = rowDatainitial;
			Current_User = oData.results[0].Userid;

		
			var filtered = this.aFullDatainitial.filter(function(item) {
				return item.Todaypost && item.Todaypost !== "";
			});
			var todayPostedCount = filtered.length;
			this.getView().byId("id_todayPosted").setText(todayPostedCount);
			// }

			rowDatainitial.forEach(function(row) {
				var scanDate = row.Scandate ? new Date(row.Scandate) : null;
				var postDate = row.Postingdate ? new Date(row.Postingdate) : null;

				if (row.Status === "S40") {
					row.DisplayStatus = "On Hold";

				} else if (!row.Assignedto || row.Assignedto.trim() === "") {
					row.DisplayStatus = "Unassigned";

				} else if (scanDate && postDate) {
					var diffMs = postDate - scanDate;
					var diffHours = diffMs / (1000 * 60 * 60);
					row.DisplayStatus = diffHours <= 24 ? "Completed" : "Escalated";
				} else {
					row.DisplayStatus = "Assigned";
				}
			});
			this.aFullDatainitial = rowDatainitial;
			this.aFullData = rowData;
			this.iCurrentPage = 1;
			this.aFilteredData = rowData;
			this.fn_updatePaginatedModel();

			var oModel = this.getOwnerComponent().getModel("jsTab");
			var oUserModel = new sap.ui.model.json.JSONModel();
			oUserModel.setData(oData.results[0].NavUsername.results);
			this.getView().setModel(oUserModel, 'jsUserName');

			var oHoldModel = new sap.ui.model.json.JSONModel();
			oHoldModel.setData(oData.results[0].NavHold.results);
			this.getView().setModel(oHoldModel, 'jsHold');
		},

		fn_onFulfilmentRouteMatched: function() {
			var sKey = this.getOwnerComponent()._lastUserType || "W";

			var oHBox = this.getView().byId("id_usertype");
			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");
				var btnKey = btn.getCustomData().find(cd => cd.getKey() === "key").getValue();
				if (btnKey === sKey) {
					btn.addStyleClass("activeGroupBtn");
				}
			});

			if (sKey === "W" || sKey === "I") {
				this.fn_LoadData(sKey);

			}
		},
		fn_onUserTypePress: function(oEvent) {
			var oPressedBtn = oEvent.getSource();
			var sKey = oPressedBtn.getCustomData().find(cd => cd.getKey() === "key").getValue();

			this.getOwnerComponent()._lastUserType = sKey;

			var oHBox = this.getView().byId("id_usertype");
			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");
			});

			oPressedBtn.addStyleClass("activeGroupBtn");

			if (sKey === "W" || sKey === "I" || sKey === "H") {
				this.fn_LoadData(sKey);
				// Clear all card highlights
				$(".cl_container").removeClass(
					"clicked-total clicked-msme clicked-ontime clicked-escalated clicked-longpending clicked-withyou clicked-withothers clicked-unassign clicked-onhold"
				);

				// Remove all color highlights from amounts
				$(".cl_card_invamt, .cl_card_msmeamt, .cl_card_tdypostamt, .cl_card_escamt, .cl_card_pendingamt")
					.removeClass("text-blue text-green text-red text-orange");

				// Remove all active icons
				$(".iconBackgroundtodayinvff, .iconBackgroundmsmeff, .iconBackgroundorangeff, .iconBackgroundgreenff, .iconBackgroundredff")
					.removeClass("iconBackgroundactiveff");

				var that = this;
				var oTitle = that.getView().byId("idCardTitle");

				var $card = $(".total_card");
				$card.addClass("clicked-total");
				$card.find(".cl_card_invamt").addClass("text-blue");
				$card.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");

				oTitle.setText("Total Invoices");

				var todayassign = that.getView().byId("id_total").getText();
				// that.getView().byId("id_total_1").setText(todayassign);

				var oPickTable = that.getView().byId("id_pick_table");
				var oMainTable = that.getView().byId("id_table_width");
				if (oPickTable) oPickTable.setVisible(false);
				if (oMainTable) oMainTable.setVisible(true);

				var oPickPagination = that.getView().byId("fultabPick");
				var oMainPagination = that.getView().byId("fultab");
				if (oPickPagination) oPickPagination.setVisible(false);
				if (oMainPagination) oMainPagination.setVisible(true);

				that.fn_all();
			} else if (sKey === "A") {

				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("AutoPark");
			} else if (sKey === "N") {

				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("NonPoIndexer");
			}
		
		},
		fn_loadDataBasedOnUserType: function(sKey) {
			if (sKey === "I") {
			
				this.fn_LoadData("I"); // reload with Indexer filter
			} else if (sKey === "W") {
			
				this.fn_LoadData("W"); // reload with Workbench filter
			} else if (sKey === "A") {
		
				// Navigate to auto parking view
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("AutoPark");

			}
		},
		fn_updatePaginatedModel: function() {
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "jsDet");
			this.fn_renderPageNumbers();
		},

		fn_onNextPage: function() {
			var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			if (this.iCurrentPage < iTotalPages) {
				this.iCurrentPage++;
				this.fn_updatePaginatedModel();
			}
		},

		fn_onPreviousPage: function() {
			if (this.iCurrentPage > 1) {
				this.iCurrentPage--;
				this.fn_updatePaginatedModel();
			}
		},

		fn_renderPageNumbers: function() {
			var oPageBox = this.byId("idPageNumbersBox");
			oPageBox.removeAllItems();
	this.getView().byId("id_total_1").setText(parseInt(this.aFilteredData.length));
			// var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage); // ✅
			if (iTotalPages <= 1) {

				return;
			}
			var currentPage = this.iCurrentPage;
			var that = this;

	function getPageNumbers(currentPage, totalPages) {
	var pages = [];

	if (totalPages <= 7) {
		// Show all if few pages
		for (var i = 1; i <= totalPages; i++) {
			pages.push(i);
		}
	} else {
		if (currentPage <= 2) {
			
			pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
		} else if (currentPage >= totalPages - 1) {
		
			pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
		} else {
		
			pages.push(1, "...");
			pages.push(currentPage - 1, currentPage, currentPage + 1);
			pages.push("...", totalPages);
		}
	}

	// Remove duplicates and keep order
	return [...new Set(pages)];
}

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.fn_updatePaginatedModel();
					},
					// Add a custom class to all buttons
					customData: [new sap.ui.core.CustomData({
						key: "customClass",
						value: "cl_page_btn"
					})]
				});
				if (pageNum === currentPage) {
					oButton.addStyleClass("cl_page_btn_emp");
				} else {
					oButton.addStyleClass("cl_page_btn");
				}
				oPageBox.addItem(oButton);
			}

			var pagesToShow = getPageNumbers(currentPage, iTotalPages);

			for (var k = 0; k < pagesToShow.length; k++) {
				var page = pagesToShow[k];
				if (page === "...") {
					var oText = new sap.m.Text({
						text: "...",
						design: "Bold",
						textAlign: "Center",
						width: "2rem"
					});
					oPageBox.addItem(oText);
				} else {
					addPageButton(page);
				}
			}
					this.byId("idPrevButton").setVisible(currentPage > 1);
this.byId("idNextButton").setVisible(currentPage < iTotalPages);
		},

		
	fnAssign: function() {
			var myTable = this.getView().byId("id_table_width");
			var myTableRows = myTable.getRows();
			var selectedIndices = myTable.getSelectedIndices();
			var message = "";
			var Asgn_Queue = [];
		
			QueueIDs = [];

			if (selectedIndices.length !== 0) {
				var model = this.getView().getModel("jsDet");

				for (var i = 0; i < selectedIndices.length; i++) {
					var data = model.getData()[selectedIndices[i]];
					QueueIDs.push(data.Qid);

					if (data.Assignedto != "") {
						Asgn_Queue.push(parseInt(data.Qid));
						message = "Please select the Unassigned Agent Row";
					}
				}

				if (message != "") {
					// show error dialog
					var oErrorModel = new sap.ui.model.json.JSONModel({
						message: Asgn_Queue + " contains Agent" + '\n' + message
					});
					this.getView().setModel(oErrorModel, "errorModel");

					if (!this._oErrorDialog) {
						this._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.AgentError", this);
						this.getView().addDependent(this._oErrorDialog);
					}
					this._oErrorDialog.open();

				} else if (Asgn_Queue.length === 0) {
			
					this.fn_Assignfrag();
				}

			} else {
				// sap.m.MessageBox.warning("Please Select the Row");
					this.openwarnDialog("Please Select the Row");
			}

			this.getView().byId('id_more_btn').removeStyleClass('cl_more_glow');
			this.getView().byId('id_more_btn').addStyleClass('cl_more');
			this.MoreSetting.close();
		},
	
		onCloseErrorDialog: function() {
			if (this._oErrorDialog) {
				this._oErrorDialog.close();
			}
		},
		fn_Assignfrag: function(oEvent) {
			var that = this;
			if (!that.Assignfrag) {
				that.Assignfrag = sap.ui.xmlfragment("FSC360NEW.fragment.Assign", that);
				that.getView().addDependent(that.Assignfrag);
			}
			sap.ui.getCore().byId("id_agent").setValue(""); //Added by Lokesh for clearing the field while opening the fragment.
			that.Assignfrag.open();
		},
		onCloseErrorDialog: function() {
			if (this._oErrorDialog) {
				this._oErrorDialog.close();
			}
		},
		fnPick: function() {
			if (!this._pPickDialog) {
			
				this._pPickDialog = sap.ui.xmlfragment("myPickDialog", "FSC360NEW.fragment.pick", this);
				this.getView().addDependent(this._pPickDialog);
			}
			this._pPickDialog.open();
		},

		onAgentInputChange: function(oEvent) {
			let sValue = oEvent.getParameter("value").toUpperCase();
			oEvent.getSource().setValue(sValue);
		},
		fn_Assignfrag: function(oEvent) {
			var that = this;
			if (!that.Assignfrag) {
				that.Assignfrag = sap.ui.xmlfragment("FSC360NEW.fragment.Assign", that);
				that.getView().addDependent(that.Assignfrag);
			}
			sap.ui.getCore().byId("id_agent").setValue(""); //Added by Lokesh for clearing the field while opening the fragment.
			that.Assignfrag.open();
		}

		,
		fn_Assign_cancel: function() {
			this.Assignfrag.close();
			this.Assignfrag.destroy();
			this.Assignfrag = null;
		},
	fn_agent_submit: function(oEvent) {
			var oController = this;
			var sAgent = sap.ui.getCore().byId("id_agent").getValue().toUpperCase();

			if (sAgent) {
				oGlobalBusyDialog.open();

				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var obj = {
					Flag: 'A',
					NavHead: []
				};

				for (var i = 0; i < QueueIDs.length; i++) {
					obj.NavHead.push({
						Assignedto: sAgent,
						Qid: QueueIDs[i]
					});
				}

				oModel.create('/DEEPHEADSet', obj, {
					success: function(oData) {
					
						var sMessage = sAgent + " Successfully Assigned";
						// Set success message to model
						var oSuccessModel = new sap.ui.model.json.JSONModel({
							message: sMessage
						});
						oController.getView().setModel(oSuccessModel, "successModel");

						// Show custom fragment dialog
						if (!oController._oSuccessDialog) {
							oController._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.fragment.Agentsuccess", oController);
							oController.getView().addDependent(oController._oSuccessDialog);
						}
						oController._oSuccessDialog.open();

						setTimeout(function() {
							oController._oSuccessDialog.close();
						}, 3000);

						// oController.Assignfrag.close();
						if (oController.Assignfrag) {
							oController.Assignfrag.close();
							oController.Assignfrag.destroy();
							oController.Assignfrag = null;
						}
						oController.fn_LoadData(WIindic); //WIindic Added by Lokesh R on 21.10.2025
						oController.fn_clear();
						oGlobalBusyDialog.close();
					},
					error: function() {
						// sap.m.MessageBox.error("Error");
						oController.openErrorDialog('Error');
						oController.Assignfrag.close();
						oGlobalBusyDialog.close();
					}
				});

			} else {
				// sap.m.MessageBox.error("Please Select the Agent");
				oController.openErrorDialog(' Please Select the Agent');
			}
		},
		fn_Userfrag: function(oEvent) {
			var that = this;
			if (!that.Userfrag) {
				that.Userfrag = sap.ui.xmlfragment("FSC360NEW.fragment.UserName", that);
				that.getView().addDependent(that.Userfrag);
			}
			that.Userfrag.open();
		},

		fn_UserName_Confrm: function(oEvent) {

			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("jsUserName");
				var sTitle = oContext.getProperty("Bname");
				sap.ui.getCore().byId("id_agent").setValue(sTitle);
			}

			oEvent.getSource().getBinding("items").filter([]);
		},
		fn_onAgentSelect: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				// Use text instead of key to show full "DEV1 - Team"
				var sAgentText = oSelectedItem.getText();
				var oComboBox = oEvent.getSource();
				oComboBox.setValue(sAgentText);
			}
		},
	

		fn_UserName_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Bname", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("NameLast", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_Reassign: function() {
			QueueIDs = [];

			var myTable = this.getView().byId("id_table_width");

			var myTableRows = myTable.getRows();
			var selectedIndeices = myTable.getSelectedIndices();
			var message = "";

			var Asgn_Queue = [];

			if (selectedIndeices.length != 0) {

				var model = this.getView().getModel("jsDet");

				for (var i = 0; i < selectedIndeices.length; i++) {

					var data = model.getData()[selectedIndeices[i]];

					QueueIDs.push(data.Qid);

					if (data.Assignedto === "") {

						Asgn_Queue.push(parseInt(data.Qid));

						message = "Please select the Assigned Agent Row";

					}
				}

				if (message != "") //Checking for Message
				{
					// sap.m.MessageBox.error(Asgn_Queue + " doesn't contains Agent" + '\n' + message);
						var errmsg = Asgn_Queue + " doesn't contains Agent" + '\n' + message;
							this.openErrorDialog(errmsg);
				} else if (Asgn_Queue.length === 0) {
					this.fn_Assignfrag();
				}

			} else {
				// sap.m.MessageBox.warning("Please Select the Row");
					this.openwarnDialog("Please Select the Row")
			}
		

		},
	
		fn_pdf: function(oEvent) {
			// Step 1: Get the row context from the clicked button
			var oButton = oEvent.getSource();
			var oRowContext = oButton.getBindingContext("jsDet");

			// Step 2: Get the table and its binding contexts
			var oTable = this.byId("id_table_width");
			var aRows = oTable.getBinding("rows").getContexts();

			// Step 3: Get the index of the clicked row
			var iIndex = aRows.findIndex(function(oContext) {
				return oContext === oRowContext;
			});

			// Step 4: Clear all selections and select only the clicked row
			if (iIndex > -1) {
				oTable.clearSelection();
				oTable.setSelectedIndex(iIndex);
			}

			// Step 5: Get QueueID from row data
			var oRowData = oRowContext.getObject();
			var QueueID = oRowData.Qid;

			// Optional: Set QueueID globally if other methods depend on it
			window.QueueID = QueueID;

			// Step 6: Continue with your logic
			this.fn_list(oEvent);

			if (QueueID) {
				this.fn_pdf_alignment();
				this.fnGetPDF(QueueID);

				if (sap.ui.getCore().AppController) {
					sap.ui.getCore().AppController.collapseSidebar();
				}
			} else {
				// sap.m.MessageBox.error("Please Select the Queue ID");
				this.openErrorDialog('Please Select the Queue ID');
			}
		},
		fn_list: function(oEvent) {

			Docid = oEvent.getSource().getBindingContext('jsDet').getProperty('Docid');
			QueueID = oEvent.getSource().getBindingContext('jsDet').getProperty('Qid');
	

		},
		fn_pdf_alignment: function() {
			if (QueueID !== "") {
				if (QueueID === PrevQid && this.getView().byId("id_scrll").getVisible()) {
					// this.getView().byId("id_scrll").setVisible(false);
					var oModel1 = new sap.ui.model.json.JSONModel();

					var arr1 = [{
						"Key": false
					}];
					oModel1.setData(arr1);
					this.getView().setModel(oModel1, 'JsScrl');

					var oModel = this.getOwnerComponent().getModel("jsTab");

					var arr = [{

						"Key": true,
						"Width": "11%",
						"Align": "End",
						"Icon": false

					}];

					oModel.setData(arr);
					this.getView().setModel(oModel, 'jsTab');
					this.getView().byId("id_pdf_slide").setWidth("100%");

					this.getView().byId("id_vbox_table").setWidth("100%");

				} else if (QueueID !== PrevQid && this.getView().byId("id_scrll").getVisible()) {
					PrevQid = QueueID;
					var oModel1 = new sap.ui.model.json.JSONModel();

					var arr1 = [{
						"Key": true
					}];
					oModel1.setData(arr1);
					this.getView().setModel(oModel1, 'JsScrl');
					var oModel = this.getOwnerComponent().getModel("jsTab");

					var arr = [{

						"Key": false,
						"Width": "5%",
						"Align": "Center",
						"Icon": true

					}];

					oModel.setData(arr);
					this.getView().setModel(oModel, 'jsTab');
					this.getView().byId("id_pdf_slide").setWidth("65%");

					this.getView().byId("id_table_width").setWidth("100%");
					this.setColumnWidths("fixed");
				} else if (!this.getView().byId("id_scrll").getVisible()) {
					PrevQid = QueueID;
					// this.getView().byId("id_scrll").setVisible(true);
					var oModel1 = new sap.ui.model.json.JSONModel();

					var arr1 = [{
						"Key": true
					}];
					oModel1.setData(arr1);
					this.getView().setModel(oModel1, 'JsScrl');
					var oModel = this.getOwnerComponent().getModel("jsTab");

					var arr = [{

						"Key": false,
						"Width": "5%",
						"Align": "Center",
						"Icon": true

					}];

					oModel.setData(arr);
					this.getView().setModel(oModel, 'jsTab');
					this.getView().byId("id_pdf_slide").setWidth("65%");

					this.getView().byId("id_table_width").setWidth("100%");
					this.setColumnWidths("fixed");
				}
			} else if (QueueID === "") {
				// sap.m.MessageBox.error("Please Select the Queue ID");
					this.openErrorDialog('Please Select the Queue ID');
				
			}

		},

	
		fnGetPDF: function(QueueID) {

			if (QueueID !== "") {
				oGlobalBusyDialog.open();
				this.getView().byId('id_scrll').setBusy(false);
				var oScorl = this.getView().byId("id_scrll");

				oScorl.destroyContent();

				// var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=1&zoom=60";
var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=1";

				var oHtml = new sap.ui.core.HTML({

				});
	var oContent = "<div class='overlay'><iframe src=" + Url +
					"  id='id_imageIfrm' ' allowtransparency='false' scrolling='yes'  height='430' width='360'></iframe></div>";
	
				// var oContent =
				// 	`
    //     <div class="pdf-container">
    //         <iframe src="${Url}" id="id_imageIfrm" scrolling="yes" height="400" width="98%"></iframe>
    //         <div id="magnifier">
    //             <iframe src="${Url}" id="magnifierFrame"></iframe>
    //         </div>
    //     </div>

    //     <style>
    //         .pdf-container {
    //             position: relative;
    //         }
    //         #magnifier {
    //             position: absolute;
    //             border: 2px solid #000;
    //             border-radius: 80%;
    //             width: 300px;
    //             height: 300px;
    //             overflow: hidden;
    //             display: none;
    //             pointer-events: none;
    //             z-index: 900;
    //         }
    //         #magnifier iframe {
    //             position: absolute;
    //             transform: scale(2); /* zoom level */
    //             transform-origin: top left;
    //             width: 100%;
    //             height: 100%;
    //             border: none;
    //         }
    //     </style>

    //     <script>
    //         const iframe = document.getElementById("id_imageIfrm");
    //         const magnifier = document.getElementById("magnifier");
    //         const magnifierFrame = document.getElementById("magnifierFrame");

    //         iframe.addEventListener("mousemove", function(e) {
    //             magnifier.style.display = "block";
    //             let rect = iframe.getBoundingClientRect();
    //             let x = e.clientX - rect.left;
    //             let y = e.clientY - rect.top;

    //             magnifier.style.left = (x - 10) + "px";
    //             magnifier.style.top = (y - 10) + "px";

    //             magnifierFrame.style.left = -(x) + "px";
    //             magnifierFrame.style.top = -(y) + "px";
    //         });

    //         iframe.addEventListener("mouseleave", function() {
    //             magnifier.style.display = "none";
    //         });
    //     </script>
    //     `;

				oHtml.setContent(oContent);
				var oScrl = this.getView().byId("id_scrll");
				oScrl.addContent(oHtml);

				$('id_scrll').click(false);
				oGlobalBusyDialog.close();
			} else {
				// sap.m.MessageBox.error("Please Select the Queue ID");
					this.openErrorDialog('Please Select the Queue ID');
			}
		},
		setColumnWidths: function(mode) {
			var oTable = this.getView().byId("id_table_width");
			var aColumns = oTable.getColumns();

			if (mode === "fixed") {
				// Fixed pixel widths
				var aFixedWidths = ["120px", "120px", "100px", "80px", "150px", "130px", "180px", "100px", "140px", "130px"];
				for (var i = 0; i < aColumns.length; i++) {
					aColumns[i].setWidth(aFixedWidths[i] || "100px");
				}
			} else if (mode === "responsive") {
				// Responsive percentage widths
				var aPercentWidths = ["8.42%", "8.65%", "8.25%", "6.34%", "12%", "10%", "15%", "6.63%", "11%", "11%"];
				for (var j = 0; j < aColumns.length; j++) {
					aColumns[j].setWidth(aPercentWidths[j] || "10%");
				}
			}
		},
		fn_close_pdf: function() {

			var oModel1 = new sap.ui.model.json.JSONModel();
			var arr1 = [{
				"Key": false
			}];
			oModel1.setData(arr1);
			this.getView().setModel(oModel1, 'JsScrl');

			// Reset layout sizes
			this.getView().byId("id_pdf_slide").setWidth("100%");

			// this.getView().byId("id_table_width").setWidth("100%");

			this.setColumnWidths("responsive");
		},
	onAfterRendering: function() {
			var that = this;
			setTimeout(function() {
				var oSegmentedButton = that.byId("idSegmentBtn");
				if (oSegmentedButton) {
					oSegmentedButton.rerender();
				}
			}, 200);

			var oContainer = this.byId("cl_card_cont_head1");
			oContainer._clickBound = true;

			var $container = oContainer.$();
			var that = this;
			var oTitle = that.byId("idCardTitle");
			$container.on("click", ".cl_container", function(event) {
				var $card = $(event.currentTarget);
				var oView = that.getView();
				// Remove all selection classes
				$container.find(".cl_container")
					.removeClass(
						"clicked-total clicked-withyou clicked-withothers clicked-unassign clicked-ontime clicked-onhold clicked-escalated clicked-msme"
					);
				// Remove all highlight classes from ALL cards
				$container.find(".cl_card_msmeamt").removeClass("text-blue");
				$container.find(".cl_card_pendingamt").removeClass("text-blue");
				$container.find(".cl_card_tdypostamt").removeClass("text-blue");
				$container.find(".cl_card_escamt").removeClass("text-blue");
				$container.find(".cl_card_invamt").removeClass("text-blue");
				//Remove all active icon backgrounds
				$container.find(".iconBackgroundtodayinvff").removeClass("iconBackgroundactiveff");
				$container.find(".iconBackgroundmsmeff").removeClass("iconBackgroundactiveff");
				$container.find(".iconBackgroundorangeff").removeClass("iconBackgroundactiveff");
				$container.find(".iconBackgroundgreenff").removeClass("iconBackgroundactiveff");
				$container.find(".iconBackgroundredff").removeClass("iconBackgroundactiveff");

				// Clear all card highlights
				$(".cl_container").removeClass(
					"clicked-total clicked-msme clicked-ontime clicked-escalated clicked-longpending clicked-withyou clicked-withothers clicked-unassign clicked-onhold"
				);

				// Remove all color highlights from amounts
				$(".cl_card_invamt, .cl_card_msmeamt, .cl_card_tdypostamt, .cl_card_escamt, .cl_card_pendingamt")
					.removeClass("text-blue text-green text-red text-orange");

				// Remove all active icons
				$(".iconBackgroundtodayinvff, .iconBackgroundmsmeff, .iconBackgroundorangeff, .iconBackgroundgreenff, .iconBackgroundredff")
					.removeClass("iconBackgroundactiveff");

				if ($card.hasClass("total_card")) {
					$card.addClass("clicked-total");
					$card.find(".cl_card_invamt").addClass("text-blue");
					$card.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");
					oTitle.setText("Total Invoices");
					var todayassign = that.getView().byId("id_total").getText();
					that.getView().byId("id_total_1").setText(todayassign);

					var oPickTable = that.getView().byId("id_pick_table");
					var oMainTable = that.getView().byId("id_table_width");

					if (oPickTable) oPickTable.setVisible(false);
					if (oMainTable) oMainTable.setVisible(true);

				
					var oPickPagination = that.getView().byId("fultabPick");
					var oMainPagination = that.getView().byId("fultab");

					if (oPickPagination) oPickPagination.setVisible(false);
					if (oMainPagination) oMainPagination.setVisible(true);

					that.fn_all();

				} else if ($card.hasClass("with_you")) {
					$card.addClass("clicked-withyou");
					that.fn_user();

				} else if ($card.hasClass("with_others")) {
					$container.find(".cl_card_msmeamt").removeClass("text-blue");

					// Add blue to the text inside this clicked card
					$card.find(".cl_card_msmeamt").addClass("text-blue");
					$card.find(".iconBackgroundmsmeff").addClass("iconBackgroundactiveff");
					$card.addClass("clicked-withothers ");
					var others = that.getView().byId("id_msme").getText();
					that.getView().byId("id_total_1").setText(others);
					oTitle.setText("MSME Invoices");
					var oPickTable = that.getView().byId("id_pick_table");
					var oMainTable = that.getView().byId("id_table_width");

					if (oPickTable) oPickTable.setVisible(false);
					if (oMainTable) oMainTable.setVisible(true);

				
					var oPickPagination = that.getView().byId("fultabPick");
					var oMainPagination = that.getView().byId("fultab");

					if (oPickPagination) oPickPagination.setVisible(false);
					if (oMainPagination) oMainPagination.setVisible(true);
					that.fn_msmeOnly();

				} else if ($card.hasClass("unassign")) {
					$card.addClass("clicked-unassign");
					$card.find(".cl_card_pendingamt").addClass("text-blue");
					$card.find(".iconBackgroundorangeff").addClass("iconBackgroundactiveff");
					var unassign = that.getView().byId("id_longpend").getText();
					that.getView().byId("id_total_1").setText(unassign);

					oTitle.setText("Long Pending");
					var oPickTable = that.getView().byId("id_pick_table");
					var oMainTable = that.getView().byId("id_table_width");

					if (oPickTable) oPickTable.setVisible(false);
					if (oMainTable) oMainTable.setVisible(true);

				
					var oPickPagination = that.getView().byId("fultabPick");
					var oMainPagination = that.getView().byId("fultab");

					if (oPickPagination) oPickPagination.setVisible(false);
					if (oMainPagination) oMainPagination.setVisible(true);
					// Hide pick pagination
					that.fn_longPendingOnly();

				} else if ($card.hasClass("ontime")) {
					$card.addClass("clicked-ontime");
					oTitle.setText("Today Posted");
					$card.find(".cl_card_tdypostamt").addClass("text-blue");
					$card.find(".iconBackgroundgreenff").addClass("iconBackgroundactiveff");
					var todayposted = that.getView().byId("id_todayPosted").getText();
					that.getView().byId("id_total_1").setText(todayposted);
					var oPickTable = that.getView().byId("id_pick_table");
					var oMainTable = that.getView().byId("id_table_width");

					if (oPickTable) oPickTable.setVisible(false);
					if (oMainTable) oMainTable.setVisible(true);

				
					var oPickPagination = that.getView().byId("fultabPick");
					var oMainPagination = that.getView().byId("fultab");

					if (oPickPagination) oPickPagination.setVisible(false);
					if (oMainPagination) oMainPagination.setVisible(true);
					that.fn_todayPosted();

				} else if ($card.hasClass("hold")) {
					$card.addClass("clicked-onhold");
					that.fn_hold();

				} else if ($card.hasClass("escalated")) {
					$card.addClass("clicked-escalated");
					$card.find(".cl_card_escamt").addClass("text-blue");
					$card.find(".iconBackgroundredff").addClass("iconBackgroundactiveff");
					var escalated = that.getView().byId("id_escalate").getText();
					that.getView().byId("id_total_1").setText(escalated);
					oTitle.setText("Esclated");
					var oPickTable = that.getView().byId("id_pick_table");
					var oMainTable = that.getView().byId("id_table_width");

					if (oPickTable) oPickTable.setVisible(false);
					if (oMainTable) oMainTable.setVisible(true);

				
					var oPickPagination = that.getView().byId("fultabPick");
					var oMainPagination = that.getView().byId("fultab");

					if (oPickPagination) oPickPagination.setVisible(false);
					if (oMainPagination) oMainPagination.setVisible(true);
					that.fn_escalatedOnly();

				}
			});

			// Trigger initial selection for "Total" card
			setTimeout(function() {
				$container.find(".total_card").trigger("click");
			}, 0);

			
		},
	

		fn_sortByQueid: function() {
			if (!this.aFullData || !Array.isArray(this.aFullData)) {
				// sap.m.MessageBox.error("No data to sort.");
					this.openErrorDialog('No data to sort');
				return;
			}

			// Set default to ascending (up arrow) on first click
			if (this._bSortDescending === undefined) {
				this._bSortDescending = false; // false means ascending by your code
			} else {
				// Toggle on every click after first
				this._bSortDescending = !this._bSortDescending;
			}

			// Sort data based on current flag
			this.aFullData.sort(function(a, b) {
				return this._bSortDescending ? b.Qid.localeCompare(a.Qid) // descending
					: a.Qid.localeCompare(b.Qid); // ascending
			}.bind(this));

			// Update icon accordingly
			var oIcon = this.byId("qidSortIcon");
			if (oIcon) {
				var sIconSrc = this._bSortDescending ? "Images/arrow-down.svg" : "Images/arrow-up.svg";
				oIcon.setSrc(sIconSrc);
			}

			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},

		fn_onSortByStatus: function() {
			if (!this.aFullData || !Array.isArray(this.aFullData)) {
				// sap.m.MessageBox.error("No data to sort.");
					this.openErrorDialog('No data to sort');
				return;
			}

			// Toggle sort flag
			if (this._bSortStatusAsc === undefined) {
				this._bSortStatusAsc = true;
			}
			this._bSortStatusAsc = !this._bSortStatusAsc;

			this.aFullData.sort(function(a, b) {
				var s1 = a.DisplayStatus ? a.DisplayStatus.toString() : "";
				var s2 = b.DisplayStatus ? b.DisplayStatus.toString() : "";
				return this._bSortStatusAsc ? s1.localeCompare(s2) : s2.localeCompare(s1);
			}.bind(this));

			// Update arrow icon
			var oIcon = this.byId("statusSortIcon");
			if (oIcon) {
				var sIconSrc = this._bSortStatusAsc ? "Images/arrow-up.svg" : "Images/arrow-down.svg";
				oIcon.setSrc(sIconSrc);
			}

			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
		fn_clear: function() {
			QueueID = "";
			Docid = "";
			this.getView().byId("id_table_width").setSelectedIndex(-1); // Index number added by lokesh on 26.07.2023

		},

		fn_nav_to_wb1: function(oEvent) {

			var t_flag = 'E';
			this.fn_clear();

			var oContext = oEvent.getSource().getBindingContext('pickModel');
			var QueueID = parseInt(oContext.getProperty('Qid'));
			var Bukrs = oContext.getProperty('Bukrs');
			var Stats = oContext.getProperty('Stats');
			var Agent = oContext.getProperty('Username') || "empty";
			var oUserModel = this.getView().getModel('JSusername');
			var Username = oUserModel ? oUserModel.getProperty('/UserName') : "empty"; // Case-sensitive key

			if (sap.ui.getCore().AppController) {
				sap.ui.getCore().AppController.collapseSidebar();
			}
			var sUserType = this.getOwnerComponent()._lastUserType || "W"; //ADDED AFTER HAVING THE AUTOPARK SEGMENT BUTTON

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("Workbench", {
				"QueueID": QueueID,
				"Bukrs": Bukrs,
				"Stats": Stats,
				"Agent": Agent,
				"Username": Username,
				"UserType": sUserType,
				"NavScreen": "Fulfillment",
				"Flag": t_flag,
				"Type": "SingleView"
			});
		
		},
			fn_nav_to_wb: function(oEvent) {
			var t_flag = 'E';
			this.fn_clear();

			var oContext = oEvent.getSource().getBindingContext('jsDet');
			var QueueID = parseInt(oContext.getProperty('Qid'));
			var Bukrs = oContext.getProperty('Bukrs');
			var Stats = oContext.getProperty('Stats');
			var Agent = oContext.getProperty('Username') || "empty"; 
			var oUserModel = this.getView().getModel('JSusername');
			var Username = oUserModel ? oUserModel.getProperty('/UserName') : "empty"; // Case-sensitive key

			if (sap.ui.getCore().AppController) {
				sap.ui.getCore().AppController.collapseSidebar();
			}
		
			// var sUserType = this.getOwnerComponent()._lastUserType || "W"; //ADDED AFTER HAVING THE AUTOPARK SEGMENT BUTTON
	  var sUserType = "W"; // default
    if (Stats == "S05") {
        sUserType = "I";
    } else if (Stats == "S15" || Stats == "S20") {
        sUserType = "W";
    } else if (Stats == "S60") {
        sUserType = "H";
    }
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("Workbench", {
				"QueueID": QueueID,
				"Bukrs": Bukrs,
				"Stats": Stats,
				"Agent": Agent,
				"Username": Username,
				"UserType": sUserType,
				"NavScreen": "Fulfillment",
				"Flag": t_flag,
				"Type": "SingleView"
			});
		},

	
		fn_all: function() {
			var filtered = this.aFullData.filter(function(item) {
				return item.Qid && item.Qid !== "" &&
					(item.Stats === "S15" || item.Stats === "S20");
			});

			this.aFilteredData = filtered;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();

		},

		fn_msmeOnly: function() {
			var filtered = this.aFullData.filter(function(item) {
				return item.Msme === "X" &&
					(item.Stats === "S15" || item.Stats === "S20");
			});

			this.aFilteredData = filtered;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
		fn_todayPosted: function() {
			var filtered = this.aFullDatainitial.filter(function(item) {
				return item.Todaypost && item.Todaypost !== "";
			});

			this.aFilteredData = filtered;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
		fn_longPendingOnly: function() {
			var filtered = this.aFullData.filter(function(item) {
				return item.Longpend === "X" &&
					(item.Stats === "S15" || item.Stats === "S20");
			});

			this.aFilteredData = filtered;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
		fn_escalatedOnly: function() {
			var filtered = this.aFullDatainitial.filter(function(item) {
				return item.Escalate === "X" &&
					item.Stats === "S30"; // Optional: you can remove this check if not needed
			});

			this.aFilteredData = filtered;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
		fn_user: function() {
			var userId = Current_User; // Get current user ID
			var filteredData = this.aFullData.filter(function(item) {
				return item.Assignedto === userId;
			});

			this.aFilteredData = filteredData;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
	
		fn_hold: function() {
			var holdData = this.getView().getModel("jsHold").getData();

			this.aFilteredData = holdData;
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel(); // Rebind paginated data to table
		},
	
		fn_changeWI: function() {
			var WIInd = this.getView().byId("id_usertype").getSelectedKey();
			if (WIInd === "I") {
				WIindic = WIInd;
				this.fn_LoadData();
			} else if (WIInd === "W") {
				WIindic = WIInd;
				this.fn_LoadData();
			}
		},
		fn_fulfillrefresh: function() {
			// Step 1: Clear table and search
			location.reload();
		

			// // Step 2: Load backend data
			this.fn_LoadData();
			this.getView().byId("id_table_width").clearSelection();

		
		},
		fnSearchPop: function(oEvent) {
			var oButton = oEvent && oEvent.getSource ? oEvent.getSource() : null;

			if (!oButton) {
				sap.m.MessageToast.show("No source control for popover.");
				return;
			}

			if (!this._PopOverSearch) {
				this._PopOverSearch = sap.ui.xmlfragment("FSC360NEW.fragment.SearchFrag", this);
				this.getView().addDependent(this._PopOverSearch);
				sap.ui.getCore().byId("cb_docid").setSelected(true);
			}

		
			if (this._PopOverSearch.isOpen && this._PopOverSearch.isOpen()) {
				this._PopOverSearch.close();
			} else {
				this._PopOverSearch.openBy(oButton);
			}
		},
	
		fn_Docid_Search: function() {
			FilterParameter = "Qid";
			this.getView().byId("id_search_field").setPlaceholder("Search by Qid");

			//Add 
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn_selected');
			//Remove
			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');
			this._PopOverSearch.close();
		},

		fn_Invo_Search: function() {
			FilterParameter = "Invno";

			this.getView().byId("id_search_field").setPlaceholder("Search by Invoice No");
			//Add 
			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},

		fn_Plant_Search: function() {
			FilterParameter = "Bukrs";
			this.getView().byId("id_search_field").setPlaceholder("Search by Plant");

			//Add 
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},

		fn_Vendor_Search: function() {
			FilterParameter = "Name1";
			this.getView().byId("id_search_field").setPlaceholder("Search by Vendor");

			//Add 
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},

			fn_agent_Search: function() {
			FilterParameter = "Assignedto";
			this.getView().byId("id_search_field").setPlaceholder("Search by Agent");

			//Add 
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},
		onCheckDocId: function(oEvent) {
			this.fn_updateFilterFields("Qid", oEvent.getParameter("selected"));
		},

		onCheckVendor: function(oEvent) {
			this.fn_updateFilterFields("Name1", oEvent.getParameter("selected"));
		},

		onCheckInvoice: function(oEvent) {
			this.fn_updateFilterFields("Invno", oEvent.getParameter("selected"));
		},

		onCheckAgent: function(oEvent) {
			this.fn_updateFilterFields("Assignedto", oEvent.getParameter("selected"));
		},

		onCheckPlant: function(oEvent) {
			this.fn_updateFilterFields("Bukrs", oEvent.getParameter("selected"));
		},

		// Common method
		fn_updateFilterFields: function(sField, bSelected) {
			if (!this.aFilterFields) {
				this.aFilterFields = [];
			}

			const index = this.aFilterFields.indexOf(sField);

			if (bSelected && index === -1) {
				this.aFilterFields.push(sField);
			} else if (!bSelected && index !== -1) {
				this.aFilterFields.splice(index, 1);
			}

			// Handle empty checkbox selection
			if (this.aFilterFields.length === 0) {
				this.aFilterFields = ["Qid"];
				sap.ui.getCore().byId("cb_docid").setSelected(true); // Reselect default
			}

			const labelMap = {
				Qid: "Queue Id",
				Name1: "Vendor",
				Invno: "Invoice No",
				Assignedto: "Agent",
				Bukrs: "Plant"
			};

			const placeholder = this.aFilterFields.length === 1 ? "Search by " + labelMap[this.aFilterFields[0]] : "Search by Multiple Fields";

			this.getView().byId("id_search_field").setPlaceholder(placeholder);
		},
		onSearchFieldsChange: function(oEvent) {
			var oMCB = oEvent.getSource();

			// Remove all tokens so selected items don't appear
		
			var aSelectedItems = oEvent.getSource().getSelectedItems();

			const labelMap = {
				Qid: "Queue Id",
				Name1: "Vendor",
				Invno: "Invoice No",
				Username: "Agent",
				Werks: "Plant"
			};

			var placeholder = aSelectedItems.length === 0 ? "Search by Queue Id" : aSelectedItems.length === 1 ? "Search by " + labelMap[
				aSelectedItems[0].getKey()] : "Search by Multiple Fields";

			this.getView().byId("id_search_field").setPlaceholder(placeholder);

			// Optionally, trigger search again after changing selection
			this.fnSearchField({
				getSource: () => this.getView().byId("id_search_field")
			});
		},
		fnSearchField: function(oEvent) {
			var vValue = oEvent.getSource().getValue();

			if (!this.aFullData) {
				this.aFilteredData = [];
				this.fn_updatePaginatedModel();
				return;
			}

			// Get selected fields from MultiComboBox
			var aSelectedItems = this.getView().byId("id_search_fields").getSelectedItems();
			var aFieldsToFilter = aSelectedItems.length ? aSelectedItems.map(function(item) {
				return item.getKey();
			}) : ["Qid"]; // default field if nothing selected

			if (vValue && vValue.length > 0) {
				var aTerms = vValue.toLowerCase().split(/\s+/).filter(Boolean);

				var filteredData = this.aFullData.filter(function(row) {
					return aTerms.every(function(term) {
						return aFieldsToFilter.some(function(field) {
							return row[field] && row[field].toLowerCase().includes(term);
						});
					});
				});

				this.aFilteredData = filteredData;
			} else {
				this.aFilteredData = this.aFullData;
			}

			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},
		handleMCBSelection: function(oEvent) {
			var oMCB = oEvent.getSource();
			this.aFilterFields = oMCB.getSelectedKeys(); // store selected fields
		},

		handleMCBSearch: function(oEvent) {
			var vValue = oEvent.getParameter("value").trim(); // typed value
			var oTable = this.getView().byId("id_table_width");
			var oBinding = oTable.getBinding("items");

			if (!vValue || !this.aFilterFields || this.aFilterFields.length === 0) {
				oBinding.filter([]);
				return;
			}

			var aFilters = this.aFilterFields.map(function(sField) {
				return new sap.ui.model.Filter(sField, sap.ui.model.FilterOperator.Contains, vValue);
			});

			var oCombinedFilter = new sap.ui.model.Filter(aFilters, false); // OR filter
			oBinding.filter(oCombinedFilter);
		},
	
		fnFilterPopup: function(oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oFilterPopover) {
				this._oFilterPopover = sap.ui.xmlfragment(
					"FSC360NEW.fragment.FilterPopovers",
					this
				);
				this.getView().addDependent(this._oFilterPopover);
			}

			this._oFilterPopover.openBy(oButton);
		},
		onExit: function() {
			if (this._oCustomizePopover) {
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}
			if (this._oFilterPopover) {
				this._oFilterPopover.destroy();
				this._oFilterPopover = null;
			}
			if (this._oTemplatePopover) {
				this._oTemplatePopover.destroy();
				this._oTemplatePopover = null;
			}
		},
		fncustomcolumns: function(oEvent) {
			var oView = this.getView();

			// create fragment only once
			if (!this._oCustomizePopover) {
				this._oCustomizePopover = sap.ui.xmlfragment(oView.getId(),"FSC360NEW.fragment.CustomCol_Autopark", this);

				this._oCustomizePopover.setModel(oView.getModel("FilterTableModel"), "FilterTableModel");
			
				this._oCustomizePopover.setModel(oView.getModel("viewModel1"), "viewModel1");
				this._oCustomizePopover.setModel(oView.getModel("TemplateModel"), "TemplateModel");

				oView.addDependent(this._oCustomizePopover);
			}

			// Update templates in viewModel_full
			var oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
			var aTemplateKeys = Object.keys(oTemplates);
			oView.getModel("viewModel1").setProperty("/templates", aTemplateKeys);

			// Open the popover
			this._oCustomizePopover.openBy(oEvent.getSource());
		},
		fn_onOpenCreateTemplateDialog: function(oEvent) {
			var oView = this.getView();
			if (!this._oCreateTemplatePopover) {
				this._oCreateTemplatePopover = sap.ui.xmlfragment(oView.getId(),"FSC360NEW.fragment.CreateTemplate_fullfill", this);
				this.getView().addDependent(this._oCreateTemplatePopover);
			}

			this._oCreateTemplatePopover.openBy(oEvent.getSource());
		},
		fn_onCancelCreateTemplate: function() {
			if (this._oCreateTemplatePopover) {
				this._oCreateTemplatePopover.close();
				this._oCreateTemplatePopover.destroy();
				this._oCreateTemplatePopover = null; 
			}
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}
			if (this._oFilterPopover) {
				this._oFilterPopover.close();
				this._oFilterPopover.destroy();
				this._oFilterPopover = null;
			}
		},
		
		fn_onSaveNewTemplate: function() {
     var sName = this.getView().byId("idNewTemplateName_ful").getValue();
    if (!sName) {
        sap.m.MessageToast.show("Please enter a name");
        return;
    }

    sName = sName.toUpperCase();
    const oView = this.getView();
    const oFilterModel = oView.getModel("FilterTableModel");
    const oViewModel1 = oView.getModel("viewModel1");
    const oTemplateModel = oView.getModel("TemplateModel");
    const sUserId = oView.getModel("JSusername").getProperty("/Userid");
    const sTableName = "/EXL/FSC_FULL";

    oFilterModel.refresh(true);
    const aSelectedKeys = oFilterModel.getData().filter(f => f.visible).map(f => f.key);
    const sColumns = aSelectedKeys.join(',');

    const oPayload = {
        Userid: sUserId,
        TemplateId: sName,
        Tabid: sTableName,
        Columns: sColumns
    };

    const aTemplates = oViewModel1.getProperty("/templates") || [];
    const bExists = aTemplates.some(t => t.name === sName && t.userid === sUserId);

    if (bExists) {
        // store the payload temporarily for reuse
        this._oPendingTemplatePayload = oPayload;
        this._sPendingTemplateName = sName;

        // open confirm dialog fragment
        if (!this._oConfirmDialog) {
            this._oConfirmDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ConfirmDialog", this);
            this.getView().addDependent(this._oConfirmDialog);
        }

        sap.ui.getCore().byId("confirmText").setText(`Template "${sName}" already exists. Do you want to overwrite it?`);
        this._oConfirmDialog.open();
        return;
    }

    // Create new template
    oTemplateModel.create("/SaveTemplateSet", oPayload, {
        success: function() {
            sap.m.MessageToast.show("Template saved successfully");
            this.fn_reloadTemplates();
        }.bind(this),
        error: function() {
            sap.m.MessageToast.show("Error saving template");
        }
    });

   if (this._oCreateTemplatePopover) {
				this._oCreateTemplatePopover.close();
				this._oCreateTemplatePopover.destroy();
				this._oCreateTemplatePopover = null;
			}
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}
			if (this._oFilterPopover) {
				this._oFilterPopover.close();
				this._oFilterPopover.destroy();
				this._oFilterPopover = null;
			}
},
onConfirmYesPress: function() {
    const oTemplateModel = this.getView().getModel("TemplateModel");
    const oPayload = this._oPendingTemplatePayload;
    const sTemplateName = this._sPendingTemplateName; 

    if (oPayload) {
        oTemplateModel.create("/SaveTemplateSet", oPayload, {
            success: function() {
                sap.m.MessageToast.show(`Template "${sTemplateName}" updated successfully`);
                this.fn_reloadTemplates();
            }.bind(this),
            error: function() {
                sap.m.MessageToast.show("Error updating template");
            }
        });

        // Close & destroy popovers after overwrite
        if (this._oCreateTemplatePopover) {
            this._oCreateTemplatePopover.close();
            this._oCreateTemplatePopover.destroy();
            this._oCreateTemplatePopover = null;
        }
        if (this._oCustomizePopover) {
            this._oCustomizePopover.close();
            this._oCustomizePopover.destroy();
            this._oCustomizePopover = null;
        }
        if (this._oFilterPopover) {
            this._oFilterPopover.close();
            this._oFilterPopover.destroy();
            this._oFilterPopover = null;
        }
    }

    // Close confirm dialog
    this._oConfirmDialog.close();
    this._oConfirmDialog.destroy();
    this._oConfirmDialog = null;
    delete this._oPendingTemplatePayload;
    delete this._sPendingTemplateName;
},


onConfirmNoPress: function() {
    sap.m.MessageToast.show("Please choose a new template name");
    this._oConfirmDialog.close();
    if (this._oCreateTemplatePopover) {
				this._oCreateTemplatePopover.close();
				this._oCreateTemplatePopover.destroy();
				this._oCreateTemplatePopover = null;
			}
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}
			if (this._oFilterPopover) {
				this._oFilterPopover.close();
				this._oFilterPopover.destroy();
				this._oFilterPopover = null;
			}
},

onConfirmDialogClose: function() {
    this._oConfirmDialog.destroy();
    this._oConfirmDialog = null;
    if (this._oCreateTemplatePopover) {
				this._oCreateTemplatePopover.close();
				this._oCreateTemplatePopover.destroy();
				this._oCreateTemplatePopover = null;
			}
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}
			if (this._oFilterPopover) {
				this._oFilterPopover.close();
				this._oFilterPopover.destroy();
				this._oFilterPopover = null;
			}
},

		fn_reloadTemplates: function() {
			const oView = this.getView();
			const oODataModel = this.getOwnerComponent().getModel();
			const oViewModel = oView.getModel("viewModel1");
			const sUserId = oView.getModel("JSusername").getProperty("/Userid");
	oGlobalBusyDialog.open();
			oODataModel.read("/SaveTemplateSet", {
				filters: [
					new sap.ui.model.Filter("Userid", sap.ui.model.FilterOperator.EQ, sUserId)
				],
				success: function(oData) {
					const aTemplateArray = oData.results.map(item => ({
						name: item.TemplateId,
						userid: item.Userid,
						columns: item.Columns || ""
					}));
					oViewModel.setProperty("/templates", aTemplateArray);
						oGlobalBusyDialog.close();
				},
				error: function() {
						oGlobalBusyDialog.close();
					sap.m.MessageToast.show("Failed to reload templates");
					
				}
			});
		},
		onApplyTemplate: function() {
			//this.applyVisibleColumns();
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null; // ix added here
			}

		},

		fn_onOpenTemplatePopover: function(oEvent) {
			const oView = this.getView();
			const sTableName = "/EXL/FSC_FULL";
			// Create popover if not already
			if (!this._oTemplatePopover) {
				this._oTemplatePopover = sap.ui.xmlfragment(
					oView.getId(),
					"FSC360NEW.fragment.TemplatePopover_apk",
					this
				);
				oView.addDependent(this._oTemplatePopover);
			}

			const oODataModel = this.getOwnerComponent().getModel(); // OData Model
			const oViewModel = oView.getModel("viewModel1");
			const aFilters = [];

			if (sTableName) {
				aFilters.push(new sap.ui.model.Filter("Tabid", sap.ui.model.FilterOperator.EQ, sTableName));
			}
			// Read all templates for the logged-in user
			oODataModel.read("/SaveTemplateSet", {
				filters: aFilters,
				success: function(oData) {

					// Map backend fields to UI model
					const aTemplateArray = oData.results.map(item => ({
						name: item.TemplateId, // template name
						userid: item.Userid,

						columns: item.Columns || "" // comma-separated columns
					}));

					oViewModel.setProperty("/templates", aTemplateArray);
				}.bind(this),
				error: function() {
					sap.m.MessageToast.show("Failed to load templates");
				}
			});

			// Open popover near the source control
			this._oTemplatePopover.openBy(oEvent.getSource());
		},
		fn_onTemplateListItemPress: function(oEvent) {
			
			const oItem = oEvent.getParameter("listItem"); // always the pressed CustomListItem
			const oCtx = oItem.getBindingContext("viewModel1");
			const sName = oCtx.getProperty("name");
		
			const sSelectedName = oCtx.getProperty("name");
			const sColumns = oCtx.getProperty("columns"); // comma-separated string from backend

			const oView = this.getView();
			const oViewModel1 = oView.getModel("viewModel1");
			const oColModel = oView.getModel("FilterTableModel");

			// Save selected template
			oViewModel1.setProperty("/selectedTemplate", sSelectedName);
			localStorage.setItem("LastUsedTemplate", sSelectedName);

			// Close popover
			if (this._oTemplatePopover) {
				this._oTemplatePopover.close();
				this._oTemplatePopover.destroy();
				this._oTemplatePopover = null;
			}
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}
			if (this._oFilterPopover) {
				this._oFilterPopover.close();
				this._oFilterPopover.destroy();
				this._oFilterPopover = null;
			}

			// Convert comma-separated columns → array
			const aVisibleKeys = (sColumns || "").split(",").map(s => s.trim()).filter(Boolean);

			// Get current column model
			const aCols = oColModel.getData();

			// Update visibility based on template
			const updatedCols = aCols.map(col => ({
				...col,
				visible: aVisibleKeys.includes(col.key)
			}));

			oColModel.setData(updatedCols);
			oColModel.refresh(true);

			// Optional: ensure table refreshes layout
			sap.ui.getCore().byId(oView.createId("idTable")).rerender();
		},
		// fn_onDeleteTemplateRow: function(oEvent) {
		// 	const oButton = oEvent.getSource();
		// 	const oCtx = oButton.getBindingContext("viewModel1");
		// 	if (!oCtx) return;

		// 	const sTemplateName = oCtx.getProperty("name");
		// 	const sReportName = "/EXL/FSC_FULL"; // hardcoded Tabid

		// 	const oView = this.getView();
		// 	const oModel = oView.getModel("TemplateModel");
		// 	const oViewModel = oView.getModel("viewModel1");

		// 	sap.m.MessageBox.confirm(
		// 	`Are you sure you want to delete template "${sTemplateName}"?`, {
		// 			title: "Delete Template",
		// 			styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
		// 			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
		// 			onClose: function(sAction) {
		// 				if (sAction === sap.m.MessageBox.Action.YES) {
		// 					oModel.remove(
		// 						`/SaveTemplateSet(TemplateId='${encodeURIComponent(sTemplateName)}',Tabid='${encodeURIComponent(sReportName)}')`, {
		// 							success: function() {
		// 								sap.m.MessageToast.show("Template deleted successfully");

		// 								const aTemplates = oViewModel.getProperty("/templates") || [];
		// 								oViewModel.setProperty(
		// 									"/templates",
		// 									aTemplates.filter(t => t.name !== sTemplateName)
		// 								);
		// 							},
		// 							error: function(oError) {
		// 								sap.m.MessageToast.show("Error deleting template");
								
		// 							}
		// 						}
		// 					);
		// 				}
		// 			}
		// 		}
		// 	);
		// 		setTimeout(function() {
		// 			var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
		// 			if (buttons[0]) buttons[0].classList.add("yesButtonHack");
		// 			if (buttons[1]) buttons[1].classList.add("noButtonHack");
		// 		}, 100);
		// },
		fn_onDeleteTemplateRow: function (oEvent) {
    var oButton = oEvent.getSource();
    var oCtx = oButton.getBindingContext("viewModel1");
    if (!oCtx) {
        return;
    }

    var sTemplateName = oCtx.getProperty("name");
    var sReportName = "/EXL/FSC_FULL"; // Hardcoded Tabid

    var oView = this.getView();
    var oModel = oView.getModel("TemplateModel");
    var oViewModel = oView.getModel("viewModel1");

    // store delete context for Yes handler
    this._sDeleteTemplateName = sTemplateName;
    this._sDeleteReportName = sReportName;
    this._oDeleteModel = oModel;
    this._oDeleteViewModel = oViewModel;

    // open confirm dialog fragment
    if (!this._oConfirmDialog) {
        this._oConfirmDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ConfirmDialog", this);
        this.getView().addDependent(this._oConfirmDialog);
    }

    sap.ui.getCore().byId("confirmText").setText(
        "Are you sure you want to delete template \"" + sTemplateName + "\"?"
    );
    this._oConfirmDialog.open();
},

onConfirmYesPress: function () {
    var that = this; // maintain controller context
    var oTemplateModel = this.getView().getModel("TemplateModel");

    // case 1 → overwrite (from Save)
    if (this._oPendingTemplatePayload) {
        var oPayload = this._oPendingTemplatePayload;
        var sTemplateName = this._sPendingTemplateName;

        oTemplateModel.create("/SaveTemplateSet", oPayload, {
            success: function () {
                sap.m.MessageToast.show("Template \"" + sTemplateName + "\" updated successfully");
                that.fn_reloadTemplates();
            },
            error: function () {
                sap.m.MessageToast.show("Error updating template");
            }
        });

        this._clearTempData();
    }

    // case 2 → delete
    else if (this._sDeleteTemplateName && this._sDeleteReportName) {
        var sTemplate = this._sDeleteTemplateName;
        var sReport = this._sDeleteReportName;
        var oModel = this._oDeleteModel;
        var oViewModel = this._oDeleteViewModel;

        oModel.remove(
            "/SaveTemplateSet(TemplateId='" + encodeURIComponent(sTemplate) +
            "',Tabid='" + encodeURIComponent(sReport) + "')",
            {
                success: function () {
                    sap.m.MessageToast.show("Template \"" + sTemplate + "\" deleted successfully");

                    var aTemplates = oViewModel.getProperty("/templates") || [];
                    oViewModel.setProperty("/templates",
                        aTemplates.filter(function (t) {
                            return t.name !== sTemplate;
                        })
                    );
                },
                error: function () {
                    sap.m.MessageToast.show("Error deleting template");
                }
            }
        );

        this._clearDeleteData();
    }

    // close and destroy dialog
    if (this._oConfirmDialog) {
        this._oConfirmDialog.close();
        this._oConfirmDialog.destroy();
        this._oConfirmDialog = null;
    }
},

onConfirmNoPress: function () {
    sap.m.MessageToast.show("Action cancelled");

    if (this._oConfirmDialog) {
        this._oConfirmDialog.close();
        this._oConfirmDialog.destroy();
        this._oConfirmDialog = null;
    }

    this._clearTempData();
    this._clearDeleteData();
},

onConfirmDialogClose: function () {
    if (this._oConfirmDialog) {
        this._oConfirmDialog.destroy();
        this._oConfirmDialog = null;
    }
},

_clearTempData: function () {
    delete this._oPendingTemplatePayload;
    delete this._sPendingTemplateName;
},

_clearDeleteData: function () {
    delete this._sDeleteTemplateName;
    delete this._sDeleteReportName;
    delete this._oDeleteModel;
    delete this._oDeleteViewModel;
},

		fn_onSelectAll: function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			var oModel = this.getView().getModel("FilterTableModel");
			var aData = oModel.getData();

			aData.forEach(function(oItem) {
				oItem.visible = bSelected; // select or deselect all
			});

			oModel.refresh(true); // update bindings
		},
		fn_filterVendor: function(sTerm, oItem) {
			// Convert both to lowercase for case-insensitive search
			sTerm = sTerm.toLowerCase();

			// Access the binding context of the current item
			var oCtx = oItem.getBindingContext("JSVendor");
			var sVendorName = oCtx.getProperty("Mcod1") ? oCtx.getProperty("Mcod1").toLowerCase() : "";
			var sVendorNum = oCtx.getProperty("Lifnr") ? oCtx.getProperty("Lifnr").toLowerCase() : "";

			// Match if either field contains the search term
			return sVendorName.includes(sTerm) || sVendorNum.includes(sTerm);
		},
	
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
				oGlobalBusyDialog.open();
			// To Get Vendor
			oModel.read("/KredaSet", {

				success: function(oData, oResponse) {

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSVendor');
						oGlobalBusyDialog.close();

				},
				error: function(oResponse) {
						oGlobalBusyDialog.close();
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');

				}

			});

		},
	
		fn_onVendorF4: function(oEvent) {
			if (!this._oVendorDialog) {
				this._oVendorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.Lifnrmulti", this);
				this.getView().addDependent(this._oVendorDialog);
			}

			// Clear previous filter
			var oBinding = this._oVendorDialog.getBinding("items");
			if (oBinding) {
				oBinding.filter([]); // remove previous filters
			}

			// Pre-select previously selected vendors
			var aItems = this._oVendorDialog.getItems() || [];
			aItems.forEach(function(oItem) {
				var sVendor = oItem.getBindingContext("JSVendor").getProperty("Lifnr");
				if (this.aSelectedVendors.includes(sVendor)) {
					oItem.setSelected(true); // elect the StandardListItem itself
				}
			}.bind(this));

			this._oVendorDialog.open();
		},

	

		fn_Lifnr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);

			// Re-select previously selected items in filtered list
			var aItems = oEvent.getSource().getItems();
			var aToSelect = [];

			aItems.forEach(function(oItem) {
				var sVendor = oItem.getBindingContext("JSVendor").getProperty("Lifnr");
				if (this.aSelectedVendors.includes(sVendor)) {
					aToSelect.push(oItem);
				}
			}.bind(this));

			oEvent.getSource().setSelectedItems(aToSelect);
		},

		fn_Lifnr_Confrm: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems") || [];
			var aNewVendorIds = [];

			aSelectedItems.forEach(function(oItem) {
				var sVendor = oItem.getBindingContext("JSVendor").getProperty("Lifnr");
				aNewVendorIds.push(sVendor);
			});

			// Merge new selections with previous ones (avoid duplicates)
			this.aSelectedVendors = Array.from(new Set([...this.aSelectedVendors, ...aNewVendorIds]));

			// Just get vendor numbers as comma-separated string
			var sDisplay = this.aSelectedVendors.join(", ");

			// Update input field
			sap.ui.core.Fragment.byId("myPickDialog", "id_vendor").setValue(sDisplay);
		},

		fn_onVendorChange: function(oEvent) {
			var sValue = oEvent.getParameter("value").trim();

			if (!sValue) {
				return;
			}

			// Split by commas or spaces (handle both cases)
			var aVendorList = sValue.split(/[\s,]+/).filter(Boolean);

	

			// Save in model or global array if needed
			this.aSelectedVendors = aVendorList;

			// Now validate or fetch data for these vendors
			var oModel = this.getView().getModel("JSVendor");
			var aAllVendors = oModel.getData();

			// Filter only valid vendor entries
			var aMatched = aAllVendors.filter(function(oVendor) {
				return aVendorList.includes(oVendor.Lifnr);
			});

			if (aMatched.length === 0) {
				sap.m.MessageToast.show("No valid vendors found for input: " + sValue);
				return;
			}

		

			// Optional — show display names (like Mcod1 - Lifnr)
			var aDisplayNames = aMatched.map(function(v) {
				return v.Mcod1 + " - " + v.Lifnr;
			});

			// Update input with formatted display names
			this.getView().byId("id_vendor").setValue(aDisplayNames.join(", "));

			// Store back to your global vendor array
			this.aSelectedVendors = aMatched.map(v => v.Lifnr);
		},
		fn_onVendorSelectionChange: function(oEvent) {
			// Get all selected vendor keys from MultiComboBox
			var oMultiComboBox = oEvent.getSource();
			var aSelectedItems = oMultiComboBox.getSelectedItems();

			// Store selected vendors in array (using Lifnr)
			this.aSelectedVendors = aSelectedItems.map(function(oItem) {
				var sText = oItem.getText(); // "VendorName - VendorCode"
				var sLifnr = sText.split(" - ").pop(); // Extract Lifnr from text
				return sLifnr.trim();
			});

		
		},

	fn_onSumbit: function() {
			var oView = this.getView();
			this.aInvoiceNumbers = [];
			this.aDocumentNumbers = [];
			this.aPoNumbers = [];
			

			//  Read MultiInput tokens
			var oInvMultiInput = sap.ui.core.Fragment.byId("myPickDialog", "id_inv");
			if (oInvMultiInput && oInvMultiInput.getTokens().length > 0) {
				this.aInvoiceNumbers = oInvMultiInput.getTokens().map(function(token) {
					return token.getText();
				});
			}
			var oDocMultiInput = sap.ui.core.Fragment.byId("myPickDialog", "id_doc");
			if (oDocMultiInput && oDocMultiInput.getTokens().length > 0) {
				this.aDocumentNumbers = oDocMultiInput.getTokens().map(function(token) {
					return token.getText();
				});
			}
			var oPoMultiInput = sap.ui.core.Fragment.byId("myPickDialog", "id_po");
			if (oPoMultiInput && oPoMultiInput.getTokens().length > 0) {
				this.aPoNumbers = oPoMultiInput.getTokens().map(function(token) {
					return token.getText();
				});
			}

			// Read fragment values
			var sBukrs = sap.ui.core.Fragment.byId("myPickDialog", "id_Bukrs")?.getValue();
			var sCurr = sap.ui.core.Fragment.byId("myPickDialog", "id_currency")?.getValue();
		
			var sPrio = sap.ui.core.Fragment.byId("myPickDialog", "id_PRIO")?.getValue();

			var sFromDate = sap.ui.core.Fragment.byId("myPickDialog", "id_creationdatefrm")?.getDateValue();
			var sToDate = sap.ui.core.Fragment.byId("myPickDialog", "id_creationdateend")?.getDateValue();

			// Format dates
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd"
			});
			var sDateFrom = sFromDate ? oDateFormat.format(sFromDate) : "";
			var sDateTo = sToDate ? oDateFormat.format(sToDate) : "";

			var sholdstats = "S60";
			var sholdstats1 = "S15";
			var sholdstats2 = "S20";

			var aFilters = [];

			if (sBukrs) aFilters.push(`Bukrs eq '${sBukrs}'`);
			if (sCurr) aFilters.push(`Waers eq '${sCurr}'`);

			// Reset vendor list if user cleared input
			var oVendorMCB = sap.ui.core.Fragment.byId("myPickDialog", "id_vendor");
			if (oVendorMCB && oVendorMCB.getSelectedKeys().length === 0) {
				this.aSelectedVendors = [];
			}

			// multiple Vendor Filter Handling
			if (this.aSelectedVendors && this.aSelectedVendors.length > 0) {
				var aVendorFilters = this.aSelectedVendors.map(function(sV) {
					return `Lifnr eq '${sV}'`;
				});
				aFilters.push("(" + aVendorFilters.join(" or ") + ")");
			}

			// if (sInvNo) aFilters.push(`Invno eq '${sInvNo}'`);
			if (this.aInvoiceNumbers && this.aInvoiceNumbers.length > 0) {
				var aInvFilters = this.aInvoiceNumbers.map(function(sInv) {
					return `Invno eq '${sInv}'`;
				});
				aFilters.push("(" + aInvFilters.join(" or ") + ")");
			}
			// if (sDocNo) aFilters.push(`Belnr eq '${sDocNo}'`);
			if (this.aDocumentNumbers && this.aDocumentNumbers.length > 0) {
				var aDocFilters = this.aDocumentNumbers.map(function(sDoc) {
					return `Mblnr eq '${sDoc}'`;
				});
				aFilters.push("(" + aDocFilters.join(" or ") + ")");
			}
			// if (sPo)    aFilters.push(`Ebeln eq '${sPo}'`);
			if (this.aPoNumbers && this.aPoNumbers.length > 0) {
				var aPoFilters = this.aPoNumbers.map(function(sPo) {
					return `Ebeln eq '${sPo}'`;
				});
				aFilters.push("(" + aPoFilters.join(" or ") + ")");
			}
			if (sPrio) aFilters.push(`P_Prio eq '${sPrio}'`);

			if (sDateFrom && sDateTo) {
				aFilters.push(`Invdt ge datetime'${sDateFrom}T00:00:00' and Invdt le datetime'${sDateTo}T23:59:59'`);
			} else if (sDateFrom) {
				aFilters.push(`Invdt eq datetime'${sDateFrom}T00:00:00'`);
			}

			// Add status filter based on flag
			if (holdflag) {
				aFilters.push(`Stats eq '${sholdstats}'`);
			} else {
				aFilters.push(`(Stats eq '${sholdstats1}' or Stats eq '${sholdstats2}')`);
			}

			// Final Filter String
			var sFinalFilter = aFilters.join(" and ");
	

			// OData Call
			var that = this;
			oView.setBusy(true);
			oView.getModel().read("/PickSet", {
				urlParameters: {
					"$filter": sFinalFilter
				},
				success: function(oData) {
				

					var oResultModel = new sap.ui.model.json.JSONModel(oData.results);
					that.aPickFullData = oData.results;
					that.aPickFilteredData = oData.results;
					that.iPickCurrentPage = 1;
					that.fn_updatePickPaginatedModel();

					oView.setModel(oResultModel, "pickModel");
					oView.byId("id_pick_table").setModel(oResultModel, "pickModel");
					oView.byId("id_pick_table").setVisible(true);
					oView.byId("id_table_width").setVisible(false);
					oView.byId("fultabPick").setVisible(true);
					oView.byId("fultab").setVisible(false);

					var iCount = oData.results.length;
					var oCountText = oView.byId("id_total_1");
					if (oCountText) oCountText.setText(iCount.toString());

					var oTitleText = oView.byId("idCardTitle");
					if (oTitleText) oTitleText.setText("Picked Invoice");

					oView.setBusy(false);
				},
			
				error: function(oError) {
				
					oView.setBusy(false);
					sap.m.MessageToast.show("Error fetching data");
				}
			});

			that.fn_onPickCancel();
		},
		fn_onPickConfirm: function() {
			// Your OK logic
			this._pPickDialog.close();
			if (this._oVendorDialog) {
				this._oVendorDialog.close();
				this._oVendorDialog.destroy();
				this._oVendorDialog = null;
			}
			if (this._pPickDialog) {
				this._pPickDialog.close();
				this._pPickDialog.destroy();
				this._pPickDialog = null;
			}
		},

		fn_onPickCancel: function() {
			this._pPickDialog.close();
			if (this._oVendorDialog) {
				this._oVendorDialog.close();
				this._oVendorDialog.destroy();
				this._oVendorDialog = null;
			}
			if (this._pPickDialog) {
				this._pPickDialog.close();
				this._pPickDialog.destroy();
				this._pPickDialog = null;
			}
		},
		fn_updatePickPaginatedModel: function() {
			var iStart = (this.iPickCurrentPage - 1) * this.iPickRowsPerPage;
			var iEnd = iStart + this.iPickRowsPerPage;

			var pageData = this.aPickFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().byId("id_pick_table").setModel(pagedModel, "pickModel");
			this.fn_renderPickPageNumbers(); // Add page buttons for pick
		},
		fn_onNextPickPage: function() {
			var iTotalPages = Math.ceil(this.aPickFilteredData.length / this.iPickRowsPerPage);
			if (this.iPickCurrentPage < iTotalPages) {
				this.iPickCurrentPage++;
				this.fn_updatePickPaginatedModel();
			}
		},
		fn_getPickPageNumbers: function(currentPage, totalPages) {
			var pages = [];

			if (totalPages <= 7) {
				for (var i = 1; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				if (currentPage <= 2) {
					pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
				} else if (currentPage >= totalPages - 1) {
					pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
				} else {
					pages.push(1, "...");
					pages.push(currentPage - 1, currentPage, currentPage + 1);
					pages.push("...", totalPages);
				}
			}

			return [...new Set(pages)];
		},
		fn_onPreviousPickPage: function() {
			if (this.iPickCurrentPage > 1) {
				this.iPickCurrentPage--;
				this.fn_updatePickPaginatedModel();
			}
		},
		fn_renderPickPageNumbers: function() {
			var oPageBox = this.byId("idPickPageNumbersBox"); // A new HBox for pick table
			oPageBox.removeAllItems();

			var iTotalPages = Math.ceil(this.aPickFilteredData.length / this.iPickRowsPerPage);
			var currentPage = this.iPickCurrentPage;
			var that = this;

			var pagesToShow = this.fn_getPickPageNumbers(currentPage, iTotalPages);

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iPickCurrentPage = pageNum;
						that.fn_updatePickPaginatedModel();
					},
					customData: [new sap.ui.core.CustomData({
						key: "customClass",
						value: "cl_page_btn"
					})]
				});

				if (pageNum === currentPage) {
					oButton.addStyleClass("cl_page_btn_emp");
				} else {
					oButton.addStyleClass("cl_page_btn");
				}

				oPageBox.addItem(oButton);
			}

			for (var k = 0; k < pagesToShow.length; k++) {
				var page = pagesToShow[k];
				if (page === "...") {
					oPageBox.addItem(new sap.m.Text({
						text: "...",
						design: "Bold",
						textAlign: "Center",
						width: "2rem"
					}));
				} else {
					addPageButton(page);
				}
			}

			this.byId("idPrevPickButton").setVisible(currentPage > 1);
			this.byId("idNextPickButton").setVisible(currentPage < iTotalPages);
		},
		fn_onZoomIn: function() {
			var oScroll = this.getView().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale, default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;
			var newScale = currentScale + 0.1;
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // scale from top-left corner
		},

		
		fn_onZoomOut: function() {
			var oScroll = this.getView().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale or default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;

			// Reduce scale but don’t go below 0.5
			var newScale = Math.max(currentScale - 0.1, 0.5);
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // Keep same origin as Zoom In
		},
		// call fnGetPDF(QueueID)

		fn_onPrint: function() {
			var iframe = this.getView().byId("id_scrll").getContent()[0].getDomRef().querySelector('iframe');
			if (iframe) {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			}
		},

	
		fn_onDownload: function() {
			var QueueID = window.QueueID || "";
			if (!QueueID) {
				// sap.m.MessageBox.error("Please Select the Queue ID");
				this.openErrorDialog(' Please Select the Queue ID');
				return;
			}

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
					link.download = "Invoice_" + QueueID + ".pdf"; // filename with QueueID
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					sap.m.MessageBox.error("Error while downloading: " + err.message);
				});
		},
			openwarnDialog: function(sMessage) {
			var oView = this.getView();

			// Set dynamic message
			oView.getModel("warnModel").setProperty("/message", sMessage);

			// Load fragment only once
			if (!this.warnDialog) {
				this.warnDialog = sap.ui.xmlfragment(oView.getId(),"FSC360NEW.Fragment.WarningReuse", this);
				oView.addDependent(this.warnDialog);
			}

			this.warnDialog.open();
		},
				fn_closewarn: function() {
			if (this.warnDialog) {
				// this.ErrorDialog.close();
				this.warnDialog.destroy();
				this.warnDialog = null;
			}
		},
				openErrorDialog: function(sMessage) {
			var oView = this.getView();

			// Set the dynamic message in the model
			oView.getModel("errorModel").setProperty("/message", sMessage);

			// Follow your standard fragment loading approach
			if (!this.ErrorDialog) {
				this.ErrorDialog = sap.ui.xmlfragment(oView.getId(),"FSC360NEW.Fragment.ErrorReuse", this);
				this.getView().addDependent(this.ErrorDialog);
			}
			// Open the dialog
			this.ErrorDialog.open();
		},
		fn_onCloseErrorDialog: function() {
			if (this.ErrorDialog) {
				// this.ErrorDialog.close();
				this.ErrorDialog.destroy();
				this.ErrorDialog = null;
			}
		},
				onCloseSuccessDialog: function() {
			if (this._oSuccessDialog) {
				// this.ErrorDialog.close();
				this._oSuccessDialog.destroy();
				this._oSuccessDialog = null;
			}
		},
		fnSimulate_Fulfill: function() { // Added by Lokesh 19-06-2023 for simulation functionality
			var oUserId = this.getView().getModel('JSusername').getData().Userid;
			arrHead = [];
			arrQid = [];
			var arrAsgn = [];
			var arrAgent = [];
			// if (this.getView().byId('id_tab').getSelectedKey() === "Normal") {
				var myTable = this.getView().byId("id_table_width");
			// } else if (this.getView().byId('id_tab').getSelectedKey() === "Hold") {
			// 	var myTable = this.getView().byId("id_table_hold");
			// }
			var selectedIndeices = myTable.getSelectedIndices();

			if (selectedIndeices.length != 0) {
				for (var i = 0; i < selectedIndeices.length; i++) {
					var oQid = {
						"Qid": myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")
					};
							   var Stats = myTable.getContextByIndex(selectedIndeices[i]).getProperty("Stats");
					 if (Stats == "S05") {
        Userbulk = "I";
    } else if (Stats == "S15" || Stats == "S20") {
        Userbulk = "W";
    } else if (Stats == "S60") {
        Userbulk = "H";
    }
					arrHead.push(oQid);
					arrQid.push(parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")));
					if (myTable.getContextByIndex(selectedIndeices[i]).getProperty("Assignedto") === "") {
						arrAsgn.push(parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")));
						var vError = 'X';
					} else if (myTable.getContextByIndex(selectedIndeices[i]).getProperty("Assignedto") !== oUserId) {
						arrAgent.push(parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")));
						vError = 'X';
					}

				}
				if (vError === 'X') {
					if (arrAsgn.length !== 0 && arrAgent.length !== 0) {
						// sap.m.MessageBox.error(arrAsgn + " doesn't contains Agent Please Assign the Agent." + '\n' + arrAgent +
						// 	" not able to Simulate, Please Select the Possible Qid's.");
						  this.openErrorDialog(arrAsgn + " doesn't contain Agent. Please assign the Agent.\n"
        + arrAgent + " not able to Simulate, Please select the possible QIDs.");
					} else if (arrAgent.length !== 0) {
						// sap.m.MessageBox.error(arrAgent + " not able to Simulate Please Select the Possible Qid's.");
						this.openErrorDialog(arrAgent + " not able to Simulate. Please select the possible QIDs.");
					} else if (arrAsgn.length !== 0) {
						// sap.m.MessageBox.error(arrAsgn + " doesn't contains Agent Please Assign the Agent.");
						 this.openErrorDialog(arrAsgn + " doesn't contain Agent. Please assign the Agent.");
					}
				} else {
					this.fn_SimulateValid();
				}

			} else {
				// sap.m.MessageBox.warning("Please Select Atleast one Queid");
					this.openwarnDialog("Please Select Atleast one Queid");
			}
		},
		fn_SimulateValid: function() { // Added by Lokesh 19-06-2023 for simulation functionality
			var obj = {};
			obj.Flag = Userbulk;
			obj.IvAction = 'STPVA';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			obj.NavHead = arrHead;
			obj.NavReturn = [];
			var that = this;
			oGlobalBusyDialog.open();

			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					oGlobalBusyDialog.close();
					var oLen = oData.NavReturn.results.length;
					var oCon = [];
					var oMes = [];
					if (oLen !== 0) {
						for (var i = 0; i < oLen; i++) {
							var oNum = oData.NavReturn.results[i].Message.split('**').length;
							var vQid = oData.NavReturn.results[i].Message.split('**')[0];
							for (var j = 1; j < oNum; j++) {
								oCon.push(oData.NavReturn.results[i].Message.split('**')[j]);
							}
							if (oCon.length !== 0) {
								oMes.push(oCon + ' Not in ' + parseInt(vQid) + ' Qid');
							}

							oCon = [];
							vQid = '';
						}

						if (oMes.length !== 0) {
							var vStr = '';
							for (var k = 0; k < oMes.length; k++) {

								vStr = vStr + oMes[k] + '\n';
							}
							sap.m.MessageBox.error(vStr);
						} else {
							// sap.m.MessageBox.warning("Do you want to Simulate this Qid's - " + arrQid + " ?", {
							// 	actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// 	styleClass: "cl_message_box",
							// 	emphasizedAction: MessageBox.Action.YES,
							// 	onClose: function(sAction) {
							// 		if (sAction === "YES") {
							// 			that.fn_checkdupSim();
							// 		}
							// 	}
							// });
								var vMsg = "Do you want to Simulate this Qid's - " + arrQid + " ?";

					if (!that._oConfirmDialog) {
						that._oConfirmDialog = sap.ui.xmlfragment(
							that.getView().getId(),
							"FSC360NEW.fragment.ConfirmDialog",
							that
						);
						that.getView().addDependent(that._oConfirmDialog);
					}
					that._oConfirmDialog.open();
					sap.ui.core.Fragment.byId(that.getView().getId(), "confirmText").setText(vMsg);

						}
					}
				},
				error: function() {
					sap.m.MessageBox.error("Http Error");

				}
			});
		},
			onConfirmYesPress: function() {
					this.fn_checkdupSim();
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
				this._oConfirmDialog = null;
		

		
		},

		onConfirmNoPress: function() {
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
				this._oConfirmDialog = null;
	
		},
		fn_checkdupSim: function() { // Added by Lokesh 19-06-2023 for simulation functionality
			var obj = {};
			obj.Flag = Userbulk;
			obj.IvAction = 'STSIM';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			obj.NavHead = arrHead;
			obj.NavReturn = [];
			var that = this;
			oGlobalBusyDialog.open();
			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					oGlobalBusyDialog.close();

					var oErr = [];
					var oSucc = [];
					var temp = {};
					if (oData.NavReturn.results) {
						var olen = oData.NavReturn.results.length;
						for (var i = 0; i < olen; i++) {
							if (oData.NavReturn.results[i].Type === 'E') {
								temp = {
									"Message": oData.NavReturn.results[i].Message
								};
								oErr.push(temp);
							} else if (oData.NavReturn.results[i].Type === 'S') {

								temp = {
									"Message": oData.NavReturn.results[i].Message
								};
								oSucc.push(temp);
							}
						}
					}

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oErr);
					that.getView().setModel(oModel, 'JMCONError');

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oSucc);
					that.getView().setModel(oModel, 'JMCONSucc');

					if (oSucc.length !== 0 || oErr.length !== 0) {
						that.fnCOnfirm_frag();
					}

					// if (oData.NavReturn.results.length !== 0) {
					// 	var olen = oData.NavReturn.results.length;
					// 	var oErr = [];
					// 	for (var i = 0; i < olen; i++) {
					// 		if (oData.NavReturn.results[i].Type === 'E') {
					// 			oErr.push(oData.NavReturn.results[i].Message);
					// 		}
					// 	}

					// 	if (oErr.length !== 0) {

					// 		var vStr = '';
					// 		for (var j = 0; j < oErr.length; j++) {
					// 			if (oErr[j].includes('**')) {
					// 				var arrMes = [];
					// 				var oQid = oErr[j].split('**')[0];
					// 				var olen = oErr[j].split('**').length;
					// 				for (var k = 1; k < olen; k++) {
					// 					arrMes.push(oErr[j].split('**')[k]);
					// 				}
					// 				if (arrMes.length !== 0) {
					// 					var oMess = [];
					// 					oMess.push('Qid' + oQid + ' - ' + arrMes);
					// 					// oMess.push(arrMes + ' in ' + oQid + ' Qid');
					// 					for (k = 0; k < oMess.length; k++) {
					// 						vStr = vStr + oMess[k] + '\n';
					// 					}
					// 				}
					// 			} else {
					// 				vStr = vStr + oErr[j] + '\n';
					// 			}

					// 		}
					// 		sap.m.MessageBox.error(vStr);
					// 	}

					// } else {
					// 	sap.m.MessageBox.success("Simulated Successfully");
					// }

				},
				error: function() {
					sap.m.MessageBox.error("Http Error");

				}
			});
		},
		fnCOnfirm_frag: function() {
			if (!this.COnfirm_frag) {
				this.COnfirm_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Confirmation", this);
				this.getView().addDependent(this.COnfirm_frag);
			}
			this.COnfirm_frag.open();
			if (this.getView().getModel('JMCONError')) {
				if (this.getView().getModel('JMCONError').getData().length === 0) {
					sap.ui.getCore().byId("id_conerrMSG").setVisible(false);
				} else {
					sap.ui.getCore().byId("id_conerrMSG").setVisible(true);
				}
			} else {
				sap.ui.getCore().byId("id_conerrMSG").setVisible(false);
			}

			if (this.getView().getModel('JMCONSucc')) {
				if (this.getView().getModel('JMCONSucc').getData().length === 0) {
					sap.ui.getCore().byId("id_consuccMSG").setVisible(false);
				} else {
					sap.ui.getCore().byId("id_consuccMSG").setVisible(true);
				}
			} else {
				sap.ui.getCore().byId("id_consuccMSG").setVisible(false);
			}

		},
		fn_Confirmation_frag_close: function() {
			this.fn_LoadData();
			// this.getView().byId("id_table_hold").setSelectedIndex(-1);
			this.getView().byId("id_table_width").setSelectedIndex(-1);
			this.COnfirm_frag.close();
		},
			fn_Post_Fulfill: function() {
			var oUserId = this.getView().getModel('JSusername').getData().Userid;
			arrHead = [];
			arrQid = [];
			var arrAsgn = [];
			var arrAgent = [];
			
				var myTable = this.getView().byId("id_table_width");
		
			var selectedIndeices = myTable.getSelectedIndices();

			if (selectedIndeices.length != 0) {
				for (var i = 0; i < selectedIndeices.length; i++) {
					var oQid = {
						"Qid": myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")
					
           
					};
					   var Stats = myTable.getContextByIndex(selectedIndeices[i]).getProperty("Stats");
					 if (Stats == "S05") {
        Userbulk = "I";
    } else if (Stats == "S15" || Stats == "S20") {
        Userbulk = "W";
    } else if (Stats == "S60") {
        Userbulk = "H";
    }
					arrHead.push(oQid);
					arrQid.push(parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")));
					 
					if (myTable.getContextByIndex(selectedIndeices[i]).getProperty("Assignedto") === "") {
						arrAsgn.push(parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")));
						var vError = 'X';
					} else if (myTable.getContextByIndex(selectedIndeices[i]).getProperty("Assignedto") !== oUserId) {
						arrAgent.push(parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Qid")));
						vError = 'X';
					}

				}
		// for (var i = 0; i < selectedIndeices.length; i++) {

  //          var oContext = myTable.getContextByIndex(selectedIndices[i]);
  //          var sQid = oContext.getProperty("Qid");
  //          var sStatus = oContext.getProperty("Status");

  //          arrHead.push({ "Qid": sQid });
  //          arrQid.push(parseInt(sQid));

  //          // 🔥 Set Userbulk = "W" for S20 or S15
  //          if (sStatus === "S20" || sStatus === "S15") {
  //              this.Userbulk = "W";
  //          }

  //          if (oContext.getProperty("Assignedto") === "") {
  //              arrAsgn.push(parseInt(sQid));
  //              var vError = 'X';
  //          } 
  //          else if (oContext.getProperty("Assignedto") !== oUserId) {
  //              arrAgent.push(parseInt(sQid));
  //              vError = 'X';
  //          }
  //      }
				if (vError === 'X') {
					if (arrAsgn.length !== 0 && arrAgent.length !== 0) {
						// sap.m.MessageBox.error(arrAsgn + " doesn't contains Agent Please Assign the Agent." + '\n' + arrAgent +
						// 	" not able to Simulate, Please Select the Possible Qid's.");
							  this.openErrorDialog(arrAsgn + " doesn't contain Agent. Please assign the Agent.\n"
        + arrAgent + " not able to Simulate, Please select the possible QIDs.");
					} else if (arrAgent.length !== 0) {
						// sap.m.MessageBox.error(arrAgent + " not able to Post Please Select the Possible Qid's.");
							this.openErrorDialog(arrAgent + " not able to Simulate. Please select the possible QIDs.");
					} else if (arrAsgn.length !== 0) {
						// sap.m.MessageBox.error(arrAsgn + " doesn't contains Agent Please Assign the Agent.");
						 this.openErrorDialog(arrAsgn + " doesn't contain Agent. Please assign the Agent.");
					}
				} else {
					this.fn_PostValidation();
				}

			} else {
				this.openwarnDialog("Please Select Atleast one Queid");
			}

		},
		fn_PostValidation: function() {
			var obj = {};
			obj.Flag = Userbulk;
			obj.IvAction = 'STPVA';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			obj.NavHead = arrHead;
			obj.NavReturn = [];
			var that = this;
			oGlobalBusyDialog.open();
			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					oGlobalBusyDialog.close();
					var oLen = oData.NavReturn.results.length;
					var oCon = [];
					var oMes = [];
					if (oLen !== 0) {
						for (var i = 0; i < oLen; i++) {
							var oNum = oData.NavReturn.results[i].Message.split('**').length;
							var vQid = oData.NavReturn.results[i].Message.split('**')[0];
							for (var j = 1; j < oNum; j++) {
								oCon.push(oData.NavReturn.results[i].Message.split('**')[j]);
							}
							if (oCon.length !== 0) {
								oMes.push(oCon + ' Not in ' + parseInt(vQid) + ' Qid');
							}

							oCon = [];
							vQid = '';
						}

						if (oMes.length !== 0) {
							var vStr = '';
							for (var k = 0; k < oMes.length; k++) {

								vStr = vStr + oMes[k] + '\n';
							}
							sap.m.MessageBox.error(vStr);
						} else {
							// sap.m.MessageBox.warning("Do you want to Post this Qid's - " + arrQid + " ?", {
							// 	actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							// 	styleClass: "cl_message_box",
							// 	emphasizedAction: MessageBox.Action.YES,
							// 	onClose: function(sAction) {
							// 		if (sAction === "YES") {
							// 			that.fn_checkdupPost();
							// 		}
							// 	}
							// });
								var vMsg = "Do you want to Post this Qid's - " + arrQid + " ?";

					if (!that._oConfirmDialog) {
						that._oConfirmDialog = sap.ui.xmlfragment(
							that.getView().getId(),
							"FSC360NEW.fragment.ConfirmDialog",
							that
						);
						that.getView().addDependent(that._oConfirmDialog);
					}
					that._oConfirmDialog.open();
					sap.ui.core.Fragment.byId(that.getView().getId(), "confirmText").setText(vMsg);

					

						}
					}
				},
				error: function() {
					sap.m.MessageBox.error("Http Error");

				}
			});

		},
			onConfirmYesPress: function() {
					this.fn_checkdupPost();
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
				this._oConfirmDialog = null;
		

		
		},
		fn_checkdupPost: function() {
			var obj = {};
			obj.Flag = Userbulk;
			obj.IvAction = 'STSIM';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			obj.NavHead = arrHead;
			obj.NavReturn = [];
			var that = this;
			oGlobalBusyDialog.open();
			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					if (oData.NavReturn.results.length !== 0) {
						oGlobalBusyDialog.close();
						var oErr = [];
						var oSucc = [];
						var temp = {};
						if (oData.NavReturn.results) {
							var olen = oData.NavReturn.results.length;
							for (var i = 0; i < olen; i++) {
								if (oData.NavReturn.results[i].Type === 'E') {
									temp = {
										"Message": oData.NavReturn.results[i].Message
									};
									oErr.push(temp);
								} else if (oData.NavReturn.results[i].Type === 'S') {

									temp = {
										"Message": oData.NavReturn.results[i].Message
									};
									oSucc.push(temp);
								}
							}
						}

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oErr);
						that.getView().setModel(oModel, 'JMCONError');

						// var oModel = new sap.ui.model.json.JSONModel();
						// oModel.setData(oSucc);
						// that.getView().setModel(oModel, 'JMCONSucc');

						if (oErr.length !== 0) {
							that.fnCOnfirm_frag();
						} else {
							that.fn_POST();
						}

						// var olen = oData.NavReturn.results.length;
						// var oErr = [];
						// for (var i = 0; i < olen; i++) {
						// 	if (oData.NavReturn.results[i].Type === 'E') {
						// 		oErr.push(oData.NavReturn.results[i].Message);
						// 	}
						// }

						// if (oErr.length !== 0) {

						// 	var vStr = '';
						// 	for (var j = 0; j < oErr.length; j++) {
						// 		if (oErr[j].includes('**')) {
						// 			var arrMes = [];
						// 			var oQid = oErr[j].split('**')[0];
						// 			var olen = oErr[j].split('**').length;
						// 			for (var k = 1; k < olen; k++) {
						// 				arrMes.push(oErr[j].split('**')[k]);
						// 			}
						// 			if (arrMes.length !== 0) {
						// 				var oMess = [];
						// 				oMess.push(arrMes + ' in ' + oQid + ' Qid');
						// 				for (k = 0; k < oMess.length; k++) {
						// 					vStr = vStr + oMess[k] + '\n';
						// 				}
						// 			}
						// 		} else {
						// 			vStr = vStr + oErr[j] + '\n';
						// 		}

						// 	}
						// 	sap.m.MessageBox.error(vStr);
						// }

					} else {
						that.fn_POST();
					}

				},
				error: function() {
					sap.m.MessageBox.error("Http Error");

				}
			});
		},
		// fn_checkdup: function() {
		// 	var obj = {};
		// 	obj.Flag = Userbulk;
		// 	obj.IvAction = 'STSIM';
		// 	var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
		// 	obj.NavHead = arrHead;
		// 	obj.NavReturn = [];
		// 	var that = this;
		// 	oGlobalBusyDialog.open();
		// 	oModel.create('/DEEPHEADSet', obj, {
		// 		success: function(oData) {
		// 			oGlobalBusyDialog.close();
		// 			if (oData.NavReturn.results.length !== 0) {

		// 				var oErr = [];
		// 				var oSucc = [];
		// 				var temp = {};
		// 				if (oData.NavReturn.results) {
		// 					var olen = oData.NavReturn.results.length;
		// 					for (var i = 0; i < olen; i++) {
		// 						if (oData.NavReturn.results[i].Type === 'E') {
		// 							temp = {
		// 								"Message": oData.NavReturn.results[i].Message
		// 							};
		// 							oErr.push(temp);
		// 						} else if (oData.NavReturn.results[i].Type === 'S') {

		// 							temp = {
		// 								"Message": oData.NavReturn.results[i].Message
		// 							};
		// 							oSucc.push(temp);
		// 						}
		// 					}
		// 				}

		// 				var oModel = new sap.ui.model.json.JSONModel();
		// 				oModel.setData(oErr);
		// 				that.getView().setModel(oModel, 'JMCONError');

		// 				// var oModel = new sap.ui.model.json.JSONModel();
		// 				// oModel.setData(oSucc);
		// 				// that.getView().setModel(oModel, 'JMCONSucc');

		// 				if (oErr.length !== 0) {
		// 					that.fnCOnfirm_frag();
		// 				} else {
		// 					// that.fn_HOLD(); mano
		// 				}

		// 				// var olen = oData.NavReturn.results.length;
		// 				// var oErr = [];
		// 				// for (var i = 0; i < olen; i++) {
		// 				// 	if (oData.NavReturn.results[i].Type === 'E') {
		// 				// 		oErr.push(oData.NavReturn.results[i].Message);
		// 				// 	}
		// 				// }

		// 				// if (oErr.length !== 0) {

		// 				// 	var vStr = '';
		// 				// 	for (var j = 0; j < oErr.length; j++) {
		// 				// 		if (oErr[j].includes('**')) {
		// 				// 			var arrMes = [];
		// 				// 			var oQid = oErr[j].split('**')[0];
		// 				// 			var olen = oErr[j].split('**').length;
		// 				// 			for (var k = 1; k < olen; k++) {
		// 				// 				arrMes.push(oErr[j].split('**')[k]);
		// 				// 			}
		// 				// 			if (arrMes.length !== 0) {
		// 				// 				var oMess = [];
		// 				// 				oMess.push(arrMes + ' in ' + oQid + ' Qid');
		// 				// 				for (k = 0; k < oMess.length; k++) {
		// 				// 					vStr = vStr + oMess[k] + '\n';
		// 				// 				}
		// 				// 			}
		// 				// 		} else {
		// 				// 			vStr = vStr + oErr[j] + '\n';
		// 				// 		}

		// 				// 	}
		// 				// 	sap.m.MessageBox.error(vStr);
		// 				// }

		// 			} else {
		// 				// that.fn_HOLD(); mano
		// 			}

		// 		},
		// 		error: function() {
		// 			sap.m.MessageBox.error("Http Error");

		// 		}
		// 	});
		// },	
		fn_POST: function() {
			var obj = {};
			obj.Flag = Userbulk;

			// if (this.getView().byId('id_tab').getSelectedKey() === "Normal") {
				obj.IvAction = 'STPOST';
			// } else if (this.getView().byId('id_tab').getSelectedKey() === "Hold") {
			// 	obj.IvAction = 'STHOLDPOST';
			// }

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			obj.NavHead = arrHead;
			obj.NavReturn = [];
			var that = this;

			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					if (oData.NavReturn.length !== 0) {

						var oErr = [];
						var oSucc = [];
						var temp = {};
						if (oData.NavReturn.results) {
							var olen = oData.NavReturn.results.length;
							for (var i = 0; i < olen; i++) {
								if (oData.NavReturn.results[i].Type === 'E') {
									temp = {
										"Message": oData.NavReturn.results[i].Message
									};
									oErr.push(temp);
								} else if (oData.NavReturn.results[i].Type === 'S') {

									temp = {
										"Message": oData.NavReturn.results[i].Message
									};
									oSucc.push(temp);
								}
							}
						}

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oErr);
						that.getView().setModel(oModel, 'JMCONError');

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oSucc);
						that.getView().setModel(oModel, 'JMCONSucc');

						if (oSucc.length !== 0 || oErr.length !== 0) {
							that.fnCOnfirm_frag();
						}

						// var olen = oData.NavReturn.results.length;
						// var oErr = [];
						// var oSucc = [];
						// for (var i = 0; i < olen; i++) {
						// 	if (oData.NavReturn.results[i].Type === 'E') {
						// 		oErr.push(oData.NavReturn.results[i].Message);
						// 	} else if (oData.NavReturn.results[i].Type === 'S') {
						// 		oSucc.push(oData.NavReturn.results[i].Message);
						// 	}
						// }

						// if (oSucc.length !== 0) {
						// 	var vStr = '';
						// 	for (var j = 0; j < oSucc.length; j++) {
						// 		vStr = vStr + oSucc[j] + '\n';
						// 	}
						// 	sap.m.MessageBox.success(vStr);
						// 	that.fn_LoadData();
						// 	that.getView().byId("id_table_width").setSelectedIndex(0);
						// }

						// if (oErr.length !== 0) {

						// 	var vStr = '';
						// 	for (var j = 0; j < oErr.length; j++) {
						// 		if (oErr[j].includes('**')) {
						// 			var arrMes = [];
						// 			var oQid = oErr[j].split('**')[0];
						// 			var olen = oErr[j].split('**').length;
						// 			for (var k = 1; k < olen; k++) {
						// 				arrMes.push(oErr[j].split('**')[k]);
						// 			}
						// 			if (arrMes.length !== 0) {
						// 				var oMess = [];
						// 				oMess.push(arrMes + ' in ' + oQid + ' Qid');
						// 				for (k = 0; k < oMess.length; k++) {
						// 					vStr = vStr + oMess[k] + '\n';
						// 				}
						// 			}
						// 		} else {
						// 			vStr = vStr + oErr[j] + '\n';
						// 		}

						// 	}
						// 	sap.m.MessageBox.error(vStr);
						// }
					}

				},
				error: function() {
					sap.m.MessageBox.error("Http Error");

				}
			});
		},	
	

	});
});