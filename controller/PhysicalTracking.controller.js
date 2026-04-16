sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/MessageBox",
	"FSC360NEW/model/formatter"
], function(Controller, Filter, FilterOperator, Export, ExportTypeCSV, MessageBox, formatter) {
	"use strict";
	var arr = [];
	var Model = [];
	var Model1 = [];
	var Model2 = [];
	var tem = [];
	var array4 = [];
	return Controller.extend("FSC360NEW.controller.PhysicalTracking", {

		onInit: function() {
	this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
this.oRouter.getRoute("PhysicalTracking").attachPatternMatched(this.FnonRouteMatched, this);
			this.aColumnMeta = [{
				key: "Mblnr",
				label: "Material Doc No",
				visible: true
			}, {
				key: "Xblnr",
				label: "Reference Doc No",
				visible: true
			}, {
				key: "Bldat",
				label: "Document Date",
				visible: true
			}, {
				key: "Lfbnr",
				label: "Vendor Bill No",
				visible: false
			}, {
				key: "Lifnr",
				label: "Vendor Code",
				visible: true
			}, {
				key: "VenName",
				label: "Vendor Name",
				visible: false
			}, {
				key: "Ebeln",
				label: "PO No",
				visible: true
			}, {
				key: "Name",
				label: "Name",
				visible: false
			}, {
				key: "Mjahr",
				label: "Fiscal Year",
				visible: true
			}, {
				key: "IdtAcDate",
				label: "IDT Accounting Date",
				visible: false
			}, {
				key: "IdtAcTime",
				label: "IDT Accounting Time",
				visible: false
			}, {
				key: "AcDate",
				label: "Accounting Date",
				visible: false
			}, {
				key: "AcTime",
				label: "Accounting Time",
				visible: false
			}, {
				key: "GrnUser",
				label: "GRN User",
				visible: true
			}, {
				key: "IdtUser",
				label: "IDT User",
				visible: false
			}, {
				key: "DelChalNo",
				label: "Delivery Challan No",
				visible: false
			}, {
				key: "ChalDate",
				label: "Challan Date",
				visible: false
			}, {
				key: "Slno",
				label: "Barcode",
				visible: true
			}, {
				key: "GrnDate",
				label: "GRN Date",
				visible: false
			}, {
				key: "Lgort",
				label: "Storage Location",
				visible: false
			}, {
				key: "Lgobe",
				label: "Storage Location Desc",
				visible: false
			}, {
				key: "StoreId",
				label: "Store ID",
				visible: false
			}, {
				key: "StoreUname",
				label: "Store User Name",
				visible: false
			}, {
				key: "IdtId",
				label: "IDT ID",
				visible: false
			}, {
				key: "IdtUname",
				label: "IDT User Name",
				visible: false
			}, {
				key: "FiDate",
				label: "FI Date",
				visible: false
			}, {
				key: "FiTime",
				label: "FI Time",
				visible: false
			}, {
				key: "FiId",
				label: "FI ID",
				visible: false
			}, {
				key: "FiUname",
				label: "FI User Name",
				visible: false
			}, {
				key: "FiUser",
				label: "FI User",
				visible: false
			}, {
				key: "Werks",
				label: "Plant",
				visible: false
			}, {
				key: "Menge105",
				label: "Quantity 105",
				visible: false
			}, {
				key: "Meins105",
				label: "UoM 105",
				visible: false
			}, {
				key: "Erfmg",
				label: "Entered Quantity",
				visible: false
			}, {
				key: "Erfme",
				label: "Entered UoM",
				visible: false
			}, {
				key: "PoType",
				label: "PO Type",
				visible: false
			}, {
				key: "Remark",
				label: "Remarks",
				visible: true
			}];

			const oColModel = new sap.ui.model.json.JSONModel(this.aColumnMeta);
			this.getView().setModel(oColModel, "FilterTableModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				selectedTemplate: "",
				templates: [],
				forceFullWidth: false
			}), "viewModel");
			this.fn_LoadData();
			var oRecallModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oRecallModel, "RecallModel1");

			var mockRecallData = [{
				Mblnr: "5001234567",
				Xblnr: "REF-2025-001",
				Bldat: "2025-08-12",
				Lfbnr: "VBN-10234",
				Lifnr: "VEN001",
				VenName: "ABC Supplies Pvt Ltd",
				Ebeln: "4500001234",
				Name: "John Doe",
				Mjahr: "2025",
				IdtAcDate: "2025-08-10",
				IdtAcTime: "14:25:00",
				AcDate: "2025-08-11",
				AcTime: "09:15:00",
				GrnUser: "GRNUSR01",
				IdtUser: "IDTUSR01",
				DelChalNo: "DC-56789",
				ChalDate: "2025-08-09",
				Slno: "BC123456",
				GrnDate: "2025-08-11",
				Lgort: "0001",
				Lgobe: "Main Warehouse",
				StoreId: "ST01",
				StoreUname: "Store User 1",
				IdtId: "IDT01",
				IdtUname: "IDT User 1",
				FiDate: "2025-08-12",
				FiTime: "15:30:00",
				FiId: "FI001",
				FiUname: "Finance User",
				FiUser: "FinUSR01",
				Werks: "PL01",
				Menge105: "100",
				Meins105: "EA",
				Erfmg: "100",
				Erfme: "EA",
				PoType: "Standard",
				Remark: "All good"
			}, {
				Mblnr: "5001234568",
				Xblnr: "REF-2025-002",
				Bldat: "2025-08-10",
				Lfbnr: "VBN-10235",
				Lifnr: "VEN002",
				VenName: "XYZ Industrial Corp",
				Ebeln: "4500001235",
				Name: "Jane Smith",
				Mjahr: "2025",
				IdtAcDate: "2025-08-08",
				IdtAcTime: "11:05:00",
				AcDate: "2025-08-09",
				AcTime: "13:45:00",
				GrnUser: "GRNUSR02",
				IdtUser: "IDTUSR02",
				DelChalNo: "DC-56790",
				ChalDate: "2025-08-07",
				Slno: "BC123457",
				GrnDate: "2025-08-09",
				Lgort: "0002",
				Lgobe: "Secondary Warehouse",
				StoreId: "ST02",
				StoreUname: "Store User 2",
				IdtId: "IDT02",
				IdtUname: "IDT User 2",
				FiDate: "2025-08-10",
				FiTime: "16:00:00",
				FiId: "FI002",
				FiUname: "Finance User 2",
				FiUser: "FinUSR02",
				Werks: "PL02",
				Menge105: "250",
				Meins105: "KG",
				Erfmg: "250",
				Erfme: "KG",
				PoType: "Urgent",
				Remark: "Partial delivery"
			}, {
				Mblnr: "5001234569",
				Xblnr: "REF-2025-003",
				Bldat: "2025-08-05",
				Lfbnr: "VBN-10236",
				Lifnr: "VEN003",
				VenName: "LMN Traders",
				Ebeln: "4500001236",
				Name: "Mark Lee",
				Mjahr: "2025",
				IdtAcDate: "2025-08-04",
				IdtAcTime: "10:20:00",
				AcDate: "2025-08-04",
				AcTime: "17:10:00",
				GrnUser: "GRNUSR03",
				IdtUser: "IDTUSR03",
				DelChalNo: "DC-56791",
				ChalDate: "2025-08-03",
				Slno: "BC123458",
				GrnDate: "2025-08-04",
				Lgort: "0003",
				Lgobe: "Spare Parts Store",
				StoreId: "ST03",
				StoreUname: "Store User 3",
				IdtId: "IDT03",
				IdtUname: "IDT User 3",
				FiDate: "2025-08-05",
				FiTime: "12:40:00",
				FiId: "FI003",
				FiUname: "Finance User 3",
				FiUser: "FinUSR03",
				Werks: "PL03",
				Menge105: "50",
				Meins105: "LTR",
				Erfmg: "50",
				Erfme: "LTR",
				PoType: "Service",
				Remark: "Urgent usage"
			}];
			this.getView().getModel("RecallModel1").setData(mockRecallData);
			this.fn_getPlant();

		},
		FnonRouteMatched:function(){
			this.fnclearbutt();
		},
		// fn_LoadData: function() {
		// 	var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
		// 	var that = this;

		// 	oModel.read("/DEEPHEADSet", {
		// 		urlParameters: {
		// 			$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt"
		// 		},
		// 		success: function(oData) {
		// 			if (oData && oData.results && oData.results.length > 0) {
		// 				var oJSusernameModel = new sap.ui.model.json.JSONModel();
		// 				oJSusernameModel.setData(oData.results[0]);
		// 				that.getView().setModel(oJSusernameModel, "JSusername");
		// 				that.fn_updatePaginatedModel();
		// 			}
		// 		},
		// 		error: function(oError) {
		// 			console.error("Error loading data:", oError);
		// 		}
		// 	});
		// },
		fn_LoadData: function() {

		var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
		if (oKeyDataModel) {
		    var oData = oKeyDataModel.getData();
		    var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
		    this.getView().setModel(oJSONUserName, "JSusername");
		    this.fn_updatePaginatedModel();
		}
		},
		fn_PlantChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey();
				this.byId("id_Plant").setValue(sKey);
			}
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
					that.byId("id_Plant").bindItems({
						path: "JSPlant>/",
						template: new sap.ui.core.Item({
							key: "{JSPlant>Werks}",
							text: {
								parts: [{
									path: "JSPlant>Name1"
								}, {
									path: "JSPlant>Werks"
								}],
								formatter: function(name, werks) {
									return name + " - " + werks;
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

		fnselect: function(oEvent) {
			if (oEvent.getSource().getSelected() === false) {
				oEvent.getSource().getBindingContext("RecallModel").getObject().GrnUser = "";
			} else {
				oEvent.getSource().getBindingContext("RecallModel").getObject().GrnUser = "X";
			}
			Model.push(oEvent.getSource().getBindingContext("RecallModel").getObject());
			this.Mblnr = oEvent.getSource().getBindingContext("RecallModel").getObject().Mblnr;
		},
		fnselect1: function(oEvent) {
			if (oEvent.getSource().getSelected() === false) {
				oEvent.getSource().getBindingContext("RecallModel").getObject().IdtUser = "";
			} else {
				oEvent.getSource().getBindingContext("RecallModel").getObject().IdtUser = "X";
			}
			Model1.push(oEvent.getSource().getBindingContext("RecallModel").getObject());
			// his.Mblnr= oEvent.getSource().getBindingContext("RecallModel").getObject().Mblnr;
		},
		fnselect2: function(oEvent) {
			if (oEvent.getSource().getSelected() === false) {
				oEvent.getSource().getBindingContext("RecallModel").getObject().FiUser = "";
			} else {
				oEvent.getSource().getBindingContext("RecallModel").getObject().FiUser = "X";
			}
			Model2.push(oEvent.getSource().getBindingContext("RecallModel").getObject());
		},
		fnChange: function(oEvent) {

			var challon = oEvent.getParameters().value;

			var path = oEvent.getSource().getBindingContext("RecallModel").sPath.split("/")[1];
			var jsonModel = this.getView().getModel("RecallModel").getData();

			this.getView().getModel("RecallModel").getData()[path].DelChalNo = challon.toString();
		},
		fnChange1: function(oEvent) {

			var challondate = oEvent.oSource.mProperties.dateValue;

			var path = oEvent.getSource().getBindingContext("RecallModel").sPath.split("/")[1];
			var jsonModel = this.getView().getModel("RecallModel").getData();
			this.getView().getModel("RecallModel").getData()[path].ChalDate = challondate;
		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		fn_onGroupBtnPress: function(oEvent) {
			var oPressedBtn = oEvent.getSource();
			var oToolbar = oPressedBtn.getParent();
			var aButtons = oToolbar.getItems();
			var oView = this.getView();

			aButtons.forEach(function(oBtn) {
				if (oBtn.removeStyleClass) {
					oBtn.removeStyleClass("activeGroupBtn");
					oBtn.removeStyleClass("firstActiveBtn");
					oBtn.removeStyleClass("lastActiveBtn");
				}
			});

			oPressedBtn.addStyleClass("activeGroupBtn");

			if (oPressedBtn === aButtons[0]) {
				oPressedBtn.addStyleClass("firstActiveBtn");
			} else if (oPressedBtn === aButtons[aButtons.length - 1]) {
				oPressedBtn.addStyleClass("lastActiveBtn");
			}
			this._activeGroupKey = oPressedBtn.getCustomData()[0].getValue();

			var sKey = oPressedBtn.getCustomData()[0].getValue();

			// Get the FilterTableModel and its columns data
			var oColModel = this.getView().getModel("FilterTableModel");
			var aCols = oColModel.getData();

			if (sKey === "indexing") {
				// Show these columns for indexing
				var aShowKeys = ["IdtUser", "IdtId", "IdtUname", "IdtAcDate", "IdtAcTime"];
				// Hide these columns for indexing
				var aHideKeys = ["StoreId", "StoreUname", "AcTime", "AcDate", "FiUser", "FiId", "FiUname", "FiDate", "FiTime", "Xblnr"];

				aCols.forEach(function(col) {
					if (aShowKeys.includes(col.key)) {
						col.visible = true;
					} else if (aHideKeys.includes(col.key)) {
						col.visible = false;
					} else {
						// Optional: define visibility of other columns if needed
						col.visible = true;
					}
				});

				oColModel.refresh(true);
				console.log("Indexing button pressed: columns updated.");
			} else if (sKey === "finance") {
				// Show these columns for finance
				var aShowKeys = ["FiUser", "FiId", "FiUname", "FiDate", "FiTime"];
				// Hide these columns for finance
				var aHideKeys = ["StoreId", "StoreUname", "AcTime", "AcDate", "IdtUser", "IdtId", "IdtUname", "IdtAcDate", "IdtAcTime", "Xblnr"];

				aCols.forEach(function(col) {
					if (aShowKeys.includes(col.key)) {
						col.visible = true;
					} else if (aHideKeys.includes(col.key)) {
						col.visible = false;
					} else {
						col.visible = true; // or false if you want to hide others
					}
				});

				oColModel.refresh(true);
				console.log("Finance button pressed: columns updated.");
			} else if (sKey === "all") {
				// Show all columns (make all visible)
				aCols.forEach(function(col) {
					col.visible = true;
				});
				oColModel.refresh(true);
				console.log("All button pressed: all columns visible.");
			} else {
				// Default case if needed
				console.log("Button pressed with key:", sKey);
			}
		},
fnclearbutt: function () {

    this.byId("id_creationdatefrm").setValue("");
    this.byId("id_creationdateend").setValue("");
    this.byId("id_Plant").setValue("");
    this.byId("id_barcode").setValue("");

  
    var oTable = this.byId("idTable");
    if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").filter([]);
    }

 
    this.aFullData = [];
    this.aFilteredData = [];
    this.iCurrentPage = 1;

			this.fn_updatePaginatedModel();

		
},

		fnSearch: function(oEvent) {
			var that = this;
			var vError = false;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var ventity = "/InvoiceTableSet";
		
			var scfrom = this.getView().byId("id_creationdatefrm").getValue();
			var scto = this.getView().byId("id_creationdateend").getValue();
			
			var oTable = this.getView().byId('idTable');
			var vPlant = this.getView().byId('id_Plant').getValue();
			if (vPlant) {
				vPlant = vPlant.split("-")[0].trim();
			}
			var vBarcode = this.getView().byId('id_barcode').getValue();
			var vFlagerror = false;

			if (vFlagerror === false) {
				oTable.setBusy(true);
				if (scfrom != '' && scto != '') {
					var filter2 = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.BT, scfrom, scto);
					var afilter = [];
					afilter.push(filter2);
				}

				if (vPlant) {
					var filter3 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlant);
					afilter.push(filter3);
				}
// if (!scfrom || !scto) {
//     sap.m.MessageBox.error("Please enter both Scan Date From and Scan Date To.");
//     oTable.setBusy(false);
//     return; 
// }
				oModel.read(ventity, {
					filters: afilter,
					success: function(oData, Response) {
						oTable.setBusy(false);

						that.aFullData = oData.results;
						that.aFilteredData = oData.results;

						that.iCurrentPage = 1;
						that.iRowsPerPage = 12;
						that.fn_updatePaginatedModel();
						var iCount = oData.results.length;

						if (oData.results.length != 0) {
							that.getView().byId("id_BtnExcel").setVisible(true);
							that.getView().byId("id_sendmail").setVisible(true);

						} else {

						}
					},
					error: function() {
						oTable.setBusy(false);
						MessageToast.show("No Authorization for User");
					}
				});
			}
		},

		fnFilterPop: function(oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oFilterPopover) {
				this._oFilterPopover = sap.ui.xmlfragment(
					"FSC360NEW.fragment.FilterPopover",
					this
				);
				this.getView().addDependent(this._oFilterPopover);
			}

			this._oFilterPopover.openBy(oButton);
		},
		fn_customcolumns: function(oEvent) {
			var oView = this.getView();

			if (!this._oCustomizePopover) {
				this._oCustomizePopover = sap.ui.xmlfragment("FSC360NEW.fragment.CustomCol_Dashboard", this);
				this._oCustomizePopover.setModel(oView.getModel("FilterTableModel"), "FilterTableModel");
				console.log("FilterTableModel values:", oView.getModel("FilterTableModel").getData());
				this._oCustomizePopover.setModel(oView.getModel("viewModel"), "viewModel");
				this._oCustomizePopover.setModel(oView.getModel("TemplateModel"), "TemplateModel");

				oView.addDependent(this._oCustomizePopover);
			}

			var oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
			var aTemplateKeys = Object.keys(oTemplates);
			oView.getModel("viewModel").setProperty("/templates", aTemplateKeys);

			this._oCustomizePopover.openBy(oEvent.getSource());
		},
		fn_onOpenTemplatePopover: function(oEvent) {
			const oView = this.getView();

			if (!this._oTemplatePopover) {
				this._oTemplatePopover = sap.ui.xmlfragment("FSC360NEW.fragment.TemplatePopover_dash", this);
				oView.addDependent(this._oTemplatePopover);
			}

			// Load templates from localStorage
			const oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
			const aTemplateArray = Object.keys(oTemplates).map(name => ({
				name
			}));

			// Set to viewModel (assuming you have one)
			oView.getModel("viewModel").setProperty("/templates", aTemplateArray);

			// Open below the input
			const oSource = sap.ui.getCore().byId("idTemplateInput_dash") || oEvent.getSource();
			this._oTemplatePopover.openBy(oSource);
		},
		fn_onOpenCreateTemplateDialog: function(oEvent) {
			if (!this._oCreateTemplatePopover) {
				this._oCreateTemplatePopover = sap.ui.xmlfragment("FSC360NEW.fragment.CreateTemplate_dash", this);
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

		},
		fn_onSaveNewTemplate: function() {
			var sName = sap.ui.getCore().byId("idNewTemplateName").getValue();
			if (!sName) {
				sap.m.MessageToast.show("Please enter a name");
				return;
			}

			var aFields = this.getView().getModel("FilterTableModel").getData();
			var aSelected = aFields.filter(f => f.visible);

			var oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
			oTemplates[sName] = aSelected;

			localStorage.setItem("Templates", JSON.stringify(oTemplates));
			sap.m.MessageToast.show("Template saved");

			this._oCreateTemplatePopover.close();
			this._oCreateTemplatePopover.destroy();
			this._oCreateTemplatePopover = null;

			// Refresh dropdown in Customize Dialog
			this.fncustomcolumns();
		},
		fn_onApplyTemplate: function() {
			//this.applyVisibleColumns();
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}

		},
		fn_onTemplateListItemPress: function(oEvent) {
			const sSelectedName = oEvent.getSource().getBindingContext("viewModel").getProperty("name");

			// Always set the selected template to force refresh
			const oViewModel = this.getView().getModel("viewModel");
			oViewModel.setProperty("/selectedTemplate", sSelectedName); // this does not refresh table directly
			localStorage.setItem("LastUsedTemplate", sSelectedName);

			// Close the popover
			this._oTemplatePopover.close();
			this._oTemplatePopover.destroy();
			this._oTemplatePopover = null;
			const oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
			const aSelectedFields = oTemplates[sSelectedName];

			if (!aSelectedFields) return;

			const oColModel = this.getView().getModel("FilterTableModel");
			const aCols = oColModel.getData();

			const updated = aCols.map(col => ({
				...col,
				visible: !!aSelectedFields.find(sel => sel.key === col.key)
			}));

			oColModel.setData(updated);
			this.getView().getModel("viewModel").setProperty("/forceFullWidth", true);

			//this.applyVisibleColumns();
		},
		fn_onTemplateSelectionChange: function(oEvent) {
			const oListItem = oEvent.getParameter("listItem");
			const sSelectedName = oListItem.getBindingContext("viewModel").getProperty("name");

			const oViewModel = this.getView().getModel("viewModel");
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
			this.getView().getModel("viewModel").setProperty("/forceFullWidth", true);

			// Apply changes
			//this.applyVisibleColumns();

			// Optional: Close popover
			this._oTemplatePopover.close();
			this._oTemplatePopover.destroy();
			this._oTemplatePopover = null;
		},

		fn_onDeleteTemplate: function(oEvent) {
			const oItem = oEvent.getSource().getParent().getParent();
			const sTemplateName = oItem.getBindingContext("viewModel").getProperty("name");

			// Show confirmation popup
			sap.m.MessageBox.confirm(
				`Do you want to delete the template "${sTemplateName}"?`, {
					title: "Confirm Deletion",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					emphasizedAction: sap.m.MessageBox.Action.YES,
					onClose: (sAction) => {
						if (sAction === sap.m.MessageBox.Action.YES) {
							const oTemplates = JSON.parse(localStorage.getItem("Templates") || "{}");
							delete oTemplates[sTemplateName];
							localStorage.setItem("Templates", JSON.stringify(oTemplates));

							// Refresh the popover
							this.fn_onOpenTemplatePopover(oEvent);
							sap.m.MessageToast.show(`Template "${sTemplateName}" deleted`);
						}
					}
				}
			);
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

			this.getView().setModel(pagedModel, "RecallModel");
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
	
		fn_save: function() {
			var oTable = this.byId("idTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			var oModel = oTable.getModel("RecallModel");
			var aSelectedData = [];

			if (aSelectedIndices.length === 0) {
				aSelectedData = this.aFilteredData;
			} else {
				aSelectedIndices.forEach(function(iIndex) {
					var oContext = oTable.getContextByIndex(iIndex);
					if (oContext) {
						aSelectedData.push(oContext.getObject());
					}
				});
			}

			// Create export columns based on visible aColumnMeta
			var aExportColumns = this.aColumnMeta
				.filter(function(col) {
					return col.visible;
				})
				.map(function(col) {
					return {
						name: col.label,
						template: {
							content: "{" + col.key + "}"
						}
					};
				});

			var oExport = new sap.ui.core.util.Export({
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ",",
					mimeType: "application/vnd.ms-excel",
					charset: "utf-8",
					fileExtension: "csv",
					fileName: "Recall_Selected_Rows"
				}),
				models: new sap.ui.model.json.JSONModel({
					rows: aSelectedData
				}),
				rows: {
					path: "/rows"
				},
				columns: aExportColumns
			});

			oExport.saveFile().always(function() {
				this.destroy();
			});
		},
		fnsave: function(oEvent) {
			var the = this;
			var omodel = this.getView().getModel();
			var oTable = this.getView().byId("idTable");
			var data = oTable.getModel("RecallModel").oData.length;
			var data1 = this.getView().getModel("RecallModel").getData();
			var selected;
			var arr1 = [];
			var array = {};
			var array1 = [];
			var array2 = [];
			var obj1 = {};
			//Date saving 1 day prior problem
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});

			if (Model.length == 0) {
				for (var i = 0; i < Model.length; i++) {
					var obj = {};
					obj.Mblnr = Model[i].Mblnr;
					obj.Mjahr = Model[i].Mjahr;
					obj.Name = "01";
					obj.GrnUser = Model[i].GrnUser;
					obj.Lgort = Model[i].Lgort;
					obj.Lgobe = Model[i].Lgobe;
					obj.Lifnr = Model[i].Lifnr;
					obj.Name1 = Model[i].VenName;
					obj.Slno = Model[i].Slno;
					obj.Ebeln = Model[i].Ebeln;
					obj.Xblnr = Model[i].Xblnr;
					if (Model[i].GrnDate != null) {
						var vGrdate = dateFormat.format(Model[i].GrnDate);
						obj.Budat = vGrdate + 'T00:00:00';
					}
					obj.DelChalNo = Model[i].DelChalNo;
					if (Model[i].ChalDate != null) {
						var date = dateFormat.format(Model[i].ChalDate);
						obj.ChalDate = date + 'T00:00:00';
					}
					//obj.ChalDate = Model[i].ChalDate;
					array2.push(obj);
				}
				Model = [];
			}
			if (Model1.length !== 0) {
				for (var j = 0; j < Model1.length; j++) {
					var obj = {};
					obj.Mblnr = Model1[j].Mblnr;
					obj.Mjahr = Model1[j].Mjahr;
					obj.Name = "02";
					obj.IdtUser = Model1[j].IdtUser;
					obj.DelChalNo = Model1[j].DelChalNo;
					obj.Lgort = Model1[j].Lgort;
					obj.Lgobe = Model1[j].Lgobe;
					obj.Lifnr = Model1[j].Lifnr;
					obj.Name1 = Model1[j].VenName;
					obj.Slno = Model1[j].Slno;
					obj.Ebeln = Model1[j].Ebeln;
					obj.Xblnr = Model1[j].Xblnr;
					if (Model1[j].GrnDate != null) {
						var vGrdate = dateFormat.format(Model1[j].GrnDate);
						obj.Budat = vGrdate + 'T00:00:00';
					}
					if (Model1[j].ChalDate != null) {
						var date = dateFormat.format(Model1[j].ChalDate);
						obj.ChalDate = date + 'T00:00:00';
					}
					//obj.ChalDate = Model1[j].ChalDate;
					array2.push(obj);
				}
				Model1 = [];
			}
			if (Model2.length !== 0) {
				for (var j = 0; j < Model2.length; j++) {
					var obj = {};
					obj.Mblnr = Model2[j].Mblnr;
					obj.Mjahr = Model2[j].Mjahr;
					obj.Name = "03";
					obj.FiUser = Model2[j].FiUser;
					obj.DelChalNo = Model2[j].DelChalNo;
					obj.Lgort = Model2[j].Lgort;
					obj.Lgobe = Model2[j].Lgobe;
					obj.Lifnr = Model2[j].Lifnr;
					obj.Name1 = Model2[j].VenName;
					obj.Slno = Model2[j].Slno;
					obj.Ebeln = Model2[j].Ebeln;
					obj.Xblnr = Model2[j].Xblnr;
					if (Model2[j].GrnDate != null) {
						var vGrdate = dateFormat.format(Model2[j].GrnDate);
						obj.Budat = vGrdate + 'T00:00:00';
					}
					if (Model2[j].ChalDate != null) {
						var date = dateFormat.format(Model2[j].ChalDate);
						obj.ChalDate = date + 'T00:00:00';
					}
					//obj.ChalDate = Model2[j].ChalDate;
					array2.push(obj);
				}
				Model2 = [];
			}

			var Entity = {};
			Entity.NavTo = array2;

			var ventity = '/Invoice_phytrSet';

			omodel.create(ventity, Entity, {
				success: function(oData) {
					sap.m.MessageToast.show("Date and Time updated successfully");
					the.fnSearch();

				},
				error: function() {
					sap.m.MessageToast.show("Error");
				}
			});
		},
		fnemail: function(oEvent) {
			if (!this.oMail) {
				this.oMail = sap.ui.xmlfragment(
					"FSC360NEW.fragment.MailPhyTr", this);
				this.getView().addDependent(this.oMail);
			}
			this.oMail.open();
			var vTemp = [{
				"EmailId": ""
			}];

			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");
		},
		fn_onAddEmail: function() {
			var oInput = sap.ui.getCore().byId("idEmailEntry");
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

		fn_onRemoveEmail: function(oEvent) {
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

		fnCloseMail: function() {
			this.oMail.close();
			sap.ui.getCore().byId("id_Email").setValue();
		},

	
		fnmailsubmit: function () {
    var that = this;
    var oModel = this.getView().getModel();
    var oTable = this.getView().byId("idTable");

    // collect selected rows only
    var aSelectedIndices = oTable.getSelectedIndices();
    var aSelectedData = [];

    aSelectedIndices.forEach(function (iIndex) {
        var oContext = oTable.getContextByIndex(iIndex);
        if (oContext) {
            aSelectedData.push(oContext.getObject());
        }
    });

    if (aSelectedData.length === 0) {
        sap.m.MessageToast.show("Please select at least one row");
        return;
    }

    // collect entered emails
    var aMailData = this.getView().getModel("JMManualDel").getProperty("/Emails") || [];
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var bInvalidEmail = aMailData.some(function (email) {
        return !email || !emailRegex.test(email);
    });

    if (aMailData.length === 0 || bInvalidEmail) {
        sap.m.MessageToast.show("Enter Valid Email Id");
        return;
    }

    // prepare payload
    var aNavMail = aSelectedData.map(function (row) {
        return {
            Slno: row.Slno,
            Mblnr: row.Mblnr
        };
    });

    var oEntity = {
        NavMail: aNavMail,
        NavMailid: aMailData.map(function (mail) {
            return { EmailId: mail };
        })
    };

    // OData call
    sap.ui.core.BusyIndicator.show(0);
    oModel.create("/SendMailSet", oEntity, {
        success: function () {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Mail sent successfully");
        },
        error: function () {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageBox.error("Error while sending mail");
        }
    });
},


		onAfterRendering: function() {
			var oView = this.getView();
			var oAllBtn = oView.byId("idAllBtn");

			if (oAllBtn) {
				oAllBtn.addStyleClass("activeGroupBtn firstActiveBtn");
			}
			this.fn_onGroupBtnPress({
				getSource: function() {
					return oAllBtn;
				}
			});
		}

	});

});