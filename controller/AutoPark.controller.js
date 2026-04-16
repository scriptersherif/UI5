sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"FSC360NEW/model/formatter",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator"

], function(Controller, formatter, Fragment, JSONModel, BusyIndicator) {
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
	var sStatus;
	var FragmentId;
	return Controller.extend("FSC360NEW.controller.AutoPark", {

		formatter: formatter,
		Date: function(sVal) {
			if (!sVal) return "";
			var oDateFormat = DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			var oDate = new Date(sVal);
			return oDateFormat.format(oDate);
		},
		getGstClass: function(sMatch) {
			return sMatch === "X" ? "gst-green" : "gst-black";
		},

		onInit: function() {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				showHistory: false
			}), "viewState");
			this.getOwnerComponent().getRouter()
				.getRoute("AutoPark")
				.attachPatternMatched(this._onAutoParkRouteMatched, this);
			this.fn_onRadioSelect({
				getSource: () => this.byId("id_radBtnGrp")
			});
			var that = this; // preserve context
			var aReversalTypes = [{
				key: "01",
				text: "Reversal in current period"
			}, {
				key: "02",
				text: "Reversal in closed period"
			}, {
				key: "03",
				text: "Actual reversal in current period"
			}, {
				key: "04",
				text: "Actual reversal in closed period"
			}, {
				key: "05",
				text: "Accrual/deferral posting"
			}];

			// Create JSON model and set it
			var oModel = new sap.ui.model.json.JSONModel({
				ReversalTypes: aReversalTypes
			});
			this.getView().setModel(oModel, "JSReversal");
			//success error popup model
				var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");
			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");
		 
		 
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			// line commented by yasin on 15-09-2025 start
			// var oView = this.getView();

			// oModel.read("/AutoParkSet", {
			// 	filters: [
			//         new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, sStatus)
			//     ],
			//     success: function (oData) {
			//         var oJSONModel = new sap.ui.model.json.JSONModel();
			//         oJSONModel.setData(oData.results); // setting only the 'results' array
			//         that.getView().setModel(oJSONModel, "AutoParkModel");
			//           that.aFullAutoParkData = oData.results;  
			//           that.aFilteredAutoParkData = oData.results.slice();

			//     // Set pagination defaults
			//     that.iAutoParkCurrentPage = 1;
			//     that.iAutoParkRowsPerPage = 10;

			//     // Update the paginated model
			//     that.updateAutoParkPaginatedModel();
			//         console.log("AutoParkSet loaded:", oData.results); // You can check values here
			// //          this.aFilterFields = ["Qid"]; // Default to Queue Id
			// // this.getView().byId("id_search_field").setPlaceholder("Search by Queue Id");
			//          var iCount = oData.results.length;
			// that.byId("id_tot").setText(iCount.toString());
			//     },
			//     error: function (oError) {
			//         sap.m.MessageToast.show("Failed to load AutoParkSet data.");
			//         console.error("Error loading AutoParkSet:", oError);
			//     }
			// });
			// line commented by yasin on 15-09-2025 end
			var sBukrs = " ";
			oModel.read("/DEEPHEADSet", {
				filters: [

					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs),

				],
				urlParameters: {
					$expand: "NavSection"
				},
				success: function(oData) {

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavSection.results);
					that.getView().setModel(oModel, 'JSSectionCode');
				
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Section Codes.");
				
				}
			});
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {

			});
			this.getView().setModel(oModel, "TemplateModel");

			const aColumnMeta = [{
				key: "Qid",
				label: "Queue Id",
				visible: true
			}, {
				key: "Scanned",
				label: "Scanned",
				visible: true
			}, {
				key: "Scancenter",
				label: "Plant Code",
				visible: false
			}, {
				key: "Lifnr",
				label: "Vendor Number",
				visible: false
			}, {
				key: "Name1",
				label: "Vendor Name",
				visible: true
			}, {
				key: "MsmeType",
				label: "MSME",
				visible: false
			}, {
				key: "Invdt",
				label: "Invoice Date",
				visible: true
			}, {
				key: "Invno",
				label: "Invoice Number",
				visible: true
			}, {
				key: "Invoiceamt",
				label: "Invoice Amt.",
				visible: true
			}, {
				key: "WtWithcd",
				label: "With Tax Code",
				visible: false
			}, {
				key: "WtQsshb",
				label: "With Tax Amt.",
				visible: false
			}, {
				key: "Wrbtr",
				label: "Advance Amt.",
				visible: false
			}, {
				key: "WrbtrNon",
				label: "NonPo Adv Amt.",
				visible: false
			},{
				key: "Intax",
				label: "Tax Amt.",
				visible: false
			}, {
				key: "Ntamt",
				label: "Net Amt.",
				visible: false
			}, {
				key: "Invoiceamt",
				label: "Gross Amt.",
				visible: false
			}, {
				key: "Waers",
				label: "Curr.",
				visible: false
			}, {
				key: "Bupla",
				label: "Buss. Place",
				visible: false
			}, {
				key: "Secco",
				label: "Sec. Code",
				visible: true
			}, {
				key: "Erdat",
				label: "Posting Date",
				visible: false
			}, {
				key: "Bedat",
				label: "PO Posting Date",
				visible: false
			}, {
				key: "Budat",
				label: "GRN Posting Date",
				visible: false
			}, {
				key: "Documentnumber",
				label: "MIRO Doc.No",
				visible: false
			}, {
				key: "AccDoc",
				label: "Sap Doc.No",
				visible: false
			}, {
				key: "GrnDoc",
				label: "GRNDoc.No",
				visible: false
			}, {
				key: "Autotext",
				label: "Auto Text",
				visible: false
			}, {
				key: "Bankn",
				label: "Bank Account Number",
				visible: false
			}, {
				key: "Bankl",
				label: "Bank IFSC code",
				visible: false
			}, {
				key: "Banka",
				label: "Bank Name",
				visible: false
			}, {
				key: "Gstno",
				label: "GST No.",
				visible: false
			}, {
				key: "HsnSac",
				label: "HSN Code",
				visible: false
			}, {
				key: "Hkont",
				label: "GL Account",
				visible: false
			}, {
				key: "Gldesc",
				label: "GL Desc",
				visible: false
			}, {
				key: "Transtype",
				label: "Transtype",
				visible: false
			}, {
				key: "Ebeln",
				label: "PO Number",
				visible: true
			}, {
				key: "Ebelp",
				label: "PO Item",
				visible: false
			}, {
				key: "Bukrs",
				label: "Company",
				visible: false
			}, {
				key: "Transhis",
				label: "Trans history",
				visible: true
			}, ];

			const oColModel = new sap.ui.model.json.JSONModel(aColumnMeta);
			this.getView().setModel(oColModel, "FilterTableModel");
			// ViewModel for templates
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				selectedTemplate: "",
				templates: [],
				forceFullWidth: false,
				wrapText: false
			}), "viewModel1");
			this._aDefaultWidths = [
				"7rem", // Queue ID
				"5rem", // Scanned
				"8rem", // Plant Code
				"10rem", // Vendor Number
				"10rem", // Vendor Name
				"5rem", // MSME
				"8rem", // Invoice Date
				"8rem", // Invoice Number
				"10rem", // Invoice Amt.
				"10rem", // With Tax Code
				"10rem", // With Tax Amt.
				"10rem", // Advance Amt.
				"8rem", // Tax Amt.
				"5rem", // Net Amt.
				"8rem", // Gross Amt.
				"5rem", // Curr.
				"8rem", // Buss. Place
				"8rem", // Sec. Code
				"10rem", // Posting Date
				"11rem", // PO Posting Date
				"11rem", // GRN Posting Date
				"11rem", // MIRO Doc
				"9rem", // Sap Doc
				"9rem", // GRN Doc
				"9rem", // Auto Text
				"12rem", // Bank Account Number
				"12rem", // Bank IFSC
				"12rem", // Bank Name
				"8rem", // GST No.
				"5rem", // HSN Code
				"8rem", // GL Account
				"15rem", // GL Desc
				"5rem", // Transtype
				"6rem", // PO Number
				"5rem", // PO Item
				"5rem", // Company Code
				"7rem" // Trans history
			];
			this._bWrap = false; // track wrap state
			this.aFilterFields = [];
		
			var oScrlModel = new sap.ui.model.json.JSONModel();
			oScrlModel.setData([{
				"Key": false
			}]);
			this.getView().setModel(oScrlModel, 'JsScrl');
			this.fn_LoadInitial();

		},

		fnloadAutoParkData: function() {
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var oView = this.getView();

			oModel.read("/AutoParkSet", {
				filters: [
					new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, sStatus)
				],
				success: function(oData) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData.results);
					oView.setModel(oJSONModel, "AutoParkModel");

					// Keep copies for filtering
					that.aFullAutoParkData = oData.results;
					that.aFilteredAutoParkData = oData.results.slice();

					// Pagination defaults
					that.iAutoParkCurrentPage = 1;
					that.iAutoParkRowsPerPage = 10;

					// Update paginated model
					that.updateAutoParkPaginatedModel();

					// Update total count text
					var iCount = oData.results.length;
					that.byId("id_tot").setText(iCount.toString());

					
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load AutoParkSet data.");
				
				}
			});
		},

		_onAutoParkRouteMatched: function() {
			// Always highlight Auto Parking when entering this route
			var oHBox = this.getView().byId("id_usertypeauto");
			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");
				var btnKey = btn.getCustomData().find(cd => cd.getKey() === "key").getValue();
				if (btnKey === "A") {
					btn.addStyleClass("activeGroupBtn");
				}
			});
		},
		fn_onUserTypePress: function(oEvent) {
			var oPressedBtn = oEvent.getSource();
			var sKey = oPressedBtn.getCustomData().find(cd => cd.getKey() === "key").getValue();

			// Store globally BEFORE navigation
			this.getOwnerComponent()._lastUserType = sKey;

			// Remove highlight from current view
			var oHBox = this.getView().byId("id_usertypeauto");
			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");
			});
			oPressedBtn.addStyleClass("activeGroupBtn");

			// Navigation
			if (sKey === "W" || sKey === "I" || sKey === "H") {
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("Fulfilment", {
					btnstat: sKey
				});
			} else if (sKey === "A") {
			
			} else if (sKey === "N") {

				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("NonPoIndexer");
			}
		},
		_loadDataBasedOnUserType: function(sKey) {
			if (sKey === "I") {
			
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("Fulfilment");

			} else if (sKey === "W") {
			
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("Fulfilment");
			} else if (sKey === "A") {
	
				// Navigate to auto parking view
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("AutoPark");

			}
		},

		fn_LoadInitial: function() {

	var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
	if (oKeyDataModel) {
	    var oData = oKeyDataModel.getData();
 
	    var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
 
	    this.getView().setModel(oJSONUserName, "JSusername");
	}
		},

		fn_transhis: function(oEvent) {
			var that = this;
			var oContext = oEvent.getSource().getBindingContext("AutoParkModel");
			var sQid = oContext.getProperty("Qid");
			var sBukrs = oContext.getProperty("Bukrs");
			//sStatus = "S40";  //line commented by yasin on 15-09-2025

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oModel.read("/DEEPHEADSet", {
				filters: [
					new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.EQ, sQid),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs),
					new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, sStatus)
				],
				urlParameters: {
					$expand: "NavTransHis"
				},

				success: function(oData) {
					if (oData.results?.length) {
						var aComments = oData.results[0].NavTransHis?.results || [];
						that.getView().setModel(new sap.ui.model.json.JSONModel(aComments), "oComment");

						// show history and hide invoice header
						that.getView().getModel("viewState").setProperty("/showHistory", true);
						that.getView().getModel("viewState").setProperty("/showInvoiceHeader", false);
						that.getView().byId("id_scrllap").setVisible(false);
						var oModel1 = new sap.ui.model.json.JSONModel([{
							"Key": true
						}]);
						that.getView().setModel(oModel1, "JsScrl");

						var oTabModel = that.getOwnerComponent().getModel("jsTab");
						oTabModel.setData([{
							"Key": false,
							"Width": "5%",
							"Align": "Center",
							"Icon": true
						}]);
						that.getView().setModel(oTabModel, "jsTab");

						that.getView().byId("id_pdf_slideap").setWidth("68%");
						that.getView().byId("idTable").setWidth("100%");
						that.setColumnWidths("fixed");

						// Hide PDF area
						that.getView().byId("id_scrllap").destroyContent();

					} else {
						sap.m.MessageToast.show("No Transaction History Found");
					}
				}
			});
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
		fncustomcolumns: function(oEvent) {
			var oView = this.getView();

			// create fragment only once
			if (!this._oCustomizePopover) {
				this._oCustomizePopover = sap.ui.xmlfragment("FSC360NEW.fragment.CustomCol_Autopark", this);

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
    const sTableName = "/EXL/FSC_TEMP";

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
				},
				error: function() {
					sap.m.MessageToast.show("Failed to reload templates");
				}
			});
		},
		onApplyTemplate: function() {
			//this.applyVisibleColumns();
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}

		},

		fn_onOpenTemplatePopover: function(oEvent) {
			const oView = this.getView();
			const sTableName = "/EXL/FSC_TEMP";
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
		fn_onDeleteTemplateRow: function (oEvent) {
    var oButton = oEvent.getSource();
    var oCtx = oButton.getBindingContext("viewModel1");
    if (!oCtx) {
        return;
    }

    var sTemplateName = oCtx.getProperty("name");
    var sReportName = "/EXL/FSC_TEMP"; // Hardcoded Tabid

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
		onTemplateSelectionChange: function(oEvent) {
			const oListItem = oEvent.getParameter("listItem");
			const sSelectedName = oListItem.getBindingContext("viewModel1").getProperty("name");

			const oViewModel = this.getView().getModel("viewModel1");
			oViewModel.setProperty("/selectedTemplate", sSelectedName);
			localStorage.setItem("LastUsedTemplate", sSelectedName);

			const oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
			const aSelectedFields = oTemplates[sSelectedName];
			if (!aSelectedFields) return;

			const oColModel = this.getView().getModel("FilterTableModel");
			const aCols = oColModel.getData();

			const updated = aCols.map(col => ({
				...col,
				visible: !!aSelectedFields.find(sel => sel.key === col.key)
			}));

			// Force update
			oColModel.setData(JSON.parse(JSON.stringify(updated)));
			// Set table width to 100% after applying template
			this.getView().getModel("viewModel1").setProperty("/forceFullWidth", true);

			// Apply changes
			//this.applyVisibleColumns();

			// Optional: Close popover
			this._oTemplatePopover.close();
			this._oTemplatePopover.destroy();
			this._oTemplatePopover = null;
		},

		fn_pdf: function(oEvent) {
			// Step 1: Get the row context from the clicked button
			var oButton = oEvent.getSource();
			var oRowContext = oButton.getBindingContext("AutoParkModel");

			// Step 2: Get the table and its binding contexts
			var oTable = this.byId("idTable");
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
			this.getView().getModel("viewState").setProperty("/showHistory", false);
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
					this.openErrorDialog(' Please Select the Queue ID');
			}
		},
		fn_list: function(oEvent) {

			QueueID = oEvent.getSource().getBindingContext('AutoParkModel').getProperty('Qid');
			

		},
		fn_pdf_alignment: function() {
			if (QueueID !== "") {
				if (QueueID === PrevQid && this.getView().byId("id_scrllap").getVisible()) {
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
					this.getView().byId("id_pdf_slideap").setWidth("100%");

					this.getView().byId("id_vbox_tableapk").setWidth("100%");

				} else if (QueueID !== PrevQid && this.getView().byId("id_scrllap").getVisible()) {
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
					this.getView().byId("id_pdf_slideap").setWidth("68%");

					this.getView().byId("idTable").setWidth("100%");
					this.setColumnWidths("fixed");
				} else if (!this.getView().byId("id_scrllap").getVisible()) {
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
					this.getView().byId("id_pdf_slideap").setWidth("68%");

					this.getView().byId("idTable").setWidth("100%");
					this.setColumnWidths("fixed");
				}
			} else if (QueueID === "") {
				sap.m.MessageBox.error("Please Select the Queue ID");
			}

		},

		fnGetPDF: function(QueueID) {

			if (QueueID !== "") {
				// oGlobalBusyDialog.open();
				this.getView().byId('id_scrllap').setBusy(false);
				var oScorl = this.getView().byId("id_scrllap");

				oScorl.destroyContent();
				// var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=0&zoom=60";
var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=1";

				var oHtml = new sap.ui.core.HTML({

				});
				// var oContent = "<div class='overlay'><iframe src=" + Url +
				// 	" id='id_imageIfrm' '  scrolling='yes' height='380' width='380' ></iframe></div>";
					var oContent = "<div class='overlay'><iframe src=" + Url +
					"  id='id_imageIfrm' ' allowtransparency='false' scrolling='yes'  height='430' width='360'></iframe></div>";
	
				oHtml.setContent(oContent);
				var oScrl = this.getView().byId("id_scrllap");
				oScrl.addContent(oHtml);
				// oScrl.setVisible(true);
				$('id_scrll').click(false);
				// oGlobalBusyDialog.close();
			} else {
				sap.m.MessageBox.error("Please Select the Queue ID");
			}
		},
		setColumnWidths: function(mode) {
			var oTable = this.getView().byId("idTable");
			var aColumns = oTable.getColumns();

			if (mode === "fixed") {
			
			} else if (mode === "responsive") {
			
			}
		},

		fn_close_pdf: function() {
			var oModel1 = new sap.ui.model.json.JSONModel([{
				"Key": false
			}]);
			this.getView().setModel(oModel1, 'JsScrl');

			// Hide transaction history if open
			this.getView().getModel("viewState").setProperty("/showHistory", false);

			// Reset layout sizes
			this.getView().byId("id_pdf_slideap").setWidth("100%");
			this.setColumnWidths("responsive");
		},

		// Updates placeholder dynamically when user changes selection in MultiComboBox
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
		onSearchFieldsChange: function(oEvent) {
			var oMCB = oEvent.getSource();

			// Remove all tokens so selected items don't appear
			// oMCB.removeAllTokens();
			var aSelectedItems = oEvent.getSource().getSelectedItems();

			const labelMap = {
				Qid: "Queue Id",
				Name1: "Vendor",
				Invno: "Invoice No",
				Documentnumber: "Miro Doc.No",
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

			if (!this.aFullAutoParkData) {
				this.aFilteredAutoParkData = [];
				this.updateAutoParkPaginatedModel();
				return;
			}

			// Get selected fields from MultiComboBox
			var aSelectedItems = this.getView().byId("id_search_fields").getSelectedItems();
			var aFieldsToFilter = aSelectedItems.length ? aSelectedItems.map(function(item) {
				return item.getKey();
			}) : ["Qid"]; // default field if nothing selected

			if (vValue && vValue.length > 0) {
				var aTerms = vValue.toLowerCase().split(/\s+/).filter(Boolean);

				var filteredData = this.aFullAutoParkData.filter(function(row) {
					return aTerms.every(function(term) {
						return aFieldsToFilter.some(function(field) {
							return row[field] && row[field].toLowerCase().includes(term);
						});
					});
				});

				this.aFilteredAutoParkData = filteredData;
			} else {
				this.aFilteredAutoParkData = this.aFullAutoParkData;
			}

			this.iAutoParkCurrentPage = 1;
			this.updateAutoParkPaginatedModel();
		},
		// Handle field selection/deselection
		handleMCBSelection: function(oEvent) {
			var oMCB = oEvent.getSource();
			this.aFilterFields = oMCB.getSelectedKeys(); // store selected fields
		},

		handleMCBSearch: function(oEvent) {
			var vValue = oEvent.getParameter("value").trim(); // typed value
			var oTable = this.getView().byId("id_table");
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
		updateAutoParkPaginatedModel: function() {
			var iStart = (this.iAutoParkCurrentPage - 1) * this.iAutoParkRowsPerPage;
			var iEnd = iStart + this.iAutoParkRowsPerPage;

			// Always use filtered data if available, else full data
			var aSourceData = this.aFilteredAutoParkData && this.aFilteredAutoParkData.length >= 0 ? this.aFilteredAutoParkData : this.aFullAutoParkData;

			var aPageData = aSourceData.slice(iStart, iEnd);

			var oPagedModel = new sap.ui.model.json.JSONModel();
			oPagedModel.setData(aPageData);

			this.getView().setModel(oPagedModel, "AutoParkModel");

			this.renderAutoParkPageNumbers();
		},

		onNextAutoParkPage: function() {
			var iTotalPages = Math.ceil(this.aFullAutoParkData.length / this.iAutoParkRowsPerPage);
			if (this.iAutoParkCurrentPage < iTotalPages) {
				this.iAutoParkCurrentPage++;
				this.updateAutoParkPaginatedModel();
			}
		},

		onPreviousAutoParkPage: function() {
			if (this.iAutoParkCurrentPage > 1) {
				this.iAutoParkCurrentPage--;
				this.updateAutoParkPaginatedModel();
			}
		},

		updateAutoParkPaginatedModel: function() {
			var iStart = (this.iAutoParkCurrentPage - 1) * this.iAutoParkRowsPerPage;
			var iEnd = iStart + this.iAutoParkRowsPerPage;

			// use filtered data if it exists
			var sourceData = this.aFilteredAutoParkData || this.aFullAutoParkData || [];
			var pageData = sourceData.slice(iStart, iEnd);

			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "AutoParkModel");

			this.renderAutoParkPageNumbers();
		},
		renderAutoParkPageNumbers: function() {
			var oPageBox = this.byId("idPageNumbersBoxap");
			oPageBox.removeAllItems();

			var totalData = this.aFilteredAutoParkData || this.aFullAutoParkData || [];
			var iTotalPages = Math.ceil(totalData.length / this.iAutoParkRowsPerPage);
			var currentPage = this.iAutoParkCurrentPage;

			// Show total count
			this.getView().byId("id_tot").setText(totalData.length);

			// Hide Prev / Next if only 1 page or no data
			if (iTotalPages <= 1) {
				this.byId("idPrevButtonap").setVisible(false);
				this.byId("idNextButtonap").setVisible(false);
				return;
			}

			var that = this;

			function getPageNumbers(currentPage, totalPages) {
				var pages = [];
				if (totalPages <= 7) {
					for (var i = 1; i <= totalPages; i++) pages.push(i);
				} else {
					if (currentPage <= 2) {
						pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
					} else if (currentPage >= totalPages - 1) {
						pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
					} else {
						pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
					}
				}
				return [...new Set(pages)];
			}

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iAutoParkCurrentPage = pageNum;
						that.updateAutoParkPaginatedModel();
					}
				});
				oButton.addStyleClass(pageNum === currentPage ? "cl_page_btn_emp" : "cl_page_btn");
				oPageBox.addItem(oButton);
			}

			var pagesToShow = getPageNumbers(currentPage, iTotalPages);
			pagesToShow.forEach(function(page) {
				if (page === "...") {
					oPageBox.addItem(new sap.m.Text({
						text: "...",
						design: "Bold",
						textAlign: "Center",
						width: "2rem"
					}));
				} else addPageButton(page);
			});

			// Prev / Next visibility
			this.byId("idPrevButtonap").setVisible(currentPage > 1);
			this.byId("idNextButtonap").setVisible(currentPage < iTotalPages);
		},
		onSectionCodeChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();
			var oContext = oInput.getBindingContext("AutoParkModel");

			// Update the model live
			oContext.getModel().setProperty("Secco", sValue, oContext);

		},

		fnupdate: function() {
			var oTable = this.byId("idTable");
			var aSelectedIndices = oTable.getSelectedIndices();

			if (aSelectedIndices.length === 0) {
				sap.m.MessageBox.warning("Please select at least one row");
				return;
			}

			var oModel = this.getView().getModel("AutoParkModel");
			var aData = oModel.getProperty("/");

			var aPayloadRows = [];

			for (var i = 0; i < aSelectedIndices.length; i++) {
				var item = aData[aSelectedIndices[i]];

				if (!item.Secco || item.Secco.trim() === "") {
					sap.m.MessageToast.show("Please enter Section Code for all selected rows.");
					return;
				}

				item.updateflag = "X"; // mark for update

				aPayloadRows.push({
					Qid: item.Qid,
					Secco: item.Secco,
					WtWithcd: item.WtWithcd,
					Updateflag: item.updateflag
				});
			}

			if (aPayloadRows.length === 0) {
				sap.m.MessageToast.show("No data available to update.");
				return;
			}

			// --- Deep entity payload ---
			var oEntity = {
				Qid: "",
				Navtoautopark: aPayloadRows,
				Navtoapreturn: [] // to get messages back
			};

			var oSrvModel = this.getView().getModel();
			oSrvModel.create("/AutoParkSet", oEntity, {
				success: function(oData) {

					// Update local table with Secco values
					aPayloadRows.forEach(function(updatedRow) {
						var index = aData.findIndex(function(d) {
							return d.Qid === updatedRow.Qid;
						});
						if (index >= 0) {
							aData[index].Secco = updatedRow.Secco;
						}
					});
					oModel.setProperty("/", aData);

					// Handle return messages
					if (oData.Navtoapreturn && oData.Navtoapreturn.results && oData.Navtoapreturn.results.length > 0) {
						var aMessages = oData.Navtoapreturn.results;
						var aTexts = aMessages.map(function(m) {
							return (m.Type || "") + ": " + (m.Message || "");
						});
						var sMsgText = aTexts.join("\n");
						var sType = aMessages[0].Type;

						if (sType === "E") {
							sap.m.MessageBox.error(sMsgText);
						} else if (sType === "W") {
							sap.m.MessageBox.warning(sMsgText);
						} else {
							sap.m.MessageBox.success(sMsgText);
						}

					} else {
						sap.m.MessageToast.show("Update successful!");
					}

				},
				error: function(oError) {

					sap.m.MessageBox.error("Update failed.");
				}
			});
		},

		fnpost: function() {
			var oSrvModel = this.getView().getModel();
			var oController = this;
			if (!oSrvModel || !oSrvModel.create) {
				sap.m.MessageToast.show("OData model not found");
				return;
			}

			var oTable = this.byId("idTable");
			var aIndices = oTable.getSelectedIndices();
			if (aIndices.length === 0) {
				sap.m.MessageBox.warning("Please select at least one row");
				return;
			}

			// // --- Collect selected Qids ---
			// var aQids = [];
			// aIndices.forEach(function (iIndex) {
			//     var oContext = oTable.getContextByIndex(iIndex);
			//     var oRow = oContext.getObject();
			//     aQids.push({ Qid: oRow.Qid });
			// });
			// --- Collect selected rows with Secco ---
			var aQids = [];
			for (var i = 0; i < aIndices.length; i++) {
				var oContext = oTable.getContextByIndex(aIndices[i]);
				var oRow = oContext.getObject();

				if (!oRow.Secco || oRow.Secco.trim() === "") {
					sap.m.MessageToast.show("Please enter Section Code for all selected rows.");
					return;
				}

				aQids.push({
					Qid: oRow.Qid,
					Secco: oRow.Secco,
					WtWithcd: oRow.WtWithcd || "" // include if needed
				});
			}

			// --- Build deep entity ---
			var oEntity = {
				Qid: "",
				Bukrs: "",
				Navtoautopark: aQids,
				Navtoapreturn: []
			};

			// --- Call OData Create ---
			oSrvModel.create("/AutoParkSet", oEntity, {
				success: function(oData) {

					// If Navtoapreturn is expanded
					if (oData.Navtoapreturn && oData.Navtoapreturn.results) {
						var aMessages = oData.Navtoapreturn.results;

						if (aMessages.length > 0) {
							var aTexts = aMessages.map(function(m) {
								return (m.Type || "") + ": " + (m.Message || "");
							});
							var sMsgText = aTexts.join("\n");

							// --- Decide popup type based on first message ---
							var sType = aMessages[0].Type;
							if (sType === "E") {
								sap.m.MessageBox.error(sMsgText);
							} else if (sType === "W") {
								sap.m.MessageBox.warning(sMsgText);
							} else {
								// sap.m.MessageBox.success(sMsgText);
								var oSuccessModel = new sap.ui.model.json.JSONModel({
									message: sMsgText
								});
								oController.getView().setModel(oSuccessModel, "successModel");

								// Load and open fragment
								if (!oController._oSuccessDialog) {
									oController._oSuccessDialog = sap.ui.xmlfragment(
										"FSC360NEW.fragment.SuccessAutopark",
										oController
									);
									oController.getView().addDependent(oController._oSuccessDialog);
								}
								oController._oSuccessDialog.open();

								// Auto close after 3 seconds
								setTimeout(function() {
									oController._oSuccessDialog.close();
								}, 3000);
								location.reload();
							}
						} else {
							sap.m.MessageBox.success("Post successful, but no messages returned.");
						}

					} else if (oData.Navtoapreturn && oData.Navtoapreturn.__deferred) {
						// fallback: deferred read
						var sNavUri = oData.Navtoapreturn.__deferred.uri;
						oSrvModel.read(sNavUri, {
							success: function(oReturnData) {

								var aMessages = oReturnData.results;
								if (aMessages && aMessages.length > 0) {
									var aTexts = aMessages.map(function(m) {
										return (m.Type || "") + ": " + (m.Message || "");
									});
									var sMsgText = aTexts.join("\n");

									var sType = aMessages[0].Type;
									if (sType === "E") {
										sap.m.MessageBox.error(sMsgText);
									} else if (sType === "W") {
										sap.m.MessageBox.warning(sMsgText);
									} else {
										// sap.m.MessageBox.success(sMsgText);
										var oSuccessModel = new sap.ui.model.json.JSONModel({
											message: sMsgText
										});
										oController.getView().setModel(oSuccessModel, "successModel");

										// Load and open fragment
										if (!oController._oSuccessDialog) {
											oController._oSuccessDialog = sap.ui.xmlfragment(
												"FSC360NEW.fragment.SuccessAutopark",
												oController
											);
											oController.getView().addDependent(oController._oSuccessDialog);
										}
										oController._oSuccessDialog.open();

										// Auto close after 3 seconds
										setTimeout(function() {
											oController._oSuccessDialog.close();
										}, 3000);
										location.reload();
									}
								} else {
									sap.m.MessageBox.success("Post successful, but no messages returned.");
								}
							},
							error: function(oError) {

								sap.m.MessageBox.success("Post successful, but failed to fetch messages.");
							}
						});

					} else {
						sap.m.MessageBox.success("Post successful (no return messages).");
					}
				},
				error: function(oError) {

					try {
						var oErrObj = JSON.parse(oError.responseText);
						sap.m.MessageBox.error(oErrObj.error.message.value || "Post failed.");
					} catch (e) {
						sap.m.MessageBox.error("Post failed (no details).");
					}
				}
			});
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
			if (oSelectedItem && this._oSectionInput) {
				var oContext = this._oSectionInput.getBindingContext("AutoParkModel");
				if (oContext) {
					var sPath = oContext.getPath() + "/Secco";
					oContext.getModel().setProperty(sPath, oSelectedItem.getTitle());
					oContext.getModel().refresh(true); // force update in UI
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		fn_Section_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Seccode", sap.ui.model.FilterOperator.Contains, sValue);
			// var Filter2 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		fnViewdetails: function() {
			var oTable = this.byId("idTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			var aSelectedData = [];

			if (aSelectedIndices.length === 0) {
				sap.m.MessageToast.show("Please select at least one record");
				return;
			}
			if (aSelectedIndices.length > 5) {
				sap.m.MessageToast.show("You can select a maximum of 5 records only");
				return;
			}
			// Collect selected rows’ data
			aSelectedIndices.forEach(function(iIndex) {
				var oContext = oTable.getContextByIndex(iIndex);
				if (oContext) {
					aSelectedData.push(oContext.getObject());
				}
			});

			// Field label mapping
			var oFieldLabels = {
				Qid: "Queid Number",
				Scancenter: "Plant Code",
				Lifnr: "Vendor Number",
				Name1: "Vendor Name",
				Scanned: "Scanned",
				MsmeType: "MSME Type",
				Invdt: "Invoice Date",
				Invno: "Invoice Number",
				Invoiceamt: "Invoice Amt.",
				WtWithcd: "With Tax Code",
				WtQsshb: "With Tax Amt.",
				Wrbtr: "Advance Amt.",
				WrbtrNon: "NonPo Adv Amt.",
				Intx: "Tax Amt.",
				Ntamt: "Net Amt.",
				Waers: "Curr.",
				Transhistory: "Trans history",
				Bupla: "Buss. Place",
				Secco: "Sec. Code",
				Erdat: "Posting Date",
				Bedat: "PO Posting Date",
				Budat: "GRN Posting Date",
				Documentnumber: "MIRO Doc.No",
				AccDoc: "Sap Doc.No",
				GrnDoc: "GRNDoc.No",
				Autotext: "Auto Text",
				Bankn: "Bank Account Number",
				Bankl: "Bank IFSC code.",
				Banka: "Bank Name",
				Gstno: "GST No.",
				HsnSac: "HSN code",
				Bukrs: "Company",
				Ebelp: "PO Item",
				Ebeln: "PO Number",
				Transtype: "Transtype",
				Gldesc: "GL Desc",
				Hkont: "GL Account"
			};

			var aDateFields = ["Invdt", "Erdat", "Bedat", "Budat"];
			var aImageFields = ["Scanned", "Transhistory"];
			var aColorFields = ["Lifnr", "Name1", "MsmeType", "Invdt", "Invno", "Invoiceamt"];

			// Transpose data
			var aFields = Object.keys(oFieldLabels);
			var aTransposed = aFields.map(function(field) {
				var oRow = {
					Field: oFieldLabels[field] || field
				};
				aSelectedData.forEach(function(item, idx) {
					var vValue = item[field] || "";
					var oCell = {
						text: vValue,
						qid: item.Qid,
						bukrs: item.Bukrs
					};

					if (aImageFields.includes(field)) {
						oCell.icon = field === "Scanned" ? "Images/document.svg" : "Images/comentbox_fragment.svg";
					} else {
						if (aDateFields.includes(field)) {
							oCell.text = FSC360NEW.model.formatter.Date(vValue) || vValue;
						}
						if (["Invoiceamt", "Wrbtr", "WrbtrNon" ,"Ntamt", "Intax"].includes(field)) {
							oCell.text = FSC360NEW.model.formatter.fnAmount(vValue) || vValue;
						}
						if (["Lifnr", "Name1", "MsmeType"].includes(field)) {
							oCell.color = FSC360NEW.model.formatter.formatInvoiceDateColor(item.MsmeType) || "";
						} else if (field === "Invdt") {
							oCell.color = FSC360NEW.model.formatter.formatInvoiceDateColor(item.InvdtMatch) || "";
						} else if (["Invno", "Invoiceamt"].includes(field)) {
							oCell.color = FSC360NEW.model.formatter.formatInvoiceDateColor(item.InvnoMatch) || "";
						}
					}
					oRow[idx] = oCell;
				});

				return oRow;
			});

			var oTransposedModel = new sap.ui.model.json.JSONModel(aTransposed);

			// Load fragment
			if (!this._oViewDetailsFrag) {
				this._oViewDetailsFrag = sap.ui.xmlfragment(
					"idViewDetailsFrag",
					"FSC360NEW.fragment.ViewDetails",
					this
				);
				this.getView().addDependent(this._oViewDetailsFrag);
			}

			var oFragTable = sap.ui.core.Fragment.byId("idViewDetailsFrag", "idViewDetailsTable");
			oFragTable.removeAllColumns();

			// Add Field column
			oFragTable.addColumn(new sap.ui.table.Column({
				label: new sap.m.Label({
					text: "Field"
				}),
				template: new sap.m.Text({
					text: "{TransposedModel>Field}"
				}).addStyleClass("cl_first_col"),
				width: "150px"
			}));

			// Add columns for each record
			aSelectedData.forEach(function(item, idx) {
				var oTemplate = new sap.m.HBox({
					items: [
						new sap.m.Text({
							text: "{TransposedModel>" + idx + "/text}",
							customData: [
								new sap.ui.core.CustomData({
									key: "name1Color",
									value: "{= ${TransposedModel>" + idx + "/color} ? ${TransposedModel>" + idx + "/color} : ''}",
									writeToDom: true
								})
							]
						}).addStyleClass("cl_column_cell")
					]
				});

				// Add button for image fields dynamically
				if (aImageFields.some(function(field) {
						return aFields.includes(field);
					})) {
					oTemplate.insertItem(new sap.m.Button({
						icon: "{TransposedModel>" + idx + "/icon}",
						type: "Transparent",
						tooltip: "{= ${TransposedModel>Field} === 'Scanned' ? 'Scanned document' : 'Transaction history'}",
						press: function(oEvent) {
							var oButton = oEvent.getSource();
							var sIcon = oButton.getIcon();

							switch (sIcon) {
								case "Images/document.svg":
									this.fn_fragment_pdf(oEvent);
									break;
								case "Images/comentbox_fragment.svg":
									this.fn_transhis_fragment(oEvent);
									break;
								default:
									sap.m.MessageToast.show("Unknown action");
									break;
							}
						}.bind(this),
						visible: "{= !!${TransposedModel>" + idx + "/icon}}",
						customData: [
							new sap.ui.core.CustomData({
								key: "qid",
								value: "{TransposedModel>" + idx + "/qid}"
							}),
							new sap.ui.core.CustomData({
								key: "bukrs",
								value: "{TransposedModel>" + idx + "/bukrs}"
							})
						]
					}).addStyleClass("{= ${TransposedModel>Field} === 'Transhistory' ? 'cl_small_icon' : ''}"), 0);
				}

				// Calculate dynamic width
				var iTotalCols = aSelectedData.length;
				var sColWidth = (100 / (iTotalCols + 1)) + "%"; // "+1" is for Field column

				oFragTable.addColumn(new sap.ui.table.Column({
					label: new sap.m.Label({
						text: "Record " + (idx + 1)
					}),
					template: oTemplate,
					width: sColWidth
				}));
			}.bind(this));

			// Bind model and rows
			oFragTable.setModel(oTransposedModel, "TransposedModel");
			oFragTable.bindRows("TransposedModel>/");

			// Force re-render if needed
			oFragTable.invalidate();

			this._oViewDetailsFrag.open();
		},

		fn_getRowDataFromEvent: function(oEvent) {
			var oButton = oEvent.getSource();
			var oRowContext = oButton.getBindingContext("TransposedModel");

			if (!oRowContext) {
				sap.m.MessageToast.show("No row context found!");
				return null;
			}

			var sQueueID = oButton.getCustomData().find(d => d.getKey() === "qid")?.getValue();
			var sBukrs = oButton.getCustomData().find(d => d.getKey() === "bukrs")?.getValue();

			if (!sQueueID) {
				sap.m.MessageToast.show("Unable to determine Queue ID!");
				return null;
			}

			return {
				sQueueID,
				sBukrs,
				oRowObject: oRowContext.getObject()
			};
		},

		// For comments
		fn_transhis_fragment: function(oEvent) {
			var oData = this.fn_getRowDataFromEvent(oEvent);
			if (!oData) return;

			if (!oData.sBukrs) {
				sap.m.MessageToast.show("Unable to determine Company Code!");
				return;
			}

			this.fn_comments(oData.sQueueID, oData.sBukrs);
		},

		//  For PDF
		fn_fragment_pdf: function(oEvent) {
			var oData = this.fn_getRowDataFromEvent(oEvent);
			if (!oData) return;

			this.fn_pdf_autopark(oData.sQueueID);
		},

		fn_comments: function(Queid, Bukrs) {
			var that = this;
			// var sStatus = "S40"; //line commented by yasin on 15-09-2025

			if (!this.Comments) {
				this.Comments = sap.ui.xmlfragment("FSC360NEW.fragment.getComments_autopark", this);
				this.getView().addDependent(this.Comments);
			}
			this.Comments.open();

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oModel.read("/DEEPHEADSet", {
				filters: [
					new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.EQ, Queid),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, Bukrs),
					new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, sStatus)
				],
				urlParameters: {
					$expand: "NavTransHis"
				},

				success: function(oData) {
					if (oData.results?.length) {
						var aComments = oData.results[0].NavTransHis?.results || [];
						that.getView().setModel(new sap.ui.model.json.JSONModel(aComments), "ofragComment");
					}
				},
				error: function(oError) {
					sap.m.MessageToast.show("Error loading comments");
					
				}
			});
		},
		fnfragPDFClose: function() {
			this.pdf.close();
		},
		fnfragCommentsClose: function() {
			this.Comments.close();
		},
		fn_pdf_autopark: function(Queid) {
			if (!this.pdf) {
				this.pdf = sap.ui.xmlfragment("FSC360NEW.fragment.getPDF_autopark", this);
				this.getView().addDependent(this.pdf);
			}
			this.pdf.open();
			sap.ui.getCore().byId("id_scrll").setBusy(false);
			var oScorl = sap.ui.getCore().byId("id_scrll");

			oScorl.destroyContent();
			var Url = "/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/ImageSet('" + Queid + "')/$value";

			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div class='overlay'><iframe src=" + Url + " id='id_scrll' ' class='cl_pdfile'></iframe></div>";

			oHtml.setContent(oContent);

			var oScrl = sap.ui.getCore().byId("id_scrll");
			oScrl.addContent(oHtml);

			oScrl.setVisible(true);

			$('id_scrll').click(false);

		},
		fn_fragViewClose: function() {
			if (this._oViewDetailsFrag) {
				this._oViewDetailsFrag.close();
			}
		},
		onAfterSimulateDialogOpen: function(oEvent) {
			var oDialog = oEvent.getSource();
			oDialog.$().css({
				width: "950px",
				height: "100%",
				top: "0px",
				right: "0px",
				left: "auto",
				bottom: "0px",
				transform: "none"
			});
		},
		fn_AfterGetPDFOpen: function(oEvent) {
			var oDialog = oEvent.getSource();
			oDialog.$().css({
				width: "402px",
				height: "100%",
				top: "0px",
				right: "0px",
				left: "auto",
				bottom: "0px",
				transform: "none"
			});
		},
		fn_AfterGetCommentsOpen: function(oEvent) {
			var oDialog = oEvent.getSource();
			oDialog.$().css({
				width: "402px",
				height: "100%",
				top: "0px",
				right: "0px",
				left: "auto",
				bottom: "0px",
				transform: "none"
			});
		},
		fnToggleWrapText: function() {
			var oTable = this.byId("idTable");
			var oColumns = oTable.getColumns();

			if (!this._bWrap) {
				// ----- Enable WRAP MODE -----
				this._bWrap = true;
				oTable.addStyleClass("cl_Agentfield");

				// collect visible cols + total rem
				var aVisible = [];
				var totalRem = 0;
				oColumns.forEach(function(c, i) {
					if (c.getVisible()) {
						var rem = parseFloat(this._aDefaultWidths[i]);
						aVisible.push({
							col: c,
							rem: rem
						});
						totalRem += rem;
					}
				}.bind(this));

				// assign proportional % widths
				aVisible.forEach(function(o) {
					var percent = (o.rem / totalRem) * 100;
					o.col.setWidth(percent.toFixed(2) + "%");
				});

			} else {
				// ----- Back to CLIP MODE -----
				this._bWrap = false;
				oTable.removeStyleClass("cl_Agentfield");

				// restore rem widths
				oColumns.forEach(function(c, i) {
					if (this._aDefaultWidths[i]) {
						c.setWidth(this._aDefaultWidths[i]);
					}
				}.bind(this));
			}
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
		fn_onRadioSelect: function(oEvent) {
			var sSelectedText = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedText === "Open") {
				this.byId("id_post").setVisible(true);
				this.byId("id_update_btn").setVisible(true);
				sStatus = "S40";
				this.fnloadAutoParkData();
			} else {
				this.byId("id_post").setVisible(false);
				this.byId("id_update_btn").setVisible(false);
				sStatus = "S41";
				this.fnloadAutoParkData();
			}
		},

		fnReverse: function() {
			if (!this._oReverseDialog) {
				FragmentId = "idFieldExtenFrag";
				this._oReverseDialog = sap.ui.xmlfragment(FragmentId,
					"FSC360NEW.fragment.AutoParkReversal",
					this
				);
				this.getView().addDependent(this._oReverseDialog);
			}
			this._oReverseDialog.open();
		},
		fn_agent_submit: function() {
			var that = this;
			var oDialog = this._oReverseDialog;

			// Get selected transaction type
			var oCombo = Fragment.byId(FragmentId, "id_transactiontyp");
			var oPodate = Fragment.byId(FragmentId, "id_podate");
			var sPostingDate = oPodate.getValue();
			var sTransKey = oCombo.getSelectedKey();
			var sTransText = oCombo.getSelectedItem() ? oCombo.getSelectedItem().getText() : "";
			var oDate = oPodate.getDateValue(); // JavaScript Date object
			var sPostingDateBackend = new Date(Date.UTC(
				oDate.getFullYear(),
				oDate.getMonth(),
				oDate.getDate()
			));
			if (!oDate) {
				sap.m.MessageToast.show("Please select a posting date.");
				return;
			}

			if (!sTransKey) {
				sap.m.MessageToast.show("Please select a reversal reason.");
				return;
			}

			// Get selected row from table
			var oTable = this.byId("idTable");
			var aSelectedIndices = oTable.getSelectedIndices();

			if (!aSelectedIndices.length) {
				sap.m.MessageToast.show("Please select a row to reverse.");
				oDialog.close();
				return;
			}

			// Add Status and Transaction Type
			var aRowsWithStatus = aSelectedIndices.map(function(iIndex) {
				var oSelectedRow = oTable.getContextByIndex(iIndex).getObject();

				return Object.assign({}, oSelectedRow, {
					Stats: sStatus,
					Sgtxt: sTransKey,
					Budat: sPostingDateBackend
				});
			});

			var oPayload = {
				IvAction: "AutoParkRev",
				NavAutoPark: aRowsWithStatus,
				NavReturn: []
			};

			

			// Call backend
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(0);
			oModel.create("/DEEPHEADSet", oPayload, {

				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					that._oReverseDialog.close();
					that._oReverseDialog.destroy();
					that._oReverseDialog = null;

					var aMessages = oData.NavReturn && oData.NavReturn.results ? oData.NavReturn.results : [];

					// Separate errors and successes
					var aErrors = aMessages.filter(function(msg) {
						return msg.Type === "E" || msg.Type === "A";
					});

					var aSuccess = aMessages.filter(function(msg) {
						return msg.Type === "S" || msg.Type === "W" || msg.Type === "I" || !msg.Type;
					});

					// Show errors first if any
					if (aErrors.length > 0) {
						var sErrorMsg = aErrors.map(function(msg) {
							return msg.Message;
						}).join("\n");

						var oErrorModel = new sap.ui.model.json.JSONModel({
							message: sErrorMsg
						});
						that.getView().setModel(oErrorModel, "errorModel");

						if (!that._oErrorDialog) {
							that._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ErrorReuse", that);
							that.getView().addDependent(that._oErrorDialog);
						}

						that._oErrorDialog.open();

						setTimeout(function() {
							if (that._oErrorDialog && that._oErrorDialog.isOpen()) {
								that._oErrorDialog.close();
							}
						}, 4000);
					}

					// Show successes separately if any
					if (aSuccess.length > 0) {
						var sSuccessMsg = aSuccess.map(function(msg) {
							return msg.Message;
						}).join("\n") || "Reverse triggered successfully.";

						var oSuccessModel = new sap.ui.model.json.JSONModel({
							message: sSuccessMsg
						});
						that.getView().setModel(oSuccessModel, "successModel");

						if (!that._oSuccessDialog) {
							that._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.fragment.SuccessReuse", that);
							that.getView().addDependent(that._oSuccessDialog);
						}

						that._oSuccessDialog.open();

						setTimeout(function() {
							if (that._oSuccessDialog && that._oSuccessDialog.isOpen()) {
								that._oSuccessDialog.close();
								that._oSuccessDialog.destroy();
								that._oSuccessDialog = null;
								that.fnloadAutoParkData();
							}
						}, 3000);
					}
				},

				error: function(oError) {
					that._oReverseDialog.close();
					that._oReverseDialog.destroy();
					that._oReverseDialog = null;

					// Extract meaningful error text from oError
					var sErrorMsg = "Failed to trigger reverse.";
					try {
						var oResponse = JSON.parse(oError.responseText);
						if (oResponse && oResponse.error && oResponse.error.message && oResponse.error.message.value) {
							sErrorMsg = oResponse.error.message.value;
						}
					} catch (e) {
				
					}

					var oErrorModel = new sap.ui.model.json.JSONModel({
						message: sErrorMsg
					});
					that.getView().setModel(oErrorModel, "errorModel");

					if (!that._oErrorDialog) {
						that._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ErrorReuse", that);
						that.getView().addDependent(that._oErrorDialog);
					}

					that._oErrorDialog.open();

					setTimeout(function() {
						if (that._oErrorDialog && that._oErrorDialog.isOpen()) {
							that._oErrorDialog.close();
							that._oErrorDialog.destroy();
							that._oErrorDialog = null;
							that.fnloadAutoParkData();
						}
					}, 2000);

				}
			});
		},
		fn_Assign_cancel: function() {
			this._oReverseDialog.close();
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
			fn_onZoomIn: function() {
			var oScroll = this.getView().byId("id_scrllap");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale, default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;
			var newScale = currentScale + 0.1;
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // scale from top-left corner
		},

		fn_onZoomOut: function() {
			var oScroll = this.getView().byId("id_scrllap");
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
			var iframe = this.getView().byId("id_scrllap").getContent()[0].getDomRef().querySelector('iframe');
			if (iframe) {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			}
		},

		fn_onDownload: function() {
			var QueueID = window.QueueID || "";
			if (!QueueID) {
				sap.m.MessageBox.error("Please Select the Queue ID");
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
					link.download = "Invoice_" + QueueID + ".pdf";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					sap.m.MessageBox.error("Error while downloading: " + err.message);
				});
		},
			openErrorDialog: function(sMessage) {
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
		fn_onCloseErrorDialog: function() {
			if (this.ErrorDialog) {
				// this.ErrorDialog.close();
				this.ErrorDialog.destroy();
				this.ErrorDialog = null;
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
				this.SuccessDialog.destroy();
				this.SuccessDialog = null;
				// Run callback if provided
				if (typeof this._successDialogCloseCallback === "function") {
					this._successDialogCloseCallback();
				}

				// Reset callback to prevent multiple executions
				this._successDialogCloseCallback = null;
			}
		}

	});

});