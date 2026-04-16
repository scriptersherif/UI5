sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MultiInput",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/Currency",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter"
], function(Controller, MultiInput, Fragment, MessageToast, MessageBox, Sorter, NumberFormat, Currency, Filter, FilterOperator, formatter) {

	"use strict";
	var arr_directpay = [];
	var flag_com = 0;
	var arr_sort = [];
	var arr_sort1 = [];
	var uname;
	var uname_1;
	var first_letter;
	var count_sel;
	var aTokens;
	var year = "";
	var Docyear = ""; //Added by Lokesh R on 20.09.2023
	var flaginv; //Added by Lokesh R on 13.09.2023
	var flagdoc; //Added by Lokesh R on 13.09.2023
	var v_payloc;
	var v_compcode2;
	var binaryData = [];
	var SuccessInd = "";
	var Vendor_Final = "";
	var BankKey_Final = "";
	var BankKey_Name = "";
	var BankKey_AccNum = "";

	return Controller.extend("FSC360NEW.controller.PaymentWorkbench", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf FSC360NEW.view.PaymentWorkbench
		 */
		onInit: function() {

		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this); // <-- FIX
    this.oRouter.attachRoutePatternMatched(this.fn_oninit1, this);
    var oModel = new sap.ui.model.json.JSONModel({
                items: [
                    // { text: "inv1" },
                    // { text: "inv2" },
                    // { text: "inv3" },
                    // { text: "inv4" },
                    // { text: "inv5" }
                ]
            });
            this.getView().setModel(oModel, "JMInvoice");
			var oMultiInput1 = this.getView().byId("id_vendor");
			oMultiInput1.addValidator(function(args) {
				// var text = args.text;
				return new sap.m.Token({
					key: args.text,
					text: args.text
				});
			});
			//Added by Lokesh R on 13.09.2023 -Start
			var oMultiInput2 = this.getView().byId("id_invno");
			oMultiInput2.addValidator(function(args) {
				// var text = args.text;
				return new sap.m.Token({
					key: args.text,
					text: args.text
				});
			});
			var oMultiInput3 = this.getView().byId("id_docno");
			oMultiInput3.addValidator(function(args) {
				// var text = args.text;
				return new sap.m.Token({
					key: args.text,
					text: args.text
				});
			});
			var oModel = new sap.ui.model.json.JSONModel({
				items: []
			});
			var oModel1 = new sap.ui.model.json.JSONModel({
				items: []
			});
			this.getOwnerComponent().setModel(oModel, "JMInvoice");
			this.getOwnerComponent().setModel(oModel1, "JMDoc");
			//Added by Lokesh R on 28.09.2023 - Start
			this.getOwnerComponent().getModel("JMInvoice").setSizeLimit(1000);
			this.getOwnerComponent().getModel("JMDoc").setSizeLimit(1000);
			//Added by Lokesh R on 28.09.2023 - End
			oMultiInput2.attachTokenUpdate(function(oEvent) {
				var sType = oEvent.getParameter("type"),
					aAddedTokens = oEvent.getParameter("addedTokens"),
					aRemovedTokens = oEvent.getParameter("removedTokens"),
					aContexts = oModel.getData()["items"];

				switch (sType) {
					// add new context to the data of the model, when new token is being added
					case "added":
						aAddedTokens.forEach(function(oToken) {
							aContexts.push({
								key: oToken.getKey(),
								text: oToken.getText()
							});
						});
						break;
						// remove contexts from the data of the model, when tokens are being removed
					case "removed":
						aRemovedTokens.forEach(function(oToken) {
							aContexts = aContexts.filter(function(oContext) {
								return oContext.key !== oToken.getText();
							});
						});
						break;
					default:
						break;
				}

				oModel.setProperty("/items", aContexts);
			});
			oMultiInput3.attachTokenUpdate(function(oEvent) {
				var sType1 = oEvent.getParameter("type"),
					aAddedTokens = oEvent.getParameter("addedTokens"),
					aRemovedTokens = oEvent.getParameter("removedTokens"),
					aContexts = oModel1.getData()["items"];

				switch (sType1) {
					// add new context to the data of the model, when new token is being added
					case "added":
						aAddedTokens.forEach(function(oToken) {
							aContexts.push({
								key: oToken.getKey(),
								text: oToken.getText()
							});
						});
						break;
						// remove contexts from the data of the model, when tokens are being removed
					case "removed":
						aRemovedTokens.forEach(function(oToken) {
							aContexts = aContexts.filter(function(oContext) {
								return oContext.key !== oToken.getText();
							});
						});
						break;
					default:
						break;
				}

				oModel1.setProperty("/items", aContexts);
			});
			 var oSearchConfig = new sap.ui.model.json.JSONModel({
        Prctr: true,
        Belnr: true,
        Blart: true,
        Reindat: false,
        Lifnr: true,
        Name1: true,
        Xblnr: true,
        Bldat: false,
        Dmbtr: false,
        Netdt: false,
        PayAmount: false,
        PartialPaid: false,
        Waers: true,
        Ageing: false,
        Shkzg: false
    });
    this.getView().setModel(oSearchConfig, "SearchConfig");
    var oMultiInputVendor = this.getView().byId("id_vendor");

oMultiInputVendor.addEventDelegate({
    onmouseover: function() {
        var aTokens = oMultiInputVendor.getTokens();
        if (aTokens.length > 0) {
            // Combine all token texts into one tooltip string
            var sTooltip = aTokens.map(function(oToken) {
                return oToken.getText();
            }).join(", ");

            oMultiInputVendor.setTooltip(sTooltip);
        } else {
            oMultiInputVendor.setTooltip(""); // Clear tooltip when no tokens
        }
    }
});

 // ====== INVOICE TOOLTIP ======
    var oMultiInputInvNo = this.getView().byId("id_invno");
    oMultiInputInvNo.addEventDelegate({
        onmouseover: function() {
            var aTokens = oMultiInputInvNo.getTokens();
            var sTooltip = aTokens.map(function(oToken) {
                return oToken.getText();
            }).join(", ");
            oMultiInputInvNo.setTooltip(sTooltip || "");
        }
    });

    // ====== DOCUMENT TOOLTIP ======
    var oMultiInputDocNo = this.getView().byId("id_docno");
    oMultiInputDocNo.addEventDelegate({
        onmouseover: function() {
            var aTokens = oMultiInputDocNo.getTokens();
            var sTooltip = aTokens.map(function(oToken) {
                return oToken.getText();
            }).join(", ");
            oMultiInputDocNo.setTooltip(sTooltip || "");
        }
    });
    var oErrorModel = new sap.ui.model.json.JSONModel({
        message: ""
    });
    this.getView().setModel(oErrorModel, "errorModel");
    
	// sap.ui.getCore().byId("id_cancel_pdf").attachBrowserEvent("click", this.fn_onRemoveFile, this);
		},
		onRadioNav: function(oEvent) {
            var selectedIndex = oEvent.getParameter("selectedIndex");
            

            switch (selectedIndex) {
                case 0:
                    this.oRouter.navTo("PaymentWorkbench");
                    break;
                case 1:
                    this.oRouter.navTo("PayWB-Approver");
                    break;
                case 2:
                    this.oRouter.navTo("PayWBFinal");
                    break;
                default:
                    this.oRouter.navTo("PaymentWorkbench");
            }
        },
		 fn_appr: function(oEvent) {
		 		this.oRouter.navTo("PayWB-Approver");
		 			location.reload();
		 		
		 },
		 fn_final: function(oEvent) {
		 		this.oRouter.navTo("PayWBFinal");
		 			location.reload();
		 },
		 onTokenUpdate: function (oEvent) {
    var sType = oEvent.getParameter("type"); // 'added' or 'removed'
    var oMultiInput = oEvent.getSource();
    var oModel = this.getView().getModel("JMInvoice");
    var aTokens = oModel.getProperty("/items") || [];

    if (sType === "added") {
        var aAddedTokens = oEvent.getParameter("addedTokens");

        aAddedTokens.forEach(function (oToken) {
            aTokens.push({
                text: oToken.getText()
            });
        });
    } else if (sType === "removed") {
        var aRemovedTokens = oEvent.getParameter("removedTokens");

        aRemovedTokens.forEach(function (oToken) {
            aTokens = aTokens.filter(function (item) {
                return item.text !== oToken.getText();
            });
        });
    }

    // Update the model so tokens persist properly
    oModel.setProperty("/items", aTokens);
},

		fnChange: function(oEvent) {
			var oSource = oEvent.getSource();
			var sId = oSource.getId(); // e.g. "__xmlview0--id_compcode2"
			var sSelectedKey = oSource.getSelectedKey();
			var sValue = oSource.getValue();

			// 🔹 Map of "source → target" IDs
			var mSync = {
				"id_compcode2": "id_compcode",
				"id_compcode": "id_compcode2",
				"id_profit2": "id_profit",
				"id_profit": "id_profit2"
			};

			// Extract pure ID (strip view prefix)
			var sPureId = sId.split("--").pop();
			var sTargetId = mSync[sPureId];

			if (sTargetId) {
				var oTarget = this.getView().byId(sTargetId);

				// Sync selection
				oTarget.setSelectedKey(sSelectedKey);

				// If no key, sync manual value
				if (!sSelectedKey) {
					oTarget.setValue(sValue);
				}
			}
		},
		fn_more_filters: function() {
			this.getView().byId("id_non_filter_content").setWidth("73%");
			this.getView().byId("idCardContainer").setWidth("100%");
			this.getView().byId("id_full_search").setVisible(true);
			this.getView().byId("id_half_search").setVisible(false);

		},

		fn_less_filters: function() {
			this.getView().byId("id_non_filter_content").setWidth("100%");
			this.getView().byId("idCardContainer").setWidth("73%");
			this.getView().byId("id_full_search").setVisible(false);
			this.getView().byId("id_half_search").setVisible(true);

		},
		// In your controller (e.g., controller.js)
		onAfterRendering: function() {
			var oTable = this.byId("id_table");
			var oTableDom = oTable.$().find(".sapUiTableCnt");

			// Ensure the table container has horizontal scrolling
			oTableDom.css("overflow-x", "auto");

			// Apply sticky positioning to the last column
			var oLastColumnCells = oTable.$().find(".fixed-last-column, .fixed-last-column .sapUiTableCell");
			oLastColumnCells.css({
				"position": "sticky",
				"right": "0",
				"background": "#ffffff",
				"z-index": "1",
				"box-shadow": "-2px 0 5px rgba(0, 0, 0, 0.1)"
			});
		},
		fn_oninit1: function(oEvent) {
 var oRadioGroup = this.byId("idViewSelector");
oRadioGroup.setSelectedIndex(0); 
			var page_name = oEvent.getParameter("name");
			var data_len_check = this.getView().getModel('MOpenitems').getData().length;
			if (page_name === "PaymentWorkbench") {
				this.fn_edit();
				this.fn_user();
				var arr_com_glo = this.getView().getModel('JComp');
				arr_com_glo.refresh();

				var validate_comp = this.getView().getModel('JComp').getData();

				if (validate_comp.Flag === "Y") {
					arr_directpay = [];
					var JsonoModelselecteddata = this.getView().getModel("MOpenitems");
					JsonoModelselecteddata.setData(arr_directpay);

					this.getView().byId("id_selected").setText(0);
					this.getView().byId("id_budget_text").setText(0);
					var btn = "Preview and Proceed " + " (" + 0 + ") ";
					this.getView().byId("id_btnredy").setText(btn);
					this.getView().byId("id_credit_amt").setText(0);
					this.getView().byId("id_debit_amt").setText(0);
					this.getView().byId("id_msme").setText(0);
					this.getView().byId("id_totamount").setText(0);
					this.getView().byId("id_actamount").setText(0);
					this.getView().byId("id_opencount").setText(0);
					this.OnSelectCompanyCode();
					this.fn_vendor();
					this.fn_prctr();
				} else if (validate_comp.FlagSave === "B" && data_len_check !== undefined) {
					this.fn_user();

					var oModel = this.getOwnerComponent().getModel();
					var BI = new sap.m.BusyDialog();
					var that = this;
					BI.open();
					var oModel = this.getOwnerComponent().getModel("JComp");

					oModel.loadData(
						"/sap/opu/odata/exl/PAY_ODATA_V1_SRV/CompanyCodeSet?$format=json",
						null,
						true, // async
						"GET",
						false, // cache
						false, // username
						{
							"Accept": "application/json"
						}
					);

					oModel.attachRequestCompleted(function(oEvent) {
						var oData = oEvent.getSource().getData();
						var JsonoModel = new sap.ui.model.json.JSONModel();
						JsonoModel.setData(oData.d.results);
						that.getView().setModel(JsonoModel, "MCompanyCode");

						if (oData.d.results.length === 1) {
							var bukrs = oData.d.results[0].Bukrs;
							var description = oData.d.results[0].Butxt;
							var company_code = bukrs + '-' + description;
							that.getView().byId("id_compcode").setValue(company_code);
							that.getView().byId("id_compcode2").setValue(company_code);
						}
						that.fn_vendor();
						that.fn_prctr();
					});

				} else {

					this.fn_user();
					var oModel = this.getOwnerComponent().getModel();
					this.getView().byId("id_selected").setText(0);
					var btn = "Preview and Proceed " + "(" + 0 + ")";
					this.getView().byId("id_btnredy").setText(btn);
					this.getView().byId("id_budget_text").setText(0);
					this.getView().byId("id_credit_amt").setText(0);
					this.getView().byId("id_debit_amt").setText(0);
					this.getView().byId("id_msme").setText(0);
					this.getView().byId("id_totamount").setText(0);
					this.getView().byId("id_actamount").setText(0);
					this.getView().byId("id_opencount").setText(0);
					var BI = new sap.m.BusyDialog();
					var that = this;
					// BI.open();
					var that = this;

					// Get the JSONModel (bound to PAY_ODATA_V1_SRV)
					var oModel = this.getOwnerComponent().getModel("JComp");

					oModel.loadData(
						"/sap/opu/odata/exl/PAY_ODATA_V1_SRV/CompanyCodeSet?$format=json",
						null,
						true, // async
						"GET",
						false, // cache
						false, // username
						{
							"Accept": "application/json"
						}
					);

					oModel.attachRequestCompleted(function(oEvent) {
						var oData = oEvent.getSource().getData();
						var JsonoModel = new sap.ui.model.json.JSONModel();
						JsonoModel.setData(oData.d.results);
						that.getView().setModel(JsonoModel, "MCompanyCode");

						if (oData.d.results.length === 1) {
							var bukrs = oData.d.results[0].Bukrs;
							var description = oData.d.results[0].Butxt;
							var company_code = bukrs + '-' + description;
							that.getView().byId("id_compcode").setValue(company_code);
							that.getView().byId("id_compcode2").setValue(company_code);
							that.fn_vendor();
							that.fn_prctr();
							that.F4CompanyCode();

						}
					});

					// Handle request failure
					oModel.attachRequestFailed(function() {
						this.openErrorDialog("Error while fetching CompanyCodeSet");

						// MessageBox.error("Error while fetching CompanyCodeSet");
					});

					// var BI = new sap.m.BusyDialog();
					// BI.open();
					// var that = this;
					// var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
					// Filters.push(CompanyCodeFlag);
					// oModel.read("/HeadSet", {
					//  filters: Filters,
					//  urlParameters: {
					//    $expand: "NavCompanyCode"
					//  },
					//  success: function(oData) {

					//    var JsonoModel = new sap.ui.model.json.JSONModel();
					//    JsonoModel.setData(oData.results[0].NavCompanyCode.results);
					//    that.getView().setModel(JsonoModel, "MCompanyCode");
					//    BI.close();

					//    that.onValueHelpRequestedCompanyCode();
					//  },
					//  error: function() {
					//    BI.close();
					//    MessageBox.error(" Error! ", {
					//      actions: ["OK"],
					//      onClose: function(nAction) {
					//        if (nAction === "OK") {}
					//      }
					//    });
					//  }
					// });
				}
			}
		},

		F4CompanyCode: function() {
			var that = this;
			var vflag = "ALLCC";

			$.ajax({
				url: "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/CompanyCodeSet?$format=json&$filter=Bukrs eq '" + vflag + "'",
				method: "GET",
				success: function(oData) {
					var aResults = (oData.d && oData.d.results) ? oData.d.results : oData.value;

					// Create JSON model and bind
					var JsonoModel = new sap.ui.model.json.JSONModel();
					var oJsonModel = new sap.ui.model.json.JSONModel();
					oJsonModel.setData(aResults); // directly the array
					that.getView().setModel(oJsonModel, "MCompanyCode");

					// Auto-fill if only one company code returned
					if (aResults && aResults.length === 1) {
						var bukrs = aResults[0].Bukrs;
						var description = aResults[0].Butxt;
						var company_code = bukrs + "-" + description;
						that.getView().byId("id_compcode").setValue(company_code);
						that.getView().byId("id_compcode2").setValue(company_code);
					}
				},
				error: function(err) {
					that.openErrorDialog("Error while fetching CompanyCodeSet");
					console.error("CompanyCodeSet call failed", err);
				}
			});
		}

		,
		handleSuggestCompany: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setFilterSuggests(false);

		},
		//Added by Lokesh R on 11.03.2024 - End
		fn_user: function() {
			var that = this;
			var v_flag = 'U';

			// Named JSON model JComp
			var oModel = this.getOwnerComponent().getModel("JComp");

			// Call PAY_ODATA_V1_SRV directly
			$.ajax({
				url: "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/NameSet('" + v_flag + "')?$format=json",
				method: "GET",
				success: function(oData) {
					// store the service data into JComp model
					oModel.setData(oData.d);

					// update UI fields from service response
					var uname_1 = oData.d.UserName;
					that.getView().byId("id_uname").setText(uname_1);

					// var first_letter = uname_1.charAt(0);
					// that.getView().byId("id_user").setText(first_letter);
				},
				error: function(err) {
					console.error("Error while calling PAY_ODATA_V1_SRV", err);
				}
			});
		},
		fn_vendor: function() {
			var v_compcode1 = this.getView().byId("id_compcode").getValue();
			var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));

			var that = this;

			$.ajax({
				url: "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/VendorDetailSet?$filter=Bukrs eq '" + v_compcode2 + "'&$format=json",
				method: "GET",
				success: function(oData) {
					// Defensive check: data could be in oData.d.results OR oData.value
					var aResults = (oData.d && oData.d.results) ? oData.d.results : oData.value;

					// Create JSON model and bind to view
					var JsonoModelVendor = new sap.ui.model.json.JSONModel();
					JsonoModelVendor.setData(aResults);
					that.getView().setModel(JsonoModelVendor, "MVendor");
					that.getView().getModel("MVendor").setSizeLimit(50000);
				},
				error: function(err) {
					that.openErrorDialog("Error while fetching Vendor details");
					// MessageBox.error("Error while fetching Vendor details");
					console.error("VendorDetailSet call failed", err);
				}
			});
		}

		,
		fn_prctr: function() {
			var v_compcode1 = this.getView().byId("id_compcode").getValue();
			var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));

			var that = this;

			$.ajax({
				url: "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/ProfitCenterSet?$filter=Bukrs eq '" + v_compcode2 + "'&$format=json",
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
					that.openErrorDialog("Error while fetching Profit Centers");
					// MessageBox.error("Error while fetching Profit Centers");
					console.error("ProfitCenterSet call failed", err);
				}
			});
		}

		,
		onPressMenu: function() {
			this.getView().byId("id_box").getItems()[0].setVisible(true);
			this.getView().byId("id_box").getItems()[0].addStyleClass("cl_box2oncss");
			this.getView().byId("id_box").getItems()[1].addStyleClass("cl_box3oncss");
			this.getView().byId("id_toolmenu").getContent()[0].addStyleClass("cl_menu");
			this.getView().byId("id_toolmenu").getContent()[1].removeStyleClass("cl_textalign");
			this.getView().byId("id_toolmenu").getContent()[1].addStyleClass("cl_textalign1");
		},
		onPressCross: function() {
			this.getView().byId("id_box").getItems()[0].setVisible(false);
			this.getView().byId("id_box").getItems()[0].removeStyleClass("cl_box2oncss");
			this.getView().byId("id_box").getItems()[1].removeStyleClass("cl_box3oncss");
		},
		onValueHelpRequestedCompanyCode: function() {
			this.onClickClroncompplace1();
			this.F4CompanyCode();
			if (!this.Value) {
				this.Value = sap.ui.xmlfragment("FSC360NEW.Fragment.CompanyCode", this);
				this.getView().addDependent(this.Value);
			}
			this.Value.open();
		},
		onValueHelpRequestedProfitCenter: function() {
			this.fn_prctr();
			if (!this.Value1) {

				this.Value1 = sap.ui.xmlfragment("FSC360NEW.Fragment.ProfitCenter", this);
				this.getView().addDependent(this.Value1);
			}
			this.Value1.open();
		},
		onValueHelpRequestedVendor: function() {
			if (!this.Value2) {

				this.Value2 = sap.ui.xmlfragment("FSC360NEW.Fragment.VendorPWB", this);
				this.getView().addDependent(this.Value2);
			}
			this.Value2.open();
			// this.GetVendor();
			// this.OnSelectCompanyCode();
		},
		onValueHelpBankKey: function(oEvent) {
			var oButton = oEvent.getSource();

			// get vendor row context from the pressed button
			var oCtx = oButton.getBindingContext("MVen");
			var oVendor = oCtx.getObject(); // contains Ven, Name
			var sVen = oVendor.Ven; // Lifnr / vendor code

			var arr_final = [];
			var org = this.getView().getModel("MFinalven").getData();

			// find this vendor in MFinalven
			for (var i = 0; i < org.length; i++) {
				if (org[i].Ven === sVen) {
					for (var j = 0; j < org[i].Bankkey.length; j++) {
						arr_final.push({
							"Key": org[i].Bankkey[j].Bankkey,
							"Name": org[i].Bankkey[j].BankName,
							"Account": org[i].Bankkey[j].BankNum,
							"Lifnr": org[i].Ven
						});
					}
					break; // stop once found
				}
			}

			// set MKey model
			var oJsonModel = new sap.ui.model.json.JSONModel(arr_final);
			this.getView().setModel(oJsonModel, "MKey");

			// remember vendor context (to update row later)
			this._oSelectedVendorCtx = oCtx;

			// open fragment
			if (!this.Value18) {
				this.Value18 = sap.ui.xmlfragment("FSC360NEW.Fragment.Key", this);
				this.getView().addDependent(this.Value18);
			}
			this.Value18.open();
		}

		,
		// onValueHelpBankKey: function(oEvent) {
		//   if (!this.Value10) {

		//     this.Value10 = sap.ui.xmlfragment("FSC360NEW.Fragment.BankKey", this);
		//     this.getView().addDependent(this.Value10);
		//   }
		//   this.Value10.open();
		//   // this.GetVendor();
		//   // this.OnSelectCompanyCode();
		// },
	fn_closebank: function() {
    this.Value10.close();
        this.Value10.destroy(); // Destroy the dialog completely
        this.Value10 = null;    // Clear the reference
  
},

		onSelectcompchange: function(oEvent) {
			var v_compcode = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
			var v_comdesc = oEvent.getParameters("selectedItem").selectedItems[0].getInfo();
			var str = v_compcode + "-" + v_comdesc;
			this.getView().byId("id_compcode").setValue(str);
			this.getView().byId("id_compcode2").setValue(str);
			// var comp_check = this.getView().byId("id_compcode").getValue();
			if (flag_com === 0) {
				// this.OnSelectCompanyCode();
				this.fn_vendor();
				this.fn_prctr();
				this.getView().byId("id_profit").setValue("");
				this.getView().byId("id_profit2").setValue("");
				this.getView().byId("id_vendor").setValue("");
			}
			// if(comp_check === ""){
			//    this.OnSelectCompanyCode();
			// }
			var com = this.getView().byId("id_compcode").getValue();

			var arr_com_glo = this.getView().getModel('JComp');
			arr_com_glo.Comp = com;
			arr_com_glo.Flag = "X";
			arr_com_glo.setData(arr_com_glo);
			arr_com_glo.refresh();
			this.getView().setModel(arr_com_glo, "JComp");
			this.fn_vendor();

		},
		onPressSearch: function() {
			var oSearchField = this.byId("id_search_field");
			 if (oSearchField) {
        oSearchField.setValue("");
    }

			this.OnSelectCompanyCode();

		},
		handleChange1: function() {
			var datefrom = this.getView().byId("DP1").getDateValue();
			var dateTo = this.getView().byId("DP2").getDateValue();
			if (datefrom > dateTo) {
				this.openErrorDialog("From-Date is greater than To-Date! ");
				// MessageBox.error("From-Date is greater than To-Date! ", {

				// 	actions: ["OK"],

				// 	onClose: function(nAction) {
				// 		if (nAction === "OK") {}
				// 	}
				// });
			}

		},
		OnSelectCompanyCode: function(oEvent) {
			var validate_comp = this.getView().getModel('MOpenitems');
			var arr_2 = [];

			this.getView().getModel("MOpenitems").setData(arr_2);
			validate_comp.refresh();
			arr_directpay = [];
			var btn = "Preview and Proceed " + "(" + 0 + ")";
			//this.getView().byId("id_btnredy").setText(btn);

			var length_data;
			var age1;
			var tm;
			var totamo = 0;
			var flag12 = 0;
			var v_compcode1 = this.getView().byId("id_compcode").getValue();
			var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));
			var v_profit1 = this.getView().byId("id_profit").getValue();
			var v_profit2 = v_profit1.substring(0, v_profit1.indexOf('-'));
			if (v_profit2 === "") {
				v_profit2 = v_profit1;
			}
			var v_vendor1 = this.getView().byId("id_vendor").getValue();
			var v_vendor2 = v_vendor1.substring(0, v_vendor1.indexOf('-'));
			if (v_vendor2 === "") {
				v_vendor2 = v_vendor1;
			}
			// var vendor3 = v_vendor2.toUpperCase();
			var v_age = this.getView().byId("id_filterage").getValue();
			var agef = this.getView().byId("id_combo").getValue();
			if (agef === "Over") {
				age1 = 'O';
			}

			if (agef === "Under") {
				age1 = 'U';
			}
			if (agef === "AsOnDue") {
				age1 = 'N';
			}
			// var invoiceSh = this.getView().byId("id_invoiceno").getValue();
			// var invoiceSh = invoiceno.toUpperCase();
			var datefrom = this.getView().byId("DP1").getDateValue();
			var dateTo = this.getView().byId("DP2").getDateValue();

			var Pdatefrom = this.getView().byId("DP3").getDateValue();
			var Pdateto = this.getView().byId("DP4").getDateValue();

			var obj = {};
			var oMultiInput1 = this.getView().byId("id_vendor");
			aTokens = oMultiInput1.getTokens();
			var vendor_len = aTokens.length;

			//Added by Lokesh R on 13.09.2023 - Start
			var oMultiInput2 = this.getView().byId("id_invno");
			var aTokens1 = oMultiInput2.getTokens();
			var inv_len = aTokens1.length;

			var oMultiInput3 = this.getView().byId("id_docno");
			var aTokens2 = oMultiInput3.getTokens();
			var doc_len = aTokens2.length;
			//Added by Lokesh R on 13.09.2023 - End

			var msmecheck = this.byId("id_msmecheck").getSelected();
			if (msmecheck === true) {
				tm = "X";
			} else {
				tm = "";
			}
			var v_flag = 'F';
			var Filters = [];
			var oModel = this.getView().getModel();
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();

			// var ageF = new sap.ui.model.Filter("Flag1", sap.ui.model.FilterOperator.EQ, "O");

			//
			//
			if (v_profit2 !== "") {
				// var v_profit3 = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.EQ, v_profit2);
				// Filters.push(v_profit3);
				obj.Prctr = v_profit2;
			}
			if (v_age !== '') {
				obj.Age = v_age;
			}
			if (age1 !== '') {
				// var age = new sap.ui.model.Filter("Age", sap.ui.model.FilterOperator.EQ, v_age);
				// var ageF = new sap.ui.model.Filter("Flag1", sap.ui.model.FilterOperator.EQ, age1);
				// Filters.push(age);
				// Filters.push(ageF);

				obj.Flag1 = age1;
			}
			// if (v_flag !== "") {
			//  var ProfitCenterflag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			//  Filters.push(ProfitCenterflag);
			// }
			if (vendor_len !== 0) {
				obj.navVendor2 = [];
				for (var v_it = 0; v_it < vendor_len; v_it++) {
					var vendor12 = aTokens[v_it].getKey();
					var v_vendor = {
						Lifnr: vendor12
					};

					obj.navVendor2.push(v_vendor);
				}
			}
			if (inv_len !== 0) {
				obj.navInv = [];
				for (var i = 0; i < inv_len; i++) {
					var inv2 = aTokens1[i].getText();
					var v_inv = {
						Xblnr: inv2
					};

					obj.navInv.push(v_inv);
				}
			}
			if (doc_len !== 0) {
				obj.navDoc = [];
				for (var j = 0; j < doc_len; j++) {
					var doc2 = aTokens2[j].getText();
					var v_doc = {
						Belnr: doc2
					};

					obj.navDoc.push(v_doc);
				}
			}

			if (v_compcode2 !== "") {
				// var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode2);
				// Filters.push(comcode);
				obj.Bukrs = v_compcode2;
			}

			if (datefrom !== "" && dateTo !== "") {

				obj.Fromdate = datefrom;
				obj.Todate = dateTo;

			}

			if (Pdatefrom !== "" && Pdateto !== "") {
				obj.FromPdate = Pdatefrom;
				obj.ToPdate = Pdateto;
			}

			if (tm !== "") {

				obj.MsmeInd = tm;
			}

			obj.navPay2 = [];
			if (Docyear !== "") {
				obj.Gjahr = Docyear;
			}
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			oModel.create('/OpenSet', obj, {
				success: function(oData, Response) {
					BI.close();
					if (oData.Auth !== 'E' && oData.Auth !== 'P')

					{
						flag_com = 1;

						var JsonoModelProfit = new sap.ui.model.json.JSONModel();
						JsonoModelProfit.setData(oData.navPay2.results);
						JsonoModelProfit.refresh();
						JsonoModelProfit.setSizeLimit(3000);
						JsonoModelProfit.setProperty("/edit_amount", "true");
						that.getView().setModel(JsonoModelProfit, "MProfit");

						var row = that.getView().getModel("MProfit").length;
						var oMod = that.getView().getModel("MProfit").getData();
						length_data = oData.navPay2.results.length;

						if (length_data) {
							for (var i = 0; i < length_data; i++) {
								oMod[i].Lifnr = oMod[i].Lifnr;
							}
						}
						JsonoModelProfit.refresh();

						var overdue = oData.Count1;

						var open_count = oData.navPay2.results.length;
						var tot_msme = that.getView().byId("id_msme").getText();
						var deb = that.getView().byId("id_credit_amt").getText();
						var cre = that.getView().byId("id_debit_amt").getText();
						var redy = that.getView().byId("id_btnredy").getText();
						var totalamount1 = that.getView().byId("id_totamount").getText();
						var tot = that.getView().byId("id_actamount").getText();

						var budget5 = that.getView().byId("id_budget_text").getText();
						var opern_row_co = oData.navPay2.results.length;
						that.fn_setText(opern_row_co, overdue, tot_msme, deb, cre, redy, totalamount1, budget5, tot);
						if (length_data === 0) {
							that.openErrorDialog(" No Data Found! ");
							// MessageBox.error(" No Data Found! ", {
							// 	actions: ["OK"],
							// 	onClose: function(nAction) {
							// 		if (nAction === "OK") {

							// 		}
							// 	}
							// });
						}
						that.getView().byId("id_debit").setSelected(true);
						that.getView().byId("id_credit").setSelected(true);
						that.onselect();

						var oTable = that.getView().byId("id_table");
						var mprofit1 = that.getView().getModel("MProfit").getData();
						var amount_len_2 = mprofit1.length;

						that.onSelectOpenItems();

					} else {
						if (oData.Auth === 'E') {
								that.openErrorDialog("No Authorization for Processing ");
							// MessageBox.error("No Authorization for Processing ", {
							// 	actions: ["OK"],
							// 	onClose: function(nAction) {
							// 		if (nAction === "OK") {

							// 		}
							// 	}
							// });
						} else if (oData.Auth === 'P') {
								that.openErrorDialog("Please Maintain Profit Centre Parameter in User master");
							// MessageBox.error("Please Maintain Profit Centre Parameter in User master", {
							// 	actions: ["OK"],
							// 	onClose: function(nAction) {
							// 		if (nAction === "OK") {

							// 		}
							// 	}
							// });
						}
					}

				},
				error: function() {
					BI.close();
						this.openErrorDialog(" Error! ");
					// MessageBox.error(" Error! ", {
					// 	actions: ["OK"],
					// 	onClose: function(nAction) {
					// 		if (nAction === "OK") {}
					// 	}
					// });
				}
			});

		},
		OnSelectVendor: function(oEvent) {

			var oItem = oEvent.getParameters().selectedItems;
			// var item =oEvent.getParameters("selectedItem");
			// var context = item.getBindingContext();

			var vArray = [];
			var oEn = {};

			var oMultiInput1 = this.getView().byId("id_vendor");
			aTokens = oMultiInput1.getTokens();

			if (oItem.length !== 0) {

				var i;
				for (i = 0; i < oItem.length; i++) {
					var Problem = oItem[i].getTitle();
					var vTokenv = new sap.m.Token({
						text: Problem,
						key: Problem
					});
					aTokens.push(vTokenv);
					oMultiInput1.removeAllTokens();
					oMultiInput1.setTokens(aTokens);
					// oMultiInput1.addValidator(function(args) {
					//  // var text = args.text;
					//  return new new sap.m.Token({
					//    key: args.text,
					//    text: args.text
					//  });
					// });
				}
			}

			// var v_vendor = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
			// var v_vendordes = oEvent.getParameters("selectedItem").selectedItems[0].getInfo();
			// var str = v_vendor + "-" + v_vendordes;
			// this.getView().byId("id_vendor").setValue(str);
			if (this.Value2) {

				oEvent.getSource().getBinding("items").filter([]);

			}
			// this.onVendorBank();

		},
		OnSelectVendorBank: function(oEvent) {

			var oItem = oEvent.getParameters().selectedItems;

			var vArray = [];
			var oEn = {};

			var oMultiInput1 = this.getView().byId("id_vendorbank");
			aTokens = oMultiInput1.getTokens();

			if (oItem.length !== 0) {

				var i;
				for (i = 0; i < oItem.length; i++) {
					var Problem = oItem[i].getTitle();
					var vTokenv = new sap.m.Token({
						text: Problem,
						key: Problem
					});
					aTokens.push(vTokenv);
					oMultiInput1.removeAllTokens();
					oMultiInput1.setTokens(aTokens);
				}
			}
			if (this.Value2) {

				oEvent.getSource().getBinding("items").filter([]);

			}

		},
		onSubmitFilter: function() {
			this.OnSelectCompanyCode();
		},
		onClickClr: function() {
			// this.getView().byId("id_vendor").setValue("");
			// start of added on 14.05.2021
			this.getView().byId("id_vendor").destroyTokens();
			//Added by Lokesh R on 28.09.2023 - Start
			this.getView().byId("DP3").setValue("");
			this.getView().byId("DP4").setValue("");
			var oModel = this.getView().getModel("JMInvoice");
			var aContexts = [];
			oModel.setProperty("/items", aContexts);

			var oModel1 = this.getView().getModel("JMDoc");
			var aContexts1 = [];
			oModel1.setProperty("/items", aContexts1);
			//Added by Lokesh R on 28.09.2023 - End
			// end of added on 14.05.2021
			this.getView().byId("id_filterage").setValue("");
			this.getView().byId("id_combo").setValue("");
			// this.getView().byId("id_invoiceno").setValue("");
			this.getView().byId("DP1").setValue("");
			this.getView().byId("DP2").setValue("");
			this.byId("id_msmecheck").setSelected(false);
			// this.getView().byId("id_budget").setValue("");
			this.getView().byId("id_budget_text").setText(0);
			// uname_1 = oData.results[0].UserName;
			this.getView().byId("id_uname").setText(uname_1);
			//first_letter = uname_1.charAt(0);
			//this.getView().byId("id_user").setText(first_letter);
			// this.OnSelectCompanyCode(); Commented by Lokesh R on 04.10.2023
		},
	fn_closedetail: function() {
    if (this.Details) {
        this.Details.close();   // just close
    }
    // clear/reset models
    var arr = [];
    var JsonoModelVen = new sap.ui.model.json.JSONModel(arr);
    this.getView().setModel(JsonoModelVen, "MFinalven");
    this.getView().setModel(JsonoModelVen, "MKey");
    this.getView().getModel("MVen").setData(arr);
    sap.ui.getCore().byId("id_CreateItem_Document").setValue(null);
    sap.ui.getCore().byId("id_payloc").setValue("");
    sap.ui.getCore().byId("textAreaWithBinding2").setValue("");
}
,
		fn_closedetail1: function() {
			if (!this.Details1) {
				this.Details1 = sap.ui.xmlfragment("FSC360NEW.Fragment.Detail1", this);
				this.getView().addDependent(this.Details1);
			}
			this.Details1.close();
			  this.Details1.destroy(); // Destroy the dialog completely
       this.Details1 = null;  
		},
		fn_closesuccess: function() {
			if (!this.Success) {
				this.Success = sap.ui.xmlfragment("FSC360NEW.Fragment.InitSuccess", this);
				this.getView().addDependent(this.Success);
			}
			this.Success.close();
			window.location.reload();
		},
		fn_submitdetail: function() {
			var payloc1 = sap.ui.getCore().byId("id_payloc").getValue();
			var remarks = sap.ui.getCore().byId("textAreaWithBinding2").getValue();
			var oBankKey = this.getView().getModel("MFinalven").getData();
			var file = binaryData;
			var MessageVen = "";
			if (payloc1 !== "" && remarks !== "") { //&& file.length !== 0 Commented by Lokesh R on 17.05.2024
				if (!this.Details) {
					this.Details = sap.ui.xmlfragment("FSC360NEW.Fragment.Details", this);
					this.getView().addDependent(this.Details);
				}
				this.Details.close();
				var totalamount = 0;
				var payment = sap.ui.getCore().byId("id_payloc").getValue();
				var obj = {};
				var BI = new sap.m.BusyDialog();
				BI.open();
				var serialmodel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
				var that = this;
				var v_compcode1 = this.getView().byId("id_compcode").getValue();
				v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));
				obj.Bukrs = v_compcode2;
				obj.NavPay = [];
				obj.NavRet1 = [];
				obj.NavMessage = [];
				obj.NavTrans = [];
				var arr_directpay1 = [];
				var final_arr = [];
				final_arr = this.getView().getModel("MOpenitems").getData();
				if (final_arr.length != 0) {
					for (var i = 0; i < final_arr.length; i++) {
						arr_directpay1.push(final_arr[i]);
						if (arr_directpay1[i].Shkzg == 'H') {
							totalamount = parseFloat(totalamount) + parseFloat(arr_directpay1[i].PayAmount);
						} else if (arr_directpay1[i].Shkzg == 'S') {

							totalamount = parseFloat(totalamount) - parseFloat(arr_directpay1[i].PayAmount);
						}
						for (var j = 0; j < oBankKey.length; j++) {
							if (oBankKey[j].Ven === arr_directpay1[i].Lifnr) {
								if (oBankKey[j].Final_Key !== "" && typeof(oBankKey[j].Final_Key) !== 'undefined') {
									arr_directpay1[i].Bankkey = oBankKey[j].Final_Key;
									arr_directpay1[i].Banka = oBankKey[j].Banka;
									arr_directpay1[i].Bankn = oBankKey[j].Bankn;
								} else {
									MessageVen = "Error";
									break;
								}
							}
						}
					}
				}
				that = this;
				obj.Balance = totalamount.toString();
				obj.Flag = 'I';
				obj.Remarks = sap.ui.getCore().byId("textAreaWithBinding2").getValue();
				obj.ZsapValue = payment;
				var count = 0; //Added by Lokesh R on 09.08.2024
				for (var cr = 0; cr < arr_directpay1.length; cr++) {
					var temp = {};
					count = count + 1;
					temp = arr_directpay1[cr];
					temp.Sno = String(count);
					temp.Belnr = String(temp.Belnr);
					obj.NavPay.push(temp);
				}
				if (MessageVen === "Error") {
						that.openErrorDialog("Please Select the Bank Key for vendors");
							sap.ui.getCore().byId("id_CreateItem_Document").setValue(null);
							sap.ui.getCore().byId("id_payloc").setValue(null);
							sap.ui.getCore().byId("textAreaWithBinding2").setValue(null);
					// sap.m.MessageBox.error("Please Select the Bank Key for vendors", {
					// 	title: "Error", // default
					// 	onClose: function(oAction) {
					// 		sap.ui.getCore().byId("id_CreateItem_Document").setValue(null);
					// 		sap.ui.getCore().byId("id_payloc").setValue(null);
					// 		sap.ui.getCore().byId("textAreaWithBinding2").setValue(null);
					// 		BI.close();
					// 	}, // default
					// 	styleClass: "", // default
					// 	actions: sap.m.MessageBox.Action.CLOSE, // default
					// 	emphasizedAction: null, // default
					// 	initialFocus: null, // default
					// 	textDirection: sap.ui.core.TextDirection.Inherit // default
					// });
				} else {
					serialmodel.create('/HeadSet', obj, {
						success: function(oData) {
							var oMessage = "";
							if (oData.NavRet1.results.length !== 0) {
								if (oData.NavRet1.results[0].Type === 'E') {
									oMessage = oData.NavRet1.results[0].Message;
								}
							}
							if (oMessage === "") {
								if (!that.Success) {
									that.Success = sap.ui.xmlfragment("FSC360NEW.Fragment.InitSuccess", that);
									that.getView().addDependent(that.Success);
									BI.close();
								}

								that.fnUpload(oData.Transid);
								that.Success.open();
								SuccessInd = 'X';
							var transId = parseInt(oData.Transid, 10);
sap.ui.getCore().byId("id_pid").setText("Proposal ID " + transId);

								sap.ui.getCore().byId("id_CreateItem_Document").setValue(null);
								sap.ui.getCore().byId("id_payloc").setValue(null);
								sap.ui.getCore().byId("textAreaWithBinding2").setValue(null);
							} else {
									that.openErrorDialog(oMessage);
										BI.close();
								// sap.m.MessageBox.error(oMessage, {
								// 	title: "Error", // default
								// 	onClose: function(oAction) {
								// 		BI.close();
								// 	}, // default
								// 	styleClass: "", // default
								// 	actions: sap.m.MessageBox.Action.CLOSE, // default
								// 	emphasizedAction: null, // default
								// 	initialFocus: null, // default
								// 	textDirection: sap.ui.core.TextDirection.Inherit // default
								// });
							}

						},
						error: function(oEvent) {
							BI.close();
								that.openErrorDialog("Error!");
// 							sap.m.MessageBox.error("Error!", {
//     actions: [sap.m.MessageBox.Action.OK],
//     onClose: function (oAction) {
//         if (oAction === sap.m.MessageBox.Action.OK) {
//             BI.close();
//         }
//     }
// });

							BI.close();

						}
					});
				}
			} else {
					this.openErrorDialog(" Please fill all the fields! ");
				// MessageBox.error(" Please fill all the fields! ", {

				// 	actions: ["OK"],

				// 	onClose: function(nAction) {
				// 		if (nAction === "OK") {
				// 			BI.close();
				// 		}
				// 	}
				// });
				BI.close();
			}
		},
		fn_openFileDialog: function(oEvent) {
			// Get the source of the event (the Attach button)
			var oButton = oEvent.getSource();

			// Get the parent CustomListItem
			// Button -> Toolbar -> VBox -> CustomListItem
			var oCustomListItem = oButton.getParent(); // Toolbar
			oCustomListItem = oCustomListItem.getParent(); // VBox
			oCustomListItem = oCustomListItem.getParent(); // CustomListItem

			// Verify we have the CustomListItem
			if (oCustomListItem instanceof sap.m.CustomListItem) {
				// Get the content of CustomListItem (returns an array with the VBox)
				var aContent = oCustomListItem.getContent();
				if (aContent && aContent.length > 0) {
					// The first content is the VBox
					var oVBox = aContent[0];
					// Get the items of the VBox (contains Toolbar)
					var aVBoxItems = oVBox.getItems();
					if (aVBoxItems && aVBoxItems.length > 0) {
						// The first item is the Toolbar
						var oToolbar = aVBoxItems[0];
						// Get the content of the Toolbar
						var aToolbarContent = oToolbar.getContent();
						// Find the FileUploader in the Toolbar content
						var oFileUploader = aToolbarContent.find(function(oControl) {
							return oControl instanceof sap.ui.unified.FileUploader;
						});

						if (oFileUploader) {
							// Workaround: Trigger the file input dialog by simulating a click
							var $fileInput = oFileUploader.$().find("input[type=file]");
							if ($fileInput.length > 0) {
								$fileInput.trigger("click");
							} else {
								MessageToast.show("File input element not found.");
							}
						} else {
							MessageToast.show("FileUploader control not found.");
						}
					} else {
						MessageToast.show("Toolbar not found in VBox.");
					}
				} else {
					MessageToast.show("VBox not found in CustomListItem.");
				}
			} else {
				MessageToast.show("CustomListItem not found.");
			}
		},
		OnSelectProfitCenter: function(oEvent) {
			var v_profit = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
			var v_profitdes = oEvent.getParameters("selectedItem").selectedItems[0].getInfo();
			var str = v_profit + "-" + v_profitdes;
			this.getView().byId("id_profit").setValue(str);
			this.getView().byId("id_profit2").setValue(str);
			if (this.Value1) {
				oEvent.getSource().getBinding("items").filter([]);
				this.Value1.close();
			}

		},
		handleSearchCompanyCode: function(oEvent) {
			var sValue = oEvent.getParameter("value");

			var Filter1 = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Butxt", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);

		},
		handleSearchProfitCenter: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("ProfitCtr", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("PctrName", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		handleSearchVendor: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var allFilter = [];
			if (sValue !== "") {
				var Filter1 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
				var Filter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
				var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
				oEvent.getSource().getBinding("items").filter(allFilter);
			} else {
				allFilter = [];
				sValue = "";
			}

		},

		handleSearchVendorBank: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var allFilter = [];
			if (sValue !== "") {
				var Filter1 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
				var Filter2 = new sap.ui.model.Filter("Bankkey", sap.ui.model.FilterOperator.Contains, sValue);
				var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
				oEvent.getSource().getBinding("items").filter(allFilter);
			} else {
				allFilter = [];
				sValue = "";
			}

		},

		// onSelectOpenItems: function() {
		//  var myTable = this.getView().byId("id_table");
		//  var selectedIndeices = myTable.getSelectedIndices();
		//  var len = selectedIndeices.length;
		//  this.getView().byId("id_selected").setText(len);

		//  // var budget = this.getView().byId("id_budget").getValue();
		//  // var Amount = myTable.getContextByIndex(myTable.getSelectedIndex()).getObject().PayAmount;
		//  // for(var t=0;t<len;t++){
		//  //  totamo = parseFloat(totamo) +parseFloat( Amount);
		//  //  if( totamo > budget ){
		//  //      MessageBox.error("Payamount exceeded the Budget!!! ", {
		//  //    actions: ["OK"],
		//  //    onClose: function(nAction) {
		//  //      if (nAction === "OK") {}
		//  //    }
		//  //  });
		//  // }
		//  //  }

		// },
			onSelectOpenItems: function(oEvent) {
			var myTable = this.getView().byId("id_table");

			// Get selected row indices
			var aIndices = myTable.getSelectedIndices();
			var len = aIndices.length;

			// Set the count in your text field
			this.getView().byId("id_selected").setText(len);
			if (len > 0) {
				this.onPressSave(); // directly call save function
			}
			else{
					var btn = "Preview and Proceed " + "(" + 0 + ")";
						this.getView().byId("id_btnredy").setText(btn);
					this.getView().byId("id_credit_amt").setText(0);
					this.getView().byId("id_debit_amt").setText(0);
					this.getView().byId("id_msme").setText(0);
					this.getView().byId("id_totamount").setText(0);
					this.getView().byId("id_actamount").setText(0);
					this.getView().byId("id_opencount").setText(0);

			}

		},
		fn_detailtabchange: function() {
			var totamo = 0;
			var myTable = this.getView().byId("id_table");
			var len = this.getView().byId("id_table").getSelectedItems().length;
			this.getView().byId("id_selected").setText(len);
		},
		onPayAmountchange: function(oEvent) {
    var oInput = oEvent.getSource();
    var value = parseFloat(oInput.getValue()) || 0;

    // Get the binding context of the current row
    var oContext = oInput.getBindingContext("MProfit");
    var oRowData = oContext.getObject();

    var amount = parseFloat(oRowData.Dmbtr) || 0;        // Amount from model
    var partialpaid = parseFloat(oRowData.PartialPaid) || 0; // Partial paid amount

    if (partialpaid === 0) {
        if (value <= amount) {
            oInput.setValue(value);
            this.fn_calculate();
        } else {
            oInput.setValue(amount);
            this.onPressSave();
        }
    } else {
        var maxValue = amount - partialpaid;
        if (value <= maxValue) {
            oInput.setValue(value);
            this.fn_calculate();
        } else {
            oInput.setValue(maxValue);
        }
    }
},

// onPayAmountchange:function(oEvent){
// 	// this.onPressSave();
// // line added by yasin start
//   var oInput = oEvent.getSource();
//     var sValue = oInput.getValue();

//     // Get the binding context of the current row
//     var oContext = oInput.getBindingContext("MProfit");

//     // Get the full object (row data)
//     var oRowData = oContext.getObject();
//     // var sPayAmount = oRowData.PayAmount;
//     // var sPartialPaid = oRowData.PartialPaid;
//     // var sTotalAmount = oRowData.Amount; 
// //line added by yasin end
//   var t = 0;
//       var value = oEvent.getSource().getValue();
//       var amount = oRowData.PayAmount;
//       var partialpaid = oRowData.PartialPaid;
//       // value = Number(value);
//       // value = value.replace(/[^0-9]/g, ''); //added By dinesh 15.05.2021/
//       // oEvent.getSource().setValue(value); //added By dinesh 15.05.2021
//       // value = value.replace(/[^\d]/g, '');
//       // if(value !== "")
//       //          {
//       // if(value !== "") //added By dinesh 15.05.2021
//       // {
//       if (parseFloat(partialpaid) === 0) {
//         if (parseFloat(value) <= parseFloat(amount)) {
//           oEvent.getSource().setValue(value);
//           this.fn_calculate();
//         }
//         if (parseFloat(value) > parseFloat(amount)) {
//           oEvent.getSource().setValue(amount);

//         }
//       }
//       if (parseFloat(partialpaid) !== 0) {

//         var value3 = partialpaid;
//         var value4 = parseFloat(amount) - parseFloat(value3);
//         if (parseFloat(value) <= parseFloat(value4)) {
//           oEvent.getSource().setValue(value);
//           this.fn_calculate();
//         }
//         if (parseFloat(value) > parseFloat(value4)) {

//           oEvent.getSource().setValue(value);
//         }
//       }

//       // }
//       // else //added By dinesh 15.05.2021
//       // {
//       //    // oEvent.getSource().setValue(amount);&nbsp;&nbsp;
//       // }

//       // For Total amount

//     },
    //  fn_calculate: function() {
    //   var totalamount = 0;
    //   var total_msme = 0;
    //   var msmeselected = 0;
    //   var Table_open = this.getView().byId("id_tablepay");
    //   var myTableRows = Table_open.getRows();
    //   var arr_directpay = [];
    //   var selectedIndeices = Table_open.getSelectedIndices();
    //   if (selectedIndeices.length != 0) {
    //     var model = this.getView().getModel("Mopen");
    //     var model1 = this.getView().getModel("Mopen").getData();
    //     for (var i = 0; i < selectedIndeices.length; i++) {
    //       var data = model.getData()[selectedIndeices[i]];
    //       arr_directpay.push(data);
    //       if (arr_directpay[i].Shkzg == 'H') {
    //         totalamount = parseFloat(totalamount) + parseFloat(arr_directpay[i].PayAmount);
    //       } else if (arr_directpay[i].Shkzg == 'S') {

    //         totalamount = parseFloat(totalamount) - parseFloat(arr_directpay[i].PayAmount);
    //       }
    //     }
    //   }
    //   vTotal = totalamount;
    //   var total_amt = totalamount;
    //   var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
    //     style: "INR",
    //     currencyCode: false
    //   });
    //   var act_amt = oCurrencyFormatter.format(totalamount);
    //   var tot1 = (parseFloat(totalamount) / 100000).toFixed(4);
    //   this.getView().byId("id_totalamo").setText(tot1);
    //   this.getView().byId("id_actamo").setText(act_amt);
    //   for (var y = 0; y < arr_directpay.length; y++) {
    //     if (arr_directpay[y].Mindk !== '') {
    //       msmeselected++;
    //       if (arr_directpay[y].Shkzg == 'H') {
    //         total_msme = parseFloat(total_msme) + parseFloat(arr_directpay[y].PayAmount);
    //       } else if (arr_directpay[y].Shkzg == 'S') {

    //         total_msme = parseFloat(total_msme) - parseFloat(arr_directpay[y].PayAmount);
    //       }
    //     }
    //   }
    //   var tot_msme = (parseFloat(total_msme) / 100000).toFixed(4);
    //   this.getView().byId("id_msme1").setText(tot_msme);
    //   this.getView().byId("id_msmeselected").setText(msmeselected);

    // },
  fn_calculate: function () {
    var totalamount = 0;
    var total_msme = 0;
    var msmeselected = 0;

    var oTable = this.getView().byId("id_table");
    var aSelectedIndices = oTable.getSelectedIndices();

    if (aSelectedIndices.length === 0) {
        this.openErrorDialog("Select at least 1 line item!");
        return;
    }

    var arr_directpay = [];

    aSelectedIndices.forEach(function (iIndex) {
        var oContext = oTable.getContextByIndex(iIndex);
        if (!oContext) return;

        // 🔹 Directly get the row data from the bound model
        var oRowData = oContext.getObject();

        arr_directpay.push(oRowData);

        var payAmount = parseFloat(oRowData.PayAmount || "0");
        var shkzg = oRowData.Shkzg; // H or S

        if (shkzg === "H") {
            totalamount += payAmount;
        } else if (shkzg === "S") {
            totalamount -= payAmount;
        }
    });

    // 🔹 MSME totals
    arr_directpay.forEach(function (row) {
        if (row.Mindk && row.Mindk !== "") {
            msmeselected++;
            if (row.Shkzg === "H") {
                total_msme += parseFloat(row.PayAmount || "0");
            } else if (row.Shkzg === "S") {
                total_msme -= parseFloat(row.PayAmount || "0");
            }
        }
    });

    // 🔹 Format the totals
    var oCurrencyFormatter = sap.ui.core.format.NumberFormat.getCurrencyInstance({
        style: "INR",
        currencyCode: false
    });

    var act_amt = oCurrencyFormatter.format(totalamount);
    var tot1 = (totalamount / 100000).toFixed(4);
    var tot_msme = (total_msme / 100000).toFixed(4);

    // 🔹 Update UI
    // this.getView().byId("id_totalamo").setText(tot1);
    // this.getView().byId("id_actamo").setText(act_amt);
    // this.getView().byId("id_msme1").setText(tot_msme);
    // this.getView().byId("id_msmeselected").setText(msmeselected);

    // Optional: trigger save if needed
    this.onPressSave();
},


		onPressSave: function() {
			var BI = new sap.m.BusyDialog();
			BI.open();
			var arr_sele = [];
			var vTotal = this.getView().byId("id_totamount").getText();
			var length_selected = this.getView().byId("id_selected").getText();
			if (length_selected === "0") {
				BI.close();
			
								this.openErrorDialog( "Select atleast 1 line item! ");
				// MessageBox.error(" Select atleast 1 line item! ", {
				// 	actions: ["OK"],
				// 	onClose: function(nAction) {
				// 		if (nAction === "OK") {}
				// 	}
				// });
			} else {

				var credit_amount = 0;
				var debit_amount = 0;
				var total_msme = 0;
				var profit_model = this.getView().getModel("MProfit").getData();

				var myTable = this.getView().byId("id_table");
				var aIndices = myTable.getSelectedIndices();
				var arr_directpay = [];

				for (var i = 0; i < aIndices.length; i++) {
					var oContext = myTable.getContextByIndex(aIndices[i]);
					var data1 = oContext.getObject();
					arr_directpay.push(data1);
				}

				for (var t = 0; t < arr_directpay.length; t++) {
					if (arr_directpay[t].Lifnr !== "") {
						arr_directpay[t].Lifnr = String(arr_directpay[t].Lifnr);
					}
					if (arr_directpay[t].Shkzg === "S") {
						credit_amount = parseFloat(credit_amount) + parseFloat(arr_directpay[t].PayAmount);
					}
					if (arr_directpay[t].Shkzg === "H") {
						debit_amount = parseFloat(debit_amount) + parseFloat(arr_directpay[t].PayAmount);
					}
					if (arr_directpay[t].Mindk !== '') {
						total_msme = parseFloat(total_msme) + parseFloat(arr_directpay[t].PayAmount);
					}

				}
				var cre1 = (parseFloat(credit_amount) / 100000).toFixed(5); //5 Changed by Lokesh R on 19.09.2024
				var deb1 = (parseFloat(debit_amount) / 100000).toFixed(5); //5 Changed by Lokesh R on 19.09.2024
				var tot1 = deb1 - cre1;
				tot1 = tot1.toFixed(5); //5 Changed by Lokesh R on 19.09.2024
				var totalamount2 = "";
				totalamount2 = tot1;
				if (totalamount2 <= 0) {
						this.openErrorDialog(" Total Amount should not be in Negative ! ");
							BI.close();
					// MessageBox.error(" Total Amount should not be in Negative ! ", {
					// 	actions: ["OK"],
					// 	onClose: function(nAction) {
					// 		if (nAction === "OK") {
					// 			BI.close();
					// 		}
					// 	}
					// });
					this.onSubmitFilter();
				} else {
					var oJSONModel = this.getView().getModel("MProfit");
					oJSONModel.setData(profit_model);
					this.getView().setModel(oJSONModel, "MProfit");
					oJSONModel.refresh();
					var JsonoModelselecteddata = this.getView().getModel("MOpenitems");
					JsonoModelselecteddata.setData(arr_directpay);
					this.getView().setModel(JsonoModelselecteddata, "MOpenitems");

					var final_arr = this.getView().getModel("MOpenitems").getData();

					var tot_msme = (parseFloat(total_msme) / 100000).toFixed(5); //5 Changed by Lokesh R on 19.09.2024
					var act_amt = debit_amount - credit_amount; //Actual amount
					var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
						style: "INR",
						currencyCode: false
					});
					var act_amt = oCurrencyFormatter.format(act_amt);
					var cre = (parseFloat(credit_amount) / 100000).toFixed(5); //5 Changed by Lokesh R on 19.09.2024
					var deb = (parseFloat(debit_amount) / 100000).toFixed(5); //5 Changed by Lokesh R on 19.09.2024

					var overdue = this.getView().byId("id_overcount").getText();
					var tot = deb - cre;
					tot = tot.toFixed(5); //5 Changed by Lokesh R on 19.09.2024
					var totalamount1 = "";
					var totalamount1 = tot;
					var row = this.getView().getModel("MProfit").getData();
					var opern_row_co = (row.length - final_arr.length) + final_arr.length;
					// this.getView().byId("id_table").clearSelection();

					//this.onSelectOpenItems();
					//var ready_process_count = final_arr.length;
					var ready_process_count = aIndices.length;
					var redy = "Preview and Proceed " + "(" + ready_process_count + ")";
					var budget5 = this.getView().byId("id_budget_text").getText();
					BI.close();
					this.onVendorBank();
					// this.getView().byId("id_table").clearSelection();
					this.fn_setText(opern_row_co, overdue, tot_msme, deb, cre, redy, totalamount1, budget5, act_amt);
				}
			}
		},
	onClickReady: function () {
    var length_selected_ready = this.getView().byId("id_btnredy").getText();
    var arr_com_glo1 = this.getView().getModel('JComp');
    arr_com_glo1.FlagSave = "S";
    arr_com_glo1.setData(arr_com_glo1);
    arr_com_glo1.refresh();
    this.getView().setModel(arr_com_glo1, "JComp");

    if (length_selected_ready === "Preview and Proceed (0)") {
    		this.openErrorDialog("Please select items and Save the data");
        // sap.m.MessageBox.error("Please select items and Save the data", {
        //     actions: ["OK"],
        //     onClose: function (nAction) {
        //         if (nAction === "OK") {}
        //     }
        // });
    } else {
        // Get company code
        var v_compcode1 = this.getView().byId("id_compcode").getValue();
        var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));

        // Get data from MOpenitems model
        var final_arr = this.getView().getModel("MOpenitems").getData();
        var arr = [];
        var arr1 = [];

        // Create vendor array with AttachmentIndicator
        for (var i = 0; i < final_arr.length; i++) {
            var temp = {
                Ven: final_arr[i].Lifnr,
                Name: final_arr[i].Name1,
                AttachmentIndicator: "N", // Initialize AttachmentIndicator
                file: "", // Initialize file property for FileUploader binding,
                  KeySelected: false  
            };
            arr.push(temp);
            arr1.push(final_arr[i].Lifnr);
        }

        // Create unique vendor list
        var unique = [];
        var unique1 = [];
        for (i = 0; i < arr1.length; i++) {
            if (unique1.indexOf(arr1[i]) === -1) {
                unique1.push(arr1[i]);
                unique.push(arr[i]);
            }
        }
  
        // Set MVen model
        var JsonoModel = new sap.ui.model.json.JSONModel();
        JsonoModel.setData(unique);
        this.getView().setModel(JsonoModel, "MVen");

        // Open Details fragment
        if (!this.Details) {
            this.Details = sap.ui.xmlfragment("FSC360NEW.Fragment.Details", this);
            this.getView().addDependent(this.Details);
            this.getPaymentLoc(v_compcode2);
        }
        this.Details.open();

        // Create MFinalven model with bank details and AttachmentIndicator
        var oData = this.getView().getModel("MVen").getData();
        var oData1 = this.getView().getModel("MBank").getData();
        var arrVen = [];

        for (var k = 0; k < oData.length; k++) {
            var arrVen1 = [];
            for (var j = 0; j < oData1.length; j++) {
                if (oData[k].Ven === oData1[j].Lifnr) {
                    var Key = {
                        Bankkey: oData1[j].Bankkey,
                        BankName: oData1[j].Banka,
                        BankNum: oData1[j].Bankn
                    };
                    arrVen1.push(Key);
                }
            }
            var Bank = {
                Ven: oData[k].Ven,
                Name: oData[k].Name,
                Bankkey: arrVen1,
                AttachmentIndicator: "N", // Initialize AttachmentIndicator
                file: "" // Initialize file property
            };
            arrVen.push(Bank);
        }

        // Set MFinalven model
        var JsonoModelVen = new sap.ui.model.json.JSONModel();
        JsonoModelVen.setData(arrVen);
        this.getView().setModel(JsonoModelVen, "MFinalven");
    }
},
		onValueHelpRequestPaymentLoc: function() {
			if (!this.ValuePay) {
				this.ValuePay = sap.ui.xmlfragment("FSC360NEW.Fragment.PaymentLoc", this);
				this.getView().addDependent(this.ValuePay);
			}
			this.ValuePay.open();
		},

		onSelectPaymentLoc: function(oEvent) {
			v_payloc = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
			sap.ui.getCore().byId("id_payloc").setValue(v_payloc);
			if (this.ValuePay) {

				oEvent.getSource().getBinding("items").filter([]);

			}
		},

		handleSuggestPayment: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			sTerm = sTerm.trim().toUpperCase();
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("ZsapValue", sap.ui.model.FilterOperator.Contains, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		},
		getPaymentLoc: function(v_compcode2) {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var Filters = [];
			// var ccode = this.getView().byId("id_compcode").getValue();
			var CompanyCodeFlag = new sap.ui.model.Filter("ZfieldRef", sap.ui.model.FilterOperator.EQ, v_compcode2);
			Filters.push(CompanyCodeFlag);
			oModel.read("/PaymentLocSet", {
				filters: Filters,
			success: function(oData) {
    var JsonoModel = new sap.ui.model.json.JSONModel();
    JsonoModel.setData(oData.results);
    that.getView().setModel(JsonoModel, "MPaymentLoc");

   
}
,
				error: function() {}
			});

		},
fnSearchField: function(oEvent) {
    var sQuery = oEvent.getSource().getValue(); 
    var oTable = this.byId("id_table");
    var oBinding = oTable.getBinding("rows");
    var oConfig = this.getView().getModel("SearchConfig").getData();

    if (!sQuery) {
        oBinding.filter([]);
        return;
    }

    var aFilters = [];

    // String based filters
    ["Prctr","Belnr","Blart","Lifnr","Name1","Xblnr","Waers","Shkzg"].forEach(function(sField) {
        if (oConfig[sField]) {
            aFilters.push(new sap.ui.model.Filter(sField, sap.ui.model.FilterOperator.Contains, sQuery));
        }
    });

    // Numeric/date → use EQ (can also cast string if needed)
    ["Dmbtr","PayAmount","PartialPaid","Ageing","Reindat","Bldat","Netdt"].forEach(function(sField) {
        if (oConfig[sField]) {
            aFilters.push(new sap.ui.model.Filter(sField, sap.ui.model.FilterOperator.EQ, sQuery));
        }
    });

    var oFilter = new sap.ui.model.Filter({
        filters: aFilters,
        and: false // OR
    });

    oBinding.filter(oFilter);
}

,
		fnSearchPop: function(oEvent) {
			var oButton = oEvent && oEvent.getSource ? oEvent.getSource() : null;

			if (!oButton) {
				sap.m.MessageToast.show("No source control for popover.");
				return;
			}

			if (!this._PopOverSearch) {
				this._PopOverSearch = sap.ui.xmlfragment("FSC360NEW.fragment.SearchfragPayment", this);
				this.getView().addDependent(this._PopOverSearch);
				sap.ui.getCore().byId("cb_docid").setSelected(true);
			}

			this._PopOverSearch.openBy(oButton);
		},
		//     getPaymentLoc: function(v_compcode2) {
		//   var that = this;
		//   var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
		//   var Filters = [
		//       new sap.ui.model.Filter("ZfieldRef", sap.ui.model.FilterOperator.EQ, v_compcode2)
		//   ];

		//   oModel.read("/PaymentLocSet", {
		//       filters: Filters,
		//       success: function(oData) {
		//          var JsonoModel = new sap.ui.model.json.JSONModel();
		//          JsonoModel.setData(oData.results);   // only array
		//          that.getView().setModel(JsonoModel, "MPaymentLoc");
		//       },
		//       error: function() {
		//          MessageBox.error("Error loading Payment Locations");
		//       }
		//   });
		// }

		fn_setText: function(opern_row_co, overdue, tot_msme, deb, cre, redy, totalamount_1, budget5, actual_amt) {
			this.getView().byId("id_overcount").setText(overdue);
			this.getView().byId("id_opencount").setText(opern_row_co);
			this.getView().byId("id_msme").setText(tot_msme);
			this.getView().byId("id_credit_amt").setText(deb);
			this.getView().byId("id_debit_amt").setText(cre);
			this.getView().byId("id_btnredy").setText(redy);
			this.getView().byId("id_totamount").setText(totalamount_1);
			this.getView().byId("id_actamount").setText(actual_amt);
			this.getView().byId("id_budget_text").setText(budget5);
		},
		onClickClroncompplace1: function() {
			this.getView().byId("id_selected").setText(0);
			this.getView().byId("id_overcount").setText(0);
			this.getView().byId("id_budget_text").setText(0);
			this.getView().byId("id_opencount").setText(0);
			this.getView().byId("id_msme").setText(0);
			this.getView().byId("id_credit_amt").setText(0);
			this.getView().byId("id_debit_amt").setText(0);
			var btn = "Preview and Proceed " + "(" + 0 + ")";
			this.getView().byId("id_btnredy").setText(btn);
			this.getView().byId("id_totamount").setText(0);
			this.getView().byId("id_actamount").setText(0);
			this.getView().byId("id_compcode").setValue("");
			this.getView().byId("id_compcode2").setValue("");
			this.getView().byId("id_profit").setValue("");
			this.getView().byId("id_profit2").setValue("");
			// this.getView().byId("id_vendor").setValue("");
			this.getView().byId("id_vendor").destroyTokens();
			// this.getView().getModel("MProfit").setData(null);
			this.getView().byId("id_filterage").setValue("");
			this.getView().byId("id_combo").setValue("");
			// this.getView().byId("id_invoiceno").setValue("");
			this.getView().byId("DP1").setValue("");
			this.getView().byId("DP2").setValue("");
			// this.getView().byId("id_budget").setValue("");
			this.byId("id_msmecheck").setSelected(false);
			arr_directpay = [];

		},
		onClickClroncompplace: function() {
			this.getView().byId("id_selected").setText(0);
			this.getView().byId("id_overcount").setText(0);
			this.getView().byId("id_budget_text").setText(0);
			this.getView().byId("id_opencount").setText(0);
			this.getView().byId("id_msme").setText(0);
			this.getView().byId("id_credit_amt").setText(0);
			this.getView().byId("id_debit_amt").setText(0);
			var btn = "Preview and Proceed " + "(" + 0 + ")";
			this.getView().byId("id_btnredy").setText(btn);
			this.getView().byId("id_totamount").setText(0);
			this.getView().byId("id_actamount").setText(0);
			this.getView().byId("id_compcode").setValue("");
			this.getView().byId("id_compcode2").setValue("");
			this.getView().byId("id_profit").setValue("");
			this.getView().byId("id_profit2").setValue("");
			// this.getView().byId("id_vendor").setValue("");
			this.getView().byId("id_vendor").destroyTokens();
			this.getView().getModel("MProfit").setData(null);
			this.getView().byId("id_filterage").setValue("");
			this.getView().byId("id_combo").setValue("");
			// this.getView().byId("id_invoiceno").setValue("");
			this.getView().byId("DP1").setValue("");
			this.getView().byId("DP2").setValue("");
			// this.getView().byId("id_budget").setValue("");
			this.byId("id_msmecheck").setSelected(false);
			arr_directpay = [];
			location.reload();

		},
		fn_edit: function() {
			var Company_edit = this.getView().byId('id_compcode');
			Company_edit.addEventDelegate({
				onAfterRendering: function() {
					Company_edit.$().find("input").attr("readonly", true);
				}
			});
			var profit_edit = this.getView().byId('id_profit');
			// profit_edit.addEventDelegate({
			//  onAfterRendering: function() {
			//    profit_edit.$().find("input").attr("readonly", true);
			//  }
			// });

			var vendor_edit = this.getView().byId('id_vendor');
			// vendor_edit.addEventDelegate({
			//  onAfterRendering: function() {
			//    vendor_edit.$().find("input").attr("readonly", true);
			//  }
			// });

		},
		onPressDetails: function() {
			if (!this.Detail) {

				this.Detail = sap.ui.xmlfragment("FSC360NEW.Fragment.Detail", this);
				this.getView().addDependent(this.Detail);
			}
			this.Detail.open();

			var arr = this.getView().getModel("MOpenitems").getData();
			var len = arr.length;
			for (var k = 0; k < len; k++) {
				sap.ui.getCore().byId("id_tabledet").getItems()[k].setSelected(true);
			}
		},
		handleSearch1: function(oEvent) {
			this.fncancel();
			var aFilters = [];
			var vValue = this.getView().byId("id_search1").mProperties.value.trim();
			var oBinding = this.getView().byId("id_table").getBinding("items");
			if (vValue) {
				var oFilter1 = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.StartsWith, vValue);
				var oFilter4 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter5 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter6 = new sap.ui.model.Filter("Xblnr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter8 = new sap.ui.model.Filter("Dmbtr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter10 = new sap.ui.model.Filter("PayAmount", sap.ui.model.FilterOperator.StartsWith, vValue);
				var oFilter11 = new sap.ui.model.Filter("Waers", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter12 = new sap.ui.model.Filter("Ageing", sap.ui.model.FilterOperator.Contains, vValue);
				var allFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter4, oFilter5, oFilter6, oFilter8, oFilter10, oFilter11,
					oFilter12
				]);
				oBinding.filter(allFilter);
			} else {
				oBinding.filter([]);
			}

			this.onSelectOpenItems();

		},
		handleSearchReadyForProcess: function(oEvent) {
			// this.onPressSaveDetails();
			// var sValue = oEvent.getParameter("value");
			// var Filter1 = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, sValue);
			// var Filter2 = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.Contains, sValue);
			//    var Filter3 = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.Contains, sValue);
			//        var Filter4 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			//            var Filter5 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
			//                var Filter6 = new sap.ui.model.Filter("Xblnr", sap.ui.model.FilterOperator.Contains, sValue);
			// var allFilter = new sap.ui.model.Filter([Filter1, Filter2,Filter3,Filter4,Filter5,Filter6]);
			// oEvent.getSource().getBinding("items").filter(allFilter);

			//        var  oBinding  = this.getView().byId("id_table").getBinding("items");

			//      if (oBinding) {

			// var oFilters = [ new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, sValue),

			// new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.Contains, sValue),

			// new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.Contains, sValue) ];

			// var filterObj = new sap.ui.model.Filter(oFilters, false);

			// oBinding.filter(filterObj);

			// } else {

			// oBinding.filter([]);

			// }

			// return sValue;

			// var oView = this.getView();
			// var oTable;

			//  oTable = oView.byId("id_tabledet");
			//      var oBinding = oTable.getBinding("items");
			var aFilters = [];
			var vValue = oEvent.getParameter("value");
			var oBinding = sap.ui.getCore().byId("id_tabledet").getBinding("items");
			// var oBinding =  oTable.getBinding("items").oList[0];

			if (vValue) {

				//  var oFrm_str = vValue.split("/");

				// var oFrm_date = oFrm_str[0];

				// var oFrm_month = oFrm_str[1];

				// var oFrm_year = oFrm_str[2];

				// var sValue =  oFrm_date + "/" + oFrm_month + "/" + oFrm_year ;
				var oFilter1 = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.Contains, vValue);
				// var oFilter3 = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.EQ, sValue);
				var oFilter4 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter5 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter6 = new sap.ui.model.Filter("Xblnr", sap.ui.model.FilterOperator.Contains, vValue);
				// var oFilter7 = new sap.ui.model.Filter("Reindat", sap.ui.model.FilterOperator.EQ, sValue);
				var oFilter8 = new sap.ui.model.Filter("Dmbtr", sap.ui.model.FilterOperator.Contains, vValue);
				// var oFilter9 = new sap.ui.model.Filter("Netdt", sap.ui.model.FilterOperator.EQ, sValue);
				var oFilter10 = new sap.ui.model.Filter("PayAmount", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter11 = new sap.ui.model.Filter("Waers", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter12 = new sap.ui.model.Filter("Ageing", sap.ui.model.FilterOperator.Contains, vValue);
				//    var oFilter13 = new sap.ui.model.Filter("Shkzg", sap.ui.model.FilterOperator.Contains, vValue);
				// var oFilter14 = new sap.ui.model.Filter("Advance", sap.ui.model.FilterOperator.Contains, vValue);
			} else {
				oBinding.filter([]);

			}
			// var allFilter = new sap.ui.model.Filter([oFilter1,oFilter2,oFilter3,oFilter4,oFilter5,oFilter6,oFilter7,oFilter8,oFilter9,oFilter10],true);
			var allFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter4, oFilter5, oFilter6, oFilter8, oFilter10, oFilter11,
				oFilter12
			]);
			oBinding.filter(allFilter);
			// var vCheck = this.getView().byId('id_checkAdjust').getSelected();

		},
		//Added by Jovita 
		onselect: function() {
			var d_select = this.getView().byId("id_debit").getSelected();
			var oBinding = this.getView().byId("id_table").getBinding("rows");
			var c_select = this.getView().byId("id_credit").getSelected();
			var v_age_count = 0;

			if (d_select === true && c_select === false) {
				var v_value = "H";
				var oFilter1 = new sap.ui.model.Filter("Shkzg", sap.ui.model.FilterOperator.Contains, v_value);
				oBinding.filter(oFilter1);

			}
			if (c_select === true && d_select === false) {
				var v_value1 = "S";
				var oFilter1 = new sap.ui.model.Filter("Shkzg", sap.ui.model.FilterOperator.Contains, v_value1);
				oBinding.filter(oFilter1);

			}

			if (c_select === true && d_select === true) {
				oBinding.filter([]);
			}
			if (c_select === false && d_select === false) {
				oBinding.filter([]);
			}

			var tot_msme = this.getView().byId("id_msme").getText();
			var deb = this.getView().byId("id_credit_amt").getText();
			var cre = this.getView().byId("id_debit_amt").getText();
			var redy = this.getView().byId("id_btnredy").getText();
			var totalamount1 = this.getView().byId("id_totamount").getText();
			var tot = this.getView().byId("id_actamount").getText();
			//var overdue = this.getView().byId("id_overcount").getText();
			var budget5 = this.getView().byId("id_budget_text").getText();
			var row = this.getView().getModel("MProfit").getData();
			var final_arr = this.getView().getModel("MOpenitems").getData();
			var opern_row_co = this.getView().byId("id_table").getBinding("rows").iLength;
			for (var v_ind = 0; v_ind < opern_row_co; v_ind++) {
				var v_over = this.getView().byId("id_table").getBinding("rows").oList[v_ind].Indi;
				if (v_over === 'Z') {
					v_age_count = v_age_count + 1;
				}
			}

			var overdue = v_age_count;

			this.fn_setText(opern_row_co, overdue, tot_msme, deb, cre, redy, totalamount1, budget5, tot);
		},
		fn_sort_frag: function() {
			var JsonoModelProfit = new sap.ui.model.json.JSONModel();
			var arr = this.getView().getModel("MProfit").getData();
			JsonoModelProfit.setData(arr);
			this.getView().setModel(JsonoModelProfit, "MProfit");
			var length_data = arr.length;
			//Added by Lokesh R on 21.09.2023 - Start
			if (length_data) {
				for (var i = 0; i < length_data; i++) {
					//arr[i].Lifnr = parseInt(arr[i].Lifnr); Commented by Lokesh R on 13.08.2024
					arr[i].Belnr = parseInt(arr[i].Belnr);
				}
			}
			JsonoModelProfit.refresh();
			if (!this.Value55) {
				this.Value55 = sap.ui.xmlfragment("FSC360NEW.Fragment.Sort", this);
				this.getView().addDependent(this.Value55);
			}
			this.Value55.open();
		},
		fncancel: function(oEvent) {
			var JsonoModelProfit = new sap.ui.model.json.JSONModel();
			var arr = this.getView().getModel("MProfit").getData();
			JsonoModelProfit.setData(arr);
			this.getView().setModel(JsonoModelProfit, "MProfit");
			var length_data = arr.length;
			//Added by Lokesh R on 21.09.2023 - Start
			if (length_data) {
				for (var i = 0; i < length_data; i++) {
					arr[i].Lifnr = String(arr[i].Lifnr);
					arr[i].Belnr = String(arr[i].Belnr);
				}
			}
			JsonoModelProfit.refresh();
		},

		fn_sorting: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("id_table");
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
			var aSorters = [];

			// apply sorter 
			var sPath = mParams.sortItem.getKey();
			var bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			// this.fncancel();
		},
		select_combo: function() {
			var agef = this.getView().byId("id_combo").getValue();
			if (agef === "AsOnDue") {
				this.getView().byId("id_filterage").setValue(0);
				// this.getView().byId("id_filterage").setEditable("false");
				this.getView().byId("id_box").getItems()[0].getItems()[2].getContent()[3].setEditable(false);
				//    var Company_edit = this.getView().byId('id_filterage');
				// Company_edit.addEventDelegate({
				//  onAfterRendering: function() {
				//    Company_edit.$().find("input").attr("readonly", false);
				//  }
				// });
			} else {
				this.getView().byId("id_filterage").setValue("");
				this.getView().byId("id_box").getItems()[0].getItems()[2].getContent()[3].setEditable(true);
			}
		},
		onPressReport: function() {
			var v_compcode1 = this.getView().byId("id_compcode").getValue();
			var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-'));
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Downloading", {
				c1: v_compcode2,
				c2: uname_1,
				c3: first_letter

			});
		},
		handleSuggestVendor: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setFilterSuggests(false);

		},
		handleSuggestVendorBank: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("Bankkey", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setFilterSuggests(false);

		},
		onPressDownload: function(evt) {
			// var vUrl = '/sap/bc/gui/sap/its/webgui?~transaction=*OLR3_ME2XN%20OLR3_R3_TS_PDOC-EBELN='+po+';DYNP_OKCODE=DISP';
			var vUrl =
				'http://emamidev.emami.local:8080/sap/bc/gui/sap/its/webgui?~transaction=*/exl/pay_dwnld%20s_trans=10001253;%20DYNP_FCODE=ONLI#';
			sap.m.URLHelper.redirect(
				vUrl, true);
		},
		//Added by Lokesh R on 13.09.2023 - Start
		fn_open_inv: function() {
			if (!this.Value3) {

				this.Value3 = sap.ui.xmlfragment("FSC360NEW.Fragment.InvoiceNo", this);
				this.getView().addDependent(this.Value3);
				var oFragMultiInp1 = sap.ui.getCore().byId("id_invnofrag");
				var oModel = this.getView().getModel("JMInvoice");
				oFragMultiInp1.addValidator(function(args) {
					// var text = args.text;
					return new sap.m.Token({
						key: args.text,
						text: args.text
					});
				});
				oFragMultiInp1.attachTokenUpdate(function(oEvent) {
					var sType = oEvent.getParameter("type"),
						aAddedTokens = oEvent.getParameter("addedTokens"),
						aRemovedTokens = oEvent.getParameter("removedTokens"),
						aContexts = oModel.getData()["items"];

					switch (sType) {
						// add new context to the data of the model, when new token is being added
						case "added":
							aAddedTokens.forEach(function(oToken) {
								aContexts.push({
									key: oToken.getKey(),
									text: oToken.getText()
								});
							});
							break;
							// remove contexts from the data of the model, when tokens are being removed
						case "removed":
							aRemovedTokens.forEach(function(oToken) {
								aContexts = aContexts.filter(function(oContext) {
									return oContext.key !== oToken.getText();
								});
							});
							break;
						default:
							break;
					}

					oModel.setProperty("/items", aContexts);
				});
			}
			this.Value3.open();
			var year = sap.ui.getCore().byId("id_inv_year").getValue();
			if (year === ' }') {
				sap.ui.getCore().byId("id_inv_year").setValue('');
			}
		},
		handleInvChange: function() {
		var	year = this.getView().byId("id_inv_year").getValue();
			if (year === ' }') {
				year = '';
			}

		},
			handleDocChange: function() {
			Docyear = this.getView().byId("id_doc_year").getValue();
			if (Docyear === ' }') {
				Docyear = '';
			}

		},
		fn_close_inv: function() {
			Docyear = sap.ui.getCore().byId("id_inv_year").getValue();
			if (Docyear === ' }') {
				Docyear = '';
			}
			this.Value3.close();
		},
		fn_clear_inv: function() {
			var oModel = this.getView().getModel("JMInvoice");
			var aContexts = [];
			oModel.setProperty("/items", aContexts);
			sap.ui.getCore().byId("id_inv_year").setValue("");
			this.Value3.close();
		},
		fn_open_doc: function() {
			if (!this.Value4) {

				this.Value4 = sap.ui.xmlfragment("FSC360NEW.Fragment.DocumentNo", this);
				this.getView().addDependent(this.Value4);
				var oFragMultiInp2 = sap.ui.getCore().byId("id_docnofrag");
				var oModel = this.getView().getModel("JMDoc");
				oFragMultiInp2.addValidator(function(args) {
					// var text = args.text;
					return new sap.m.Token({
						key: args.text,
						text: args.text
					});
				});
				oFragMultiInp2.attachTokenUpdate(function(oEvent) {
					var sType = oEvent.getParameter("type"),
						aAddedTokens = oEvent.getParameter("addedTokens"),
						aRemovedTokens = oEvent.getParameter("removedTokens"),
						aContexts = oModel.getData()["items"];

					switch (sType) {
						// add new context to the data of the model, when new token is being added
						case "added":
							aAddedTokens.forEach(function(oToken) {
								aContexts.push({
									key: oToken.getKey(),
									text: oToken.getText()
								});
							});
							break;
							// remove contexts from the data of the model, when tokens are being removed
						case "removed":
							aRemovedTokens.forEach(function(oToken) {
								aContexts = aContexts.filter(function(oContext) {
									return oContext.key !== oToken.getText();
								});
							});
							break;
						default:
							break;
					}

					oModel.setProperty("/items", aContexts);
				});
			}
			this.Value4.open();
			var year = sap.ui.getCore().byId("id_doc_year").getValue();
			if (year === ' }') {
				sap.ui.getCore().byId("id_doc_year").setValue('');
			}
		},
		fn_close_doc: function() {
			Docyear = sap.ui.getCore().byId("id_doc_year").getValue();
			if (Docyear === ' }') {
				Docyear = '';
			}
			this.Value4.close();
		},
		fn_clear_doc: function() {
			var oModel = this.getView().getModel("JMDoc");
			var aContexts = [];
			oModel.setProperty("/items", aContexts);
			sap.ui.getCore().byId("id_doc_year").setValue("");
			this.Value4.close();
		},
		handleSearchPaymentLocation: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("ZsapValue", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter(Filter1);

		},
		//Added by Lokesh Ron 23.11.2023 - Start
		fn_docdisplay: function(oEvent) {
			var Docno = oEvent.getSource().getBindingContext('MProfit').getProperty('Belnr');
			var Gjahr = oEvent.getSource().getBindingContext('MProfit').getProperty('Gjahr');
			var Type = oEvent.getSource().getBindingContext('MProfit').getProperty('Type');
			if (Type === 'MIR4') {
				var vUrl = 'https://' + window.location.host + '/sap/bc/gui/sap/its/webgui?~transaction=*MIR4 RBKP-BELNR=' + Docno +
					';RBKP-GJAHR=' +
					Gjahr;
				sap.m.URLHelper.redirect(
					vUrl, true);
			} else {
				var vUrl1 = 'https://' + window.location.host + '/sap/bc/gui/sap/its/webgui?~transaction=*FB03 RF05L-BELNR=' + Docno +
					';RF05L-GJAHR=' + Gjahr;
				sap.m.URLHelper.redirect(
					vUrl1, true);
			}
		},
		fnTypeMismatch: function(oEvent) {
			if (oEvent.getParameter("fileType") != "pdf") {
				sap.m.MessageToast.show("Enter only pdf File");
			} else {
				oEvent.getSource().setValueState("None");
			}
		},
		onAfterDetailsDialogOpen: function (oEvent) {
			 var oDialog = oEvent.getSource();
    oDialog.$().css({
    	 width: "950px",
    	  height:"100%",
        top: "0px",
        right: "0px",
        left: "auto",
        bottom: "0px",
        transform: "none"
    });
    // Get the cancel image control now that the dialog is open
    var oCancelImage = sap.ui.getCore().byId("id_cancel_pdf");

    if (oCancelImage) {
        // Attach the browser click event properly
        oCancelImage.attachBrowserEvent("click", this.fn_onRemoveFile.bind(this));
    } else {
        console.error("Cancel image not found in dialog.");
    }
},

		fn_onRemoveFile: function (oEvent) {
    var that = this;

    // Get the binding context from the cancel icon clicked
    var oContext = oEvent.getSource().getBindingContext("MVen");

    if (!oContext) {
        sap.m.MessageToast.show("Error: Vendor context not found.");
        return;
    }

    // Get vendor object
    var oVendor = oContext.getObject();

    // Find the file index in binaryData and remove it
   var fileIndex = -1;
for (var i = 0; i < binaryData.length; i++) {
    if (binaryData[i].name === oVendor.file) {
        fileIndex = i;
        break;
    }
}

    if (fileIndex !== -1) {
        binaryData.splice(fileIndex, 1); // remove file from array
    }

    // Reset vendor attachment data
    oVendor.AttachmentIndicator = 'N';  // Hide attached PDF icon and show Attach button again
    oVendor.file = "";                  // Clear file name

    // Clear the FileUploader value (so user can select again)
    var oFileUploader = sap.ui.getCore().byId("id_CreateItem_Document");
    if (oFileUploader) {
        oFileUploader.setValue("");
    }

    // Refresh the model to update the UI
    var oModel = this.getView().getModel("MVen");
    oModel.refresh();

    // Show success message
    sap.m.MessageToast.show("File removed successfully.");
}
,
fnImgUploadComplete: function (oEvent) {
    var BI = new sap.m.BusyDialog();
    BI.open();

    var oFileUploader = oEvent.getSource();
    var file = oFileUploader.oFileUpload.files[0];

    if (!file) {
        sap.m.MessageToast.show("No file selected.");
        BI.close();
        return;
    }

    // Add the file to binaryData array
    binaryData.push(file);

    // Create a Blob URL for preview (optional)
    this.path = URL.createObjectURL(new Blob(binaryData, {
        type: "application/pdf"
    }));

    // Get binding context for this vendor
    var oContext = oFileUploader.getBindingContext("MVen");
    if (oContext) {
        var oVendor = oContext.getObject();

        // Update vendor data to show "Attached"
        oVendor.AttachmentIndicator = 'Y';
        oVendor.file = file.name;

        // Refresh the model to update the UI
        var oModel = this.getView().getModel("MVen");
        oModel.refresh();

        // Clear the FileUploader value so same file can be uploaded again later
        oFileUploader.setValue("");

        sap.m.MessageToast.show("File uploaded successfully!");
    } else {
    		this.openErrorDialog("Vendor context not found ");
        // sap.m.MessageToast.show("Error: Vendor context not found.");
    }

    BI.close();
}
,
		fnUpload: function(Trnsid) {
			var BI = new sap.m.BusyDialog();
			var oModel = this.getOwnerComponent().getModel();
			if (binaryData.length !== 0) {
				var vFtype = binaryData[0].type;
			}
			var vToken = oModel.getSecurityToken();
			var that = this;
			var oData = this.getView().getModel("MVen").getData();
			var Id = Trnsid;
			Id = Id.replace(/^0+/, '');
			typeof Id; // 'string'
			for (var i = 0; i < oData.length; i++) {
				var vValue = Id + "*" + v_compcode2 + "*" + oData[i].Ven;
				var vTaskService = "/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/AttachSet";
				var arr = binaryData[i];

				$.ajaxSetup({
					cache: false
				});
				jQuery
					.ajax({
						url: vTaskService,
						processData: false,
						contentType: false,
						async: false,
						dataType: 'PDF',
						cache: false,
						timeout: "1000",
						data: arr,
						type: "POST",
						beforeSend: function(xhr) {
							xhr.setRequestHeader(
								"X-CSRF-Token", vToken);
							xhr.setRequestHeader(
								"Content-Type",
								vFtype);
							xhr.setRequestHeader("slug",
								vValue);

						},
						success: function(oData) {
							BI.close();
							sap.m.MessageToast.show("File Uploaded Successfully");

						},
						error: function(err) {
							BI.close();
							// sap.m.MessageToast.show("Error while Uploading File");
						}
					});
			}
		},
		onPressPDF1: function() {
			var arr = [];
			arr = this.getView().getModel("MVen").getData();
			if (!this.Details1) {
				this.Details1 = sap.ui.xmlfragment("FSC360NEW.Fragment.Detail1", this);
				this.getView().addDependent(this.Details1);
			}
			this.Details1.open();

			if (SuccessInd === 'X') {
				// sap.ui.getCore().byId("id_smartformcheck1").setSelected(true);
			}
		},
		onOpenPDF: function(oEvent) {
			var Id = sap.ui.getCore().byId("id_pid").getText();
			var split_string = Id.split(/(\d+)/);
			// var smcheck = sap.ui.getCore().byId("id_smartformcheck1").getSelected();
			var Ven = oEvent.getSource().getBindingContext('MVen').getProperty('Ven');
			if (!this.Value5) {

				this.Value5 = sap.ui.xmlfragment("FSC360NEW.Fragment.DocumentImg", this);
				this.getView().addDependent(this.Value5);

			}
			this.Value5.open();
			sap.ui.getCore().byId('id_scrll').setBusy(false);
			var oScorl = sap.ui.getCore().byId("id_scrll");
			oScorl.destroyContent();
			var ind = "";
			// if (smcheck === true) {
			//  ind = 'X';
			// }
			var String1 = Ven;
			var String2 = split_string[1];
			var Url = "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/AttachSet(Vendor='" + String1 + "',Transid='" + String2 + "',Smind='" + ind +
				"')/$value";
			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div><iframe src=" + Url + " width='400px' height='550px'></iframe></div>";
			oHtml.setContent(oContent);
			var oScrl = sap.ui.getCore().byId("id_scrll");
			oScrl.addContent(oHtml);
			$('id_scrll').click(false);
			// } else {
			//  sap.m.MessageToast.show("Please select one item");
			// }
		},
		onOpenPDF1: function(oEvent) {
			var Venarr1 = this.getView().getModel("MVen").getData();
			var Venarr = [];
			for (var i = 0; i < Venarr1.length; i++) {
				Venarr.push(Venarr1[i].Ven); //Changed by Lokesh R on 13.08.2024
			}
			var Id = sap.ui.getCore().byId("id_pid").getText();
			var split_string = Id.split(/(\d+)/);
			// var smcheck = sap.ui.getCore().byId("id_smartformcheck1").getSelected();
			// var Ven = oEvent.getSource().getBindingContext('MVen').getProperty('Ven');
			if (!this.Value5) {

				this.Value5 = sap.ui.xmlfragment("FSC360NEW.Fragment.DocumentImg", this);
				this.getView().addDependent(this.Value5);

			}
			this.Value5.open();
			sap.ui.getCore().byId('id_scrll').setBusy(false);
			var oScorl = sap.ui.getCore().byId("id_scrll");
			oScorl.destroyContent();
			var ind = "";
			var len = Venarr.length;
			len = len - 1;
			Venarr.sort();
			var Ven = String(Venarr[len]);
			ind = 'X';
			// if (smcheck === true) {
			//  ind = 'X';
			// }
			var String1 = Ven;
			var String2 = split_string[1];
			var Url = "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/AttachSet(Vendor='" + String1 + "',Transid='" + String2 + "',Smind='" + ind +
				"')/$value";
			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div><iframe src=" + Url + " width='400px' height='550px'></iframe></div>";
			oHtml.setContent(oContent);
			var oScrl = sap.ui.getCore().byId("id_scrll");
			oScrl.addContent(oHtml);
			$('id_scrll').click(false);
			// } else {
			//  sap.m.MessageToast.show("Please select one item");
			// }
		},
		fn_close_docimg: function() {
			this.Value5.close();
		},
		onVendorBank: function() {
			var that = this;

			// 1️⃣ Get selected company code
			var v_compcode1 = this.getView().byId("id_compcode").getValue();
			var v_compcode2 = v_compcode1.substring(0, v_compcode1.indexOf('-')) || v_compcode1;

			// 2️⃣ Get selected rows from the table
			var oTable = this.getView().byId("id_table");
			var aSelectedIndices = oTable.getSelectedIndices(); // array of row indices
			var aSelectedVendors = [];

			if (aSelectedIndices.length > 0) {
				var oTableModel = oTable.getModel("MProfit");
				var aTableData = oTableModel.getProperty("/");

				aSelectedIndices.forEach(function(iIndex) {
					var oRowData = aTableData[iIndex];
					if (oRowData && oRowData.Lifnr) {
						aSelectedVendors.push({
							Lifnr: oRowData.Lifnr
						});
					}
				});
			}

			// 3️⃣ Prepare payload
			var obj = {
				Bukrs: v_compcode2 || "",
				Flag: "V",
				navVendor2: aSelectedVendors,
				navPay2: [],
				navVendor3: []
			};

			// 4️⃣ Call OData service
			var BI = new sap.m.BusyDialog();
			BI.open();

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			oModel.create("/OpenSet", obj, {
				success: function(oData, Response) {
					BI.close();
					if (oData.Auth !== "E" && oData.Auth !== "P") {
						var JsonoModelProfit = new sap.ui.model.json.JSONModel();
						JsonoModelProfit.setData(oData.navVendor3.results);
						JsonoModelProfit.setSizeLimit(3000);
						that.getView().setModel(JsonoModelProfit, "MBank");
					}
				},
				error: function() {
					BI.close();
						that.openErrorDialog("Error while fetching Vendor Bank Details");
					// MessageBox.error("Error while fetching Vendor Bank Details");
				}
			});
		},
		fnLogOut: function(oEvent) {
			//    var oShell = this.getView().byId("id_Shell");
			sap.m.MessageBox.show("Are you sure you want to log out?", {
				title: "Confirmation",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction == sap.m.MessageBox.Action.YES) {
						jQuery.ajax({
							type: "GET",
							url: '/sap/public/bc/icf/logoff',
							async: false
						}).success(function() {}).complete(function() {
							location.reload();
						});
					} else {
						sap.m.MessageToast.show("Action Cancel by User");
					}
				}
			});
		},
		OnPressCustomList: function(oEvent) {
			var arr_final = [];
			var org = this.getView().getModel("MFinalven").getData();
			var JsonoModel = new sap.ui.model.json.JSONModel();
			// JsonoModel.setData(arr_final);
			Vendor_Final = oEvent.getSource().getAggregation("content")[0].getAggregation("items")[0].getAggregation("content")[1].getAggregation(
				"items")[0].getText();
			for (var i = 0; i < org.length; i++) {
				if (org[i].Ven === Vendor_Final) {
					for (var j = 0; j < org[i].Bankkey.length; j++) {
						var temp = {
							"Key": org[i].Bankkey[j].Bankkey,
							"Name": org[i].Bankkey[j].BankName,
							"Account": org[i].Bankkey[j].BankNum,
							"Lifnr": org[i].Ven
						};
						arr_final.push(temp);
					}
				}

			}
			JsonoModel.setData(arr_final);
			this.getView().setModel(JsonoModel, "MKey");
			if (!this.Value18) {

				this.Value18 = sap.ui.xmlfragment("FSC360NEW.Fragment.Key", this);
				this.getView().addDependent(this.Value18);
			}
			this.Value18.open();

		},
	onDialogClose: function(oEvent) {
    var oSelectedItem = oEvent.getParameter("selectedItem");

    if (oSelectedItem) {
        var sBankKey = oSelectedItem.getTitle();       // MKey>Key
        var sBankName = oSelectedItem.getInfo();       // MKey>Name
        var sBankAccount = oSelectedItem.getDescription(); // MKey>Account

        var sVendor = this._oSelectedVendorCtx ? this._oSelectedVendorCtx.getObject().Ven : null;

        if (sVendor) {
            // Update MFinalven
            var oModelFinal = this.getView().getModel("MFinalven");
            var aDataFinal = oModelFinal.getData();

            for (var i = 0; i < aDataFinal.length; i++) {
                if (aDataFinal[i].Ven === sVendor) {
                    aDataFinal[i].Final_Key = sBankKey;
                    aDataFinal[i].Bankn = sBankAccount;
                    aDataFinal[i].Banka = sBankName;
                    aDataFinal[i].Vis = true;
                    aDataFinal[i].KeySelected = true;
                    break;
                }
            }
            oModelFinal.setData(aDataFinal);
            oModelFinal.refresh();

            // 🔑 Update MVen as well
            var oModelVen = this.getView().getModel("MVen");
            var aDataVen = oModelVen.getData();

            for (var j = 0; j < aDataVen.length; j++) {
                if (aDataVen[j].Ven === sVendor) {
                    aDataVen[j].KeySelected = true;
                    break;
                }
            }
            oModelVen.setData(aDataVen);
            oModelVen.refresh();

        } else {
            sap.m.MessageToast.show("No vendor context available.");
        }
    } else {
        sap.m.MessageToast.show("No item selected.");
    }
}
,
		onPressSaveDetails: function(oEvent) {
			arr_directpay = [];
			var myTable = sap.ui.getCore().byId("id_tabledet");
			// var selectedIndeices = myTable.getSelectedIndices();
			// var len = selectedIndeices.length;
			// var Content = this.getView().byId("id_table").getSelectedItems();
			// var data = oEvent.getSource().getSelectedItem().getBindingContext('MProfit').getObject();
			var len = sap.ui.getCore().byId("id_tabledet")._aSelectedItems.length;

			// var len = oEvent.getSource().getSelectedItems().length;
			// for(var t=0;t<len;t++){
			// var data1 = oEvent.getSource().getSelectedItems()[t].getBindingContext('MProfit').getObject();
			// }
			this.getView().byId("id_selected").setText(len);
			var BI = new sap.m.BusyDialog();
			BI.open();
			var arr_sele = [];
			var vTotal = this.getView().byId("id_totamount").getText();
			var length_selected = this.getView().byId("id_selected").getText();
			//  if (length_selected === "0") {
			//    BI.close();
			//  MessageBox.error(" Select atleast 1 line item! ", {
			//    actions: ["OK"],
			//      onClose: function(nAction) {
			//        if (nAction === "OK") {}
			//      }
			//    });
			//  } else {

			var credit_amount = "0";
			var debit_amount = "0";
			var total_msme = "0";
			var profit_model = this.getView().getModel('MOpenitems').getData();
			var totalamount = "0";
			// var Table_open = this.getView().byId("id_table");
			// var myTableRows = Table_open.getRows();
			// var selectedIndeices = Table_open.getSelectedIndices();

			// var data = oEvent.getSource().getSelectedItem().getBindingContext('MProfit').getObject();
			var len = sap.ui.getCore().byId("id_tabledet")._aSelectedItems.length;
			for (var t = 0; t < len; t++) {
				var data1 = sap.ui.getCore().byId("id_tabledet")._aSelectedItems[t].getBindingContext('MOpenitems').getObject();
				// var data2  = data1;
				arr_directpay.push(data1);
			}

			for (var t = 0; t < arr_directpay.length; t++) {
				if (arr_directpay[t].Lifnr !== "") {
					arr_directpay[t].Lifnr = String(arr_directpay[t].Lifnr);
				}
				if (arr_directpay[t].Shkzg === "S") {
					credit_amount = parseFloat(credit_amount) + parseFloat(arr_directpay[t].PayAmount);
				}
				if (arr_directpay[t].Shkzg === "H") {
					debit_amount = parseFloat(debit_amount) + parseFloat(arr_directpay[t].PayAmount);
				}
				if (arr_directpay[t].Mindk !== '') {
					total_msme = parseFloat(total_msme) + parseFloat(arr_directpay[t].PayAmount);
				}
				for (var h = 0; h < profit_model.length; h++) {
					if ((arr_directpay[t].Belnr === profit_model[h].Belnr) && (arr_directpay[t].Gjahr === profit_model[h].Gjahr)) {
						profit_model.splice(h, 1);
						break;
					}
				}
			}
			var cre1 = (parseFloat(credit_amount) / 100000).toFixed(2);
			var deb1 = (parseFloat(debit_amount) / 100000).toFixed(2);
			var tot1 = deb1 - cre1;
			tot1 = tot1.toFixed(2);
			var totalamount2 = "";
			totalamount2 = tot1;
			//  if (totalamount2 <= 0) {
			//    MessageBox.error(" Total Amount should not be in Negative ! ", {
			//      actions: ["OK"],
			//      onClose: function(nAction) {
			//        if (nAction === "OK") {
			//          BI.close();
			//        }
			//      }
			//    });
			//    this.onSubmitFilter();
			//  } else {
			var oJSONModel = this.getView().getModel("MOpenitems");
			oJSONModel.setData(profit_model);
			this.getView().setModel(oJSONModel, "MOpenitems");
			oJSONModel.refresh();
			var JsonoModelselecteddata = new sap.ui.model.json.JSONModel();
			JsonoModelselecteddata.setData(arr_directpay);
			this.getView().setModel(JsonoModelselecteddata, "MOpenitems1");

			var final_arr = this.getView().getModel("MOpenitems1").getData();
			// for (var i = 0; i < arr_directpay.length; i++) {
			//  if (arr_directpay[i].Shkzg === "S") {
			//    credit_amount = parseFloat(credit_amount) + parseFloat(arr_directpay[i].PayAmount);
			//  } else {
			//    debit_amount = parseFloat(debit_amount) + parseFloat(arr_directpay[i].PayAmount);
			//  }
			// }

			// for (var y = 0; y < arr_directpay.length; y++) {
			//  if (arr_directpay[y].Mindk !== '') {
			//    total_msme = parseFloat(total_msme) + parseFloat(arr_directpay[y].PayAmount);
			//  }
			// }
			var tot_msme = (parseFloat(total_msme) / 100000).toFixed(2);
			var act_amt = debit_amount - credit_amount; //Actual amount
			var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
				style: "INR",
				currencyCode: false
			});
			var act_amt = oCurrencyFormatter.format(act_amt);
			var cre = (parseFloat(credit_amount) / 100000).toFixed(2);
			var deb = (parseFloat(debit_amount) / 100000).toFixed(2);

			var overdue = this.getView().byId("id_overcount").getText();
			var tot = deb - cre;
			tot = tot.toFixed(2);
			var totalamount1 = "";
			var totalamount1 = tot;

			var oJSONModel1 = this.getView().getModel("MProfit");
			var data = oJSONModel1.getData();
			var existing = this.getView().getModel("MOpenitems").getData();
			for (var i = 0; i < existing.length; i++) {
				data.push(existing[i]);
			}

			oJSONModel1.setData(data);
			this.getView().setModel(oJSONModel1, "MProfit");
			oJSONModel1.refresh();

			var Open = this.getView().getModel("MOpenitems1").getData();
			var arr = [];

			var oModelexit = this.getView().getModel("MOpenitems");
			oModelexit.setData(arr);
			oModelexit.refresh();

			oModelexit.setData(Open);
			oModelexit.refresh();

			var row = this.getView().getModel("MProfit").getData();
			var opern_row_co = (row.length - final_arr.length) + final_arr.length;
			// this.getView().byId("id_table").clearSelection();
			this.getView().byId("id_table").removeSelections();
			// this.onSelectOpenItems();
			var ready_process_count = final_arr.length;
			var redy = "Preview and Proceed " + "(" + ready_process_count + ")";
			var budget5 = this.getView().byId("id_budget_text").getText();
			BI.close();
			this.fn_setText(opern_row_co, overdue, tot_msme, deb, cre, redy, totalamount1, budget5, act_amt);
		},
		handleSearchBankDet: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var allFilter = [];
			if (sValue !== "") {
				var Filter1 = new sap.ui.model.Filter("Key", sap.ui.model.FilterOperator.Contains, sValue);
				var Filter2 = new sap.ui.model.Filter("Account", sap.ui.model.FilterOperator.Contains, sValue);
				var Filter3 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
				var allFilter = new sap.ui.model.Filter([Filter1, Filter2, Filter3]);
				oEvent.getSource().getBinding("items").filter(allFilter);
			} else {
				allFilter = [];
				sValue = "";
			}

		},
		openErrorDialog: function (sMessage) {
    var oView = this.getView();

    // Set the dynamic message in the model
    oView.getModel("errorModel").setProperty("/message", sMessage);

    // Follow your standard fragment loading approach
    if (!this.ErrorDialog) {
        this.ErrorDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.ErrorReuse", this);
        this.getView().addDependent(this.ErrorDialog);
    }

    // Open the dialog
    this.ErrorDialog.open();
},
fn_onCloseErrorDialog: function () {
    if (this.ErrorDialog) {
        this.ErrorDialog.close();
    }
}



		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf FSC360NEW.view.PaymentWorkbench
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf FSC360NEW.view.PaymentWorkbench
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf FSC360NEW.view.PaymentWorkbench
		 */
		//	onExit: function() {
		//
		//	}

	});

});