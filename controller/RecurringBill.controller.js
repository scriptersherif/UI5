sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"FSC360NEW/model/formatter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	       "sap/ui/core/BusyIndicator"
], function(Controller, formatter, FilterOperator, Filter) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var oTabRowCount, oBillID;
	var vBill;

	// Declaring variables globally
	//=====================================================================================

	return Controller.extend("FSC360NEW.controller.RecurringBill", {
		oPlant: null,
		oFacility: null,
		oVendor: null,
		oCustID: null,
		oBillType: null,
		oBillCycle: null,
		oAccID: null,
		oServiceTax: null,
		oVat: null,
		oBillDate: null,
		oDueDate: null,
		oPayType: null,
		oPersonResp: null,
		oEmailID: null,
		oMobile: null,
		oCmpny: null,
		oCmpnyDisp: null,
		oBprocs: null,

		onInit: function() {
			this.fn_LoadData();
			this.fn_getVendor();
			this.fn_getPayment();
			this.fn_loadBillTypes();
			this.fn_loadBillCycles();
			this.fn_loadBill();
			this.fnReadMasterList();
			// this.Fn_PrePostSelect();
			var oRadioBtnGroup = this.getView().byId("id_prepost");
			var iIndex = oRadioBtnGroup.getSelectedIndex();
			this.oPayTyperadiobtn = (iIndex === 1) ? 1 : 0;
			this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;
			setTimeout(() => {
				this.fn_applyFlexGrow();
			}, 100);

		},
		fnReadMasterList: function(oEvent) {
			var oView = this.getView();
			var oReglist = this.byId("idRegList");
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/BillRegistrationSet", {
				success: function(oData, oResponse) {
					var json = {
						"Bills": oData.results
					};
					var oFullModel = new sap.ui.model.json.JSONModel(json);
					oView.setModel(oFullModel, "FullBills");
					var jsonmodel = new sap.ui.model.json.JSONModel(json);
					oView.setModel(jsonmodel, "JSON");
					if (oReglist) {
						oReglist.setModel(jsonmodel, "JSON");
						setTimeout(function() {
							var aItems = oReglist.getItems();
							if (aItems.length > 0) {
								oReglist.setSelectedItem(aItems[0], true);
								that.fn_ListItemPress({
									getSource: function() {
										return aItems[0];
									}
								});
							}
						}, 0);
					}
				},
				error: function() {
					sap.m.MessageToast.show("Failed to load the data");
				}
			});
		},

		fn_LoadData: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/DEEPHEADSet", {
				urlParameters: {
					$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt,NavCost,NavHsnSrch"
				},
				success: function(oData) {
					if (oData && oData.results && oData.results.length > 0) {
						var oJSusernameModel = new sap.ui.model.json.JSONModel();
						oJSusernameModel.setData(oData.results[0]);
						that.getView().setModel(oJSusernameModel, "JSusername");
						var oHSNModel = new sap.ui.model.json.JSONModel(oData.results[0].NavHsnSrch.results);
						that.getView().setModel(oHSNModel, "JSHSN");
						that.byId("id_hsn").bindItems({
						path: "JSHSN>/",
						length: oData.results[0].NavHsnSrch.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSHSN>Steuc}",
							text: "{JSHSN>Steuc}",
							additionalText: "{JSHSN>Text1}"
						})
					});
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results[0].NavCost.results);
						that.getView().setModel(oModel, 'JSCostCenter');
						that.byId("id_costcnt").bindItems({
						path: "JSCostCenter>/",
						length: oData.results[0].NavCost.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSCostCenter>Kostl}",
							text: "{JSCostCenter>Kostl}",
							additionalText: "{JSCostCenter>Ktext}"
						})
					});
						

						// that.fn_updatePaginatedModel();
					}
				},
				error: function(oError) {

				}
			});
		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		fn_loadCompanyCodes: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/StatusFlowSet", {
				filters: [
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "BUKRS")
				],
				success: function(oData) {
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSCCode");

					// Bind Company ComboBox items
					that.byId("id_companycode").bindItems({
						path: "JSCCode>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSCCode>Bukrs}",
							text: "{JSCCode>Bukrs}",
								 additionalText: "{JSCCode>Butxt}" // if you have company name text
						})
					});
				},
				error: function() {
					sap.m.MessageBox.error("Error loading company codes");
				}
			});
		},
		fn_getPlant: function() {
			// var Bukrslen = this.getView().byId("idCCode").getSelectedItems().length;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			// var vtokens = this.getView().byId("idCCode").getSelectedItems();
			var aFilters = [new Filter("Type", FilterOperator.EQ, "Plant")];

			oModel.read("/StatusFlowSet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSPlant");
				that.byId("idplant").bindItems({
  path: "JSPlant>/",
  		length: oData.results.length,
  template:  new sap.ui.core.ListItem({
    key: "{JSPlant>Werks}",
    text: "{JSPlant>Werks}",
    additionalText: "{JSPlant>Name1}"
  })
});


				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');
					oGlobalBusyDialog.close();

				}

			});

		},
		fn_PlantChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey();
				this.byId("idplant").setValue(sKey);
			}
		},

		fn_onRadioSelect: function(oEvent) {
			var iIndex = oEvent.getParameter("selectedIndex");

			var oBillReport = this.byId("id_billreport");
			var oBillRegister = this.byId("id_billregister");

			if (iIndex === 0) { // Bill Register selected
				oBillReport.setVisible(true);
				oBillRegister.setVisible(false);
				this.fnclear_recbill();
			} else if (iIndex === 1) { // Bill Report selected
				this.fn_loadCompanyCodes();
				this.fn_getPlant();
				this.fn_recbilltyp();
				this.fnSearch_recbill();
				oBillReport.setVisible(false);
				oBillRegister.setVisible(true);
				setTimeout(() => {
					this.fn_applyFlexGrow();
				}, 100);

			}
		},

		fn_getVendor: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/KredaSet", {
				success: function(oData) {
					// Create JSON Model
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSVendor");

					// Bind ComboBox items
					that.byId("idVendor").bindItems({
						path: "JSVendor>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSVendor>Lifnr}",
							text: "{JSVendor>Lifnr}",
							additionalText: "{JSVendor>Mcod1}"
						})
					});
					that.byId("id_vendorbill").bindItems({
						path: "JSVendor>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSVendor>Lifnr}",
							text: "{JSVendor>Lifnr}",
							additionalText: "{JSVendor>Mcod1}"
						})
					});
				},
				error: function() {
					sap.m.MessageBox.error("HTTP Error while fetching Vendor list");
				}
			});
		},
		fn_onVendorSelect: function(oEvent) {
			var oCombo = oEvent.getSource();
			var sSelectedKey = oCombo.getSelectedKey();

			var bExists = oCombo.getItems().some(function(item) {
				return item.getKey() === sSelectedKey;
			});

			if (!bExists && sSelectedKey) {
				oCombo.addItem(new sap.ui.core.ListItem({
					key: sSelectedKey,
					text: sSelectedKey
				}));
			}

			oCombo.setSelectedKey(sSelectedKey);
		},

		fn_getPayment: function() {
			var jsonPayType = {
				PayType: [{
					"PayType": "",
					"Key": ""
				}, {
					"PayType": "COD",
					"Key": "COD"
				}, {
					"PayType": "Check",
					"Key": "Check"
				}, {
					"PayType": "DD",
					"Key": "DD"
				}, {
					"PayType": "Credit Card",
					"Key": "Credit Card"
				}, {
					"PayType": "Debit Card",
					"Key": "Debit Card"
				}, {
					"PayType": "Net Banking",
					"Key": "Net Banking"
				}]
			};

			var oPayTypeModel = new sap.ui.model.json.JSONModel(jsonPayType);

			this.getView().setModel(oPayTypeModel, "JSPayType");
			this.byId("idpaymttyp").bindItems({
				path: "JSPayType>/PayType",
				template: new sap.ui.core.ListItem({
					key: "{JSPayType>Key}",
					text: "{JSPayType>PayType}"
				})
			});
		},
		fn_loadBillTypes: function() {
			var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oODataModel.read("/BillTypeSet", {
				success: function(oData) {

					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSONModel, "JSBillType");
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Bill Types");

				}
			});
		},
		fn_loadBillCycles: function() {
			var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oODataModel.read("/BillCycleSet", {
				success: function(oData) {

					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSONModel, "JSBillCycle");
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Bill Cycles");

				}
			});
		},
		fn_loadBill: function() {
			var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oODataModel.read("/BillTypeSet", {
				success: function(oData) {
					// Add "All" entry
					oData.results.push({
						Billtyp: "All",
						BName: "All"
					});

					// Create JSON model for BillType
					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSONModel, "JSloadBill");
					var oComboBox = that.byId("id_loadbill");
					if (oComboBox) {
						oComboBox.setSelectedKey("All");
					}
				},
				error: function() {
					sap.m.MessageToast.show("Failed to load Bill Types");
				}

			});
		},
		fn_ListItemPress: function(oEvent) {
			// oGlobalBusyDialog.open();
			var oClickedItem = oEvent.getSource();
			var oList = this.byId("idRegList");
			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});
			oClickedItem.addStyleClass("selectedListItem");

			// Get the context of the selected bill
			var oContext = oClickedItem.getBindingContext("JSON");
			if (!oContext) return;

			var oBillData = oContext.getObject(); // full bill object
			vBill = oContext.getProperty("Billid");
			//this.byId("idVendor").setSelectedKey(oBillData.Vendor);
			var oCombo = this.byId("idVendor");
			var sVendor = oBillData.Vendor;

			// Check if it exists
			var aItems = oCombo.getItems();
			var bExists = aItems.some(function(item) {
				return item.getKey() === sVendor;
			});

			if (!bExists) {
				oCombo.addItem(new sap.ui.core.ListItem({
					key: sVendor,
					text: sVendor
				}));
			}

			oCombo.setSelectedKey(sVendor);

			this.byId("id_billingtype").setSelectedKey(oBillData.Billtyp);
			this.byId("id_podate").setDateValue(oBillData.Bldat);
			this.byId("id_duedate").setDateValue(oBillData.Duedat);
			this.byId("id_billingcycle").setSelectedKey(oBillData.Blcycl);
			this.byId("idpaymttyp").setSelectedKey(oBillData.Payment);
			this.byId("id_taxrate").setValue(oBillData.Payment);
			this.byId("id_primaryacct").setValue(oBillData.Accid);
			this.byId("id_email").setValue(oBillData.Email);
			this.byId("id_plant").setValue(oBillData.Plant);
			this.byId("id_faclty").setValue(oBillData.Faclty);
			this.byId("id_perresp").setValue(oBillData.Perses);
			this.byId("id_mobile").setValue(oBillData.Mobile);
			var aFields = [
				"idVendor",
				"id_billingtype",
				"id_podate",
				"id_duedate",
				"id_billingcycle",
				"idpaymttyp",
				"id_taxrate",
				"id_primaryacct",
				"id_email",
				"id_plant",
				"id_faclty",
				"id_perresp",
				"id_mobile",
				"id_glacnt",
				"id_costcnt",
				"id_enddate",
				"id_hsn",
				"id_startdate"

			];
			aFields.forEach(function(sId) {
				var oCtrl = this.byId(sId);
				if (oCtrl) {
					if (oCtrl.setEditable) {
						oCtrl.setEditable(false);
					} else if (oCtrl.setEnabled) {
						oCtrl.setEnabled(false);
					}
				}
			}.bind(this));
			this.byId("id_cancel_btn").setVisible(false);
			this.byId("id_save_btn").setVisible(false);
			this.byId("id_act_btn").setVisible(true);

		},
		fn_BillTypeChange: function(oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey();
			var oView = this.getView();
			var oReglist = this.byId("idRegList");

			var oModel = oView.getModel("JSON");
			if (!oModel) return;

			var aAllBills = oModel.getProperty("/Bills");
			var aFiltered = (sKey === "All") ? aAllBills : aAllBills.filter(function(bill) {
				return bill.Billtyp === sKey;
			});

			// set filtered list to a temp model
			var oFilteredModel = new sap.ui.model.json.JSONModel({
				Bills: aFiltered
			});
			oReglist.setModel(oFilteredModel, "JSON");

			// auto-select first item if exists
			setTimeout(function() {
				var aItems = oReglist.getItems();
				if (aItems.length > 0) {
					oReglist.setSelectedItem(aItems[0], true);
					this.fn_ListItemPress({
						getSource: function() {
							return aItems[0];
						}
					});
				}
			}.bind(this), 0);
		},
		fn_Searchfilter: function(oEvent) {
			var sQuery = oEvent.getParameter("value").trim(); // get the search string
			var oList = this.byId("idRegList");
			var oFullModel = this.getView().getModel("FullBills"); // full data
			if (!oFullModel) return;

			var aAllBills = oFullModel.getProperty("/Bills");

			var aFiltered;
			if (!sQuery) {
				// If input is empty, show all bills
				aFiltered = aAllBills;
			} else {
				// Filter the bills based on Billid, Vendorname, or Duedat
				var query = sQuery.toLowerCase();
				aFiltered = aAllBills.filter(function(bill) {
					var billNo = bill.Billid ? bill.Billid.toString().toLowerCase() : "";
					var vendor = bill.Vendorname ? bill.Vendorname.toLowerCase() : "";
					var dueDate = bill.Duedat ? new Date(bill.Duedat).toLocaleDateString() : "";

					return billNo.includes(query) || vendor.includes(query) || dueDate.includes(query);
				});
			}

			// Set filtered model to list
			var oFilteredModel = new sap.ui.model.json.JSONModel({
				Bills: aFiltered
			});
			oList.setModel(oFilteredModel, "JSON");

			// Auto-select first item if exists
			setTimeout(function() {
				var aItems = oList.getItems();
				if (aItems.length > 0) {
					oList.setSelectedItem(aItems[0], true);
					this.fn_ListItemPress({
						getSource: function() {
							return aItems[0];
						}
					});
				}
			}.bind(this), 0);
		},
		fn_addbill: function() {
			var aFields = [
				"idVendor",
				"id_billingtype",
				"id_podate",
				"id_duedate",
				"id_billingcycle",
				"idpaymttyp",
				"id_taxrate",
				"id_primaryacct",
				"id_email",
				"id_plant",
				"id_faclty",
				"id_perresp",
				"id_mobile",
				"id_glacnt",
				"id_costcnt",
				"id_enddate",
				"id_hsn",
				"id_startdate"
			];
			var oList = this.byId("idRegList");
			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});
			aFields.forEach(function(sId) {
				var oField = this.byId(sId);
				if (!oField) return;

				// Make editable/enabled if the method exists
				if (typeof oField.setEditable === "function") {
					oField.setEditable(true);
					oField.setValue && oField.setValue(""); // clear Input
				}
				if (typeof oField.setEnabled === "function") {
					oField.setEnabled(true);
					oField.setSelectedKey && oField.setSelectedKey(""); // clear ComboBox/Select
					oField.setDateValue && oField.setDateValue(null); // clear DatePicker
				}
			}, this);
			this.byId("id_cancel_btn").setVisible(true);
			this.byId("id_save_btn").setVisible(true);
			this.byId("id_act_btn").setVisible(false);
		},
		Fn_PrePostSelect: function(oEvent) {

			var iIndex = oEvent.getSource().getSelectedIndex();

			var vPayType = 0;
			if (iIndex === 1) {
				vPayType = 1;
			}

			this.oPayTyperadiobtn = vPayType;

		},
		fnSaveBtnPress: function() {
			var oView = this.getView();
			var oController = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var oConf, oStatus;
			this.oPlant = oView.byId("id_plant").getValue();
			this.oFacility = oView.byId("id_faclty").getValue();
			this.oVendor = oView.byId("idVendor").getValue();
			//    oCustID   = oView.byId("id_custID").getValue();
			this.oBillType = oView.byId("id_billingtype").getSelectedKey();
			this.oBillCycle = oView.byId("id_billingcycle").getSelectedKey();
			this.oAccID = oView.byId("id_primaryacct").getValue();
			this.oServiceTax = oView.byId("id_taxrate").getValue();
			//    oVat    = oView.byId("id_Vat").getValue();
			var sDate = oView.byId("id_podate").getValue(); // string "yyyy-MM-dd"
			var oDate = new Date(sDate);
			this.oBillDate = oDate;
			// this.oBillDate   = oView.byId("id_podate").getDateValue();
			this.oDueDate = oView.byId("id_duedate").getDateValue();
			this.oPayType = oView.byId("idpaymttyp").getSelectedKey();
			this.oPersonResp = oView.byId("id_perresp").getValue();
			this.oEmailID = oView.byId("id_email").getValue();
			this.oMobile = oView.byId("id_mobile").getValue();
			//    oCmpny    = oView.byId("id_cmpny").getValue();
			// this.oBprocs = oView.byId("id_radBtnGrp").getSelectedIndex();
			this.oBprocs = this.oPayTyperadiobtn;
			//------------------Added By Anupam----------------------------------------
			if (this.oActivity == "1") {
				oConf = "2";
				oStatus = "";
			} else if (this.oActivity == "10") {
				oConf = "1";
				oStatus = "X";
			}
			//-------------------------------------------------------------------------

			if (this.oBprocs == 0) {
				this.oBprocs = 1;
			} else {
				this.oBprocs = 2;
			}
			var sBprocs = this.oBprocs.toString();
			//-----------------------------------------------------------------------------
			// function to get the count
			var fnCountSuccess = function(oData, oResponse) {
				oController.oTabRowCount = Number(oResponse.body);
				oController.oBillID = (oController.oTabRowCount + 1).toString(); //id_cmpny oCustID == "" ||
				//===============================================================================================
				// Validation to check the fields are empty  
				//===============================================================================================
				if (oController.oPlant == "" || oController.oFacility == "" || oController.oVendor == "" || oController.oBillType == "" ||
					oController.oAccID == "" || oController.oBillDate == null || oController.oDueDate == null || oController.oPayType == "" ||
					oController.oPersonResp == "") {

					/*if(oCmpny == ""){
					  oView.byId("id_cmpny").setValueState("Error");
					  oView.byId("id_cmpny").setValueStateText("Please choose a company");
					} else {
					  oView.byId("id_cmpny").setValueState("None");
					}*/

					if (oController.oPlant == "") {
						oView.byId("id_plant").setValueState("Error");
						oView.byId("id_plant").setValueStateText("Please choose a plant");
					} else {
						oView.byId("id_plant").setValueState("None");
					}

					if (oController.oFacility == "") {
						oView.byId("id_faclty").setValueState("Error");
						oView.byId("id_faclty").setValueStateText("Please enter the facility");
					} else {
						oView.byId("id_faclty").setValueState("None");
					}

					if (oController.oVendor == "") {
						oView.byId("idVendor").setValueState("Error");
						oView.byId("idVendor").setValueStateText("Please enter vendor");
					} else {
						oView.byId("idVendor").setValueState("None");
					}

					/* if(oCustID == ""){
					   oView.byId("id_custID").setValueState("Error");
					   oView.byId("id_custID").setValueStateText("Please enter customer ID");
					 } else {
					   oView.byId("id_custID").setValueState("None");
					 }*/

					if (oController.oBillType == "") {
						oView.byId("id_billingtype").setValueState("Error");
						oView.byId("id_billingtype").setValueStateText("Please select any bill type");
					} else {
						oView.byId("id_billingtype").setValueState("None");
					}

					if (oController.oAccID == "") {
						oView.byId("id_primaryacct").setValueState("Error");
						oView.byId("id_primaryacct").setValueStateText("Account cannot be empty");
					} else {
						oView.byId("id_primaryacct").setValueState("None");
					}

					if (oController.oBillDate == null) {
						oView.byId("id_podate").setValueState("Error");
						oView.byId("id_podate").setValueStateText("Please billing date");
					} else {
						oView.byId("id_podate").setValueState("None");
					}

					if (oController.oDueDate == null) {
						oView.byId("id_duedate").setValueState("Error");
						oView.byId("id_duedate").setValueStateText("Please choose due date");
					} else {
						oView.byId("id_duedate").setValueState("None");
					}

					if (oController.oPayType == "") {
						oView.byId("idpaymttyp").setValueState("Error");
						oView.byId("id_perrespidpaymttyp").setValueStateText("Please select payment type");
					} else {
						oView.byId("idpaymttyp").setValueState("None");
					}

					if (oController.oPersonResp == "") {
						oView.byId("id_perresp").setValueState("Error");
						oView.byId("id_perresp").setValueStateText("Please enter person resposible");
					} else {
						oView.byId("id_perresp").setValueState("None");
					}

					sap.m.MessageToast.show("Please fill all the mandatory fileds");
				} else {

					var dialog = new sap.m.Dialog({
						title: 'Confirmation',
						icon: 'sap-icon://question-mark',
						type: 'Message',
						content: new sap.m.Text({
							text: 'Are you sure you want to Submit the item?'
						}),
						beginButton: new sap.m.Button({
							text: 'yes',
							press: function() {
								// Sending the data to the back end to save data to the  table
								var oEntity = {
									//                    Billid  : oBillID,
									Accid: oController.oAccID,
									Billtyp: oController.oBillType,
									Blcycl: oController.oBillCycle,
									Bldat: oController.oBillDate,
									//                    Custid  : oCustID,
									Duedat: oController.oDueDate,
									Email: oController.oEmailID,
									Faclty: oController.oFacility,
									Mobile: oController.oMobile,
									Payment: oController.oPayType,
									Perses: oController.oPersonResp,
									Plant: oController.oPlant,
									Vendor: oController.oVendor,
									Srtax: oController.oServiceTax,
									Vatrt: "",
									//                    Cmpny   : oCmpny,
									Status: oStatus,
									Bprocs: sBprocs,
									//                    Confrm  : oConf,
									Confrm: "2"

								};

								var fnSaveSuccess = function(oData, oResponse) {
									sap.m.MessageBox.success("Bill has been registered successfully, your bill ID is: " + oData.Billid);
									dialog.close(); // Closing the message box

									oController.fnCancelBtnPress(); // Function to clear the fields

									//oController._oRouter.navTo("RegBill");
									//                  oEventBus.publish("busChanlDetail","eventDetId");
								};

								var fnSaveFail = function() {
									sap.m.MessageToast.show("fail");
								};
								oModel.create("/BillRegistrationSet", oEntity, {
									success: fnSaveSuccess,
									error: fnSaveFail
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

				} // Else Colse

			};

			var fnCountFail = function() {
				sap.m.MessageToast.show("Failed");
			};

			oModel.read("/BillRegistrationSet/$count", {
				success: fnCountSuccess,
				error: fnCountFail
			});
			//-----------------------------------------------------------------------------
		},
		fnInactBtnPress: function(oEvent) {
			var oBtnText = oEvent.oSource.mProperties.text;
			var vNewDate = new Date();
			var oView = this.getView();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var oDueDate = oView.byId("id_duedate").getDateValue();

			var vOperation, oText, oSuccessText, oBtnt;
			var oActivity = 1;
			var oState;
			var that = this;
			oBtnText = "Make Active";
			if (oActivity == "1") {
				oState = "";
				if (oBtnText == "Make Active") {
					oBtnt = "3";
				} else if (oBtnText == "Make Inactive") {
					oBtnt = "4";
				}

			} else if (oActivity == "10") {
				oState = "X";
				if (oBtnText == "Make Active") {
					oBtnt = "3";
				} else if (oBtnText == "Make Inactive") {
					oBtnt = "4";
				} else if (oBtnText == "Confirm") {
					oBtnt = "1";
				}
			}

			//Checking the button text
			if (oBtnText == "Make Active") {
				oText = "Are you sure you want to activate the service?";
				oSuccessText = "Your service for bill ID " + vBill + " has been reactivated";
				vOperation = "1";
			} else {

				//------------ Checking due date with current date ---------
				if (oDueDate > vNewDate && oActivity == "1") {
					vOperation = "2";
					sap.m.MessageBox.error("Unable to deactivate the bill, as the bill is still in process");
				} else {
					vOperation = "1";
					oText = "Are you sure you want to Update the service?";
					oSuccessText = "Your service for bill ID " + vBill + " has been Updated";
				}
			}

			//----------- setting data into oEntity --------------------
			var oEntity = {
				Billid: vBill,
				Status: oState,
				Confrm: oBtnt
			};

			//----------- Performing update operation --------------------
			if (vOperation == "1") {
				var dialog = new sap.m.Dialog({
					title: 'Confirmation',
					type: 'Message',
					icon: 'sap-icon://question-mark',
					content: new sap.m.Text({
						text: oText
					}),
					beginButton: new sap.m.Button({
						text: 'yes',
						press: function() {

							/*if(oBtnText == "Make Active"){
							  oView.byId("id_inactBtn").setText("Make Inactive");
							} else {
							  oView.byId("id_inactBtn").setText("Make Active");
							}*/

							// Update operation
							var fnSuccess = function() {
								sap.m.MessageBox.success(oSuccessText);
								that.fnReadMasterList();

								//--------------Added By Anupam For Page Reload-------------------------------------------------------
								var fnupdateSuccess = function(oData, oResponse) {

									// var jsonBillType = {
									//     "BillType" : oData
									// };
									// oData.results.reverse();
									// oData.results.push({"BName" : "All", "Billtyp":"All"});
									// oData.results.reverse();
									// var billTypeModel = new sap.ui.model.json.JSONModel();
									// billTypeModel.setData(jsonBillType);
									// oreqMaster.setModel(billTypeModel, "JSONBillType");
								};

								var fnFail = function(oResponse) {
									sap.m.MessageToast.show("Fail");
								};

								//oModel.read("/BillTypeSet",null, null, true, fnSuccess, fnFail);

								//---------------------------------------------------------------------
								//line commented by yasin on 02-09-2025 start
								//              var fnSuccess1 = function(oData, oResponse){
								//                 var json = {
								//                   "Bills" : oData
								//                 };

								//               var jsonmodel = new sap.ui.model.json.JSONModel();
								//               jsonmodel.setData(json);
								//               oreqMaster.setModel(jsonmodel, "JSON");
								//               oReglist.setModel(jsonmodel, "JSON");
								//               }

								//               fnFail1 = function(){
								//                 sap.m.MessageToast.show("Failed to load the data");
								//               };

								//               //oModel.read("/BillRegistrationSet",null, null, true, fnSuccess1, fnFail1);
								//              oModel.read("/BillRegistrationSet", {
								//     success: fnSuccess1,
								//     error: fnFail1
								// });
								//line commented by yasin on 02-09-2025 end

							};

							var fnFail = function() {
								sap.m.MessageToast.show("Failed to perform the operation");
							};

							oModel.update("/BillRegistrationSet('" + vBill + "')", oEntity, {
								success: fnSuccess,
								error: fnFail
							});

							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: 'No',
						press: function() {

							/*if(oBtnText == "Make Active"){
							  oView.byId("id_inactBtn").setText("Make Active");
							} else {
							  oView.byId("id_inactBtn").setText("Make Inactive");
							}*/

							dialog.close(); // Closing the message box
						}
					}),
					afterClose: function() {
						dialog.destroy(); // Destroying sall message boxes
					}
				});
				dialog.open();
			}
		},
		fn_recbilltyp: function() {
			var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oODataModel.read("/RBillTypeSet", {
				success: function(oData) {

					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSONModel, "JSBillRecbill");
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Bill Types");

				}
			});
		},
		fnclear_recbill : function(){
			    this.byId("id_companycode").setSelectedKey("");
    this.byId("idplant").setSelectedKey("");
    this.byId("id_vendorbill").setSelectedKey("");
    this.byId("id_billingtype_recbill").setSelectedKey("");
    this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;

			this.fn_updatePaginatedModel();
		},
		fnSearch_recbill: function() {
			var oODataModel = this.getView().getModel();
			var that = this;
			var sCompany = this.byId("id_companycode").getSelectedKey();
			var sPlant = this.byId("idplant").getSelectedKey();
			var sVendor = this.byId("id_vendorbill").getSelectedKey();
			var sBillType = this.byId("id_billingtype_recbill").getSelectedKey();
			var that = this;
			// build filters
			var aFilters = [];
			if (sCompany) {
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sCompany));
			}
			if (sPlant) {
				aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sPlant));
			}
			if (sVendor) {
				aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sVendor));
			}
			if (sBillType) {
				aFilters.push(new sap.ui.model.Filter("Bltyp", sap.ui.model.FilterOperator.EQ, sBillType));
			}

			oODataModel.read("/BillListSet", {
				filters: aFilters,
				success: function(oData) {
					 oData.results.forEach(function(oItem) {
            if (oItem.Bltyp === "1") {
                oItem.BltypText = "Water Bill";
            } else if (oItem.Bltyp === "2") {
                oItem.BltypText = "Electric Bill";
            } else {
                oItem.BltypText = "Other"; // fallback if needed
            }
        });
					that.aFullData = oData.results;
					that.aFilteredData = oData.results;
					that.iCurrentPage = 1;
					that.iRowsPerPage = 8;
					that.fn_updatePaginatedModel();
					var iCount = oData.results.length;
					that.getView().byId("id_LabTabSFRTitle").setText(iCount);
					// var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					// that.getView().setModel(oJSONModel, "JSBillList");
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Bill Types");

				}
			});

		},
		fn_onRecallPress: function() {
			  sap.ui.core.BusyIndicator.show(0);
    var oODataModel = this.getView().getModel();
var that = this;
    var oPayload = {
        Posted: true
    };

   
      oODataModel.create("/BillListSet", oPayload, {
    success: function(oData) {
    
        var sMessage = oData.Message || "";
        	sap.ui.core.BusyIndicator.hide();

        if (oData.Posted === true) {   // success
            sMessage = sMessage || "Transaction generated successfully.";

            var oSuccessModel = new sap.ui.model.json.JSONModel({ message: sMessage });
            that.getView().setModel(oSuccessModel, "successModel");

            if (!that._oSuccessDialog) {
                that._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.fragment.SuccessReuse", that);
                that.getView().addDependent(that._oSuccessDialog);
            }

            that._oSuccessDialog.open();

            setTimeout(function () {
                if (that._oSuccessDialog && that._oSuccessDialog.isOpen()) {
                    that._oSuccessDialog.destroy();
                    that._oSuccessDialog = null;
               
                }
            }, 3000);

        } else {   // failure
            sMessage = sMessage || "Failed to generate Transaction.";

            var oErrorModel = new sap.ui.model.json.JSONModel({ message: sMessage });
            that.getView().setModel(oErrorModel, "errorModel");

            if (!that._oErrorDialog) {
                that._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ErrorReuse", that);
                that.getView().addDependent(that._oErrorDialog);
            }

            that._oErrorDialog.open();

            setTimeout(function () {
                if (that._oErrorDialog && that._oErrorDialog.isOpen()) {
                    that._oErrorDialog.close();
                 
                }
            }, 2000);
        }
    },

    error: function(oError) {
        sap.m.MessageBox.error("Recall failed due to backend error");
    }


    });
},

		fn_applyFlexGrow: function() {
				if (sap.ui.getCore().AppController) {
				sap.ui.getCore().AppController.collapseSidebar();
			}
			var $view = this.getView().$();

			$view.find(".cl_rec_bill_cont").each(function() {
				var oParent = this.parentElement;
				console.log(oParent);
				if (oParent) {
					// Disable scroll on the parent
					oParent.style.overflow = "hidden";
					oParent.style.overflowY = "hidden"; // important to kill auto scroll
				}
			});
		},
		fn_updatePaginatedModel: function() {
			var oFooter = this.getView().byId("idPaginationFooter");
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "JSBillList");
			if (pageData.length > 0) {
				oFooter.setVisible(true);
				this.fn_renderPageNumbers();
			} else {
				oFooter.setVisible(false);
			}
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
			// this.getView().byId("id_total_1").setText(parseInt(this.aFilteredData.length));

			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage);
			var oPrevBtn = this.byId("idPrevBtn");
			if (oPrevBtn) {
				oPrevBtn.setVisible(this.iCurrentPage > 1);
			}

			// Show/hide Next button
			var oNextBtn = this.byId("idNextBtn");
			if (oNextBtn) {
				oNextBtn.setVisible(this.iCurrentPage < iTotalPages);
			}
			if (iTotalPages <= 1) {
				return;
			}

			var currentPage = this.iCurrentPage;
			var that = this;

			function fn_getPageNumbers(currentPage, totalPages) {
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
			}

			function fn_addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.fn_updatePaginatedModel();
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

			var pagesToShow = fn_getPageNumbers(currentPage, iTotalPages);

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
					fn_addPageButton(page);
				}
			}
		}

	});

});