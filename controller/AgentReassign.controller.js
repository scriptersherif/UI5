sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"FSC360NEW/model/formatter"
], function(Controller, FilterOperator, Filter, MessageBox, formatter) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();

	var oStatus, oComp, oProfitCenter, oVendor, oInvoice, oFYear, oAgent,
		oFromDate, oToDate, oAgentDesc, oPlant, oModel, oVenSubmit,
		oJSONStatus, oJSONInvType, oJSONVendor, oJSONCmpny, oVenDesc,
		oJSONAgent, oJSONProfitC, oJSONPlant, oJsonModelTab,
		vStatus, vCompany, vProfitCenter, vVendor, vInvoice,
		vFiscalYear, vAgent, vFromDate, vToDate, vPlant,
		vBegda, vEndda, vFragID, flagreassign, vDateFlag, vFrmDt, vToDt;
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

	return Controller.extend("FSC360NEW.controller.AgentReassign", {

		onInit: function() {

			// this.fn_LoadData();
			// this.fn_loadCompanyCodes();
			this.fn_getPlant();
			this.fn_getVendor();
			this.fn_status();


var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {
   
});
this.getView().setModel(oTemplateModel, "TemplateModel");
			var aColumnMeta = [{
					key: "Priority",
					label: "Priority",
					visible: true
				}, {
					key: "Qid",
					label: "Queue Id",
					visible: true
				}, {
					key: "Erdat",
					label: "Created Date",
					visible: true
				}, {
					key: "Lifnr",
					label: "Vendor Code",
					visible: true
				}, {
					key: "Name1",
					label: "Vendor Name",
					visible: false
				}, {
					key: "Ebeln",
					label: "PO Number",
					visible: true
				}, {
					key: "Grn",
					label: "GRN",
					visible: true
				}, {
					key: "Assignedto",
					label: "Agent",
					visible: true
				}, {
					key: "Bname",
					label: "User Name",
					visible: false
				}, {
					key: "Invno",
					label: "Invoice No",
					visible: true
				}, {
					key: "Invdt",
					label: "Invoice Date",
					visible: true
				}, {
					key: "Ntamt",
					label: "Net Amount",
					visible: true
				}, {
					key: "Waers",
					label: "Currency",
					visible: false
				}, {
					key: "Bukrs",
					label: "Comp Code",
					visible: true
				}, {
					key: "Stats",
					label: "Stats",
					visible: false
				}, {
					key: "Prctr",
					label: "Profit Center",
					visible: false
				}, {
					key: "Ttype",
					label: "Transaction Type",
					visible: false
				}, {
					key: "Gjahr",
					label: "Fiscal Year",
					visible: false
				}, {
					key: "Werks",
					label: "Plant",
					visible: false
				},

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
			var oPriorityData = [{
					key: "Y",
					text: "Low"
				}, // Low = empty
				{
					key: "X",
					text: "High"
				}, // High = X
				{
					key: "ALL",
					text: "All"
				} // Optional if you want an "All" option
			];

			var oPriorityModel = new sap.ui.model.json.JSONModel();
			oPriorityModel.setData({
				Priority: oPriorityData
			});

			// Set to view
			this.getView().setModel(oPriorityModel, "PriorityModel");
			var that = this;
			this.bIsAuthorizedReassign = false;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("AgentReassign").attachPatternMatched(this.fn_onRouteMatched, this);
			this.fn_checkReassignAuthorization();

		},
		fn_checkReassignAuthorization: function() {
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			oModel.read("/checkAuthSet(ActionType='REASSIGN')", {
				success: function(oData) {
					// Backend sends Result = "X" if allowed
					that.bIsAuthorizedReassign = oData.Result;

				
				},
				error: function(oErr) {
					console.error("Auth check failed", oErr);
					that.bIsAuthorizedReassign = false;
				}
			});
		},
	

		fn_onRouteMatched: function() {
			// fnclearbutt();
			 var oView = this.getView();

    // Reset ComboBoxes
    var aComboBoxes = [
        "id_companycode",
        "id_profit2",
        "idplant",
        "idVendor",
        "id_transactiontyp",
        "id_Statuss",
        "id_Agent",
        "id_priority"
    ];
    aComboBoxes.forEach(function(sId) {
        var oCombo = oView.byId(sId);
        if (oCombo) {
            oCombo.setSelectedKey("");
            oCombo.setValue("");
        }
    });

    // Reset Input Fields
    ["idfiscalyear"].forEach(function(sId) {
        var oInput = oView.byId(sId);
        if (oInput) {
            oInput.setValue("");
        }
    });

    // Reset DatePickers
    ["id_creationdatefrm", "id_creationdateend"].forEach(function(sId) {
        var oDate = oView.byId(sId);
        if (oDate) {
            oDate.setDateValue(null);
        }
    });

    // Reset table data safely
    this.aFullData = [];
    this.aFilteredData = [];
    this.iCurrentPage = 1;
    			oView.byId("LabTabWRATitle").setText(0);
    				this.fn_updatePaginatedModel();
		},
		fn_LoadData: function() {
			var Bukrs = '6000';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Bukrs", FilterOperator.EQ, Bukrs)

				],
				urlParameters: {
					$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt,NavDomain,NavUsername"
				},
				success: function(oData) {
					if (oData && oData.results && oData.results.length > 0) {
						that.getView().byId("idusername").setText(oData.results[0].UserName);
						var oJSusernameModel = new sap.ui.model.json.JSONModel();
						oJSusernameModel.setData(oData.results[0].NavUsername.results || []);
						that.getView().setModel(oJSusernameModel, "jsUserName");
						var oJSusernameModel1 = new sap.ui.model.json.JSONModel();
						oJSusernameModel1.setData(oData.results[0].NavUsername.results || []);
						that.getView().setModel(oJSusernameModel1, "jsUserName1");

						var transactionmodel = new sap.ui.model.json.JSONModel();
						transactionmodel.setData(oData.results[0].NavDomain.results);
						that.getView().setModel(transactionmodel, 'JSTransType');

						that.fn_updatePaginatedModel();
					}
				},
				error: function(oError) {
					console.error("Error loading data:", oError);
				}
			});
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
							text: "{JSCCode>Bukrs}"

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
						template: new sap.ui.core.Item({
							key: "{JSPlant>Werks}",
							text: {
								parts: [{
									path: "JSPlant>Name1"
								}, {
									path: "JSPlant>Werks"
								}],
								formatter: function(name, werks) {
									return werks + " - " + name;
								}
							}
						})
					});

				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');
					oGlobalBusyDialog.close();

				}

			});

		},
		fn_onCompanyChange: function() {
			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oEmptyModel, "MProfitCenter");
			this.getView().byId("id_profit2").setValue("");
			this.fn_prctr();
		},
		fn_prctr: function() {
			var v_compcode1 = this.getView().byId("id_companycode").getValue();
			// var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));

			var that = this;

			$.ajax({
				url: "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/ProfitCenterSet?$filter=Bukrs eq '" + v_compcode1 + "'&$format=json",
				method: "GET",
				success: function(oData) {
					// Defensive check: sometimes response is oData.d.results, sometimes oData.value
					var aResults = (oData.d && oData.d.results) ? oData.d.results : oData.value;

					// If only 1 Profit Center, prefill the field
					if (aResults && aResults.length === 1) {
						var PRCTR = aResults[0].ProfitCtr;
						var description = aResults[0].PctrName;
						var profit = PRCTR + "-" + description;
						that.getView().byId("id_profit").setValue(profit);
						that.getView().byId("id_profit2").setValue(profit);
					}

					// Bind result list to model
					var JsonoModelProfCen = new sap.ui.model.json.JSONModel();
					JsonoModelProfCen.setData(aResults);
					that.getView().setModel(JsonoModelProfCen, "MProfitCenter");
				},
				error: function(err) {
					MessageBox.error("Error while fetching Profit Centers");
					console.error("ProfitCenterSet call failed", err);
				}
			});
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

				},
				error: function() {
					sap.m.MessageBox.error("HTTP Error while fetching Vendor list");
				}
			});
		},
		fn_status: function() {
			var arr = [{
				"StatKey": "0",
				"StatText": "All"
			}, {
				"StatKey": "S30",
				"StatText": "In Workflow"
			}, {
				"StatKey": "S15",
				"StatText": "Indexed"
			}];
			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.setData(arr);
			this.getOwnerComponent().setModel(oModel1, "JSStatusList");

		},
		fn_PlantChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey();
				this.byId("idplant").setValue(sKey);
			}
		},
	

		fnSearchPress: function() {
			var oView = this.getView();
			var oModel = oView.getModel();
			var aFilters = [];
			var that = this;

			// Controls
			var oFromDateCtrl = oView.byId("id_creationdatefrm");
			var oToDateCtrl = oView.byId("id_creationdateend");
			var oCompanyCtrl = oView.byId("id_companycode");
			var oFYearCtrl = oView.byId("idfiscalyear");
			var oProfitCtrl = oView.byId("id_profit2");
			var oPlantCtrl = oView.byId("idplant");
			var oVendorCtrl = oView.byId("idVendor");
			var oTransCtrl = oView.byId("id_transactiontyp");
			var oStatusCtrl = oView.byId("id_Statuss");
			var oAgentCtrl = oView.byId("id_Agent");
			var oPriority = oView.byId("id_priority");

			// Values
			var vFromDateVal = oFromDateCtrl.getDateValue();
			var vToDateVal = oToDateCtrl.getDateValue();
			var vCompany = oCompanyCtrl.getValue();
			var vFiscalYear = oFYearCtrl.getValue();
			var vProfit = oProfitCtrl.getValue();
			var vPlant = oPlantCtrl.getValue();
			var vVendor = oVendorCtrl.getValue();
			var vInvoiceKey = oTransCtrl.getSelectedKey();
			var vStatus = oStatusCtrl.getSelectedKey();
			var vAgent = oAgentCtrl.getValue();
			var vPriority = oPriority.getSelectedKey();
			//authoriztion check
			// this.fn_checkReassignAuthorization();
		 if (!this.bIsAuthorizedReassign) {
        sap.m.MessageToast.show("You are not authorized for REASSIGN");
        return;
    }
			// Basic validation
			if (!vFromDateVal || !vToDateVal || !vFiscalYear || !vCompany) {
				sap.m.MessageToast.show("Enter valid Date Range and Fiscal Year and Company Code");
				if (!vFromDateVal) {
					oFromDateCtrl.setValueState("Error");
				}
				if (!vToDateVal) {
					oToDateCtrl.setValueState("Error");
				}
				if (!vFiscalYear) {
					oFYearCtrl.setValueState("Error");
				}
				return;
			}

			// === Step 1: Read DatesSet for fiscal year boundaries ===
			oModel.read("/DatesSet(Fyear='" + vFiscalYear + "')", {
				success: function(oData) {
					var dBegda = oData.Begda ? new Date(oData.Begda) : null;
					var dEndda = oData.Endda ? new Date(oData.Endda) : null;

					if (!dBegda || !dEndda) {
						sap.m.MessageToast.show("Fiscal year boundaries not found");
						return;
					}

					// Reset value states
					oFromDateCtrl.setValueState("None");
					oToDateCtrl.setValueState("None");
					oFYearCtrl.setValueState("None");

					// Validate dates inside fiscal year
					if (vFromDateVal < dBegda || vFromDateVal > dEndda) {
						oFromDateCtrl.setValueState("Error");
						oFromDateCtrl.setValueStateText("From Date outside fiscal year");
					}
					if (vToDateVal < dBegda || vToDateVal > dEndda) {
						oToDateCtrl.setValueState("Error");
						oToDateCtrl.setValueStateText("To Date outside fiscal year");
					}

					if (oFromDateCtrl.getValueState() === "Error" || oToDateCtrl.getValueState() === "Error") {
						oFYearCtrl.setValueState("Error");
						sap.m.MessageToast.show("Please enter dates within the fiscal year");
						return;
					}

					// === Step 2: Build filters ===
					if (vCompany) {
						aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, vCompany.toUpperCase()));
					}
					if (vFiscalYear) {
						aFilters.push(new sap.ui.model.Filter("Gjahr", sap.ui.model.FilterOperator.EQ, vFiscalYear));
					}
					if (vProfit) {
						aFilters.push(new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.EQ, vProfit.toUpperCase()));
					}
					if (vPlant) {
						aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlant.toUpperCase()));
					}
					if (vVendor) {
						aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, vVendor.toUpperCase()));
					}
					if (vInvoiceKey && vInvoiceKey !== "All") {
						aFilters.push(new sap.ui.model.Filter("Ttype", sap.ui.model.FilterOperator.EQ, vInvoiceKey));
					}
					// 	if (vPriority && vPriority !== "All") {
					// 	aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, vPriority));
					// }
					if (vPriority && vPriority !== "ALL") {
    aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, vPriority));
}
					// if (vPriority && vPriority !== "ALL") {
					// 	var mappedPriority = "";
					// 	if (vPriority === "X") {
					// 		mappedPriority = "X"; // High
					// 	} else if (vPriority === "Y") {
					// 		mappedPriority = ""; // Low = empty string
					// 	}

					// 	aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, mappedPriority));
					// }
					if (vStatus != 0) {
						aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, vStatus));
					}
					if (vAgent) {
						aFilters.push(new sap.ui.model.Filter("Assignedto", sap.ui.model.FilterOperator.EQ, vAgent));
					}
					if (vFromDateVal && vToDateVal) {
						var dFromStart = new Date(vFromDateVal);
						dFromStart.setHours(0, 0, 0, 0);
						var dToEnd = new Date(vToDateVal);
						dToEnd.setHours(23, 59, 59, 999);
						aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, dFromStart, dToEnd));
					}

					// === Step 3: Read ReassignSet ===
					oModel.read("/ReassignSet", {
						filters: aFilters,
						success: function(oDataResp) {
							// var oJsonArray = { "WRLLIST": oDataResp.results || [] };
							// var oJSONModel = new sap.ui.model.json.JSONModel(oJsonArray);
							// oView.setModel(oJSONModel, "WRL");
							var arrTable = [];
							arrTable = oDataResp.results;
							that.aFullData = arrTable; // for raw full list
							that.aFilteredData = arrTable; // assuming no filter for now

							that.iCurrentPage = 1;
							that.iRowsPerPage = 8;
							that.fn_updatePaginatedModel();
							oView.byId("LabTabWRATitle").setText(oDataResp.results.length);
							oView.byId("id_reassignTable").setBusy(false);
						},
						error: function(oErr) {
							oView.byId("id_reassignTable").setBusy(false);
							oView.byId("LabTabWRATitle").setText(0);
							var oEmptyModel = new sap.ui.model.json.JSONModel({
								"WRLLIST": []
							});
							oView.setModel(oEmptyModel, "WRL");
							sap.m.MessageToast.show("No Data Found");
							console.error("ReassignSet read error:", oErr);
						}
					});
				},
				error: function(oErr) {
					sap.m.MessageToast.show("Unable to validate fiscal year dates");
					console.error("DatesSet read error:", oErr);
				}
			});
		},

		//      var fnDate = function (oData, oResponse) {
		//     var firstdate = oData.Begda;
		//     var lastdate  = oData.Endda;

		//     var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyyMMdd" });
		//     firstdate = oDateFormat.format(new Date(firstdate));
		//     lastdate  = oDateFormat.format(new Date(lastdate));
		//     begda     = oDateFormat.format(new Date(begda));
		//     endda     = oDateFormat.format(new Date(endda));

		//     if (begda) {
		//         if (begda >= firstdate && begda <= lastdate) {
		//             if (flag === 1) {
		//                 oView.byId("id_fromDate").setValueState("None");
		//                 vDateFlag = 1;
		//             }
		//         } else {
		//             oView.byId("id_fromDate").setValueState("Error");
		//             oView.byId("id_fromDate").setValueStateText("Enter Date within fiscal year");
		//         }
		//     }

		//     if (endda) {
		//         if (endda >= firstdate && endda <= lastdate) {
		//             if (flag === 1) {
		//                 oView.byId("id_toDate").setValueState("None");
		//                 vDateFlag = 1;
		//             }
		//         } else {
		//             oView.byId("id_toDate").setValueState("Error");
		//             oView.byId("id_toDate").setValueStateText("Enter Date within fiscal year");
		//         }
		//     }

		//     if (
		//         oView.byId("id_fromDate").getValueState() === "Error" ||
		//         oView.byId("id_toDate").getValueState() === "Error"
		//     ) {
		//         oView.byId("idfiscalyear").setValueState("Error");
		//     } else {
		//         oView.byId("idfiscalyear").setValueState("None");
		//         vDateFlag = 1;
		//     }
		// };

		//================================================================================================================//
		//--------------------------------Date Validation-----------------------------------------------------------------//
		//================================================================================================================//
		fndatevalidate: function() {
			var oView = this.getView();
			var flag;
			var begda = oView.byId("id_creationdatefrm").getValue();
			var endda = oView.byId("id_creationdateend").getValue();

			var date1 = oView.byId("id_creationdatefrm").getDateValue();
			var date2 = oView.byId("id_creationdateend").getDateValue();
			var oFyear = oView.byId("idfiscalyear").getValue();

			if (begda !== "" || endda !== "") {
				flag = 1;

				if (begda !== "" && endda !== "") {
					if (date1 < date2) {
						oView.byId("id_creationdatefrm").setValueState("None");
						oView.byId("id_creationdateend").setValueState("None");
						vDateFlag = 1;
					} else if (date1 > date2) {
						oView.byId("id_creationdatefrm").setValueState("Error");
						oView.byId("id_creationdateend").setValueState("Error");
						oView.byId("id_creationdatefrm").setValueStateText("Enter valid Date");
						oView.byId("id_creationdateend").setValueStateText("Enter valid Date");
						flag = 0;
					} else if (date1 === null) {
						oView.byId("id_creationdatefrm").setValueState("Error");
						oView.byId("id_creationdatefrm").setValueStateText("Enter valid Date");
					} else if (date2 === null) {
						oView.byId("id_creationdateend").setValueState("Error");
						oView.byId("id_creationdateend").setValueStateText("Enter valid Date");
					}
				}

				// Success callback for OData read
				var fnDate = function(oData) {
					var firstdate = oData.Begda;
					var lastdate = oData.Endda;

					var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
						pattern: "yyyyMMdd"
					});
					firstdate = oDateFormat.format(new Date(firstdate));
					lastdate = oDateFormat.format(new Date(lastdate));
					begda = oDateFormat.format(new Date(begda));
					endda = oDateFormat.format(new Date(endda));

					if (begda) {
						if (begda >= firstdate && begda <= lastdate) {
							if (flag === 1) {
								oView.byId("id_creationdatefrm").setValueState("None");
								vDateFlag = 1;
							}
						} else {
							oView.byId("id_creationdatefrm").setValueState("Error");
							oView.byId("id_creationdatefrm").setValueStateText("Enter Date within fiscal year");
						}
					}

					if (endda) {
						if (endda >= firstdate && endda <= lastdate) {
							if (flag === 1) {
								oView.byId("id_creationdateend").setValueState("None");
								vDateFlag = 1;
							}
						} else {
							oView.byId("id_creationdateend").setValueState("Error");
							oView.byId("id_creationdateend").setValueStateText("Enter Date within fiscal year");
						}
					}

					if (
						oView.byId("id_creationdatefrm").getValueState() === "Error" ||
						oView.byId("id_creationdateend").getValueState() === "Error"
					) {
						oView.byId("idfiscalyear").setValueState("Error");
					} else {
						oView.byId("idfiscalyear").setValueState("None");
						vDateFlag = 1;
					}
				};

				var fnFail = function() {
					sap.m.MessageToast.show("Fail to read");
				};

				// Call OData
				oModel.read("/DatesSet('" + oFyear + "')", {
					success: fnDate,
					error: fnFail
				});

			} else {
				oView.byId("id_creationdatefrm").setValueState("None");
				oView.byId("id_creationdateend").setValueState("None");
			}
		},
			fn_fulfillrefresh: function() {
			location.reload();
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
    const sTableName = "/EXL/FSC_AGRE";

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
    const sUserId = oView.getModel("jsUserName").getProperty("/Userid");

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
const sTableName = "/EXL/FSC_AGRE";
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
    var sReportName = "/EXL/FSC_AGRE"; // Hardcoded Tabid

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


		// 	fn_updatePaginatedModel: function() {
		// 	var oFooter = this.getView().byId("idPaginationFooter");
		// 	var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
		// 	var iEnd = iStart + this.iRowsPerPage;

		// 	var pageData = this.aFilteredData.slice(iStart, iEnd);
		// 	var oJsonArray = { "WRLLIST": oDataResp.results || [] };
		//                  // var oJSONModel = new sap.ui.model.json.JSONModel(oJsonArray);
		//                  // oView.setModel(oJSONModel, "WRL");
		// 	var pagedModel = new sap.ui.model.json.JSONModel(oJsonArray);
		// 	pagedModel.setData(pageData);

		// 	this.getView().setModel(pagedModel, "WRL");
		// 	if (pageData.length > 0) {
		// 		oFooter.setVisible(true);
		// 		this.fn_renderPageNumbers();
		// 	} else {
		// 		oFooter.setVisible(false);
		// 	}
		// },
		fn_updatePaginatedModel: function() {
			var oFooter = this.getView().byId("idPaginationFooter");

			// Calculate slice indexes
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			// Slice the filtered data for the current page
			var pageData = this.aFilteredData.slice(iStart, iEnd);

			// Wrap it in the same structure expected by the table binding
			var oPagedData = {
				"WRLLIST": pageData
			};

			// Create JSON model with paged data
			var pagedModel = new sap.ui.model.json.JSONModel(oPagedData);
			this.getView().setModel(pagedModel, "WRL");

			// Show or hide footer based on data
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
		},
		//  search filter
		onSearchFieldsChange: function(oEvent) {
			var oMCB = oEvent.getSource();

			// Remove all tokens so selected items don't appear
			// oMCB.removeAllTokens();
			var aSelectedItems = oEvent.getSource().getSelectedItems();

			const labelMap = {
				Qid: "Queue Id",
				Name1: "Vendor",
				Invno: "Invoice No",
				Asssignedto: "Assigned",
				Bukrs: "Plant"
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
				this.aFullData = [];
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

			this.iAutoParkCurrentPage = 1;
			this.fn_updatePaginatedModel();
		},

		fn_Reassign: function() {
			QueueIDs = [];

			var myTable = this.getView().byId("id_reassignTable");

			var myTableRows = myTable.getRows();
			var selectedIndeices = myTable.getSelectedIndices();
			var message = "";

			var Asgn_Queue = [];

			if (selectedIndeices.length != 0) {

				var model = this.getView().getModel("WRL");
				var wrlData = model.getData().WRLLIST;
				for (var i = 0; i < selectedIndeices.length; i++) {

					var data = wrlData[selectedIndeices[i]];

					QueueIDs.push(data.Qid);

					if (data.Assignedto === "") {

						Asgn_Queue.push(parseInt(data.Qid));

						message = "Please select the Assigned Agent Row";

					}
				}

				if (message != "") //Checking for Message
				{
					sap.m.MessageBox.error(Asgn_Queue + " doesn't contains Agent" + '\n' + message);
				} else if (Asgn_Queue.length === 0) {
					this.fn_Assignfrag();
				}

			} else {
				sap.m.MessageBox.warning("Please Select the Row");
			}
			// this.getView().byId('id_more_btn').removeStyleClass('cl_more_glow');
			// this.getView().byId('id_more_btn').addStyleClass('cl_more');
			// this.MoreSetting.close();

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
		fn_Userfrag: function(oEvent) {
			var that = this;
			if (!that.Userfrag) {
				that.Userfrag = sap.ui.xmlfragment("FSC360NEW.fragment.UserName", that);
				that.getView().addDependent(that.Userfrag);
			}
			that.Userfrag.open();
		},
		fn_UserName_Confrm: function(oEvent) {
			// var name = oEvent.getParameter('selectedItem').getTitle();
			// var desc = oEvent.getParameter('selectedItem').getDescription();
			// sap.ui.getCore().byId("id_agent").setValue(name);
			// oEvent.getSource().getBinding("items").filter([]); 
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("jsUserName");
				var sTitle = oContext.getProperty("Bname");
				sap.ui.getCore().byId("id_agent").setValue(sTitle);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		fn_UserName_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Bname", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("NameLast", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
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
						// sap.m.MessageBox.success(sAgent + " Successfully Assigned");
						// oController.Assignfrag.close();
						// oController.fn_LoadData();
						// sap.ui.getCore().byId("id_agent").setValue("");
						// oController.fn_clear();
						// oController.fn_action();
						// oGlobalBusyDialog.close();
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
							oController.fnSearchPress();
						}, 3000);

						// oController.Assignfrag.close();
						if (oController.Assignfrag) {
							oController.Assignfrag.close();
							oController.Assignfrag.destroy();
							oController.Assignfrag = null;
						}
						oController.fn_LoadData();
						// sap.ui.getCore().byId("id_agent").setValue("");
						// oController.fn_clear();
						// oController.fn_action();
						oGlobalBusyDialog.close();
					},
					error: function() {
						sap.m.MessageBox.error("Error");
						oController.Assignfrag.close();
						oGlobalBusyDialog.close();
					}
				});

			} else {
				sap.m.MessageBox.error("Please Select the Agent");
			}
		},
		fnclearbutt: function() {
			var oView = this.getView();
    var oMultiComboBox = oView.byId("id_search_fields");
    var oSearchField = oView.byId("id_search_field");

    // Clear MultiComboBox selections
    oMultiComboBox.setSelectedKeys([]);
    oMultiComboBox.setPlaceholder("Select fields"); // reset placeholder

    // Clear search field value + placeholder
    oSearchField.setValue("");
    oSearchField.setPlaceholder("Search by filter");
    
			// Reset ComboBoxes
			var aComboBoxes = [
				"id_companycode",
				"id_profit2",
				"idplant",
				"idVendor",
				"id_transactiontyp",
				"id_Statuss",
				"id_Agent",
				"id_priority"
			];
			aComboBoxes.forEach(function(sId) {
				var oCombo = oView.byId(sId);
				if (oCombo) {
					oCombo.setSelectedKey("");
					oCombo.setValue("");
				}
			});

			// Reset Input Fields
			["idfiscalyear"].forEach(function(sId) {
				var oInput = oView.byId(sId);
				if (oInput) {
					oInput.setValue("");
				}
			});

			// Reset DatePickers
			["id_creationdatefrm", "id_creationdateend"].forEach(function(sId) {
				var oDate = oView.byId(sId);
				if (oDate) {
					oDate.setDateValue(null);
				}
			});

			// Reset table data safely
			this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;

			if (typeof this.fn_updatePaginatedModel === "function") {
				this.fn_updatePaginatedModel();
			}

			var oTitle = oView.byId("LabTabWRATitle");
			if (oTitle) {
				oTitle.setText("0");
			}
		}

		

	});

});