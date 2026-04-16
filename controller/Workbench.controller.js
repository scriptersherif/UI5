sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/UploadCollectionParameter",
	"sap/m/UploadCollectionItem",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"FSC360NEW/model/formatter"
], function(Controller, MessageBox, MessageToast, Filter, FilterOperator, UploadCollectionParameter, UploadCollectionItem, Export,
	ExportTypeCSV, formatter
) {
	// "use strict";
	"use strict";
	var count = "0001";
	var oNavscreen = "";
	var oState = "";
	var count_war_sim = 0;
	var parameters = {}; // For store the Header Data
	var Balance_parameters = {};
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var vHsnID = ""; //HSN ID for getting the index of the list's item.
	var vHsnID_PO = ""; //HSN ID for getting the index of the list's item for PO.
	var vCossID = ""; //Cost Center ID for getting the index of the list's item.
	var vGlAccID = ""; //GL Acc ID for getting the index of the list's item.
	var vTaxID = ""; // Tax ID for getting the index of the list's item.
	var vPlantID = ""; // Plant ID for getting the index of the list's item.
	var vMaterialID = ""; // Material ID for getting the index of the list's item.
	var vTaxTabId = ""; // Tax ID for getting the index of the Tax Tab.
	var Vattach_xstring = []; //Added by Sakthi C on 28.08.2023 
	var Vattach_filename = []; //Added by Sakthi C on 28.08.2023 
	var Uploadarr = [];
	var UserType = "";
	var sUser = "";
	return Controller.extend("FSC360NEW.controller.Workbench", {
		formatter: formatter,

		onInit: function() {

			this.byId("id_glcCombo").setSelectedKey("Deb");
			this.flags = true;

			var oView = this.getView();
			if (oViewData && oViewData.appStateModel) {
				this.getView().setModel(oViewData.appStateModel, "appState");
			}
			this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(oView, function() {
				this._applyFlexGrow();
			}.bind(this));
			var oViewData = oView.getViewData();

			var oBasicDataTab = oView.byId("id_transaction_section");

			if (oBasicDataTab) {

				oBasicDataTab.addEventDelegate({
					onAfterRendering: function() {

						this._applyExpandedClasses();
						this._applyFlexGrow();
					}.bind(this)
				});
			}
			var oGLTab = oView.byId("id_glaccount_tab");
			if (oGLTab) {
				oGLTab.addEventDelegate({
					onAfterRendering: function() {
						this._applyExpandedClasses(); // Reapply if needed
						this._applyFlexGrow();
					}.bind(this)
				});
			}
			var oFooterModel = new sap.ui.model.json.JSONModel({
				showFooter: false
			});
			oView.setModel(oFooterModel, "footerControlModel");
			
			// oGlobalBusyDialog.open();

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRoutePatternMatched(this.fn_Clear, this);
			this._oRouter.attachRoutePatternMatched(this.fn_LoadF4, this);
			// var Vvendorbox = [];
			// Vvendorbox = this.byId("id_vendorc_box");
			// Vvendorbox.attachBrowserEvent("click", this.onVendorClick, this);

			var arr = [];
			var temp = {
				"VAT": false,
				"Invalid": true,
				"Original": false,
				"Priority": false,
				"Duplicate": false
			};
			arr.push("0", temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSselectcnt');
		
			this.getView().setModel(oModel, "jsPO");
			
			// tabbar mano
			var oModel = new sap.ui.model.json.JSONModel({
				selectedKey: "functionalLocation", // or "tax" if you want "Tax" tab selected initially
				poTabKey: "po"

			});
			this.getView().setModel(oModel, "JSState");
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("Workbench").attachPatternMatched(this._onRouteMatched, this);
			   this.sUser = "";
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");

			var oValidationModel = new sap.ui.model.json.JSONModel({
				InvnoState: "None",
				InvnoText: "",
				GstState: "None",
				GstText: "",
				AmtState: "None",
				AmtText: "",
				InvdtState: "None",
				InvdtText: "",

			});
			this.getView().setModel(oValidationModel, "JSValidation");

			var oVisibilityModel = new sap.ui.model.json.JSONModel({
				showSGL: false,
				showShortTxt: false
			});
			this.getView().setModel(oVisibilityModel, "JSVisibility");
			// error popup model added by Manosankari 
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");

			// error popup model added by Manosankari 
			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");
			  var oView = this.getView();
    var currentYear = new Date().getFullYear();
    var aYears = [];

    for (var i = 0; i < 30; i++) {
        aYears.push({ Year: (currentYear - i).toString() });
    }

    var oYearModel = new sap.ui.model.json.JSONModel({ results: aYears });
    oView.setModel(oYearModel, "JSYear");
		
		
		},
		onMainTabSelect: function(oEvent) {
			var sKey = oEvent.getParameter("key");
			this.getView().getModel("JSState").setProperty("/mainTabKey", sKey);
		},
		_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".formInputB1").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});
			$view.find(".formInputB01").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.minWidth = "50%";
				}
			});
			$view.find(".formInputBw").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

			$view.find(".cl_combo_transBar").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

			$view.find(".cl_combo_transBarw").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

		},

		onExpandPress: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext("amountsplit");
			var bExpanded = oCtx.getProperty("expanded");
			oCtx.getModel().setProperty(oCtx.getPath() + "/expanded", !bExpanded);

		},
		onExit: function() {
			if (this._sResizeHandlerId) {
				sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);
				this._sResizeHandlerId = null;
			}
		},
		_applyExpandedClasses: function() {
			var bIsCollapsed = this.getView().getModel("appState").getProperty("/pdfCollapsed");

			if (bIsCollapsed) {
				$(".formInput").addClass("formInput-expanded");
				$(".formInputgl").addClass("formInputgl-expanded");
				$(".cl_combo_trans").addClass("cl_combo_trans-expanded");
				$(".cl_saleAmountBox, .cl_taxAmountBox").addClass("cl_amountBox-expanded");
			} else {
				$(".formInput").removeClass("formInput-expanded");
				$(".formInputgl").removeClass("formInputgl-expanded");
				$(".cl_combo_trans").removeClass("cl_combo_trans-expanded");
				$(".cl_saleAmountBox, .cl_taxAmountBox").removeClass("cl_amountBox-expanded");
			}
		},
		_onRouteMatched: function(oEvent) {
			this.byId("id_glcCombo").setSelectedKey("Deb");
			var oView = this.getView();
			var oFooterModel = oView.getModel("footerControlModel");

			var oArgs = oEvent.getParameter("arguments") || {};

			var sAgentFromQueue = (oArgs.Agent || "").toLowerCase().trim();
			var sLoggedInUser = (oArgs.Username || "").toLowerCase().trim(); // From route
			var sStatus = (oArgs.Stats || "").toUpperCase().trim(); // Normalize status
            	var sUser = oArgs.UserType;
            	 var oGlobalModel = this.getOwnerComponent().getModel("GlobalData");
    if (!oGlobalModel) {
        oGlobalModel = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent().setModel(oGlobalModel, "GlobalData");
    }
    oGlobalModel.setProperty("/UserType", sUser);
			var sUser12 = sLoggedInUser.substring(0, 12);
			var sAgent12 = sAgentFromQueue.substring(0, 12);

			if (oFooterModel) {
				var bShowFooter = (sAgent12 === sUser12) && (sStatus !== "S41");
				oFooterModel.setProperty("/showFooter", bShowFooter);
			}
 var oPostButton = this.byId("id_postindex"); // Post button
    var oSimButton = this.byId("id_simulateindex"); // Simulate button (set this id in XML)

    if (sUser === "I") {
        if (oPostButton) oPostButton.setVisible(true);
        if (oSimButton) oSimButton.setVisible(false);
    } else {
        if (oPostButton) oPostButton.setVisible(false);
        if (oSimButton) oSimButton.setVisible(true);
    }
			// Old requirement - keep if needed
			var oViewData = oView.getViewData();
			if (oViewData && oViewData.appStateModel) {
				oView.setModel(oViewData.appStateModel, "appState");
			}

			this.onShowPdfPanel();
		},
		fnMakePo: function(oEvent) {

			var vQueid = Balance_parameters.Queid;
			if (vQueid) {
				if (!this.GRNfrag) {
					this.GRNfrag = sap.ui.xmlfragment(
						"FSC360NEW.fragment.GRN",
						this
					);
					this.getView().addDependent(this.GRNfrag);
				}
				sap.ui.getCore().byId("InGrn").setValue("");
				sap.ui.getCore().byId("InGrn").getValueState("None");
				this.GRNfrag.open();
			}
		},
		fnGrnClose: function(oEvent) {
			this.GRNfrag.close();
		},
		fnSubmitGRN: function(oEvent) {
			if (sap.ui.getCore().byId("InGrn").getValue()) {
				sap.ui.getCore().byId("InGrn").setValueState("None");
				var vGRN = sap.ui.getCore().byId("InGrn").getValue();
				this.fnMakeAsPO(vGRN);
			} else {
				sap.m.MessageToast.show("Enter GRN Number");
				sap.ui.getCore().byId("InGrn").setValueState("Error");
			}

		},
		fnMakeAsPO: function(vGRN) {
			oGlobalBusyDialog.open();
			var oEntity = {
				Qid: Balance_parameters.Queid, //QueueId
				Slno: vGRN, //GRN/SES 
				Flag: 'P'
			};
			var that = this;
			// var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_WB_SRV/");
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oEntity.NavItemTabDetails = [];
			oEntity.NavHead = [];
			oEntity.NavItemTabDetails = [];
			oEntity.NavTaxTab = [];
			oEntity.NavReturn = [];
			oModel.create('/DEEPHEADSet', oEntity, {
				success: function(odata, Response) {
					oGlobalBusyDialog.close();
					that.GRNfrag.close();

					var type = odata.NavReturn.results[0].Type;
					if (type === 'S') {
						// sap.m.MessageBox.success(odata.NavReturn.results[0].Message);
						var vSuccessMsg = odata.NavReturn.results[0].Message;
						that.openSuccessDialog(vSuccessMsg);

					} else if (type === 'E') {
						sap.m.MessageBox.error(odata.NavReturn.results[0].Message);
					}
				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					that.GRNfrag.close();
					// sap.m.MessageBox.error("Error");
					that.openErrorDialog(' Error');
				}
			});

		},

		fnchangeGrn: function(oEvent) {

			var vSelKey = oEvent.getSource().getSelectedKey();
			if (this.getView().getModel('JSInvdethead').getData()[0].Invtype == 'LOSO') {
				var vSES = this.getView().getModel('JSInvdet').getData()[0].Lfbnr;
			} else {
				var vGrn = this.getView().getModel('JSInvdet').getData()[0].Mblnr;
			}
			var vEbeln = this.getView().getModel('JSInvdet').getData()[0].Ebeln;

			if (vSelKey == "2") {
				this.getView().byId('id_InGrnChange').setValue(vEbeln);

			} else if (vSelKey == "1") {
				this.getView().byId('id_InGrnChange').setValue(vGrn);

			} else {
				this.getView().byId('id_InGrnChange').setValue(vSES);

			}
		},

		fnClick_ChangeGrnFrag: function() {
			if (!this.changeGRN) {
				this.changeGRN = sap.ui.xmlfragment(
					"FSC360NEW.fragment.Changegrn", this);
				this.getView().addDependent(this.changeGRN);
			}

			var GrnSelect = this.getView().byId('id_SelChangeGrn').getSelectedKey();
this.loadGRNList();
			if (GrnSelect === "2") {
				sap.ui.getCore().byId('Id_TbPO').setVisible(true);
				sap.ui.getCore().byId('Id_TbGoodsReceipt').setVisible(false);
					sap.ui.getCore().byId('id_GrnTab').setVisible(false);
				sap.ui.getCore().byId('Id_TbSES').setVisible(false);
				var oTable = sap.ui.getCore().byId("Id_TbPO");
				var oData = this.getView().getModel("JSPO").getData();
				var iLength = oData.length || 0;
				if (iLength > 10) iRowCount = 10; // max 10 rows
				if (iLength < 1) iRowCount = 1; // min 2 rows
				oTable.setVisibleRowCount(iLength);

			} else if (GrnSelect === "1") {

				sap.ui.getCore().byId('Id_TbPO').setVisible(false);
				sap.ui.getCore().byId('Id_TbGoodsReceipt').setVisible(true);
				sap.ui.getCore().byId('id_GrnTab').setVisible(true);
				sap.ui.getCore().byId('Id_TbSES').setVisible(false);
				var oTable = sap.ui.getCore().byId("Id_TbGoodsReceipt");
				var oData = this.getView().getModel("JSGoods").getData();
				var iLength = oData.length || 0;
				var iRowCount = iLength;
				if (iLength > 10) iRowCount = 10; // max 10 rows

				if (iLength < 1) iRowCount = 1; // min 2 rows

				oTable.setVisibleRowCount(iLength);

			} else if (GrnSelect === "3") {

				sap.ui.getCore().byId('Id_TbPO').setVisible(false);
				sap.ui.getCore().byId('Id_TbGoodsReceipt').setVisible(false);
					sap.ui.getCore().byId('id_GrnTab').setVisible(false);
				sap.ui.getCore().byId('Id_TbSES').setVisible(true);
				var oTable = sap.ui.getCore().byId("Id_TbSES");
				var oData = this.getView().getModel("JSses").getData();
				var iLength = oData.length || 0;
				var iRowCount = iLength;
				if (iLength > 10) iRowCount = 10; // max 10 rows
				if (iLength < 1) iRowCount = 1; // min 2 rows
				oTable.setVisibleRowCount(iLength);
			}

			this.changeGRN.open();

		},

		fnAddItemGoods: function(oEvent) {

			var oTabJsonGoodsData = [];
			var oTabJsonPO = [];
			oTabJsonPO = this.getView().getModel("JSPO").getData();
			oTabJsonPO = [];
			var Jdata = this.getView().getModel('JSInvdethead').getData();
			if (Jdata.Invtype != "LOSO") {
				var oTabJsonGoods = this.getView().getModel("JSGoods");
				oTabJsonGoodsData = oTabJsonGoods.getData();
				oTabJsonGoodsData.push({
					"Qid": '',
					"Item": '',
					"Matnr": '',
					"Prctr": '',
					"Hsncode": '',
					"Netpr": '0.000',
					"Mwskz": '',
					"Mblnr": '',
					"Ebeln": '',
					"Menge": '0.000',
					"Ebelp": '',
					"Mblpo": '',
					"Saknr": '',
					"Kostl": '',
					"Xblnr": '',
					"Frbnr": '',
					"Lsmng": '0.000',
					"Lsmeh": '',
					"Lfbnr": '',
					"Gjahr": ''

				});

				oTabJsonGoods.refresh();

				//Increase visible rows

				var oTable = sap.ui.getCore().byId("Id_TbGoodsReceipt");
				var iLength = oTabJsonGoodsData.length;
				var iRowCount = iLength;
				if (iLength > 10) iRowCount = 10; // max 10 rows
				if (iLength < 1) iRowCount = 1; // min 2 rows
				oTable.setVisibleRowCount(iLength);

			} else {
				sap.m.MessageToast.show("Not able to Add ,this is a Service  PO");

			}

		},

		fnDeleteItemGoods: function(oEvent) {

			var Jdata = this.getView().getModel('JSInvdethead').getData();
			if (Jdata.Invtype != "LOSO") {
				var oUserJson = this.getView().getModel("JSGoods");
				var oUserJsonData = this.getView().getModel("JSGoods").getData();
				var len = oUserJsonData.length;
				oUserJsonData.splice(len - 1);
				oUserJson.refresh();
				var oTable = sap.ui.getCore().byId("Id_TbGoodsReceipt");
				var iLength = oUserJsonData.length;

				// Set min 1 row, max 10 rows (adjust as needed)

				var iRowCount = Math.min(Math.max(iLength, 1), 10);
				oTable.setVisibleRowCount(iRowCount);
			} else {

				sap.m.MessageToast.show("Not able to Add ,this is a Service  PO");

			}

		},

		fnAddItemSES: function() {

			var oTabJsonSESData = [];
			var Jdata = this.getView().getModel('JSInvdethead').getData();
			if (Jdata.Invtype == "LOSO") {
				var oTabJsonSES = this.getView().getModel("JSses");
				oTabJsonSESData = oTabJsonSES.getData();
				oTabJsonSESData.push({
					"Qid": '',
					"Item": '',
					"Matnr": '',
					"Prctr": '',
					"Hsncode": '',
					"Netpr": '0.000',
					"Mwskz": '',
					"Mblnr": '',
					"Ebeln": '',
					"Menge": '0.000',
					"Ebelp": '',
					"Mblpo": '',
					"Saknr": '',
					"Kostl": '',
					"Xblnr": '',
					"Frbnr": '',
					"Lsmng": '0.000',
					"Lsmeh": '',
					"Lfbnr": '',
					"Gjahr": ''

				});

				oTabJsonSES.refresh();

				var oTable = sap.ui.getCore().byId("Id_TbSES");
				var iLength = oTabJsonGoodsData.length;
				var iRowCount = iLength;
				if (iLength > 10) iRowCount = 10; // max 10 rows

				if (iLength < 1) iRowCount = 1; // min 2 rows

				oTable.setVisibleRowCount(iLength);

			} else {

				sap.m.MessageToast.show("Not able to Add ,this is not a Service PO");

			}

		},

		fnDeleteItemSES: function(oEvent) {

			var Jdata = this.getView().getModel('JSInvdethead').getData();
			if (Jdata.Invtype == "LOSO") {
				var oUserJson = this.getView().getModel("JSses");
				var oUserJsonData = this.getView().getModel("JSses").getData();
				var len = oUserJsonData.length;
				oUserJsonData.splice(len - 1);
				oUserJson.refresh();
				var oTable = sap.ui.getCore().byId("Id_TbSES");
				var iLength = oUserJsonData.length;
				// Set min 1 row, max 10 rows (adjust as needed)
				var iRowCount = Math.min(Math.max(iLength, 1), 10);
				oTable.setVisibleRowCount(iRowCount);

			} else {

				sap.m.MessageToast.show("Not able to Add ,this is not a Servidce PO");

			}

		},

		fnAddItemPO: function(oEvent) {
			var oTabJsonPOData = [];
			var oTabJsonPO = this.getView().getModel("JSPO");
			oTabJsonPOData = oTabJsonPO.getData();
			oTabJsonPOData.push({
				"Qid": '',
				"Item": '',
				"Matnr": '',
				"Prctr": '',
				"Hsncode": '',
				"Netpr": '0.000',
				"Mwskz": '',
				"Mblnr": '',
				"Ebeln": '',
				"Menge": '0.000',
				"Ebelp": '',
				"Mblpo": '',
				"Saknr": '',
				"Kostl": '',
				"Xblnr": '',
				"Frbnr": '',
				"Lsmng": '0.000',
				"Lsmeh": '',
				"Lfbnr": '',
				"Gjahr": ''

			});

			oTabJsonPO.refresh();

			// Increase visible rows

			var oTable = sap.ui.getCore().byId("Id_TbPO");
			var iLength = oTabJsonPOData.length;
			var iRowCount = iLength;
			if (iLength > 10) iRowCount = 10; // max 10 rows
			if (iLength < 1) iRowCount = 1; // min 2 rows
			oTable.setVisibleRowCount(iLength);

		},

		fnDeleteItemPO: function(oEvent) {

			var oUserJson = this.getView().getModel("JSPO");
			var oUserJsonData = this.getView().getModel("JSPO").getData();
			var len = oUserJsonData.length;
			oUserJsonData.splice(len - 1);
			oUserJson.refresh();
			var oTable = sap.ui.getCore().byId("Id_TbPO");
			var iLength = oUserJsonData.length;
			if (iLength > 10) iRowCount = 10; // max 10 rows

			if (iLength < 1) iRowCount = 1; // min 2 rows

			oTable.setVisibleRowCount(iLength);

		},

		fn_additem: function() {
			var oTabData = [];
			var oTabModel = this.getView().getModel("JSInvdet");
			oTabData = oTabModel.getData();
			var count = oTabModel.getData().length;
			count++;
			// var item = "Item " + count;
			var item = count;
			oTabData.push({
				"Qid": parameters[0].Qid,
				"Item": count.toString(),
				"Matnr": '',
				"Prctr": '',
				"Hsncode": '',
				"Netpr": '0.000',
				"Mwskz": '',
				"Mblnr": '',
				"Ebeln": '',
				"Menge": '0.000',
				"Ebelp": '',
				"Mblpo": '',
				"Saknr": '',
				"Kostl": '',
				"Xblnr": '',
				"Frbnr": '',
				"Lsmng": '0.000',
				"Lsmeh": '',
				"Lfbnr": '',
				"Gjahr": ''
			});
			var jmod = new sap.ui.model.json.JSONModel();
			jmod.setData(oTabData);
			this.getView().setModel(jmod, 'JSInvdet');
			/*  this.fnSetItemNo(oTabModel, oTabData); */

			oTabModel.refresh();
			var that = this;
			setTimeout(function() {
				that._applyFlexGrow();
			}, 0); // run after DOM updates
		},

		onHidePdfPanel: function() {
			var oPdfPanel = this.byId("pdfPanel");
			var oRightPanel = this.byId("rightPanel");
			var oBtnShowPdf = this.byId("btnShowPdf");
			this.getView().getModel("appState").setProperty("/pdfCollapsed", true);
			// Animate collapse
			oPdfPanel.addStyleClass("cl_leftPanel1--collapsed");
			oRightPanel.setWidth("95%");
			$(".formInput").addClass("formInput-expanded");
			$(".formInputgl").addClass("formInputgl-expanded");
			$(".cl_combo_trans").addClass("cl_combo_trans-expanded");

			$(".cl_saleAmountBox, .cl_taxAmountBox").addClass("cl_amountBox-expanded");
			$("body").addClass("cl_pdfCollapsed");
			this._isPdfHidden = true;
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
			// Show the expand button after animation completes (300ms)
			setTimeout(function() {
				oBtnShowPdf.setVisible(true);
			}, 300);
		},
		onShowPdfPanel: function() {
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
			var oPdfPanel = this.byId("pdfPanel");
			var oRightPanel = this.byId("rightPanel");
			var oBtnShowPdf = this.byId("btnShowPdf");
			this.getView().getModel("appState").setProperty("/pdfCollapsed", false);
			// Hide the expand button instantly
			oBtnShowPdf.setVisible(false);
			$(".formInput").removeClass("formInput-expanded");
			$(".formInputgl").removeClass("formInputgl-expanded");
			$(".cl_combo_trans").removeClass("cl_combo_trans-expanded");
			$(".cl_saleAmountBox, .cl_taxAmountBox").removeClass("cl_amountBox-expanded");

			$("body").removeClass("cl_pdfCollapsed");

			setTimeout(function() {
				oPdfPanel.removeStyleClass("cl_leftPanel1--collapsed");
				oRightPanel.setWidth("70%");
			}, 100); // 50ms delay, adjust if needed
		},

		fn_nav_to_fulfil: function() {
			this.fn_Clear(); // Optional: reset form or data
var sUserType = this.getOwnerComponent().getModel("GlobalData").getProperty("/UserType");

			this.oRouter = this.getOwnerComponent().getRouter();

			this.oRouter.navTo('Fulfilment', {
				btnstat: sUserType
				
				
			});
			this.getView().byId("id_scrll").setVisible(false);
		},

		onExpand: function() {
			var oView = this.getView();
			var oTabBar = this.byId("functionalLocationTab");
			var $tabBarDom = oTabBar.$(); // jQuery DOM

			// Find only the outer tab bar header
			var $tabHeader = $tabBarDom.find(".sapMITBHead").first();

			if ($tabHeader.is(":visible")) {
				$tabHeader.hide(); // Hide the outer tab bar menu
				oTabBar.setSelectedKey("functionalLocation");
				$tabBarDom.addClass("no_bord");
			} else {
				$tabHeader.show(); // Show it again on toggle
				$tabBarDom.removeClass("no_bord");
			}

			// Toggle visibility of sections
			var oSection = oView.byId("id_vendorDetailsSection");
			var oHeader = oView.byId("id_transaction_section");
			var bVisible = oSection.getVisible();
			//for list
			var oList = oView.byId("id_list_invdethead");
			var bVisible1 = oList.getVisible();
			oList.setVisible(!bVisible1);

			oSection.setVisible(!bVisible);
			oHeader.setVisible(!bVisible);
		},

		onCollapse_Poref_press: function(oEvent) {
			var oBtn = oEvent.getSource();
			var oView = this.getView();
			var oForm = oView.byId("id_list_poref");
			var oButtonBox = oView.byId("id_select_box");
			var oTable = oView.byId("id_table_poref");
			var round = oView.byId("round1");

			if (oForm.getVisible()) {

				// Switch to table view
				oForm.setVisible(false);
				oTable.setVisible(true);
				oButtonBox.setVisible(true);
				oTable.invalidate(); // Ensure table renders correctly

			} else {
				oButtonBox.setVisible(false);
				// Switch to form view
				oTable.setVisible(false);
				oForm.setVisible(true);

			}
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
		},

		onCollapsePress: function(oEvent) {

			var oBtn = oEvent.getSource();
			var oView = this.getView();
			var oForm = oView.byId("id_list_invdet");
			var oTable = oView.byId("id_gltable");
			var round = oView.byId("round");
			var wrapper = oView.byId("id_form_wrapper");

			if (oForm.getVisible()) {
				// Switch to table view
				oForm.setVisible(false);
				oTable.setVisible(true);
				wrapper.setWidth("100%");
				round.setVisible(false);
				oTable.invalidate(); // Ensure table renders correctly

				// Update button to 'Expand'
			} else {
				// Switch to form view
				oTable.setVisible(false);
				oForm.setVisible(true);
				round.setVisible(true);
				wrapper.setWidth("97%");
			}
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
		},
		// onVendorClick: function(oEvent) {
		// 	var vLifnr = this.getView().getModel('JSVendorDet').getData().Lifnr;
		// 	var vUrl = 'http://' + window.location.host + '/sap/bc/gui/sap/its/webgui?~transaction=*FBL1N+' + vLifnr;
		// 	sap.m.URLHelper.redirect(
		// 		vUrl, true);
		// },
		fnTrnsidselect: function(oEvent) {
			// Get selected key from ComboBox
			var sTransType = oEvent.getSource().getSelectedKey();
			this._sSelectedTransType = sTransType;
			this.fn_LoadF4()
		},

		formatDateTime: function(sDate) {
			if (!sDate) {
				return "";
			}
			var oDate = new Date(sDate);
			if (isNaN(oDate.getTime())) {
				return ""; // Invalid date
			}

			// Pad helper
			var pad = function(n) {
				return n < 10 ? "0" + n : n;
			};

			var day = pad(oDate.getDate());
			var month = pad(oDate.getMonth() + 1); // numeric month
			var year = oDate.getFullYear();

			var hours = oDate.getHours();
			var minutes = pad(oDate.getMinutes());
			var seconds = pad(oDate.getSeconds());

			var ampm = hours >= 12 ? "PM" : "AM";
			hours = hours % 12;
			hours = hours ? hours : 12; // 0 → 12
			hours = pad(hours);

			return day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
		},
		fn_LoadF4: function(oEvent) {
			this.flags = true;
			var vName = oEvent.getParameter("name");
			if (vName === "Workbench") {
				this.getView().byId('functionalLocationTab').setSelectedKey('functionalLocation');
				this.getView().byId('id_TabDetail').setSelectedKey("functionalLocation");
				// this.getView().byId('id_TabDetail').setSelectedKey('functionalLocationPo');
				var oArguments = oEvent.getParameter("arguments");
				var QueueID = oArguments.QueueID;
				var Bukrs = oArguments.Bukrs;
				 this.sBukrs = Bukrs;  
				var Stats = oArguments.Stats;
				var oQidModel = new sap.ui.model.json.JSONModel({
					Qid: QueueID
				});
				this.getView().setModel(oQidModel, "qidModel");
				oNavscreen = oArguments.NavScreen;
				oState = oArguments.Type;
				Balance_parameters.UserType = oArguments.UserType;
				Balance_parameters.Queid = oArguments.QueueID;
				var Flag = oArguments.Flag;
				if (Flag === 'E') {

					this.fn_edit();

				}
				this._bFirstValidationDone = false;
				this._oCachedValidation = null;
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var that = this;
				oGlobalBusyDialog.open();
				oModel.read("/DEEPHEADSet", {
					filters: [
						new Filter("Qid", FilterOperator.EQ, QueueID),
						new Filter("Bukrs", FilterOperator.EQ, Bukrs),
						new Filter("Stats", FilterOperator.EQ, Stats)
					],
					urlParameters: {
						$expand: "NavImgList,NavDebit,NavReldoc,NavBusPlace,NavGoodsType,NavChangeGRN,NavHead,NavHeadSt,NavDomain,NavGetItemValues,NavItemTabDetails,NavTransHis,NavCurrency,NavLifnr,NavHsnSrch,NavGetTax,NavSpecialGL,NavGLSrch,NavCost,NavPayTerm,NavPayBlock,NavWithHoldTax,NavTaxTab,NavSection,NavChecklist,NavTriggerType,NavRevReasons,NavVenclr"
					},
					success: function(oData, oResponse) {
						oGlobalBusyDialog.close();
						UserType = oData.results[0].Flag;
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0]);
						that.getView().setModel(oModel, 'JSusername');
						var aData = [];

						if (oData.results && oData.results.length > 0 &&
							oData.results[0].NavHead && oData.results[0].NavHead.results) {
							aData = oData.results[0].NavHead.results;
							var iTranstype = parseInt(aData[0].Transtype, 10);
						} else {
						
						}

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(aData);
						that.getView().setModel(oModel, 'JScan');

					
						Balance_parameters.Type = oData.results[0].Flag;
						var vTransLen = oData.results[0].NavTransHis.results.length;

						if (vTransLen === 0) {
							var text = "No Transaction History Found";
							that.getView().byId('id_list').setNoDataText(text);
						} else {
							var arr_2 = [];

							var oLastIndex = oData.results[0].NavTransHis.results.length - 1;
							for (var j = 0; j < oData.results[0].NavTransHis.results.length; j++) {
								if (j === oLastIndex) {
									var temp = {
										"Tdformat": oData.results[0].NavTransHis.results[j].Tdformat,
										"Tdline": oData.results[0].NavTransHis.results[j].Tdline,
										"VBoxClr": false,
										"VBoxWhite": true,
										"Class": 3
									};
								} else if (j === 0) {
									var temp = {
										"Tdformat": oData.results[0].NavTransHis.results[j].Tdformat,
										"Tdline": oData.results[0].NavTransHis.results[j].Tdline,
										"VBoxClr": true,
										"VBoxWhite": false,
										"Class": 2
									};
								} else {
									var temp = {
										"Tdformat": oData.results[0].NavTransHis.results[j].Tdformat,
										"Tdline": oData.results[0].NavTransHis.results[j].Tdline,
										"VBoxClr": true,
										"VBoxWhite": false,
										"Class": 1
									};
								}

								arr_2.push(temp);
							}

							var oCommentJSON = new sap.ui.model.json.JSONModel(arr_2);
							that.getView().setModel(oCommentJSON, "oComment");
						}

						that.getView().byId("id_SelTrans").setSelectedKey(oData.results[0].NavHead.results[0].Transtype);

						var oModel = new sap.ui.model.json.JSONModel();

						var aResults = oData.results[0].NavGetItemValues.results;

						if (iTranstype >= 4 && iTranstype <= 6) {
							// Non-PO case → set actual backend data
							oModel.setData(aResults);
						} else {
							// PO case → create empty structure using first object
							if (aResults && aResults.length > 0) {
								// Clone first object structure
								var oEmptyItem = JSON.parse(JSON.stringify(aResults[0]));

								// List of fields to clear
								var aFieldsToClear = [
									"Saknr", // GL Account
									"Kostl", // Cost Center
									"Netpr", // Amount
									"Itemtxt", // Item Text
									"Prctr", // Profit Center
									"Hsncode", // HSN Code
									"Hsndesc", // HSN Description
									"Mwskz", // Tax Code
									"Intorder" // Internal Order
								];

								// Clear only the selected fields
								aFieldsToClear.forEach(function(key) {
									if (key === "Netpr") {
										oEmptyItem[key] = "0"; // Amount should be "0", not empty
									} else {
										oEmptyItem[key] = ""; // Text fields can be empty
									}
								});
								oModel.setData([oEmptyItem]);
							} else {
								// If no structure at all, use empty array
								oModel.setData([]);
							}
						}

						// Finally, bind to the view
						that.getView().setModel(oModel, 'JSInvdet');
						var oTable = that.byId("id_downpayment_table");

						// Get the latest data from the model
						var aItems = that.getView().getModel('JSInvdet').getData();
						var iRowCount = aItems.length;

						// Optional min/max limits
						if (iRowCount > 10) iRowCount = 10; // max 10 rows
						if (iRowCount < 1) iRowCount = 1; // min 2 rows

						oTable.setVisibleRowCount(iRowCount);

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavItemTabDetails.results);
						that.getView().setModel(oModel, 'JSPORefDet');

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavGoodsType.results);
						that.getView().setModel(oModel, 'JSGoodsType');

						//Added by Lokesh R on 15.10.2025 - Start
						if (oData.results[0].NavHead.results[0].Invtype === 'LOPO' && oData.results[0].NavHead.results[0].Scanfrom !== 'AB') {
							that.getView().byId("id_goodstype").setSelectedKey("1")
						} else if (oData.results[0].NavHead.results[0].Scanfrom === 'AB') {
							that.getView().byId("id_goodstype").setSelectedKey("2")
						}
						//Added by Lokesh R on 15.10.2025 - End

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavImgList.results);
						that.getView().setModel(oModel, 'JSImgList');

						if (oData.results[0].NavItemTabDetails.results.length === 0) {
							var arr = [];
							var temp = {
								"Item": '1',
								"Material": '',
								// "Prctr": ' ',
								// "Hsncode": '',
								"Amount": '0.000',
								"Taxcode": ''
							};
							arr.push(temp);
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(arr);
							that.getView().setModel(oModel, 'JSPORefDet');
						}
						// ---------- Add dynamic visibleRowCount here ----------
						var oTable = that.byId("id_table_poref");

						// Get the latest data from the model
						var aItems = that.getView().getModel('JSPORefDet').getData();
						var iRowCount = aItems.length;

						// Optional min/max limits
						if (iRowCount > 10) iRowCount = 10; // max 10 rows
						if (iRowCount < 1) iRowCount = 1; // min 2 rows

						oTable.setVisibleRowCount(iRowCount);
						if (oData.results[0].NavGetItemValues.results.length === 0) {
							var arr = [];
							var temp = {
								"Qid": QueueID,
								"Item": '1',
								"Matnr": '',
								"Prctr": '',
								"Hsncode": '',
								"Netpr": '0.000',
								"Mwskz": '',
								"Mblnr": '',
								"Ebeln": '',
								"Menge": '0.000',
								"Ebelp": '',
								"Mblpo": '',
								"Saknr": '',
								"Kostl": '',
								"Xblnr": '',
								"Frbnr": '',
								"Lsmng": '0.000',
								"Lsmeh": '',
								"Lfbnr": '',
								"Gjahr": ''
							};
							arr.push(temp);
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(arr);
							that.getView().setModel(oModel, 'JSInvdet');
						}
						var oTable = that.byId("id_gltable");
						var aItems = that.getView().getModel('JSInvdet').getData();
						var iRowCount = aItems.length;

						// optional min/max limits
						if (iRowCount > 3) iRowCount = 3; // max 10 rows
						if (iRowCount < 1) iRowCount = 1; // min 2 rows

						oTable.setVisibleRowCount(iRowCount);

						var oModelPO = new sap.ui.model.json.JSONModel();
						oModelPO.setData(oData.results[0].NavGetItemValues.results);
						that.getView().setModel(oModelPO, 'JSPO');

						if (oData.results[0].NavGetItemValues.results.length !== 0) {

							if (oData.results[0].NavHead.results[0].Invtype == 'LOSO')

							{
								var vSES = oData.results[0].NavGetItemValues.results[0].Lfbnr;
								var oTabJsonPOGrn = new sap.ui.model.json.JSONModel();
								oTabJsonPOGrn.setData(oData.results[0].NavGetItemValues.results);
								oTabJsonPOGrn.setSizeLimit(1000);
								that.getView().setModel(oTabJsonPOGrn, "JSses");
								var oTabJsonPOGrn1 = new sap.ui.model.json.JSONModel();
								oTabJsonPOGrn1.setData([]);
								oTabJsonPOGrn1.setSizeLimit(1000);
								that.getView().setModel(oTabJsonPOGrn1, "JSGoods");
								that.getView().byId('id_InGrnChange').setValue(vSES);
								that.getView().byId('id_SelChangeGrn').setSelectedKey("3");

							} else {

								var oTabJsonPOGrn = new sap.ui.model.json.JSONModel();
								oTabJsonPOGrn.setData(oData.results[0].NavGetItemValues.results);
								oTabJsonPOGrn.setSizeLimit(1000);
								that.getView().setModel(oTabJsonPOGrn, "JSGoods");
								var oTabJsonPOGrn1 = new sap.ui.model.json.JSONModel();
								oTabJsonPOGrn1.setData([]);
								oTabJsonPOGrn1.setSizeLimit(1000);
								that.getView().setModel(oTabJsonPOGrn1, "JSses");
								var vGrn = oData.results[0].NavGetItemValues.results[0].Mblnr;
								if (vGrn !== '') {
									that.getView().byId('id_InGrnChange').setValue(vGrn);
									that.getView().byId('id_SelChangeGrn').setSelectedKey("1");
								} else {
									var vPO = oData.results[0].NavGetItemValues.results[0].Ebeln;
									that.getView().byId('id_InGrnChange').setValue(vPO);
									that.getView().byId('id_SelChangeGrn').setSelectedKey("2");
								}

							}
						}

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavHead.results);
						that.getView().setModel(oModel, 'JSInvdethead');

						if (oData.results[0].NavHead.results[0].Postingdate === null) {
							var vData = that.getView().getModel('JSInvdethead').getData();
							vData[0].Postingdate = new Date();
							that.getView().getModel('JSInvdethead').refresh();
						}

						parameters = oData.results[0].NavHead.results;
						if (parameters.length != 0) {
							that.getView().byId("id_payment_term").setValue(parameters[0].Zterm);
						}

						var vGSTPart = that.getView().byId("id_GST_Partner").getValue();

						if (oData.results[0].Land1) {

							if ((oData.results[0].NavHead.results[0].Lifnr !== "") && (oData.results[0].Land1 === "IN") && (vGSTPart === "")) {
								var vLifnr = oData.results[0].NavHead.results[0].Lifnr;
								// that.getView().byId("id_GST_Partner").setValue( oData.results[0].NavHead.results[0].Lifnr);

								var arr = [{

									"value": vLifnr

								}];

								var oModel = new sap.ui.model.json.JSONModel();
								oModel.setData(arr);
								that.getView().setModel(oModel, 'JSGST');
							}
						}

						if (parameters[0].Invtype === "FIIN" && parameters[0].Stats === "S05") {
							// ==========================================================================
							var oModel = that.getOwnerComponent().getModel("jsTab");
							var arr = [{

								"Key": true,
								"Width": "11%",
								"Align": "End",
								"PO": true

							}];
							oModel.setData(arr);
							that.getView().setModel(oModel, 'jsTab');
							// ==========================================================================
						} else if (parameters[0].Invtype != "FIIN" && parameters[0].Stats != "S05") {
							// ==========================================================================
							var oModel = that.getOwnerComponent().getModel("jsTab");
							var arr = [{

								"Key": false,
								"Width": "5%",
								"Align": "Center",
								"PO": true

							}];
							oModel.setData(arr);
							that.getView().setModel(oModel, 'jsTab');
							// ==========================================================================
						}

						// Declaring Variable's for Balance Calculation
						Balance_parameters.Head_Amount = that.getView().getModel("JSInvdethead").getData()[0].Ntamt;
						Balance_parameters.Item_Amount = 0;

						var head_data = oData.results[0].NavHead.results;
						if (head_data[0].Transtype <= 3 || head_data[0].Transtype == 8) {
							that.fn_Item_Amount_Initial_PO();
						} else if (head_data[0].Transtype === 4 | head_data[0].Transtype <= 5 | head_data[0].Transtype == 8) {
							that.fn_Item_Amount_Initial_NonPO();
						}

						that.fn_SetInputField();

						that.getView().byId("id_vendor").setText(oData.results[0].NavHead.results[0].Name1);
						var vOn = true;
						var Switch = "Invalid";
						that.fnsegmentLiveChange(vOn, Switch);
						Switch = "Priority";
						that.fnsegmentLiveChange(vOn, Switch);
						if (oData.results[0].NavHead.results[0].OrgnlCopy !== '') {
							var Switch = "Original";
							that.fnsegmentLiveChange(vOn, Switch);
						}
						if (oData.results[0].NavHead.results[0].GstMatch !== '') {
							var Switch = "VAT";
							that.fnsegmentLiveChange(vOn, Switch);
						}

						if (oData.results[0].NavHead.results[0].SuspDupli == '') {
							Switch = "Duplicate";
							that.fnsegmentLiveChange(vOn, Switch);
						}

						// To Get Debit/Credit Indicator for Material Tab
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavDebit.results);
						that.getView().setModel(oModel, 'JSDebit');

						// To Get TransType
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavDomain.results);
						that.getView().setModel(oModel, 'JSTransType');

						//To get the workflow triger types 
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavTriggerType.results);
						that.getView().setModel(oModel, 'JSTriggerType');

						//To get the reversal reasons
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavRevReasons.results);
						that.getView().setModel(oModel, 'JSRevReasons');

						// To Get Currency
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setSizeLimit(3000);
						oModel.setData(oData.results[0].NavCurrency.results);
						that.getView().setModel(oModel, 'JSCurrency');

						// To Get Vendor
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavLifnr.results);
						that.getView().setModel(oModel, 'JSVendor');

						// To Set the Vendor Name in WB Screen
						var vendor = that.getView().getModel('JSVendor').getData();
					

						// To Get HSN Code

						var oHSNModel = new sap.ui.model.json.JSONModel(oData.results[0].NavHsnSrch.results);
						that.getView().setModel(oHSNModel, "JSHSN");

						// To Get Tax Code
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavGetTax.results);
						that.getView().setModel(oModel, 'JSTaxCode');

						// To Get SGL Indicator

						var aSGL = oData.results[0].NavSpecialGL.results || [];

						// push "A" manually
						aSGL.push({
							Koart: "A",
							Merkp: "Special Indicator A"
						});

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(aSGL);
						that.getView().setModel(oModel, "JSSGL");

						// To Get GL Account
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavGLSrch.results);
						that.getView().setModel(oModel, 'JSGLAccount');

						// To Get Check List Values
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavChecklist.results);
						that.getView().setModel(oModel, 'JSChecklist');

						// To Get Cost Center
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavCost.results);
						that.getView().setModel(oModel, 'JSCostCenter');

						// To Get Payment Terms

						var oPayTermModel = new sap.ui.model.json.JSONModel(oData.results[0].NavPayTerm.results);
						that.getView().setModel(oPayTermModel, "JSPayTerm");

						// Bind Payment Term ComboBox
						that.byId("id_payment_term").bindItems({
							path: "JSPayTerm>/",
							template: new sap.ui.core.Item({
								key: "{JSPayTerm>Zterm}", // code only
								text: {
									parts: [{
										path: "JSPayTerm>Zterm"
									}, {
										path: "JSPayTerm>Vtext"
									}],
									formatter: function(zterm, desc) {
										return zterm + " - " + desc; // e.g. "Z001 - Immediate Payment"
									}
								}
							})
						});

						// To Get Payment Block
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavPayBlock.results);
						that.getView().setModel(oModel, 'JSPayBlock');

						// To Get Business Place
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavBusPlace.results);
						that.getView().setModel(oModel, 'JSBusPlace');

						// To Get Section Code
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavSection.results);
						that.getView().setModel(oModel, 'JSSectionCode');

						// To Get Tax Tab Details
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavTaxTab.results);
						that.getView().setModel(oModel, 'JSTaxTab');
						var oModel = that.getView().getModel("JSTaxTab");
						if (oModel) {
							// Get the array of rows from the model
							var aRows = oModel.getProperty("/"); // "/" points to the root array of the model
							var iRowCount = Array.isArray(aRows) ? aRows.length : 0;

							// Find your table by ID
							var oTable = that.getView().byId("id_taxtabtable");
							if (oTable) {
								// Minimum 1 row, but can grow based on data
								oTable.setVisibleRowCount(iRowCount > 0 ? iRowCount : 1);

								// Optional: force rerender if table doesn't immediately show rows
								oTable.rerender();
							}
						}
						// To Get With Hold Tab Details
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavWithHoldTax.results);
			
						that.getView().setModel(oModel, 'JSWithHold');
					
						// CREATE BACKUP


						var aBackup = JSON.parse(JSON.stringify(oData.results[0].NavWithHoldTax.results));
var oBackup = new sap.ui.model.json.JSONModel(aBackup);
that.getView().setModel(oBackup, "JSBackup");

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavWithHoldTax.results);
						that.getView().setModel(oModel, 'WHJSON');	
					

						var iRowCount = oData.results[0].NavWithHoldTax.results.length;

						// Find the table by its ID (replace 'idWithHoldTable' with your actual table ID)
						var oTable = that.getView().byId("idWithHoldTable");
						if (oTable) {
							// Set visible row count based on data
							oTable.setVisibleRowCount(iRowCount > 0 ? iRowCount : 1);
						}

						// To Get Change GRN Details
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavChangeGRN.results);
						that.getView().setModel(oModel, 'JSChangeGRN');

						//for Material Tab
						var Matarr = [];
							
						var Matval = {
							"Matnr": '',
							"Item": '1',
							"Plnt": '',
							"Vprsv": '',
							"Shkzg": 'S',
							"Zuumb": '0.000',
							"Menge": '0.000',
							"Meins": '',
							"Mwskz": '',
							"Xskrl": false
						};
						Matarr.push(Matval);
						var matoModel = new sap.ui.model.json.JSONModel();
						matoModel.setData(Matarr);
						that.getView().setModel(matoModel, 'JSMatdet');

						that.getView().byId("id_scrll").setVisible(false);
						that.fn_pdf();
						that.fn_paymentTabdet();
						that.fn_amount_split();
						that.fn_withholding();
 

						// For Related document Tab
						var vArr = [];
						vArr = oData.results[0].NavReldoc.results;

						if (parameters[0].Transtype >= 4 && parameters[0].Transtype <= 6) {

							var NPOrel = [];
							var NpocHild = [];
							for (var r = 0; r < vArr.length; r++) {
								var Invoices = {

									"id": vArr[r].Belnr,
									"lane": "2",
									"title": "Invoices",
									"titleAbbreviation": "GRN No",
									"children": [],
									"state": "Positive",
									"stateText": vArr[r].Belnr,
									"focused": true,
									"texts": [
										vArr[r].Gjahr, vArr[r].Lifnr
									]

								};
								NPOrel.push(Invoices);
								NpocHild.push(vArr[r].Belnr);
							}

							var vLifnrarr = {

								"id": oData.results[0].NavHead.results[0].Lifnr,
								"lane": "0",
								"title": "Lifnr",
								"titleAbbreviation": "Vendor",
								"children": NpocHild,
								"state": "Positive",
								"stateText": oData.results[0].NavHead.results[0].Lifnr,
								"focused": true,
								"texts": [

								]

							};
							NPOrel.push(vLifnrarr);

							var oTabJsonProtree = new sap.ui.model.json.JSONModel();
							oTabJsonProtree.setData(NPOrel);
							oTabJsonProtree.setSizeLimit(1000);
							that.getView().setModel(oTabJsonProtree, "Jmtree");
						} else if ((parameters[0].Transtype >= 1 && parameters[0].Transtype <= 3) || parameters[0].Transtype == 8) {

							var vTree = [];
							var vInv = [];
							var vfinal = [];
							var vGrn1;

							var Grnchild = [];
							if (oData.results[0].NavReldoc.results.length > 0) {
								var vebeln = oData.results[0].NavReldoc.results[0].Ebeln;

							}

							for (var r = 0; r < vArr.length; r++) {

								if (vebeln == vArr[r].Ebeln && vArr[r].Bewtp == "E") {

									vfinal.push(vArr[r].Lfbnr);

								} else if (vebeln == vArr[r].Ebeln && vArr[r].Bewtp == "Q") {

								} else if (vebeln == vArr[r].Ebeln && vArr[r].Bewtp == "T") {

								} else {

									var Temp = {

										"id": vebeln,
										"lane": "0",
										"title": "PO Number",
										"titleAbbreviation": "PO No.",
										"children": vfinal,
										"state": "Positive",
										"stateText": vebeln,
										"focused": true,
										"texts": [

										]

									};
									vfinal = [];
									vebeln = vArr[r].Ebeln;
									vTree.push(Temp);
								}

								if (vArr[r].Bewtp == "E") {
									vGrn1 = vArr[r].Lfbnr;
									for (var x = 0; x < vArr.length; x++) {
										if (vGrn1 == vArr[x].Lfbnr && vArr[x].Bewtp == "Q") {
											Grnchild.push(vArr[x].Belnr);
										} else if (vGrn1 == vArr[x].Lfbnr && vArr[x].Bewtp == "T") {
											Grnchild.push(vArr[x].Belnr);
										}
									}

									var grn = {

										"id": vArr[r].Lfbnr,
										"lane": "1",
										"title": "GRN Number",
										"titleAbbreviation": "GRN No.",
										"children": Grnchild,
										"state": vArr[r].Shkzg,
										"stateText": vArr[r].Lfbnr,
										"focused": true,
										"texts": [
											vArr[r].Gjahr, vArr[r].Lifnr
										]

									};
									vTree.push(grn);
								} else if (vArr[r].Bewtp == "Q") {

									var vInvoice = {

										"id": vArr[r].Belnr,
										"lane": "2",
										"title": "Document Number",
										"titleAbbreviation": "Doc No.",
										"children": [],
										"state": vArr[r].Shkzg,
										"stateText": vArr[r].Belnr,
										"focused": true,
										"texts": [
											vArr[r].Gjahr, vArr[r].Lifnr
										]

									};
									vTree.push(vInvoice);
								} else if (vArr[r].Bewtp == "T") {
									var vInvoice = {

										"id": vArr[r].Belnr,
										"lane": "2",
										"title": "Parked Document Number",
										"titleAbbreviation": "Parked Doc No.",
										"children": [],
										"state": vArr[r].Shkzg,
										"stateText": vArr[r].Belnr,
										"focused": true,
										"texts": [
											vArr[r].Gjahr, vArr[r].Lifnr
										]

									};
									vTree.push(vInvoice);
								}

							}
							var Temp = {

								"id": vebeln,
								"lane": "0",
								"title": "PO Number",
								"titleAbbreviation": "PO No.",
								"children": vfinal,
								"state": "Positive",
								"stateText": vebeln,
								"focused": true,
								"texts": [

								]

							};
							vTree.push(Temp);

							var oTabJsonTree = new sap.ui.model.json.JSONModel();
							oTabJsonTree.setData(vTree);
							that.getView().setModel(oTabJsonTree, "Jmtree");
						}

						var aJmTreeData = that.getView().getModel("Jmtree").getData();

						var laneStates = {
							"0": false,
							"1": false,
							"2": false
						};

						var formatter = sap.ui.require("FSC360NEW/model/formatter");

						aJmTreeData.forEach(function(node) {
							var computedState = formatter.fnProcessState(node.state); // Expected to return 'Positive', 'Negative', etc.
							if (computedState === "Positive") {
								laneStates[node.lane] = true;
							}
						});

						var vProcessArr = [{
							"id": "0",
							"icon": laneStates["0"] ? "Images/admin_green1.svg" : "Images/admin_black1.svg",
							"label": "Vendor",
							"position": 0
						}, {
							"id": "1",
							"icon": laneStates["1"] ? "Images/check_green1.svg" : "Images/check_black1.svg",
							"label": "Goods Receipt Notification",
							"position": 1
						}, {
							"id": "2",
							"icon": laneStates["2"] ? "Images/paid_green4.svg" : "Images/paid_black4.svg",
							"label": "Invoicing",
							"position": 2
						}];

						var oTabModel = new sap.ui.model.json.JSONModel();
						oTabModel.setData(vProcessArr);
						that.getView().setModel(oTabModel, "JmLanes");
						that.fnCalculateTax();
						that.fn_withholding();
						// that.fn_check_button(oData);

						var arrgre = [];
						var tempgre = {
							"Amt": false,
							"Invno": false,
							"Gstin": false
						};
						arrgre.push(tempgre);
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(arrgre);
						that.getView().setModel(oModel, 'JSvalidgreen');

						var arrred = [];
						var tempred = {
							"Amt": true,
							"Invno": true,
							"Gstin": true
						};
						arrred.push(tempred);
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(arrred);
						that.getView().setModel(oModel, 'JSvalidred');
						that.fnGetVendordet();
						that.fn_validation();
						that.fn_getDescrip();

						if (oData.results[0].NavVenclr.results.length > 0) {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData.results[0].NavVenclr.results);
							that.getView().setModel(oModel, 'JDPClear');
							that.getView().byId("id_dpclearbutton").setVisible(true);
						} else {
							that.getView().byId("id_dpclearbutton").setVisible(false);
						}

						// oGlobalBusyDialog.close();

					},
					error: function(oRes) {
						// oGlobalBusyDialog.close();
						// sap.m.MessageBox.error('Http Error');
						that.openErrorDialog('Http Error');
						oGlobalBusyDialog.close();
					}

				});

				oGlobalBusyDialog.open();
				oModel.read("/PlantShSet", {
					success: function(oData, oResponse) {
						oGlobalBusyDialog.close();
						var oJSONModel = new sap.ui.model.json.JSONModel();
						oJSONModel.setData(oData.results);
						that.getView().setModel(oJSONModel, 'JSPlant');

					},
					error: function(oResponse) {
						oGlobalBusyDialog.close();
						// sap.m.MessageBox.error('Http Error'); mano
						that.openErrorDialog('Http Error');

					}

				});
				// --------- Material F4 help for Material Tab -----------
				oGlobalBusyDialog.open();
				oModel.read("/Mat0mSet", {

					success: function(oData, oResponse) {
						oGlobalBusyDialog.close();
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setSizeLimit(3000);
						oModel.setData(oData.results);
						that.getView().setModel(oModel, 'JSMaterial');

					},
					error: function(oResponse) {
						oGlobalBusyDialog.close();
						// sap.m.MessageBox.error('Http Error');
						that.openErrorDialog('Http Error');

					}

				});

				// --------- F4 help for Payment Method -----------

				this.fn_getPaymentMethod();
				oGlobalBusyDialog.open();
				oModel.read("/HT012Set", {
					filters: [new Filter("Bukrs", FilterOperator.EQ, Bukrs)],
					success: function(oData) {
						oGlobalBusyDialog.close();
						var oJSON = new sap.ui.model.json.JSONModel(oData.results);
						that.getView().setModel(oJSON, "JSHouseBank");

						// Bind ComboBox items dynamically
						that.byId("id_HouseBank").bindItems({
							path: "JSHouseBank>/",
							template: new sap.ui.core.Item({
								key: "{JSHouseBank>Hbkid}", // code
								text: {
									parts: [{
										path: "JSHouseBank>Hbkid"
									}, {
										path: "JSHouseBank>Bankl"
									}],
									formatter: function(hbkid, bankl) {
										return hbkid + " - " + bankl; // like old formatter
									}
								}
							})
						});
					},
					error: function() {
						oGlobalBusyDialog.close();
						that.openErrorDialog('Http Error while fetching House Banks.');
					}
				});

			}
		},

		fn_PaymentMethodChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey(); // just the code
				this.byId("id_PayMethod").setValue(sKey); // store/display only the code
			}
		},
		fn_getPaymentMethod: function() {
			oGlobalBusyDialog.open();
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			oModel.read("/HT042zSet", {
				filters: [new sap.ui.model.Filter("Land1", sap.ui.model.FilterOperator.EQ, 'IN')],
				success: function(oData) {
					oGlobalBusyDialog.close();
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSPaymentMethod");

					that.byId("id_PayMethod").bindItems({
						path: "JSPaymentMethod>/",
						template: new sap.ui.core.Item({
							key: "{JSPaymentMethod>Zlsch}", // store code as key
							text: {
								parts: [{
									path: "JSPaymentMethod>Zlsch"
								}, {
									path: "JSPaymentMethod>Text2"
								}],
								formatter: function(code, desc) {
									return code + " - " + desc;
								}
							}
						})
					});
				},
				error: function() {
					// sap.m.MessageBox.error("Http Error while fetching payment methods.");
					that.openErrorDialog('Http Error while fetching payment methods.');
					oGlobalBusyDialog.close();
				}
			});
		},
		fn_PaymentBlockChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sText = oSelectedItem.getText(); // Code - Description
				this.byId("id_payment_block").setValue(sText);
			}
		},
		fn_HousebankChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				// If you want only code in input field
				var sKey = oSelectedItem.getKey();
				this.byId("id_HouseBank").setValue(sKey);
			}
		},
		formatHSN: function(sSteuc, sText1) {
			if (sSteuc && sText1) {
				return sSteuc + " - " + sText1;
			}
			return sSteuc || "";
		},

		fn_get_PO_Details: function() {
			oGlobalBusyDialog.open();
			var vKey = this.getView().byId("id_goodstype").getSelectedKey();
			var QueueID = parseInt(this.getView().getModel('JSInvdethead').getData()[0].Qid);
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var readUrl = "/DEEPHEADSet";
			var that = this;
			oModel.read(readUrl, {
				filters: [
					new Filter("Qid", FilterOperator.EQ, QueueID),
					new Filter("Transtype", FilterOperator.EQ, vKey),
					new Filter("Ind", FilterOperator.EQ, vKey)
				],
				urlParameters: {
					$expand: "NavBusPlace,NavGoodsType,NavChangeGRN,NavHead,NavHeadSt,NavDomain,NavGetItemValues,NavItemTabDetails,NavTransHis,NavCurrency,NavLifnr,NavHsnSrch,NavGetTax,NavSpecialGL,NavGLSrch,NavCost,NavPayTerm,NavPayBlock,NavWithHoldTax,NavTaxTab,NavSection,NavChecklist"

				},
				success: function(oData, Response) {
					var aItems = oData.results[0].NavItemTabDetails.results || [];
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavItemTabDetails.results);
					oModel.setData(aItems);
					that.getView().setModel(oModel, 'JSPORefDet');
					var oTable = that.byId("id_table_poref");
					var aItems = that.getView().getModel('JSPORefDet').getData();
					var iRowCount = aItems.length;

					// Optional min/max limits
					if (iRowCount > 10) iRowCount = 10; // max 10 rows
					if (iRowCount < 1) iRowCount = 1; // min 2 rows

					oTable.setVisibleRowCount(iRowCount);
					that.onSelectAll();
					var oModel1 = that.getView().getModel('JSInvdethead')
					oModel1.setData(oData.results[0].NavHead.results);
					that.getView().setModel(oModel1, 'JSInvdethead');

					var oTable = that.byId("id_table_poref");

					if (aItems.length === 0) {
						oTable.setNoData("No Planned Delivery Cost For The PO");
					}
					var oCheckBox = that.getView().byId("id_check"); // the checkbox
					var oFakeEvent = {
						getSource: function() {
							return oCheckBox;
						}
					};
					that.fncheck(oFakeEvent);
					oGlobalBusyDialog.close();

				},
				error: function(oResponse) {
					sap.m.MessageToast.show("Failed to Load Item Details");
					oGlobalBusyDialog.close();
				}
			});
		},
		fn_paymentTabdet: function() {
			// oGlobalBusyDialog.open();

			if (this.getView().getModel("JSInvdet").getData() !== null) {
				var vEbeln = this.getView().getModel("JSInvdet").getData()[0].Ebeln;
			}
			if (this.getView().getModel("JSInvdethead").getData() !== null) {
				var vLifnr = this.getView().getModel("JSInvdethead").getData()[0].Lifnr;
				var QueueID = this.getView().getModel("JSInvdethead").getData()[0].Qid;
			}
			var vZterm = this.getView().byId("id_payment_term").getValue().split(' ')[0];

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Qid", FilterOperator.EQ, QueueID),
					new Filter("Lifnr", FilterOperator.EQ, vLifnr),
					new Filter("Ebeln", FilterOperator.EQ, vEbeln),
					new Filter("Zterm", FilterOperator.EQ, vZterm)

				],
				urlParameters: {
					$expand: "NavPayment,NavWithHoldTax"

				},

				success: function(oData, oResponse) {
					var oView = that.getView();
					if (oData.results[0].NavPayment.results.length !== 0) {

						var obj = oData.results[0].NavPayment.results[0];
						oView.byId("id_BaseDate").setValue(FSC360NEW.model.formatter.fnDate(obj.Bldat));
						oView.byId("id_BaseDate").setDateValue(obj.Bldat);
						oView.byId("id_DueOn").setValue(FSC360NEW.model.formatter.fnDate(obj.Ddate));
						oView.byId("id_payment_term").setValue(obj.Zterm + ' - ' + obj.Vtext);
						oView.byId("id_tag1").setValue(obj.Ztag1);
						oView.byId("id_Zprz1").setValue(FSC360NEW.model.formatter.fnAmount(obj.Zprz1) + " %");
						oView.byId("id_tag2").setValue(obj.Ztag2);
						oView.byId("id_Zprz2").setValue(FSC360NEW.model.formatter.fnAmount(obj.Zprz2) + " %");
						oView.byId("id_tag3").setValue(obj.Ztag3);
						oView.byId("id_Discount").setValue('');
						oView.byId("id_HouseBank").setValue(obj.Hbkid);
						oView.byId("id_PayMethod").setValue(obj.Zlsch);
						oView.byId("id_Payment_Block").setSelectedKey(obj.Zahls);
					}

					//Asha 29.08.2023
					// To Get With Hold Tab Details
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavWithHoldTax.results);
					that.getView().setModel(oModel, 'JSWithHold');
					that.fn_amount_split(); //Added by Manosankari on 12.09.2025
					that.fn_withholding();
 
					var vGSTPart = that.getView().byId("id_GST_Partner").getValue();

					if (oData.results[0].Land1) {

						if ((vLifnr !== "") && (oData.results[0].Land1 === "IN")) {

							var arr = [{

								"value": vLifnr

							}];

							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(arr);
							that.getView().setModel(oModel, 'JSGST');
						}
					}
					sap.ui.getCore().applyChanges();
					oGlobalBusyDialog.close();

				},
				error: function(oRes) {
					oGlobalBusyDialog.close();
					that.openErrorDialog('Http Error');

				}

			});

		},

		onAmountChange: function(oEvent) {

			var sValue = this.byId("id_glamnt").getValue();
			this.fncalculate = false
				//this._updateBalance(sValue);
				// Get references to ComboBox values
			var sDC = this.byId("id_dcCombo").getSelectedKey();
			var sTaxKey = this.byId("id_mwskz_mat").getSelectedKey();
			if (!sDC) {
				sap.m.MessageToast.show("Please select debit credit key");
			}
			if (!sTaxKey) {
				sap.m.MessageToast.show("Please select taxcode");
			}
			if (sDC && sTaxKey) {
				this.fnCalculateTax();
			}
			var sValue = oEvent.getParameter("value").trim();
			var oModel = this.getView().getModel("JSMatdet");

			// Update model with new value
			oModel.setProperty("/0/Zuumb", sValue);
			if (!sValue) {
				sValue = "0";
				this.byId("id_glamnt").setValue(sValue);
			}
			// Clear any existing timer
			if (this._amountChangeTimer) {
				clearTimeout(this._amountChangeTimer);
			}

			var that = this;
			this._amountChangeTimer = setTimeout(function() {
				var sQuantity = oModel.getProperty("/0/Quantity");
				if (!sQuantity || sQuantity === "0.000") {
					sap.m.MessageToast.show("Please enter Quantity");
				}
			}, 500);
			// Recalculate balance

		},
	fn_onAmountChange: function(oEvent) {

			var sValue = oEvent.getSource().getValue();
				var oCheckBox = this.getView().byId("id_check"); // the checkbox
					var oFakeEvent = {
						getSource: function() {
							return oCheckBox;
						}
					};
					this.fncheck(oFakeEvent);
			this.fncalculate = false
				//this._updateBalance(sValue);
				// Get references to ComboBox values
			var sDC = this.byId("id_glcCombo").getSelectedKey();
			var sTaxKey = this.byId("id_mwskz").getSelectedKey();
			if (!sDC) {
				sap.m.MessageToast.show("Please select debit credit key");
			}
			if (!sTaxKey) {
				sap.m.MessageToast.show("Please select taxcode");
			}
			if (sDC && sTaxKey) {
				this.fnCalculateTax();
			
			}

		},
		fn_onAmountLiveChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();

			var sFilteredValue = sValue.replace(/[^0-9.]/g, "");

			var parts = sFilteredValue.split('.');
			if (parts.length > 2) {
				sFilteredValue = parts[0] + '.' + parts[1];
			}

			oInput.setValue(sFilteredValue);
		},

		fnMatAmountChange: function(oEvent) {
			var sValue = oEvent.getParameter("value");

			// Allow only numbers and dot
			var sClean = sValue.replace(/[^0-9.]/g, "");

			var parts = sClean.split(".");
			if (parts.length > 2) {
				sClean = parts[0] + "." + parts.slice(1).join("");
			}

			if (sValue !== sClean) {
				oEvent.getSource().setValue(sClean);
			}
		},
		fn_deb_cred_full: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (!oSelectedItem) return; // user cleared selection

			var sKey = oSelectedItem.getKey(); // get current selected key

			this.fncalculate = false;
			this.fnCalculateTax(sKey);

		},
		_updateBalancegl: function(sValue, sKey) {
			var vAmount = parseFloat(sValue || "0");
			if (!sKey) {
				sKey = this.byId("id_glcCombo").getSelectedKey();
			}

			if (sKey === "Cre") {
				Balance_parameters.Item_Amount_Mat = +vAmount;

			} else if (sKey === "Deb") {
				Balance_parameters.Item_Amount_Mat = -vAmount;

			}

			this.fn_Balance_Amount();
		},
		onDCChange: function() {
			this.fncalculate = false;
			var sValue = this.byId("id_dcCombo").getValue();

			this.fnCalculateTax();
		},
		_updateBalance: function(sValue) {
			var vAmount = parseFloat(sValue || "0");
			var sKey = this.byId("id_dcCombo").getSelectedKey();

			if (sKey === "C") {
				Balance_parameters.Item_Amount_Mat = -vAmount;
			} else if (sKey === "D") {
				Balance_parameters.Item_Amount_Mat = +vAmount;
			}

			this.fn_Balance_Amount();
		},
		fnCalculateTax: function(glKey) {
			this.fncalculate = true;
			var that = this;
			var check = that.getView().byId("id_check").getSelected();
			oGlobalBusyDialog.open();
			if (check === true) {
				var obj = {};
				obj.NavGetItemValues = [];
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				obj.Flag = 'T';
				obj.NavHead = that.getView().getModel("JSInvdethead").getData();
				obj.NavTaxTab = [];
				obj.NavReturn = [];

				var data = that.getView().getModel("JSInvdethead").getData()[0];
				if (data.Transtype <= 3 || data.Transtype == 8) {
					obj.NavItemTabDetails = that.getView().getModel("JSPORefDet").getData();
					obj.NavMaterialDet = that.getView().getModel("JSMatdet").getData();
					obj.NavGetItemValues = that.getView().getModel("JSInvdet").getData();

				} else if (data.Transtype === '4' | data.Transtype <= "6") {
					obj.NavGetItemValues = that.getView().getModel("JSInvdet").getData();

				}

				var oHead = that.getView().getModel("JSInvdethead").getData()[0];
				oHead.Ntamt = oHead.Ntamt ? oHead.Ntamt.toString() : "0.00";
				for (var i = 0; i < obj.NavGetItemValues.length; i++) {
					if (obj.NavGetItemValues[i].Netpr === '') {
						obj.NavGetItemValues[i].Netpr = '0.00'
					}
				}
				obj.NavHead[0].Ntamt = oHead.Ntamt;
				oModel.create('/DEEPHEADSet', obj, {

					success: function(oData) {
						if (oData.NavReturn.results.length !== 0) {
							var errmsg = oData.NavReturn.results[0].Message;
							that.openErrorDialog(errmsg);
						} else {
							var vHeaddata = that.getView().getModel("JSInvdethead").getData()[0];
							var fAmountFormatter = FSC360NEW.model.formatter.fnAmount;

							// for Header Amount
							if (vHeaddata.Transtype <= 3 || vHeaddata.Transtype == 8) {
								var oTabData = that.getView().getModel("JSPORefDet").getData();
								var oMatData = that.getView().getModel("JSMatdet").getData();
								var vTotal = '0.00';
								for (var i = 0; i < oTabData.length; i++) {
									vTotal = parseFloat(vTotal) + parseFloat(oTabData[i].Amount);
								}
								if (oMatData) {
									var sKey = that.byId("id_dcCombo").getSelectedKey();
									for (var k = 0; k < oMatData.length; k++) {
										//	vTotal = parseFloat(vTotal) + parseFloat(oMatData[k].Zuumb);
										var vAmt = parseFloat(oMatData[k].Zuumb) || 0;
										if (sKey === "D") {
											vTotal += vAmt;
										} else if (sKey === "C") {
											vTotal -= vAmt;
										}
									}
								}
								var oTabDatagl = that.getView().getModel("JSInvdet").getData();
								if (oTabDatagl) {
									var sKey = that.byId("id_glcCombo").getSelectedKey();
									for (var i = 0; i < oTabDatagl.length; i++) {
										var vAmt = parseFloat(oTabDatagl[i].Netpr) || 0;
										if (!glKey) {
											glKey = sKey;
										}
										if (glKey === "Deb") {
											vTotal += vAmt;
										} else if (glKey === "Cre") {
											vTotal -= vAmt;
										}
										//	vTotal = parseFloat(vTotal) + parseFloat(oTabDatagl[i].Netpr);
									}
								}

							} else if (vHeaddata.Transtype === '4' | vHeaddata.Transtype <= "5") {
								var oTabData = that.getView().getModel("JSInvdet").getData();
								var vTotal = '0.00';
								for (var i = 0; i < oTabData.length; i++) {
									vTotal = parseFloat(vTotal) + parseFloat(oTabData[i].Netpr);
								}

							} else if (vHeaddata.Transtype === '6') {
								var oTabData = that.getView().getModel("JSInvdethead").getData();
								var vTotal = '0.00';
								for (var i = 0; i < oTabData.length; i++) {
									vTotal = parseFloat(vTotal) + parseFloat(oTabData[i].Ntamt);
								}

							}

							// for Tax amount
							if (oData.NavTaxTab) {
								var vlength = oData.NavTaxTab.results.length;
								var vTotalTax = '0.00';
								for (var j = 0; j < vlength; j++) {
									vTotalTax = parseFloat(vTotalTax) + parseFloat(oData.NavTaxTab.results[j].Ivtax);
								}

								vHeaddata.Intax = fAmountFormatter(vTotalTax);
								vTotal = parseFloat(vTotal) + parseFloat(vTotalTax);

							}
							if (that.flags) {
								vHeaddata.Ntamt = vTotal;
								Balance_parameters.Head_Amount = vHeaddata.Ntamt;
								that.flags = false;

							}

							Balance_parameters.Item_Amount = fAmountFormatter(vTotal);

							that.getView().getModel("JSInvdethead").refresh();

							that.fn_Balance_Amount();
							that.fn_validation();

							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData.NavTaxTab.results);
							that.getView().setModel(oModel, 'JSTaxTab');
							var oModel = that.getView().getModel("JSTaxTab");
							if (oModel) {
								// Get the array of rows from the model
								var aRows = oModel.getProperty("/"); // "/" points to the root array of the model
								var iRowCount = Array.isArray(aRows) ? aRows.length : 0;

								// Find your table by ID
								var oTable = that.getView().byId("id_taxtabtable");
								if (oTable) {
									// Minimum 1 row, but can grow based on data
									oTable.setVisibleRowCount(iRowCount > 0 ? iRowCount : 1);

									// Optional: force rerender if table doesn't immediately show rows
									oTable.rerender();
								}
							}
						}
						oGlobalBusyDialog.close();
					},
					error: function(oResponse) {
						// sap.m.MessageBox.error("Error");
						that.openErrorDialog(' Error');

						oGlobalBusyDialog.close();
					}

				});
			} else {

				var data = this.getView().getModel("JSInvdethead").getData()[0];
				if (data.Transtype <= 3 || data.Transtype == 8) {
					var oTabData = this.getView().getModel("JSPORefDet").getData();
					var vTotal = '0.00';
					for (var i = 0; i < oTabData.length; i++) {
						vTotal = parseFloat(vTotal) + parseFloat(oTabData[i].Amount);
					}

				} else if (data.Transtype === '4' | data.Transtype <= "5") {
					var oTabData = this.getView().getModel("JSInvdet").getData();
					var vTotal = '0.00';
					for (var i = 0; i < oTabData.length; i++) {
						vTotal = parseFloat(vTotal) + parseFloat(oTabData[i].Netpr);
					}

				}
				if (data.Transtype === '6') {
					var oTabData = this.getView().getModel("JSInvdethead").getData();
					var vTotal = '0.00';
					for (var i = 0; i < oTabData.length; i++) {
						vTotal = parseFloat(vTotal) + parseFloat(oTabData[i].Ntamt);
					}

				}

				vTotal = vTotal.toFixed(2);
				data.Ntamt = vTotal;
				data.Intax = "0.00";
				that.getView().getModel("JSInvdethead").refresh();

				that.fn_Balance_Amount();
				that.fn_validation();

			}
		},
			fn_Balance_Amount: function() {
    this.getView().getModel("JSInvdethead").refresh();
    this.getView().getModel("JSInvdet").refresh();


    var vHeadAmt   = parseFloat(Balance_parameters.Head_Amount)   || 0;
    var vItemAmt   = parseFloat(Balance_parameters.Item_Amount)   || 0;
    var vItemMat   = parseFloat(Balance_parameters.Item_Amount_Mat) || 0;
//var vTotal_item_amount = vItemAmt  + vItemMat;
var vTotal_item_amount = vItemAmt;
    // if(this.fncalculate==true){
    // 	    var vTotal_item_amount = vItemAmt;
    // }
    // else{
    // 	var vTotal_item_amount = vItemAmt  + vItemMat;
    // }

    
   // Balance_parameters.Balance_Amount = vHeadAmt - vTotal_item_amount; line commented by yasin on 22-09-2025 start
   Balance_parameters.Balance_Amount = vHeadAmt - vTotal_item_amount; 

    var fBalance = parseFloat(Balance_parameters.Balance_Amount) || 0;
    // this.getView().byId("id_balance").setText(fBalance.toFixed(2));
    var sBalanceText = "";

if(fBalance < 0){
    sBalanceText = Math.abs(fBalance).toFixed(2) + "-"; // convert to positive and append "-"
} else {
    sBalanceText = fBalance.toFixed(2);
}
this.getView().byId("id_balance").setText(sBalanceText);
    this.fn_amount_split(); 
},

		fn_Item_Amount_Initial_PO: function() {
			this.getView().getModel("JSPORefDet").refresh();
			var Model_Data = this.getView().getModel("JSPORefDet").getData();
			var count = "0";
			var total_item = "0";
			for (var i = 0; i < Model_Data.length; i++) {
				total_item = Number(Model_Data[i].Amount) + Number(total_item);
			}
			Balance_parameters.Item_Amount = parseInt(total_item);
			this.fn_Balance_Amount();
		},
		fnGetPDF: function() {

			if (Balance_parameters.Queid !== "") {
				oGlobalBusyDialog.open();
				this.getView().byId("id_scrll").setBusy(true);
				var oScorl = this.getView().byId("id_scrll");

				oScorl.destroyContent();
				var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + Balance_parameters.Queid + "',Doc='')/$value#toolbar=1";

				var oHtml = new sap.ui.core.HTML({

				});
				// var oContent = "<div class='overlay'><iframe src=" + Url +
				// 	"  id='id_imageIfrm' ' allowtransparency='true' frameborder='0' scrolling='yes'  height='450' width='350'></iframe></div>";
	var oContent = "<div class='overlay'><iframe src=" + Url +
					"  id='id_imageIfrm' ' allowtransparency='false' scrolling='yes'  height='430' width='360'></iframe></div>";
				oHtml.setContent(oContent);

				var oScrl = this.getView().byId("id_scrll");
				oScrl.addContent(oHtml);
				oScrl.setVisible(true);
				$('id_scrll').click(false);
				this.getView().byId("id_scrll").setBusy(false);
				oGlobalBusyDialog.close();
			} else {
				// sap.m.MessageBox.error("Please Select the Queue ID");
				this.openErrorDialog('Please Select the Queue ID');
			}

		},
		fn_pdf: function() {

			var oHtml = this.getView().byId("id_scrll");

			if (this.getView().byId("id_scrll").getVisible()) {
				this.getView().byId("id_scrll").setVisible(false);

				var oModel = this.getOwnerComponent().getModel("jsTab");

				var arr = [{

					"Key": true,
					"Width": "11%",
					"Align": "End",
					"Icon": false

				}];

				oModel.setData(arr);
				this.getView().setModel(oModel, 'jsTab');
				this.getView().byId("rightPanel").setWidth("90%");

				this.getView().byId("pdfPanel").setWidth("0%");

			} else if (!this.getView().byId("id_scrll").getVisible()) {
				this.getView().byId("id_scrll").setVisible(true);

				var oModel = this.getOwnerComponent().getModel("jsTab");

				var arr = [{

					"Key": false,
					"Width": "5%",
					"Align": "Center",
					"Icon": true

				}];

				// this.getView().byId('id_noti').setVisible(false);

				oModel.setData(arr);
				this.getView().setModel(oModel, 'jsTab');

				this.getView().byId("rightPanel").setWidth("70%");
				this.getView().byId("pdfPanel").setWidth("30%");
				this.fnGetPDF();

			}

		},

	fn_SetInputField: function () {
    var oView = this.getView();
    var oIconTabBar = oView.byId("id_TabDetail");
    var oGLTab = oView.byId("id_glaccount_tab");
    var oGLHeading = oView.byId("id_glAccountSectionHeader");
    var oDPHeading = oView.byId("id_DP_heading");
    var iTranstype = parseInt(parameters[0].Transtype, 10);

    // --- CASE 1: Normal Flow ---
    if (iTranstype <= 3 || iTranstype == 8) {
    	this.getView().getModel("JSVisibility").setProperty("/showShortTxt", true);
    		this.getView().getModel("JSVisibility").setProperty("/showSGL", false);
    	oView.byId("id_SGLVBox").setVisible(false);
        oView.byId("id_shorttxt_cont").setVisible(true);
        oView.byId("id_poref_tab").setVisible(true);
        this.onSelectAll();
        oView.byId("id_material_tab").setVisible(true);
        oView.byId("id_PaymentTab").setVisible(true);
        oView.byId("id_TaxTab").setVisible(true);
        oView.byId("id_DetailsTab").setVisible(false);
        oView.byId("id_RelDoctab").setVisible(true);
        oView.byId("id_AmountSplit_Tab").setVisible(true);

        // Show shorttext and hide SGL
        

        // GL and DP settings
        oGLTab.setVisible(true);
        oView.byId("id_dpTab").setVisible(false);
        oGLHeading.setVisible(false);
        oDPHeading.setVisible(false);

        oIconTabBar.setVisible(true);
        oIconTabBar.addEventDelegate({
            onAfterRendering: function () {
                oIconTabBar.$().removeClass("single-tab");
            }
        }, this);
    }

    // --- CASE 2: Only GL tab (Transtype 4, 5) ---
    else if (iTranstype >= 4 && iTranstype <= 5) {
    	// 
    		this.getView().getModel("JSVisibility").setProperty("/showSGL", false);
        oView.byId("id_poref_tab").setVisible(false);
        oView.byId("id_material_tab").setVisible(false);
        oView.byId("id_DetailsTab").setVisible(false);

        oGLTab.setVisible(true);
        oView.byId("id_dpTab").setVisible(false);

        // Show shorttext and hide SGL
        oView.byId("id_SGLVBox").setVisible(false);
        oView.byId("id_shorttxt_cont").setVisible(true);

        // Other tabs
        oView.byId("id_TaxTab").setVisible(true);
        oView.byId("id_RelDoctab").setVisible(true);
        oView.byId("id_AmountSplit_Tab").setVisible(true);

        oGLHeading.setVisible(true);
        oDPHeading.setVisible(false);

        oIconTabBar.setVisible(true);
        oIconTabBar.addEventDelegate({
            onAfterRendering: function () {
                oIconTabBar.$().addClass("single-tab");
            }
        }, this);
    }

    // --- CASE 3: Transtype = 6 (Show only SGLVBox, Hide shorttext) ---
    else if (iTranstype === 6) {
        // Hide unnecessary tabs
        oView.byId("id_PaymentTab").setVisible(false);
        oView.byId("id_TaxTab").setVisible(false);
        oView.byId("id_RelDoctab").setVisible(false);
        oView.byId("id_AmountSplit_Tab").setVisible(false);

        oView.byId("id_DetailsTab").setVisible(true);
        oView.byId("id_poref_tab").setVisible(false);
        oView.byId("id_material_tab").setVisible(false);

        // Show DP tab only
        oView.byId("id_glaccount_tab").setVisible(false);
        oView.byId("id_dpTab").setVisible(true);

        // Correct visibility for this case
        oView.byId("id_SGLVBox").setVisible(true);
        oView.byId("id_shorttxt_cont").setVisible(false);
        oView.byId("id_SGLindicator").setValue("A");

        oGLHeading.setVisible(false);
        oDPHeading.setVisible(true);
		this.getView().getModel("JSVisibility").setProperty("/showSGL", true);
		this.getView().getModel("JSVisibility").setProperty("/showShortTxt", false);
        oIconTabBar.setVisible(true);
 oIconTabBar.addEventDelegate({
            onAfterRendering: function () {
                oIconTabBar.$().addClass("single-tab");
            }
        }, this);
       
    }
},
		onCollapsePressDownPay: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("id_downpayment_table");
			var oCard = oView.byId("id_downpayment_card");
			var oButton = oEvent.getSource();

			if (oTable.getVisible()) {
				// Switch to Card View
				oTable.setVisible(false);
				oCard.setVisible(true);

			} else {
				// Switch to Table View
				oTable.setVisible(true);
				oCard.setVisible(false);

			}
		},
		fnsegmentLiveChange: function(vOn, Switch) {
			var oTabmodel = this.getView().getModel("JSselectcnt");
			var selectcnt = oTabmodel.getData()[0];

			if (vOn === true) {
				selectcnt++;

			} else {
				selectcnt--;

			}
			if (Switch === "Original") {
				oTabmodel.getData()[1].Original = true;
			} else if (Switch === "Priority") {
				oTabmodel.getData()[1].Priority = true;
			} else if (Switch === "Duplicate") {
				oTabmodel.getData()[1].Duplicate = true;
			} else if (Switch === "VAT") {
				oTabmodel.getData()[1].VAT = true;
			} else if (Switch === "Invalid") {
				oTabmodel.getData()[1].Invalid = true;
			}
			oTabmodel.getData()[0] = selectcnt;
			oTabmodel.refresh();
		},
		fn_Currency_frag: function() {

			if (!this.Currency_frag) {
				this.Currency_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Currency", this);
				this.getView().addDependent(this.Currency_frag);
			}
			this.Currency_frag.open();
		},
		fn_Head_Currency: function(oEvent) {

			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSInvdethead");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[0].Waers = oSelectedItem.getTitle();
					oTabModel.refresh(true);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);

		},

		fn_Currency_Confrm: function(oEvent) {
			var curr_name = oEvent.getParameter('selectedItem').getTitle();
			var ltext = oEvent.getParameter('selectedItem').getDescription();
			this.getView().byId("id_Currency").setValue(curr_name);
			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},
		fnAmountChange: function() {

			this.fnCalculateTax();
			this.fn_amount_split();
			this.fn_withholding();
		},
		fncheck: function(oEvent) {
			this.flags = true;
			var oSelect = oEvent.getSource().getSelected();
			if (oSelect == true) {
				this.getView().byId("id_check").setSelected(true);
			} else {
				this.getView().byId("id_check").setSelected(false);
			}
			this.fnCalculateTax();

		},
		fn_SGL_frag: function() {

			if (!this.SGL_frag) {
				this.SGL_frag = sap.ui.xmlfragment("FSC360NEW.fragment.SGLIndicator", this);
				this.getView().addDependent(this.SGL_frag);
			}
			this.SGL_frag.open();
		},
		fn_SGL_Confrm: function(oEvent) {
			var Name = oEvent.getParameter('selectedItem').getTitle();
			this.getView().byId("id_SGLindicator").setValue(Name);
			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},
		fn_Business_frag: function() {

			if (!this.Business_frag) {
				this.Business_frag = sap.ui.xmlfragment("FSC360NEW.fragment.BusinessPlace", this);
				this.getView().addDependent(this.Business_frag);
			}
			this.Business_frag.open();
		},
		fn_Section_frag: function() {

			if (!this.Section_frag) {
				this.Section_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Section", this);
				this.getView().addDependent(this.Section_frag);
			}
			this.Section_frag.open();
		},

		fn_Section_Confirm: function(oEvent) {

			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSInvdethead");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[0].Secco = oSelectedItem.getTitle();
					oTabModel.refresh(true);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);

		},
		fn_Head_SGLInd: function(oEvent) {

			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSInvdethead");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[0].SpGlInd = oSelectedItem.getTitle();
					oTabModel.refresh(true);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);

		},
		fn_TaxCode_frag_POREF_Tab: function(oEvent) {

			vTaxID = 0;
			if (!this.POREF_Tab_TaxCode_frag) {
				this.POREF_Tab_TaxCode_frag = sap.ui.xmlfragment("FSC360NEW.fragment.TaxCodePoRef", this);
				this.getView().addDependent(this.POREF_Tab_TaxCode_frag);
			}
			this.POREF_Tab_TaxCode_frag.open();
		},
		fn_TaxCode_frag: function(oEvent) {

			vTaxID = 0;
			if (!this.TaxCode_frag) {
				this.TaxCode_frag = sap.ui.xmlfragment("FSC360NEW.fragment.TaxCode", this);
				this.getView().addDependent(this.TaxCode_frag);
			}
			this.TaxCode_frag.open();
		},

		fn_SGl_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Koart", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Merkp", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_Currency_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Waers", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Ltext", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_BusPlace_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Branch", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_Section_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Seccode", sap.ui.model.FilterOperator.Contains, sValue);

			var allFilter = new sap.ui.model.Filter([Filter1]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_HSN_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Steuc", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_GLAc_frag: function(oEvent) {

			vGlAccID = 0;
			if (!this.GLAcc_frag) {
				this.GLAcc_frag = sap.ui.xmlfragment("FSC360NEW.fragment.GLAcc", this);
				this.getView().addDependent(this.GLAcc_frag);
			}
			this.GLAcc_frag.open();
		},
		fn_GLAcc_Confrm: function(oEvent) {
			var gl_no = oEvent.getParameter('selectedItem').getTitle();
			var gl_name = oEvent.getParameter('selectedItem').getDescription();

			this.getView().byId("id_gl_acc_val").setValue(gl_no + ' - ' + gl_name);

			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},

		fn_GLAcc_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Saknr", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Txt50", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_CostCntr_frag: function(oEvent) {

			vCossID = 0;
			if (!this.CostCntrfrag) {
				this.CostCntrfrag = sap.ui.xmlfragment("FSC360NEW.fragment.CostCenter", this);
				this.getView().addDependent(this.CostCntrfrag);
			}
			this.CostCntrfrag.open();
		},

		fn_CostCntr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Ktext", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fnCostConfrm_: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSInvdet");
				if (oTabModel) {
					var oTabData = oTabModel.getData();

					// Extract Kostl and Ktext from title
					var aParts = oSelectedItem.getTitle().split(" - ");
					var sKostl = aParts[0];
					var sKtext = aParts[1] || "";

					oTabData[vCossID].Kostl = sKostl;
					oTabData[vCossID].Ktext = sKtext;

					// Get Prctr from binding context
					oTabData[vCossID].Prctr = oSelectedItem
						.getBindingContext('JSCostCenter')
						.getProperty('Prctr');

					oTabModel.refresh(true);
				}
			}

			// Clear filter
			oEvent.getSource().getBinding("items").filter([]);
		},
		// -------- Get Description Text ---------------------------------------
		fn_getDescrip: function() {
			var temp = [];
			var GLarr = this.getView().getModel('JSGLAccount').getData();
			var GLAcc = this.getView().getModel('JSInvdet').getData();

			for (var i = 0; i < GLarr.length; i++) {
				for (var j = 0; j < GLAcc.length; j++) {
					if (GLAcc[j].Saknr === GLarr[i].Saknr) {
						var GLDesc = GLarr[i].Txt50;
						temp.push({
							"GLDesc": GLDesc
						});
					}
				}
			}

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(temp);
			this.getView().setModel(oModel, 'JSDesc');

		},
		fn_BusPlace_Confirm: function(oEvent) {

			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSInvdethead");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[0].Bupla = oSelectedItem.getTitle();
					oTabModel.refresh(true);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);

		},

		fn_Confirm_HSN: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSInvdet");
				if (oTabModel) {
					var oTabData = oTabModel.getData();

					// Get code and desc from binding context directly
					var oCtx = oSelectedItem.getBindingContext("JSHSN");
					var sSteuc = oCtx.getProperty("Steuc");
					var sText1 = oCtx.getProperty("Text1");

					oTabData[vHsnID].Hsncode = sSteuc;
					oTabData[vHsnID].Hsndesc = sText1;

					oTabModel.refresh(true);
				}
			}
			// Clear filters for next open
			oEvent.getSource().getBinding("items").filter([]);
		},
		formatCodeDesc: function(code, desc) {
			if (code && desc) {
				return code + " - " + desc;
			} else if (code) {
				return code;
			} else {
				return "";
			}
		},

		fn_Confirm_HSN_PO: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTabModel = this.getView().getModel("JSPORefDet");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[vHsnID_PO].J1bnbm = oSelectedItem.getTitle();
					oTabModel.refresh(true);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		fn_GLConfrm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (oItem) {
				var oExistingData = this.getView().getModel('JSInvdet').getData();

				// Split if you still want Saknr and Txt50 separately in the model
				var aParts = oItem.getTitle().split(" - ");
				var sSaknr = aParts[0];
				var sTxt50 = aParts[1] || "";

				oExistingData[vGlAccID].Saknr = sSaknr;
				oExistingData[vGlAccID].Gldesc = sTxt50;

				this.getView().getModel('JSInvdet').refresh();
			}

			oEvent.getSource().getBinding("items").filter([]);
		},
		fn_onGLAccountChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oCtx = oCombo.getBindingContext("JSInvdet"); // row context

			if (oItem && oCtx) {
				var sKey = oItem.getKey(); // Saknr
				var sDesc = oItem.getText().split(" - ")[1] || ""; // Txt50

				// update row in JSInvdet model
				oCtx.getModel().setProperty(oCtx.getPath() + "/Saknr", sKey);
				oCtx.getModel().setProperty(oCtx.getPath() + "/Gldesc", sDesc);

				// force input field to display only the key
				oCombo.setValue(sKey);
			}
		},
		fn_Head_Amount_Change: function(oEvent) {
			Balance_parameters.Head_Amount = oEvent.getParameter("value");
			this.fn_Balance_Amount();
		},
		fn_Postingdatechange: function() {
			oGlobalBusyDialog.open();

			if (this.getView().getModel("JSInvdethead").getData() !== null) {
				var vPostingdate = this.getView().getModel("JSInvdethead").getData()[0].Postingdate;
				var vQid = this.getView().getModel("JSInvdethead").getData()[0].Qid;
			}

			if (vPostingdate) {

				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var that = this;

				oModel.read("/FieldValidateSet", {
					// filters: aFilter,
					filters: [
						new Filter("Qid", FilterOperator.EQ, vQid),
						new Filter("Postingdate", FilterOperator.EQ, vPostingdate)
					],
					success: function(oData, oResponse) {

						;
						oGlobalBusyDialog.close();
					},
					error: function(oRes) {
						that.openErrorDialog('Http Error');
						oGlobalBusyDialog.close();
					}
				});
			}

		},
		fn_HSN_frag: function(oEvent) {

			vHsnID = 0;
			if (!this.HSN_frag) {
				this.HSN_frag = sap.ui.xmlfragment("FSC360NEW.fragment.HSNCode", this);
				this.getView().addDependent(this.HSN_frag);
			}
			this.HSN_frag.open();
		},

		fn_HSN_frag_PO: function(oEvent) {

			vHsnID_PO = 0;
			if (!this.HSN_frag_PO) {
				this.HSN_frag_PO = sap.ui.xmlfragment("FSC360NEW.fragment.HSNCode_PO", this);
				this.getView().addDependent(this.HSN_frag_PO);
			}
			this.HSN_frag_PO.open();
		},
		fn_HSN_Confrm: function(oEvent) {

			var hsn_no = oEvent.getParameter('selectedItem').getTitle();
			var hsn_name = oEvent.getParameter('selectedItem').getDescription();

			if (parameters[0].Transtype <= 3 || parameters[0].Transtype == 8) {
				this.getView().byId("id_hsn_po_no").setValue(hsn_no + ' - ' + hsn_name);
			} else if (parameters[0].Transtype == "4" | parameters[0].Transtype <= "6") {
				this.getView().byId("id_hsn_no_gltab").setValue(hsn_no + ' - ' + hsn_name);
			}

			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},

		fn_HSN_Confrm_PO: function(oEvent) {

			var hsn_no = oEvent.getParameter('selectedItem').getTitle();
			var hsn_name = oEvent.getParameter('selectedItem').getDescription();

			if (parameters[0].Transtype <= 3 || parameters[0].Transtype == 8) {
				this.getView().byId("id_hsn_po_no").setValue(hsn_no + ' - ' + hsn_name);
			} else if (parameters[0].Transtype == "4" | parameters[0].Transtype <= "6") {
				this.getView().byId("id_hsn_no_gltab").setValue(hsn_no + ' - ' + hsn_name);
			}

			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},
		fn_Tax_Confrm: function(oEvent) {
			var Tax_no = oEvent.getParameter('selectedItem').getTitle();

			if (parameters[0].Transtype <= 3 || parameters[0].Transtype == 8) {
				this.getView().byId("id_taxcode_val").setValue(Tax_no);
			} else if (parameters[0].Transtype == "4" | parameters[0].Transtype <= "6") {
				this.getView().byId("id_taxcode_val_gl_tab").setValue(Tax_no);
			}

			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},

		fn_Clear: function() {

			this.getView().byId("id_InGrnChange").setValue("");

			var arr = [];
			var temp = {
				"VAT": false,
				"Invalid": false,
				"Original": false,
				"Priority": false,
				"Duplicate": false
			};
			arr.push("0", temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSselectcnt');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSGoods');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSPO');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSses');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSGST');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSInvdethead');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSPORefDet');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JDPClear');

			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JDPClear_Original');

		},
		fn_edit: function() {
			var arr = []; //Added by Lokesh on 26.07.2023 for editable of fields.
			var temp = {
				"Key": true
			};
			arr.push(temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSKey');

			var arr = [];
			var temp = {
				"Key": false
			};
			arr.push(temp);

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, "JSKey_Table");

			arr = [];
			temp = {
				"Key": true
			};
			arr.push(temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSBtnVis');

			arr = [];
			temp = {
				"Key": true
			};
			arr.push(temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSHldBtnVis');
		},
		fnValidateChange: function() {
			this.fn_validation();
			this.fn_withholding();

		},

		//****************************************Commented by Manosankari start 10.10.2025***************************//
		// fn_Invoicedate_change: function(oEvent) {
		//     var oDatePicker = oEvent.getSource();
		//     var oDateValue  = oDatePicker.getDateValue(); // Date object

		//     // Update model for UI reflection
		//     var sDateStr = oDateValue 
		//         ? oDateValue.getFullYear() + "-" + 
		//           String(oDateValue.getMonth() + 1).padStart(2, '0') + "-" + 
		//           String(oDateValue.getDate()).padStart(2, '0') 
		//         : "";

		//     this.getView().getModel("JSInvdet").setProperty("/0/Invdt", sDateStr);
		//     this.getView().getModel("JSInvdet").refresh();

		//     // Call validation and pass the actual Date object
		// 	this.fn_validation()

		//     // Close the DatePicker popup
		//     var oPopup = oDatePicker._getPopup();
		//     if (oPopup && oPopup.isOpen()) {
		//         oPopup.close();
		//     }
		// },
		//****************************************Commented by Manosankari end 10.10.2025***************************//
		//****************************************Added by Manosankari start 10.10.2025***************************//
		fn_Invoicedate_change: function(oEvent) {
			var oView = this.getView();
			// var oDatePicker = oEvent.getSource();
			// var oDateValue = oDatePicker.getDateValue(); // JS Date object

			// // --- Update JSInvdet model to reflect UI change (optional, for backward compatibility) ---
			// if (oDateValue) {
			//     oView.getModel("JSInvdet").setProperty("/0/Invdt", oDateValue);
			//     oView.getModel("JSInvdet").refresh();
			// }

			// --- Extract other required fields ---
			if (oView.getModel("JSInvdethead").getData() !== null) {
				var vLifnr = oView.getModel("JSInvdethead").getData()[0].Lifnr;
				var QueueID = oView.getModel("JSInvdethead").getData()[0].Qid;
			}

			var vZterm = oView.byId("id_payment_term").getValue().split(' ')[0];
			var vInvdat = oView.getModel('JSInvdethead').getData()[0].Invdt; // JS Date object
			var vBlinedat = oView.byId("id_BaseDate").getDateValue();

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_WB_SRV/");
			var that = this;

			// --- Read OData for NavPayment ---
			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Qid", FilterOperator.EQ, QueueID),
					new Filter("Lifnr", FilterOperator.EQ, vLifnr),
					new Filter("Bldat", FilterOperator.EQ, vBlinedat),
					new Filter("Zterm", FilterOperator.EQ, vZterm),
					new Filter("Invdt", FilterOperator.EQ, vInvdat)
				],
				urlParameters: {
					$expand: "NavPayment"
				},
				success: function(oData) {
					if (oData.results.length > 0 && oData.results[0].NavPayment.results.length !== 0) {
						var oMsg = oData.results[0].NavPayment.results[0].Message;
						var oMsgType = oData.results[0].NavPayment.results[0].Msgtype;

						if (oMsgType === 'E') {
							oView.byId('functionalLocationTab').setSelectedKey('paymentTab');
							oView.byId("id_BaseDate").removeStyleClass('FSC_Input');
							oView.byId("id_BaseDate").addStyleClass('FSC_InputError');
							oView.byId("id_BaseDate").setValueState('Error');
							oView.byId("id_BaseDate").setValueStateText(oMsg);
						} else {
							oView.byId("id_BaseDate").removeStyleClass('FSC_InputError');
							oView.byId("id_BaseDate").addStyleClass('FSC_Input');
							oView.byId("id_BaseDate").setValueState('None');
						}
					}

					// --- Call your existing validation logic ---
					that.fn_validation(); // This will internally call _applyValidationUI

					oGlobalBusyDialog.close();
				},
				error: function() {
					oGlobalBusyDialog.close();
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');
				}
			});

			// --- Close DatePicker popup if open ---
			// var oPopup = oDatePicker._getPopup();
			// if (oPopup && oPopup.isOpen()) {
			//     oPopup.close();
			// }
		},
		//****************************************Added by Manosankari end 10.10.2025***************************//

		fn_validation: function() {
			oGlobalBusyDialog.open();
			var that = this;

			var vQueid = Balance_parameters.Queid;
			var vNtamt = this.getView().getModel("JSInvdethead").getData()[0].Ntamt;
			var vLifnr = this.getView().getModel("JSInvdethead").getData()[0].Lifnr;
			var vInvno = this.getView().getModel("JSInvdethead").getData()[0].Invno;
			var oDatePicker = this.getView().getModel("JSInvdethead").getData()[0].Invdt;
			var oDatePicker = this.byId("id_InvDate");
			var vDateValue = oDatePicker.getDateValue();
			var vGstin = this.getView().getModel("JSVendorDet")?.getData().Stcd3;
			var sScanFrom = this.getView().getModel("JSInvdethead").getData()[0].Scanfrom;
			//if (this._bFirstValidationDone && sScanFrom !== "CC" || sScanFrom !== "AD") {
			if (this._bFirstValidationDone) {
				that._applyValidationUI(this._oCachedValidation);
				oGlobalBusyDialog.close();
				return;
			}

			var oEntity = {
				"Qid": vQueid,
				"Ntamt": vNtamt,
				"Stcd3": vGstin,
				"Lifnr": vLifnr,
				"Invno": vInvno
			};

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oEntity.Ntamt = oEntity.Ntamt ? oEntity.Ntamt.toString() : "0.00";

			oModel.create("/ValidateSet", oEntity, {
				success: function(oData) {

					that._bFirstValidationDone = true;
					that._oCachedValidation = oData;
					//Added by Manosankari start
					var oValModel = new sap.ui.model.json.JSONModel(oData);
					 that.getView().setModel(oValModel, "JSValidate");
    	//Added by Manosankari end
					// Apply UI updates
					that._applyValidationUI(oData);
					//         if (sScanFrom !== "CC" || sScanFrom !== "AD") {
					//        that._applyValidationUI(oData);
					// 	    } else {
					// }

					oGlobalBusyDialog.close();
				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
				}
			});
		},
_applyValidationUI: function(oData) {
    var that = this;

    // --- Get UI field values ---
    var vNtamt = this.getView().getModel("JSInvdethead").getData()[0].Ntamt;
    var sScanFrom = this.getView().getModel("JSInvdethead").getData()[0].Scanfrom;
   if (sScanFrom == "EM" || sScanFrom == "PR" || sScanFrom == "SC") {
    // var vLifnr = this.getView().getModel("JSInvdethead").getData()[0].Lifnr;
    var vInvno = this.getView().getModel("JSInvdethead").getData()[0].Invno;
var vGstValue = this.getView().getModel("JSGST").getProperty("/0/value");

    var oDatePicker = this.byId("id_InvDate");
    // var vDateValue  = oDatePicker.getDateValue();   // Date object from UI
    var vDateValue    = this.getView().byId("id_InvDate").getValue();    
var vInvdt = this.getView().getModel("JSInvdethead").getProperty("/0/Invdt");

var oInput = this.byId("id_GST_Partner");


    // --- Amount ---
    var oHBox = that.byId("id_HeaderAmnt").getParent();
    oHBox.removeStyleClass("successBorder errorBorder");

	
	var vBackendAmt = parseFloat(oData.Ntamt) || 0;
var vUIAmt      = parseFloat(vNtamt) || 0;

if (Math.round(vBackendAmt) === Math.round(vUIAmt)) {
    oHBox.addStyleClass("successBorder");
} else {
    oHBox.addStyleClass("errorBorder");
}




    // --- GSTIN ---
    if (oData.GstinMatch === "X") {
        that.getView().getModel("JSValidation").setProperty("/GstState", "Success");
        that.getView().getModel("JSValidation").setProperty("/GstText", "GST validated successfully");
    } else {
        that.getView().getModel("JSValidation").setProperty("/GstState", "Error");
        that.getView().getModel("JSValidation").setProperty("/GstText", "GST Mismatched:"+oData.Stcd3);
    }

    // --- Invoice No ---
    if (oData.Invno == vInvno) {   // compare backend vs UI
        that.getView().getModel("JSValidation").setProperty("/InvnoState", "Success");
        that.getView().getModel("JSValidation").setProperty("/InvnoText", "Invoice No Matched");
    } else {
        that.getView().getModel("JSValidation").setProperty("/InvnoState", "Error");
        that.getView().getModel("JSValidation").setProperty("/InvnoText", "Invoice No Mismatched:"+oData.Invno);
    }
        // --- Invoice Date ---
// Try to get date from UI-updated model first
var sFrontendStr = this.getView().getModel("JSInvdet").getProperty("/0/Invdt");

// If nothing in JSInvdet, fall back to original header model
if (!sFrontendStr) {
    sFrontendStr = this.getView().getModel("JSInvdethead").getProperty("/0/Invdt");
}

// Convert to Date object
var oFrontendDate = sFrontendStr ? new Date(sFrontendStr) : null;

// --- Validation ---
if (oData.Invdt && oFrontendDate) {
    var oBackendDate = new Date(oData.Invdt);

    if (oBackendDate.getFullYear() === oFrontendDate.getFullYear() &&
        oBackendDate.getMonth() === oFrontendDate.getMonth() &&
        oBackendDate.getDate() === oFrontendDate.getDate()) {

        this.getView().getModel("JSValidation").setProperty("/InvdtState", "Success");
        this.getView().getModel("JSValidation").setProperty("/InvdtText", "Invoice date is Matched");

    } else {
    	var sBackendDate = oBackendDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        this.getView().getModel("JSValidation").setProperty("/InvdtState", "Error");
        this.getView().getModel("JSValidation").setProperty("/InvdtText", "Invoice date Mismatched:"+sBackendDate);
    }
}

    // --- Refresh ---
    that.getView().getModel('JSvalidgreen').refresh();
    that.getView().getModel('JSvalidred').refresh();
   }
},
		statusClassFormatter: function(bInvnoInvalid) {
			return bInvnoInvalid ? "inputError" : "inputValid";
		},
		fnGetVendordet: function() {
			oGlobalBusyDialog.open();

			if (this.getView().getModel("JSInvdethead").getData() !== null) {
				var vLifnr = this.getView().getModel("JSInvdethead").getData()[0].Lifnr;
			}

			if (vLifnr) {
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var that = this;

				oModel.read("/VendorDetSet('" + vLifnr + "')", {

					success: function(oData, oResponse) {

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						that.getView().setModel(oModel, 'JSVendorDet');
						oGlobalBusyDialog.close();
					},
					error: function(oRes) {

						// sap.m.MessageBox.error('Http Error');
						that.openErrorDialog('Http Error');
						oGlobalBusyDialog.close();
					}
				});
			} else {
				var temp = [];
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(temp);
				this.getView().setModel(oModel, 'JSVendorDet');
			}

		},

		// yasin add copy delete start 
		fn_additem_PoRef_Tab: function(oEvent) {
			var oModel = this.getView().getModel("JSPORefDet");
			var aData = oModel.getProperty("/") || [];

			var newItem = {
				Material: "",
				Potext: "",
				Mblnr: "",
				Amount: "0.000",
				Quantity: "0.000",
				J1bnbm: "",
				Taxcode: "",
				Intorder: ""
			};

			aData.push(newItem);
			oModel.setProperty("/", aData);
			oModel.refresh();
			var that = this;
			setTimeout(function() {
				that._applyFlexGrow();
			}, 0); // run after DOM updates

		},
		fn_copyitem_PoRef_Tab: function(oEvent) {
			var oModel = this.getView().getModel("JSPORefDet");
			var aData = oModel.getProperty("/") || [];

			var vPath = oEvent.getSource().getBindingContext("JSPORefDet").getPath();
			var iIndex = parseInt(vPath.split("/")[1], 10);

			var oCopy = jQuery.extend(true, {}, aData[iIndex]); // Deep copy

			aData.push(oCopy);

			oModel.setProperty("/", aData);
			oModel.refresh();
			var that = this;
			setTimeout(function() {
				that._applyFlexGrow();
			}, 0); // run after DOM updates
		},
		fn_deleteitem_PoRef_Tab: function(oEvent) {
			var oModel = this.getView().getModel("JSPORefDet");
			var aData = oModel.getProperty("/") || [];

			var vPath = oEvent.getSource().getBindingContext("JSPORefDet").getPath();
			var iIndex = parseInt(vPath.split("/")[1], 10);

			if (aData.length > 1) {
				aData.splice(iIndex, 1);
				oModel.setProperty("/", aData);
				oModel.refresh();
			} else {
				sap.m.MessageToast.show("At least one item must remain.");
			}
			var that = this;
			setTimeout(function() {
				that._applyFlexGrow();
			}, 0); // run after DOM updates
		},

		fn_TaxCode_PoRef_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mwskz", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text1", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter([Filter1, Filter2], false));
		},

		fn_TaxConfrm_PoRef: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (!oSelectedItem) return;

			var titleText = oSelectedItem.getTitle(); // e.g. "A0 - Reduced VAT"
			var parts = titleText.split(" - ");
			var mwskz = parts[0];
			var desc = parts[1] || "";

			var oTabModel2 = this.getView().getModel("JSPORefDet");
			if (oTabModel2) {
				var oTabData2 = oTabModel2.getData();
				oTabData2[vTaxID].Taxcode = mwskz;
				oTabData2[vTaxID].Description = desc;
				oTabModel2.refresh(true); // use true for full refresh
				this.fnCalculateTax();
			}

			// Clear filter on the dialog's items binding (make sure oDialog is your SelectDialog instance)
			var oDialog = this.POREF_Tab_TaxCode_frag;
			if (oDialog) {
				oDialog.getBinding("items").filter([]);
			}
		},
		formatTaxCodePoRef: function(sMwskz, sText1) {
			if (sMwskz && sText1) {
				return sMwskz + " - " + sText1;
			}
			return sMwskz || "";
		},
		fn_TaxCodeChange_PoRef: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (!oSelectedItem) return;

			var sKey = oSelectedItem.getKey(); // Mwskz
			var sText = oSelectedItem.getText(); // "Mwskz - Desc"

			var oCtx = oEvent.getSource().getBindingContext("JSPORefDet");
			if (oCtx) {
				var oRow = oCtx.getObject();
				oRow.Taxcode = sKey;
				oRow.Description = sText.split(" - ")[1] || "";
				oCtx.getModel().refresh(true);
			}
			var oCheckBox = this.getView().byId("id_check");
			oCheckBox.setSelected(true)

			this.fnCalculateTax();
		},
		formatTaxCodePoRef: function(sMwskz, sText1) {
			if (sMwskz && sText1) {
				return sMwskz + " - " + sText1;
			}
			return sMwskz || "";
		},

		fn_TaxCode_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mwskz", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_TaxConfrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var Tax_Desc = oSelectedItem.getBindingContext("JSTaxCode").getProperty("Text1");
				var Tax_Code = oSelectedItem.getBindingContext("JSTaxCode").getProperty("Mwskz");

				var oTabModel1 = this.getView().getModel("JSInvdet");
				if (oTabModel1) {
					var oTabData1 = oTabModel1.getData();
					oTabData1[vTaxID].Mwskz = Tax_Code;
					oTabData1[vTaxID].Taxdesc = Tax_Desc;
					oTabModel1.refresh();
					this.fnCalculateTax();
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		formatTaxCode: function(sCode, sDesc) {
			if (sCode && sDesc) {
				return sCode + " - " + sDesc;
			}
			return sCode || "";
		},

		// yasin add copy delete end

		fnReject: function(oEvent) {
			var vQueid = Balance_parameters.Queid;
			if (vQueid) {
				if (!this.oReject) {
					this.oReject = sap.ui.xmlfragment(
						"FSC360NEW.fragment.Reject", this);
					this.getView().addDependent(this.oReject);
				}
				this.oReject.open();
				sap.ui.getCore().byId('id_Remark_Rejct').setValue('');
				if (oState === "Hold") {

					sap.ui.getCore().byId('id_revreasonBox').setVisible(true);
				} else {
					sap.ui.getCore().byId('id_revreasonBox').setVisible(false);
				}

			} else {
				sap.m.MessageToast.show('Please Select Queid');
			}
		},
		fnCloseReject: function() {
			this.oReject.close();
			this.oReject.destroy();
				this.oReject = null;
			
		},
		fnRejectRemark: function() {
			var Queueid = parseInt(this.getView().getModel("JSInvdethead").getData()[0].Qid);
			var vDocuNum = parseInt(this.getView().getModel("JSInvdethead").getData()[0].Documentnumber);
			var that = this;

			var msgtext = 'Do you want to Reject this Queue ID - ' + Queueid;

			var vRemark = sap.ui.getCore().byId("id_Remark_Rejct").getValue();
			var vReason = sap.ui.getCore().byId("id_SelReversal").getSelectedKey();

			if (vRemark === '') {
				sap.m.MessageToast.show('Please Enter the Reject comments');
				return;
			}

			sap.m.MessageBox.confirm(msgtext, {
				icon: sap.m.MessageBox.Icon.CONFIRMATION,
				title: "Confirmation",
				styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
				actions: ['Yes', 'No'],
				defaultAction: sap.m.MessageBox.Action.YES,
				onClose: function(oAction) {
					if (oAction === "Yes") {
						oGlobalBusyDialog.open();
						that.oReject.close();
							that.oReject.destroy();
				that.oReject = null;

						var oEntity = {
							Qid: Balance_parameters.Queid,
							IvText: vRemark,
							Flag: 'R',
							Stgrd: vReason,
							NavItemTabDetails: [],
							NavHead: that.getView().getModel("JSInvdethead").getData(),
							NavTaxTab: [],
							NavReturn: []
						};

						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

						oModel.create('/DEEPHEADSet', oEntity, {
							success: function(oData, oResponse) {
								if (oData.NavReturn.results[0].Type === 'E') {
									var errmsg = oData.NavReturn.results[0].Message;
									that.openErrorDialog(errmsg);
								} else {
									var vSucces = oData.NavReturn.results[0].Message;
									that.openSuccessDialog(vSucces);
								}
								// if (oData.NavReturn.results[0].Type === 'E') {
								//     var errmsg = oData.NavReturn.results[0].Message;
								//     that.openErrorDialog(errmsg);
								// } else {
								//     var vSucces = oData.NavReturn.results[0].Message;
								//     sap.m.MessageBox.success(vSucces, {
								//         actions: [MessageBox.Action.OK],
								//         styleClass: "cl_message_box",
								//         emphasizedAction: MessageBox.Action.OK,
								//         onClose: function (sAction) {
								//             if (sAction === "OK") {
								//                 that.oReject.close();
								//                 that.oRouter = that.getOwnerComponent().getRouter();
								//                 that.oRouter.navTo('Fulfilment', { btnstat: " " });
								//             }
								//         }
								//     });
								// }
								oGlobalBusyDialog.close();
							},
							error: function() {
								oGlobalBusyDialog.close();
				// 				that.oReject.close();
				// 				that.oReject.destroy();
				// that.oReject = null;
								that.openErrorDialog('Http Error');
							}
						});
					}
				}
			});

			// ply custom button styles after DOM renders
			setTimeout(function() {
				var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
				if (buttons[0]) buttons[0].classList.add("yesButtonHack");
				if (buttons[1]) buttons[1].classList.add("noButtonHack");
			}, 100);
		},
		fn_Post_Validation: function() {
			var mes = "";
			var war_mes = "";

			var arr = this.getView().getModel("JSInvdethead").getData();
			var arr_Item = this.getView().getModel("JSInvdet").getData();

			if (arr[0].Invdt === null) {
				mes = "Enter the Invoice Date \n";
			}

			if (arr[0].Postingdate === null) {
				mes += "Enter the Posting Date \n";
			}

			if (arr[0].Waers === "") {
				mes += "Enter the Currency \n";
			}

			if (arr[0].Ntamt === undefined) {
				mes += "Enter the Amount \n";
			}

			if (arr[0].Invno === "") {
				mes += "Enter the Invoice Number \n";
			}

			if (this.getView().byId("id_vendor").getText() === '') {
				mes += "Select the Vendor \n";
			}

			if (this.getView().byId("id_BaseDate").getValue() === "") {
				mes += "Enter the Baseline Date\n";
			}

			if (this.getView().byId("id_BaseDate").getValueState() !== "None") {
				mes += this.getView().byId("id_BaseDate").getValueStateText() + "\n";
			}

			// var Data = 
			for (var i = 0; i < arr_Item.length; i++) {
				if (arr_Item[i].Saknr === "") {
					mes += "Enter the G/L Account at Position : " + parseInt(i + 1) + "\n";
				}

				if ((arr_Item[i].Kostl === "") | (arr_Item[i].Kostl === undefined)) {
					mes += "Enter the Cost Center at Position : " + parseInt(i + 1) + "\n";
				}
				if (arr_Item[i].Netpr === "") {
					mes += "Enter the Amount at Position : " + parseInt(i + 1) + "\n";
				}

			}

			return mes;

		},
		fn_Down_Validation: function() {
			var mes = "";
			var war_mes = "";

			var arr = this.getView().getModel("JSInvdethead").getData();
			var arr_Item = this.getView().getModel("JSInvdet").getData();

			if (arr[0].Invdt === null) {
				mes = "Enter the Invoice Date \n";
			}

			if (arr[0].Postingdate === null) {
				mes += "Enter the Posting Date \n";
			}

			if (arr[0].Waers === "") {
				mes += "Enter the Currency \n";
			}

			if (arr[0].Ntamt === undefined) {
				mes += "Enter the Amount \n";
			}
			if (arr[0].Barcode === "") {
				mes += "Enter the Header Text \n";
			}
			if (arr[0].SpGlInd === "") {
				mes += "Enter Special GL indicator \n";
			}

			if (this.getView().byId("id_vendor").getText() === '') {
				mes += "Select the Vendor \n";
			}

			for (var i = 0; i < arr_Item.length; i++) {

				if (arr_Item[i].Netpr === "") {
					mes += "Enter the Amount at Position : " + parseInt(i + 1) + "\n";
				}
				if (arr_Item[i].Mwskz === "") {
					mes += "Enter Tax Code at Position : " + parseInt(i + 1) + "\n";
				}

			}

			return mes;

		},

		fn_PO_Validation: function() {
			var mes = "";
			var war_mes = "";

			var arr = this.getView().getModel("JSInvdethead").getData();
			var arr_Item = this.getView().getModel("JSPORefDet").getData();
			var arr_material = this.getView().getModel("JSMatdet").getData();

			if (arr[0].Invdt === null) {
				mes = "Enter the Invoice Date \n";
			}

			if (arr[0].Postingdate === null) {
				mes += "Enter the Posting Date \n";
			}

			if (arr[0].Waers === "") {
				mes += "Enter the Currency \n";
			}

			if (arr[0].Ntamt === undefined) {
				mes += "Enter the Amount \n";
			}

			if (arr[0].Invno === "") {
				mes += "Enter the Invoice Number \n";
			}

			if (this.getView().byId("id_vendor").getText() === '' && arr[0].Substs !== '01' && arr[0].Scanfrom !== 'AB') //01 - STO Assign BC
			{
				mes += "Select the Vendor \n";
			}

			if (this.getView().byId("id_BaseDate").getValue() === "") {
				mes += "Enter the Baseline Date\n";
			}

			if (this.getView().byId("id_BaseDate").getValueState() !== "None") {
				mes += this.getView().byId("id_BaseDate").getValueStateText() + "\n";
			}

			// var Data = 
			for (var i = 0; i < arr_Item.length; i++) {
				if (arr_Item[i].Amount === "") {
					mes += "Enter the Amount at Position : " + parseInt(i + 1) + "\n";
				}
			}
			for (var j = 0; j < arr_material.length; j++) {
				if (arr_material[j].Matnr) {
					if (arr_material[j].Menge === "") {
						mes += "Enter the Quantity at Material Tab : " + parseInt(j + 1) + "\n";
					}
					if (arr_material[j].Plnt === "") {
						mes += "Enter the Plant at Material Tab : " + parseInt(j + 1) + "\n";
					}
					if (arr_material[j].Meins === "") {
						mes += "Enter the Base Unit at Material Tab : " + parseInt(j + 1) + "\n";
					}
				}
			}

			for (var i = 0; i < arr_Item.length; i++) {
				if (arr_Item[i].Taxcode === "") {
					mes += "Enter the Taxcode at Position : " + parseInt(i + 1) + "\n";
				}
			}

			if (this.getView().byId("id_payment_term").getValue().split(' ')[0] === '') {
				mes += "Enter the Payment Terms \n";
			}

			return mes;

		},
		fn_Park_Simulate: function() {
			var oSelectlen = sap.ui.getCore().byId('id_ChkList').getSelectedIndices().length;
			var oChecklen = this.getView().getModel('JMChecklist').getData().length;
			if (oChecklen !== 0 && oChecklen === oSelectlen) {
				var that = this;
				oGlobalBusyDialog.open();
				var obj = {};
				if (Balance_parameters.UserType === 'W') {
					obj.Flag = 'W';
					obj.IvAction = 'PARK';
				} else if (Balance_parameters.UserType === 'I') {
					obj.Flag = 'I';
					obj.IvAction = 'PARK';
				}
				var vCheck = this.getView().byId("id_check").getSelected();
				if (vCheck === true) {
					obj.Taxind = 'X';
				} else {
					obj.Taxind = '';
				}
				obj.Baseline = this.getView().byId("id_BaseDate").getDateValue();
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				obj.NavHead = this.getView().getModel("JSInvdethead").getData();
				obj.NavHead[0].Zterm = this.getView().byId("id_payment_term").getValue().split(' ')[0];
				var data = this.getView().getModel("JSInvdethead").getData()[0];
				//Added by Manosankari start
				var oAmtSplitData = this.getView().getModel("amountsplit").getData();
				obj.NavAmtsplit = oAmtSplitData.AmountSplit ? oAmtSplitData.AmountSplit : [];
				if (Array.isArray(obj.NavAmtsplit)) {
					obj.NavAmtsplit = obj.NavAmtsplit.map(item => ({
						Ntamt: Number(item.Amount) ? Number(item.Amount).toFixed(2) : "0.00", //Added by Lokesh R on 21.10.2025
						Mwskz: item.TaxCode || "",
						Zlsch: item.PaymentMode || "",
						Zterm: item.PaymentTerm || "",

					}));
				}
				//Added by Manosankari end
				if (data.Transtype <= 3 || data.Transtype == 8) {
					obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
					obj.NavMaterialDet = that.getView().getModel("JSMatdet").getData();
					var aInvData = this.getView().getModel("JSInvdet").getData();
					// Check if all Saknr and Mk fields are empty
					var bAllEmpty = aInvData.every(function(item) {
						return (!item.Saknr || item.Saknr.trim() === "") &&
							(!item.Mwskz || item.Mwskz.trim() === "");
					});
					// Only set NavGetItemValues if at least one record is NOT empty
					if (!bAllEmpty) {
						obj.NavGetItemValues = aInvData;
					}
				} else if (data.Transtype === '4' | data.Transtype <= "6") {
					obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
				}
				obj.NavTaxTab = this.getView().getModel("JSTaxTab").getData();
				obj.NavReturn = [];
				if (this.getView().getModel('JMError').getData().length === 0) {
					oModel.create('/DEEPHEADSet', obj, {
						success: function(oData) {
							that.Simulate_frag.close();
							oGlobalBusyDialog.close();

							// if (oData.NavReturn != null) {
							if (oData.NavReturn.results.length !== 0) {
								var vType = oData.NavReturn.results[0].Type;

								if (vType === 'E') {
									var errmsg = oData.NavReturn.results[0].Message;
									that.openErrorDialog(errmsg);
								} else if (vType === 'S') {

									var vSuccessMsg = oData.NavReturn.results[0].Message;
									that.openSuccessDialog(vSuccessMsg);
									// sap.m.MessageBox.success(oData.NavReturn.results[0].Message, {
									// 	actions: [MessageBox.Action.OK],
									// 	styleClass: "cl_message_box",
									// 	emphasizedAction: MessageBox.Action.OK,
									// 	onClose: function(sAction) {
									// 		if (sAction === "OK") {
									// 			that.oRouter = that.getOwnerComponent().getRouter();

									// 			that.oRouter.navTo('Fulfilment', {
									// 				btnstat: " "
									// 			});
									// 		}
									// 	}
									// });
								}
							} else {
								// sap.m.MessageBox.success("The Document " + parseInt(oData.NavHead.results[0].Documentnumber) + " Successfully Posted", {
								// 	actions: [MessageBox.Action.OK],
								// 	styleClass: "cl_message_box",
								// 	emphasizedAction: MessageBox.Action.OK,
								// 	onClose: function(sAction) {
								// 		if (sAction === "OK") {
								// 			that.oRouter = that.getOwnerComponent().getRouter();
								// 			that.oRouter.navTo('Fulfilment', {
								// 				btnstat: " "
								// 			});
								// 		}
								// 	}
								// });
								var vDocNo = parseInt(oData.NavHead.results[0].Documentnumber);
								var vSuccessMsg = "The Document " + vDocNo + " Successfully Posted";
								that.openSuccessDialog(vSuccessMsg);
							}

						},
						error: function() {
							// sap.m.MessageBox.error("Error while Posting the Queue Id");
							that.openErrorDialog('Error while Posting the Queue Id');
							oGlobalBusyDialog.close();
						}
					});
				} else if (this.getView().getModel('JMError').getData().length != 0) {
					if (!this.Error_frag) {
						this.Error_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Error", this);
						this.getView().addDependent(this.Error_frag);
					}
					this.Error_frag.open();
					oGlobalBusyDialog.close();
				}
			} else {
				sap.m.MessageToast.show("Please Check all the validations");
			}
		},

		fn_Post_Simulate: function() {

			var oSelectlen = sap.ui.getCore().byId('id_ChkList').getSelectedIndices().length;
			var oChecklen = this.getView().getModel('JMChecklist').getData().length;
			if (oChecklen !== 0 && oChecklen === oSelectlen) {
				var that = this;
				// oGlobalBusyDialog.open();
				var obj = {};
				if (Balance_parameters.UserType === 'W') {
					obj.Flag = 'W';
					obj.IvAction = ' ';
				} else if (Balance_parameters.UserType === 'I') {
					obj.Flag = 'I';
					obj.IvAction = ' ';
				}
				var vCheck = this.getView().byId("id_check").getSelected();
				if (vCheck === true) {
					obj.Taxind = 'X';
				} else {
					obj.Taxind = '';
				}
				obj.Baseline = this.getView().byId("id_BaseDate").getDateValue();
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				obj.NavHead = this.getView().getModel("JSInvdethead").getData();
				obj.NavHead[0].Zterm = this.getView().byId("id_payment_term").getValue().split(' ')[0];
				var data = this.getView().getModel("JSInvdethead").getData()[0];
				var oAmtSplitData = this.getView().getModel("amountsplit").getData();
				obj.NavAmtsplit = oAmtSplitData.AmountSplit ? oAmtSplitData.AmountSplit : [];
				if (Array.isArray(obj.NavAmtsplit)) {
					obj.NavAmtsplit = obj.NavAmtsplit.map(item => ({
						Ntamt: Number(item.Amount) ? Number(item.Amount).toFixed(2) : "0.00", //Added by Lokesh R on 21.10.2025
						Mwskz: item.TaxCode || "",
						Zlsch: item.PaymentMode || "",
						Zterm: item.PaymentTerm || "",

					}));
				}
				if (data.Transtype <= 3 || data.Transtype == 8) {
					obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
					obj.NavMaterialDet = that.getView().getModel("JSMatdet").getData();
					var aInvData = this.getView().getModel("JSInvdet").getData();
					// Check if all Saknr and Mk fields are empty
					var bAllEmpty = aInvData.every(function(item) {
						return (!item.Saknr || item.Saknr.trim() === "") &&
							(!item.Mwskz || item.Mwskz.trim() === "");
					});
					// Only set NavGetItemValues if at least one record is NOT empty
					if (!bAllEmpty) {
						obj.NavGetItemValues = aInvData;
					}
				} else if (data.Transtype === '4' | data.Transtype <= "6") {
					obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
				}
				obj.NavTaxTab = this.getView().getModel("JSTaxTab").getData();
				obj.NavReturn = [];
				// obj.NavWithHoldTax = this.getView().getModel("JSWithHold").getData();
				//Added by Manosankari WHT cal. start
						    var aWHT = this.getView().getModel("JSWithHold").getData();

    // FILTER → KEEP ONLY valid lines
    var aFiltered = aWHT.filter(function (row) {
        return row.WtWithcd && row.WtWithcd.trim() !== "" && row.Witht && row.Witht.trim() !== "";
    });

    obj.NavWithHoldTax = aFiltered; 
    //Added by Manosankari WHT cal. end
				if (this.getView().getModel('JMError').getData().length === 0) {
					oGlobalBusyDialog.open();
					oModel.create('/DEEPHEADSet', obj, {
						success: function(oData) {
							that.Simulate_frag.close();
							oGlobalBusyDialog.close();
							var vDp_m;
							if (that.getView().getModel("JDPClear").getData()) {
								vDp_m = that.getView().getModel("JDPClear").getData();
							}
							// if (type === 'S' && vDp_m.length == 0) {
							// if (oData.NavReturn != null) {
							if (oData.NavReturn.results.length !== 0) {
								var vType = oData.NavReturn.results[0].Type;

								if (vType === 'E') {
									// sap.m.MessageBox.error(oData.NavReturn.results[0].Message);
									var errmsg = oData.NavReturn.results[0].Message;
									that.openErrorDialog(errmsg);
								} else if (vType === 'S') {
									that._lastSuccessMsg = oData.NavReturn.results[0].Message;

									var glModel = that.getView().getModel("JSInvdet").getData();
									var hasGL = false;

									if (glModel && glModel.length > 0) {
										// loop through items and check required fields
										hasGL = glModel.some(function(item) {
											return item.Netpr || item.Kostl || item.Mwskz || item.Saknr;
										});
									}
									var matModel = that.getView().getModel("JSMatdet").getData();
									var hasMat = false;

									if (matModel && matModel.length > 0) {
										hasMat = matModel.some(function(item) {
											return item.Zuumb || item.Mwskz;
										});
									}
									if ((hasGL || hasMat) && oData.NavHead.results[0].Transtype != "2" && oData.NavHead.results[0].Transtype != "2" && oData.NavHead.results[0].Transtype != "8") {
										oGlobalBusyDialog.close();
										if (!that.Confirm_frag) {
											that.Confirm_frag = sap.ui.xmlfragment("idsubseq", "FSC360NEW.fragment.Subseqpost", that);
											that.getView().addDependent(that.Confirm_frag);
										}
										that.Confirm_frag.open();
									} else {
										// sap.m.MessageBox.success(oData.NavReturn.results[0].Message, {
										// 	actions: [MessageBox.Action.OK],
										// 	styleClass: "cl_message_box",
										// 	emphasizedAction: MessageBox.Action.OK,
										// 	onClose: function(sAction) {
										// 		if (sAction === "OK") {
										// 			that.oRouter = that.getOwnerComponent().getRouter();
										// 			that.oRouter.navTo('Fulfilment', {
										// 				btnstat: " "
										// 			});
										// 		}
										// 	}
										// });
										var vSuccessMsg = oData.NavReturn.results[0].Message;
										that.openSuccessDialog(vSuccessMsg);
									}
								}
							} else

							{
								that._lastSuccessMsg = "The Document " + parseInt(oData.NavHead.results[0].Documentnumber) + " Successfully Posted";
								that._lastDocNumber = oData.NavHead.results[0].Documentnumber;
								var glModel = that.getView().getModel("JSInvdet").getData();
								var hasGL = false;

								if (glModel && glModel.length > 0) {
									// loop through items and check required fields
									hasGL = glModel.some(function(item) {
										return item.Netpr || item.Kostl || item.Mwskz || item.Saknr;
									});
								}
								var matModel = that.getView().getModel("JSMatdet").getData();
								var hasMat = false;

								if (matModel && matModel.length > 0) {
									hasMat = matModel.some(function(item) {
										return item.Zuumb || item.Mwskz;
									});
								}

								if ((hasGL || hasMat) && oData.NavHead.results[0].Transtype != "2" && oData.NavHead.results[0].Transtype != "3" && oData.NavHead.results[0].Transtype != "8") {
									oGlobalBusyDialog.close();
									// Open confirm fragment
									if (!that.Confirm_frag) {
										that.Confirm_frag = sap.ui.xmlfragment("idsubseq", "FSC360NEW.fragment.Subseqpost", that);
										that.getView().addDependent(that.Confirm_frag);
									}
									that.Confirm_frag.open();
								} else {
									// Normal success message flow
									// sap.m.MessageBox.success(
									// 	"The Document " + parseInt(oData.NavHead.results[0].Documentnumber) + " Successfully Posted", {
									// 		actions: [MessageBox.Action.OK],
									// 		styleClass: "cl_message_box",
									// 		emphasizedAction: MessageBox.Action.OK,
									// 		onClose: function(sAction) {
									// 			if (sAction === "OK") {
									// 				that.oRouter = that.getOwnerComponent().getRouter();
									// 				that.oRouter.navTo('Fulfilment', {
									// 					btnstat: " "
									// 				});
									// 			}
									// 		}
									// 	}
									// );
									var vDocNo = parseInt(oData.NavHead.results[0].Documentnumber);
									var vSuccessMsg = "The Document " + vDocNo + " Successfully Posted";
									that.openSuccessDialog(vSuccessMsg);
								}
							}

						},
						error: function() {
							// sap.m.MessageBox.error("Error while Posting the Queue Id");
							that.openErrorDialog('Error while Posting the Queue Id');
							oGlobalBusyDialog.close();
						}
					});
				} else if (this.getView().getModel('JMError').getData().length != 0) {
					if (!this.Error_frag) {
						this.Error_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Error", this);
						this.getView().addDependent(this.Error_frag);
					}
					this.Error_frag.open();
					oGlobalBusyDialog.close();
				}
			}
			// else {
			// 	sap.m.MessageToast.show("Please Check all the validations");
			// }
			else {
				// sap.m.MessageBox.error("Please check all the validations", {
				// 	title: "Validation Error",
				// 	actions: [sap.m.MessageBox.Action.OK],
				// 	styleClass: "cl_message_box",
				// 	emphasizedAction: sap.m.MessageBox.Action.OK
				// });
				this.openErrorDialog('Please check all the validations');
			}
		},
		fn_YesPress: function() {
			var that = this;
			var postingType = sap.ui.core.Fragment.byId("idsubseq", "idPostingType").getSelectedKey();
			var glAccount = sap.ui.core.Fragment.byId("idsubseq", "idGLAccount").getSelectedKey();
			var costCenter = sap.ui.core.Fragment.byId("idsubseq", "idCostCenter").getSelectedKey();
			var taxcode = sap.ui.core.Fragment.byId("idsubseq", "idTaxCode").getSelectedKey();
			// Build object same as original posting
			var obj = {};
			if (Balance_parameters.UserType === 'W') {
				obj.Flag = 'W';
				obj.IvAction = '';
			} else if (Balance_parameters.UserType === 'I') {
				obj.Flag = 'I';
				obj.IvAction = '';
			}

			// add the unique flag from dropdown
			obj.Subseqflag = postingType; // D / C / F
			var vCheck = that.getView().byId("id_check").getSelected();
			if (vCheck === true) {
				obj.Taxind = 'X';
			} else {
				obj.Taxind = '';
			}

			// Include the GL & Cost Center values if needed
			obj.Glaccount = glAccount;
			obj.Costcenter = costCenter;
			obj.Taxcode = taxcode;
			obj.Documentnumber = that._lastDocNumber;
			// Reuse your existing models
			obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
			obj.NavMaterialDet = this.getView().getModel("JSMatdet").getData();
			obj.NavHead = this.getView().getModel("JSInvdethead").getData();
			obj.NavTaxTab = this.getView().getModel("JSTaxTab").getData();
			obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
			obj.NavReturn = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oGlobalBusyDialog.open();
			oModel.create("/DEEPHEADSet", obj, {
				success: function(oData) {
					oGlobalBusyDialog.close();
					that.Confirm_frag.close();
					that.Confirm_frag.destroy();
					that.Confirm_frag = null;

					if (oData.NavReturn && oData.NavReturn.results.length > 0 && oData.NavHead.results[0].Documentnumber !== "") {
						var vType = oData.NavReturn.results[0].Type;
						if (vType === 'E') {
							var vError = "The Invoice Document " + oData.NavHead.results[0].Documentnumber + " Successfully Posted\n\n" +
								"Subsequent Document Posting Error: " + oData.NavReturn.results[0].Message;
							sap.m.MessageBox.information(
								vError, {
									actions: [sap.m.MessageBox.Action.OK],
									emphasizedAction: sap.m.MessageBox.Action.OK,
									onClose: function(oAction) {
										if (oAction === sap.m.MessageBox.Action.OK) {
											that.oRouter = that.getOwnerComponent().getRouter();
											that.oRouter.navTo("Fulfilment", {
												btnstat: " "
											});
										}
									}
								}
							);
						} else {
							// sap.m.MessageBox.success(oData.NavReturn.results[0].Message, {
							// 	actions: [sap.m.MessageBox.Action.OK],
							// 	emphasizedAction: sap.m.MessageBox.Action.OK,
							// 	onClose: function(oAction) {
							// 		if (oAction === sap.m.MessageBox.Action.OK) {
							// 			that.oRouter = that.getOwnerComponent().getRouter();
							// 			that.oRouter.navTo("Fulfilment", {
							// 				btnstat: " "
							// 			});
							// 		}
							// 	}
							// });
							var vSuccessMsg = oData.NavReturn.results[0].Message;
							that.openSuccessDialog(vSuccessMsg);
						}
					} else {
						var vSuccess;
						vSuccess = "The Invoice Document " + parseInt(oData.NavHead.results[0].Documentnumber) + " Successfully Posted\n\n"
						if (postingType === 'D') {
							vSuccess = vSuccess + "The Subsequent Debit Document " + oData.NavHead.results[0].Subdocnum + " Successfully Posted";
						} else if (postingType === 'C') {
							vSuccess = vSuccess + "The Subsequent Credit Document " + oData.NavHead.results[0].Subdocnum + " Successfully Posted";
						} else if (postingType === 'F') {
							vSuccess = vSuccess + "The FI Credit Document " + oData.NavHead.results[0].Subdocnum + " Successfully Posted";
						}
						// sap.m.MessageBox.success(
						//     vSuccess,
						//     {
						//         actions: [sap.m.MessageBox.Action.OK],
						//         emphasizedAction: sap.m.MessageBox.Action.OK,
						//         onClose: function (oAction) {
						//         if (oAction === sap.m.MessageBox.Action.OK) {
						//             that.oRouter = that.getOwnerComponent().getRouter();
						//             that.oRouter.navTo("Fulfilment", { btnstat: " " });
						//         }
						//         }
						//     }
						// );
						that.openSuccessDialog(vSuccess);
					}
				},
				error: function(oError) {
					oGlobalBusyDialog.close();
					that.Confirm_frag.close();
					that.Confirm_frag.destroy();
					that.Confirm_frag = null;
					// sap.m.MessageBox.error("Error during subsequent posting");
					that.openErrorDialog('Error during subsequent posting');
				}
			});
		},
		fn_NoPress: function() {
			var that = this;
			that.Confirm_frag.close();
			that.Confirm_frag.destroy();
			that.Confirm_frag = null;

			// fallback if message was not set
			if (that.getView().getModel("JDPClear").getData()) {
				var vDp_m = that.getView().getModel("JDPClear").getData();
			}

			var msg = that._lastSuccessMsg || "Document successfully posted";
			if (vDp_m.Length == 0) {
				// sap.m.MessageBox.success(msg, {
				// 	actions: [sap.m.MessageBox.Action.OK],
				// 	styleClass: "cl_message_box",
				// 	emphasizedAction: sap.m.MessageBox.Action.OK,
				// 	onClose: function(sAction) {
				// 		if (sAction === "OK") {
				// 			that.oRouter = that.getOwnerComponent().getRouter();
				// 			that.oRouter.navTo("Fulfilment", {
				// 				btnstat: " "
				// 			});
				// 		}
				// 	}
				// });
				that.openSuccessDialog(msg);

			} else {
				var vmsg = msg + '\n' + 'Do you want to clear Downpayment?Click yes to proceed';
				sap.m.MessageBox.confirm(vmsg, {
					icon: sap.m.MessageBox.Icon.CONFIRMATION,
					title: "Confirmation",
					styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
					actions: ['Yes', 'No'],
					defaultAction: sap.m.MessageBox.Action.YES,
					onClose: function(oAction) {
						if (oAction === "Yes") {
							that.fn_downpay_clear_call();
						} else {
							// that.fnNavFulfilment();
								that.openSuccessDialog(msg);
							// that.fn_nav_to_fulfil();
						}
					}
				});

			}
		},
		onPostingTypeChange: function(oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey();

			var vbGL = sap.ui.core.Fragment.byId("idsubseq", "vbGLAccount");
			var vbCC = sap.ui.core.Fragment.byId("idsubseq", "vbCostCenter");
			var vbTax = sap.ui.core.Fragment.byId("idsubseq", "vbTax");

			if (vbGL && vbCC) {
				if (selectedKey === "F") {
					vbGL.setVisible(true);
					vbCC.setVisible(true);
					vbTax.setVisible(true);
				} else {
					vbGL.setVisible(false);
					vbCC.setVisible(false);
					vbTax.setVisible(false);
				}
			} else {
				
			}
		},
		fn_POST: function() {
			var call = "Post";

			oGlobalBusyDialog.open();
			var data = this.getView().getModel("JSInvdethead").getData()[0];
			if (data.Transtype <= 3 || data.Transtype == 8) {
				var mes = this.fn_PO_Validation();
			} else if (data.Transtype === '4' | data.Transtype <= "5") {
				var mes = this.fn_Post_Validation();
			} else if (data.Transtype === '6') {
				var mes = this.fn_Down_Validation();
			}

			if (mes != undefined) {

				var oController = this;

				if (mes != "") {
					// sap.m.MessageBox.error(mes);
						this.openErrorDialog(msg);
					oGlobalBusyDialog.close();
				} else if (mes === "") {

					var war_mes = "";

					if (war_mes === "") {

						if (Balance_parameters.UserType === 'W') {
							this.fn_Check_Duplicate_INVO(call);
						} else if (Balance_parameters.UserType === 'I') {
							this.fn_PostConfirmation();
						}
					} else if (war_mes != "") {
						sap.m.MessageBox.warning(war_mes + "\n Do you want to proceed ?", {
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							styleClass: ".cl_SettingDialog.sapMDialog fragmentButton fragmentButtonwarn",
							emphasizedAction: MessageBox.Action.YES,
							onClose: function(sAction) {
								if (sAction === "YES") {
									if (Balance_parameters.UserType === 'W') {
										oController.fn_Check_Duplicate_INVO(call);
									} else if (Balance_parameters.UserType === 'I') {
										oController.fn_PostConfirmation();
									}
								}
							}
						});
							setTimeout(function () {
        					var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
    				    	if (buttons[0]) buttons[0].classList.add("yesButtonHack");
					    	if (buttons[1]) buttons[1].classList.add("noButtonHack");
    					}, 100);

					}

				}

				// }
				oGlobalBusyDialog.close();

			}

		},

		fn_POST: function() {
			var call = "Post";

			oGlobalBusyDialog.open();
			var data = this.getView().getModel("JSInvdethead").getData()[0];
			if (data.Transtype <= 3 || data.Transtype == 8) {
				var mes = this.fn_PO_Validation();
			} else if (data.Transtype === '4' | data.Transtype <= "5") {
				var mes = this.fn_Post_Validation();
			} else if (data.Transtype === '6') {
				var mes = this.fn_Down_Validation();
			}

			if (mes != undefined) {

				var oController = this;

				if (mes != "") {
					// sap.m.MessageBox.error(mes);
						this.openErrorDialog(msg);
					oGlobalBusyDialog.close();
				} else if (mes === "") {

					var war_mes = "";

					if (war_mes === "") {

						if (Balance_parameters.UserType === 'W') {
							this.fn_Check_Duplicate_INVO(call);
						} else if (Balance_parameters.UserType === 'I') {
							this.fn_PostConfirmation();
						}
					} else if (war_mes != "") {
						sap.m.MessageBox.warning(war_mes + "\n Do you want to proceed ?", {
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							styleClass: ".cl_SettingDialog.sapMDialog fragmentButton fragmentButtonwarn",
							emphasizedAction: MessageBox.Action.YES,
							onClose: function(sAction) {
								if (sAction === "YES") {
									if (Balance_parameters.UserType === 'W') {
										oController.fn_Check_Duplicate_INVO(call);
									} else if (Balance_parameters.UserType === 'I') {
										oController.fn_PostConfirmation();
									}
								}
							}
						});
						setTimeout(function() {
							var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
							if (buttons[0]) buttons[0].classList.add("yesButtonHack");
							if (buttons[1]) buttons[1].classList.add("noButtonHack");
						}, 100);

					}

				}

				// }
				oGlobalBusyDialog.close();

			}

		},

		fn_Park_document_Post: function() {
			var Queueid = parseInt(this.getView().getModel("JSInvdethead").getData()[0].Qid);
			var vDocuNum = parseInt(this.getView().getModel("JSInvdethead").getData()[0].Documentnumber);
			var msgtext = 'Do you want to Post this Queue ID ' + Queueid + ' Document No. ' + vDocuNum + ' ? ';
			var that = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				icon: 'sap-icon://question-mark',
				type: 'Message',
				// state: "Success",
				content: new sap.m.Text({
					text: msgtext
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function() {
						oGlobalBusyDialog.open();
						var obj = {};
						if (Balance_parameters.UserType === 'W') {
							obj.Flag = 'W';
							obj.IvAction = 'POST';
						} else if (Balance_parameters.UserType === 'I') {
							obj.Flag = 'I';
							obj.IvAction = 'POST';
						}

						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
						obj.NavHead = that.getView().getModel("JSInvdethead").getData();

						obj.NavReturn = [];

						oModel.create('/DEEPHEADSet', obj, {
							success: function(oData) {
								oGlobalBusyDialog.close();

								if (oData.NavReturn.results.length !== 0) {
									var vType = oData.NavReturn.results[0].Type;

									if (vType === 'E') {
										dialog.close();
										oGlobalBusyDialog.close();
										var errmsg = oData.NavReturn.results[0].Message;
										that.openErrorDialog(errmsg);
									} else if (vType === 'S') {

										dialog.close();
										oGlobalBusyDialog.close();

										// sap.m.MessageBox.success(oData.NavReturn.results[0].Message, {
										// 	actions: [MessageBox.Action.OK],
										// 	styleClass: "cl_message_box",
										// 	emphasizedAction: MessageBox.Action.OK,
										// 	onClose: function(sAction) {
										// 		if (sAction === "OK") {
										// 			that.oRouter = that.getOwnerComponent().getRouter();

										// 			that.oRouter.navTo('Fulfilment', {
										// 				btnstat: " "
										// 			});
										// 		}
										// 	}
										// });
										var vSuccessMsg = oData.NavReturn.results[0].Message;
										that.openSuccessDialog(vSuccessMsg);
									}
								} else {
									// sap.m.MessageBox.success("The Document " + parseInt(oData.NavHead.results[0].Documentnumber) +
									// 	" Successfully Posted", {
									// 		actions: [MessageBox.Action.OK],
									// 		styleClass: "cl_message_box",
									// 		emphasizedAction: MessageBox.Action.OK,
									// 		onClose: function(sAction) {
									// 			if (sAction === "OK") {
									// 				that.oRouter = that.getOwnerComponent().getRouter();
									// 				// that.oRouter.navTo('Fulfilment');
									// 				that.oRouter.navTo('Fulfilment', {
									// 					btnstat: " "
									// 				});
									// 			}
									// 		}
									// 	});
									var vDocNo = parseInt(oData.NavHead.results[0].Documentnumber);
									var vSuccessMsg = "The Document " + vDocNo + " Successfully Posted";
									that.openSuccessDialog(vSuccessMsg);
								}

							},
							error: function() {
								// sap.m.MessageBox.error("Error while Posting the Queue Id");
									that.openErrorDialog("Error while Posting the Queue Id");
								oGlobalBusyDialog.close();
							}
						});

					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function() {
						dialog.close(); // Closing the message box
						oGlobalBusyDialog.close();
					}
				}),

				afterClose: function() {
					dialog.destroy(); // Destroying sall message boxes
					oGlobalBusyDialog.close();
				}
			});
		dialog.addStyleClass("fragmentButton cl_SettingDialog");
			dialog.open(); // To open the dialog box
setTimeout(function () {
    // buttons are inside dialog DOM
    var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
    if (buttons[0]) buttons[0].classList.add("yesButtonHack");
    if (buttons[1]) buttons[1].classList.add("noButtonHack");
}, 100);
		},
		fn_PostConfirmation: function() {

			var Queueid = parseInt(this.getView().getModel("JSInvdethead").getData()[0].Qid);
			var that = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				icon: 'sap-icon://question-mark',
				type: 'Message',
				// state: "Success",
				styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
				content: new sap.m.Text({
					text: 'Do you want to Post this Queue ID - ' + Queueid
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function() {
						oGlobalBusyDialog.open();
						var obj = {};
						obj.Flag = 'I';
						obj.IvAction = ' ';
						obj.NavGetItemValues = [];
						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
						obj.NavHead = that.getView().getModel("JSInvdethead").getData();
						obj.NavGetItemValues = that.getView().getModel("JSInvdet").getData();
						obj.NavReturn = [];
						oModel.create('/DEEPHEADSet', obj, {

							success: function(oData) {
								dialog.close();
								var type = oData.NavReturn.results[0].Type;
								if (type === 'S') {
									oGlobalBusyDialog.close();
									// sap.m.MessageBox.success(oData.NavReturn.results[0].Message, {
									// 	actions: [MessageBox.Action.OK],
									// 	styleClass: "cl_message_box",
									// 	emphasizedAction: MessageBox.Action.OK,
									// 	onClose: function(sAction) {
									// 		if (sAction === "OK") {
									// 			that.fnNavFulfilment();
									// 		}
									// 	}
									// });
									var vSuccessMsg = oData.NavReturn.results[0].Message;
									that.openSuccessDialog(vSuccessMsg);

								} else if (type === 'E') {
									oGlobalBusyDialog.close();
									var errmsg = oData.NavReturn.results[0].Message;
									that.openErrorDialog(errmsg);
									that.fnNavFulfilment();
								}

							},
							error: function() {
								dialog.close();
								oGlobalBusyDialog.close();
								// sap.m.MessageBox.error("Error");
								that.openErrorDialog('Error');

							}

						});
					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function() {
						dialog.close(); // Closing the message box
						oGlobalBusyDialog.close();
					}
				}),

				afterClose: function() {
					dialog.destroy(); // Destroying sall message boxes
					oGlobalBusyDialog.close();
				}
			});
		
dialog.addStyleClass("fragmentButton cl_SettingDialog");
			dialog.open(); // To open the dialog box
setTimeout(function () {
    // buttons are inside dialog DOM
    var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
    if (buttons[0]) buttons[0].classList.add("yesButtonHack");
    if (buttons[1]) buttons[1].classList.add("noButtonHack");
}, 100);
		},

		fn_Simulate: function() {
			// count_war_sim = 0 ;
			var oController = this;
			var data = this.getView().getModel("JSInvdethead").getData()[0];
			if (data.Transtype <= 3 || data.Transtype == 8) {
				var mes = this.fn_PO_Validation();
			} else if (data.Transtype === '4' | data.Transtype <= "5") {
				var mes = this.fn_Post_Validation();
			} else if (data.Transtype === '6') {
				var mes = this.fn_Down_Validation();
			}

			if (mes != "") {
				// sap.m.MessageBox.error(mes);
				this.openErrorDialog(mes);
			} else if (mes === "") {

				var war_mes = "";

				if (war_mes === "") {
					var call = "Post";
					oController.fn_Check_Duplicate_INVO(call);
				} else if (war_mes != "") {
					sap.m.MessageBox.warning(war_mes + "\n Do you want to proceed ?", {
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						styleClass: ".cl_SettingDialog.sapMDialog fragmentButton fragmentButtonwarn",
						emphasizedAction: MessageBox.Action.YES,
						onClose: function(sAction) {
							if (sAction === "YES") {
								var call = "Simulate";
								oController.fn_Check_Duplicate_INVO(call);
							}
						}
					});

					setTimeout(function() {
						var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
						if (buttons[0]) buttons[0].classList.add("yesButtonHack");
						if (buttons[1]) buttons[1].classList.add("noButtonHack");
					}, 100);

				}

			}
			oGlobalBusyDialog.close();

		},
	fnPressAddemail: function(oEvent) {
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"EmailId": ""
			});

			oTabModel.refresh();
		},

		fnPressDeleteemail: function(oEvent) {

			var vPath = Number(oEvent.getSource().getBindingContext("JMManualDel").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);

				oTabModel.refresh();
			} else {
				oTabData.splice(vPath, 1);
				oTabData.push({
					"EmailId": ""
				});

				oTabModel.refresh();
			}

		},
		fnCloseMail: function() {
			this.oMail.close();
			// sap.ui.getCore().byId("id_Email").setValue();
		},
		fn_onAddEmail: function () {
    // var oInput = sap.ui.getCore().byId("idEmailEntry");
    	var oInput = sap.ui.core.Fragment.byId("idhold", "idEmailEntry");
    var sEmail = oInput.getValue().trim();
    var oModel = this.getView().getModel("JMManualDel");
    var aEmails = oModel.getProperty("/Emails") || [];

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sEmail)) {
        sap.m.MessageToast.show("Please enter a valid email address");
        return;
    }

 
    if (aEmails.indexOf(sEmail) !== -1) {
        sap.m.MessageToast.show("Email already added");
        return;
    }


    aEmails.push(sEmail);
    oModel.setProperty("/Emails", aEmails);

    oInput.setValue(""); 
},

fn_onRemoveEmail: function (oEvent) {
    var oItem = oEvent.getSource().getParent().getParent(); 
    var oCtx = oItem.getBindingContext("JMManualDel");
    var sPath = oCtx.getPath(); 
    var iIndex = parseInt(sPath.split("/")[2]); 
    var oModel = this.getView().getModel("JMManualDel");
    var aEmails = oModel.getProperty("/Emails");

    if (iIndex > -1) {
        aEmails.splice(iIndex, 1);
        oModel.setProperty("/Emails", aEmails);
    }
},

		fn_Hold: function() {
				
			var call = "Park";
			var mes = this.fn_Hold_Validation();
			if (mes != "") {
				// sap.m.MessageBox.error(mes);
				this.openErrorDialog(mes);
			} else if (mes === "") {
				this.fn_Hold_confirmation();

			}
		},

		fn_Hold_Validation: function() {
			var mes = "";

			var arr = this.getView().getModel("JSInvdethead").getData();
			var arr_Item = this.getView().getModel("JSInvdet").getData();

			if (arr[0].Lifnr === "") {
				mes = "Enter the Vendor \n";
			}

			if (arr[0].Postingdate === null) {
				mes += "Enter the Posting Date \n";
			}

			if (arr[0].Waers === "") {
				mes += "Enter the Currency \n";
			}

			if (arr[0].Ntamt === undefined) {
				mes += "Enter the Amount \n";
			}

			if (arr[0].Invno === "") {
				mes += "Enter the Invoice Number \n";
			}

			if (this.getView().byId("id_BaseDate").getDateValue() === null) {
				mes += "Enter the Baseline Date\n";
			}

			for (var i = 0; i < arr_Item.length; i++) {

			}

			return mes;
		},
fn_Hold_confirmation: function () {
    var othis = this;
    sap.m.MessageBox.confirm(
        "Do you want to HOLD this Queue ID " + parseInt(parameters[0].Qid),
        {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
                if (sAction === "OK") {
                   
                    // if (!othis.oMail) {
                    //     othis.oMail = sap.ui.xmlfragment(
                    //         "FSC360NEW.fragment.Mailhold",
                    //         othis
                    //     );
                    //     othis.getView().addDependent(othis.oMail);
                    // }
                    	if (!othis.oMail) {
										othis.oMail = sap.ui.xmlfragment("idhold", "FSC360NEW.fragment.Mailhold", othis);
											othis.getView().addDependent(othis.oMail);
										}

                    // Create a model for entered emails
                    var oMailModel = new sap.ui.model.json.JSONModel({ Emails: [] });
                    othis.getView().setModel(oMailModel, "JMManualDel");

                    othis.oMail.open();
                } else if (sAction === "CANCEL") {
                    sap.m.MessageToast.show("Action Cancelled");
                }
            },
        }
    );

    // cosmetic button styling
    setTimeout(function () {
        var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
        if (buttons[0]) buttons[0].classList.add("yesButtonHack");
        if (buttons[1]) buttons[1].classList.add("canButtonHack");
    }, 100);
},

fnmailsubmit: function () {
    var oView = this.getView();
    var oModel = oView.getModel("JMManualDel");
    var aEmails = oModel.getProperty("/Emails") || [];

	var sReason = sap.ui.core.Fragment.byId("idhold", "idHoldReason").getSelectedKey();
   //var sReason = this.byId("idHoldReason")?.getSelectedKey() || "";


 
    if (!sReason) {
        sap.m.MessageToast.show("Please select a reason for hold.");
        return;
    }

    if (aEmails.length === 0) {
        sap.m.MessageToast.show("Please enter at least one email address.");
        return;
    }

    
    this._aHoldEmails = aEmails;
    this._sHoldReason = sReason;

    // Close the dialog
    this.oMail.close();

   
    this.fnProceedHold();
},


fnProceedHold: function () {
    var othis = this;
    oGlobalBusyDialog.open();

   	var obj = {};
						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
						obj.Flag = 'H';
						var vCheck = othis.getView().byId("id_check").getSelected();
						if (vCheck === true) {
							obj.Taxind = 'X';
						} else {
							obj.Taxind = '';
						}
						obj.Baseline = othis.getView().byId("id_BaseDate").getDateValue();
						obj.NavHead = othis.getView().getModel("JSInvdethead").getData();
						obj.NavHead[0].Zterm = othis.getView().byId("id_payment_term").getValue().split(' ')[0];

						if (othis.getView().byId('id_duplicate').getEnabled() === true) {
							obj.NavHead[0].SuspDupli = 'X';
						} else {
							obj.NavHead[0].SuspDupli = '';
						}

						if (othis.getView().byId('id_Priority').getEnabled() === true) {
							obj.NavHead[0].Priority = 'X';
						} else {
							obj.NavHead[0].Priority = '';
						}

						if (othis.getView().byId('id_original').getEnabled() === true) {
							obj.NavHead[0].OrgnlCopy = 'X';
						} else {
							obj.NavHead[0].OrgnlCopy = '';
						}

						var data = othis.getView().getModel("JSInvdethead").getData()[0];
						if (data.Transtype <= 3 || data.Transtype == 8) {
							obj.NavItemTabDetails = othis.getView().getModel("JSPORefDet").getData();
							obj.NavMaterialDet = othis.getView().getModel("JSMatdet").getData();
						} else if (data.Transtype === '4' | data.Transtype <= "6") {
							obj.NavGetItemValues = othis.getView().getModel("JSInvdet").getData();
						}
						obj.NavTaxTab = othis.getView().getModel("JSTaxTab").getData();
						obj.NavReturn = [];
					  
						obj.NavHead[0].Ntamt = String(obj.NavHead[0].Ntamt);
						
						
    obj.NavHold = [];

    // Loop through all entered email addresses
    this._aHoldEmails.forEach(function (email) {
        obj.NavHold.push({
            EmailId: email,           // field in your nav entity
            Remarks: othis._sHoldReason  // selected reason
        });
    });
						oModel.create('/DEEPHEADSet', obj, {

							success: function(oData) {
								oGlobalBusyDialog.close();

								if (oData.NavReturn.results[0].Type === 'E') {
									var vType = oData.NavReturn.results[0].Type;

									if (vType === 'E') {
									
										var errmsg = oData.NavReturn.results[0].Message;
										othis.openErrorDialog(errmsg);
									}
								} else if (oData.NavReturn.results[0].Type === 'S') {

									var vSuccess = oData.NavReturn.results[0].Message; //Manosankari on 05.11.2025
									othis.openSuccessDialog(vSuccess);
								

								} else {
									othis.openSuccessDialog("Queue Id: " + parseInt(parameters[0].Qid) + " Successfully Holded");
								}

							},
							error: function() {
								oGlobalBusyDialog.close();
							
								othis.openErrorDialog('Error while doing Hold Operation');
							}

						});
},
	fn_save1: function() {
				
			var call = "Park";
			var mes = this.fn_Hold_Validation();
			if (mes != "") {
				// sap.m.MessageBox.error(mes);
				this.openErrorDialog(mes);
			} else if (mes === "") {
				this.fn_Save_confirmation();

			}
		},

		fn_Save_confirmation: function() {
			var othis = this;
	
			var vMsg = "Do you want to Save this Queue ID " + parseInt(parameters[0].Qid);


					if (!this._oConfirmDialog) {
						this._oConfirmDialog = sap.ui.xmlfragment(
							this.getView().getId(),
							"FSC360NEW.fragment.ConfirmDialog",
							this
						);
						this.getView().addDependent(this._oConfirmDialog);
					}
					this._oConfirmDialog.open();
					sap.ui.core.Fragment.byId(this.getView().getId(), "confirmText").setText(vMsg);
},
	onConfirmYesPress: function() {
			this._oConfirmDialog.close();
		

			this.fnsave();
		},
		onConfirmNoPress: function() {
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
				this._oConfirmDialog = null;
	
		},
			fnsave: function() {
					var othis = this;
						oGlobalBusyDialog.open();
						var obj = {};
						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
						obj.Flag = 'M';
						var vCheck = othis.getView().byId("id_check").getSelected();
						if (vCheck === true) {
							obj.Taxind = 'X';
						} else {
							obj.Taxind = '';
						}
						obj.Baseline = othis.getView().byId("id_BaseDate").getDateValue();
						obj.NavHead = othis.getView().getModel("JSInvdethead").getData();
						obj.NavHead[0].Zterm = othis.getView().byId("id_payment_term").getValue().split(' ')[0];

						if (othis.getView().byId('id_duplicate').getEnabled() === true) {
							obj.NavHead[0].SuspDupli = 'X';
						} else {
							obj.NavHead[0].SuspDupli = '';
						}

						if (othis.getView().byId('id_Priority').getEnabled() === true) {
							obj.NavHead[0].Priority = 'X';
						} else {
							obj.NavHead[0].Priority = '';
						}

						if (othis.getView().byId('id_original').getEnabled() === true) {
							obj.NavHead[0].OrgnlCopy = 'X';
						} else {
							obj.NavHead[0].OrgnlCopy = '';
						}

						var data = othis.getView().getModel("JSInvdethead").getData()[0];
						if (data.Transtype <= 3) {
							obj.NavItemTabDetails = othis.getView().getModel("JSPORefDet").getData();
							obj.NavMaterialDet = othis.getView().getModel("JSMatdet").getData();
							obj.NavGetItemValues = othis.getView().getModel("JSInvdet").getData();
						} else if (data.Transtype === '4' | data.Transtype <= "6") {
							obj.NavGetItemValues = othis.getView().getModel("JSInvdet").getData();
						}
						obj.NavTaxTab = othis.getView().getModel("JSTaxTab").getData();
						obj.NavReturn = [];
					  
						obj.NavHead[0].Ntamt = String(obj.NavHead[0].Ntamt);
						oModel.create('/DEEPHEADSet', obj, {

							success: function(oData) {
								oGlobalBusyDialog.close();

								if (oData.NavReturn.results[0].Type === 'E') {
									var vType = oData.NavReturn.results[0].Type;

									if (vType === 'E') {
										// sap.m.MessageBox.error(oData.NavReturn.results[0].Message);
										var errmsg = oData.NavReturn.results[0].Message;
										othis.openErrorDialog(errmsg);
									}
								} else if (oData.NavReturn.results[0].Type === 'S') {

									var vSuccess = oData.NavReturn.results[0].Message; //Manosankari on 05.11.2025
									othis.openSuccessDialog(vSuccess);
							

								} else {

									othis.openSuccessDialog("Queue Id: " + parseInt(parameters[0].Qid) + " Successfully Holded");
								}

							},
							error: function() {
								oGlobalBusyDialog.close();
							
								othis.openErrorDialog('Error while doing Save');
							}

						});
					} ,
	// fn_save1: function() {
				
	// 		var call = "Park";
	// 		var mes = this.fn_Hold_Validation();
	// 		if (mes != "") {
	// 			// sap.m.MessageBox.error(mes);
	// 			this.openErrorDialog(mes);
	// 		} else if (mes === "") {
	// 			this.fn_Save_confirmation();

	// 		}
	// 	},

	// 	fn_Save_confirmation: function() {
	// 		var othis = this;
	// 		sap.m.MessageBox.confirm("Do you want to HOLD this Queue ID " + parseInt(parameters[0].Qid), {
	// 			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
	// 			styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
	// 			emphasizedAction: MessageBox.Action.OK,
	// 			onClose: function(sAction) {
	// 				if (sAction === "OK") {
	// 					oGlobalBusyDialog.open();
	// 					var obj = {};
	// 					var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
	// 					obj.Flag = 'M';
	// 					var vCheck = othis.getView().byId("id_check").getSelected();
	// 					if (vCheck === true) {
	// 						obj.Taxind = 'X';
	// 					} else {
	// 						obj.Taxind = '';
	// 					}
	// 					obj.Baseline = othis.getView().byId("id_BaseDate").getDateValue();
	// 					obj.NavHead = othis.getView().getModel("JSInvdethead").getData();
	// 					obj.NavHead[0].Zterm = othis.getView().byId("id_payment_term").getValue().split(' ')[0];

	// 					if (othis.getView().byId('id_duplicate').getEnabled() === true) {
	// 						obj.NavHead[0].SuspDupli = 'X';
	// 					} else {
	// 						obj.NavHead[0].SuspDupli = '';
	// 					}

	// 					if (othis.getView().byId('id_Priority').getEnabled() === true) {
	// 						obj.NavHead[0].Priority = 'X';
	// 					} else {
	// 						obj.NavHead[0].Priority = '';
	// 					}

	// 					if (othis.getView().byId('id_original').getEnabled() === true) {
	// 						obj.NavHead[0].OrgnlCopy = 'X';
	// 					} else {
	// 						obj.NavHead[0].OrgnlCopy = '';
	// 					}

	// 					var data = othis.getView().getModel("JSInvdethead").getData()[0];
	// 					if (data.Transtype <= 3) {
	// 						obj.NavItemTabDetails = othis.getView().getModel("JSPORefDet").getData();
	// 						obj.NavMaterialDet = othis.getView().getModel("JSMatdet").getData();
	// 					} else if (data.Transtype === '4' | data.Transtype <= "6") {
	// 						obj.NavGetItemValues = othis.getView().getModel("JSInvdet").getData();
	// 					}
	// 					obj.NavTaxTab = othis.getView().getModel("JSTaxTab").getData();
	// 					obj.NavReturn = [];
					  
	// 					obj.NavHead[0].Ntamt = String(obj.NavHead[0].Ntamt);
	// 					oModel.create('/DEEPHEADSet', obj, {

	// 						success: function(oData) {
	// 							oGlobalBusyDialog.close();

	// 							if (oData.NavReturn.results[0].Type === 'E') {
	// 								var vType = oData.NavReturn.results[0].Type;

	// 								if (vType === 'E') {
	// 									// sap.m.MessageBox.error(oData.NavReturn.results[0].Message);
	// 									var errmsg = oData.NavReturn.results[0].Message;
	// 									othis.openErrorDialog(errmsg);
	// 								}
	// 							} else if (oData.NavReturn.results[0].Type === 'S') {

	// 								var vSuccess = oData.NavReturn.results[0].Message; //Manosankari on 05.11.2025
	// 								othis.openSuccessDialog(vSuccess);
							

	// 							} else {

	// 								othis.openSuccessDialog("Queue Id: " + parseInt(parameters[0].Qid) + " Successfully Holded");
	// 							}

	// 						},
	// 						error: function() {
	// 							oGlobalBusyDialog.close();
							
	// 							othis.openErrorDialog('Error while doing Save');
	// 						}

	// 					});
	// 				} else if (sAction === "CANCEL") {
						
	// 					sap.m.MessageToast.show("Action Cancelled");
	// 				}
	// 			}
	// 		});
	// 		setTimeout(function() {
	// 			var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
	// 			if (buttons[0]) buttons[0].classList.add("yesButtonHack");
	// 			if (buttons[1]) buttons[1].classList.add("canButtonHack");
	// 		}, 100); // small delay ensures DOM is ready
	// 	},
		fn_Check_Duplicate_INVO: function(call) {
			oGlobalBusyDialog.open();
			var that = this;
			var obj = {};
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			obj.Flag = 'D';
			obj.NavHead = this.getView().getModel("JSInvdethead").getData();
			obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
			// obj.NavWithHoldTax = this.getView().getModel("JSWithHold").getData();
			//Added by Manosankari WHT cal. start
			    var aWHT = this.getView().getModel("JSWithHold").getData();

    // FILTER → KEEP ONLY valid lines
    var aFiltered = aWHT.filter(function (row) {
        return row.WtWithcd && row.WtWithcd.trim() !== "" && row.Witht && row.Witht.trim() !== "";
    });

    obj.NavWithHoldTax = aFiltered;
    //Added by Manosankari WHT cal.end
			obj.NavReturn = [];
			obj.NavHead[0].Ntamt = String(obj.NavHead[0].Ntamt);

			obj.NavHead[0].Lifnr = this.getView().getModel("JSGST").getProperty("/0/value"); //for updating vendor from the input
			oModel.create('/DEEPHEADSet', obj, {

				success: function(oData) {
					oGlobalBusyDialog.close();
					if (oData.NavReturn === null) {
						that.fn_Simulate_frag(call);
					} else if (oData.NavReturn.results.length === 0) {
						that.fn_Simulate_frag(call);
					} else if (oData.NavReturn.results[0].Message != "") {
						sap.m.MessageBox.warning(oData.NavReturn.results[0].Message, {
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							styleClass: ".cl_SettingDialog.sapMDialog fragmentButton fragmentButtonwarn",
							emphasizedAction: MessageBox.Action.OK,
							onClose: function(sAction) {
								if (sAction === "OK") {
									that.fn_Simulate_frag(call);
								} else if (sAction === "CANCEL") {
									sap.m.MessageToast.show("Action Cancelled");
									oGlobalBusyDialog.close();
								}
							}
						});
					} else if (oData.NavReturn.results[0].Message === "") {
						that.fn_Simulate_frag(call);
					}
				},
				error: function() {
					oGlobalBusyDialog.close();
					// sap.m.MessageBox.error("Error in Checking Duplicate Invoice");
					that.openErrorDialog('Error in Checking Duplicate Invoice');
				}
			});
			setTimeout(function() {
				var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
				if (buttons[0]) buttons[0].classList.add("yesButtonHack");
				if (buttons[1]) buttons[1].classList.add("canButtonHack");
			}, 100); // small delay ensures DOM is ready
		},

		fn_Simulate_frag: function(call) {
			var that = this;

			// Prepare fragment if not already
			if (!this.Simulate_frag) {
				this.Simulate_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Simulate", this);
				this.getView().addDependent(this.Simulate_frag);
			}

			// Call simulate function first
			this.fn_Simulate_Call(function() {
				// Callback to open fragment after data is loaded
				that.Simulate_frag.open();
				setTimeout(function() {
					var $dlg = $(".cl_frag_rightslide");
					if ($dlg.length) {
						$dlg[0].style.setProperty("transform", "translateX(100%)", "important");
						$dlg[0].style.setProperty("transition", "none", "important"); // No animation initially
					}
				}, 0);
			});
		},
		fn_Simulate_Call: function(callback) {
		  var that = this;
    var obj = {};
    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
    oGlobalBusyDialog.open();

    obj.Flag = 'S';
    obj.Taxind = this.getView().byId("id_check").getSelected() ? 'X' : '';
    obj.Baseline = this.getView().byId("id_BaseDate").getDateValue();
    obj.NavHead = this.getView().getModel("JSInvdethead").getData();
    var oAmtSplitData = this.getView().getModel("amountsplit").getData();
obj.NavAmtsplit = oAmtSplitData.AmountSplit ? oAmtSplitData.AmountSplit : [];
if (Array.isArray(obj.NavAmtsplit)) {
    obj.NavAmtsplit = obj.NavAmtsplit.map(item => ({
        Ntamt: Number(item.Amount) ? Number(item.Amount).toFixed(2) : "0.00", //Added by Lokesh R on 21.10.2025
        Mwskz: item.TaxCode || "",
        Zlsch: item.PaymentMode || "",
        Zterm: item.PaymentTerm || "",
       
    }));
}

    if (obj.NavHead[0].Transtype <= 3 || obj.NavHead[0].Transtype == 8) {
        obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
        obj.NavMaterialDet = that.getView().getModel("JSMatdet").getData();

        var aInvData = this.getView().getModel("JSInvdet").getData();
        var bAllEmpty = aInvData.every(function(item) {
            return (!item.Saknr || item.Saknr.trim() === "") &&
                   (!item.Mwskz || item.Mwskz.trim() === "");
        });

        if (!bAllEmpty) obj.NavGetItemValues = aInvData;
    } else if (obj.NavHead[0].Transtype >= 4 && obj.NavHead[0].Transtype <= 7) {
        obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
    }

    obj.NavReturn = [];
    obj.NavSimulate = [];
    obj.NavChecklist = [];
    var mdpclearing = this.getView().getModel("JDPClear").getData()
    obj.NavVenclr = mdpclearing;
	// obj.NavWithHoldTax = this.getView().getModel("JSWithHold").getData();
	//Added by Manosankari WHT cal. start
	var aWHT = this.getView().getModel("JSWithHold").getData();//Added by Manosankari WHT cal. start

    // FILTER → KEEP ONLY valid lines
    var aFiltered = aWHT.filter(function (row) {
        return row.WtWithcd && row.WtWithcd.trim() !== "" && row.Witht && row.Witht.trim() !== "";
    });

    obj.NavWithHoldTax = aFiltered; 
    //Added by Manosankari WHT cal. end
    oModel.create('/DEEPHEADSet', obj, {
        success: function(oData) {
            // Process returned data
            // var oErrorModel = new sap.ui.model.json.JSONModel();
            // oErrorModel.setData(oData.NavReturn ? oData.NavReturn.results : []);
            // that.getView().setModel(oErrorModel, 'JMError');
            // sap.ui.getCore().byId("id_ErrorLink").setText(oData.NavReturn ? oData.NavReturn.results.length + " Error" : "0 Error");
            // added by mano sankari start
            var aMessages = oData.NavReturn ? oData.NavReturn.results : []; // added by mano
var aErrorMessages = [];

for (var i = 0; i < aMessages.length; i++) {
    if (aMessages[i].Type === "E") {  // or "W" if you want warnings too
        aErrorMessages.push(aMessages[i]);
    }
}

var oErrorModel = new sap.ui.model.json.JSONModel();
oErrorModel.setData(aErrorMessages);
that.getView().setModel(oErrorModel, 'JMError');

sap.ui.getCore().byId("id_ErrorLink").setText(aErrorMessages.length + " Error");
// added by mano sankari start
var iErrCnt = aErrorMessages.length;
var oChkTable = sap.ui.getCore().byId("id_ChkList");  // FIXED

if (oChkTable) {
    oChkTable.attachRowSelectionChange(function () {

        if (iErrCnt > 0) {
            oChkTable.clearSelection();
            sap.m.MessageToast.show("Kindly resolve the Errors");
        }

    });
}



            sap.ui.getCore().byId("id_Debit").setText(oData.Debit);
            sap.ui.getCore().byId("id_Credit").setText(oData.Credit);
            sap.ui.getCore().byId("id_Balance").setText(parseFloat(oData.Bal || 0).toFixed(2));

            // Simulate table
            var oSimModel = new sap.ui.model.json.JSONModel();
            oSimModel.setData(oData.NavSimulate ? oData.NavSimulate.results : []);
            that.getView().setModel(oSimModel, 'JMSimulate');

            // Checklist table
            var oChecklistModel = new sap.ui.model.json.JSONModel();
            oChecklistModel.setData(oData.NavChecklist ? oData.NavChecklist.results : []);
            that.getView().setModel(oChecklistModel, 'JMChecklist');

            oGlobalBusyDialog.close();

            // Open fragment after data loaded
            if (callback) callback();
				},
				error: function() {
				// sap.m.MessageBox.error("Error");
						that.openErrorDialog('Error');
					oGlobalBusyDialog.close();
				}
			});
		},

		fn_Simulate_frag_close: function() {
				if (this.Simulate_frag) {
				this.Simulate_frag.close();
				this.Simulate_frag.destroy();
				this.Simulate_frag = null;
			}
			// this.Simulate_frag.close();
			
		},

		fn_Error_frag: function() {
			if (!this.Error_frag) {
				this.Error_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Error", this);
				this.getView().addDependent(this.Error_frag);
			}
			this.Error_frag.open();
		},

		fn_Error_frag_close: function() {
	
				if (this.Error_frag) {
						this.Error_frag.close();
				this.Error_frag.destroy();
				this.Error_frag = null;
			}
		},
		// ----- Payment Method Fragment ----------------------
		fn_PaymentMethod_frag: function() {

			if (!this.PaymentMethod_frag) {
				this.PaymentMethod_frag = sap.ui.xmlfragment("FSC360NEW.fragment.PaymentMethod", this);
				this.getView().addDependent(this.PaymentMethod_frag);
			}
			this.PaymentMethod_frag.open();
		},

		fn_PaymentMethod_Confrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sTitle = oSelectedItem.getTitle(); // e.g. "Z001 - Payment Desc"
				var sCode = sTitle.split(" - ")[0]; // extract "Z001"

				this.getView().byId("id_PayMethod").setValue(sCode);

				// Clear filter after selection
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		formatPaymentMethod: function(sCode, sDesc) {
			if (sCode && sDesc) {
				return sCode + " - " + sDesc;
			}
			return sCode || "";
		},

		fn_PaymentMethod_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Zlsch", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text2", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_Housebank_frag: function() {

			if (!this.HouseBank_frag) {
				this.HouseBank_frag = sap.ui.xmlfragment("FSC360NEW.fragment.HouseBank", this);
				this.getView().addDependent(this.HouseBank_frag);
			}
			this.HouseBank_frag.open();
		},

		fn_Housebank_Confrm: function(oEvent) {
			var sTitle = oEvent.getParameter('selectedItem').getTitle();
			var sHbkid = sTitle.split(" - ")[0]; // extract just the code before " - "
			this.getView().byId("id_HouseBank").setValue(sHbkid);
			oEvent.getSource().getBinding("items").filter([]);
		},
		formatHouseBank: function(sHbkid, sBankl) {
			if (sHbkid && sBankl) {
				return sHbkid + " - " + sBankl;
			}
			return sHbkid || "";
		},
		fn_Housebank_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Banka", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_PaymentTerm_frag: function() {

			if (!this.PaymentTerm_frag) {
				this.PaymentTerm_frag = sap.ui.xmlfragment("FSC360NEW.fragment.PaymentTerm", this);
				this.getView().addDependent(this.PaymentTerm_frag);
			}
			this.PaymentTerm_frag.open();
		},
		fn_PaymentTerm_Confrm: function(oEvent) {
			var Name = oEvent.getParameter('selectedItem').getTitle();
			this.getView().byId("id_payment_term").setValue(Name);
			oEvent.getSource().getBinding("items").filter([]); //To clear the data's after selection
		},
		fn_PaymentTerm_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Zterm", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Vtext", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_Payment_Term: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sTitle = oSelectedItem.getTitle(); // Combined like "ZTERM1 - Description"

				var oTabModel = this.getView().getModel("JSInvdethead");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[0].Zterm = sTitle.split(" - ")[0]; // Extract only Zterm code
					oTabModel.refresh(true);
				}

				this.getView().byId("id_payment_term").setValue(sTitle);
				this.fn_paymentTabdet();
			}

			oEvent.getSource().getBinding("items").filter([]); // Clear filters
		},
		formatPaymentTerm: function(sZterm, sVtext) {
			if (sZterm && sVtext) {
				return sZterm + " - " + sVtext;
			}
			return sZterm || "";
		},
		fn_PaymentBlock_Frag: function() {
			if (!this.PaymentBlock_frag) {
				this.PaymentBlock_frag = sap.ui.xmlfragment("FSC360NEW.fragment.PaymentBlock", this);
				this.getView().addDependent(this.PaymentBlock_frag);
			}
			this.PaymentBlock_frag.open();
		},
		fn_PaymentTermChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey(); // Zterm only
				var sText = oSelectedItem.getText(); // "Zterm - Desc"

				// Update model JSInvdethead[0].Zterm
				var oTabModel = this.getView().getModel("JSInvdethead");
				if (oTabModel) {
					var oTabData = oTabModel.getData();
					oTabData[0].Zterm = sKey; // store only the code
					oTabModel.refresh(true);
				}

				// Show text in ComboBox field
				this.byId("id_payment_term").setValue(sText);

				// Call your existing fn_paymentTabdet logic
				this.fn_paymentTabdet();
			}
		},

		fn_PaymentBlock_Confirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sTitle = oSelectedItem.getTitle(); // e.g. "P123 - Payment Block Desc"
				// Split into key and description
				var aParts = sTitle.split(" - ");
				var sKey = aParts[0];
				var sDesc = aParts[1] || "";

				this.getView().byId("id_payment_block").setValue(sTitle); // Or sKey + " - " + sDesc if you want exact

				// Clear filters after selection
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		formatPaymentBlock: function(sKey, sDesc) {
			if (sKey && sDesc) {
				return sKey + " - " + sDesc;
			}
			return sKey || "";
		},
		fn_PaymentBlock_LiveChange: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new sap.ui.model.Filter("Zahls", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new sap.ui.model.Filter("Textl", sap.ui.model.FilterOperator.Contains, sValue);
			var oCombined = new sap.ui.model.Filter([oFilter1, oFilter2], false);

			oEvent.getSource().getBinding("items").filter(oCombined);
		},
		fn_Item_Amount_Initial_NonPO: function() {
			this.getView().getModel("JSInvdet").refresh();
			var Model_Data = this.getView().getModel("JSInvdet").getData();
			var count = "0";
			var total_item = "0";
			for (var i = 0; i < Model_Data.length; i++) {
				total_item = Number(Model_Data[i].Netpr) + Number(total_item);
			}
			Balance_parameters.Item_Amount = parseInt(total_item);
			this.fn_Balance_Amount();
		},

		fnNavGui: function(oEvent) {
			var Vlevel = oEvent.getParameters().getLaneId();
			var vDoc = encodeURIComponent(oEvent.getParameters().getNodeId()); // safe encoding
			var vUrl = "";

			if (Vlevel === "0") {
				vUrl = "http://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=*OLR3_ME2XN%20OLR3_R3_TS_PDOC-EBELN=" + vDoc +
					";DYNP_OKCODE=DISP";
			} else if (Vlevel === "1") {
				vUrl = "http://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=*MIGO_GO+" + "GODYNPRO-MAT_DOC=" + vDoc +
					"+GODYNPRO-TRANSACTION=D;DYNP_OKCODE=OK_GO";

			} else if (Vlevel === "2") {
				vUrl = "http://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=*MIR4+RBKP-BELNR=" + vDoc + ";DYNP_OKCODE=DISP";
			}

			if (vUrl) {
				sap.m.URLHelper.redirect(vUrl, true);
			}
		},
		fn_Vendor_frag: function() {

			if (!this.Vendor_frag) {
				this.Vendor_frag = sap.ui.xmlfragment("vendorFrag", "FSC360NEW.fragment.Vendor", this);
				this.getView().addDependent(this.Vendor_frag);
			}
			this.Vendor_frag.open();
		},

		onVendorSelect: function(oEvent) {
			this._selectedVendorContext = oEvent.getParameter("listItem").getBindingContext("JSVendor");
		},

		fn_Vendor_Confirm: function() {
			var oContext = this._selectedVendorContext;
			if (!oContext) {
				sap.m.MessageToast.show("Please select a vendor.");
				return;
			}

			var oVendor = oContext.getObject();
			var ven_name = oVendor.VendorDesc;
			var lifnr = oVendor.Lifnr;

			this.getView().byId("id_vendor").setText(ven_name);

			var oTabModel = this.getView().getModel("JSInvdethead");
			if (oTabModel) {
				var oTabData = oTabModel.getData();
				oTabData[0].Lifnr = lifnr;
				oTabData[0].Name1 = ven_name;
				oTabModel.refresh(true);
			}

			this.fn_paymentTabdet();
			this.fnGetVendordet();
			this.fn_amount_split(); //Added by Manosankari on 12.09.2025

			// Optional: Clear selection in the List
			var oList = sap.ui.core.Fragment.byId("vendorFrag", "idVendorList");
			if (oList) {
				oList.removeSelections();
			}

			// Close the dialog
			this.Vendor_frag.close();
		},

		fn_Vendor_Cancel: function() {
			var oDialog = sap.ui.core.Fragment.byId("vendorFrag", "idVendorDialog");
			if (oDialog) {
				oDialog.close();
			}
		},
		// --------- Tax Tab ------------------------------
		fn_Taxcodefrag_TaxTab: function(oEvent) {
			vTaxTabId = Number(oEvent.getSource().getBindingContext("JSTaxTab").getPath().split("/")[1]);

			if (!this.TaxCodeTaxtab_frag) {
				this.TaxCodeTaxtab_frag = sap.ui.xmlfragment("FSC360NEW.fragment.TaxCodeTaxTab", this);
				this.getView().addDependent(this.TaxCodeTaxtab_frag);
			}
			this.TaxCodeTaxtab_frag.open();
		},

		fn_TaxConfrm_Taxtab: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (!oSelectedItem) {
				oSelectedItem = oEvent.getSource().getSelectedItem();
			}
			if (oSelectedItem) {
				var oMatModel = this.getView().getModel("JSTaxTab");
				if (oMatModel) {
					var oMatData = oMatModel.getData();
					oMatData[vTaxTabId].Mwskz = oSelectedItem.getKey(); // Store only the code
					oMatModel.refresh();
					this.fnCalculateTax();
				}
			}
		},

		fn_TaxCodeTaxtab_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mwskz", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		// --------------- End Tax Tab --------------------

		onTabSelect: function(oEvent) {
			var selectedKey = oEvent.getParameter("key");
			this.getView().getModel("JSState").setProperty("/selectedKey", selectedKey);
			setTimeout(function() {
				this._applyFlexGrow();
			}.bind(this), 0);
		},
		onIconTabSelect: function(oEvent) {
			var sSelectedKey = oEvent.getParameter("key");
			var oModel = this.getView().getModel("JSState");

			// If clicked tab is one of the inner tabs inside Basic Data
			if (["po", "gl", "material"].includes(sSelectedKey)) {
				// Keep Basic Data as the main selected key so the icon stays blue
				oModel.setProperty("/selectedKey", "functionalLocation");
				// Still remember which inner tab is active (optional)
				oModel.setProperty("/poTabKey", sSelectedKey);
			} else {
				// Normal behaviour for outer tabs
				oModel.setProperty("/selectedKey", sSelectedKey);
			}

			// Your existing logic
			if (sSelectedKey === "gl") {
				this._applyExpandedClasses();
			}

			this._applyFlexGrow();
		},
		fnSettingPop: function(oEvent) {
			var oButton = oEvent.getSource();
			// if (Balance_parameters.Type === 'W') {
				if (Balance_parameters.UserType === 'W') {
				var oModel = this.getOwnerComponent().getModel("jsTab");
				oModel.setProperty("/Indexer", false);
				oModel.setProperty("/Workbench", true);
			// } else if (Balance_parameters.Type === 'I') {
				} else if (Balance_parameters.UserType === 'I') {
				var oModel = this.getOwnerComponent().getModel("jsTab");
				oModel.setProperty("/Indexer", true);
				oModel.setProperty("/Workbench", false);
			}
			if (!this._PopOverSetting_wb) {
				this._PopOverSetting_wb = sap.ui.xmlfragment(
					"FSC360NEW.fragment.Advancefrag",
					this
				);
				this.getView().addDependent(this._PopOverSetting_wb);

			}

			this._PopOverSetting_wb.openBy(oButton);

		},
		fn_startworkflow: function(oEvent) {

			if (!this.StartW_frag) {
				this.StartW_frag = sap.ui.xmlfragment("FSC360NEW.fragment.StartWorkflow", this);
				this.getView().addDependent(this.StartW_frag);
			}
			this.StartW_frag.open();

			var oValQueueID = Balance_parameters.Queid;
			sap.ui.getCore().byId("id_QueueID").setValue(oValQueueID);

			var arr = [];
			var temp = {
				"UserID": '',
				"Username": '',
				"EMail": ''
			};
			arr.push(temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSAgents');

			var arr = [];
			var temp = {
				"EmailID": ''
			};
			arr.push(temp);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSMailIDs');

		},
		fn_StartW_frag_close: function() {
			this.StartW_frag.close();
				this.StartW_frag.destroy();
				this.StartW_frag = null;
		},
		fnAddAgents: function() {
			var oTabData = [];
			var oTabModel = this.getView().getModel("JSAgents");

			oTabData = oTabModel.getData();
			var count = oTabModel.getData().length;
			count++;
			var item = count;
			oTabData.push({
				"UserID": '',
				"Username": '',
				"EMail": ''
			});
			var jmod = new sap.ui.model.json.JSONModel();
			jmod.setData(oTabData);
			this.getView().setModel(jmod, 'JSAgents');

			oTabModel.refresh();

		},
		fnDeleteAgents: function(oEvent) {
			var vPath = this.getView().getModel('JSAgents').getData().length - 1;

			var oTabModel = this.getView().getModel("JSAgents");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);
				oTabModel.refresh();

			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("deleteitem"));
			}

		},
		fnAddMailID: function() {
			var oTabData = [];
			var oTabModel = this.getView().getModel("JSMailIDs");

			oTabData = oTabModel.getData();
			var count = oTabModel.getData().length;
			count++;
			var item = count;
			oTabData.push({
				"EmailID": ''
			});
			var jmod = new sap.ui.model.json.JSONModel();
			jmod.setData(oTabData);
			this.getView().setModel(jmod, 'JSMailIDs');

			oTabModel.refresh();

		},
		fnDeleteMailID: function(oEvent) {
			var vPath = this.getView().getModel('JSMailIDs').getData().length - 1;
			// var vPath = Number(oEvent.getSource().getBindingContext("JSInvdet").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JSMailIDs");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);
				oTabModel.refresh();

			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("deleteitem"));
			}

		},
		fn_useridvalid: function(oEvent) {
			oGlobalBusyDialog.open();
			var vPath = Number(oEvent.getSource().getBindingContext("JSAgents").getPath().split("/")[1]);

			var vUserID = oEvent.getSource().getValue();

			var oEntity = {
				"Flag": 'U',
				"Userid": vUserID
			};

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oModel.create("/ValidateSet", oEntity, {

				success: function(oData, Response) {

					if (oData.Remarks !== '') {
						// sap.m.MessageBox.error(oData.Remarks);
						var err = oData.Remarks
							that.openErrorDialog(err);
					} else {
						var oAgentModel = that.getView().getModel("JSAgents");
						if (oAgentModel) {
							var oAgentData = oAgentModel.getData();
							oAgentData[vPath].Username = oData.Username;
							oAgentData[vPath].EMail = oData.EMail;
							oAgentModel.refresh();

						}
					}
					oGlobalBusyDialog.close();
				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					sap.m.MessageToast.show('Http Error');
				}
			});
		},
		fn_StartWorkflow_final: function() {
			var arr = [];

			var oAgentData = this.getView().getModel('JSAgents').getData();

			for (var i = 0; i < oAgentData.length; i++) {
				if (oAgentData[i].UserID !== '') {
					arr.push({
						"Userid": oAgentData[i].UserID
					});
				}
			}

			if (arr.length === 0) {
				sap.m.MessageToast.show('Enter atleast one agent to trigger workflow');
				return;
			}

			var oValQueueID = Balance_parameters.Queid;

			arr.push({
				"Qid": oValQueueID
			});

			var vComments = sap.ui.getCore().byId("id_SWComments").getValue();

			arr.push({
				"Remarks": vComments
			});

			var vTrigID = sap.ui.getCore().byId('id_SelTrigger').getSelectedKey();
			arr.push({
				"Triggerid": vTrigID
			});

			if (vComments === '') {
				sap.m.MessageToast.show('Please Enter your comment');
				return;
			}

			var oMailData = this.getView().getModel('JSMailIDs').getData();

			for (var i = 0; i < oMailData.length; i++) {
				if (oMailData[i].EmailID !== '') {
					arr.push({
						"Email": oMailData[i].EmailID
					});
				}
			}
			var oFunc = sap.ui.getCore().byId('id_SelTrigger')._getSelectedItemText();
			var Queueid = parseInt(this.getView().getModel("JSInvdethead").getData()[0].Qid);
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				icon: 'sap-icon://question-mark',
				type: 'Message',
				
				// state: "Success",
				content: new sap.m.Text({
					text: 'Do you want to Start ' + oFunc + ' with this Queue ID - ' + Queueid
						// text: 'Do you want to Start the Workflow with this Queue ID - ' + Queueid
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function() {
						oGlobalBusyDialog.open();
						var obj = {};
						obj.IvAction = 'SW';
						obj.NavGetItemValues = [];
						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
						obj.NavHead = that.getView().getModel("JSInvdethead").getData();
						obj.NavGetItemValues = that.getView().getModel("JSInvdet").getData();
						obj.NavTrigger = arr;
						obj.NavReturn = [];
							obj.NavHead[0].Ntamt = obj.NavHead[0].Ntamt.toString();
						oModel.create('/DEEPHEADSet', obj, {

							success: function(oData) {
								dialog.close();
								var type = oData.NavReturn.results[0].Type;
								if (type === 'S') {
									// sap.m.MessageBox.success(oData.NavReturn.results[0].Message, {
									// 	actions: [MessageBox.Action.OK],
									// 	styleClass: "cl_message_box",
									// 	emphasizedAction: MessageBox.Action.OK,
									// 	onClose: function(sAction) {

									// 		if (sAction === "OK") {
									// 			that.fnNavFulfilment();
									// 		}
									// 	}
									// });
									var vSuccessMsg = oData.NavReturn.results[0].Message;
									that.openSuccessDialog(vSuccessMsg);

								} else if (type === 'E') {
									var errmsg = oData.NavReturn.results[0].Message;
									that.openErrorDialog(errmsg);
									// that.fnNavFulfilment();
								}
								oGlobalBusyDialog.close();
							},
							error: function() {
								dialog.close();
								that.openErrorDialog('Http Error');
								oGlobalBusyDialog.close();

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
dialog.addStyleClass("fragmentButton cl_SettingDialog");
			dialog.open(); // To open the dialog box
			setTimeout(function () {
    // buttons are inside dialog DOM
    var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
    if (buttons[0]) buttons[0].classList.add("yesButtonHack");
    if (buttons[1]) buttons[1].classList.add("noButtonHack");
}, 100);

		},
		fn_downpay_clear_call: function() {
			if (!this.dpclearingfrag) {
				this.dpclearingfrag = sap.ui.xmlfragment(
					"FSC360NEW.fragment.DP_Clearing", this);
				this.getView().addDependent(this.dpclearingfrag);

			}
			this.dpclearingfrag.open();
			sap.ui.getCore().byId("id_submitbtn").setVisible(false);
			sap.ui.getCore().byId("id_postdpbtn").setVisible(true);

		},
		fn_postdpclear: function() {
			var vDp_clear = this.getView().getModel("JDPClear").getData();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oGlobalBusyDialog.open();
			var obj = {};
			obj.Qid = Balance_parameters.Queid;
			obj.IvAction = 'DP';
			obj.NavVenclr = vDp_clear;
			obj.NavHead = [];
			obj.NavReturn = [];
			var vSucces = '';
			var vError = '';
			var that = this;
			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					oGlobalBusyDialog.close();
					var aMessages = oData.NavReturn ? oData.NavReturn.results : [];
 
					if (aMessages) {
						for (var i = 0; i < aMessages.length; i++) {
							if (aMessages[i].Type === 'S')
								vSucces = vSucces + '\n' + aMessages[i].Message;
 
							if (aMessages[i].Type === 'E')
								vError = vError + '\n' + aMessages[i].Message;
						}
						if (vSucces) {
							var vSucces = oData.NavReturn.results[0].Message;
							that.openSuccessDialog(vSucces);
						} else if (vError) {
							// sap.m.MessageBox.error(odata.NavReturn.results[0].Message);
							var errmsg = oData.NavReturn.results[0].Message;
							that.openErrorDialog(errmsg);
						} else {
							that.openErrorDialog("Error in Down Payment clearing");
						}
					}
 
				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					sap.m.MessageToast.show(oResponse.message);
				}
			});
 
		},
		// fn_postdpclear: function() {
		// 	var vDp_clear = this.getView().getModel("JDPClear").getData();
		// 	var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
		// 	oGlobalBusyDialog.open();
		// 	var obj = {};
		// 	obj.Qid = Balance_parameters.Queid;
		// 	obj.IvAction = 'DP';
		// 	obj.NavVenclr = vDp_clear;
		// 	obj.NavHead = [];
		// 	obj.NavReturn = [];
		// 	var vSucces = '';
		// 	var vError = '';
		// 	oModel.create('/DEEPHEADSet', obj, {
		// 		success: function(oData) {
		// 			oGlobalBusyDialog.close();
		// 			var aMessages = oData.NavReturn ? oData.NavReturn.results : [];

		// 			if (aMessages) {
		// 				for (var i = 0; i < aMessages.length; i++) {
		// 					if (aMessages[i].Type === 'S')
		// 						vSucces = vSucces + '\n' + aMessages[i].Message;

		// 					if (aMessages[i].Type === 'E')
		// 						vError = vError + '\n' + aMessages[i].Message;
		// 				}
		// 				if (vSucces) {
		// 					var vSucces = oData.NavReturn.results[0].Message;
		// 					that.openSuccessDialog(vSucces);
		// 					// sap.m.MessageBox.success(vSucces, {
		// 					// 		actions: [MessageBox.Action.OK],
		// 					// 		styleClass: "cl_message_box",
		// 					// 		emphasizedAction: MessageBox.Action.OK,
		// 					// 		onClose: function(sAction) {
		// 					// 			if (sAction === "OK") {
		// 					// 				that.fn_closedpclear();
		// 					// 				that.oRouter = that.getOwnerComponent().getRouter();
		// 					// 					that.oRouter.navTo('Fulfilment',{btnstat: " "});
		// 					// 			}
		// 					// 		}
		// 					// 	});

		// 				} else if (vError) {
		// 					// sap.m.MessageBox.error(odata.NavReturn.results[0].Message);
		// 					var errmsg = oData.NavReturn.results[0].Message;
		// 					that.openErrorDialog(errmsg);
		// 				} else {
		// 					that.openErrorDialog("Error in Down Payment clearing");
		// 				}
		// 			}

		// 		},
		// 		error: function(oResponse) {
		// 			oGlobalBusyDialog.close();
		// 			sap.m.MessageToast.show(oResponse.message);
		// 		}
		// 	});

		// },
		fn_AddComment_frag: function() {

			if (!this.AddComment_frag) {
				this.AddComment_frag = sap.ui.xmlfragment("FSC360NEW.fragment.AddComment", this);
				this.getView().addDependent(this.AddComment_frag);
			}
			this.AddComment_frag.open();
		},

		fnCloseComment: function() {
			this.AddComment_frag.close();
		},
		
		fnSubmitComment: function() {
			oGlobalBusyDialog.open();
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var obj = {};
			obj.Flag = 'C';
			obj.IvText = sap.ui.getCore().byId("id_Remark").getValue();

			obj.Qid = Balance_parameters.Queid; //QueueID
			obj.NavHead = [];
			oModel.create('/DEEPHEADSet', obj, {

				success: function(oData, Response) {
					oGlobalBusyDialog.close();
					sap.ui.getCore().byId("id_Remark").setValue('');
					sap.m.MessageBox.success('Comment Successfully Saved for QID ' + parseInt(Balance_parameters.Queid), {
						title: "Success",
						onClose: function(oAction) {
							if (oAction === "OK") {
								that.AddComment_frag.close();
								that.fn_TransHistory();
							}
						}
					});
				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					sap.ui.getCore().byId("id_Remark").setValue('');
					that.AddComment_frag.close();

					sap.m.MessageToast.show(oResponse.message);
				}
			});

		},
		fn_TransHistory: function() {
			oGlobalBusyDialog.open();
			var QueueID = Balance_parameters.Queid; //QueueID
			var vhistory = 'H';

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Qid", FilterOperator.EQ, QueueID),
					new Filter("History", FilterOperator.EQ, vhistory)

				],
				urlParameters: {
					$expand: "NavTransHis"

				},

				success: function(oData, oResponse) {

					var vTransLen = oData.results[0].NavTransHis.results.length;

					if (vTransLen === 0) {
						var text = "No Transaction History Found";
						that.getView().byId('id_list').setNoDataText(text);
					} else {
						var arr_2 = [];
						arr_2 = oData.results[0].NavTransHis.results;

						var oCommentJSON = new sap.ui.model.json.JSONModel(arr_2);
						that.getView().setModel(oCommentJSON, "oComment");
					}

					oGlobalBusyDialog.close();

				},
				error: function(oRes) {
					oGlobalBusyDialog.close();
					that.openErrorDialog('Http Error');

				}

			});

		},
		fn_Image_new: function() {

			if (parameters[0].Qid !== "") {
				var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + parameters[0].Qid + "',Doc='')/$value#toolbar=0";

				var oHtml = new sap.ui.core.HTML({

				});

				var oContent = "<div class='overlay'><iframe   src=" + Url +
					" id='id_imageIfrm'  ' width='1500px' height=1000px' target='_self'></iframe></div>";
				oHtml.setContent(oContent);

				var strWindowFeatures = "location=yes,height=1000,resizable=yes,width=1000,scrollbars=yes,status=yes";

				var strWindowFeatures = "status=no,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,onpopstate=minimized";

				var win = window.open(Url, strWindowFeatures, "_self");

				win.focus();
				var oScrl = sap.ui.getCore().byId("id_scrll");

				oScrl.addContent(oHtml);
				oScrl.setVisible(false);
				$('id_scrll').click(false);

			} else {
				sap.m.MessageToast.show("Please Select the Queue ID");
			}

		},

		fn_add_attach_frag: function() {
			if (!this.AddAttach_frag) {
				this.AddAttach_frag = sap.ui.xmlfragment("FSC360NEW.fragment.AddAttachment", this);
				this.getView().addDependent(this.AddAttach_frag);
			}
			this.AddAttach_frag.open();
		},

		fn_cancel_add_attachment: function() {
			this.AddAttach_frag.close();
		},

		fn_clear_attachements: function() {
			Vattach_xstring = [];
			var oModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oModel, 'JSImgList');
		},

		onFileDeleted: function(oEvent) {
			var sFileName = oEvent.getParameter("item").getFileName();

			Vattach_xstring = Vattach_xstring.filter(function(obj) {
				return obj.fileName !== sFileName;
			});

			var oModel = this.getView().getModel('JSImgList');
			var aFiles = oModel.getData().filter(function(f) {
				return f.fileName !== sFileName;
			});
			oModel.setData(aFiles);
			MessageToast.show("File deleted successfully.");
		},

		fn_View_Attachment: function(oEvent) {
			var Vdoc = oEvent.getSource().getBindingContext("JSImgList").getObject().Docid;
			try {
				window.open(encodeURI("/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + parameters[0].Qid + "',Doc='" + Vdoc + "')/$value"));
			} catch (e) {
		
			}
		},

		fn_ok_add_attachment: function() {
			if (!Vattach_xstring || Vattach_xstring.length === 0) {
				MessageToast.show("No attachment is added. Please click + to add the attachment.");
				return;
			}
			this.fn_LoadF5();
		},

		fn_LoadF5: function() {
			var that = this;

			oGlobalBusyDialog.open();

			var oEntity = {
				Qid: Balance_parameters.Queid,
				Flag: 'L',
				NavItemTabDetails: [],
				NavHead: [],
				NavTaxTab: [],
				NavDeepImage: Vattach_xstring
			};

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
		

			oModel.create('/DEEPHEADSet', oEntity, {
				success: function() {
					oGlobalBusyDialog.close();
					sap.m.MessageBox.show("Invoice Attached Successfully", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
						onClose: function() {
							that.Advancefrag.destroy();
							that.fn_clear_attachements();
						}
					});
				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					var msg = "Error";
					try {
						msg = JSON.parse(oResponse.responseText).error.message.value;
					} catch (e) {}
					that.openErrorDialog(msg);
				}
			});

			that.AddAttach_frag.close();
		},
		onFileUploadChange: function(oEvent) {
			var oFile = oEvent.getParameter("files")[0];
			if (!oFile) return;

			var reader = new FileReader();
			var that = this;

			reader.onload = function(evt) {
				// This gives the result as a Data URL (e.g., data:application/pdf;base64,ABC123...)
				var base64String = evt.target.result.split(",")[1];

				if (!Vattach_xstring) {
					Vattach_xstring = [];
				}

				Vattach_xstring.push({
					Doc: oFile.name,
					Qid: parameters[0].Qid,
					MimeType: oFile.type,
					Xstring: base64String // send as base64-encoded string
				});

				// Update file list model for UI display
				var oModel = that.getView().getModel("JSImgList");
				var aFiles = oModel ? oModel.getData() : [];
				aFiles.push({
					fileName: oFile.name,
					mimeType: oFile.type
				});

				if (!oModel) {
					oModel = new sap.ui.model.json.JSONModel();
				}
				oModel.setData(aFiles);
				that.getView().setModel(oModel, "JSImgList");
			};

			// URL for automatic Base64 + Mime type
			reader.readAsDataURL(oFile);
		},
		fnchangeGrn: function(oEvent) {

			var vSelKey = oEvent.getSource().getSelectedKey();
			if (this.getView().getModel('JSInvdethead').getData()[0].Invtype == 'LOSO') {
				var vSES = this.getView().getModel('JSInvdet').getData()[0].Lfbnr;
			} else {
				var vGrn = this.getView().getModel('JSInvdet').getData()[0].Mblnr;
			}
			var vEbeln = this.getView().getModel('JSInvdet').getData()[0].Ebeln;

			if (vSelKey == "2") {
				this.getView().byId('id_InGrnChange').setValue(vEbeln);

			} else if (vSelKey == "1") {
				this.getView().byId('id_InGrnChange').setValue(vGrn);

			} else {
				this.getView().byId('id_InGrnChange').setValue(vSES);

			}
		},

		fnConfirmGrn: function(oEvent) {
			oGlobalBusyDialog.close();
			var oEntity = {};
			var GrnSelect = this.getView().byId('id_SelChangeGrn').getSelectedKey();
			oEntity.IvAction = 'Adopt';
			var that = this;

			if (GrnSelect == "2") {
				oEntity.NavGetItemValues = this.getView().getModel('JSPO').getData();
				oEntity.App = 'P';

			} else if (GrnSelect == "1") {
				oEntity.NavGetItemValues = this.getView().getModel('JSGoods').getData();
				oEntity.App = 'G';
			} else if (GrnSelect == "3") {
				oEntity.NavGetItemValues = this.getView().getModel('JSses').getData();
				oEntity.App = 'S';
			}

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oEntity.NavHead = that.getView().getModel("JSInvdethead").getData();
			oEntity.NavReturn = [];
			oEntity.NavTaxTab = [];
			oEntity.NavSimulate = [];
			oEntity.NavChecklist = [];
			oEntity.NavItemTabDetails = [];
			oGlobalBusyDialog.open();
			oEntity.NavHead[0].Ntamt = oEntity.NavHead[0].Ntamt.toString();
			oModel.create('/DEEPHEADSet', oEntity, {

				success: function(oData, Response) {
					oGlobalBusyDialog.close();
					that.changeGRN.close();
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.NavItemTabDetails.results);
					that.getView().setModel(oModel, 'JSPORefDet');
					// line added by yasin on 08-10-2025 start
					var oTable = that.getView().byId("id_table_poref");
					var iLength = oData.NavItemTabDetails.results.length;
					oTable.setVisibleRowCount(iLength);
					//line added by yasin on 08-10-2025 end

					var oSeletedKey = that.getView().byId('id_SelChangeGrn').getSelectedKey();
					if (oSeletedKey === "1") {
						var oSelecteddata = that.getView().getModel('JSGoods').getData();
						// var vGrn = oSelecteddata[oSelecteddata.length - 1].Mblnr;
						var vIndex = oSelecteddata.length - 1;
						for (var i = vIndex; i >= 0; i--) {
							if (oSelecteddata[i].Mblnr) {
								var vGrn = oSelecteddata[i].Mblnr;
								break;
							}
						}

						that.getView().byId("id_InGrnChange").setValue(vGrn);

					} else if (oSeletedKey === "2") {

						var oSelecteddata = that.getView().getModel('JSPO').getData();
						var vIndex = oSelecteddata.length - 1;
						for (var i = vIndex; i >= 0; i--) {
							if (oSelecteddata[i].Ebeln) {
								var vPO = oSelecteddata[i].Ebeln;
								break;
							}
						}

						that.getView().byId("id_InGrnChange").setValue(vPO);

					} else if (oSeletedKey === "3") {

						var oSelecteddata = that.getView().getModel('JSses').getData();
						// var vSES = oSelecteddata[oSelecteddata.length - 1].Lfbnr;
						var vIndex = oSelecteddata.length - 1;
						for (var i = vIndex; i >= 0; i--) {
							if (oSelecteddata[i].Lfbnr) {
								var vSES = oSelecteddata[i].Lfbnr;
								break;
							}
						}

						that.getView().byId("id_InGrnChange").setValue(vSES);
					}

					that.fn_Item_Amount_Initial_PO();
					that.fnCalculateTax();
					that.fn_withholding(); //Added by Manosanakri 

				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					that.changeGRN.close();
						this.changeGRN.destroy();
				this.changeGRN = null;
					sap.m.MessageToast.show(oResponse.message);
				}
			});

		},
		fnCloseGrn: function() {
			this.changeGRN.close();
				this.changeGRN.destroy();
				this.changeGRN = null;
		},
		//Added by Sakthi C on 01.09.2023 - start
		fnDownLoad: function(oDate) {
			//Added by Lokesh R on 06.09.2023 - Start
			var othis = this.getView();
			var arr = [];
			var arr1 = [];
			arr = this.getView().getModel("JSInvdet").getData();
			var oDownJson = new sap.ui.model.json.JSONModel();
			for (var i = 0; i < arr.length; i++) {
				var temp = {
					"GLAC": arr[i].Saknr,
					"CCenter": arr[i].Kostl,
					"PCenter": arr[i].Prctr,
					"HCode": arr[i].Hsncode,
					"Amount": arr[i].Netpr,
					"Tax": arr[i].Mwskz,
					"Itemtxt": arr[i].Itemtxt,
					"Iorder": arr[i].Intorder
				}
				arr1.push(temp);
			}
			oDownJson.setData(arr1);
			this.getView().setModel(oDownJson, "JMDown");
			var oExport = new Export({
				exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
					//separatorChar: ",",
					fileExtension: "xls",
					separatorChar: "\t",
					charset: "utf-8"
				}),
				models: this.getView().getModel("JMDown"),
				rows: {
					path: "/"
				},
				columns: [{
						name: "GL_Account",
						template: {
							content: "{GLAC}"
						}

					}, {
						name: "Cost_center",
						template: {
							content: "{CCenter}"
						}

					}, {
						name: "Profit_center",
						template: {
							content: "{PCenter}"
						}

					}, {
						name: "HSN_code",
						template: {
							content: "{HCode}"
						}

					}, {
						name: "Amount",
						template: {
							content: "{Amount}"
						}

					}, {
						name: "Taxcode",
						template: {
							content: "{Tax}"
						}

					}, {
						name: "Item_text",
						template: {
							content: "{Itemtxt}"
						}

					}, {
						name: "Internal_order",
						template: {
							content: "{Iorder}"
						}
					}
					// ...
				]
			});
			oExport.saveFile("Template").catch(function(oError) {
				sap.m.MessageBox.error("Error when downloading data..." + oError);
			}).then(function() {
				oExport.destroy();
			});

		},
		fnUpload: function() {
			this.getUpload_frag = sap.ui.xmlfragment("FSC360NEW.fragment.upload", this);
			this.getView().addDependent(this.getUpload_frag);
			this.getUpload_frag.open();
		},
		fn_uploadCancel: function() {
			this.getUpload_frag.destroy();
			Uploadarr = [];
		},
		fn_uploadSubmit: function() {
			if (Uploadarr.length !== 0) {
				this.getView().getModel("JSInvdet").setData(Uploadarr);
				var oTabM = this.getView().getModel("JSInvdet");
				var oTabD = oTabM.getData();
				this.fnSetItemNo(oTabM, oTabD);
				this.fn_Item_Amount_Initial_NonPO();
				this.fnCalculateTax();
			}
			this.getUpload_frag.destroy();
			Uploadarr = [];

		},
		fnSetItemNo: function(oTabModel, oTabData) {
			var count = 1;
			for (var i = 0; i < oTabData.length; i++) {
				oTabData[i].Item = count.toString();
				oTabData[i].Qid = parameters[0].Qid;
				count = count + 1;
			}
			var jmod = new sap.ui.model.json.JSONModel();
			jmod.setData(oTabData);
			this.getView().setModel(jmod, 'JSInvdet');
			oTabModel.refresh();
		},
		handleUploadComplete: function(e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		_import: function(file) {
			var that = this;
			var excelData = {};
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function(sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

					});
					for (var i = 0; i < excelData.length; i++) {
						var temp = {
							"Saknr": excelData[i].GL_Account,
							"Kostl": excelData[i].Cost_center,
							"Prctr": excelData[i].Profit_center,
							"Hsncode": excelData[i].HSN_code,
							"Netpr": excelData[i].Amount,
							"Mwskz": excelData[i].Taxcode,
							"Itemtxt": excelData[i].Item_text,
							"Intorder": excelData[i].Internal_order
						};
						Uploadarr.push(temp);
					}

				};
				reader.onerror = function(ex) {
				
				};
				reader.readAsBinaryString(file);
			}
		},
		fn_copyitem: function(oEvent) {
			var oSource = oEvent.getSource();
			var oContext = oSource.getBindingContext("JSInvdet");
			if (!oContext) {
				sap.m.MessageToast.show("No context found for copy action.");
				return;
			}

			var vPath = oContext.getPath(); // e.g., "/2"
			var index = parseInt(vPath.split("/")[1]);

			var oTabModel = this.getView().getModel("JSInvdet");
			var oTabData = oTabModel.getProperty("/");

			var copiedRow = Object.assign({}, oTabData[index]);
			oTabData.push(copiedRow);

			oTabModel.setProperty("/", oTabData);
			oTabModel.refresh();

			this.fnCalculateTax(); // Optional if you want to recalculate tax
			var that = this;
			setTimeout(function() {
				that._applyFlexGrow();
			}, 0); // run after DOM updates
		},
		fn_deleteitem: function(oEvent) {
			var vPath = Number(oEvent.getSource().getBindingContext("JSInvdet").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JSInvdet");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);
				this.fnSetItemNo(oTabModel, oTabData); //Set Item Number Sorted
				oTabModel.refresh();

				this.fn_Item_Amount_Initial_NonPO();
				this.fnCalculateTax();

			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("deleteitem"));
			}
			var that = this;
			setTimeout(function() {
				that._applyFlexGrow();
			}, 0); // run after DOM updates
		},
		onSelectAllCheck: function(oEvent) {
			var bSelected = oEvent.getParameter("selected"); // true or false
			var oModel = this.getView().getModel("JSPORefDet");
			var aItems = oModel.getProperty("/");

			for (var i = 0; i < aItems.length; i++) {
				aItems[i].checked = bSelected;
			}

			oModel.refresh(); // Update bindings to reflect checkbox changes
		},
		onAfterSimulateDialogOpen: function() {
		

			// dialog sliding in from right
			setTimeout(function() {
				var $dlg = $(".cl_frag_rightslide");
				if ($dlg.length) {
					$dlg[0].style.setProperty("transition", "transform 0.4s ease-in-out", "important");
					$dlg[0].style.setProperty("transform", "translateX(0%)", "important");
				
				}
			}, 50);

			var oTable = sap.ui.getCore().byId("idsimtable");

			if (!oTable) {
			
				return;
			}

			// Start polling every 100ms to wait for the model
			var checkModel = setInterval(function() {
				var oModel = oTable.getModel("JMSimulate");

				if (oModel) {
					clearInterval(checkModel); // Stop checking
					

					var aData = oModel.getData();

					if (Array.isArray(aData)) {
						oTable.setVisibleRowCount(Math.min(aData.length, 10));
					} else if (Array.isArray(aData.results)) {
						oTable.setVisibleRowCount(Math.min(aData.results.length, 10));
					} else {
						
					}
				} else {
				
				}
			}, 100); // check every 100ms
		},
		fn_materialfrag_mat_Tab: function(oEvent) {
			vMaterialID = 0;
			if (!this.getMaterial_frag) {
				this.getMaterial_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Material", this);
				this.getView().addDependent(this.getMaterial_frag);
			}
			this.getMaterial_frag.open();
		},
		fn_plantfrag_mat_Tab: function(oEvent) {
			vPlantID = 0;
			if (!this.getPlant_frag) {
				this.getPlant_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Plant", this);
				this.getView().addDependent(this.getPlant_frag);
			}
			this.getPlant_frag.open();
		},
		fn_Taxcodefrag_MatTab: function(oEvent) {
			vTaxID = 0;

			if (!this.TaxCodemattab_frag) {
				this.TaxCodemattab_frag = sap.ui.xmlfragment("FSC360NEW.fragment.TaxCodeMatTab", this);
				this.getView().addDependent(this.TaxCodemattab_frag);
			}
			this.TaxCodemattab_frag.open();
		},

		fn_Material_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Maktg", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_Material_Confrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oView = this.getView();

			if (oSelectedItem) {
				// Get both code and description from binding context
				var sMatnr = oSelectedItem.getBindingContext("JSMaterial").getProperty("Matnr");
				var sMaktg = oSelectedItem.getBindingContext("JSMaterial").getProperty("Maktg");

				var oMatModel = oView.getModel("JSMatdet");
				if (oMatModel) {
					var oMatData = oMatModel.getData();

					// Set like old version
					oMatData[vMaterialID].Matnr = sMatnr;
					oMatData[vMaterialID].Mat_Desc = sMaktg;

					oMatModel.refresh();
				}

				// Update the material description text in the UI
				oView.byId("id_material_desc").setText(sMaktg);
			}

			// Clear filters and close dialog
			oEvent.getSource().getBinding("items").filter([]);
		},
		formatMaterial: function(sMatnr, sMaktg) {
			if (sMatnr && sMaktg) {
				return sMatnr + " - " + sMaktg;
			}
			return sMatnr || "";
		},

		fn_plant_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_plant_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_Plant_Confrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sWerks = oSelectedItem.getBindingContext("JSPlant").getProperty("Werks");
				var sName1 = oSelectedItem.getBindingContext("JSPlant").getProperty("Name1");

				var oMatModel = this.getView().getModel("JSMatdet");
				if (oMatModel) {
					var oMatData = oMatModel.getData();
					oMatData[vPlantID].Plnt = sWerks;
					oMatData[vPlantID].Plant_Desc = sName1; // optional, if you want to store description
					oMatModel.refresh();
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		formatPlant: function(sWerks, sName1) {
			if (sWerks && sName1) {
				return sWerks + " - " + sName1;
			}
			return sWerks || "";
		},

		fn_TaxCodemattab_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mwskz", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fn_TaxConfrm_mattab: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sTitle = oSelectedItem.getTitle(); // "Mwskz - Text1"
				var parts = sTitle.split(" - ");
				var sMwskz = parts[0];
				var sText1 = parts[1] || "";

				var oMatModel = this.getView().getModel("JSMatdet");
				if (oMatModel) {
					var oMatData = oMatModel.getData();
					oMatData[vTaxID].Mwskz = sMwskz;
					oMatData[vTaxID].Taxdesc = sText1;
					oMatModel.refresh(true);
					this.fnCalculateTax();
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		formatTaxCodeMatTab: function(sMwskz, sText1) {
			if (sMwskz && sText1) {
				return sMwskz + " - " + sText1;
			}
			return sMwskz || "";
		},
		formatTaxCode: function(sMwskz, sText1) {
			if (sMwskz && sText1) {
				return sMwskz + " - " + sText1;
			}
			return sMwskz || "";
		},
		fnAppendPercent: function(val) {
			return val ? val + " %" : "";
		},
		fn_onCostCenterChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oCtx = oCombo.getBindingContext("JSInvdet"); // row context in the list

			if (oItem && oCtx) {
				var sKostl = oItem.getKey();
				var sKtext = oItem.getText().split(" - ")[1] || "";

				// read Prctr directly from the item's binding context in JSCostCenter
				var sPrctr = oItem.getBindingContext("JSCostCenter").getProperty("Prctr");

				// update row in JSInvdet model
				oCtx.getModel().setProperty(oCtx.getPath() + "/Kostl", sKostl);
				oCtx.getModel().setProperty(oCtx.getPath() + "/Ktext", sKtext);
				oCtx.getModel().setProperty(oCtx.getPath() + "/Prctr", sPrctr);

				// display only key in input field
				oCombo.setValue(sKostl);
			}
		},
		fn_onTaxCodeChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oCtx = oCombo.getBindingContext("JSInvdet"); // row context in JSInvdet list

			if (oItem && oCtx) {
				var sCode = oItem.getKey();
				var sDesc = oItem.getText().split(" - ")[1] || "";

				// Update row data in JSInvdet
				oCtx.getModel().setProperty(oCtx.getPath() + "/Mwskz", sCode);
				oCtx.getModel().setProperty(oCtx.getPath() + "/Taxdesc", sDesc);

				// Force input field to only display the tax code (not description)
				oCombo.setValue(sCode);

				// Call your tax calculation after update
				this.fnCalculateTax();
			}
		},
		fn_onTaxCodeChange1: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oCtx = oCombo.getBindingContext("JSInvdet"); // row context in JSInvdet list

			if (oItem && oCtx) {
				var sCode = oItem.getKey();
				var sDesc = oItem.getText().split(" - ")[1] || "";

				// Update row data in JSInvdet
				oCtx.getModel().setProperty(oCtx.getPath() + "/Mwskz", sCode);
				oCtx.getModel().setProperty(oCtx.getPath() + "/Taxdesc", sDesc);

				// Force input field to only display the tax code (not description)
				oCombo.setValue(sCode);

				// Call your tax calculation after update

			}
		},
		onMaterialChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oModel = this.getView().getModel("JSMatdet");
			if (oItem) {
				var sMatnr = oItem.getKey(); // Material Code
				var sMaktg = oItem.getText().split(" - ")[1] || ""; // Material Desc

				// Update model (Matnr + Description)
				var oCtx = oCombo.getBindingContext("JSMatdet");
				if (oCtx) {
					oCtx.getModel().setProperty(oCtx.getPath() + "/Matnr", sMatnr);
					oCtx.getModel().setProperty(oCtx.getPath() + "/Mat_Desc", sMaktg);
				}

				// Force ComboBox to display only code
				oCombo.setValue(sMatnr);
				var sPlant = oModel.getProperty("/0/Plnt");
				if (!sPlant) {
					sap.m.MessageToast.show("Please enter Plant");
				}
			}
		},
		onPlantChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oModel = this.getView().getModel("JSMatdet");
			if (oItem) {
				var sWerks = oItem.getKey(); // Plant code
				var sName1 = oItem.getText().split(" - ")[1] || ""; // Plant desc

				// Update JSMatdet model (code + desc)
				var oCtx = oCombo.getBindingContext("JSMatdet");
				if (oCtx) {
					oCtx.getModel().setProperty(oCtx.getPath() + "/Plnt", sWerks);
					oCtx.getModel().setProperty(oCtx.getPath() + "/Plant_Desc", sName1);
				}

				// Force ComboBox to show only code
				oCombo.setValue(sWerks);
				var sAmount = oModel.getProperty("/0/Zuumb");
				if (!sAmount || sAmount === "0" || sAmount === "0.000") {
					sap.m.MessageToast.show("Please enter Amount");
				}
				// Update desc text
				this.byId("id_plant_desc").setText(sName1);
			}
		},

		onQuantityChange: function(oEvent) {
			var sValue = oEvent.getParameter("value").trim();
			var oModel = this.getView().getModel("JSMatdet");

			// Update the Quantity in model
			oModel.setProperty("/0/Menge", sValue);

			// Clear previous timer if user is still typing
			if (this._quantityChangeTimer) {
				clearTimeout(this._quantityChangeTimer);
			}

			var that = this;
			this._quantityChangeTimer = setTimeout(function() {
				var sTaxCode = oModel.getProperty("/0/Mwskz");
				if (!sTaxCode) {
					sap.m.MessageToast.show("Please select Tax Code");
				}
			}, 500); // Wait 500ms after typing stops
		},
		fn_onTaxCodeMatChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");

			if (oItem) {
				var sMwskz = oItem.getKey(); // Tax code
				var sText1 = oItem.getText().split(" - ")[1] || ""; // Tax description

				// Update JSMatdet model
				var oCtx = oCombo.getBindingContext("JSMatdet");
				if (oCtx) {
					oCtx.getModel().setProperty(oCtx.getPath() + "/Mwskz", sMwskz);
					oCtx.getModel().setProperty(oCtx.getPath() + "/Taxdesc", sText1);
				}

				// Force ComboBox to show only the code
				oCombo.setValue(sMwskz);

				// Recalculate tax if needed
				this.fnCalculateTax();
			}
		},
		fn_onHSNChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");

			if (oItem) {
				var sCode = oItem.getKey(); // HSN code
				var sDesc = oItem.getText().split(" - ")[1] || ""; // HSN description

				// Update JSHSN model
				var oCtx = oCombo.getBindingContext("JSInvdet");
				if (oCtx) {
					oCtx.getModel().setProperty(oCtx.getPath() + "/Hsncode", sCode);
					oCtx.getModel().setProperty(oCtx.getPath() + "/Hsndesc", sDesc);
				}

				// Show only code in input
				oCombo.setValue(sCode);

				// Update description text

			}
		},
		fn_onGLAccountChange: function(oEvent) {
			var oCombo = oEvent.getSource();
			var oItem = oEvent.getParameter("selectedItem");
			var oCtx = oCombo.getBindingContext("JSInvdet"); // row context

			if (oItem && oCtx) {
				var sKey = oItem.getKey(); // Saknr
				var sDesc = oItem.getText().split(" - ")[1] || ""; // Txt50

				// update row in JSInvdet model
				oCtx.getModel().setProperty(oCtx.getPath() + "/Saknr", sKey);
				oCtx.getModel().setProperty(oCtx.getPath() + "/Gldesc", sDesc);

				// force input field to display only the key
				oCombo.setValue(sKey);
			}
		},
		fn_HSNChange_PO: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey(); // Steuc (HSN code)
				var sText = oSelectedItem.getText(); // "Steuc - Desc"

				// Find the row context (important in list binding!)
				var oCtx = oEvent.getSource().getBindingContext("JSPORefDet");
				if (oCtx) {
					var oRow = oCtx.getObject();
					oRow.J1bnbm = sKey; // store only code in your row model
					oCtx.getModel().refresh(true);
				}
			}
		},
		//Added by Sakthi
		fn_amount_split: function() {
			var oView = this.getView();

			// Safely get invoice head data
			var aInvHeadData = oView.getModel('JSInvdethead') ? oView.getModel('JSInvdethead').getData() : [];
			var vNtamt = aInvHeadData.length > 0 && aInvHeadData[0].Ntamt ? aInvHeadData[0].Ntamt : 0;
			var vTax_amt = aInvHeadData.length > 0 && aInvHeadData[0].Intax ? aInvHeadData[0].Intax : 0;
			// var vNetamt = vNtamt - vTax_amt;
			var vNetamt = (parseFloat(vNtamt) - parseFloat(vTax_amt)).toFixed(2);
			var vPayterm = aInvHeadData.length > 0 && aInvHeadData[0].Zterm ? aInvHeadData[0].Zterm : "";
			var vCurrency = aInvHeadData.length > 0 && aInvHeadData[0].Waers ? aInvHeadData[0].Waers : "";

			// Safely get PO Reference data
			var aPORefDet = oView.getModel('JSPORefDet') ? oView.getModel('JSPORefDet').getData() : [];
			var vtaxcode = (aPORefDet.length > 0 && aPORefDet[0].Taxcode) ? aPORefDet[0].Taxcode : "";

			// Determine payment mode
			var vMethod = (vCurrency === 'INR') ? 'F' : '';

			// Safely get Withholding tax data
			var oWithHoldModel = oView.getModel("JSWithHold");
			var aWithHoldTax = (oWithHoldModel && oWithHoldModel.getData()) ? oWithHoldModel.getData() : [];

			var vAmt_splt_arr = [];

			// Create amount split only if either Net or Tax amounts exist
			if (vNtamt !== 0 || vTax_amt !== 0) {

				// First row – Net amount with dynamic WHT details
				vAmt_splt_arr.push({
					Amount: vNetamt,
					// Amount: vNtamt,
					PaymentTerm: vPayterm,
					TaxCode: vtaxcode,
					expanded: false,
					PaymentMode: vMethod,
					details: aWithHoldTax.map(function(item) {
						return {
							Name: item.WtType || "",
							WTaxCode: item.WtWithcd || "",
							BaseFC: item.WtQsshb || 0,
							AmtFC: item.WtQsshh || 0,
							BaseLC: item.WtQbshb || 0,
							AmtLC: item.WtQbshh || 0
						};
					})
				});

				// Second row – Tax amount, no details
				vAmt_splt_arr.push({
					Amount: vTax_amt,
					PaymentTerm: vPayterm,
					TaxCode: vtaxcode,
					expanded: false,
					PaymentMode: vMethod,
					details: [] // No details for tax split
				});
			}

			// Wrap final array in an object for the model
			var vamt_total = {
				AmountSplit: vAmt_splt_arr
			};

			// Set to model
			var oModel = new sap.ui.model.json.JSONModel(vamt_total);
			oView.setModel(oModel, "amountsplit");
		},
		fn_amount_split_org: function() {
			var oView = this.getView();

			// Safely get invoice head data
			var aInvHeadData = oView.getModel('JSInvdethead') ? oView.getModel('JSInvdethead').getData() : [];
			var vNtamt = aInvHeadData.length > 0 && aInvHeadData[0].Ntamt ? aInvHeadData[0].Ntamt : 0;
			var vTax_amt = aInvHeadData.length > 0 && aInvHeadData[0].Intax ? aInvHeadData[0].Intax : 0;
			// var vNetamt = vNtamt - vTax_amt;
			var vNetamt = (parseFloat(vNtamt) - parseFloat(vTax_amt)).toFixed(2);
			var vPayterm = aInvHeadData.length > 0 && aInvHeadData[0].Zterm ? aInvHeadData[0].Zterm : "";
			var vCurrency = aInvHeadData.length > 0 && aInvHeadData[0].Waers ? aInvHeadData[0].Waers : "";

			// Safely get PO Reference data
			var aPORefDet = oView.getModel('JSPORefDet') ? oView.getModel('JSPORefDet').getData() : [];
			var vtaxcode = (aPORefDet.length > 0 && aPORefDet[0].Taxcode) ? aPORefDet[0].Taxcode : "";

			// Determine payment mode
			var vMethod = (vCurrency === 'INR') ? 'F' : '';

			// Safely get Withholding tax data
			var oWithHoldModel = oView.getModel("JSWithHold");
			var aWithHoldTax = (oWithHoldModel && oWithHoldModel.getData()) ? oWithHoldModel.getData() : [];

			var vAmt_splt_arr = [];

			// Create amount split only if either Net or Tax amounts exist
			if (vNtamt !== 0 || vTax_amt !== 0) {

				// First row – Net amount with dynamic WHT details
				vAmt_splt_arr.push({
					// Amount: vNetamt,
					Amount: vNtamt,
					PaymentTerm: vPayterm,
					TaxCode: vtaxcode,
					expanded: false,
					PaymentMode: vMethod,
					details: aWithHoldTax.map(function(item) {
						return {
							Name: item.WtType || "",
							WTaxCode: item.WtWithcd || "",
							BaseFC: item.WtQsshb || 0,
							AmtFC: item.WtQsshh || 0,
							BaseLC: item.WtQbshb || 0,
							AmtLC: item.WtQbshh || 0
						};
					})
				});

				// Second row – Tax amount, no details
				// vAmt_splt_arr.push({
				//     Amount: vTax_amt,
				//     PaymentTerm: vPayterm,
				//     TaxCode: vtaxcode,
				//     expanded: false,
				//     PaymentMode: vMethod,
				//     details: [] // No details for tax split
				// });
			}

			// Wrap final array in an object for the model
			var vamt_total = {
				AmountSplit: vAmt_splt_arr
			};

			// Set to model
			var oModel = new sap.ui.model.json.JSONModel(vamt_total);
			oView.setModel(oModel, "amountsplit");
		},

		fn_changeamtsplit: function(oEvent) {
			var vNtamt = this.getView().getModel('JSInvdethead').getData()[0].Ntamt;
			var vTax_amt = this.getView().getModel('JSInvdethead').getData()[0].Intax;
			// var vNetamt = vNtamt - vTax_amt;
			var vNetamt = (parseFloat(vNtamt) - parseFloat(vTax_amt)).toFixed(2);
			var mAmt_split = this.getView().getModel("amountsplit").getData();
			var mAmt_cal;
			var vLen_amtsplit = mAmt_split.AmountSplit.length;
			var vTotalamount = 0;
			for (var i = 0; i < vLen_amtsplit; i++) {
				if (mAmt_split.AmountSplit[i].Amount !== vTax_amt) {
					vTotalamount = Number(vTotalamount) + Number(mAmt_split.AmountSplit[i].Amount);
				}
			}
			if (vTotalamount > 0) {
				// mAmt_cal = vNetamt - vTotalamount;
				mAmt_cal = (parseFloat(vNetamt) - parseFloat(vTotalamount)).toFixed(2);
				var vamt_st = {
					Amount: mAmt_cal,
					PaymentTerm: mAmt_split.AmountSplit[0].PaymentTerm,
					TaxCode: mAmt_split.AmountSplit[0].TaxCode,
					expanded: false,
					PaymentMode: mAmt_split.AmountSplit[0].PaymentMode
				}
				mAmt_split.AmountSplit.push(vamt_st);
			}
			// var oModel = new sap.ui.model.json.JSONModel(mAmt_split);
			// this.getView().setModel(oModel, "amountsplit");

		},
		//Added by Sakthi

		onRefreshPage: function() {
			location.reload();
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
					link.download = "Invoice_" + QueueID + ".pdf"; //filename with QueueID
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					sap.m.MessageBox.error("Error while downloading: " + err.message);
				});
		},
		fn_orgstatus: function(oEvent) {

			// Simply call the amount split logic to reset the amounts to initial state
			this.fn_amount_split_org();
		},
		// fn_Cleardpfrag: function() {
		// 	var mdpclearing = this.getView().getModel("JDPClear").getData();
		// 	var oModel = new sap.ui.model.json.JSONModel();
		// 	oModel.setData(mdpclearing);
		// 	this.getView().setModel(oModel, 'JDPClear_Original');

		// 	if (!this.dpclearingfrag) {
		// 		this.dpclearingfrag = sap.ui.xmlfragment(
		// 			"FSC360NEW.fragment.DP_Clearing", this);
		// 		this.getView().addDependent(this.dpclearingfrag);

		// 	}
		// 	this.dpclearingfrag.open();

		// },
			fn_Cleardpfrag: function() {
			var mdpclearing = this.getView().getModel("JDPClear").getData();
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(mdpclearing);
			this.getView().setModel(oModel, 'JDPClear_Original');

			if (!this.dpclearingfrag) {
				this.dpclearingfrag = sap.ui.xmlfragment(
					"FSC360NEW.fragment.DP_Clearingview", this);
				this.getView().addDependent(this.dpclearingfrag);

			}
			this.dpclearingfrag.open();

		},
			fn_closedp: function() {
			this.dpclearingfrag.close();
				this.dpclearingfrag.destroy();
				this.dpclearingfrag = null;
		},

		fn_closedpclear: function() {
			var mdpclearing = this.getView().getModel("JDPClear_Original").getData();
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(mdpclearing);
			this.getView().setModel(oModel, 'JDPClear');
			this.dpclearingfrag.destroy();
			this.dpclearingfrag = null;
		},
		fn_submitdpclear: function() {
			this.dpclearingfrag.destroy();
			this.dpclearingfrag = null;
		},

		onSelectAll: function() {
			var oTable = this.byId("id_table_poref");

			// Get the table binding
			var oBinding = oTable.getBinding("rows");
			if (!oBinding) {

				return;
			}

			// Get total rows
			var aContexts = oBinding.getContexts();
			if (aContexts.length === 0) {
				sap.m.MessageToast.show("No rows to select.");
				return;
			}

			// Select all rows
			oTable.addSelectionInterval(0, aContexts.length - 1);

		},
		onDeselectAll: function() {
			var oTable = this.byId("id_table_poref");

			// Clear all selections
			oTable.clearSelection();

		},
		onRefreshPress: function() {
			var oTable = this.byId("id_table_poref");
			var oModel = this.getView().getModel("JSPORefDet");

			// Validate model and data
			if (!oModel || !oModel.getData()) {
				sap.m.MessageToast.show("Error: PO Reference data is not available.");
			
				return;
			}

			var aData = oModel.getData();

			// Get selected indices
			var aSelectedIndices = oTable.getSelectedIndices();

			// Filter data to keep only selected items
			var aSelectedData = aSelectedIndices.map(function(iIndex) {
				return aData[iIndex];
			});

			// Update model with selected items
			oModel.setData(aSelectedData);

			// Clear selection (optional, based on requirements)
			oTable.clearSelection();
			var aItems = this.getView().getModel('JSPORefDet').getData();
			var iRowCount = aItems.length;

			// Optional min/max limits
			if (iRowCount > 10) iRowCount = 10; // max 10 rows
			if (iRowCount < 1) iRowCount = 1; // min 2 rows

			oTable.setVisibleRowCount(iRowCount);
			// Refresh the table binding
			var oBinding = oTable.getBinding("rows") || oTable.getBinding("items"); // Support both sap.ui.table.Table and sap.m.Table
			if (oBinding) {
				oBinding.refresh();
			} else {
		
			}
			if (oTable instanceof sap.ui.table.Table) {
				// For sap.ui.table.Table
				oTable.selectAll();
			} else if (oTable instanceof sap.m.Table) {
				// For sap.m.Table
				oTable.getItems().forEach(function(oItem, iIndex) {
					oTable.setSelectedItem(oItem, true);
				});
			}
			// Recalculate tax
			this.fnCalculateTax();
			var obj = {};
			obj.IvAction = 'TDS'; // <-- Important
			obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
			obj.NavHead = this.getView().getModel("JSInvdethead").getData();
			obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
			obj.NavReturn = [];
			obj.NavWithHoldTax = [];

			var oHead = obj.NavHead[0];
			oHead.Ntamt = oHead.Ntamt ? oHead.Ntamt.toString() : "0.00";

			// ensure Netpr is not empty
			for (var i = 0; i < obj.NavGetItemValues.length; i++) {
				if (!obj.NavGetItemValues[i].Netpr) {
					obj.NavGetItemValues[i].Netpr = "0.00";
				}
			}

			var oSrvModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oSrvModel.create("/DEEPHEADSet", obj, {
				success: function(oData) {
					if (oData.NavReturn.results.length !== 0) {
						var errmsg = oData.NavReturn.results[0].Message;
						that.openErrorDialog(errmsg);
					} else {

						var oWithHoldModel = new sap.ui.model.json.JSONModel(oData.NavWithHoldTax.results);
						that.getView().setModel(oWithHoldModel, "JSWithHold");

						// sap.m.MessageToast.show("Withholding Tax calculated successfully.");
					}
				},
				error: function(oError) {

					that.openErrorDialog("Error calculating Withholding Tax.");
				}
			});
		},
		openErrorDialog: function(sMessage) {
			var oView = this.getView();

			// Set the dynamic message in the model
			oView.getModel("errorModel").setProperty("/message", sMessage);

			// Follow your standard fragment loading approach
			if (!this.ErrorDialog) {
				this.ErrorDialog = sap.ui.xmlfragment(oView.getId(), "FSC360NEW.Fragment.ErrorReuse", this);
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
		fn_closeSuccess: function() {
			if (this.SuccessDialog) {
				this.SuccessDialog.close();
			}
			var sUserType = this.getOwnerComponent().getModel("GlobalData").getProperty("/UserType");
			// this.oReject.close();
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo('Fulfilment', {
				btnstat: sUserType
			});
		},
		openSuccessDialog: function(sMessage) {
			var oView = this.getView();

			// Set dynamic message
			oView.getModel("successModel").setProperty("/message", sMessage);

			// Load fragment only once
			if (!this.SuccessDialog) {
				this.SuccessDialog = sap.ui.xmlfragment(oView.getId(), "FSC360NEW.Fragment.SuccessReuse", this);
				oView.addDependent(this.SuccessDialog);
			}

			this.SuccessDialog.open();
		},


// 		onGrnValueHelp: function (oEvent) {
//     var that = this;
//     var oInput = oEvent.getSource();
//     var oContext = oInput.getBindingContext("JSGoods");
//     var sPath = oContext.getPath();
//     var sBukrs = this.sBukrs;

//     if (!sBukrs) {
//         sap.m.MessageToast.show("Please select Company Code first");
//         return;
//     }

//     var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
//     oGlobalBusyDialog.open();

//     oModel.read("/GrnlistSet", {
//         filters: [new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs)],
//         success: function (oData) {
//             oGlobalBusyDialog.close();

//             if (!oData.results || oData.results.length === 0) {
//                 sap.m.MessageBox.warning("No GRN numbers found for the selected company.");
//                 return;
//             }

//             // Always create new dialog per click to prevent old bindings
//             var oGrnDialog = new sap.m.SelectDialog({
//                 title: "Select GRN Number",
//                 search: function (evt) {
//                     var sValue = evt.getParameter("value");
//                     var oFilter = new sap.ui.model.Filter("Mblnr", sap.ui.model.FilterOperator.Contains, sValue);
//                     evt.getSource().getBinding("items").filter([oFilter]);
//                 },
//                 confirm: function (evt) {
//                     var oSelected = evt.getParameter("selectedItem");
//                     if (oSelected) {
//                         var oSelData = oSelected.getBindingContext().getObject();
//                         var oTableModel = that.getView().getModel("JSGoods");
//                         var oRowData = oTableModel.getProperty(sPath);

//                         // Update GRN & Year only for this row
//                         oRowData.Mblnr = oSelData.Mblnr;
//                         oRowData.Gjahr = oSelData.Mjahr;
//                         oTableModel.setProperty(sPath, oRowData);

//                         sap.m.MessageToast.show("GRN selected: " + oSelData.Mblnr);
//                     }
//                     oGrnDialog.destroy(); // Destroy after use
//                 },
//                 cancel: function () {
//                     oGrnDialog.destroy(); // destroy even if cancelled
//                 }
//             });

//             var oItemTemplate = new sap.m.StandardListItem({
//                 title: "{Mblnr}",
//                 description: "{Mjahr}"
//             });

//             var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
//             oGrnDialog.setModel(oJSONModel);
//             oGrnDialog.bindAggregation("items", "/", oItemTemplate);

//             oGrnDialog.open();
//         },
//         error: function () {
//             oGlobalBusyDialog.close();
//             sap.m.MessageBox.error("Failed to load GRN list. Please try again later.");
//         }
//     });
// },

onYearSelect: function (oEvent) {
    var sSelectedYear = oEvent.getSource().getSelectedKey();
    var oView = this.getView();
    var aGoodsData = oView.getModel("JSGoods").getData();

    // Store currently selected GRNs
    var aSelectedGRNs = aGoodsData.map(item => item.Mblnr);

    // Filter GRNs
    var aAllGRNs = oView.getModel("JSGRN_ALL").getData() || [];
    var aFiltered = aAllGRNs.filter(oGRN => oGRN.Mjahr === sSelectedYear);

    // Update model
    var oFilteredModel = new sap.ui.model.json.JSONModel(aFiltered);
    oView.setModel(oFilteredModel, "JSGRN");

    // Restore selections (optional, only if same GRN exists)
    var oTableModel = oView.getModel("JSGoods");
    aGoodsData.forEach((item, idx) => {
        if (aSelectedGRNs.includes(item.Mblnr)) {
            oTableModel.setProperty(`/${idx}/Mjahr`, sSelectedYear);
        }
    });

    sap.m.MessageToast.show(`Filtered ${aFiltered.length} GRNs for year ${sSelectedYear}`);
},
// onYearSelect: function (oEvent) {
//     var sSelectedYear = oEvent.getSource().getSelectedKey();
//     var oView = this.getView();

//     // Retrieve full GRN list
//     var aAllGRNs = oView.getModel("JSGRN_ALL").getData() || [];

//     // Filter based on the selected year
//     var aFiltered = aAllGRNs.filter(function (oGRN) {
//         return oGRN.Mjahr === sSelectedYear;
//     });

//     // Update filtered list to combo
//     var oFilteredModel = new sap.ui.model.json.JSONModel(aFiltered);
//     oView.setModel(oFilteredModel, "JSGRN");

//     sap.m.MessageToast.show("Filtered " + aFiltered.length + " GRNs for year " + sSelectedYear);
// },


getScanYear: function () {
    var oScanModel = this.getView().getModel("JScan");
    if (!oScanModel) return null;

    var oScanData = oScanModel.getProperty("/0/Scandate");
    if (!oScanData) return null;

    // Scandate might be a Date object or string, handle both:
    var oDate = new Date(oScanData);
    if (isNaN(oDate)) return null;

    return oDate.getFullYear().toString(); // e.g. "2025"
},
loadGRNList: function () {
    var that = this;
    var sBukrs = this.sBukrs;

    if (!sBukrs) {
        sap.m.MessageToast.show("Please select Company Code first");
        return;
    }

    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
    oGlobalBusyDialog.open();

    oModel.read("/GrnlistSet", {
        filters: [new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs)],
        success: function (oData) {
            oGlobalBusyDialog.close();

            if (!oData.results || oData.results.length === 0) {
                sap.m.MessageBox.warning("No GRN numbers found for the selected company.");
                return;
            }

          
            var sScanYear = that.getScanYear();
            var aAllGRNs = oData.results;

            var oAllModel = new sap.ui.model.json.JSONModel(aAllGRNs);
            that.getView().setModel(oAllModel, "JSGRN_ALL");

            var aFiltered = sScanYear
                ? aAllGRNs.filter(function (oItem) {
                      return oItem.Mjahr === sScanYear;
                  })
                : aAllGRNs;

            
            var oFilteredModel = new sap.ui.model.json.JSONModel(aFiltered);
            oFilteredModel.setSizeLimit(3000);
            that.getView().setModel(oFilteredModel, "JSGRN");

            sap.m.MessageToast.show(
                "Loaded " +
                    aFiltered.length +
                    " GRNs for year " +
                    (sScanYear || "All")
            );
        },
        error: function () {
            oGlobalBusyDialog.close();
            sap.m.MessageBox.error("Failed to load GRN list. Please try again later.");
        }
    });
},



onGrnSelect: function (oEvent) {
    var oSelectedItem = oEvent.getParameter("selectedItem");
    var oContext = oEvent.getSource().getBindingContext("JSGoods");
    var sPath = oContext.getPath();

    if (oSelectedItem) {
        var oSelData = oSelectedItem.getBindingContext("JSGRN").getObject();
        var oTableModel = this.getView().getModel("JSGoods");
        var oRowData = oTableModel.getProperty(sPath);

        oRowData.Mblnr = oSelData.Mblnr;
        oRowData.Gjahr = oSelData.Mjahr;

        oTableModel.setProperty(sPath, oRowData);
        // sap.m.MessageToast.show("GRN selected: " + oSelData.Mblnr);
    }
},
	fn_closedpclear1: function(){
			var mdpclearing = this.getView().getModel("JDPClear_Original").getData();
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(mdpclearing);
		this.getView().setModel(oModel, 'JDPClear');
			this.dpclearingfrag.destroy();
		    this.dpclearingfrag = null;
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo('Fulfilment',{btnstat: " "});
		},
	
// loadGRNList: function () {
//     var that = this;
//     var sBukrs = this.sBukrs;

//     if (!sBukrs) {
//         sap.m.MessageToast.show("Please select Company Code first");
//         return;
//     }

//     var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
//     oGlobalBusyDialog.open();

//     oModel.read("/GrnlistSet", {
//         filters: [new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs)],

//         success: function (oData) {
//             oGlobalBusyDialog.close();

//             if (!oData.results || oData.results.length === 0) {
//                 sap.m.MessageBox.warning("No GRN numbers found for the selected company.");
//                 return;
//             }

      
//             var sScanYear = that.getScanYear();

          
//             var aFilteredData = oData.results;
//             if (sScanYear) {
//                 aFilteredData = oData.results.filter(function (oItem) {
//                     return oItem.Mjahr === sScanYear;
//                 });
//             }

           
//             var oJSONModel = new sap.ui.model.json.JSONModel();
//             oJSONModel.setSizeLimit(3000);
//             oJSONModel.setData(aFilteredData);
//             that.getView().setModel(oJSONModel, "JSGRN");

//             // Optional: Toast to indicate how many GRNs loaded
//             sap.m.MessageToast.show("Loaded " + aFilteredData.length + " GRNs for year " + sScanYear);
//         },

//         error: function () {
//             oGlobalBusyDialog.close();
//             sap.m.MessageBox.error("Failed to load GRN list. Please try again later.");
//         }
//     });
// },

onPODetailPress: function(oEvent) {
    var vDoc = oEvent.getSource().getText(); // get the PO number clicked
    if (!vDoc) {
        sap.m.MessageToast.show("No Purchase Order found.");
        return;
    }

    // dynamically get the host
    var vUrl = window.location.origin + 
        "/sap/bc/gui/sap/its/webgui?~transaction=*OLR3_ME2XN%20OLR3_R3_TS_PDOC-EBELN=" + 
        vDoc + 
        ";DYNP_OKCODE=DISP";

    // open in new tab
    window.open(vUrl, "_blank");
},
fn_Post_Invoice: function () {
    var that = this;
  
  
    var obj = {};
    obj.Flag = 'I';
    obj.IvAction = ''; // intentionally blank

    var vCheck = this.getView().byId("id_check").getSelected();
    obj.Taxind = vCheck ? 'X' : '';
    obj.Baseline = this.getView().byId("id_BaseDate").getDateValue();

    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

  
    obj.NavHead = this.getView().getModel("JSInvdethead").getData();
    obj.NavHead[0].Zterm = this.getView().byId("id_payment_term").getValue().split(' ')[0];

    var data = this.getView().getModel("JSInvdethead").getData()[0];

    
    var oAmtSplitData = this.getView().getModel("amountsplit").getData();
    obj.NavAmtsplit = oAmtSplitData.AmountSplit ? oAmtSplitData.AmountSplit : [];

    if (Array.isArray(obj.NavAmtsplit)) {
        obj.NavAmtsplit = obj.NavAmtsplit.map(item => ({
            Ntamt: Number(item.Amount) ? Number(item.Amount).toFixed(2) : "0.00",
            Mwskz: item.TaxCode || "",
            Zlsch: item.PaymentMode || "",
            Zterm: item.PaymentTerm || ""
        }));
    }

   
    if (data.Transtype <= 3) {
        obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
        obj.NavMaterialDet = this.getView().getModel("JSMatdet").getData();
        var aInvData = this.getView().getModel("JSInvdet").getData();

        // Only include if not all empty
        var bAllEmpty = aInvData.every(function (item) {
            return (!item.Saknr || item.Saknr.trim() === "") &&
                (!item.Mwskz || item.Mwskz.trim() === "");
        });
        if (!bAllEmpty) {
            obj.NavGetItemValues = aInvData;
        }
    } else if (data.Transtype === '4' || data.Transtype <= "6") {
        obj.NavGetItemValues = this.getView().getModel("JSInvdet").getData();
    }

  
    obj.NavTaxTab = this.getView().getModel("JSTaxTab").getData();

   
    obj.NavReturn = [];
	var oHead = obj.NavHead[0];
			oHead.Ntamt = oHead.Ntamt ? oHead.Ntamt.toString() : "0.00";
   

   
    oGlobalBusyDialog.open();
    oModel.create('/DEEPHEADSet', obj, {
        success: function (oData) {
            oGlobalBusyDialog.close();

            
            if (oData.NavReturn && oData.NavReturn.results.length > 0) {
                var vType = oData.NavReturn.results[0].Type;
                var vMsg = oData.NavReturn.results[0].Message;

                if (vType === 'S') {
                    that.openSuccessDialog(vMsg);
                } else if (vType === 'E') {
                    that.openErrorDialog(vMsg);
                } else {
                    that.openErrorDialog('Unexpected response from backend.');
                }
            } else if (oData.NavHead && oData.NavHead.results && oData.NavHead.results.length > 0) {
                var vDocNo = parseInt(oData.NavHead.results[0].Documentnumber);
                var vMsg = "The Document " + vDocNo + " Successfully Posted";
                that.openSuccessDialog(vMsg);
            } else {
                that.openErrorDialog('No valid response received from backend.');
            }
        },
        error: function () {
            oGlobalBusyDialog.close();
            that.openErrorDialog('Error while posting the Invoice.');
        }
    });
},
		fn_withholding: function() {
			oGlobalBusyDialog.open();
				var that = this;
				var obj = {};
				obj.NavGetItemValues = [];
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				obj.IvAction = 'TDS';
				obj.NavHead = that.getView().getModel("JSInvdethead").getData();
				obj.NavTaxTab = [];
				obj.NavReturn = [];
				obj.NavWithHoldTax = [];

				var data = that.getView().getModel("JSInvdethead").getData()[0];
				if (data.Transtype <= 3 || data.Transtype == 8) {
					obj.NavItemTabDetails = that.getView().getModel("JSPORefDet").getData();
					obj.NavMaterialDet = that.getView().getModel("JSMatdet").getData();
					obj.NavGetItemValues = that.getView().getModel("JSInvdet").getData();

				} else if (data.Transtype === '4' | data.Transtype <= "6") {
					obj.NavGetItemValues = that.getView().getModel("JSInvdet").getData();

				}

				var oHead = that.getView().getModel("JSInvdethead").getData()[0];
				oHead.Ntamt = oHead.Ntamt ? oHead.Ntamt.toString() : "0.00";
				for (var i = 0; i < obj.NavGetItemValues.length; i++) {
					if (obj.NavGetItemValues[i].Netpr === '') {
						obj.NavGetItemValues[i].Netpr = '0.00'
					}
				}
				obj.NavHead[0].Ntamt = oHead.Ntamt;
				oModel.create('/DEEPHEADSet', obj, {

					success: function(oData) {
						if (oData.NavReturn.results.length !== 0) {
							var errmsg = oData.NavReturn.results[0].Message;
							that.openErrorDialog(errmsg);
						} else {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData.NavWithHoldTax.results);
							that.getView().setModel(oModel, 'JSWithHold');
						}
						oGlobalBusyDialog.close();
					},
					error: function(oResponse) {
						// sap.m.MessageBox.error("Error");
						that.openErrorDialog(' Error');

						oGlobalBusyDialog.close();
					}

				});
		},
			fnFormatOCRTooltip: function (sAmount) {
    if (!sAmount) {
        return "OCR Text : ";
    }
    return "OCR Text : " + sAmount;
},
fnFormatOCRDateTooltip: function (oDate) {
    if (!oDate) {
        return "OCR Text : ";
    }

    var oFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "dd/MM/yyyy"});
    var sDate = oFormat.format(oDate);

    return "OCR Text : " + sDate;
},
fnFormatOCRInvNoTooltip: function (sInvno) {
    if (!sInvno) {
        return "OCR Text : ";
    }
    return "OCR Text : " + sInvno;
},
onGRNDetailPress: function(oEvent) {
    var vDoc = oEvent.getSource().getText(); // get the GRN number clicked
    if (!vDoc) {
        sap.m.MessageToast.show("No GRN Number found.");
        return;
    }
    // dynamically get the host
    var vUrl = "http://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=*MIGO_GO+" + "GODYNPRO-MAT_DOC=" + vDoc +
					"+GODYNPRO-TRANSACTION=D;DYNP_OKCODE=OK_GO";
 
    // open in new tab
    window.open(vUrl, "_blank");
},




// onWHTCodeLiveChange: function (oEvent) {

//     var oModel = this.getView().getModel("JSWithHold");
//     var oBackup = this.getView().getModel("JSBackup");

//     // If backup is NOT taken → take backup NOW
//     if (!this.bWHTBackupDone) {
//         var aData = oModel.getData();
//         var aDeepCopy = JSON.parse(JSON.stringify(aData));

//         var oBackupModel = new sap.ui.model.json.JSONModel(aDeepCopy);
//         this.getView().setModel(oBackupModel, "JSBackup");

//         this.bWHTBackupDone = true;   // avoid repeating backup
//         console.log("Backup taken during first change:", aDeepCopy);
//     }

//     // Now continue your existing logic
//     var sValue = oEvent.getParameter("value");
//     var oCtx = oEvent.getSource().getBindingContext("JSWithHold");
//     var sPath = oCtx.getPath();
//     var iIndex = parseInt(sPath.split("/")[1]);

//     var oBackup = this.getView().getModel("JSBackup");
//     var sOriginal = oBackup.getProperty("/" + iIndex + "/Witht");
//     console.log("Original:", sOriginal);

//     // clear if user deletes
//     if (!sValue) {
//         oModel.setProperty(sPath + "/WtWithcd", "");
//         oModel.setProperty(sPath + "/WtQsshb", "");
//         oModel.setProperty(sPath + "/WtQbshb", "");
//         oModel.setProperty(sPath + "/Witht", "");
//         oModel.setProperty(sPath + "/WtWtexmn", "");
//           //oModel.setProperty(sPath + "/WtType", "");
//           oModel.setProperty(sPath + "/Poadvamt", "");
 
//         return;
//     }
  



//     // restore when re-entering original code
//     if (sValue.toUpperCase() === sOriginal.toUpperCase()) {  // supports lowercase typing
//         oModel.setProperty(sPath + "/WtWithcd", sOriginal);
//         oModel.setProperty(sPath + "/WtQsshb", oBackup.getProperty("/" + iIndex + "/WtQsshb"));
//         oModel.setProperty(sPath + "/WtQbshb", oBackup.getProperty("/" + iIndex + "/WtQbshb"));
//         oModel.setProperty(sPath + "/Witht",   oBackup.getProperty("/" + iIndex + "/Witht"));
//         oModel.setProperty(sPath + "/WtWtexmn", oBackup.getProperty("/" + iIndex + "/WtWtexmn"));
//           oModel.setProperty(sPath + "/WtType", oBackup.getProperty("/" + iIndex + "/WtType"));
//               oModel.setProperty(sPath + "/Poadvamt", oBackup.getProperty("/" + iIndex + "/Poadvamt"));
//     }
// },
// only taxcode dropdown
// onWHTCodeLiveChange: function (oEvent) {
//     var oModel = this.getView().getModel("JSWithHold");
//     var oBackup = this.getView().getModel("JSBackup");

//     // Take backup on first change
//     if (!this.bWHTBackupDone) {
//         var aData = oModel.getData();
//         var aDeepCopy = JSON.parse(JSON.stringify(aData));
//         var oBackupModel = new sap.ui.model.json.JSONModel(aDeepCopy);
//         this.getView().setModel(oBackupModel, "JSBackup");
//         this.bWHTBackupDone = true;
//         console.log("Backup taken during first change:", aDeepCopy);
//     }

//     var sValue = oEvent.getParameter("value");
//     var oComboBox = oEvent.getSource();
//     var oCtx = oComboBox.getBindingContext("JSWithHold");
//     var sPath = oCtx.getPath();
//     var iIndex = parseInt(sPath.split("/")[1]);

//     // Get original code from backup
//     var sOriginalCode = oBackup.getProperty("/" + iIndex + "/Witht");

//     // Always clear and re-add ONLY the original item
//     oComboBox.destroyItems();

//     if (sOriginalCode) {
//         oComboBox.addItem(new sap.ui.core.Item({
//             key: sOriginalCode,
//             text: sOriginalCode
//         }));
//     }

//     // === REMOVED THIS BLOCK === 
//     // (No longer adds the currently typed new value to dropdown)

//     // Clear logic when field is empty
//     if (!sValue) {
//         oModel.setProperty(sPath + "/WtWithcd", "");
//         oModel.setProperty(sPath + "/WtQsshb", "");
//         oModel.setProperty(sPath + "/WtQbshb", "");
//         oModel.setProperty(sPath + "/Witht", "");
//         oModel.setProperty(sPath + "/WtWtexmn", "");
//         // oModel.setProperty(sPath + "/WtType", "");  // commented in your original
//         oModel.setProperty(sPath + "/Poadvamt", "");
//         return;
//     }

//     // Restore full original data if user types back the exact original code
//     if (sValue.toUpperCase() === sOriginalCode.toUpperCase()) {
//         oModel.setProperty(sPath + "/WtWithcd", sOriginalCode);
//         oModel.setProperty(sPath + "/WtQsshb", oBackup.getProperty("/" + iIndex + "/WtQsshb"));
//         oModel.setProperty(sPath + "/WtQbshb", oBackup.getProperty("/" + iIndex + "/WtQbshb"));
//         oModel.setProperty(sPath + "/Witht", oBackup.getProperty("/" + iIndex + "/Witht"));
//         oModel.setProperty(sPath + "/WtWtexmn", oBackup.getProperty("/" + iIndex + "/WtWtexmn"));
//         oModel.setProperty(sPath + "/WtType", oBackup.getProperty("/" + iIndex + "/WtType"));
//         oModel.setProperty(sPath + "/Poadvamt", oBackup.getProperty("/" + iIndex + "/Poadvamt"));
//     }
//     // If user types something else (not matching original), nothing happens to data
//     // (you can add validation/warning later if needed)
// },
onWHTSelectionChange: function(oEvent) {
    var oComboBox = oEvent.getSource();
    var oSelectedItem = oEvent.getParameter("selectedItem");

    if (!oSelectedItem) {
        return; // nothing selected (e.g., cleared via clear icon)
    }

    var sSelectedKey = oSelectedItem.getKey(); // this is the original tax code

    var oModel = this.getView().getModel("JSWithHold");
    var oBackup = this.getView().getModel("JSBackup");

    // If backup not taken yet (very rare case), take it now
    if (!this.bWHTBackupDone) {
        var aData = oModel.getData();
        var aDeepCopy = JSON.parse(JSON.stringify(aData));
        var oBackupModel = new sap.ui.model.json.JSONModel(aDeepCopy);
        this.getView().setModel(oBackupModel, "JSBackup");
        this.bWHTBackupDone = true;
    }

    // Get row index
    var oCtx = oComboBox.getBindingContext("JSWithHold");
    var sPath = oCtx.getPath();
    var iIndex = parseInt(sPath.split("/")[1]);

    // Get original code from backup to compare
    var sOriginalCode = oBackup.getProperty("/" + iIndex + "/Witht"); // assuming Witht = original WtWithcd

    // Only restore if the selected key matches the original (which it always should in our case)
    // But we check anyway for safety
    if (sSelectedKey && sSelectedKey.toUpperCase() === sOriginalCode.toUpperCase()) {
        // Restore all related fields from backup
        oModel.setProperty(sPath + "/WtWithcd", sOriginalCode);
        oModel.setProperty(sPath + "/WtQsshb", oBackup.getProperty("/" + iIndex + "/WtQsshb"));
        oModel.setProperty(sPath + "/WtQbshb", oBackup.getProperty("/" + iIndex + "/WtQbshb"));
        oModel.setProperty(sPath + "/Witht", oBackup.getProperty("/" + iIndex + "/Witht"));
        oModel.setProperty(sPath + "/WtWtexmn", oBackup.getProperty("/" + iIndex + "/WtWtexmn"));
        oModel.setProperty(sPath + "/WtType", oBackup.getProperty("/" + iIndex + "/WtType"));
        oModel.setProperty(sPath + "/Poadvamt", oBackup.getProperty("/" + iIndex + "/Poadvamt"));
    }
},

onWHTCodeLiveChange: function (oEvent) {
    var oModel = this.getView().getModel("JSWithHold");
    var oBackup = this.getView().getModel("JSBackup");

    // Take backup on first change
    if (!this.bWHTBackupDone) {
        var aData = oModel.getData();
        var aDeepCopy = JSON.parse(JSON.stringify(aData));
        var oBackupModel = new sap.ui.model.json.JSONModel(aDeepCopy);
        this.getView().setModel(oBackupModel, "JSBackup");
        this.bWHTBackupDone = true;
        console.log("Backup taken during first change:", aDeepCopy);
    }

    var sValue = oEvent.getParameter("value");
    var oComboBox = oEvent.getSource();
    var oCtx = oComboBox.getBindingContext("JSWithHold");
    var sPath = oCtx.getPath();
    var iIndex = parseInt(sPath.split("/")[1]);

    // Get original values from backup
    var sOriginalCode = oBackup.getProperty("/" + iIndex + "/Witht");        // assuming Witht = original WtWithcd
    var sOriginalType = oBackup.getProperty("/" + iIndex + "/WtType");       // tax type description

    // Build display text: "Code - Description"
    var sDisplayText = "";
    if (sOriginalCode && sOriginalType) {
        sDisplayText = sOriginalCode + " - " + sOriginalType;
    } else if (sOriginalCode) {
        sDisplayText = sOriginalCode;
    }

    // Always clear and add ONLY the original item with combined text
    oComboBox.destroyItems();

    if (sDisplayText) {
        oComboBox.addItem(new sap.ui.core.Item({
            key: sOriginalCode || "",     // key = only the code
            text: sDisplayText            // text = "A1 - Advance Payment"
        }));
    }

    // Clear all fields if input is empty
    if (!sValue) {
        oModel.setProperty(sPath + "/WtWithcd", "");
        oModel.setProperty(sPath + "/WtQsshb", "");
        oModel.setProperty(sPath + "/WtQbshb", "");
        oModel.setProperty(sPath + "/Witht", "");
        oModel.setProperty(sPath + "/WtWtexmn", "");
        oModel.setProperty(sPath + "/Poadvamt", "");
        return;
    }

    // If user types back the original code (case-insensitive), restore everything
    if (sValue.toUpperCase() === sOriginalCode.toUpperCase()) {
        oModel.setProperty(sPath + "/WtWithcd", sOriginalCode);
        oModel.setProperty(sPath + "/WtQsshb", oBackup.getProperty("/" + iIndex + "/WtQsshb"));
        oModel.setProperty(sPath + "/WtQbshb", oBackup.getProperty("/" + iIndex + "/WtQbshb"));
        oModel.setProperty(sPath + "/Witht", oBackup.getProperty("/" + iIndex + "/Witht"));
        oModel.setProperty(sPath + "/WtWtexmn", oBackup.getProperty("/" + iIndex + "/WtWtexmn"));
        oModel.setProperty(sPath + "/WtType", oBackup.getProperty("/" + iIndex + "/WtType"));
        oModel.setProperty(sPath + "/Poadvamt", oBackup.getProperty("/" + iIndex + "/Poadvamt"));
    }
    // If typing something else → do nothing (no restore, no extra items)
},
On_vendorpdc: function() {
				    var vKey = this.getView().byId("id_goodstype").getSelectedKey();

    // Guard condition
    if (vKey !== "2" && vKey !== "3") {
     
        	sap.m.MessageToast.show("Vendor selection is not possible");
         return;
    }
				oGlobalBusyDialog.open();
	
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var obj = {};
			obj.Flag = 'V';
		obj.NavVenpdc = [];
			obj.NavItemTabDetails = this.getView().getModel("JSPORefDet").getData();
			oModel.create('/DEEPHEADSet', obj, {
			
				// 	success: function(oData, Response) {
				//   oGlobalBusyDialog.close();

    // // Safety check
    // if (!oData.NavVenpdc || !oData.NavVenpdc.results) {
    //     sap.m.MessageToast.show("No vendor data returned");
    //     return;
    // }

    // var aVendorPdc = oData.NavVenpdc.results;

    // // Example: log
    // console.log("Vendor PDC:", aVendorPdc);

    // // Example: set to JSON model
    // var oVendorModel = new sap.ui.model.json.JSONModel(aVendorPdc);
    // that.getView().setModel(oVendorModel, "VendorPDC");
				// 	}
				  success: function (oData) {

            oGlobalBusyDialog.close();

            if (!oData.NavVenpdc || !oData.NavVenpdc.results) {
                sap.m.MessageToast.show("No vendor data returned");
                return;
            }

            var aVendorPdc = oData.NavVenpdc.results;

            // Set model
            var oVendorModel = new sap.ui.model.json.JSONModel(aVendorPdc);
            that.getView().setModel(oVendorModel, "JSVendorPdc");

            // 🔥 OPEN FRAGMENT HERE
            // if (!that._oVendorPdcFrag) {
            //     that._oVendorPdcFrag = sap.ui.xmlfragment(
            //         "FSC360NEW.fragment.Vendorpdc",
            //         that
            //     );
            //     that.getView().addDependent(that._oVendorPdcFrag);
            // }
            if (!that._oVendorPdcFrag) {
    that._oVendorPdcFrag = sap.ui.xmlfragment(
        that.getView().getId() + "VendorPdcFrag", // ✅ fragment ID
        "FSC360NEW.fragment.Vendorpdc",
        that
    );
    that.getView().addDependent(that._oVendorPdcFrag);
}


            that._oVendorPdcFrag.open();
        },

        error: function () {
            oGlobalBusyDialog.close();
        }
			});
		},
onCloseVendorPdc: function () {
    this._oVendorPdcFrag.close();
    // this._oVendorPdcFrag.close();
             this._oVendorPdcFrag.destroy();
				 this._oVendorPdcFrag = null;
},
fn_submitvendorpdc: function () {
    	this.fnGetVendordetpdc();
},
	// fnGetVendordetpdc: function() {
	// 		oGlobalBusyDialog.open();

	// 		if (this.getView().getModel("JSVendorPdc").getData() !== null) {
	// 			var vLifnr = this.getView().getModel("JSVendorPdc").getData()[0].Lifnr;
	// 		}

	// 		if (vLifnr) {
	// 			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
	// 			var that = this;

	// 			oModel.read("/VendorDetSet('" + vLifnr + "')", {

	// 				success: function(oData, oResponse) {

	// 					var oModel = new sap.ui.model.json.JSONModel();
	// 					oModel.setData(oData);
	// 					that.getView().setModel(oModel, 'JSVendorDet');
						
	// 					oGlobalBusyDialog.close();
	// 					that._oVendorPdcFrag.close();
	// 				},
	// 				error: function(oRes) {

	// 					// sap.m.MessageBox.error('Http Error');
	// 					that.openErrorDialog('Http Error');
	// 					oGlobalBusyDialog.close();
	// 				}
	// 			});
	// 		} else {
	// 			var temp = [];
	// 			var oModel = new sap.ui.model.json.JSONModel();
	// 			oModel.setData(temp);
	// 			this.getView().setModel(oModel, 'JSVendorDet');
	// 		}

	// 	},
fnGetVendordetpdc: function () {
 var oTable = sap.ui.core.Fragment.byId(
    this.getView().getId() + "VendorPdcFrag",
    "id_vendorpdc_table"
);


    if (!oTable) {
        sap.m.MessageToast.show("Vendor table not found");
        return;
    }

    var aSelectedIndices = oTable.getSelectedIndices();

    if (!aSelectedIndices.length) {
        sap.m.MessageToast.show("Please select a vendor");
        return;
    }

    var iIndex = aSelectedIndices[0];
    var oContext = oTable.getContextByIndex(iIndex);
    var oRowData = oContext.getObject();

    var vLifnr = oRowData.Lifnr;
    var vVendorName = oRowData.Name1;

    // ✅ Set selected vendor name
    this.byId("id_vendor").setText(vVendorName);
// Set vendor name on screen
// this.byId("id_vendor").setText(vVendorName);

// 🔥 FILTER LINE ITEMS
var aAllItems = this.getView().getModel("JSPORefDet").getData();

var aFilteredItems = aAllItems.filter(function (oItem) {
    return oItem.Vendor === vLifnr;
});

// Update model
this.getView().setModel(
    new sap.ui.model.json.JSONModel(aFilteredItems),
    "JSPORefDet"
);
    oGlobalBusyDialog.open();
    var that = this;

    var oModel = new sap.ui.model.odata.v2.ODataModel(
        "/sap/opu/odata/EXL/FSCNXT360_SRV/"
    );

    oModel.read("/VendorDetSet('" + vLifnr + "')", {
        success: function (oData) {
            var oJsonModel = new sap.ui.model.json.JSONModel(oData);
            that.getView().setModel(oJsonModel, "JSVendorDet");

            oGlobalBusyDialog.close();
            that._oVendorPdcFrag.close();
             that._oVendorPdcFrag.destroy();
				 that._oVendorPdcFrag = null;
        },
        error: function () {
            that.openErrorDialog("HTTP Error");
            oGlobalBusyDialog.close();
        }
    });
}



	});

});