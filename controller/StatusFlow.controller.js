sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/m/MessageBox"
], function(Controller, Filter, FilterOperator, MessageBox, formatter) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var vDate = [];
	var UserType = "";
	var Barr = [];
	var arr1 = [];
	return Controller.extend("FSC360NEW.controller.StatusFlow", {

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("StatusFlow").attachPatternMatched(this.fn__onRouteMatched, this);

			oGlobalBusyDialog.open();
			this._oStatusRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var arr = [{
				"StatKey": "",
				"StatText": "All"
			}, {
				"StatKey": "S15",
				"StatText": "Indexed"
			}, {
				"StatKey": "S20",
				"StatText": "In Progress"
			}, {
				"StatKey": "S30",
				"StatText": "In Workflow"
			}, {
				"StatKey": "S50",
				"StatText": "Rejected"
			}, {
				"StatKey": "S41",
				"StatText": "Posted"
			}];
			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.setData(arr);
			this.getOwnerComponent().setModel(oModel1, "JSStatusList");

			var arr2 = [{
				"ListKey": "1",
				"ListText": "Attached (0)"
			}, {
				"ListKey": "2",
				"ListText": "Attached-SES (0)"
			}, {
				"ListKey": "3",
				"ListText": "Indexed (0)"
			}, {
				"ListKey": "4",
				"ListText": "In Workflow (0)"
			}, {
				"ListKey": "5",
				"ListText": "In Progress (0)"
			}, {
				"ListKey": "6",
				"ListText": "Parked (0)"
			}, {
				"ListKey": "7",
				"ListText": "Posted (0)"
			}, {
				"ListKey": "8",
				"ListText": "Rejected (0)"
			}];
			var oModel2 = new sap.ui.model.json.JSONModel();
			oModel2.setData(arr2);
			this.getOwnerComponent().setModel(oModel2, "JSList");
			this._oStatusRouter.attachRoutePatternMatched(this.fn_LoadUser, this);
			this._oStatusRouter.attachRoutePatternMatched(this.fn_LoadCC, this);
			this._oStatusRouter.attachRoutePatternMatched(this.fn_clear, this);
			this.byId("show_hide_search").attachBrowserEvent("click", this.fn_togglehideshow, this);
			setTimeout(() => {
				this.fn_applyflexgrow();
			}, 0);

			var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {

			});
			this.getView().setModel(oTemplateModel, "TemplateModel");
			var aColumnMeta = [{
				key: "Qid",
				label: "Queue Id",
				visible: true
			}, {
				key: "Stats",
				label: "Status",
				visible: true
			}, {
				key: "Attached",
				label: "Attached",
				visible: false
			}, {
				key: "Attached SES",
				label: "Attached SES",
				visible: true
			}, {
				key: "Indexed",
				label: "Attached",
				visible: true
			}, {
				key: "In Workflow",
				label: "In Workflow",
				visible: true
			}, {
				key: "In Progress",
				label: "In Progress",
				visible: false
			}, {
				key: "Posting",
				label: "Posting",
				visible: false
			}, {
				key: "Payment",
				label: "Payment",
				visible: false
			}, {
				key: "Total Time",
				label: "Total Time",
				visible: true
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
			this.fn_getPlant();
			this.fn_getVendor();
			this.bSearchVisible = true;
			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oEmptyModel, "JSstatus");

			this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;

			var oTable = this.byId("id_table_width");
			this.iRowsPerPage = oTable.getVisibleRowCount();

			// error popup model added by Manosankari 
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");
			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");

		},
		fn_applyflexgrow: function() {
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
		fn_togglehideshow: function() {
			var oVBox = this.byId("id_cl_statusflow_input_cont");
			if (oVBox) {
				var bVisible = oVBox.getVisible();
				oVBox.setVisible(!bVisible);
				this.bSearchVisible = !bVisible;

				var oText = this.byId("hiddenshowtxt");
				if (oText) {
					oText.setText(bVisible ? "Show Search" : "Hide Search");
				}
				var oTable = this.byId("id_table_width");
				if (oTable) {
					var iCurrentCount = oTable.getVisibleRowCount();
					if (this.bSearchVisible) {
						oTable.setVisibleRowCount(iCurrentCount - 2);
					} else {
						oTable.setVisibleRowCount(iCurrentCount + 2);
					}
					this.iRowsPerPage = oTable.getVisibleRowCount();
					this.fn_updatepaginationModel();
				}

			} else {

			}
		},
		fn__onRouteMatched: function(oEvent) {
			this.fn_clearbutt();
		},

		fn_LoadUser: function() {
			var Bukrs = '6000';
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			this.aFilteredData = [];
			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Bukrs", FilterOperator.EQ, Bukrs)

				],
				urlParameters: {
					$expand: "NavLifnr,NavProfitCenter,NavDomain,NavStatusFlow"

				},

				success: function(oData, oResponse) {

					UserType = oData.results[0].Flag;

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0]);
					that.getView().setModel(oModel, 'JSusername');

					oGlobalBusyDialog.close();

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavDomain.results);
					that.getView().setModel(oModel, 'JSTransType');
					that.fn_updatepaginationModel();
				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');
					oGlobalBusyDialog.close();

				}

			});
		},
		fnhandleHelPQid: function(oEvent) {
			var oController = this;
			this.inputId = oEvent.getSource().getId();
			if (!this.vQidFrag) {
				this.vQidFrag = sap.ui.xmlfragment("FSC360NEW.fragment.QID", this);
				this.getView().addDependent(this.vQidFrag);
			}
			this.vQidFrag.open();
			this.fnLoadQid();
		},
		fnLoadQid: function() {

			var oQid = {
				Queid: []
			};
			var Bukrslen = this.getView().byId("idCCode").getSelectedItems().length;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var vtokens = this.getView().byId("idCCode").getSelectedItems();
			var aFilters = [new Filter("Type", FilterOperator.EQ, "Qid")];
			if (Bukrslen !== 0) {
				for (var i = 0; i < Bukrslen; i++) {
					var vCompId = vtokens[i].getKey();
					var oFilter1 = new sap.ui.model.Filter("Bukrs", FilterOperator.EQ, vCompId);
					aFilters.push(oFilter1);
				}
			}
				oGlobalBusyDialog.open();
			oModel.read("/StatusFlowSet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSQid');
					oGlobalBusyDialog.close();
				},
				error: function(oResponse) {
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');
					oGlobalBusyDialog.close();

				}

			});
		},
		fn_handleValueHelpCloseqid: function(oEvent) {
			var oView = this.getView();
			var oItem = oEvent.getParameter("selectedItem");
			var oInput = sap.ui.getCore().byId(this.inputId);
			if (oItem) {
				oInput.setValue(oItem.getTitle());
				oInput.setValueState();

			}
			var vItems = oEvent.getSource().getBinding("items");
			vItems.filter([]);
		},
		fn_qidSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var oFilter1 = new sap.ui.model.Filter("Queid",
				sap.ui.model.FilterOperator.Contains, sValue);

			var aFilter = new sap.ui.model.Filter([oFilter1], false);
			evt.getSource().getBinding("items").filter([aFilter]);
		},
		fn_LoadCC: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			// Single JSON model for everything
			var oJSONModel = new sap.ui.model.json.JSONModel({
				Company: [],
				SelectedBukrs: [] // initialize selected keys
			});
			this.getView().setModel(oJSONModel, "CompanyModel"); // reuse this model

			oModel.read("/StatusFlowSet", {
				filters: [new Filter("Type", FilterOperator.EQ, 'BUKRS')],
				success: function(oData) {
					// store company results in the same model
					that.getView().getModel("CompanyModel").setProperty("/Company", oData.results || []);
					oGlobalBusyDialog.close();
				},
				error: function() {
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');
					oGlobalBusyDialog.close();
				}
			});
		},

		handleSelectionFinish: function(oEvent) {
			var oMCB = oEvent.getSource();
			var aSelectedKeys = oMCB.getSelectedKeys(); // array of Bukrs

			// Update the model
			this.getView().getModel("CompanyModel").setProperty("/SelectedBukrs", aSelectedKeys);

			// Dynamically set the tooltip
			var sTooltip = aSelectedKeys.length > 0 ? aSelectedKeys.join(", ") : "No company selected";
			oMCB.setTooltip(sTooltip);
		},

		fn_handleSelectionChange: function(oEvent) {
			var changedItem = oEvent.getParameter("changedItem");
			var isSelected = oEvent.getParameter("selected");
			var state = "Selected";
			if (!isSelected) {
				state = "Deselected";
			}
		},
		fn_selection: function() {
			var Listsel = this.getView().byId("id_List").getSelectedItems();
			arr1 = [];
			if (Listsel.length !== 0) {
				this.oJsonQTable = this.getView().getModel("JSstatus");
				this.oJsonQTable.setData(null);
				var count = 0;
				var count1 = 0;
				var width = 200;
				for (var i = 0; i < Listsel.length; i++) {
					var ListVal = Listsel[i].getKey();
					if (ListVal === '1') {
						this.fnAttached();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '2') {
						this.fnAttachSES();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '3') {
						this.fnIndexed();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '4') {
						this.fnWorkflow();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '5') {
						this.fnProgress();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '6') {
						this.fnParked();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '7') {
						this.fnPosted();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
					if (ListVal === '8') {
						this.fnRejected();
						count = count + 0.68125;
						count1 = count1 + 1;
					}
				}

				if (count1 === 1) {
					this.getView().byId("id_List").setWidth("200px");
				} else {
					width = String(parseInt(width * count));
					var res = width.concat("px");
					this.getView().byId("id_List").setWidth(res);
				}

			} else {
				this.oJsonQTable = this.getView().getModel("JSstatus");
				this.oJsonQTable.setData(Barr);
				this.oJsonQTable.refresh();
			}

		},
		fn_getPlant: function() {
			var Bukrslen = this.getView().byId("idCCode").getSelectedItems().length;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var vtokens = this.getView().byId("idCCode").getSelectedItems();
			var aFilters = [new Filter("Type", FilterOperator.EQ, "Plant")];
			oGlobalBusyDialog.open();
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
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');
					oGlobalBusyDialog.close();

				}

			});

		},
		fn_PlantChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey(); // Werks (e.g. "0001")
				this.byId("id_Plant").setValue(sKey); // show only the key in the input
			}
		},

		fn_ViewInput: function() {

			var vFlag = this.getView().byId("id_inputhbox").getVisible();
			if (vFlag === true) {
				this.getView().byId("id_inputhbox").setVisible(false);
			} else {
				this.getView().byId("id_inputhbox").setVisible(true);
			}
		},
		fn_clear: function() {
			this.getView().byId("idVendor").setValue("");
			this.getView().byId("idProfitCentre").setValue("");

			var pastDate;

			this.getView().byId("id_StrDate").setValue("");
			this.getView().byId("id_EndDate").setValue("");
			this.getView().byId("id_StrDate").setValueState("None");
			this.getView().byId("id_EndDate").setValueState("None");
			this.getView().byId("id_DateRangePO").setValue("");
			this.byId("id_Transtype").removeAllSelectedItems();
			var oMultiComboBox = this.getView().byId("idCCode");
			oMultiComboBox.setSelectedKeys(null);
			this.getView().byId("id_Plant").setValue("");
			var oMulti = this.getView().byId("id_Status");
			oMulti.setSelectedKeys(null);

		},
		fn_clearbutt: function() {
			this.fn_clear();
			var oView = this.getView();
			var arr = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(arr);
			this.getView().setModel(oModel, 'JSstatus');
			this.getView().byId("LabTabSFRTitle").setText(0);
			this.aFullData = [];
    this.aFilteredData = [];
    this.iCurrentPage = 1;

    // Step 5: Clear the visible table rows
    var oTable = oView.byId("id_table_width");
    if (oTable) {
        oTable.clearSelection();
        oTable.setVisibleRowCount(4); // keep layout intact
    }

    // Step 6: Remove all page number buttons
    var oPageBox = oView.byId("idPageNumbersBox");
    if (oPageBox) {
        oPageBox.removeAllItems();
    }

    // Step 7: Hide the Previous / Next buttons
    var oPrev = oView.byId("idPrevBtn");
    var oNext = oView.byId("idNextBtn");
    if (oPrev) oPrev.setVisible(false);
    if (oNext) oNext.setVisible(false);

		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		fn_datevalidation: function() {

			var begdate = this.getView().byId("id_StrDate").getValue();
			var enddate = this.getView().byId("id_EndDate").getValue();
			var CrntDt = new Date();

			var date1 = this.getView().byId("id_StrDate").getDateValue();
			var date2 = this.getView().byId("id_EndDate").getDateValue();
			vDate = [];

			if (date1 !== null && date2 == null) {
				if (date1 <= CrntDt) {
					this.getView().byId("id_StrDate").setValueState("None");
					this.getView().byId("id_EndDate").setValueState("Error");
				}
			} else if (date1 == null && date2 !== null) {
				if (date2 <= CrntDt) {
					this.getView().byId("id_EndDate").setValueState("None");
					this.getView().byId("id_StrDate").setValueState("Error");
				}
			} else if (date1 !== null && date2 !== null) {
				if (date1 > date2) {
					this.getView().byId("id_StrDate").setValueState("Error");
					this.getView().byId("id_EndDate").setValueState("Error");

				} else if (date1 <= CrntDt && date2 <= CrntDt) {
					this.getView().byId("id_StrDate").setValueState("None");
					this.getView().byId("id_EndDate").setValueState("None");
				}

			}

		},

		fn_getVendor: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
	oGlobalBusyDialog.open();
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
	oGlobalBusyDialog.close();
				},
				error: function() {
					// sap.m.MessageBox.error("HTTP Error while fetching Vendor list");
					that.openErrorDialog('HTTP Error while fetching Vendor list');
						oGlobalBusyDialog.close();
				}
			});
		},
		fn_VendorChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey();
				var sText = oSelectedItem.getText();

				this.byId("idVendor").setValue(sKey);

			}
		},

		fn_search: function() {
			var that = this;
			var Bukrslen = this.getView().byId("idCCode").getSelectedItems().length;
			var Statslen = this.getView().byId("id_Status").getSelectedItems().length;
			var vtokens = this.getView().byId("idCCode").getSelectedItems();
			if (vtokens.length !== 0) {
				var vtoken = this.getView().byId("id_Status").getSelectedItems();
				var aFilters = [];
				if (Bukrslen !== 0) {
					for (var i = 0; i < Bukrslen; i++) {
						var vCompId = vtokens[i].getKey();
						var oFilter1 = new sap.ui.model.Filter("Bukrs", FilterOperator.EQ, vCompId);
						aFilters.push(oFilter1);
					}
				}
				if (Statslen !== 0) {
					for (var j = 0; j < Statslen; j++) {
						var vStats = vtoken[j].getKey();
						if (vStats !== "") {
							var oFilter2 = new sap.ui.model.Filter("Stats", FilterOperator.EQ, vStats);
							aFilters.push(oFilter2);
						}
					}
				}
				var plant = this.getView().byId("id_Plant").getValue().split('-')[0];
				var lifnr = this.getView().byId("idVendor").getValue().split('-')[0];
				var profitcntr = this.getView().byId("idProfitCentre").getValue().split('-')[0];
				// var transtype = parseInt(this.getView().byId("id_Transtype").getSelectedKey());
				var selectedKeys = this.getView().byId("id_Transtype").getSelectedKeys();
				var transtype = selectedKeys.length > 0 ? parseInt(selectedKeys[0]) : "";
				// transtype = transtype - 1;
				if (isNaN(transtype)) {
					transtype = "";
				}

				var stDate = this.getView().byId("id_StrDate").getDateValue();
				var enDate = this.getView().byId("id_EndDate").getDateValue();
				// }

				var begdate = this.getView().byId("id_StrDate").getValue();
				var enddate = this.getView().byId("id_EndDate").getValue();
				var strState = this.getView().byId("id_StrDate").getValueState();
				var endState = this.getView().byId("id_EndDate").getValueState();
				that.fn_datevalidation();

				if (begdate != "" || enddate != "") {
					if (strState == "None" && endState == "None") {
						// aFilters.push(new Filter("Qid", FilterOperator.EQ, qid));
						aFilters.push(new Filter("Werks", FilterOperator.EQ, plant));
						aFilters.push(new Filter("Lifnr", FilterOperator.EQ, lifnr));
						aFilters.push(new Filter("Prctr", FilterOperator.EQ, profitcntr));
						aFilters.push(new Filter("Transtype", FilterOperator.EQ, transtype));
						aFilters.push(new Filter("Stdate", FilterOperator.EQ, stDate));
						aFilters.push(new Filter("Endate", FilterOperator.EQ, enDate));
						oGlobalBusyDialog.open();
						var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
						oGlobalBusyDialog.open();
						oModel.read("/StatusFlowSet", {
							filters: aFilters,

							success: function(oData, oResponse) {

								that.aFullData = oData.results;
								that.aFilteredData = oData.results;

								that.iCurrentPage = 1;
								// that.iRowsPerPage = 4;
								var oTable = that.getView().byId("id_table_width");
								that.iRowsPerPage = oTable.getVisibleRowCount();
								var oModel = new sap.ui.model.json.JSONModel(oData.results);
								that.getView().setModel(oModel, "JSstatus");

								that.getView().byId("LabTabSFRTitle").setText(oData.results.length);
								that.fnCountStatus(oData.results);
								Barr = oData.results;
								that.fn_updatepaginationModel();
								oGlobalBusyDialog.close();
							},
							error: function(oResponse) {
								// sap.m.MessageBox.error('Http Error');
								that.openErrorDialog('Http Error');
								oGlobalBusyDialog.close();

							}

						});
					}

				} else {
					this.getView().byId("id_StrDate").setValueState("Error");
					this.getView().byId("id_EndDate").setValueState("Error");
					sap.m.MessageToast.show("Enter Date Range");
				}
			} else {
				sap.m.MessageToast.show("Please Select the Company Code");
			}

		},
		onDateRangeChanged: function(oEvent) {
			var oDRS = oEvent.getSource();

			// Get start and end dates as Date objects
			var oFromDate = oDRS.getDateValue(); // left side
			var oToDate = oDRS.getSecondDateValue(); // right side

			// If you want string values (yyyy-MM-dd)
			var sFromDate = oDRS.getValue().split(" -TO- ")[0];
			var sToDate = oDRS.getValue().split(" -TO- ")[1];

			// Optional: update hidden pickers if you want to reuse them later
			this.byId("id_StrDate").setDateValue(oFromDate);
			this.byId("id_EndDate").setDateValue(oToDate);
		},

		fn_updatepaginationModel: function() {
			var oTable = this.byId("id_table_width");
			this.iRowsPerPage = oTable.getVisibleRowCount();
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "JSstatus");
			console.log("JSstatus data:", pagedModel.getData());
			var oFooter = this.getView().byId("paginationfooter");
			if (pageData.length > 0) {
				oFooter.setVisible(true);
				this.fn_renderPageNumbers();
			} else {
				oFooter.setVisible(false);
			}
			this.fn_renderPageNumbers();
		},
		fn_nextpage: function() {
			var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			if (this.iCurrentPage < iTotalPages) {
				this.iCurrentPage++;
				this.fn_updatepaginationModel();
			}
		},
		fn_previouspage: function() {
			if (this.iCurrentPage > 1) {
				this.iCurrentPage--;
				this.fn_updatepaginationModel();
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

			var oNextBtn = this.byId("idNextBtn");
			if (oNextBtn) {
				oNextBtn.setVisible(this.iCurrentPage < iTotalPages);
			}
			if (iTotalPages <= 1) {
				return;
			}

			var currentPage = this.iCurrentPage;
			var that = this;

			function getPageNumbers(currentPage, totalPages) {
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

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.fn_updatepaginationModel();
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
		},

		fnCountStatus: function(res) {
			var vInd, vAtt, vPro, vWrk, vPark, vPost, vReject, vAttS;
			vAttS = 0;
			vInd = 0;
			vAtt = 0;
			vPro = 0;
			vWrk = 0;
			vPark = 0;
			vPost = 0;
			vReject = 0;
			for (var i = 0; i < res.length; i++) {
				if (res[i].Stats == "S05") {
					vAttS = vAttS + 1;
				} else if (res[i].Stats == "S10") {
					vAtt = vAtt + 1;
				} else if (res[i].Stats == "S15") {
					vInd = vInd + 1;
				} else if (res[i].Stats == "S20") {
					vPro = vPro + 1;
				} else if (res[i].Stats == "S30") {
					vWrk = vWrk + 1;
				} else if (res[i].Stats == "S40") {
					vPark = vPark + 1;
				} else if (res[i].Stats == "S41") {
					vPost = vPost + 1;
				} else if (res[i].Stats == "S50") {
					vReject = vReject + 1;
				}
			}
			this.oJsonList = this.getView().getModel("JSList");
			this.oJsonList.setData(null);
			var arr2 = [{
				"ListKey": "1",
				"ListText": "Attached (" + vAttS + ")"
			}, {
				"ListKey": "2",
				"ListText": "Attached - SES(" + vAtt + ")"
			}, {
				"ListKey": "3",
				"ListText": "Indexed (" + vInd + ")"
			}, {
				"ListKey": "4",
				"ListText": "In WorkFlow (" + vWrk + ")"
			}, {
				"ListKey": "5",
				"ListText": "In Progress (" + vPro + ")"
			}, {
				"ListKey": "6",
				"ListText": "Parked (" + vPark + ")"
			}, {
				"ListKey": "7",
				"ListText": "Posted (" + vPost + ")"
			}, {
				"ListKey": "8",
				"ListText": "Rejected (" + vReject + ")"
			}];
			var oModel2 = new sap.ui.model.json.JSONModel();
			oModel2.setData(arr2);
			this.getOwnerComponent().setModel(oModel2, "JSList");
		},
		fnAttached: function(oEvent) {
			// var arr1 = [];
			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S05") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnAttachSES: function(oEvent) {
			// var arr1 = [];
			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S10") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnIndexed: function(oEvent) {

			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S15") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnProgress: function(oEvent) {

			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S20") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnWorkflow: function(oEvent) {

			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S30") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnParked: function(oEvent) {

			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S40") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnPosted: function(oEvent) {

			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S41") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fnRejected: function(oEvent) {

			this.oJsonQTable = this.getView().getModel("JSstatus");
			var arr = this.getView().getModel("JSstatus").getData();
			if (Barr.length != 0) {
				for (var j = 0; j < Barr.length; j++) {
					if (Barr[j].Stats == "S50") {
						arr1.push(Barr[j]);
					}
				}
				this.oJsonQTable.setData(arr1);
				this.getView().byId("id_Qid_Table").setModel(this.oJsonQTable, "JSstatus");
				this.oJsonQTable.refresh();
			}
		},
		fn_getProfifCntr: function() {
			var Bukrslen = this.getView().byId("idCCode").getSelectedItems().length;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var vtokens = this.getView().byId("idCCode").getSelectedItems();
			var aFilters = [new Filter("Type", FilterOperator.EQ, "Profit")];
			if (Bukrslen !== 0) {
				for (var i = 0; i < Bukrslen; i++) {
					var vCompId = vtokens[i].getKey();
					var oFilter1 = new sap.ui.model.Filter("Bukrs", FilterOperator.EQ, vCompId);
					aFilters.push(oFilter1);
				}
			}
			oGlobalBusyDialog.open();
			oModel.read("/StatusFlowSet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSProfitCenter');
					oGlobalBusyDialog.close();
				},
				error: function(oResponse) {
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');
					oGlobalBusyDialog.close();

				}

			});
			if (!this.Profit_frag) {
				this.Profit_frag = sap.ui.xmlfragment("FSC360NEW.fragment.ProfitCenter", this);
				this.getView().addDependent(this.Profit_frag);
			}
			this.Profit_frag.open();
		},
		fn_ProfitCntr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Ltext", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fnProfitConfrm_: function(oEvent) {
			var profit = oEvent.getParameter('selectedItem').getTitle();
			var profitDes = oEvent.getParameter('selectedItem').getDescription();
			this.getView().byId("idProfitCentre").setValue(profit + ' - ' + profitDes);

		},
		fn_navststus_to_wb: function(oEvent) {
			var t_flag = "N";
			var QueueID = parseInt(oEvent.getSource().getBindingContext('JSstatus').getProperty('Qid'));
			var Bukrs = oEvent.getSource().getBindingContext('JSstatus').getProperty('Bukrs');
			var Stats = oEvent.getSource().getBindingContext('JSstatus').getProperty('Stats');
			var oType = 'X';
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("Workbench", {
				"QueueID": QueueID,
				"Bukrs": Bukrs,
				"Stats": Stats,
				"UserType": UserType,
				"NavScreen": "Status",
				"Flag": t_flag,
				"Type": oType
			});

		},
		fn_statusrefresh: function() {

			this.fn_LoadF4();
		},

		fn_fulfillrefresh: function() {
			location.reload();
		},

		fn_FilterPop: function(oEvent) {
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
				this._oCreateTemplatePopover = sap.ui.xmlfragment(oView.getId(), "FSC360NEW.fragment.CreateTemplate_fullfill", this);
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
			const sTableName = "/EXL/FSC_SCAN";

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
			const sTableName = "/EXL/FSC_SCAN";
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
		fn_onDeleteTemplateRow: function(oEvent) {
			var oButton = oEvent.getSource();
			var oCtx = oButton.getBindingContext("viewModel1");
			if (!oCtx) {
				return;
			}

			var sTemplateName = oCtx.getProperty("name");
			var sReportName = "/EXL/FSC_SCAN"; // Hardcoded Tabid

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

		onConfirmYesPress: function() {
			var that = this; // maintain controller context
			var oTemplateModel = this.getView().getModel("TemplateModel");

			// case 1 → overwrite (from Save)
			if (this._oPendingTemplatePayload) {
				var oPayload = this._oPendingTemplatePayload;
				var sTemplateName = this._sPendingTemplateName;

				oTemplateModel.create("/SaveTemplateSet", oPayload, {
					success: function() {
						sap.m.MessageToast.show("Template \"" + sTemplateName + "\" updated successfully");
						that.fn_reloadTemplates();
					},
					error: function() {
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
					"',Tabid='" + encodeURIComponent(sReport) + "')", {
						success: function() {
							sap.m.MessageToast.show("Template \"" + sTemplate + "\" deleted successfully");

							var aTemplates = oViewModel.getProperty("/templates") || [];
							oViewModel.setProperty("/templates",
								aTemplates.filter(function(t) {
									return t.name !== sTemplate;
								})
							);
						},
						error: function() {
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

		onConfirmNoPress: function() {
			sap.m.MessageToast.show("Action cancelled");

			if (this._oConfirmDialog) {
				this._oConfirmDialog.close();
				this._oConfirmDialog.destroy();
				this._oConfirmDialog = null;
			}

			this._clearTempData();
			this._clearDeleteData();
		},

		onConfirmDialogClose: function() {
			if (this._oConfirmDialog) {
				this._oConfirmDialog.destroy();
				this._oConfirmDialog = null;
			}
		},

		_clearTempData: function() {
			delete this._oPendingTemplatePayload;
			delete this._sPendingTemplateName;
		},

		_clearDeleteData: function() {
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