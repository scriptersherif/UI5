sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"FSC360NEW/model/formatter"
], function(Controller, Filter, FilterOperator, MessageBox, formatter) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var _isLogReport = false;
	return Controller.extend("FSC360NEW.controller.InvoiceUnblock", {

		onInit: function() {
			this.getOwnerComponent().getRouter()
				.getRoute("InvoiceUnblock")
				.attachPatternMatched(this.fn_onRouteMatched, this);
			setTimeout(() => {
				this.fn_applyFlexGrow();
			}, 0);
			this._sCurrentCompInputId = "";
			

var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {
   
});
this.getView().setModel(oTemplateModel, "TemplateModel");
			var aColumnMeta = [{
				key: "Qid",
				label: "Queue Id",
				visible: true
			}, {
				key: "Gjahr",
				label: "Fiscal Year",
				visible: true
			},
			// {
			// 	key: "Trnsty",
			// 	label: "Trans. Type",
			// 	visible: true
			// },
			{
				key: "Descr",
				label: "Description",
				visible: true
			}, {
				key: "Vendor",
				label: "Vendor",
				visible: true
			}, {
				key: "Bukrs",
				label: "Company Code",
				visible: true
			}, {
				key: "Wbagent",
				label: "ID",
				visible: true
			}, {
				key: "WfAge",
				label: "Workflow Age",
				visible: true
			}, {
				key: "Invno",
				label: "Invoice No.",
				visible: true
			}, {
				key: "Bdate",
				label: "Billing Date",
				visible: true
			}, {
				key: "UnblckBy",
				label: "Unblck By",
				visible: false
			}, {
				key: "UnblckDate",
				label: "Unblck Date",
				visible: false
			},
			{
					key: "Vendorname",
				label: "Vendor Name",
				visible: true
			}
			];
		
const oColModel = new sap.ui.model.json.JSONModel(aColumnMeta);
this.getView().setModel(oColModel, "FilterTableModel");
			  // ViewModel for templates
  this.getView().setModel(new sap.ui.model.json.JSONModel({
    selectedTemplate: "",
    templates: [],
     forceFullWidth: false,
      wrapText: false
  }), "viewModel1");
			this.fnGetF4Help();
			this.fn_LoadData();
			this.fn_loadCompanyCodes();
			this.fnGetF4Help();
			var arr1 = [{
				"StatKey": "0",
				"StatText": "All"
			}, {
				"StatKey": "PO",
				"StatText": "Logistics"
			}, {
				"StatKey": "NPO",
				"StatText": "Non Logistics"
			}];
			var oModel2 = new sap.ui.model.json.JSONModel();
			oModel2.setData(arr1);
			this.getOwnerComponent().setModel(oModel2, "JSTransList");
		},
	
		fn_LoadData: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			this.aFilteredData = [];
			oModel.read("/DEEPHEADSet", {
				filters: [

					new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, 'S'),

				],
				urlParameters: {
					$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt,NavUsername,NavSection"
				},
				success: function(oData) {
					if (oData && oData.results && oData.results.length > 0) {
						var oJSusernameModel = new sap.ui.model.json.JSONModel();
						oJSusernameModel.setData(oData.results[0]);
						that.getView().setModel(oJSusernameModel, "JSusername");
						var oJSusernameModel1 = new sap.ui.model.json.JSONModel();
						oJSusernameModel1.setData(oData.results[0].NavUsername.results || []);
						that.getView().setModel(oJSusernameModel1, "jsUserName1");
							var oJSsectionModel1 = new sap.ui.model.json.JSONModel();
						oJSsectionModel1.setData(oData.results[0].NavSection.results || []);
						that.getView().setModel(oJSsectionModel1, "jsSection");
						
						that.fn_updatePaginatedModel();
					}
				},
				error: function(oError) {
					console.error("Error loading data:", oError);
				}
			});
		},
		fn_onRouteMatched: function(oEvent) {
			this.fnclearbutt1();
			this.fn_applyFlexGrow();
			this.fn_updatePaginatedModel();
		},
		fn_loadCompanyCodes: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/StatusFlowSet", {
				filters: [
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "BUKRS")
				],
				success: function(oData) {
					var oJSONModel = new sap.ui.model.json.JSONModel({
						Company: oData.results
					});
					that.getView().setModel(oJSONModel, "JSCCode");
						that.byId("companycode").bindItems({
						path: "JSCCode>/Company",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSCCode>Bukrs}",
							text: "{JSCCode>Bukrs}",
							additionalText: "{JSCCode>Butxt}"
						})
					});
				},
				error: function() {
					sap.m.MessageBox.error("Error loading company codes");
				}
			});
		},
		fn_onCompanyChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sCompanyCode = oSelectedItem.getKey(); // Bukrs
				var sCompanyName = oSelectedItem.getText(); // Butxt

			

			}
		},
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			// To Get Vendor
			oModel.read("/KredaSet", {

				success: function(oData, oResponse) {

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSVendor');

				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');

				}

			});

			oModel.read("/ShT007aSet", {

				success: function(oData, oResponse) {

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSTaxCode');

				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');

				}

			});

			oModel.read("/HWerksSet", {
				success: function(oData, oResponse) {
					var uniquePlants = [];
					var seenWerks = {};

					for (var i = 0; i < oData.results.length; i++) {
						var item = oData.results[i];
						if (!seenWerks[item.Werks]) {
							seenWerks[item.Werks] = true;
							uniquePlants.push(item);
						}
					}

					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(uniquePlants);
					that.getView().setModel(oJSONModel, 'JSPlant');
				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');
				}
			});

		},
		fn_handleSelectionFinish: function(oEvent) {
			var oMultiCombo = oEvent.getSource();
			var aSelectedKeys = oMultiCombo.getSelectedKeys(); // returns array of selected keys
			var aSelectedItems = oMultiCombo.getSelectedItems(); // returns array of selected items

	
		
			// Example: get selected text values
			var aSelectedTexts = aSelectedItems.map(function(item) {
				return item.getText();
			});
		
		},

		
		fn_LoadCC: function(oEvent) {
			var oSourceInput = oEvent.getSource().getParent().getItems()[0]; 
			this._sCurrentCompInputId = oSourceInput.getId(); 

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oModel.read("/StatusFlowSet", {
				filters: [
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, 'BUKRS')
				],
				success: function(oData) {
					var oJSONModel = new sap.ui.model.json.JSONModel({
						Company: oData.results
					});
					that.getView().setModel(oJSONModel, "JSCCode");

				},
				error: function() {
					sap.m.MessageBox.error("HTTP Error");
				}
			});

			if (!this.Comp_frag) {
				this.Comp_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Company", this);
				this.getView().addDependent(this.Comp_frag);
			}

			var oItemsBinding = this.Comp_frag.getBinding("items");
			if (oItemsBinding) {
				oItemsBinding.filter([]);
			}
			this.Comp_frag.open();
		
			setTimeout(function() {
				var oHBox = sap.ui.getCore().byId("show_hide_search");
				if (oHBox) {
					oHBox.addEventDelegate({
						onclick: function() {
							console.log("hi");
						}
					});
				}
			}, 100);
		},
		fn_getVendor: function(oEvent) {
			var oSourceInput1 = oEvent.getSource().getParent().getItems()[0]; 
			if (!this.Vendor_frag) {
				this.Vendor_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Lifnr", this);
				this.getView().addDependent(this.Vendor_frag);
			}

			// Clear any applied filters
			var oBinding = this.Vendor_frag.getBinding("items");
			if (oBinding) {
				oBinding.filter([]);
			}

			// Open dialog first
			this.Vendor_frag.open();
			this._sLifnrInputId = oSourceInput1.getId(); // Store ID to use later in confirm

			// Wait until it's open, then reset the internal search field
			// this.Vendor_frag.attachAfterOpen(function() {
			// 	this.Vendor_frag.getFilterBar().getBasicSearch().setValue("");
			// }.bind(this));
		},
		fn_getPlant: function(oEvent) {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var oSourceInput2 = oEvent.getSource().getParent().getItems()[0];
			var aFilters = [new Filter("Type", FilterOperator.EQ, "Plant")];
			var vComp1 = this.getView().byId("idCompcodeFrom").getValue();
			// var vComp2 = this.getView().byId("idCompCodeTo").getValue();
			var oFilter1 = new sap.ui.model.Filter("Bukrs", FilterOperator.EQ, vComp1);
			var oFilter2 = new sap.ui.model.Filter("Bukrs", FilterOperator.EQ, vComp2);
			aFilters.push(oFilter1);
			aFilters.push(oFilter2);
			oModel.read("/StatusFlowSet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSPlant');
					// oGlobalBusyDialog.close();
				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');
					// oGlobalBusyDialog.close();

				}

			});
			if (!this.Plant_frag) {
				this.Plant_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Plant", this);
				this.getView().addDependent(this.Plant_frag);
			}
			this.Plant_frag.open();
			this._sPlantInputId = oSourceInput2.getId(); 
		},
		fn_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".cl_tat_status_combobox_inp").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});

		},
		fn_confirmCompany: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sCompanyCode = oSelectedItem.getTitle(); 
				if (this._sCurrentCompInputId) {
					var oInput = sap.ui.getCore().byId(this._sCurrentCompInputId);
					if (oInput) {
						oInput.setValue(sCompanyCode);
					}
				}
			}
		},
		fn_CompanySearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
					new sap.ui.model.Filter("Butxt", sap.ui.model.FilterOperator.Contains, sValue)
				],
				and: false
			});

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		fn_Lifnr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_Lifnr_Confrm: function(oEvent) {
			var ven_name = oEvent.getParameter('selectedItem').getTitle();
			//var lifnr = oEvent.getParameter('selectedItem').getDescription();  
			var ven_name = oEvent.getParameter('selectedItem').getTitle(); 
			var vendorNumber = ven_name.split('-').pop().trim(); 

			this.vendorNumber = vendorNumber; 

			if (vendorNumber) {
				var sLifnr = vendorNumber; // Or use getDescription() for Butxt
				if (this._sLifnrInputId) {
					var oInput = sap.ui.getCore().byId(this._sLifnrInputId);
					if (oInput) {
						oInput.setValue(sLifnr);
					}
				}
			}
		},
		fn_plant_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_Plant_Confrm: function(oEvent) {
			var plant_name = oEvent.getParameter('selectedItem').getTitle();
			var plant = oEvent.getParameter('selectedItem').getDescription();
			if (plant_name) {
				var sPlant = plant_name; // Or use getDescription() for Butxt
				if (this._sPlantInputId) {
					var oInput = sap.ui.getCore().byId(this._sPlantInputId);
					if (oInput) {
						oInput.setValue(sPlant);
					}
				}
			}
		},
	
		fnclearbutt: function() {
			var oView = this.getView();

			// Clear all input fields
			oView.byId("companycode").setValue("");
			oView.byId("id_docdatefrm").setValue("");
			oView.byId("id_docdateend").setValue("");
			var oVendorMCB = oView.byId("idvendor");
	var transtyp = oView.byId("id_transactiontyp");
	if (transtyp) {
			 transtyp.setSelectedKey(""); 
    transtyp.setValue("");      
			}
			if (oVendorMCB) {
				oVendorMCB.removeAllSelectedItems();
			}

			var oPlantMCB = oView.byId("idplant");
			if (oPlantMCB) {
				oPlantMCB.removeAllSelectedItems();
			}
	
			    oView.byId("id_Approvedby").setValue("");
    oView.byId("id_Agent").setValue("");
    oView.byId("id_invon").setValue("");
    oView.byId("id_sec_code").setValue("");
    oView.byId("id_fiscalyear").setValue("");
			// Reset view model property if exists
			var oViewModel = oView.getModel("viewModel");
			if (oViewModel) {
				oViewModel.setProperty("/selectedTemplate", "");
			}

			// Clear internal data arrays
			if (this.aFullData) this.aFullData = [];
			if (this.aFilteredData) this.aFilteredData = [];
			this.iCurrentPage = 1;

			// Refresh pagination model if you have one
			if (this.fn_updatePaginatedModel) {
				this.fn_updatePaginatedModel();
			}

			// Reset total count display
			oView.byId("id_totcount").setText("0");
		},

		fnclearbutt1: function() {
			var oView = this.getView();
			var oVendorMCB = oView.byId("idvendor");
			if (oVendorMCB) {
				oVendorMCB.removeAllSelectedItems();
			}
var transtyp = oView.byId("id_transactiontyp");
	if (transtyp) {
				 transtyp.setSelectedKey(""); 
    transtyp.setValue("");      
			}

			var oPlantMCB = oView.byId("idplant");
			if (oPlantMCB) {
				oPlantMCB.removeAllSelectedItems();
			}
			// Clear all relevant input fields
			oView.byId("companycode").setValue("");
			oView.byId("id_docdatefrm").setValue("");
			oView.byId("id_docdateend").setValue("");
			oView.byId("id_Approvedby").setValue("");
    oView.byId("id_Agent").setValue("");
    oView.byId("id_invon").setValue("");
    oView.byId("id_sec_code").setValue("");
    oView.byId("id_fiscalyear").setValue("");
		

			// Reset view model property if exists
			var oViewModel = oView.getModel("viewModel");
			if (oViewModel) {
				oViewModel.setProperty("/selectedTemplate", "");
			}

			// Reset table data if stored in arrays
			if (this.aFullData) this.aFullData = [];
			if (this.aFilteredData) this.aFilteredData = [];
			this.iCurrentPage = 1;

			// Reset total count display
			oView.byId("id_totcount").setText("0");
		},
		onInvoiceLiveChange: function(oEvent) {
			var sValue = oEvent.getParameter("value"); // current text
			var oMCB = this.byId("idinvoice");

			// Detect ENTER key
			var oOrigEvent = oEvent.getParameter("originalEvent");
			if (oOrigEvent && oOrigEvent.key === "Enter" && sValue) {
				// Check if already exists
				var bExists = oMCB.getItems().some(function(oItem) {
					return oItem.getText() === sValue;
				});

				if (!bExists) {
					// Add new item
					var oNewItem = new sap.ui.core.Item({
						key: sValue,
						text: sValue
					});
					oMCB.addItem(oNewItem);
				}

				// Select the newly added entry
				oMCB.addSelectedKey(sValue);

				// Clear the input field
				oMCB.setValue("");
			}
		},

		fn_search: function() {
			if (oGlobalBusyDialog !== undefined) {
				oGlobalBusyDialog.close();
			}
			var oView = this.getView();
			var vComp1 = this.getView().byId("companycode").getValue();
			var sapproved = oView.byId("id_Approvedby").getValue().trim();
			var agent = oView.byId("id_Agent").getValue().trim();
			var vDoc1 = this.getView().byId("id_docdatefrm").getValue();
			var vDoc2 = this.getView().byId("id_docdateend").getValue();
			var sTranstype = this.getView().byId("id_transactiontyp").getSelectedKey();
			 var sInvoice = this.byId("id_invon").getValue();
			var seccode = oView.byId("id_sec_code").getValue().trim();
			var sfiscalyear = oView.byId("id_fiscalyear").getValue().trim();
			if (vComp1 === "") {
				sap.m.MessageToast.show("Please Enter the Company Code");
				return;
			} else {
				var aFilters = [];
				if (vComp1 !== '') {
					aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, vComp1));
				}
				if (sfiscalyear !== '') {
					aFilters.push(new sap.ui.model.Filter("Gjahr", sap.ui.model.FilterOperator.EQ, sfiscalyear));
				}
				if (sInvoice !== '') {
					aFilters.push(new sap.ui.model.Filter("Invno", sap.ui.model.FilterOperator.EQ, sInvoice));
				}

				if (vDoc1 !== '') {
					aFilters.push(new sap.ui.model.Filter("Bdate", sap.ui.model.FilterOperator.EQ, vDoc1));
				}
				if (vDoc2 !== '') {
					aFilters.push(new sap.ui.model.Filter("Bdate", sap.ui.model.FilterOperator.EQ, vDoc2));
				}
				if (sapproved) {
					aFilters.push(new sap.ui.model.Filter("UnblckBy", sap.ui.model.FilterOperator.EQ, sapproved));
				}
				if (agent) {
					aFilters.push(new sap.ui.model.Filter("Wbagent", sap.ui.model.FilterOperator.EQ, agent));
				}
					if (seccode) {
					aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, seccode));
				}

				if (_isLogReport === true) {
					aFilters.push(new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, "X"));
				}

				var aSelectedVendors = this.byId("idvendor").getSelectedItems(); // getSelectedItems returns items
				if (aSelectedVendors.length > 0) {
					for (var i = 0; i < aSelectedVendors.length; i++) {
						var vVendorId = aSelectedVendors[i].getKey();
						aFilters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vVendorId));
					}
				}

				// Plants
				var aSelectedPlants = this.byId("idplant").getSelectedItems();
				if (aSelectedPlants.length > 0) {
					for (var j = 0; j < aSelectedPlants.length; j++) {
						var vPlantId = aSelectedPlants[j].getKey();
						aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlantId));
					}
				}
				if (sTranstype && sTranstype !== "0") {
					aFilters.push(new sap.ui.model.Filter("Descr", sap.ui.model.FilterOperator.EQ, sTranstype));
				}
				// Create OData model
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var that = this;
				// Read data with filter
				oModel.read("/InvoiceUBLSet", {
					filters: aFilters,
					success: function(oData) {
						var aResults = oData.results;
						if (_isLogReport === true) {
							aResults = aResults.filter(function(item) {
								return item.UnblckBy && item.UnblckBy.trim() !== "";
							});
						}
						that.aFullData = aResults;
						that.aFilteredData = aResults;

						that.iCurrentPage = 1;
						that.iRowsPerPage = 9;
						that.fn_updatePaginatedModel();
						var iCount = aResults.length;
						that.getView().byId("id_totcount").setText(iCount);
					},
					error: function(oError) {
						sap.m.MessageToast.show("Error fetching data");
					}
				});
			}
		},
		fn_unblock: function() {
			var myTable = this.getView().byId("idTable");
			var QueueIDs = [];
			var aFilters = [];
			var oController = this;
			var myTableRows = myTable.getRows();
			var selectedIndeices = myTable.getSelectedIndices();
			var varmodel = this.getView().getModel("JS_InvUbl");
			var obj = {
				Flag: 'U',
				NavInvubl: [],
				NavHead: []
			};
			if (selectedIndeices.length !== 0) {
				for (var i = 0; i < selectedIndeices.length; i++) {
					var data = varmodel.getData()[selectedIndeices[i]];
					if (data.key === "UnblckBy" || data.key === "UnblckDate") {
						continue;
					}
					obj.NavInvubl.push(data);

				}
				// Create OData model
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var that = this;
				var vError = "";
				var vSuccess = "";
				var sMessage = " Successfully Assigned";
				var eMessage = "Error in Queid - "
				var ErrorMsg = "";
				var oMsg = "";
				var oMsgData = [];
				var oSuccessModel = new sap.ui.model.json.JSONModel({
					message: sMessage
				});
				// oController.getView().setModel(oSuccessModel, "successModel");
				// Read data with filter
				oModel.create("/DEEPHEADSet", obj, {
					filters: aFilters,
					success: function(oData) {
						for (var j = 0; j < oData.NavInvubl.results.length; j++) {
							if (oData.NavInvubl.results[j].Status === 'Success') {
								vSuccess = 'X';
								oMsg = {
									message: eMessage + oData.NavInvubl.results[j].Qid
								};
								oMsgData.push(oMsg);
							}
							if (oData.NavInvubl.results[j].Status === 'Error') {
								vError = 'X';
								oMsg = {
									message: eMessage + oData.NavInvubl.results[j].Qid
								};
								oMsgData.push(oMsg);
							}
						}
						var oErrorModel = new sap.ui.model.json.JSONModel();
						oErrorModel.setData(oMsgData);
						that.getView().setModel(oErrorModel, "errorModel");
						if (vError === 'X' && vSuccess === 'X') {
						
							if (!oController._oErrorDialog) {
								oController._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.InvUblreject", oController);
								oController.getView().addDependent(oController._oErrorDialog);
							}
							oController._oErrorDialog.open();
						} else if (vError === 'X') {
							
							if (!oController._oErrorDialog) {
								oController._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.InvUblerror", oController);
								oController.getView().addDependent(oController._oErrorDialog);
							}
							oController._oErrorDialog.open();
						} else {
						
							if (!oController._oSuccessDialog) {
								oController._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.fragment.InvUblsuccess", oController);
								oController.getView().addDependent(oController._oSuccessDialog);
							}
							oController._oSuccessDialog.open();

							setTimeout(function() {
								oController._oSuccessDialog.close();
								that.fn_search();
							}, 3000);
						}
					},
					error: function(oError) {
						sap.m.MessageToast.show("Error fetching data");
					}
				});
			} else {
				sap.m.MessageBox.warning("Please at least one record");
			}
		},
		fn_onCloseErrorDialog: function() {
			var oController = this;
			oController._oErrorDialog.close();
			oGlobalBusyDialog.open();
			this.fn_search();
		},
		fn_onRadioSelect: function(oEvent) {
			var selectedIndex = oEvent.getSource().getSelectedIndex();
			var oCombo = this.byId("id_Approvedby");
			var oModel = this.getView().getModel("FilterTableModel");
			var oUnblockBtn = this.byId("id_unblock");
			 var oTable = this.byId("idTable");
			this.byId("id_totcount").setText("0");
			if (selectedIndex === 0) {
				oCombo.setEditable(false); 
				oCombo.setSelectedKey(""); 
    oCombo.setValue("");  

		
				oModel.setProperty("/10/visible", false);
				oModel.setProperty("/11/visible", false);
				oUnblockBtn.setVisible(true);
				_isLogReport = false;
				if (this.aFullData) this.aFullData = [];
				if (this.aFilteredData) this.aFilteredData = [];
				this.iCurrentPage = 1;

			
				if (this.fn_updatePaginatedModel) {
					this.fn_updatePaginatedModel();
				}

			
				this.byId("id_totcount").setText("0");
				oTable.setSelectionMode("Multi");
		 //this.byId("idFirstColumnText").removeStyleClass("firstColumnWithMargin");
			} else if (selectedIndex === 1) {
				oCombo.setEditable(true);

				// oModel.setProperty("/10/visible", true);
				// oModel.setProperty("/11/visible", true);
				oUnblockBtn.setVisible(false);
				_isLogReport = true;
				if (this.aFullData) this.aFullData = [];
				if (this.aFilteredData) this.aFilteredData = [];
				this.iCurrentPage = 1;

				// Refresh pagination model if you have one
				if (this.fn_updatePaginatedModel) {
					this.fn_updatePaginatedModel();
				}

				// oTable.setSelectionMode("None");
			 //this.byId("idFirstColumnText").addStyleClass("firstColumnWithMargin");
				this.byId("id_totcount").setText("0");
			}
		},

	
		fn_updatePaginatedModel: function() {
			var oFooter = this.getView().byId("idPaginationFooter");
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;
			if (!this.aFilteredData || !Array.isArray(this.aFilteredData)) {
				this.aFilteredData = [];
			}
			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "JS_InvUbl");
			if (this.aFilteredData.length > 0) {
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
		fn_onNextPage: function() {
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
		},
	fnFilterPop: function (oEvent) {
	var oButton = oEvent.getSource();

	if (!this._oFilterPopover) {
		this._oFilterPopover = sap.ui.xmlfragment(
			"FSC360NEW.fragment.FilterPopovers", 
			this
		);
		this.getView().addDependent(this._oFilterPopover);
	}

	this._oFilterPopover.openBy(oButton);
}
,
fncustomcolumns: function(oEvent) {
    var oView = this.getView();

    // create fragment only once
  if (!this._oCustomizePopover) {
    this._oCustomizePopover = sap.ui.xmlfragment("FSC360NEW.fragment.CustomCol_Autopark", this);

    this._oCustomizePopover.setModel(oView.getModel("FilterTableModel"), "FilterTableModel");
    console.log("FilterTableModel values:", oView.getModel("FilterTableModel").getData());
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
fn_onCancelCreateTemplate: function () {
  if (this._oCreateTemplatePopover) {
    this._oCreateTemplatePopover.close();
    this._oCreateTemplatePopover.destroy();
    this._oCreateTemplatePopover = null; // ✅ Fix
  }
  if (this._oCustomizePopover) {
    this._oCustomizePopover.close();
    this._oCustomizePopover.destroy();
    this._oCustomizePopover = null; // ✅ Fix
  }
  if (this._oFilterPopover) {
    this._oFilterPopover.close();
    this._oFilterPopover.destroy();
    this._oFilterPopover = null; // ✅ Fix
  }
}
,
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
    const sTableName = "/EXL/FSC_INVUNB";

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
fn_reloadTemplates: function () {
    const oView = this.getView();
    const oODataModel = this.getOwnerComponent().getModel();
    const oViewModel = oView.getModel("viewModel1");
    const sUserId = oView.getModel("JSusername").getProperty("/Userid");

    oODataModel.read("/SaveTemplateSet", {
        filters: [
            new sap.ui.model.Filter("Userid", sap.ui.model.FilterOperator.EQ, sUserId)
        ],
        success: function (oData) {
            const aTemplateArray = oData.results.map(item => ({
                name: item.TemplateId,
                userid: item.Userid,
                columns: item.Columns || ""
            }));
            oViewModel.setProperty("/templates", aTemplateArray);
        },
        error: function () {
            sap.m.MessageToast.show("Failed to reload templates");
        }
    });
},
onApplyTemplate: function () {
  //this.applyVisibleColumns();
  if (this._oCustomizePopover) {
  this._oCustomizePopover.close();
  this._oCustomizePopover.destroy();
  this._oCustomizePopover = null;  // ✅ Fix added here
}

},

fn_onOpenTemplatePopover: function (oEvent) {
    const oView = this.getView();
const sTableName = "/EXL/FSC_INVUNB";
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
        success: function (oData) {
       
            // Map backend fields to UI model
            const aTemplateArray = oData.results.map(item => ({
                name: item.TemplateId, // template name
                userid: item.Userid,
                
                columns: item.Columns || "" // comma-separated columns
            }));

            oViewModel.setProperty("/templates", aTemplateArray);
        }.bind(this),
        error: function () {
            sap.m.MessageToast.show("Failed to load templates");
        }
    });

    // Open popover near the source control
    this._oTemplatePopover.openBy(oEvent.getSource());
},
fn_onTemplateListItemPress: function (oEvent) {
    // const oCtx = oEvent.getSource().getBindingContext("viewModel1");
    // if (!oCtx) {
    //     console.error("No binding context found for viewModel1");
    //     return;
    // }
const oItem = oEvent.getParameter("listItem"); // always the pressed CustomListItem
    const oCtx = oItem.getBindingContext("viewModel1");
    const sName = oCtx.getProperty("name");
    console.log("Clicked template:", sName);
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
	fn_onDeleteTemplateRow: function (oEvent) {
    var oButton = oEvent.getSource();
    var oCtx = oButton.getBindingContext("viewModel1");
    if (!oCtx) {
        return;
    }

    var sTemplateName = oCtx.getProperty("name");
    var sReportName = "/EXL/FSC_INVUNB"; // Hardcoded Tabid

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
        oItem.visible = bSelected;  // select or deselect all
    });

    oModel.refresh(true); // update bindings
},

	});

});