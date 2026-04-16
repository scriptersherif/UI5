sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
], function(Controller, MessageBox, Filter, FilterOperator, formatter) {
	"use strict";
	var bPoSortAsc = true;
	return Controller.extend("FSC360NEW.controller.Barcode", {

		onInit: function() {
			var oViewData = this.getView().getViewData();
			if (oViewData && oViewData.appStateModel) {
				this.getView().setModel(oViewData.appStateModel, "appState");
			}
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
			// table claering mano start 
			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oEmptyModel, "JSBCTable");
			// table claering mano end
			this.fnClear();
			this.fn_LoadInitial();
			this.fnGetF4Help();
			// this.updatePaginatedModel();
			this._selectedRows = [];
			this.byId("id_table").attachRowSelectionChange((oEvent) => {
				this._selectedRows = oEvent.getSource().getSelectedIndices();
			});
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Barcode").attachPatternMatched(this.Fn_RouteMatched, this);
			this.getView().byId("id_FooterTool").setVisible(false);
			this.getView().byId("idPaginationFooter").setVisible(false);
			var oPickPagination = this.getView().byId("fultabPick");
			var oMainPagination = this.getView().byId("fultab");

			if (oPickPagination) oPickPagination.setVisible(false);
			if (oMainPagination) oMainPagination.setVisible(true);
		},
		_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".formInputB1").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});
			$view.find(".formInputB01").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.minWidth = "50%";
				}
			});

			$view.find(".cl_combo_transBar").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
				}
			});
			var oTooltipModel = new sap.ui.model.json.JSONModel({
				tooltipPO: "",
				tooltipCondition: ""
			});
			this.getView().setModel(oTooltipModel, "JSPO_Tooltip");
		},
		Fn_RouteMatched: function() {
			this.fnClear();

			// Get controls
			var oDateRange = this.byId("id_DateRangePO");
			var oFromDatePicker = this.byId("id_frompoDate");
			var oToDatePicker = this.byId("id_EndpoDate");

			var oToDate = new Date();
			var oFromDate = new Date();
			oFromDate.setMonth(oFromDate.getMonth() - 1);
			oDateRange.setDateValue(oFromDate);
			oDateRange.setSecondDateValue(oToDate);

			function formatDateYMD(oDate) {
				var dd = String(oDate.getDate()).padStart(2, '0');
				var mm = String(oDate.getMonth() + 1).padStart(2, '0');
				var yyyy = oDate.getFullYear();
				return yyyy + "-" + mm + "-" + dd;
			}
			var formattedFromDate = formatDateYMD(oFromDate);
			var formattedToDate = formatDateYMD(oToDate);
			oFromDatePicker.setValue(formattedFromDate);
			oToDatePicker.setValue(formattedToDate);
			var oPlantComboBox = this.getView().byId("id_plantr");
			var sSelectedPlant = oPlantComboBox.getSelectedKey();
			if (sSelectedPlant) {
				this.handleDateChange1({
					getSource: () => oFromDatePicker
				});
				this.handleDateChange2({
					getSource: () => oToDatePicker
				});
			}
			var oPickPagination = this.getView().byId("fultabPick");
			var oMainPagination = this.getView().byId("fultab");

			if (oPickPagination) oPickPagination.setVisible(false);
			if (oMainPagination) oMainPagination.setVisible(true);
		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		fn_sortByPO: function() {
			var oTable = this.byId("id_table");
			var oBinding = oTable.getBinding("rows");

			if (oBinding) {
				// Create sorter on Ebeln (PO number)
				var oSorter = new sap.ui.model.Sorter("Ebeln", !bPoSortAsc); // ASC if false
				oBinding.sort(oSorter);

				// Update icon
				var oImage = this.byId("qidSortIcon");
				if (bPoSortAsc) {
					oImage.setSrc("Images/arrow-up.svg");
				} else {
					oImage.setSrc("Images/arrow-down.svg");
				}

				// Toggle flag
				bPoSortAsc = !bPoSortAsc;
			}
		},
		fn_Invoicedate_change: function(oEvent) {
			var oRange = oEvent.getSource();
			var oFromDate = oRange.getDateValue(); // First selected date
			var oToDate = oRange.getSecondDateValue(); // Second selected date

			// Set them to hidden DatePickers
			if (this.byId("id_frompoDate")) {
				this.byId("id_frompoDate").setDateValue(oFromDate); // Triggers handleDateChange1
			}

			if (this.byId("id_EndpoDate")) {
				this.byId("id_EndpoDate").setDateValue(oToDate); // Triggers handleDateChange2
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
		onVendorSuggest: function(oEvent) {
			var sValue = oEvent.getParameter("suggestValue"),
				oBinding = oEvent.getSource().getBinding("items");

			if (sValue) {
				// Filter by Name OR Code
				var oFilter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue),
					oFilter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);

				oBinding.filter(new sap.ui.model.Filter([oFilter1, oFilter2], false)); // OR condition
			} else {
				oBinding.filter([]); // clear filter
			}
		},
		fnVendorFilter: function(sTerm, oItem) {
			if (!sTerm) {
				return true; // show all if search empty
			}

			// Normalize case
			sTerm = sTerm.toLowerCase();

			// Get bound context object (Lifnr + Mcod1)
			var oCtx = oItem.getBindingContext("JSVendor").getObject();

			var sLifnr = (oCtx.Lifnr || "").toLowerCase();
			var sMcod1 = (oCtx.Mcod1 || "").toLowerCase();

			// Match against Lifnr OR Mcod1
			return sLifnr.includes(sTerm) || sMcod1.includes(sTerm);
		}

		,
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show();
			oModel.read("/KredaSet", {

				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSVendor');
					that.byId("id_Vendor").bindItems({
						path: "JSVendor>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSVendor>Lifnr}",
							text: "{JSVendor>Lifnr}",
							additionalText: "{JSVendor>Mcod1}"
						})
					});

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var mes = "Http Error"
					this.fnShowErrorDialog(mes);

				}

			});
			sap.ui.core.BusyIndicator.show();
			oModel.read("/TaxshSet", {

				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSTaxCode');

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var mes = "Http Error"
					this.fnShowErrorDialog(mes);

				}

			});
			sap.ui.core.BusyIndicator.show();
			oModel.read("/PlantShSet", {
				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData.results);
					that.getView().setModel(oJSONModel, 'JSPlant');
					var oSupplierCombo = that.getView().byId("id_supplierPlant");
					if (oSupplierCombo) {
						oSupplierCombo.setModel(oJSONModel, "JSPlant");
					}
				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var mes = "Http Error"
					this.fnShowErrorDialog(mes);
				}
			});

		},
		fnClear: function() {
			this.getView().byId('id_table_width').setVisible(false);
			this.getView().byId('id_InvoiceTable_custom').setVisible(false);
			this.getView().byId('id_table').setVisible(true);

			this.getView().byId("id_frompoDate").setDateValue(new Date());
			this.getView().byId("id_EndpoDate").setDateValue(new Date());
			this.getView().byId('id_BillentryNo').setEditable(true);
			this.getView().byId("id_plantr").setValue('');

			this.getView().byId("id_PO").clearSelection();
			this.getView().byId("id_Condition").clearSelection();

			this.getView().byId('id_Custom').setSelected(false);
			this.getView().byId("id_Vendor").setValue('');
			this.getView().byId("id_GRNNo").setValue('');
			this.getView().byId("id_BillentryNo").setValue('');
			this.getView().byId("id_BillEntryDate").setValue('');
			this.getView().byId("id_taxcode").setValue('');
			this.getView().byId("id_groupid").setValue('');
			this.getView().byId('id_Condition').setEnabled(true);
			if (sap.ui.getCore().byId('id_imgUplod')) {
				sap.ui.getCore().byId('id_imgUplod').setValue('');
			}
			// date clearing and table claering mano start 
			this.getView().getModel("JSBCTable").setData([]);
			this.getView().byId("id_frompoDate").setDateValue(null);
			this.getView().byId("id_EndpoDate").setDateValue(null);

			var oDateRange = this.getView().byId("id_DateRangePO");
			if (oDateRange) {
				oDateRange.setValue("");
			}
			this.getView().byId("id_FooterTool").setVisible(false);
			this.getView().byId("idPaginationFooter").setVisible(false);
			var oPickPagination = this.getView().byId("fultabPick");
			var oMainPagination = this.getView().byId("fultab");

			if (oPickPagination) oPickPagination.setVisible(false);
			if (oMainPagination) oMainPagination.setVisible(true);
		},

		fnSelectCustom: function(oEvent) {

			var oView = this.getView();
			var oSummaryBtn = oView.byId("id_Summary");
			var sId = oEvent.getSource().getId();

			var oCustom = oView.byId("id_Custom");
			var oSTO = oView.byId("id_STO");

			// If Custom is clicked
			if (sId.indexOf("id_Custom") !== -1) {
				if (oCustom.getSelected()) {
					oSTO.setSelected(false);
				}
			}

			// If STO is clicked
			if (sId.indexOf("id_STO") !== -1) {
				if (oSTO.getSelected()) {
					oCustom.setSelected(false);
				}
			}
			var oSelected = this.getView().byId('id_Custom').getSelected();
			var bIsCustom = oCustom.getSelected();
			var bIsSTO = oSTO.getSelected();

			if (oSelected == true) {
				oSummaryBtn.setVisible(false); //custom 
				this.getView().byId('id_table_width').setVisible(true);
				this.getView().byId('id_InvoiceTable_custom').setVisible(true);
				this.getView().byId('id_InvoiceTable_normal').setVisible(false);
				this.getView().byId('id_table').setVisible(false);
				this.getView().byId('id_groupid').setVisible(false);
				this.getView().byId('id_groupid_txt').setVisible(false);
				this.getView().byId('id_Condition').setEnabled(false);
				this.getView().byId('id_BillentryNo').setEditable(false);
				this.getView().byId("id_PO").clearSelection();
				this.getView().byId("id_Condition").clearSelection();
				oView.byId("id_vendor_cont").setVisible(true);
				oView.byId("id_stpo").setVisible(false);
				this.fnPOChange();
				this.getView().byId("id_supplierPlant").setValue('');
				this.getView().byId("id_Vendor").setValue('');
				this.getView().byId("id_plantr").setValue('');
				this.getView().byId("id_BillentryNo").setValue('');
				this.getView().byId("id_BillEntryDate").setValue('');
				this.getView().byId("id_taxcode").setValue('');
				this.getView().byId("id_DateRangePO").setValue('');
				this.getView().byId("id_GRNNo").setValue('');
			} else if (bIsSTO) {

				oSummaryBtn.setVisible(true);
				oView.byId("id_vendor_cont").setVisible(false);
				oView.byId("id_stpo").setVisible(true);
				this.getView().byId('id_table_width').setVisible(false);
				this.getView().byId('id_InvoiceTable_custom').setVisible(false);
				this.getView().byId('id_table').setVisible(true);
				this.getView().byId('id_InvoiceTable_normal').setVisible(true);
				this.getView().byId('id_groupid').setVisible(true);
				this.getView().byId('id_Condition').setEnabled(true);
				this.getView().byId('id_groupid_txt').setVisible(true);
				this.getView().byId('id_BillentryNo').setEditable(true);
				this.getView().byId("id_PO").clearSelection();
				this.getView().byId("id_Condition").clearSelection();
				this.fnPOChange();
				this.getView().byId("id_supplierPlant").setValue('');
				this.getView().byId("id_Vendor").setValue('');
				this.getView().byId("id_plantr").setValue('');
				this.getView().byId("id_BillentryNo").setValue('');
				this.getView().byId("id_BillEntryDate").setValue('');
				this.getView().byId("id_taxcode").setValue('');
				this.getView().byId("id_DateRangePO").setValue('');
				this.getView().byId("id_GRNNo").setValue('');
			} else {
				this.getView().byId("id_supplierPlant").setValue('');
				this.fnPOChange();
				oSummaryBtn.setVisible(true);
				oView.byId("id_vendor_cont").setVisible(true);
				oView.byId("id_stpo").setVisible(false);
				this.getView().byId('id_table_width').setVisible(false);
				this.getView().byId('id_table').setVisible(true);
				this.getView().byId('id_InvoiceTable_custom').setVisible(false);
				this.getView().byId('id_InvoiceTable_normal').setVisible(true);
				this.getView().byId('id_groupid').setVisible(true);
				this.getView().byId('id_Condition').setEnabled(true);
				this.getView().byId('id_groupid_txt').setVisible(true);
				this.getView().byId('id_BillentryNo').setEditable(true);
				this.getView().byId("id_PO").clearSelection();
				this.getView().byId("id_Condition").clearSelection();
				this.getView().byId("id_Vendor").setValue('');
				this.getView().byId("id_plantr").setValue('');
				this.getView().byId("id_BillentryNo").setValue('');
				this.getView().byId("id_BillEntryDate").setValue('');
				this.getView().byId("id_taxcode").setValue('');
				this.getView().byId("id_DateRangePO").setValue('');
				this.getView().byId("id_GRNNo").setValue('');
			}
			var oBCTabJson = new sap.ui.model.json.JSONModel();
			oBCTabJson.setData([]);
			this.getView().setModel(oBCTabJson, 'JSBCTable');
			this.getView().byId("id_FooterTool").setVisible(false);
			this.getView().byId("idPaginationFooter").setVisible(false);
			var oPickPagination = this.getView().byId("fultabPick");
			var oMainPagination = this.getView().byId("fultab");

			if (oPickPagination) oPickPagination.setVisible(false);
			if (oMainPagination) oMainPagination.setVisible(true);
			//this.fn_search();
		},
		fn_ViewTable: function() {

			var vFlag = this.getView().byId("id_input_hbox").getVisible();
			if (vFlag === true) {
				this.getView().byId("id_input_hbox").setVisible(false);
				this.getView().byId('id_expandblueima').setVisible(true);
				this.getView().byId('id_expandima').setVisible(false);
			} else {
				this.getView().byId("id_input_hbox").setVisible(true);
				this.getView().byId('id_expandblueima').setVisible(false);
				this.getView().byId('id_expandima').setVisible(true);
			}

		},
		fn_getPlant: function() {
			if (!this.getPlant_frag) {
				this.getPlant_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Plant", this);

				this.getView().addDependent(this.getPlant_frag);
			}
			this.getPlant_frag.open();
		},

		fn_Plant_Confrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var plantKey = oSelectedItem.getKey();
				var plantText = oSelectedItem.getText();
				this.getView().byId("id_plantr").setSelectedKey(plantKey);

				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				sap.ui.core.BusyIndicator.show();
				oModel.read("/TaxshSet", {
					filters: [

						new Filter("Werks", FilterOperator.EQ, plantKey || "")

					],
					success: function(oData, oResponse) {
						sap.ui.core.BusyIndicator.hide();
						var oJSONModel = new sap.ui.model.json.JSONModel();
						oJSONModel.setData(oData.results);
						this.getView().setModel(oJSONModel, "JSTaxCode");
					}.bind(this),
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						var mes = "Http Error"
						this.fnShowErrorDialog(mes);
					}
				});
			}
		},
		fn_SupplierPlant_Confrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var plantKey = oSelectedItem.getKey();
				var plantText = oSelectedItem.getText();
				this.getView().byId("id_supplierPlant").setSelectedKey(plantKey);
			}
		},
		fn_plant_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_getTaxCode: function(oEvent) {

			if (!this.TaxCode_frag) {
				this.TaxCode_frag = sap.ui.xmlfragment("FSC360NEW.fragment.TaxCode", this);
				this.getView().addDependent(this.TaxCode_frag);
			}
			this.TaxCode_frag.open();
		},

		fn_TaxConfrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (!oSelectedItem) return;

			var tax_name = oSelectedItem.getKey();
			var tax_des = oSelectedItem.getText();
			var oCombo = this.getView().byId("id_taxcode");
			var sValue = tax_name + ' - ' + tax_des;

			oCombo.setValue(sValue);

			// --- Fix cursor position ---
			setTimeout(function() {
				var oInput = oCombo.getFocusDomRef(); // Get the native input element
				if (oInput) {
					oInput.setSelectionRange(sValue.length, sValue.length); // Move cursor to end
				}
			}, 0);
		},

		fn_getVendor: function() {

			if (!this.Vendor_frag) {
				this.Vendor_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Lifnr", this);
				this.getView().addDependent(this.Vendor_frag);
			}
			this.Vendor_frag.open();
		},
		fn_Lifnr_Confrm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (oItem) {
				var ven_name = oItem.getText();
				var lifnr = oItem.getKey();
				this.getView().byId("id_Vendor").setValue(ven_name);
			}
		},

		fn_Lifnr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		handleDateChange1: function() {
			this.fnPOChange();

		},

		handleDateChange2: function() {

		},
		onDateRangeChanged: function(oEvent) {
			var oDateRange = oEvent.getSource();
			var aDates = oDateRange.getValue().split(" -TO- ");

			if (aDates.length === 2) {
				var sFromDate = aDates[0].trim();
				var sToDate = aDates[1].trim();

				var fromParts = sFromDate.split("/");
				var toParts = sToDate.split("/");

				// Convert to "YYYY-MM-DD"
				var formattedFromDate = fromParts[2] + "-" + fromParts[1] + "-" + fromParts[0];
				var formattedToDate = toParts[2] + "-" + toParts[1] + "-" + toParts[0];

				// Set the values in the individual DatePickers
				this.byId("id_frompoDate").setValue(formattedFromDate);
				this.byId("id_EndpoDate").setValue(formattedToDate);

				// Trigger the respective change functions manually
				this.handleDateChange1({
					getSource: () => this.byId("id_frompoDate")
				});
				this.handleDateChange2({
					getSource: () => this.byId("id_EndpoDate")
				});
			}
		},

		fnPOChange: function() {
			var that = this;

			var vCustom = false;
			var vSTO = this.byId("id_STO").getSelected();

			// Get and normalize date values
			function normalizeDate(dateValue) {
				if (!dateValue) return null;
				if (dateValue instanceof Date) {
					var y = dateValue.getFullYear(),
						m = String(dateValue.getMonth() + 1).padStart(2, "0"),
						d = String(dateValue.getDate()).padStart(2, "0");
					return `${y}-${m}-${d}`;
				}
				if (dateValue.includes("/")) {
					var parts = dateValue.split("/");
					return `${parts[2]}-${parts[1]}-${parts[0]}`;
				}
				if (dateValue.includes("-")) return dateValue;
				return null;
			}

			var formattedFrom = normalizeDate(this.byId("id_frompoDate").getValue());
			var formattedTo = normalizeDate(this.byId("id_EndpoDate").getValue());
			var vPlant = this.byId('id_plantr').getValue().split(' - ')[0];

			var aFilters = [
				new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlant),
				new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, formattedFrom, formattedTo),
				new sap.ui.model.Filter("Agent", sap.ui.model.FilterOperator.EQ, vCustom ? 'X' : ''),
				new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, 'A')
			];
			if (vSTO) {
				aFilters.push(new sap.ui.model.Filter("Stpoflag", sap.ui.model.FilterOperator.EQ, 'X'));
			}

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			sap.ui.core.BusyIndicator.show();

			oModel.read("/AssignbcHeadSet", {
				filters: aFilters,
				urlParameters: {
					$expand: "NavBillentry,NavPurchaseOrder,NavConditiontype"
				},
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					// Create JSON model for PO
					var oPoJson = new sap.ui.model.json.JSONModel();
					var aPOResults = oData.results[0]?.NavPurchaseOrder?.results || [];
					oPoJson.setData(aPOResults);
					that.getView().setModel(oPoJson, 'JSPO');

					var oMCB = that.byId("id_PO");

					if (!that._bPOBound) {
						oMCB.bindItems({
							length: oData.results[0].NavPurchaseOrder.results.length,
							path: "JSPO>/",
							template: new sap.ui.core.Item({
								key: "{JSPO>Ebeln}",
								text: "{JSPO>Ebeln}"
							})
						});
						that._bPOBound = true;
					}

				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show('Failed to fetch Purchase Order');
				}
			});
		},

		handleSelectionFinish: function(oEvent) {
			var oMCB = oEvent.getSource();
			var aSelectedItems = oMCB.getSelectedItems();
			var sSelectedText = aSelectedItems.map(function(oItem) {
				return oItem.getText();
			}).join(", ");
			this.getView().getModel("JSPO_Tooltip").setProperty("/tooltipPO", sSelectedText);

			this.fnGetCondition();
		},

		handleInvoiceSelectionFinish: function(oEvent) {
			var oMCB = oEvent.getSource();
			var aSelectedItems = oMCB.getSelectedItems();

			// Create tooltip text
			var sTooltipText = aSelectedItems.map(function(oItem) {
				return oItem.getText();
			}).join(", ");

			// Update the tooltip model
			this.getView().getModel("JSPO_Tooltip").setProperty("/tooltipCondition", sTooltipText);
		},
		fnCancelSumm: function(oEvent) {
			this.oSumm.close();
			var data = [];
			var oBCTabJson = new sap.ui.model.json.JSONModel();
			oBCTabJson.setData(data);
			this.getView().setModel(oBCTabJson, 'LNSumm');

		},

		fnSummary: function(oEvent) {
			var oView = this.getView();
			var bCustomSelected = oView.byId('id_Custom').getSelected();
			var oTable = bCustomSelected ? oView.byId('id_table_width') : oView.byId('id_table');
			var vSelection = oTable.getSelectedIndices();

			var aFilters = [];
			var vFromDate = oView.byId('id_frompoDate').getValue();
			var vToDate = oView.byId('id_EndpoDate').getValue();
			var vVendor = oView.byId('id_Vendor').getValue();
			var Vendormat = vVendor.match(/(\d+)/);

			var oModel = this.getView().getModel("JSBCTable").getData();
			if (vSelection.length > 0) {
				var vPlant = oView.byId('id_plantr').getValue();
				var Plantmat = vPlant.match(/(\d+)/);

				for (var i = 0; i < vSelection.length; i++) {
					var vKschl = oModel[vSelection[i]].Kschl;
					if (vKschl != "") {
						var oFilter1 = new sap.ui.model.Filter("Kschl", sap.ui.model.FilterOperator.EQ, vKschl);
						aFilters.push(oFilter1);
					}
					var vEbeln = oModel[vSelection[i]].Ebeln;
					if (vEbeln != "") {
						var oFilter1 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, vEbeln);
						aFilters.push(oFilter1);
					}
					var vWrbtr = oModel[vSelection[i]].Wrbtr;
					if (vWrbtr != "") {
						var oFilter1 = new sap.ui.model.Filter("Wrbtr", sap.ui.model.FilterOperator.EQ, vWrbtr);
						aFilters.push(oFilter1);
					}
					var vGrnNo = oModel[vSelection[i]].Mblnr;
					if (vGrnNo != "") {
						var oFilter1 = new Filter("Mblnr", FilterOperator.EQ, vGrnNo);
						aFilters.push(oFilter1);
					}
				}

				var oFilter1 = new Filter("Werks", FilterOperator.BT, Plantmat[0]);
				aFilters.push(oFilter1);
				var oFilter1 = new Filter("Erdat", FilterOperator.BT, vFromDate, vToDate);
				aFilters.push(oFilter1);
				if (Vendormat) {
					var oFilter1 = new Filter("Lifnr", FilterOperator.EQ, Vendormat[0]);
					aFilters.push(oFilter1);
				}

				var vFlag = 'X';
				var oFilter2 = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, vFlag);
				aFilters.push(oFilter2);
				var vSTO = this.byId("id_STO").getSelected();
				if (vSTO) {
					aFilters.push(new sap.ui.model.Filter("Stpoflag", sap.ui.model.FilterOperator.EQ, 'X'));
				}

				this.fnGetSummdetails(aFilters);
				if (!this.oSumm) {
					this.oSumm = sap.ui.xmlfragment(
						"FSC360NEW.fragment.Summary", this);
					this.getView().addDependent(this.oSumm);
				}
				this.oSumm.open();
			} else {
				sap.m.MessageToast.show('Select at least one entry');
			}
		},
		fnsum: function() {
			var oView = this.getView();

			if (!this.oSumm) {
				this.oSumm = sap.ui.xmlfragment("FSC360NEW.fragment.Summary", this);
				oView.addDependent(this.oSumm);
			}

			this.oSumm.open();
		},
		fnviewImagefrag: function() {
			var that = this;
			if (!this.oImgDialog) {
				this.oImgDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ImageBarcode", this);
				this.getView().addDependent(this.oImgDialog);
				sap.ui.getCore().byId("id_barcodeimgno").setValue('');
			} else {
				this.oImgDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ImageBarcode", this);
				this.getView().addDependent(this.oImgDialog);
			}
			this.oImgDialog.open();
		},
		fnBarcodeImgCancel: function(oEvent) {
			this.oImgDialog.destroy();
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
		},
		fnSubmitImgBarcode: function(oEvent) {
			var vBarcode = sap.ui.getCore().byId("id_barcodeimgno").getValue();

			if (vBarcode != '' && vBarcode.length === 14) {
				this.fnviewImage(vBarcode);
				this.oImgDialog.destroy();
			} else {
				sap.m.MessageToast.show('Please Enter Barcode Number');
			}
			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
		},
		fnviewImage: function() {
			var that = this;
			var vErrortext = "";
			var vBarcode = sap.ui.getCore().byId('id_barcodeimgno').getValue();

			if (vBarcode !== '') {
				var oEntity = {
					IvAction: 'ImageView',
					Barcode: vBarcode
				};
				oEntity.NavHead = [];
				var oModel = that.getView().getModel();
				sap.ui.core.BusyIndicator.show();
				oModel.create("/DEEPHEADSet", oEntity, {
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						var vMsg = '';
						if (oData.Qid !== '0000000000') {
							that.fnImageDisp(oData.Qid, vBarcode);
						} else {
							sap.m.MessageToast.show('No Queid Found with Barcode ' + oData.Slno);
						}
					},
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show('HTTP request failed');
					}
				});
			} else {
				vErrortext = 'Please Enter Barcode';
				sap.m.MessageToast.show(vErrortext);
			}
		},
		fnImageDisp: function(vQID, vBarcode) {

			var that = this;
			if (!this.oInvoiceDialog) {
				this.oInvoiceDialog = sap.ui.xmlfragment("FSC360NEW.fragment.Image", this);

				sap.ui.getCore().byId("id_invImage").removeAllContent();
			} else {
				this.oInvoiceDialog = sap.ui.xmlfragment("FSC360NEW.fragment.Image", this);
			}

			this.oInvoiceDialog.open();
			sap.ui.getCore().byId("id_invImage").setBusy(true);
			this.fnGetPDF(vQID, vBarcode);

		},
		fnGetPDF: function(vQID, vBarcode) {
			var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + vQID + "',Doc='')/$value";

			var oHtml = new sap.ui.core.HTML({});
			var oContent = "<div><iframe src=" + Url + " style='Content-Disposition: inline ;' width=445px' height='490px'></iframe></div>";
			var oScrl = sap.ui.getCore().byId("id_invImage");

			oScrl.addContent(oHtml);
			oScrl.setVisible(true);
			oHtml.setContent(oContent);
			sap.ui.getCore().byId("id_invImage").setBusy(false);
			sap.ui.getCore().byId("id_Qidtxt").setText(vQID);
			sap.ui.getCore().byId("id_Brcdtxt").setText(vBarcode);
		},
		fnFragInvoiceClose: function(oEvent) {
			this.oInvoiceDialog.destroy();
		},
		fnGetSummdetails: function(aFilters) {
			var oView = this.getView();

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show();
			oModel.read("/AssignbcHeadSet", {
				filters: aFilters,

				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide();
					var oBCTabJson = new sap.ui.model.json.JSONModel();
					oBCTabJson.setData(oData.results);
					that.getView().setModel(oBCTabJson, 'LNSumm');

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show('Failed to get OBD Details');
				}
			});
		},

		fnAssignBarcode: function() {
			var oView = this.getView();
			var vPlant = oView.byId('id_plantr').getValue();
			var vBookingPlant = vPlant.match(/(\d+)/);

			var bCustomSelected = oView.byId('id_Custom').getSelected();

			var oTable = bCustomSelected ? oView.byId('id_table_width') : oView.byId('id_table');

			var aSelectedIndices = oTable.getSelectedIndices();
			var vInvno = "",
				vInvdate = null;

			if (aSelectedIndices.length > 0) {

				var oRow = oTable.getContextByIndex(aSelectedIndices[0]).getObject();
				vInvno = oRow.InvNo;
				vInvdate = oRow.InvDate ? new Date(oRow.InvDate) : null;
			}

			var vInvError = false;
			var vInvdateError = false;

			if (!vInvno) {
				vInvError = true;
				sap.m.MessageToast.show('Please Enter Invoice Number');
			}

			if (!vInvdate) {
				vInvdateError = true;
				sap.m.MessageToast.show('Please Enter Invoice Date');
			}

			if (vBookingPlant && vBookingPlant[0]) {
				var vObdSelectd = oView.byId('id_Planradiobtn').getSelected();
				var vErrorSel = false;

				// var selectedCount = vObdSelectd //line changed by yasin on 17-10-2025
				var selectedCount = aSelectedIndices.length;

				if (selectedCount < 1) {
					vErrorSel = true;
				} else {
					this.vFiscalYear = vInvdate.getFullYear();
				}

				if (!vErrorSel) {
					if (!vInvError && !vInvdateError) {
						if (!this.oBarcode) {
							this.oBarcode = sap.ui.xmlfragment("FSC360NEW.fragment.AssignBar", this);
							oView.addDependent(this.oBarcode);
						}
						sap.ui.getCore().byId('id_BarcodePlant').setValue(vBookingPlant[0]);
						sap.ui.getCore().byId('id_BarcodeFisc').setValue(this.vFiscalYear);
						this.oBarcode.open();
					} else {
						sap.m.MessageToast.show('Please check Invoice No. and Invoice date');
					}
				} else {
					sap.m.MessageToast.show('Select at least one entry');
				}
			} else {
				sap.m.MessageToast.show('Please Enter Booking Plant');
			}
		},

		fnBarcodeCancel: function() {

			this.oBarcode.close();
		},
		fnSubmitBarcode: function() {
			var that = this;
			var oError = "";
			var max = new Date().toISOString().slice(0, 10).split("-");
			var max_date1 = max[2] + "-" + max[1] + "-" + max[0];
			var plant = sap.ui.getCore().byId("id_BarcodePlant").getValue();
			var year = sap.ui.getCore().byId("id_BarcodeFisc").getValue();
			var random = sap.ui.getCore().byId("id_BarcodeEdit").getValue();
			var barcode = plant.concat(year, random);
			var v_isSTO = this.getView().byId("id_STO").getSelected();
			if (!(this.getView().byId("id_InvDate").getDateValue())) {

			} else if ((this.getView().byId("id_InvDate").getDateValue()) > max_date1) {
				oError = oError + "Please Check-Invoice date is in future " + "\n";
				this.getView().byId('id_InvDate').setValueState('Error');

			} else {
				this.getView().byId('id_InvDate').setValueState('None');
			}

			var vThat = this;
			var vError = false;
			var oFileUploader = sap.ui.getCore().byId("id_imgUplod");

			var vFile = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			if (vFile) {
				if (vFile === undefined || vFile === "" || vFile === null) {
					vError = true;
				} else {
					this.vFile = vFile.name;
					var size = vFile.size / 1000000;
				}

				if (size > 25) {
					oError = oError + "File size is should not more than 25MB" + "\n";
				}
				if (vError === false && oError === "") {
					sap.ui.getCore().byId('id_imgUplod').setValueState('None');
					sap.m.MessageBox.confirm('Are you sure you want to upload file ?', {
						icon: sap.m.MessageBox.Icon.CONFIRMATION,
						title: "Confirmation",
						styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
						actions: ['Yes', 'No'],
						defaultAction: sap.m.MessageBox.Action.YES,
						onClose: function(oAction) {
							if (oAction === "Yes") {

								//====================Create Header Table Entry============================
								//sap.ui.core.BusyIndicator.show(10);

								var oModel = vThat.getView().getModel();
								if (!vBarcode) {
									vBarcode = '';
								}
								var vis_stoPO;
								if (v_isSTO == true) {
									vis_stoPO = 'X';
								} else {
									vis_stoPO = '';
								}
								var vSlug = vFile.name + '#' + plant + '#' + vBarcode + '#' + vis_stoPO;
								var vTaskService = "/sap/opu/odata/EXL/FSCNXT360_SRV/Image_ABSet";
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
										data: vFile,
										type: "POST",
										beforeSend: function(xhr) {
											xhr.setRequestHeader(
												"X-CSRF-Token", oModel.getSecurityToken());
											xhr.setRequestHeader(
												"Content-Type",
												vFile.type);
											xhr.setRequestHeader("slug",
												vSlug);
										},
										success: function(oData) {
											sap.ui.core.BusyIndicator.hide();
											if (oData.d.Doc !== "") {
												vThat.fnSaveDataBase1(oData.d.Qid);
												var Queid = (oData.d.Queid);
												var Docid = oData.d.Docid;
												var Filename = (oData.d.Txturl).replace('.pdf', '');
												Filename = (Filename).replace('.PDF', '');

											} else {
												var vMsg1 = 'Failed To Generate QueId';

												that.fnShowErrorDialog(vMsg1);
											}
										},
										error: function(oData) {
											sap.ui.core.BusyIndicator.hide();
											sap.m.MessageToast.show("Failed to Save Image");
										}
									});
							}
						}
					});
					setTimeout(function() {
						var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
						if (buttons[0]) buttons[0].classList.add("yesButtonHack");
						if (buttons[1]) buttons[1].classList.add("noButtonHack");
					}, 100);
				} else {
					if (vError === true) {
						oError = oError + "Please choose the file";
						this.getView().byId('fileuploader').setValueState('Error');
					} else {
						this.getView().byId('fileuploader').setValueState('None');
					}
					MessageBox.error(oError);
					oError = "";
				}
			} else {
				if (!(barcode)) {
					oError = oError + "Enter either Barcode or upload invoice copy" + "\n";
					sap.m.MessageToast.show(oError);
				} else if (barcode.length > 14) {
					oError = oError + "Please check the length of barcode " + "\n";
					sap.m.MessageToast.show(oError);
					return;
				} else {
					var vBarcode = barcode;
					vThat.fnSaveDataBase();
				}

			}
		},
		//Added by Lokesh R on 05.08.2025
		fnAssignBarcodeValid: function() {
			var oView = this.getView();
			var vPlant = oView.byId('id_plantr').getValue();
			var vBookingPlant = vPlant.match(/(\d+)/);

			var oTable = oView.byId("id_table");
			var aSelectedIndices = oTable.getSelectedIndices();
			var vInvno = "",
				vInvdate = null;

			if (aSelectedIndices.length > 0) {
				var oModel = oTable.getModel("JSBCTable");
				var oContext = oTable.getContextByIndex(aSelectedIndices[0]);
				var oData = oContext.getObject();
				vInvno = oData.InvNo;
				vInvdate = oData.InvDate ? new Date(oData.InvDate) : null;
			}

			var vInvError = false;
			var vInvdateError = false;
			var oTableData = oView.getModel("JSBCTable").getData();

			if (!vInvno) {
				vInvError = true;
				sap.m.MessageToast.show('Please Enter Invoice Number');
			}

			if (!vInvdate) {
				vInvdateError = true;
				sap.m.MessageToast.show('Please Enter Invoice Date');
			}

			if (vBookingPlant && (vBookingPlant[0] !== "" && vBookingPlant[0] !== null)) {
				var vObdSelectd = oView.byId('id_Planradiobtn').getSelected();
				var vErrorSel = false;

				if (vObdSelectd === true) {
					var vTableSelectdLength = oView.byId('id_table').getSelectedIndices().length;
					if (vTableSelectdLength < 1) {
						vErrorSel = true;
					} else {
						this.vFiscalYear = vInvdate.getFullYear();
					}
				} else {
					var vTableSelectdLength1 = oView.byId('id_table_width').getSelectedIndices().length;
					if (vTableSelectdLength1 < 1) {
						vErrorSel = true;
					} else {
						this.vFiscalYear = vInvdate.getFullYear();
					}
				}

				if (vErrorSel === false) {
					if (vInvError === false && vInvdateError === false) {

						var Qid = sap.ui.getCore().byId('id_Qidtxt').getText();
						var Brcd = sap.ui.getCore().byId('id_Brcdtxt').getText();
						this.fnSaveDataBase(Qid, Brcd);
					} else {
						sap.m.MessageToast.show('Please check Invoice No. and Invoice date');
					}
				} else {
					sap.m.MessageToast.show('Select at least one entry');
				}
			} else {
				sap.m.MessageToast.show('Please Enter Booking Plant');
			}
		},
		fnSaveDataBase1: function(Qid, Brcd) {

			var that = this;
			var vFromdate = this.getView().byId("id_frompoDate").getValue();
			var vTodate = this.getView().byId("id_EndpoDate").getValue();
			if (Brcd === undefined) {
				var vBarcodeSec = sap.ui.getCore().byId('id_BarcodeEdit').getValue();
				var vBarcodePlant = sap.ui.getCore().byId('id_BarcodePlant').getValue();
				var vBarcodeFisc = sap.ui.getCore().byId('id_BarcodeFisc').getValue();
				var vRemarks = sap.ui.getCore().byId('id_Remarks').getValue();
				var vGroupid = this.getView().byId('id_groupid').getValue();
				if (vBarcodeSec) {
					var Brcode = vBarcodePlant + vBarcodeFisc + vBarcodeSec;
				} else {
					var Brcode = '';
				}
			} else {
				var Brcode = Brcd;
			}
			var bCustomSelected = this.getView().byId('id_Custom').getSelected();
			var oTable = bCustomSelected ? this.getView().byId('id_table_width') : this.getView().byId('id_table');

			var vObdSelected = oTable.getSelectedIndices();
			var vSTO = this.byId("id_STO").getSelected();
			var vVendor;
			if (vSTO) {
				vVendor = this.getView().byId('id_Vendor').getValue();
			} else {
				vVendor = '';
			}
			var Vendormat = "";
			if (vVendor) {
				var match = vVendor.match(/(\d+)/);
				Vendormat = match ? match[0] : "";
			}

			var vInvno = "";
			var vInvdate = null;

			var aSelectedIndices = oTable.getSelectedIndices();

			if (aSelectedIndices.length > 0) {
				var oContext = oTable.getContextByIndex(aSelectedIndices[0]);
				var oRowData = oContext.getObject();

				vInvno = oRowData.InvNo;
				// vInvdate = oData.InvDate?oData.InvDate.toISOString().slice(0, 10) : null;
				vInvdate = oRowData.InvDate ? new Date(oRowData.InvDate).toISOString().slice(0, 10) : null;
				var vMjahr = oRowData.Mjahr;
			}

			var vAgent;
			if (bCustomSelected == true) {
				vAgent = 'X';
			} else {
				vAgent = '';
			}

			if (vObdSelected.length !== 0) {

				var oItems = [];
				var bCustomSelected = that.getView().byId('id_Custom').getSelected();
				var oTable = bCustomSelected ? that.getView().byId('id_table_width') : that.getView().byId('id_table');
				// var oTable = that.getView().byId('id_table');
				var oSelectedIndices = oTable.getSelectedIndices();
				var oData = that.getView().getModel("JSBCTable").getData(); // fetch all table data

				for (var i = 0; i < oSelectedIndices.length; i++) {
					var idx = oSelectedIndices[i];
					var oRowContext = oData[idx]; // get data directly from model

					if (!oRowContext) continue; // safeguard in case index is out of range

					var temp = {
						'Mblnr': oRowContext.Mblnr,
						'Ebeln': oRowContext.Ebeln,
						'Bcode': Brcode,
						'Waers': oRowContext.Waers,
						'Wrbtr': oRowContext.Wrbtr,
						'Frbnr': oRowContext.Frbnr,
						'Status': '01',
						'Vtext': oRowContext.Vtext,
						'Werks': vBarcodePlant,
						'Lifnr': Vendormat[0],
						'Ebelp': oRowContext.Ebelp,
						'Kschl': oRowContext.Kschl,
						'Bktxt': oRowContext.Bktxt,
						'KawrtPo': parseFloat(oRowContext.KawrtPo).toFixed(2),
						'WaersPo': oRowContext.WaersPo,
						'Delnote': oRowContext.Delnote,
						'Invno': vInvno,
						'Invdt': vInvdate.concat("T00:00:00"),
						'Mjahr': vMjahr,
						'Groupid': vGroupid,
						'Custom': vAgent,
						'Remarks': vRemarks,
						'AccessValue': parseFloat(oRowContext.AccessValue).toFixed(2)
					};

					oItems.push(temp);
				}
				var oEntity = {};
				//Added by Lokesh R on 05.08.2025 - Start
				if (Qid !== undefined) {
					oEntity.Flag = "A";
					oEntity.Qid = Qid;
				}
				//Added by Lokesh R on 05.08.2025 - End
				oEntity.NavAsBarcode = oItems;
				oEntity.IvText = vAgent;
				oEntity.Taxcode = this.getView().byId("id_taxcode").getSelectedKey();
				oEntity.IvAction = "AssignBC";
				oEntity.Stdate = vFromdate.concat("T00:00:00");
				oEntity.Endate = vTodate.concat("T00:00:00");
				var oModel = that.getView().getModel();
				sap.ui.core.BusyIndicator.show();
				oModel.create("/DEEPHEADSet", oEntity, {
					success: function(oData, Response) {
						var vMsg = '';
						sap.ui.core.BusyIndicator.hide();
						if (oData.Lifnr == 'S') {
							var vMsg = 'Qid ' + Qid + ' Assigned Successfully';
							MessageBox.success(vMsg);
							that.fnClear();
							that.fnFragInvoiceClose();
						} else if (oData.Lifnr == 'C') {
							var vMsg = 'Barcode already exists';
						} else {
							var vMsg = 'Failed to assign barcode';
						}

						//if (oData.Lifnr != 'S') {
						sap.m.MessageBox.show(vMsg, {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Information",
							styleClass: ".cl_SettingDialog.sapMDialog",
							onClose: function(oAction) {
								// location.reload();
							}
						});
						//}
					},
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show('Please reselect the PO Items');
					}
				});

				setTimeout(function() {
					var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
					if (buttons[0]) buttons[0].classList.add("yesButtonHack");
					if (buttons[1]) buttons[1].classList.add("noButtonHack");
				}, 100); // small delay ensures DOM is ready

			} else {}
			sap.ui.getCore().byId('id_BarcodeEdit').setValue('');
			sap.ui.getCore().byId('id_Remarks').setValue('');
			this.oBarcode.close();

		},
		fn_closeSuccess: function() {
			this._oSuccessDialog.destroy();
			this._oSuccessDialog = null;

		},
		//Added by Lokesh R on 05.08.2025 - End
		fnSaveDataBase: function(Qid, Brcd) {

			var that = this;
			var vFromdate = this.getView().byId("id_frompoDate").getValue();
			var vTodate = this.getView().byId("id_EndpoDate").getValue();
			if (Brcd === undefined) {
				var vBarcodeSec = sap.ui.getCore().byId('id_BarcodeEdit').getValue();
				var vBarcodePlant = sap.ui.getCore().byId('id_BarcodePlant').getValue();
				var vBarcodeFisc = sap.ui.getCore().byId('id_BarcodeFisc').getValue();
				var vRemarks = sap.ui.getCore().byId('id_Remarks').getValue();
				var vGroupid = this.getView().byId('id_groupid').getValue();
			} else {

			}
			var bCustomSelected = this.getView().byId('id_Custom').getSelected();
			var oTable = bCustomSelected ? this.getView().byId('id_table_width') : this.getView().byId('id_table');
			//var vObdSelectd = this.getView().byId('id_table').getSelected();
			var vObdSelected = oTable.getSelectedIndices();
			var vVendor = this.getView().byId('id_Vendor').getValue();
			var Vendormat = "";
			if (vVendor) {
				var match = vVendor.match(/(\d+)/);
				Vendormat = match ? match[0] : "";
			}
			var vCustom = this.getView().byId('id_Custom').getSelected();

			var vInvno = "";
			var vInvdate = null;

			var aSelectedIndices = oTable.getSelectedIndices();

			if (aSelectedIndices.length > 0) {
				var oContext = oTable.getContextByIndex(aSelectedIndices[0]);
				var oRowData = oContext.getObject();

				vInvno = oRowData.InvNo;

				vInvdate = oRowData.InvDate ? new Date(oRowData.InvDate).toISOString().slice(0, 10) : null;
				var vMjahr = oRowData.Mjahr;
			}
			var vAgent;
			if (vCustom == true) {
				vAgent = 'X';
			} else {
				vAgent = '';
			}

			if (vBarcodeSec != '' || Brcd !== undefined) {
				if (Brcd !== undefined) {
					var Brcode = Brcd;
				} else {
					var Brcode = vBarcodePlant + vBarcodeFisc + vBarcodeSec;
				}
				if (vObdSelected.length !== 0) {
					sap.m.MessageBox.confirm('Are you sure you want to assign barcode ?', {
						icon: sap.m.MessageBox.Icon.CONFIRMATION,
						title: "Confirmation",
						styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
						actions: ['Yes', 'No'],
						defaultAction: sap.m.MessageBox.Action.YES,
						onClose: function(oAction) {
							if (oAction === "Yes") {
								var oItems = [];
								var bCustomSelected = that.getView().byId('id_Custom').getSelected();
								var oTable = bCustomSelected ? that.getView().byId('id_table_width') : that.getView().byId('id_table');
								// var oTable = that.getView().byId('id_table');
								var oSelectedIndices = oTable.getSelectedIndices();
								var oData = that.getView().getModel("JSBCTable").getData(); // fetch all table data

								for (var i = 0; i < oSelectedIndices.length; i++) {
									var idx = oSelectedIndices[i];
									var oRowContext = oData[idx]; // get data directly from model

									if (!oRowContext) continue; // safeguard in case index is out of range

									var temp = {
										'Mblnr': oRowContext.Mblnr,
										'Ebeln': oRowContext.Ebeln,
										'Bcode': Brcode,
										'Waers': oRowContext.Waers,
										'Wrbtr': oRowContext.Wrbtr,
										'Frbnr': oRowContext.Frbnr,
										'Status': '01',
										'Vtext': oRowContext.Vtext,
										'Werks': vBarcodePlant,
										'Lifnr': Vendormat[0],
										'Ebelp': oRowContext.Ebelp,
										'Kschl': oRowContext.Kschl,
										'Bktxt': oRowContext.Bktxt,
										'KawrtPo': parseFloat(oRowContext.KawrtPo).toFixed(2),
										'WaersPo': oRowContext.WaersPo,
										'Delnote': oRowContext.Delnote,
										'Invno': vInvno,
										'Invdt': vInvdate.concat("T00:00:00"),
										'Mjahr': vMjahr,
										'Groupid': vGroupid,
										'Custom': vAgent,
										'Remarks': vRemarks
									};

									oItems.push(temp);
								}
								var oEntity = {};
								//Added by Lokesh R on 05.08.2025 - Start
								if (Qid !== undefined) {
									oEntity.Flag = "A";
									oEntity.Qid = Qid;
								}
								//Added by Lokesh R on 05.08.2025 - End
								oEntity.NavAsBarcode = oItems;
								oEntity.IvText = vAgent;
								oEntity.IvAction = "AssignBC";
								oEntity.Stdate = vFromdate.concat("T00:00:00");
								oEntity.Endate = vTodate.concat("T00:00:00");
								var oModel = that.getView().getModel();
								sap.ui.core.BusyIndicator.show();
								oModel.create("/DEEPHEADSet", oEntity, {
									success: function(oData, Response) {
										sap.ui.core.BusyIndicator.hide();
										var vMsg = '';
										if (oData.Lifnr == 'S') {
											var vMsg = 'Barcode assigned successfully';
											// MessageBox.success(vMsg);
											var oSuccessModel = new sap.ui.model.json.JSONModel({
												message: vMsg
											});
											that.getView().setModel(oSuccessModel, "successModel");
											if (!that._oSuccessDialog) {
												that._oSuccessDialog = sap.ui.xmlfragment(
													that.getView().getId(),
													"FSC360NEW.fragment.SuccessReuse",
													that
												);
												that.getView().addDependent(that._oSuccessDialog);
											}
											that._oSuccessDialog.open();

											that.fnClear();
											that.fnFragInvoiceClose();
											setTimeout(function() {
												if (that._oSuccessDialog) {
													that.fn_closeSuccess();
												}
											}, 3000);

										} else if (oData.Lifnr == 'C') {
											var vMsg = 'Barcode already exists';
										} else {
											var vMsg = 'Failed to assign barcode';
										}

										if (oData.Lifnr != 'S') {
											sap.m.MessageBox.show(vMsg, {
												icon: sap.m.MessageBox.Icon.INFORMATION,
												title: "Information",
												styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
												actions: [sap.m.MessageBox.Action.OK],
												defaultAction: sap.m.MessageBox.Action.OK,
												onClose: function(oAction) {

												}
											});
											setTimeout(function() {
												var okButton = document.querySelector(".fragmentButton .sapMBtn");
												if (okButton) {
													okButton.classList.add("yesButtonHack");
												}
											}, 100);
										}

									},
									error: function(oResponse) {
										sap.ui.core.BusyIndicator.hide();
										sap.m.MessageToast.show('Please reselect the PO Items');
									}
								});

							}
						}
					});
					setTimeout(function() {
						var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
						if (buttons[0]) buttons[0].classList.add("yesButtonHack");
						if (buttons[1]) buttons[1].classList.add("noButtonHack");
					}, 100); // small delay ensures DOM is ready

				} else {

					sap.m.MessageBox.confirm('Are you sure you want to assign barcode ?', {
						icon: sap.m.MessageBox.Icon.CONFIRMATION,
						title: "Confirmation",
						styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
						actions: ['Yes', 'No'],
						defaultAction: sap.m.MessageBox.Action.YES,
						onClose: function(oAction) {
							if (oAction === "Yes") {
								var oItems = [];
								var oSelectedList = that.getView().byId('id_table_width').getSelectedIndices();
								var oTab = that.getView().getModel("JSstatus").getData();
								for (var i = 0; i < oSelectedList.length; i++) {
									var temp = {
										'Bcode': vBarcodePlant + vBarcodeFisc + vBarcodeSec,
										'Fknum': oTab[oSelectedList[i]].Fknum
									};
									oItems.push(temp);
								}

								var oEntity = {
									Bcode: vBarcodePlant + vBarcodeFisc + vBarcodeSec
								};
								oEntity.NavStock = oItems;
								var oModel = that.getView().getModel();
								sap.ui.core.BusyIndicator.show();
								oModel.create("/PDCSet", oEntity, {
									success: function(oData, Response) {
										sap.ui.core.BusyIndicator.hide();
										var vMsg = '';
										if (oData.Lifnr == 'S') {
											var vMsg = 'Barcode assigned successfully';
											that.fnSearch();
										} else if (oData.Lifnr == 'C') {
											var vMsg = 'Barcode already exists';
										} else {
											var vMsg = 'Failed to assign barcode';
										}
										//if (oData.Lifnr != 'S') {
										sap.m.MessageBox.show(vMsg, {
											icon: sap.m.MessageBox.Icon.INFORMATION,
											title: "Information",
											styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
											onClose: function(oAction) {
												// location.reload();
											}
										});
										setTimeout(function() {
											var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
											if (buttons[0]) buttons[0].classList.add("yesButtonHack");
											if (buttons[1]) buttons[1].classList.add("noButtonHack");
										}, 100); // small delay ensures DOM is ready
										//}
									},
									error: function(oResponse) {
										sap.ui.core.BusyIndicator.hide();
										sap.m.MessageToast.show('HTTP request failed');
									}
								});

							}
						}
					});
					setTimeout(function() {
						var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
						if (buttons[0]) buttons[0].classList.add("yesButtonHack");
						if (buttons[1]) buttons[1].classList.add("noButtonHack");
					}, 100); // small delay ensures DOM is ready

				}
				sap.ui.getCore().byId('id_BarcodeEdit').setValue('');
				sap.ui.getCore().byId('id_Remarks').setValue('');
				this.oBarcode.close();
			} else {
				sap.m.MessageToast.show('Enter reference');
			}
		},
		fnGetCondition: function() {
			var vPOlen = this.getView().byId('id_PO').getSelectedItems().length;
			var vPOItems = this.getView().byId("id_PO").getSelectedItems();

			var aFilters = [];
			for (var i = 0; i < vPOlen; i++) {
				var vEbeln = vPOItems[i].getKey();
				var oFilter1 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, vEbeln);
				aFilters.push(oFilter1);
			}
			var vFlag = 'P';
			var oFilter2 = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, vFlag);
			aFilters.push(oFilter2);
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show();
			oModel.read("/AssignbcHeadSet", {
				filters: aFilters,
				urlParameters: {
					$expand: "NavConditiontype"

				},
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide();
					var oCondtJson = new sap.ui.model.json.JSONModel();
					oCondtJson.setData(oData.results[0].NavConditiontype.results);
					that.getView().setModel(oCondtJson, 'JSCondition');

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show('Failed to fetch Conditions');
				}
			});
		},
		fn_onCloseErrorDialog: function() {
			this._oErrorDialog.destroy();
			this._oErrorDialog = null;
			// this._oErrorDialog.close();
		},
		fnShowErrorDialog: function(message) {
			var oView = this.getView();
			var that = this;
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: message
			});
			that.getView().setModel(oErrorModel, "errorModel");

			if (!that._oErrorDialog) {
				that._oErrorDialog = sap.ui.xmlfragment(
					oView.getId(),
					"FSC360NEW.fragment.ErrorReuse",
					that
				);
				that.getView().addDependent(that._oErrorDialog);
			}
			that._oErrorDialog.open();

		},

		fn_search: function(oEvent) {
			var mes = this.fnSearch_validation();

			if (mes !== "") {
				this.fnShowErrorDialog(mes, "Agent Assignment Failed");
			} else if (mes === "") {
				var vPlant = this.getView().byId('id_plantr').getValue().split(' - ')[0];
				var vPlantFromdate = this.getView().byId("id_frompoDate").getValue();
				var vPlantTodate = this.getView().byId("id_EndpoDate").getValue();
				var vVendor = this.getView().byId('id_Vendor').getValue().split(' - ')[0];
				var vBoedt = this.getView().byId("id_BillEntryDate").getValue();
				var vCustom = this.getView().byId('id_Custom').getSelected();

				if (vCustom === true) {
					var vAgent = 'X';
				} else {
					var vAgent = '';
				}

				if (vBoedt == '') {
					var vBoedate = null;
				} else {
					vBoedate = vBoedt;
				}

				var aFilters = [];

				var vPOlen = this.getView().byId('id_PO').getSelectedItems().length;
				var vPOItems = this.getView().byId("id_PO").getSelectedItems();
				for (var i = 0; i < vPOlen; i++) {
					var vEbeln = vPOItems[i].getKey();
					var oFilter1 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, vEbeln);
					aFilters.push(oFilter1);
				}
				var vCondtlen = this.getView().byId('id_Condition').getSelectedItems().length;
				var vCondtItems = this.getView().byId("id_Condition").getSelectedItems();
				for (var i = 0; i < vCondtlen; i++) {
					var vCondtion = vCondtItems[i].getKey();
					var oFilter1 = new sap.ui.model.Filter("Kschl", FilterOperator.EQ, vCondtion);
					aFilters.push(oFilter1);
				}
				var oFilter1 = new Filter("Erdat", FilterOperator.BT, vPlantFromdate, vPlantTodate);
				aFilters.push(oFilter1);
				var oFilter1 = new Filter("Lifnr", FilterOperator.EQ, vVendor);
				aFilters.push(oFilter1);
				var oFilter1 = new Filter("Invdt", FilterOperator.BT, vBoedate);
				aFilters.push(oFilter1);
				var oFilter1 = new Filter("Werks", FilterOperator.EQ, Number(vPlant));
				aFilters.push(oFilter1);
				var oFilter1 = new Filter("Agent", FilterOperator.EQ, vAgent);
				aFilters.push(oFilter1);
				var vFlag = 'S';
				var oFilter2 = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, vFlag);
				aFilters.push(oFilter2);
				var vSTO = this.byId("id_STO").getSelected();
				if (vSTO) {
					aFilters.push(new sap.ui.model.Filter("Stpoflag", sap.ui.model.FilterOperator.EQ, 'X'));
				}
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
				var that = this;
				sap.ui.core.BusyIndicator.show();
				oModel.read("/AssignbcHeadSet", {
					filters: aFilters,

					success: function(oData, Response) {
						sap.ui.core.BusyIndicator.hide();
						if (!oData.results || oData.results.length === 0) {
							sap.m.MessageToast.show('No Data Found');
							return; // Stop further execution
						} else {
							that.getView().byId("id_FooterTool").setVisible(true);
						}
						if(oData.results.length > 5){
							that.getView().byId("idPaginationFooter").setVisible(true);
							var oPickPagination = that.getView().byId("fultabPick");
							var oMainPagination = that.getView().byId("fultab");
				
							if (oPickPagination) oPickPagination.setVisible(false);
							if (oMainPagination) oMainPagination.setVisible(true);
						}
						that.aFullJSBCData = oData.results;
						that.iCurrentPage = 1;
						that.iRowsPerPage = 5;
						that.updateJSBCPaginatedModel();

					},
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show('No Data Found'); //Added by manosankari 
					}
				});
			}
		},
		fnSuggestVendor: function(oEvent) {
			var vValue = oEvent.getParameter("suggestValue");
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Lifnr",
					sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter1 = new sap.ui.model.Filter("Name1",
					sap.ui.model.FilterOperator.Contains, vValue);
				var aFilter = new sap.ui.model.Filter([oFilter, oFilter1]);
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilter);
		},

		fnaccesiblechange: function(oEvent) {
			var vTable = this.getView().getModel("JSBCTable").getData();
			var vAmt = 0;
			var vDiff = 0;
			for (var i = 0; i < vTable.length; i++) {
				vAmt = Number(vAmt + vTable[i].AccessValue);
				vDiff = Number(vDiff + (vTable[i].Wrbtr - vTable[i].AccessValue));
			}
			this.getView().byId("id_TotalAllocatedAmnt").setValue(vAmt);
			this.getView().byId("id_TotalAllocatedDiff").setValue(vDiff);
		},

		fn_default_values: function() {
			var oView = this.getView();
			var bCustomSelected = oView.byId('id_Custom').getSelected();
			var oTable = bCustomSelected ? oView.byId('id_table_width') : oView.byId('id_table');
			if (oTable) {
				oTable.selectAll()
			}
		},

		fnSearch_validation: function() {
			var mes = "";

			var oView = this.getView();

			// Get values from fields
			var vPlant = oView.byId("id_plantr").getValue();
			var vVendor = oView.byId("id_Vendor").getValue();
			var oConditionMCB = oView.byId("id_Condition");
			var aSelectedConditions = oConditionMCB.getSelectedKeys();

			// Get checkbox states
			var bIsCustomSelected = oView.byId("id_Custom").getSelected();
			var bIsSTOSelected = oView.byId("id_STO").getSelected();

			// Validate Plant (always required)
			if (!vPlant) {
				mes = "Enter the Plant \n";
			}

			// Validate Vendor (skip when STO selected)
			if (!bIsSTOSelected && !vVendor) {
				mes += "Enter the Vendor \n";
			}

			// Validate Condition (only when Custom is NOT selected)
			if (!bIsCustomSelected && (!aSelectedConditions || aSelectedConditions.length === 0)) {
				mes += "Condition type is not selected \n";
			}

			return mes;
		},

		fn_assgbarcoderefresh: function() {
			location.reload();
		},
		onInvoiceFieldChange: function(oEvent) {

			const oTable = this.byId("id_table");
			const aSelectedIndices = this._selectedRows || [];

			if (aSelectedIndices.length >= 1) return;

			const oInput = oEvent.getSource();
			const oCtx = oInput.getBindingContext("JSBCTable");
			const oModel = this.getView().getModel("JSBCTable");
			if (!oCtx) return;

			const sPath = oCtx.getPath();

			let sField = "";
			const oBindingInfo = oInput.getBindingInfo("value");
			if (oBindingInfo?.parts?.length) {
				sField = oBindingInfo.parts[0].path;
			} else {

				return;
			}

			const sNewValue = oInput.getValue();

			aSelectedIndices.forEach(function(iRowIndex) {
				const sTargetPath = oTable.getContextByIndex(iRowIndex).getPath();
				if (sTargetPath !== sPath) {
					oModel.setProperty(sTargetPath + "/" + sField, sNewValue);
				}
			});
		},
		updateJSBCPaginatedModel: function() {
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFullJSBCData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "JSBCTable");
			this.renderJSBCPageNumbers(); // if you're rendering custom pagination buttons
			this.fn_default_values();
		},
		onNextJSBCPage: function() {
			var iTotalPages = Math.ceil(this.aFullJSBCData.length / this.iRowsPerPage);
			if (this.iCurrentPage < iTotalPages) {
				this.iCurrentPage++;
				this.updateJSBCPaginatedModel();
			}
		},

		onPreviousJSBCPage: function() {
			if (this.iCurrentPage > 1) {
				this.iCurrentPage--;
				this.updateJSBCPaginatedModel();
			}
		},
		renderJSBCPageNumbers: function() {
			var oPageBox = this.byId("idPageNumbersBox");
			oPageBox.removeAllItems();

			var iTotalPages = Math.ceil(this.aFullJSBCData.length / this.iRowsPerPage);
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
						that.updateJSBCPaginatedModel();
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

			var aPages = getPageNumbers(currentPage, iTotalPages);
			for (var i = 0; i < aPages.length; i++) {
				var page = aPages[i];
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
		action: function(oEvent) {
			this.onTableSelectionChange(oEvent); // add this call

		},
		onTableSelectionChange: function(oEvent) {
			var oTable = this.byId("id_table");
			var aSelectedIndices = oTable.getSelectedIndices();
			this._selectedRows = aSelectedIndices;

			var oModel = this.getView().getModel("JSBCTable");
			var aRows = oModel.getData();

			// Check if summary table exists before proceeding
			var oSummaryTable = sap.ui.getCore().byId("id_Sel_Table");
			if (!oSummaryTable) {

				return;
			}

			var oSummaryModel = oSummaryTable.getModel("LNSumm");
			var aSummaryData = oSummaryModel?.getProperty("/") || [];

			var totalWrbtr = 0;
			var totalAllocatedAmt = 0;
			var totalDifference = 0;

			var aSelectedIndicesMap = {};
			aSelectedIndices.forEach(function(index) {
				aSelectedIndicesMap[index] = true;
				var row = aRows[index];
				totalWrbtr += parseFloat(row.Wrbtr) || 0;
			});

			// Sum total invoice and difference from all summary items
			var totalInvoiceAmt = 0;
			var totalDeviationAmt = 0;
			aSummaryData.forEach(function(summaryRow) {
				totalInvoiceAmt += parseFloat(summaryRow.InvoiceAmt) || 0;
				totalDeviationAmt += parseFloat(summaryRow.Difference) || 0;
			});

			// Distribute invoice and deviation proportionally
			aRows.forEach(function(row, i) {
				if (aSelectedIndicesMap[i]) {
					var wrbtr = parseFloat(row.Wrbtr) || 0;
					var proportion = wrbtr / totalWrbtr;

					var allocatedAmt = parseFloat((proportion * totalInvoiceAmt).toFixed(2));
					var deviationAmt = parseFloat((proportion * totalDeviationAmt).toFixed(2));

					oModel.setProperty("/" + i + "/AllocatedAmt", allocatedAmt);
					oModel.setProperty("/" + i + "/Difference", deviationAmt);

					totalAllocatedAmt += allocatedAmt;
					totalDifference += deviationAmt;
				} else {
					oModel.setProperty("/" + i + "/AllocatedAmt", 0);
					oModel.setProperty("/" + i + "/Difference", 0);
				}
			});

			oModel.refresh(true);

			// Update input fields
			this.byId("id_TotalAllocatedAmnt")?.setValue(totalAllocatedAmt.toFixed(2));
			this.byId("id_TotalAllocatedDiff")?.setValue(totalDifference.toFixed(2));
		},

		fnInvSummChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var oContext = oInput.getBindingContext("LNSumm");

			if (!oContext) return;

			var oModel = oContext.getModel();
			var oRowData = oContext.getObject();

			var invoiceAmt = parseFloat(oRowData.InvoiceAmt) || 0;
			var liability = parseFloat(oRowData.Wrbtr) || 0;
			var deviation = liability - invoiceAmt;

			oModel.setProperty(oContext.getPath() + "/Difference", deviation);

			oModel.refresh(true);
		},
		fnSubmitSumm: function() {
			this.oSumm.close();

			const oTable = this.byId("id_table");
			const oTableModel = this.getView().getModel("JSBCTable");
			const aTableData = oTableModel.getProperty("/");

			const oSummaryTable = sap.ui.getCore().byId("id_Sel_Table");
			const oSummaryModel = oSummaryTable.getModel("LNSumm");
			const aSummaryData = oSummaryModel.getProperty("/");

			const aSelectedIndices = oTable.getSelectedIndices();

			aSummaryData.forEach(oSummaryRow => {
				const sKschl = oSummaryRow.Kschl;
				const nInvoiceAmt = parseFloat(oSummaryRow.InvoiceAmt) || 0;
				const nDeviation = parseFloat(oSummaryRow.Difference) || 0;

				// Find selected rows with matching Kschl
				const aMatchingItems = aSelectedIndices
					.map(index => {
						const oContext = oTable.getContextByIndex(index);
						const oRow = oContext.getObject();
						return {...oRow,
							_index: index
						};
					})
					.filter(row => row.Kschl === sKschl);

				const nTotalLiability = aMatchingItems.reduce((sum, item) => sum + (parseFloat(item.Wrbtr) || 0), 0);

				if (nTotalLiability === 0 || aMatchingItems.length === 0) return;

				aMatchingItems.forEach(item => {
					const nWrbtr = parseFloat(item.Wrbtr) || 0;
					const proportion = nWrbtr / nTotalLiability;

					// Split invoice and deviation
					const nAllocatedAmt = parseFloat((proportion * nInvoiceAmt).toFixed(2));
					const nSplitDeviation = parseFloat((proportion * nDeviation).toFixed(2));

					const sPath = "/" + item._index;
					oTableModel.setProperty(sPath + "/AllocatedAmt", nAllocatedAmt);
					oTableModel.setProperty(sPath + "/Difference", nSplitDeviation);
				});
			});

			oTableModel.refresh(true);

			// Update footer total (if applicable)
			this.onTableSelectionChange();
		},
		fnBarcodeupload: function() {

		},

		fnDifferenceChange: function(oEvent) {
			var oFormatter = AssbcAssignBarcode.model.formatter;
			var vNAmt = oEvent.getParameter("newValue");
			this.vAmount = Number(oEvent.getSource().getBindingContext("LNObd").getPath().split("/OBD/")[1]);
			var oTabModel = this.getView().getModel("LNObd");
			if (oTabModel) {
				var oTabData = oTabModel.getData().OBD;
				oTabData[this.vAmount].Difference = oFormatter.fnAmount(vNAmt);
				oTabModel.refresh(true);
			}
		},
		updatePaginatedModel: function() {
			var oFooter = this.getView().byId("idPaginationFooter");
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;
			if (!this.aFilteredData || !Array.isArray(this.aFilteredData)) {
				this.aFilteredData = [];
			}
			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "JSstatus");
			if (this.aFilteredData.length > 0) {
				oFooter.setVisible(true);
				// this.renderPageNumbers();
			} else {
				oFooter.setVisible(false);
			}
		},
		fn_Plant_Confrm: function() {
			this.fnPOChange();
		}

	});

});