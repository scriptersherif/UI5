sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"FSC360NEW/model/formatter",
	"sap/ui/model/Filter"
], function(Controller, formatter, Filter) {
	"use strict";
	var inputId1, oIndices, vIndexBus, vIndexCurr, oCompany,
		sQuery = "",
		oTotal, vdate, oADV, oDocdate, vCount, oModel1, jsonBind,
		oReqAdv, oJSONMOdel2, validate, vendor1, oController, vendorvalidate, jsonItm, oPoN,
		oSelectedItem, oBalance, oPaysts, PoItem, vendor, PoFrom, PoTo, oTable;
	var oShellText, oControllerV, vVendor;

	return Controller.extend("FSC360NEW.controller.AdvanceApp", {
		_sortState: {
			Ebeln: false // default ascending
		},
		formatter: formatter,
		onInit: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			this.getView().setModel(oModel, "VP");
			var oViewData = this.getView().getViewData();
			if (oViewData && oViewData.appStateModel) {
				this.getView().setModel(oViewData.appStateModel, "appState");
			}
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
			this.fn_LoadInitial();
			// this.fnGetF4Help();
			this.fn_getVendor();
			this.fn_loadCompanyCodes();
			var oView = this.getView();

			const oEmptyModel = new sap.ui.model.json.JSONModel({
				results: []
			});
			this.getView().setModel(oEmptyModel, "VendorAdv");
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", true);
			oView.setModel(oModel, "VP");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("AdvanceApp").attachPatternMatched(this.Fn_RouteMatched, this);
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");
			
				var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");

		},
		// fn_loadCompanyCodes: function() {
		// 	var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
		// 	var that = this;

		// 	oModel.read("/StatusFlowSet", {
		// 		filters: [
		// 			new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "BUKRS")
		// 		],
		// 		success: function(oData) {
		// 			var oJSONModel = new sap.ui.model.json.JSONModel({
		// 				Company: oData.results
		// 			});
		// 			that.getView().setModel(oJSONModel, "JSCCode");
		// 			// sap.ui.getCore().byId("In_Non_CompCode").bindItems({ // commented by Manosankari
		// 			// 	path: "JSCCode>/Company",
		// 			// 	length: oData.results.length,
		// 			// 	template: new sap.ui.core.ListItem({
		// 			// 		key: "{JSCCode>Bukrs}",
		// 			// 		text: "{JSCCode>Bukrs}",
		// 			// 		additionalText: "{JSCCode>Butxt}"
		// 			// 	})
		// 			// });
		// 		},
		// 		error: function() {
		// 			// sap.m.MessageBox.error("Error loading company codes");
		// 				that.openErrorDialog('Error loading company codes');
		// 		}
		// 	});
		// },
		fnliveCompanynon: function(oEvent) {
			sap.ui.getCore().byId("In_Non_CompCode").setValueState();
			sap.ui.getCore().byId("In_Non_CompCode").setValueStateText();
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();

			var oFilter = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_Non_CompCode").setValueStateText("Invalid Company Code").focus();
				sap.ui.getCore().byId("In_Non_CompCode").setValueState("Error");
			} else {
				sap.ui.getCore().byId("In_Non_CompCode").setValueStateText();
				sap.ui.getCore().byId("In_Non_CompCode").setValueState();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oEmptyModel, "MProfitCenter");
			sap.ui.getCore().byId("In_ProfitCe_nont").setValue("");
			this.fn_prctr();
			this.fnBusinessPlace("NON");
            this.fnSectioncode("NON"); // Added by L.Jawahar - 10.11.2025
		},
		
	fnliveCompany: function(oEvent) {
    var oCombo = oEvent.getSource();
    var oSelectedItem = oEvent.getParameter("selectedItem");

    // Clear previous state
    oCombo.setValueState("None");
    oCombo.setValueStateText("");

    if (oSelectedItem) {
        var oValue = oSelectedItem.getKey(); // or getText(), based on your need
        oValue = oValue.toUpperCase();

        this._liveCompanyCode = oValue; // store for later
        this.fn_reqPo_frag(oValue);
    } else {
        console.warn("No item selected in company code combo box.");
    }
},

		//=====================================================
		//  Function toget Special GL indicators
		//====================================================
		fnSpGlList: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var fnSpGl = function(oData, oResponse) {
				var aSpGl = {
					"SpGl": oData

				};
				var oSpGlModel = new sap.ui.model.json.JSONModel();
				oSpGlModel.setData(aSpGl);
				oView.setModel(oSpGlModel, "SPG");

			};
			var fnFail = function(oResponse) {};
			oModel.read("/SH_SPLGLSet", null, null, false, fnSpGl, fnFail);

		},
		//=========================================================
		//  Function to get GL accounts
		//========================================================
		fnGLList: function() {
			var oView = this.getView();
			var oModel = this.getView().getModel("VP");
			var fnSuccess = function(oData, oResponse) {
				var oGLPoModel = new sap.ui.model.json.JSONModel();
				var aGL = {
					"GL": oData
				};
				oGLPoModel.setData(aGL);
				oView.setModel(oGLPoModel, "GL");

			};
			var fnFail = function(oResponse) {

			};

			oModel.read("/SH_GLSet", null, null, false, fnSuccess, fnFail);
		},
		//========================================================
		//  function to get list of currency
		//========================================================
		fnCurrencyList: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var fnCurrencySucc = function(oData, oResponse) {
				var aCurr = {
					"Currency": oData

				};
				var oCurrencyModel = new sap.ui.model.json.JSONModel();
				oCurrencyModel.setData(aCurr);
				oView.setModel(oCurrencyModel, "CUR");

			};
			var fnFail = function(oResponse) {};
			oModel.read("/SH_CURRSet", null, null, false, fnCurrencySucc, fnFail);
		},
		//==========================================================
		//  Function to get List of tax code
		//=========================================================
		fnTaxCodeList: function(oEve) {

			if (oEve == "PO") { /* Added by Ashapriya on 08.07.2021*/
				var vCompCc = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			} else {
				var vCompCc = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			}
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var fnSuccess = function(oData, oResponse) {
				var oTaxCodeModel = new sap.ui.model.json.JSONModel();
				var aTaxCode = {
					"TaxCode": oData
				};
				oTaxCodeModel.setData(aTaxCode);
				oView.setModel(oTaxCodeModel, "TC");
			};
			var fnFail = function(oResponse) {

			};
		
			oModel.read("/TaxcodeSet?$filter=(Bukrs eq '" + vCompCc + "')", null, null, true, fnSuccess, fnFail);
		},

		fn_prctr: function() {
			var v_compcode1 = oCompany;
			
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
					
					}

					// Bind result list to model
					var JsonoModelProfCen = new sap.ui.model.json.JSONModel();
					JsonoModelProfCen.setData(aResults);
					that.getView().setModel(JsonoModelProfCen, "MProfitCenter");
				},
				error: function(err) {
					// MessageBox.error("Error while fetching Profit Centers");
						that.openErrorDialog('Error while fetching Profit Centers');
				
				}
			});
		},
		fnBusinessAreaList: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var fnSuccess = function(oData, oResponse) {
				var oBusAreaoModel = new sap.ui.model.json.JSONModel();
				var aBusArea = {
					"BUSA": oData
				};
				oBusAreaoModel.setData(aBusArea);
				oView.setModel(oBusAreaoModel, "BA");
				//     }
			};
			var fnFail = function() {

			};
			oModel.read("/SH_BUSAREASet", null, null, false, fnSuccess, fnFail);

		
		},
		fnchangeReqAmt: function(oEvent) {
			var vIndexVal = oEvent.getSource().getParent().getBindingContext("PO").sPath;
			// safer way: split instead of substring (works for >9 rows)
			var index = parseInt(vIndexVal.split("/")[2], 10);

			var oTab = sap.ui.getCore().byId("id_tab_po");
			var oValue = oEvent.getParameter("value");

			var arr = oTab.getModel("PO").getData().Item[index];
			var oValAmt = arr.NetPrice - arr.TotalAmt;

			var oCell = oTab.getRows()[index].getCells()[5]; // required amount cell
			var oReqAmtField = sap.ui.getCore().byId("id_RequiredAmtPO");

			// --- Validation 1: not exceeding remaining amount
			if (parseInt(oValue) > parseInt(oValAmt)) {
				// oCell.setValueState("Error");
			
				oCell.setTooltip("The Down Payment Amount should not exceed " + oValAmt);
				// oReqAmtField.setValueState("Error");

				sap.m.MessageBox.error("The Down Payment Amount should not exceed " + oValAmt);
					
				return;
			}

			// --- Validation 2: not exceeding PO NetPrice
			if (parseInt(oValue) > parseInt(arr.NetPrice)) {
				// oCell.setValueState("Error");
				oCell.setTooltip("The Down Payment Amount should not exceed the Net Amount");
				// oReqAmtField.setValueState("Error");

				// sap.m.MessageBox.error("The Down Payment Amount should not exceed the Net Amount");
					this.openErrorDialog('The Down Payment Amount should not exceed the Net Amount');
				return;
			}
		
			oCell.setTooltip("");
		
		},
		fn_sortByPo: function() {
			const that = this;

			if (!that.aFullVendorAdvData || that.aFullVendorAdvData.length === 0) {
				sap.m.MessageToast.show("No data to sort");
				return;
			}

			const sField = "Ebeln";
			const bDescending = that._sortState[sField];

			that.aFullVendorAdvData.sort(function(a, b) {
				let v1 = a[sField] || "";
				let v2 = b[sField] || "";

				if (!isNaN(v1) && !isNaN(v2)) {
					return bDescending ? (v2 - v1) : (v1 - v2);
				}

				v1 = v1.toString().toLowerCase();
				v2 = v2.toString().toLowerCase();

				if (v1 < v2) return bDescending ? 1 : -1;
				if (v1 > v2) return bDescending ? -1 : 1;
				return 0;
			});

			that._sortState[sField] = !bDescending;
			that.iCurrentPage = 1;
			that.updateVendorAdvPaginatedModel();

			sap.m.MessageToast.show(`Sorted by ${sField} (${bDescending ? "Desc" : "Asc"})`);
		},
		Fn_RouteMatched: function() {
			this.fnClear();
		},
		_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".formInputB1").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});

			$view.find(".cl_combo_transBar").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});
		},
		fn_LoadInitial: function() {

			var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
			if (oKeyDataModel) {
				var oData = oKeyDataModel.getData();

				var oJSONUserName = new sap.ui.model.json.JSONModel(oData);

				this.getView().setModel(oJSONUserName, "JSusername");
			}

		},
		fnvendorval: function() {
			var oController = this;
			var oView = this.getView();
			var oModel = oView.getModel("VP");

			var fnsucval = function(oData, oResponse) {
				vendorvalidate = oData.Error;
				oController.vendorlevel();
				var I = 'V';
				oController.vendornonpo(I);
			};
			var fnFail = function(oResponse) {
			
			};
		
			var vVendor = this.vendorNumber;
			oModel.read("/VendorlistSet(Lifnr='" + vVendor + "')",

				null, null, true, fnsucval, fnFail);
		},

		vendorlevel: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			vendor = oView.byId("In_Vendor").getValue();

			if (!this.dialog4) {
				this.dialog4 = sap.ui.xmlfragment("FSC360NEW.fragment.AdvanceRequestNPO", this);
				oView.addDependent(this.dialog4);

				// Attach click logic after dialog is opened
				this.dialog4.attachAfterOpen(function() {
					console.log("Dialog opened, fragment DOM is ready.");

					var oVBox = sap.ui.getCore().byId("idFileBox");
					var oFileUploader = sap.ui.getCore().byId("id_image_non");

					console.log("VBox:", oVBox);
					console.log("FileUploader:", oFileUploader);

					if (!oVBox || !oFileUploader) {
						console.error("VBox or FileUploader not found in DOM.");
						return;
					}

					// Attach click event to VBox
					oVBox.$().off("click").on("click", function() {
						console.log("VBox clicked!");
						var fileInput = document.getElementById(oFileUploader.getId() + "-fu");
						console.log("File Input:", fileInput);

						if (fileInput) {
							fileInput.click();
						} else {
							console.error("File input element not found.");
						}
					});
				});
			}

			if (vendor && vendorvalidate == "Y") {
				// Clear all form fields before opening dialog
				sap.ui.getCore().byId("In_NonPo_Coment").setValue("");
				sap.ui.getCore().byId("In_NonPo_ReqAdv").setValue("");
				sap.ui.getCore().byId("In_ReffNPo").setValue("");
				sap.ui.getCore().byId("In_ProfitCe_nont").setValue("");
				sap.ui.getCore().byId("In_Assign_non").setValue("");
				sap.ui.getCore().byId("In_Specialnon").setValue("A");
				sap.ui.getCore().byId("In_TaxCodeNon").setValue("V0");
				sap.ui.getCore().byId("id_postDatenon").setDateValue(null);
				sap.ui.getCore().byId("id_DueOnDatenon").setDateValue(null);
				sap.ui.getCore().byId("In_BlPlacenon").setValue("");
				sap.ui.getCore().byId("id_image_non").setValue("");

				// Open the dialog
				this.dialog4.open();
				this.fnDocTypeNPO();
				// Fetch Doc Type
				oModel.read("/SH_doctypeSet", null, null, true, function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].Blart == "ZK") {
							sap.ui.getCore().byId("In_Po_DocTypenon").setValue(oData.results[i].Blart);
							break;
						}
					}
				}, function(oResponse) {
					console.error("Failed to fetch SH_doctypeSet", oResponse);
				});

			} else {
				oView.byId("In_Vendor").setValueState("Error");
				sap.m.MessageToast.show("Enter valid Vendor", {
					duration: 2000,
					width: "25rem",
					my: "center bottom",
					at: "center bottom",
					of: window,
					offset: "0 0",
					collision: "fit fit",
					autoClose: true,
					animationTimingFunction: "ease",
					animationDuration: 1000,
					closeOnBrowserNavigation: true
				});
			}
		},
		fnDocTypesList: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");

			var fnSuccess = function(oData, oResponse) {
				var oDocTypeoModel = new sap.ui.model.json.JSONModel();
				var aDocType = {
					"DocType": oData
				};
				oDocTypeoModel.setData(aDocType);
				oView.setModel(oDocTypeoModel, "DT");

			};
			var fnFail = function(oResponse) {

			};

			oModel.read("/SH_doctypeSet", null, null, true, fnSuccess, fnFail);
		},
		fnDocTypeNPO: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");

			var fnSuccess = function(oData, oResponse) {
				var oDocTypeoModel = new sap.ui.model.json.JSONModel();
				var aDocType = {
					"DocType": oData
				};
				oDocTypeoModel.setData(aDocType);
				oView.setModel(oDocTypeoModel, "DTN");

			};
			var fnFail = function(oResponse) {

			};

			oModel.read("/SH_doctypeSet", null, null, true, fnSuccess, fnFail);

		},
		fnBusinessPlace: function(type) {
			var oView = this.getView();
			var oModel = oView.getModel("VP");

			// Decide which input to read based on type
			var VComp = "";
			if (type === "NON") {
				VComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			} else if (type === "PO") {
				VComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			} else {
				console.error("Invalid type passed to fnBusinessPlace:", type);
				return; // Exit if type is invalid
			}

			VComp = VComp.toUpperCase();

			var fnSuccess = function(oData) {
				var oBusPoModel = new sap.ui.model.json.JSONModel({
					BUSP: oData
				});
				oView.setModel(oBusPoModel, "BP");
			};

			var fnFail = function(oResponse) {
				console.error("Business Place OData read failed:", oResponse);
			};

			oModel.read("/SH_BUSPSet?$filter=(Bukrs eq '" + VComp + "')", null, null, false, fnSuccess, fnFail);
		},
		
		// Added by L.Jawahar - start
		fnSectioncode: function(type) {
			var oView = this.getView();
			var oModel = oView.getModel("VP");

			// Decide which input to read based on type
			var VComp = "";
			if (type === "NON") {
				VComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			} else if (type === "PO") {
				VComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			} else {
				console.error("Invalid type passed to fnSectioncode:", type);
				return; // Exit if type is invalid
			}
			
			// var Vbp = sap.ui.getCore().byId("In_SectionCode").getValue();

			VComp = VComp.toUpperCase();

			var fnSuccess = function(oData) {
				var osecPoModel = new sap.ui.model.json.JSONModel({
					Section: oData
				});
				oView.setModel(osecPoModel, "SCC");
			};

			var fnFail = function(oResponse) {
				console.error("Section code OData read failed:", oResponse);
			};

			oModel.read("/SH_SECCODESet?$filter=(Bukrs eq '" + VComp + "')", null, null, false, fnSuccess, fnFail);
		},
		// End
		
		vendornonpo: function(oEvent) {
			var that = this;
			$.ajax({
				type: "GET",
				url: "/sap/opu/odata/WITS/IV_REPORTS_SRV/Search_HelpSet?$filter=SrchTyp eq 'BUKRS'",
				dataType: "json",
				async: true, // default is true, avoid false
				success: function(data, textStatus, jqXHR) {
					if (data && data.d && data.d.results && data.d.results.length > 0) {
						oCompany = data.d.results[0].Ucompany;
						console.log("Company Code:", oCompany);
						that.fn_prctr();
					} else {
						console.warn("No data found for BUKRS search help.");
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error("Failed to fetch data:", textStatus, errorThrown);
				},
				complete: function() {
					console.log("AJAX call completed.");
				}
			});

			var I = oEvent;
			var oView = this.getView();
			var oControllerV = this;
			var oModel = oView.getModel("VP");
			var ven = oView.byId("In_Vendor").getValue();
			var vSgl = sap.ui.getCore().byId("In_Specialnon").getValue(); //Added by Asha on 29.08.2022
			var vEbeln = "";
			var fnFail = function(oResponse) {
			};
			var fnonpo = function(oData, oResponse) {

				//        var vnonpo  = (oData.Wrbtr).toFixed(2);
				if (I == 'V') {
					sap.ui.getCore().byId("In_NonPo_Vadv").setValue(oData.Wrbtr);
					//sap.ui.getCore().byId("vadvidcur").setText(oData.Waers);
				} else if (I == 'R') {
					sap.ui.getCore().byId("In_NonPo_Vadv").setValue(
						oData.Wrbtr);
				} else if (I == 'S') {
					var vnonpo = oData.Wrbtr;
					if (vnonpo != "") {
						vnonpo = parseFloat(vnonpo).toFixed(2);

					} else {
						vnonpo = vnonpo;
						oView.byId("nonpo").setValue(vnonpo);
						oView.byId("nonpocurr").setValue(oData.Waers);
					}
				}
				sap.ui.getCore().byId("In_NonPo_Country").setValue(oData.Landx);
				sap.ui.getCore().byId("In_NonPo_City").setValue(oData.Ort01);
				sap.ui.getCore().byId("In_NonPo_Region").setValue(oData.Regio);
				sap.ui.getCore().byId("In_Vendor_NonPo").setValue(oData.Name1);
				sap.ui.getCore().byId("In_Periodnon").setValue(oData.Monat);
				sap.ui.getCore().byId("In_NonPo_GL").setValue(oData.Hkont); /* Added by Asha on 28.09.2021*/
				// sap.ui.getCore().byId("In_Non_CompCode").setValue(oData.Bukrs);
				sap.ui.getCore().byId("In_Non_CompCode").setValue(oCompany); //added by Dinesh Saravanan R 23.07.2021
				sap.ui.getCore().byId("id_postDatenon").setDateValue(new Date()); //added by Dinesh Saravanan R 23.07.2021
				sap.ui.getCore().byId("In_Po_DocTypenon").setValue("KZ");
				this.fnBusinessPlace("NON");
				this.fnSectioncode("NON"); //Added by L.Jawahar
				this.fnSpGlList();
				this.fnGLList();
				this.fnCurrencyList();

			}.bind(this);
			oModel.read("Vendor_addressSet(Lifnr='" + ven + "',Umskz='" + vSgl + "')", null, null, true, fnonpo, fnFail); //Changed by Asha on 29.08.2022

		},
		fnCurrencyList: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var fnCurrencySucc = function(oData, oResponse) {
				var aCurr = {
					"Currency": oData

				};
				var oCurrencyModel = new sap.ui.model.json.JSONModel();
				oCurrencyModel.setData(aCurr);
				oView.setModel(oCurrencyModel, "CUR");

			};
			var fnFail = function(oResponse) {};
			oModel.read("/SH_CURRSet", null, null, false, fnCurrencySucc, fnFail);
		},
		fnAdvanceNpoPress: function() {
			if (!this._AdvanceNpo) {
				this._AdvanceNpo = sap.ui.xmlfragment("FSC360NEW.fragment.AdvanceRequestNPO", this);
				this.getView().addDependent(this._AdvanceNpo);
			}
			this._AdvanceNpo.open();
		},
	

		// fn_reqPo_frag: function(sLiveCompanyCode) {
		// 	var oView = this.getView();
		// 	var oModel = oView.getModel("VP");
		// 	var vVendor = this.vendorNumber;

		// 	var oTabPoLen = oView.byId("id_tab").getSelectedIndices().length;
		// 	oIndices = oView.byId("id_tab").getSelectedIndices();
		// 	var voController = this;
		// 	var oTabid = oView.byId("id_tab");

		// 	var SelectedRows = [];
		// 	var sCompanyCode = null;

		// 	/** triggered from live change with a company code */
		// 	if (typeof sLiveCompanyCode === "string" && sLiveCompanyCode.trim() !== "") {
		// 		sCompanyCode = sLiveCompanyCode.trim();
		// 		this.fn_prctr_po(sCompanyCode);
		// 	}

		// 	if (oTabPoLen !== 0) {
		// 		if (SelectedRows.length === 0) { // Only extract from table when not overridden
		// 			var Tabdata = oTabid.getModel("VendorAdv").getData().results;
		// 			for (var i = 0; i < oTabPoLen; i++) {
		// 				SelectedRows.push(Tabdata[oIndices[i]]);
		// 			}
		// 		}

		// 		sCompanyCode = sCompanyCode || SelectedRows[0].Bukrs;

		// 		// all fn_prctr with the company code ONLY ONCE
		// 		this.fn_prctr_po(sCompanyCode);

		// 		// ==== Open fragment only once ====
		// 		if (!this._oDialog) {
		// 			this._oDialog = sap.ui.xmlfragment("FSC360NEW.fragment.AdvanceReqPo", this);
		// 			this.getView().addDependent(this._oDialog);

		// 			this._oDialog.attachAfterOpen(function() {
		// 				var oVBox = sap.ui.getCore().byId("idFileBox");
		// 				var oFileUploader = sap.ui.getCore().byId("id_image");

		// 				if (!oVBox || !oFileUploader) return;

		// 				oVBox.$().off("click").on("click", function() {
		// 					var fileInput = document.getElementById(oFileUploader.getId() + "-fu");
		// 					if (fileInput) fileInput.click();
		// 				});
		// 			});
		// 		}

		// 		this._oDialog.open();

		// 		// ========= Clear Fields =========
		// 		sap.ui.getCore().byId("cmmi").setValue("");
		// 		sap.ui.getCore().byId("In_ReffPo").setValue("");
		// 		sap.ui.getCore().byId("In_Assign").setValue("");
		// 		sap.ui.getCore().byId("In_Special").setValue("A");
		// 		sap.ui.getCore().byId("id_postDate").setDateValue(null);
		// 		sap.ui.getCore().byId("In_SectionCode").setValue("");

		// 		var oFileUploader = sap.ui.getCore().byId("id_image");
		// 		if (oFileUploader) {
		// 			oFileUploader.setValue("");
		// 			oFileUploader.setValueState(sap.ui.core.ValueState.None);
		// 		}

		// 		/** ========= Fetch Doc Type ========= */
		// 		var fnSuccessDocType = function(oData) {
		// 			for (var i = 0; i < oData.results.length; i++) {
		// 				if (oData.results[i].Blart === "ZK") {
		// 					sap.ui.getCore().byId("In_Po_DocType").setValue(oData.results[i].Blart);
		// 				}
		// 			}
		// 		};

		// 		oModel.read("/SH_doctypeSet", null, null, true, fnSuccessDocType, function(oResponse) {
		// 			console.error("Failed to fetch SH_doctypeSet", oResponse);
		// 		});

		// 		/** ========= Fetch Vendor Details ========= */
		// 		var fnSuccessVendor = function(oData) {
		// 			sap.ui.getCore().byId("In_Po_GL").setValue(oData.results[0].Hkont);
		// 			sap.ui.getCore().byId("In_Po_Country").setValue(oData.results[0].Landx);
		// 			sap.ui.getCore().byId("In_Po_Vendor").setValue(oData.results[0].Name1);
		// 			sap.ui.getCore().byId("In_Period").setValue(oData.results[0].Monat);
		// 			sap.ui.getCore().byId("In_Po_City").setValue(oData.results[0].Ort01);
		// 			sap.ui.getCore().byId("In_Po_Region").setValue(oData.results[0].Regio);
		// 			sap.ui.getCore().byId("In_Po_CompCode").setValue(sCompanyCode);
		// 			sap.ui.getCore().byId("In_ProfitCet").setValue(SelectedRows[0].Prctr);
		// 			sap.ui.getCore().byId("id_postDate").setDateValue(new Date());
		// 			sap.ui.getCore().byId("In_Po_DocType").setValue("KZ");

		// 			var jsonArrayItem = {
		// 				"Item": []
		// 			};
		// 			for (var i = 0; i < SelectedRows.length; i++) {
		// 				jsonArrayItem.Item.push({
		// 					Ebeln: SelectedRows[i].Ebeln,
		// 					PoItem: SelectedRows[i].PoItem,
		// 					Material: SelectedRows[i].Material,
		// 					NetPrice: SelectedRows[i].NetPrice,
		// 					BurArea: SelectedRows[i].Gsber,
		// 					tAXcODE: SelectedRows[i].Taxcode
		// 				});
		// 			}

		// 			var oJosonSelectedPoModel = new sap.ui.model.json.JSONModel();
		// 			oJosonSelectedPoModel.setData(jsonArrayItem);
		// 			sap.ui.getCore().byId("id_tab_po").setModel(oJosonSelectedPoModel, "PO");

		// 			this.fnBusinessPlace("PO");
		// 			this.fnSpGlList();
		// 			this.fnGLList();
		// 			this.fnCurrencyList();
		// 			this.fnBusinessAreaList();
		// 		}.bind(this);

		// 		oModel.read("/VendorAddSet?$filter=(Lifnr eq '" + vVendor + "')&$expand=NavPoAdvance,NavPoItem", {
		// 			success: fnSuccessVendor,
		// 			error: function(oResponse) {
		// 				console.error("Failed to fetch VendorAddSet", oResponse);
		// 			}
		// 		});

		// 	} else {
		// 		sap.m.MessageToast.show("Select at least one PO to generate QID ");
		// 	}
		// },
		
		fn_reqPo_frag: function(sLiveCompanyCode) {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var vVendor = this.vendorNumber;
 
			var oTabPoLen = oView.byId("id_tab").getSelectedIndices().length;
			oIndices = oView.byId("id_tab").getSelectedIndices();
			var voController = this;
			var oTabid = oView.byId("id_tab");
 
			var SelectedRows = [];
			var sCompanyCode = null;
 
			/** triggered from live change with a company code */
			if (typeof sLiveCompanyCode === "string" && sLiveCompanyCode.trim() !== "") {
				sCompanyCode = sLiveCompanyCode.trim();
				this.fn_prctr_po(sCompanyCode);
			}
 
			if (oTabPoLen !== 0) {
				if (SelectedRows.length === 0) { // Only extract from table when not overridden
					var Tabdata = oTabid.getModel("VendorAdv").getData().results;
					for (var i = 0; i < oTabPoLen; i++) {
						SelectedRows.push(Tabdata[oIndices[i]]);
					}
				}
 
				sCompanyCode = sCompanyCode || SelectedRows[0].Bukrs;
 
				// all fn_prctr with the company code ONLY ONCE
				this.fn_prctr_po(sCompanyCode);
 
				// ==== Open fragment only once ====
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("FSC360NEW.fragment.AdvanceReqPo", this);
					this.getView().addDependent(this._oDialog);
 
					this._oDialog.attachAfterOpen(function() {
						var oVBox = sap.ui.getCore().byId("idFileBox");
						var oFileUploader = sap.ui.getCore().byId("id_image");
 
						if (!oVBox || !oFileUploader) return;
 
						oVBox.$().off("click").on("click", function() {
							var fileInput = document.getElementById(oFileUploader.getId() + "-fu");
							if (fileInput) fileInput.click();
						});
					});
				}
 
				this._oDialog.open();
 
				// ========= Clear Fields =========
				sap.ui.getCore().byId("cmmi").setValue("");
				sap.ui.getCore().byId("In_ReffPo").setValue("");
				sap.ui.getCore().byId("In_Assign").setValue("");
				sap.ui.getCore().byId("In_Special").setValue("A");
				sap.ui.getCore().byId("id_postDate").setDateValue(null);
				sap.ui.getCore().byId("In_SectionCode").setValue("");
				sap.ui.getCore().byId("In_BlPlace").setValue(""); // Added by L.Jawahar - 10.11.2025
 
				var oFileUploader = sap.ui.getCore().byId("id_image");
				if (oFileUploader) {
					oFileUploader.setValue("");
					oFileUploader.setValueState(sap.ui.core.ValueState.None);
				}
 
				/** ========= Fetch Doc Type ========= */
				var fnSuccessDocType = function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].Blart === "ZK") {
							sap.ui.getCore().byId("In_Po_DocType").setValue(oData.results[i].Blart);
						}
					}
				};
 
				oModel.read("/SH_doctypeSet", null, null, true, fnSuccessDocType, function(oResponse) {
					console.error("Failed to fetch SH_doctypeSet", oResponse);
				});
 
				/** ========= Fetch Vendor Details ========= */
				var fnSuccessVendor = function(oData) {
					sap.ui.getCore().byId("In_Po_GL").setValue(oData.results[0].Hkont);
					sap.ui.getCore().byId("In_Po_Country").setValue(oData.results[0].Landx);
					sap.ui.getCore().byId("In_Po_Vendor").setValue(oData.results[0].Name1);
					sap.ui.getCore().byId("In_Period").setValue(oData.results[0].Monat);
					sap.ui.getCore().byId("In_Po_City").setValue(oData.results[0].Ort01);
					sap.ui.getCore().byId("In_Po_Region").setValue(oData.results[0].Regio);
					sap.ui.getCore().byId("In_Po_CompCode").setValue(sCompanyCode);
					sap.ui.getCore().byId("In_ProfitCet").setValue(SelectedRows[0].Prctr);
					sap.ui.getCore().byId("id_postDate").setDateValue(new Date());
					sap.ui.getCore().byId("In_Po_DocType").setValue("KZ");
var vCurrency = "";
    if (oData.results[0].NavPoAdvance && oData.results[0].NavPoAdvance.results.length > 0) {
        vCurrency = oData.results[0].NavPoAdvance.results[0].Waers || "";
    }
					var jsonArrayItem = {
						"Item": []
					};
					for (var i = 0; i < SelectedRows.length; i++) {
						jsonArrayItem.Item.push({
							Ebeln: SelectedRows[i].Ebeln,
							PoItem: SelectedRows[i].PoItem,
							Material: SelectedRows[i].Material,
							NetPrice: SelectedRows[i].NetPrice,
							BurArea: SelectedRows[i].Gsber,
							tAXcODE: SelectedRows[i].Taxcode,
							Currency: vCurrency 
						});
					}
 
					var oJosonSelectedPoModel = new sap.ui.model.json.JSONModel();
					oJosonSelectedPoModel.setData(jsonArrayItem);
					sap.ui.getCore().byId("id_tab_po").setModel(oJosonSelectedPoModel, "PO");
 
					this.fnBusinessPlace("PO");
					this.fnSectioncode("PO"); // Added by L.Jawahar 
					this.fnSpGlList();
					this.fnGLList();
					this.fnCurrencyList();
					this.fnBusinessAreaList();
				}.bind(this);
 
				oModel.read("/VendorAddSet?$filter=(Lifnr eq '" + vVendor + "')&$expand=NavPoAdvance,NavPoItem", {
					success: fnSuccessVendor,
					error: function(oResponse) {
						console.error("Failed to fetch VendorAddSet", oResponse);
					}
				});
 
			} else {
				sap.m.MessageToast.show("Select at least one PO to process downpayment request ");
			}
		},

	
		fn_prctr_po: function(sCompanyCode) {
			var sCompanyCode1 = sCompanyCode;
			var that = this;

			$.ajax({
				url: "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/ProfitCenterSet?$filter=Bukrs eq '" + sCompanyCode1 + "'&$format=json",
				method: "GET",
				success: function(oData) {
					var aResults = (oData.d && oData.d.results) ? oData.d.results : oData.value;

					// Bind result list to model
					var oJsonProfCenModel = new sap.ui.model.json.JSONModel();
					oJsonProfCenModel.setData(aResults);
					that.getView().setModel(oJsonProfCenModel, "MProfitCenterPo");

					// Optional: prefill if only one profit center
					if (aResults && aResults.length === 1) {
						var PRCTR = aResults[0].ProfitCtr;
						var description = aResults[0].PctrName;
						var profit = PRCTR + "-" + description;
						
					}
				},
				error: function(err) {
					// MessageBox.error("Error while fetching Profit Centers");
						this.openErrorDialog('Error while fetching Profit Centers');
			
				}
			});
		},

		SubmitPOPress: function() {
			var SelectedRows = []; /*Added by Asha*/
			var oController = this;
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var vgl = sap.ui.getCore().byId("In_Po_GL").getValue();
			var vDocType = sap.ui.getCore().byId("In_Po_DocType").getValue();
			var vReff;
			var oTab = sap.ui.getCore().byId("id_tab_po");
			var oTabMain = oView.byId("id_tab");
			var vComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			var count = oIndices.length;
			var vGlAcct = sap.ui.getCore().byId("In_Po_GL").getValue();
			var vPerid = sap.ui.getCore().byId("In_Period").getValue();
			var vPostingDate = sap.ui.getCore().byId("id_postDate").getDateValue();
			var vDueOnDate = sap.ui.getCore().byId("id_DueOnDate").getDateValue(); //Added by Asha on 27.08.2022
			var vAssign = sap.ui.getCore().byId("In_Assign").getValue();
			var vBusPlace = sap.ui.getCore().byId("In_SectionCode").getValue();
			var vSection = sap.ui.getCore().byId("In_BlPlace").getValue();
			var vProfitCt = sap.ui.getCore().byId("In_ProfitCet").getValue();
			var vSpecialInd = sap.ui.getCore().byId("In_Special").getValue();
			var vProfitCentre = sap.ui.getCore().byId("In_ProfitCet").getValue(); //Added by Asha on 27.07.2021
			var vBusPlace = sap.ui.getCore().byId("In_SectionCode").getValue();
			var vSection = sap.ui.getCore().byId("In_BlPlace").getValue();
			var oImg = sap.ui.getCore().byId("id_image").getValue();
			var olevel1 = "1";
			var otri = "1234";
			var oinno = sap.ui.getCore().byId("In_ReffPo").getValue();
			var oComment = sap.ui.getCore().byId("cmmi").getValue();
			var flag;
			var dat = "2016-08-19T00:00:00";
			var oAdvamt = '1';
			var oAdvtype = "P";
			var flag = false;
			var vReqiredAmt = sap.ui.getCore().byId("id_RequiredAmtPO").getValueState();
			if (vReqiredAmt != 'Error') {
				if (vComp != "") {
					if (vBusPlace != "") {
						if (vPostingDate) { //changed by Asha on 21.07.2021
							if (vDueOnDate) {
								if (vProfitCentre) { //Condition Added by Asha on 27.07.2021
									if (vSpecialInd) {
										if (oImg) {
											if (oComment != "") {

												var vsplind = "";
												var totamnt = 0;
												for (var i = 0; i < count; i++) {
													if (oTab.getBinding().getModel().getData().Item[i].RquireAmt == "") {
														flag = true;
														break;
													}

												
													if (oTab.getBinding().getModel().getData().Item[i].Currency == "") {
														flag = true;
													}

												}
												if (flag == false) {
													if (!this._oConfirmDialog) {
														this._oConfirmDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ConfirmDialog", this);
														this.getView().addDependent(this._oConfirmDialog);
													}
													sap.ui.getCore().byId("confirmText").setText("Are you sure you want to submit record?");
													var vpo = "S"
														// Save additional info for Yes handler
													this._oConfirmDialog._vComp = vComp;
													this._oConfirmDialog._vGlAcct = vGlAcct;
													this._oConfirmDialog._PO = vpo;
													this._oConfirmDialog._oController = this; // optional, if needed

													// Open the same fragment
													this._oConfirmDialog.open();
												
												} else {
													sap.m.MessageToast.show("Please enter Required amount and Currency in all fields");
												}

											} else {
												sap.ui.getCore().byId("cmmi").setValueState(sap.ui.core.ValueState.Error);
												sap.ui.getCore().byId("cmmi").setValueStateText("Enter Comments").focus();
											}

										} else {
											var oFileUploader = sap.ui.getCore().byId("id_image");
											var sValue = oFileUploader.getValue();

											if (!sValue) {
												// No file selected
									
												// Optional: Highlight the surrounding VBox to guide the user
												$("#idFileBox").addClass("errorBox");
											} else {
												// Reset state if a file exists
												oFileUploader.setValueState(sap.ui.core.ValueState.None);
												$("#idFileBox").removeClass("errorBox");
											}
											}
									} else {
										sap.ui.getCore().byId("In_Special").setValueState(sap.ui.core.ValueState.Error);
										sap.ui.getCore().byId("In_Special").setValueStateText("Enter Special GL indicator").focus();
									}
								} else {
									sap.ui.getCore().byId("In_ProfitCet").setValueState(sap.ui.core.ValueState.Error);
									sap.ui.getCore().byId("In_ProfitCet").setValueStateText("Enter Profit Center").focus();
								}
							} else {
								sap.ui.getCore().byId("id_DueOnDate").setValueState(sap.ui.core.ValueState.Error);
								sap.ui.getCore().byId("id_DueOnDate").setValueStateText("Enter Due On Date").focus();
							}
						} else {
							sap.ui.getCore().byId("id_postDate").setValueState(sap.ui.core.ValueState.Error);
							sap.ui.getCore().byId("id_postDate").setValueStateText("Enter Posting Date").focus();
						}
					} else {
						sap.ui.getCore().byId("In_BlPlace").setValueState(sap.ui.core.ValueState.Error);
						sap.ui.getCore().byId("In_BlPlace").setValueStateText("Enter Section Code").focus();

						sap.ui.getCore().byId("In_SectionCode").setValueState(sap.ui.core.ValueState.Error);
						sap.ui.getCore().byId("In_SectionCode").setValueStateText("Enter Business Place").focus();
					}
				} else {
					sap.ui.getCore().byId("In_Po_CompCode").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().byId("In_Po_CompCode").setValueStateText("Enter Comapny Code").focus();
				}
			} else {
				sap.ui.getCore().byId("id_RequiredAmtPO").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.getCore().byId("id_RequiredAmtPO").setValueStateText("The Down Payment Amount should not exceed the PO Amount").focus();
			}
		},
		fnImageUpload: function(oEvent) {
			var oController = this;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV", true);
			var oImg = sap.ui.getCore().byId("id_image").getValue();
			if (oImg) {
				var vSlug = oEvent + '*' + oImg; //Added by asha on 29.08.2022
				var oComment = sap.ui.getCore().byId("cmmi").getValue();
				var oFileUploader = sap.ui.getCore().byId("id_image");
				var vFile = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];

				var vsec = oModel.getSecurityToken();
				var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
				var binaryData = [];
				binaryData.push(file); //My blob

				var vTaskService = "/sap/opu/odata/EXL/FSCNXT360_SRV/QidAttachmentSet";
				var xhr = new XMLHttpRequest();
				$.ajaxSetup({
					cache: false
				});
				jQuery
					.ajax({
						url: vTaskService,
						processData: false,
						contentType: false,
						async: false,
						dataType: 'json',
						cache: false,
						timeout: "1000",
						data: file,
						type: "POST",
						beforeSend: function(xhr) {
							xhr.setRequestHeader(
								"X-CSRF-Token", vsec);
							xhr.setRequestHeader(
								"Content-Type",
								file.type);
							xhr.setRequestHeader("slug",
								vSlug);
						},
						success: function(oData, oResponse) {
							
							if (oData.d.Type === 'E') {
								var vMsg = oData.d.Msg;
								oController.openErrorDialog(vMsg);
							

							} else {
								oController.SubmitPO(oData.d.Qid);
							}
						},
						error: function(oEr) {
						
							var vMsg = "Upload not possible";
							oController.openErrorDialog(vMsg);
						
						}

					});
			}

		},
		SubmitPO: function(oEvent) {
			var SelectedRows = []; /*Added by Asha*/
			var oController = this;
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var vgl = sap.ui.getCore().byId("In_Po_GL").getValue();
			var vDocType = sap.ui.getCore().byId("In_Po_DocType").getValue();
			var vReff;
			var oTab = sap.ui.getCore().byId("id_tab_po");
			var oTabMain = oView.byId("id_tab");
			var vComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			var count = oIndices.length;
			var vGlAcct = sap.ui.getCore().byId("In_Po_GL").getValue();
			var vPerid = sap.ui.getCore().byId("In_Period").getValue();
			var vPostingDate = sap.ui.getCore().byId("id_postDate").getDateValue();
	
			var vDueOnDate = sap.ui.getCore().byId("id_DueOnDate").getDateValue();
			var vAssign = sap.ui.getCore().byId("In_Assign").getValue();
			var vBusPlace = sap.ui.getCore().byId("In_SectionCode").getValue();
			var vProfitCt = sap.ui.getCore().byId("In_ProfitCet").getValue();
			var vSpecialInd = sap.ui.getCore().byId("In_Special").getValue();
			var vProfitCentre = sap.ui.getCore().byId("In_ProfitCet").getValue(); //Added by Asha on 27.07.2021
			var vBusPlace = sap.ui.getCore().byId("In_SectionCode").getValue();
			var vSection = sap.ui.getCore().byId("In_BlPlace").getValue();
			var oImg = sap.ui.getCore().byId("id_image").getValue();
			var olevel1 = "1";
			var otri = "1234";
			var oinno = sap.ui.getCore().byId("In_ReffPo").getValue();
			var oComment = sap.ui.getCore().byId("cmmi").getValue();
			var flag;
			var dat = "2016-08-19T00:00:00";
			var oAdvamt = '1';
			var oAdvtype = "P";
			var flag = false;
			var vReqiredAmt = sap.ui.getCore().byId("id_RequiredAmtPO").getValueState();
			if (vReqiredAmt != 'Error') {
				if (vComp != "") {
					if (vBusPlace != "") {
						if (vPostingDate) { //changed by Asha on 21.07.2021
							if (vDueOnDate) { //Added by Asha on 27.08.2022
								if (vProfitCentre) { //Condition Added by Asha on 27.07.2021
									if (vSpecialInd) {
										if (oImg) {
											if (oComment != "") {

												var vsplind = "";
												var totamnt = 0;
												for (var i = 0; i < count; i++) {
													if (oTab.getBinding().getModel().getData().Item[i].RquireAmt == "") {
														flag = true;
														break;
													}

												if (oTab.getBinding().getModel().getData().Item[i].Currency == "") {
														flag = true;
													}

												}
											if (flag == false) {

													var oTabid = sap.ui.getCore().byId("itemtab");

													if (vGlAcct != "") {
														//  ======================Changed Code======================
														var oEntry = {
															QId: oEvent,
															Waers: "INR",
															Gsber: "IN47",
															Trnid: otri,
															Budat: vPostingDate,
															DueOn: vDueOnDate,
															Lifnr: this.vendorNumber, //changed by rabooni from vendor to this.vendorNumber
															Advlvl: olevel1,
															Zuonr: vAssign,
															Advamt: "10.00",
															Monat: vPerid,
															Advtyp: oAdvtype,
															Bukrs: "IN47",
															Invno: oinno,
															Prctr: vProfitCt,
															Commnt: oComment,
															Wmwst: "10.00",
															Bupla: vBusPlace,
															Erdat: dat,
															GlAcc: vgl,
															SpInd: vSpecialInd,
															DocType: vDocType,
													
															Secco: vSection
																//

														};
														var child = [];
														for (var i = 0; i < count; i++) {
														
															child.push({
																Ebeln: oTab.getBinding().getModel().getData().Item[i].Ebeln,
																Gsber: oTab.getBinding().getModel().getData().Item[i].BurArea,
																Ebelp: oTab.getBinding().getModel().getData().Item[i].PoItem,
																Wmwst: "10.00",
																Matnr: "1213",
																Waers: oTab.getBinding().getModel().getData().Item[i].Currency,
																Eindt: "2016-08-19T00:00:00",
																Mwskz: 'V0',
																Advnc: "11.12",
																Advreq: oTab.getBinding().getModel().getData().Item[i].RquireAmt,
																Netwr: oTab.getBinding().getModel().getData().Item[i].NetPrice,
																Totamt: "10.00",
																Balamt: "10.00"

															});

															oEntry.NavIsItem = child;
														}
														var fnSuccess = function(oData, oResponse) {

															if (!oData.QId) {
																if (oData.Commnt) {
																	oController.openErrorDialog(oData.Commnt);

																	oController.fn_npo_frag_close();
																
																}
															} else if (oData.QId && oData.Commnt) {

																var msg = '';
																msg += "QID :" + oData.QId + " generated Successfully for down payment \n";
																msg += oData.Commnt + "\n";
																if (oData.Zuonr) {
																	msg += "QID :" + oData.QId + " Status - " + oData.Zuonr;
																}
																oController.openSuccessDialog(msg);
															

															}
														
															oController._oDialog.close();
															this._oDialog.destroy();
															this._oDialog = null; 
															oController.searchRefresh();

														};
														var fnFail = function(oResponse) {
															sap.m.MessageToast.show("Fail");
														};
														oModel.create("/Is_HeaderSet", oEntry, true, fnSuccess, fnFail);
														//   =====================End=================================

													} else {
														sap.ui.getCore().byId("In_Po_GL").setValueState(sap.ui.core.ValueState.Error);
														sap.ui.getCore().byId("In_Po_GL").setValueStateText("Enter GL Account").focus();
													}

												}

											} else {
												sap.ui.getCore().byId("cmmi").setValueState(sap.ui.core.ValueState.Error);
												sap.ui.getCore().byId("cmmi").setValueStateText("Enter Comments").focus();
											}

										} else {
											var oFileUploader = sap.ui.getCore().byId("id_image");
											var sValue = oFileUploader.getValue();

											if (!sValue) {
												
												$("#idFileBox").addClass("errorBox");
											} else {
												// Reset state if a file exists
												oFileUploader.setValueState(sap.ui.core.ValueState.None);
												$("#idFileBox").removeClass("errorBox");
											}

											}
									} else {
										sap.ui.getCore().byId("In_Special").setValueState(sap.ui.core.ValueState.Error);
										sap.ui.getCore().byId("In_Special").setValueStateText("Enter Special GL indicator").focus();
									}
								} else {
									sap.ui.getCore().byId("In_ProfitCet").setValueState(sap.ui.core.ValueState.Error);
									sap.ui.getCore().byId("In_ProfitCet").setValueStateText("Enter Profit Center").focus();
								}
							} else {
								sap.ui.getCore().byId("id_DueOnDate").setValueState(sap.ui.core.ValueState.Error);
								sap.ui.getCore().byId("id_DueOnDate").setValueStateText("Enter Due On Date").focus();
							}
						} else {
							sap.ui.getCore().byId("id_postDate").setValueState(sap.ui.core.ValueState.Error);
							sap.ui.getCore().byId("id_postDate").setValueStateText("Enter Posting Date").focus();
						}
					} else {
						sap.ui.getCore().byId("In_BlPlace").setValueState(sap.ui.core.ValueState.Error);
						sap.ui.getCore().byId("In_BlPlace").setValueStateText("Enter Business Place").focus();

						sap.ui.getCore().byId("In_SectionCode").setValueState(sap.ui.core.ValueState.Error);
						sap.ui.getCore().byId("In_SectionCode").setValueStateText("Enter Section Code").focus();
					}
				} else {
					sap.ui.getCore().byId("In_Po_CompCode").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().byId("In_Po_CompCode").setValueStateText("Enter Comapny Code").focus();
				}
			} else {
				sap.ui.getCore().byId("id_RequiredAmtPO").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.getCore().byId("id_RequiredAmtPO").setValueStateText("The Down Payment Amount should not exceed the PO Amount").focus();
			}
		},
		fnDueOnChange: function() {
			sap.ui.getCore().byId("id_DueOnDate").setValueState();
			sap.ui.getCore().byId("id_DueOnDate").setValueStateText();
		},
		fn_Simulate_frag_close: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;
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
					that.openErrorDialog('Http Error');
					// sap.m.MessageBox.error('Http Error');

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
					that.byId("In_Vendor").bindItems({
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
					that.openErrorDialog("HTTP Error while fetching Vendor list");
				
				}
			});
		},
		fn_VendorChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				// Get binding context of selected vendor
				var oCtx = oSelectedItem.getBindingContext("JSVendor");
				var oVendorData = oCtx.getObject();

				// Set vendor name into input field
				this.byId("In_Vendor").setValue(oVendorData.Lifnr);
				this.vendorNumber = oVendorData.Lifnr;
				this.fnValueHelpPofr();
			} else {
				// Clear if nothing is selected
				this.byId("In_Vendor").setValue("");
			}
		},

		fn_npo_frag_close: function() {

			this.dialog4.close();
			this.dialog4.destroy();
			this.dialog4 = null;

		},



		fn_Lifnr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fnValueHelpPofr: function() {
		
			var vVendor = this.vendorNumber;
			if (!this.vendorNumber) {
				oView.byId("In_Vendor").setValueState("Error");
				oView.byId("In_Vendor").setValueStateText("Enter Vendor").focus();
			} else {
				this.fnPoList();
			
			}
		},
		fnOnPoOpen: function(oEvent) {
			console.log("PO ComboBox opened");
			// You can trigger backend call or filter refresh here
		},

		fnPoList: function() {
			var vVendor = this.vendorNumber;
			var oView = this.getView();
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", true);

			var fnSuccess = function(oData) {
				var oJSONModelPO = new sap.ui.model.json.JSONModel();
				oJSONModelPO.setData(oData.results);
				oView.setModel(oJSONModelPO, "P");

				// Bind programmatically with template
				oView.byId("In_PoFrom").bindItems({
					path: "P>/",
					length: oData.results.length,
					template: new sap.ui.core.ListItem({
						key: "{P>Ebeln}",
						text: "{P>Ebeln}",

					})
				});
				oView.byId("In_PoTo").bindItems({
					path: "P>/",
					length: oData.results.length,
					template: new sap.ui.core.ListItem({
						key: "{P>Ebeln}",
						text: "{P>Ebeln}",

					})
				});
			};

			var fnFail = function() {
				sap.m.MessageToast.show("Fail to fetch PO list");
			};

			oModel.read("/GET_PO_FOR_VENDOR?VendorNo='" + vVendor + "'", {
				success: fnSuccess,
				error: fnFail
			});
		},

		fnValueHelpPoto: function(evt) {
			oControllerV = this;
			var oView = this.getView();
			if (!this.dialog3) {
				oControllerV.dialog3 = sap.ui.xmlfragment("FSC360NEW.fragment.PoTo", this);
				oControllerV.getView().addDependent(oControllerV.dialog3);
			}
	
			var vVendor = this.vendorNumber;
			if (!this.vendorNumber) {
				oView.byId("In_Vendor").setValueState("Error");
				oView.byId("In_Vendor").setValueStateText("Enter Vendor").focus();
			} else {
				this.fnPoList();
				oControllerV.dialog3.open();
			}

		},
		fnValueHelpClosePoTo: function(oEvent) {
			var oView = this.getView();
			var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
			var productInput = oView.byId("In_PoTo").setValue(oSelectedItem);

		},
		fnFilterPoTo: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, vValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		fnValueHelpCloseFrom: function(oEvent) {
			var oView = this.getView();
			var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
			var productInput = oView.byId("In_PoFrom").setValue(oSelectedItem);

		},
		fnValueHelpPoto: function(evt) {
			oControllerV = this;
			var oView = this.getView();
			if (!this.dialog3) {
				oControllerV.dialog3 = sap.ui.xmlfragment("FSC360NEW.fragment.PoTo", this);
				oControllerV.getView().addDependent(oControllerV.dialog3);
			}

			var vVendor = this.vendorNumber;
			if (vVendor == "") {
				oView.byId("In_Vendor").setValueState("Error");
				oView.byId("In_Vendor").setValueStateText("Enter Vendor").focus();
			} else {
				oControllerV.dialog3.open();
				this.fnPoList();
			}

		},
		search: function() {
			const oView = this.getView();
			const oModel = oView.getModel("VP");
			const vendor = this.vendorNumber;
			const PoFrom = oView.byId("In_PoFrom").getValue();
			const PoTo = oView.byId("In_PoTo").getValue();

			if (!vendor) {
				oView.byId("In_Vendor").setValueState("Error");
				sap.m.MessageToast.show("Enter the Vendor");
				return;
			}

			const fnSuccessValidate = (oData) => {
				validate = oData.Error;
				this.searchRefresh(); // now call actual data fetch
			};

			const fnFailValidate = (oError) => {
				console.error("Vendor validation failed:", oError);
			};

			oModel.read(`/VendorlistSet(Lifnr='${vendor}')`, {
				success: fnSuccessValidate,
				error: fnFailValidate
			});
		},
	
		searchRefresh: function() {
			const oView = this.getView();
			const oModel = oView.getModel("VP");
			const vendor = this.vendorNumber;
			let PoFrom = oView.byId("In_PoFrom").getValue();
			// PoFrom = Number(PoFrom) - 1;   // commented by Manosankari

			const PoTo = oView.byId("In_PoTo").getValue();
			const that = this;

			if (validate === 'Y') {
				const sUrl = `/VendorNonPoSet?$filter=Lifnr eq '${vendor}' and (Ebeln ge '${PoFrom}' and Ebeln le '${PoTo}')&$expand=NavPODetails`;

				oModel.read(sUrl, {
					success: function(oData) {
						const poLines = (oData.results?.[0]?.NavPODetails?.results) || [];
						that.aFullVendorAdvData = poLines;
						that.iCurrentPage = 1; // Reset to first page
						that.iRowsPerPage = 11;

						that.updateVendorAdvPaginatedModel();

						const oJsonModel = new sap.ui.model.json.JSONModel();
						oJsonModel.setData({
							results: poLines
						});
						oView.byId("id_tab").setModel(oJsonModel, "VendorAdv");
						const count = poLines.length;
					
						oView.byId("id_total_1")?.setText(count); // Optional badge or counter
					},
					error: function(oError) {
						console.error("OData fetch error:", oError);
						sap.m.MessageToast.show("Failed to fetch PO Details");
					}
				});
			} else {
				sap.m.MessageToast.show("Enter Valid Vendor");
				oView.byId("In_Vendor").setValueState("Error");
			}
		},
		updateVendorAdvPaginatedModel: function() {
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFullVendorAdvData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData({
				results: pageData
			});

			this.getView().byId("id_tab").setModel(pagedModel, "VendorAdv");
			this.renderVendorAdvPageNumbers();
		},
		onNextVendorAdvPage: function() {
			var iTotalPages = Math.ceil(this.aFullVendorAdvData.length / this.iRowsPerPage);
			if (this.iCurrentPage < iTotalPages) {
				this.iCurrentPage++;
				this.updateVendorAdvPaginatedModel();
			}
		},

		onPreviousVendorAdvPage: function() {
			if (this.iCurrentPage > 1) {
				this.iCurrentPage--;
				this.updateVendorAdvPaginatedModel();
			}
		},
		renderVendorAdvPageNumbers: function() {
			var oPageBox = this.byId("idPageNumbersBox");
			oPageBox.removeAllItems();

			var iTotalPages = Math.ceil(this.aFullVendorAdvData.length / this.iRowsPerPage);
			if (iTotalPages <= 1) return;

			var currentPage = this.iCurrentPage;
			var that = this;

			function getPageNumbers(currentPage, totalPages) {
				var pages = [];
				if (totalPages <= 7) {
					for (var i = 1; i <= totalPages; i++) pages.push(i);
				} else {
					if (currentPage <= 2) {
						pages = [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
					} else if (currentPage >= totalPages - 1) {
						pages = [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
					} else {
						pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
					}
				}
				return [...new Set(pages)];
			}

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.updateVendorAdvPaginatedModel();
					}
				});

				if (pageNum === currentPage) {
					oButton.addStyleClass("cl_page_btn_emp");
				} else {
					oButton.addStyleClass("cl_page_btn");
				}

				oPageBox.addItem(oButton);
			}

			var aPages = getPageNumbers(currentPage, iTotalPages);
			for (var i = 0; i < aPages.length; i++) {
				var page = aPages[i];
				if (page === "...") {
					oPageBox.addItem(new sap.m.Text({
						text: "..."
					}));
				} else {
					addPageButton(page);
				}
			}
		},
		SubmitNonPOPress: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var oController = this;
			var vPostDate = sap.ui.getCore().byId("id_postDatenon").getDateValue();

			var vDueOnDate = sap.ui.getCore().byId("id_DueOnDatenon").getDateValue();
			var vSpgl = sap.ui.getCore().byId("In_Specialnon").getValue();
			var vPrctr = sap.ui.getCore().byId("In_ProfitCe_nont").getValue();
			var vTaxCode = sap.ui.getCore().byId("In_TaxCodeNon").getValue();
			var vglAcct = sap.ui.getCore().byId("In_NonPo_GL").getValue();
	
			var vBusPlace = sap.ui.getCore().byId("In_BlPlacenon").getValue();
			var vSection = sap.ui.getCore().byId("In_BlPlacenon").getValue();
			var vComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			var oComment = sap.ui.getCore().byId("In_NonPo_Coment").getValue();
		
			var oImg = sap.ui.getCore().byId("id_image_non").getValue();

			if (vComp != "") {
				if (vBusPlace != "" && vSection != "") {
					if (sap.ui.getCore().byId("In_NonPo_ReqAdv").getValue() == "") {
						sap.ui.getCore().byId("In_NonPo_ReqAdv").setValueState(sap.ui.core.ValueState.Error);
						sap.ui.getCore().byId("In_NonPo_ReqAdv").setValueStateText("Enter required advance").focus();

					} else {
					
						if (vglAcct != "") {
							if (vPrctr) { //condition added by Asha on 27.07.2021
								if (vPostDate != null) {
									if (vDueOnDate != null) {
										if (vSpgl != "") {
											//           
											if (vTaxCode != "" || vSpgl != 'A') {
												if (oImg) {
													if (oComment != "") {
														if (!this._oConfirmDialog) {
															this._oConfirmDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ConfirmDialog", this);
															this.getView().addDependent(this._oConfirmDialog);
														}

														sap.ui.getCore().byId("confirmText").setText("Are you sure you want to submit the record?");
														this._oConfirmDialog._vComp = vComp; //mano
														this._oConfirmDialog._vGlAcct = vglAcct;
														this._oConfirmDialog._oController = this;
														this._oConfirmDialog.open();
													
													} else {
														sap.ui.getCore().byId("In_NonPo_Coment").setValueState(sap.ui.core.ValueState.Error);
														sap.ui.getCore().byId("In_NonPo_Coment").setValueStateText("Enter Comments").focus();
													}
												} else {
													var oFileUploader = sap.ui.getCore().byId("id_image_non");
													var sValue = oFileUploader.getValue();

													if (!sValue) {
													
														// Optional: Highlight the surrounding VBox to guide the user
														$("#idFileBox").addClass("errorBox");
													} else {
														// Reset state if a file exists
														oFileUploader.setValueState(sap.ui.core.ValueState.None);
														$("#idFileBox").removeClass("errorBox");
													}
											}
											} else {
												sap.ui.getCore().byId("In_TaxCodeNon").setValueState(sap.ui.core.ValueState.Error);
												sap.ui.getCore().byId("In_TaxCodeNon").setValueStateText("Enter Tax Code").focus();
											}
										
										} else {
											sap.ui.getCore().byId("In_Specialnon").setValueState(sap.ui.core.ValueState.Error);
											sap.ui.getCore().byId("In_Specialnon").setValueStateText("Enter special GL indicatior").focus();
										}
									} else {
										sap.ui.getCore().byId("id_DueOnDatenon").setValueState(sap.ui.core.ValueState.Error);
										sap.ui.getCore().byId("id_DueOnDatenon").setValueStateText("Enter Due On Date").focus();
									}
								} else {
									sap.ui.getCore().byId("id_postDatenon").setValueState(sap.ui.core.ValueState.Error);
									sap.ui.getCore().byId("id_postDatenon").setValueStateText("Enter Posting date").focus();
								}
							} else {
								sap.ui.getCore().byId("In_ProfitCe_nont").setValueState(sap.ui.core.ValueState.Error);
								sap.ui.getCore().byId("In_ProfitCe_nont").setValueStateText("Enter Profit Center").focus();
							}
						} else {
							sap.ui.getCore().byId("In_NonPo_GL").setValueState(sap.ui.core.ValueState.Error);
							sap.ui.getCore().byId("In_NonPo_GL").setValueStateText("Enter GL Account").focus();
						}
				

					}
				} else {
					sap.ui.getCore().byId("In_BlPlacenon").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().byId("In_BlPlacenon").setValueStateText("Enter Business Place").focus();

					sap.ui.getCore().byId("In_SectionCodenon").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().byId("In_SectionCodenon").setValueStateText("Enter Section Code").focus();
				}
			} else {
				sap.ui.getCore().byId("In_Non_CompCode").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.getCore().byId("In_Non_CompCode").setValueStateText("Enter Comapany Code").focus();
			}

		},
		onConfirmYesPress: function() {
			var oController = this._oConfirmDialog._oController || this;
			var vComp = this._oConfirmDialog._vComp;
			var vGlAcct = this._oConfirmDialog._vGlAcct; //mano
			var vPO = this._oConfirmDialog._PO;

			// Decide which function to call
	
			if (vPO === "S") {
				// Table flow
				if (vPO === "S") {
					oController.fnImageUpload(vComp); // mano
				
				} else {
					sap.ui.getCore().byId("In_Po_GL").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().byId("In_Po_GL").setValueStateText("Enter GL Account").focus();
				}
			} else {
				// Non-PO flow
				oController.fnImageUploadNonPo(vComp); //mano
			
			}

			// Close fragment
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
			this._oConfirmDialog = null;
		},

		onConfirmNoPress: function() {
			this._oConfirmDialog.close();
			this._oConfirmDialog.destroy();
			this._oConfirmDialog = null;
		},

		onConfirmDialogClose: function() {
			// Optional: clear any temporary data if needed
		},
		fnDueOnDateChangenon: function() {
			sap.ui.getCore().byId("id_DueOnDatenon").setValueState();
			sap.ui.getCore().byId("id_DueOnDatenon").setValueStateText().focus();
		},
		SubmitNonPO: function(oEvent) {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			var oController = this;
			var vPostDate = sap.ui.getCore().byId("id_postDatenon").getDateValue();
		
			var vDueOnDate = sap.ui.getCore().byId("id_DueOnDatenon").getDateValue();
			var vSpgl = sap.ui.getCore().byId("In_Specialnon").getValue();
			var vDocType = sap.ui.getCore().byId("In_Po_DocTypenon").getValue();
			var vPeriod = sap.ui.getCore().byId("In_Periodnon").getValue();
			var vAsign = sap.ui.getCore().byId("In_Assign_non").getValue();
			var vPrctr = sap.ui.getCore().byId("In_ProfitCe_nont").getValue();
	
			var vTaxCode = sap.ui.getCore().byId("In_TaxCodeNon").getValue();
			var vglAcct = sap.ui.getCore().byId("In_NonPo_GL").getValue();
	
			var vBusPlace = sap.ui.getCore().byId("In_BlPlacenon").getValue();
			var vSection = sap.ui.getCore().byId("In_SectionCodenon").getValue();
			var oInvNo = sap.ui.getCore().byId("In_ReffNPo").getValue();
			var vComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			var oComment = sap.ui.getCore().byId("In_NonPo_Coment").getValue();
			
			var vSection = sap.ui.getCore().byId("In_BlPlacenon").getValue();
			var oImg = sap.ui.getCore().byId("id_image_non").getValue();

			if (vComp != "") {
				if (vBusPlace != "" && vSection != "") {

					// if (oCuurr != "") {
					if (vglAcct != "") {
						if (vPrctr) { //condition added by Asha on 27.07.2021
							if (vPostDate != null) {
								if (vDueOnDate != null) {

									if (vSpgl != "") {

										if (vTaxCode != "" || vSpgl != 'A') {
											if (oImg) {
												if (oComment != "") {

													var oAdvamt = sap.ui.getCore().byId("In_NonPo_ReqAdv").getValue();
													var olevel2 = "2";
													var oTri = "1234";

													var vglacc = sap.ui.getCore().byId("In_NonPo_GL").getValue();
													var oAdvtype = "";
													var dat = "2016-08-24T00:00:00";
													var oEntry = {
														QId: oEvent,
														Waers: "INR",
														Gsber: "IN47",
														Trnid: "",
														Budat: vPostDate,
														DueOn: vDueOnDate,
														Lifnr: vendor,
														Advlvl: olevel2,
														Zuonr: vAsign,
														Advamt: oAdvamt,
														Monat: vPeriod,
														Advtyp: oAdvtype,
														Bukrs: vComp,
														Invno: oInvNo,
														Prctr: vPrctr,
														Commnt: oComment,
														Wmwst: "10.00",
														Bupla: vBusPlace,
														Erdat: dat,
														GlAcc: vglacc,
														SpInd: vSpgl,
														DocType: vDocType,
														// Xbelnr: oinno,
														Mwskz: vTaxCode,
														Secco: vSection

													};
													var child = [];
													child
														.push({
															Eindt: "2016-08-19T00:00:00",
															Balamt: "0.000"
														});
													oEntry.NavIsItem = child;
													var fnSuccess = function(oData, oResponse) {
														sap.ui.getCore().byId("In_NonPo_GL").setValue("");
														sap.ui.getCore().byId("In_NonPo_ReqAdv").setValue("");
														var I = 'S';
														oController.vendornonpo(I);

														if (!oData.QId) {
															if (oData.Commnt) {
																oController.openErrorDialog(oData.Commnt);
														
															}
														} else if (oData.QId && oData.Commnt) {

															var msg = '';
															msg += "QID :" + oData.QId + " generated Successfully for down payment \n";
															msg += oData.Commnt + "\n";
															if (oData.Zuonr) {
																msg += "QID :" + oData.QId + " Status - " + oData.Zuonr;
															}
															oController.openSuccessDialog(msg);
															

														}
														oController.fn_npo_frag_close();
														// oController.searchRefresh(); // Commented by L.Jawahar

													};
													var fnFail = function(oResponse) {
														sap.m.MessageToast
															.show("Fail");
													};
													oModel.create("/Is_HeaderSet", oEntry, true, fnSuccess, fnFail);
													//
												}
											}
										}
									}
								}
							}
						}

					}
					// }

				}
			}

		},
		fnImageUploadNonPo: function(oEvent) {
			var oController = this;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV", true);
			var oImg = sap.ui.getCore().byId("id_image_non").getValue();
			if (oImg) {
				var vSlug = oEvent + '*' + oImg;
				var oFileUploader = sap.ui.getCore().byId("id_image_non");
				var vFile = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];

				var vsec = oModel.getSecurityToken();
				var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
				var binaryData = [];
				binaryData.push(file); //My blob

				var vTaskService = "/sap/opu/odata/EXL/FSCNXT360_SRV/QidAttachmentSet";
				var xhr = new XMLHttpRequest();
				$.ajaxSetup({
					cache: false
				});
				jQuery
					.ajax({
						url: vTaskService,
						processData: false,
						contentType: false,
						async: false,
						dataType: 'json',
						cache: false,
						timeout: "1000",
						data: file,
						type: "POST",
						beforeSend: function(xhr) {
							xhr.setRequestHeader(
								"X-CSRF-Token", vsec);
							xhr.setRequestHeader(
								"Content-Type",
								file.type);
							xhr.setRequestHeader("slug",
								vSlug);
						},
						success: function(oData, oResponse) {

							if (oData.d.Type === 'E') {
								var vMsg = oData.d.Msg;
								oController.openErrorDialog(vMsg);
							

							} else {
								oController.SubmitNonPO(oData.d.Qid);
							}

						},
						error: function(oEr) {
						
							var vMsg = "Upload not possible";
								oController.openErrorDialog(vMsg);
							// sap.m.MessageBox.error(vMsg, {
							// 	title: "Error",
							// 	onClose: function(oAction) {
							// 		if (oAction === "OK") {
							// 			oController.dialog4.close();
							// 		}
							// 	}
							// });
						}

					});
			}

		},

		fn_fulfillrefresh: function() {
			location.reload();
		},
		fnClear: function() {
			const oView = this.getView();

			oView.byId("In_PoTo").setValue("");
			oView.byId("In_PoFrom").setValue("");
			oView.byId("In_Vendor").setValue("");

			this.aFullVendorAdvData = [];
			this.iCurrentPage = 1;

			const emptyModel = new sap.ui.model.json.JSONModel();
			emptyModel.setData({
				results: []
			});
			oView.byId("id_tab").setModel(emptyModel, "VendorAdv");

			oView.byId("id_tab").clearSelection();

			oView.byId("id_total_1").setText("0");
			this.byId("idPageNumbersBox").removeAllItems();

			console.log("Cleared paginated data");
		},
		fnLiveBusp: function(oEvent) {
			sap.ui.getCore().byId("In_SectionCode").setValueState();
			sap.ui.getCore().byId("In_SectionCode").setValueStateText();
			var vComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			var oValue = oEvent.getParameters().value;
			if (vComp != "") {

				if (oValue) {

					var oFilter = new sap.ui.model.Filter("Branch", sap.ui.model.FilterOperator.StartsWith, oValue);
					var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
					if (vData.aIndices.length == 0) {
						sap.ui.getCore().byId("In_SectionCode").setValueState("Error");
						sap.ui.getCore().byId("In_SectionCode").setValueStateText("Enter valid business place").focus();
					} else {
						sap.ui.getCore().byId("In_SectionCode").setValueState();
						sap.ui.getCore().byId("In_SectionCode").setValueStateText();
					}
					oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

				}
			} else {
				sap.ui.getCore().byId("In_Po_CompCode").setValueState("Error");
				sap.ui.getCore().byId("In_Po_CompCode").setValueStateText("Enter Company Code").focus();
			}
		},
		// Added by L.Jawahar - start
		fnSectionPoLive: function(oEvent) {
			sap.ui.getCore().byId("In_BlPlace").setValueState();
			sap.ui.getCore().byId("In_BlPlace").setValueStateText();
			var vComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			var oValue = oEvent.getParameters().value;
			if (vComp != "") {

				if (oValue) {

					var oFilter = new sap.ui.model.Filter("Seccode", sap.ui.model.FilterOperator.StartsWith, oValue);
					var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
					if (vData.aIndices.length == 0) {
						sap.ui.getCore().byId("In_BlPlace").setValueState("Error");
						sap.ui.getCore().byId("In_BlPlace").setValueStateText("Enter valid section code").focus();
					} else {
						sap.ui.getCore().byId("In_BlPlace").setValueState();
						sap.ui.getCore().byId("In_BlPlace").setValueStateText();
					}
					oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

				}
			} else {
				sap.ui.getCore().byId("In_Po_CompCode").setValueState("Error");
				sap.ui.getCore().byId("In_Po_CompCode").setValueStateText("Enter Company Code").focus();
			}
		},
		// End
		fnLiveBuspnon: function(oEvent) {
			sap.ui.getCore().byId("In_BlPlacenon").setValueState();
			sap.ui.getCore().byId("In_BlPlacenon").setValueStateText();
			var vComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			var oValue = oEvent.getParameters().value;
			if (vComp != "") {
			
				var oFilter = new sap.ui.model.Filter("Branch", sap.ui.model.FilterOperator.StartsWith, oValue);
				var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);

				if (vData.aIndices.length == 0) {
					sap.ui.getCore().byId("In_BlPlacenon").setValueState("Error");
					sap.ui.getCore().byId("In_BlPlacenon").setValueStateText("Enter valid business place").focus();
				} else {
					sap.ui.getCore().byId("In_BlPlacenon").setValueState();
					sap.ui.getCore().byId("In_BlPlacenon").setValueStateText();
				}
				oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

			} else {
				sap.ui.getCore().byId("In_Non_CompCode").setValueState("Error");
				sap.ui.getCore().byId("In_Non_CompCode").setValueStateText("Enter Company Code").focus();
			}
		},
       // Added by L.Jawahar - start
       
       fnSectionnPoLive: function(oEvent) {
			sap.ui.getCore().byId("In_SectionCodenon").setValueState();
			sap.ui.getCore().byId("In_SectionCodenon").setValueStateText();
			var vComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			var oValue = oEvent.getParameters().value;
			if (vComp != "") {
			
				var oFilter = new sap.ui.model.Filter("Seccode", sap.ui.model.FilterOperator.StartsWith, oValue);
				var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);

				if (vData.aIndices.length == 0) {
					sap.ui.getCore().byId("In_SectionCodenon").setValueState("Error");
					sap.ui.getCore().byId("In_SectionCodenon").setValueStateText("Enter valid section code").focus();
				} else {
					sap.ui.getCore().byId("In_SectionCodenon").setValueState();
					sap.ui.getCore().byId("In_SectionCodenon").setValueStateText();
				}
				oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

			} else {
				sap.ui.getCore().byId("In_Non_CompCode").setValueState("Error");
				sap.ui.getCore().byId("In_Non_CompCode").setValueStateText("Enter Company Code").focus();
			}
		},
       
       // End
		//  ======================F$ help for tax code non po==================
		fnNonPoTaxCode: function() {
			var oView = this.getView();
			var oModel = oView.getModel("VP");
			if (!this.TAXN) {
				this.TAXN = sap.ui.xmlfragment(
					"com.exalca.iv.view.VAP.fragments.TaxCodeNon", this);
				this.getView().addDependent(this.TAXN);
			}
			//      this.BPD.setModel(oModel);

			this.TAXN.open();
			var vCompCc = sap.ui.getCore().byId("In_Non_CompCode").getValue(); //Added by Asha on 15.07.2021
			oController = this;
			var fnSuccess = function(oData, oResponse) {
				var oTaxCodeModelN = new sap.ui.model.json.JSONModel();
				var aTaxCodeN = {
					"TaxCodeN": oData
				};
				oTaxCodeModelN.setData(aTaxCodeN);
				oView.setModel(oTaxCodeModelN, "TCN");

			};
			var fnFail = function(oResponse) {

			};
		
			oModel.read("/TaxcodeSet?$filter=(Bukrs eq '" + vCompCc + "')", null, null, true, fnSuccess, fnFail); //Added by Ashapriya on 15.07.2021

		},
		fnPoNonGlChange: function(oEvent) {
			sap.ui.getCore().byId("In_NonPo_GL").setValueState();
			sap.ui.getCore().byId("In_NonPo_GL").setValueStateText();
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();
			var oFilter = new sap.ui.model.Filter("Saknr", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_NonPo_GL").setValueState("Error");
				sap.ui.getCore().byId("In_NonPo_GL").setValueStateText("Enter valid GL Account").focus();
			} else {
				sap.ui.getCore().byId("In_NonPo_GL").setValueState();
				sap.ui.getCore().byId("In_NonPo_GL").setValueStateText();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

		},
		//  ==================Required adance live change for non po===================
		fnReqAdvChangeNonPo: function() {
			sap.ui.getCore().byId("In_NonPo_ReqAdv").setValueState();
			sap.ui.getCore().byId("In_NonPo_ReqAdv").setValueStateText().focus();
		},
		fnCmmtChangeNpo: function() {
			sap.ui.getCore().byId("In_NonPo_Coment").setValueState();
			sap.ui.getCore().byId("In_NonPo_Coment").setValueStateText("").focus();
		},
		fnLiveDocNonPo: function(oEvent) {
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();

			var oFilter = new sap.ui.model.Filter("Blart", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_Po_DocTypenon").setValueState("Error");
				sap.ui.getCore().byId("In_Po_DocTypenon").setValueStateText("Enter valid Doc Type").focus();
			} else {
				sap.ui.getCore().byId("In_Po_DocTypenon").setValueState();
				sap.ui.getCore().byId("In_Po_DocTypenon").setValueStateText();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
		},
		fnLiveDocTypePO: function(oEvent) {
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();

			var oFilter = new sap.ui.model.Filter("Blart", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_Po_DocType").setValueState("Error");
				sap.ui.getCore().byId("In_Po_DocType").setValueStateText("Enter valid Doc Type").focus();
			} else {
				sap.ui.getCore().byId("In_Po_DocType").setValueState();
				sap.ui.getCore().byId("In_Po_DocType").setValueStateText();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
		},
		fnPostingDateChangenon: function() {
			sap.ui.getCore().byId("id_postDatenon").setValueState();
			sap.ui.getCore().byId("id_postDatenon").setValueStateText().focus();
		},
		fnDueOnDateChangenon: function() {
			sap.ui.getCore().byId("id_DueOnDatenon").setValueState();
			sap.ui.getCore().byId("id_DueOnDatenon").setValueStateText().focus();
		},
		//=================Non PO special GL Change===============
		fnSpecialGlChangenon: function(oEvent) {
			sap.ui.getCore().byId("In_Specialnon").setValueState();
			sap.ui.getCore().byId("In_Specialnon").setValueStateText().focus();
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();

			var oFilter = new sap.ui.model.Filter("Shbkz", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_Specialnon").setValueState("Error");
				sap.ui.getCore().byId("In_Specialnon").setValueStateText("Enter valid Special GL Account").focus();
			} else {
				sap.ui.getCore().byId("In_Specialnon").setValueState();
				sap.ui.getCore().byId("In_Specialnon").setValueStateText();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
		},
		fnGlchangePoAdv: function(oEvent) {
			var oView = this.getView();
			var oValue = oEvent.getParameters().value;

			sap.ui.getCore().byId("In_Po_GL").setValueState();
			sap.ui.getCore().byId("In_Po_GL").setValueStateText().focus();
			var oFilter = new sap.ui.model.Filter("Saknr", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_Po_GL").setValueState("Error");
				sap.ui.getCore().byId("In_Po_GL").setValueStateText("Enter valid GL Account").focus();
			} else {
				sap.ui.getCore().byId("In_Po_GL").setValueState();
				sap.ui.getCore().byId("In_Po_GL").setValueStateText();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

		},
		fnliveDocTypePo: function(oEvent) {
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();

			var oFilter = new sap.ui.model.Filter("Blart", sap.ui.model.FilterOperator.Contains, oValue);
			var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
			if (vData.aIndices.length == 0) {
				sap.ui.getCore().byId("In_Po_DocType").setValueState("Error");
				sap.ui.getCore().byId("In_Po_DocType").setValueStateText("Enter valid Doc Type").focus();
			} else {
				sap.ui.getCore().byId("In_Po_DocType").setValueState();
				sap.ui.getCore().byId("In_Po_DocType").setValueStateText();
			}
			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
		},
		fnlivePrctrPo: function(oEvent) {
			sap.ui.getCore().byId("In_SectionCode").setValueState();
			sap.ui.getCore().byId("In_SectionCode").setValueStateText();
			var vComp = sap.ui.getCore().byId("In_Po_CompCode").getValue();
			vComp = vComp.toUpperCase();
			var oValue = oEvent.getParameters().value;
			if (vComp != "") {

				if (oValue) {
					var oFilter = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, oValue);
					var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
					if (vData.aIndices.length == 0) {
						sap.ui.getCore().byId("In_ProfitCet").setValueState("Error");
						sap.ui.getCore().byId("In_ProfitCet").setValueStateText("Enter valid Profit Center").focus();
					} else {
						sap.ui.getCore().byId("In_ProfitCet").setValueState();
						sap.ui.getCore().byId("In_ProfitCet").setValueStateText();
					}

					oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

				}
			} else {
				sap.ui.getCore().byId("In_Po_CompCode").setValueState("Error");
				sap.ui.getCore().byId("In_Po_CompCode").setValueStateText("Enter Company Code").focus();
			}
		},
		fnProfitNonChange: function(oEvent) {
			var vComp = sap.ui.getCore().byId("In_Non_CompCode").getValue();
			var oValue = oEvent.getParameters().value;
			oValue = oValue.toUpperCase();
			if (vComp != "") {

				if (oValue) {

					var oFilter = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, oValue);
					var vData = oEvent.getSource().getBinding("suggestionItems").filter([oFilter]);
					if (vData.aIndices.length == 0) {
						sap.ui.getCore().byId("In_ProfitCe_nont").setValueState("Error");
						sap.ui.getCore().byId("In_ProfitCe_nont").setValueStateText("Enter valid Profit Center");
					} else {
						sap.ui.getCore().byId("In_ProfitCe_nont").setValueState();
						sap.ui.getCore().byId("In_ProfitCe_nont").setValueStateText();
					}

					oEvent.getSource().getBinding("suggestionItems").filter(oFilter);

				}
			} else {
				sap.ui.getCore().byId("In_Non_CompCode").setValueState("Error");
				sap.ui.getCore().byId("In_Non_CompCode").setValueStateText("Enter Company Code");
			}
		},
		fnCommentChangePO: function() {
			sap.ui.getCore().byId("cmmi").setValueState();
			sap.ui.getCore().byId("cmmi").setValueStateText();
		},
		fnInputAllLiveChange: function(oEvent) {
			var oFileUploader = oEvent.getSource(); // FileUploader
			var aFiles = oFileUploader.oFileUpload.files;

			if (!aFiles || aFiles.length === 0) {
				// No file selected
				oFileUploader.setValueState(sap.ui.core.ValueState.Error);
				oFileUploader.setValueStateText("Please upload the file");
				$("#idFileBox").addClass("errorBox");
				return;
			}

			var oFile = aFiles[0];
			var oView = this.getView();

			sap.ui.getCore().byId("idFileNameText").setText(oFile.name);

		
			sap.ui.getCore().byId("idAttachmentBox").setVisible(true);

			// Convert the file to Base64 so we can open it later
			var reader = new FileReader();
			reader.onload = function(e) {
				var sBase64 = e.target.result;

				// Store the file data in a JSON model
				var oFileData = {
					FileName: oFile.name,
					MimeType: oFile.type,
					Content: sBase64
				};
				var oModel = new sap.ui.model.json.JSONModel(oFileData);
				oView.setModel(oModel, "UploadedFile");
			};
			reader.readAsDataURL(oFile);

			oFileUploader.setValueState(sap.ui.core.ValueState.None);
			$("#idFileBox").removeClass("errorBox");
		}

		,
		fn_pdf: function() {
			var oView = this.getView();
			var oFileModel = oView.getModel("UploadedFile");

			if (!oFileModel) {
				sap.m.MessageToast.show("No file available to preview.");
				return;
			}

			var oData = oFileModel.getData();

			if (!this.pdfDialog) {
				this.pdfDialog = sap.ui.xmlfragment("FSC360NEW.fragment.getPDF", this);
				oView.addDependent(this.pdfDialog);
			}

			var oScroll = sap.ui.getCore().byId("id_scrll");
			oScroll.destroyContent();

			var oContent;

			if (oData.MimeType === "application/pdf") {
				// Use object tag instead of iframe
				oContent = new sap.ui.core.HTML({
					content: "<object width='100%' height='600px' data='" + oData.Content + "' type='application/pdf'></object>"
				});
			} else if (oData.MimeType.startsWith("image/")) {
				oContent = new sap.m.Image({
					src: oData.Content,
					width: "100%",
					height: "auto"
				});
			} else {
				sap.m.MessageToast.show("Unsupported file type: " + oData.MimeType);
				return;
			}

			oScroll.addContent(oContent);
			oScroll.setVisible(true);
			this.pdfDialog.open();
		},

		fnfragPDFClose: function() {
			if (this.pdfDialog) {
				this.pdfDialog.close();
			}
		},

		openErrorDialog: function(sMessage, fnOnClose) {
			var oView = this.getView();

			// Set the dynamic message in the model
			oView.getModel("errorModel").setProperty("/message", sMessage);

			// Save the callback function for later use
			this._errorDialogCloseCallback = fnOnClose || null;

			// Follow your standard fragment loading approach
			if (!this.ErrorDialog) {
				this.ErrorDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.ErrorReuse", this);
				this.getView().addDependent(this.ErrorDialog);
			}

			// Open the dialog
			this.ErrorDialog.open();
		},
		fn_onCloseErrorDialog: function() {
			if (this.ErrorDialog) {
				this.ErrorDialog.close();

				// If there is a callback, execute it
				if (typeof this._errorDialogCloseCallback === "function") {
					this._errorDialogCloseCallback();
				}

				// Reset callback to avoid accidental multiple calls
				this._errorDialogCloseCallback = null;
			}
		},
		openSuccessDialog: function(sMessage, fnOnClose) {
			var oView = this.getView();

			// Set dynamic message in the success model
			oView.getModel("successModel").setProperty("/message", sMessage);

			// Save callback for close handling
			this._successDialogCloseCallback = fnOnClose || null;

			// Load fragment only once
			if (!this.SuccessDialog) {
				this.SuccessDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.SuccessReuse", this);
				oView.addDependent(this.SuccessDialog);
			}

			// Open the dialog
			this.SuccessDialog.open();
		},
		fn_closeSuccess: function() {
			if (this.SuccessDialog) {
				this.SuccessDialog.close();

				// Run callback if provided
				if (typeof this._successDialogCloseCallback === "function") {
					this._successDialogCloseCallback();
				}

				// Reset callback to prevent multiple executions
				this._successDialogCloseCallback = null;
				window.location.reload();// Added by L.Jawahar
			}
		}

	});

});