sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter"
], function(Controller, Filter, FilterOperator, ) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	return Controller.extend("FSC360NEW.controller.MSME", {

		onInit: function() {

			var oViewModel = new sap.ui.model.json.JSONModel({
				showUpdate: true, // default visible
				showReport: false
			});
			this.getView().setModel(oViewModel, "JSView");
			this.fn_loadCompanyCodes();
			this.fnGetF4Help();
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oErrorModel, "errorModel");

			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");
			var oWarnModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oWarnModel, "warnModel");
			this.aFullData = [];
			this.iRowsPerPage = 7;
			this.iCurrentPage = 1;

			this.aFullDatare = [];
			this.iRowsPerPagere = 7;
			this.iCurrentPagere = 1;
			this.fnclearbutt();
			this.fnre_clearbutt();
			this.fn_LoadData();

		},
		fn_LoadData: function() {

			var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
			if (oKeyDataModel) {
				var oData = oKeyDataModel.getData();
				var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
				this.getView().setModel(oJSONUserName, "JSusername");
			}
		},
		onRadioChange: function(oEvent) {
			var sKey = oEvent.getSource().getSelectedIndex(); // 0 = Update, 1 = Report
			var oModel = this.getView().getModel("JSView");

			if (sKey === 0) { // Update
				oModel.setProperty("/showUpdate", true);
				oModel.setProperty("/showReport", false);
			} else { // Report
				oModel.setProperty("/showUpdate", false);
				oModel.setProperty("/showReport", true);
			}
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
					that.byId("idCCode").bindItems({
						path: "JSCCode>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSCCode>Bukrs}",
							text: "{JSCCode>Bukrs}"
								// additionalText: "{JSCCode>Butxt}" // if you have company name text
						})
					});
				},
				error: function() {
					sap.m.MessageBox.error("Error loading company codes");
				}
			});
		},
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			// To Get Vendor
			oModel.read("/KredaSet", {

				success: function(oData, oResponse) {

					var aVendorData = oData.results || [];

					// Flatten nested arrays if any
					if (Array.isArray(aVendorData[0])) {
						aVendorData = aVendorData.flat();
					}

					// Set JSON model (optional if you need it elsewhere)
					var oVendorModel = new sap.ui.model.json.JSONModel();
					oVendorModel.setData(aVendorData);
					that.getView().setModel(oVendorModel, 'JSVendor');

					// Get the Select control
					var oSelect = that.byId("id_Vendor");
					oSelect.destroyItems(); // clear existing items

					// Populate manually
					aVendorData.forEach(function(item) {
						oSelect.addItem(new sap.ui.core.Item({
							key: item.Lifnr,
							// text: item.Mcod1 + " - " + item.Lifnr  // same as your formatter
							text: item.Lifnr + " - " + item.Mcod1 // same as your formatter
						}));
					});

				},
				error: function(oResponse) {
					// sap.m.MessageBox.error('Http Error');
					that.openErrorDialog('Http Error');

				}

			});

		},
		fnre_search: function() {
			var oView = this.getView();

			var sVendor = oView.byId("id_Vendor").getSelectedKey();
			var sFromDate = oView.byId("id_fromdate").getDateValue();
			var sToDate = oView.byId("id_todate").getDateValue();

			var aFilters = [];

			if (sVendor) {
				aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sVendor));
			}

			// Convert JS Date → OData DateTime string
			function formatDateToOData(oDate) {
				if (!oDate) {
					return null;
				}
				var yyyy = oDate.getFullYear();
				var mm = String(oDate.getMonth() + 1).padStart(2, "0");
				var dd = String(oDate.getDate()).padStart(2, "0");
				return yyyy + "-" + mm + "-" + dd + "T00:00:00";
			}

			if (sFromDate && sToDate) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT,
					formatDateToOData(sFromDate), formatDateToOData(sToDate)));
			} else if (sFromDate) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.GE, formatDateToOData(sFromDate)));
			} else if (sToDate) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.LE, formatDateToOData(sToDate)));
			}

			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.read("/MsmeReportSet", {
				filters: aFilters,
				success: function(oData) {
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					oView.setModel(oJSON, "JSReport");
					// Update badge counter with number of rows
					var iLength = oData.results.length;

					var oBadge = oView.byId("id_badge_counter");
					if (oBadge) {
						oBadge.setText(iLength.toString());
					}
					var oTable = oView.byId("id_re_Table");
					if (iLength > 7) iRowCount = 7; // max 7 rows
					if (iLength < 1) iRowCount = 1;
					oTable.setVisibleRowCount(iLength);
					that.aFullDatare = oData.results; // all results
					that.aFilteredDatare = oData.results; // initially same (for pagination)
					that.iCurrentPagere = 1; // reset to page 1	 
					// Call pagination method
					that.updatePaginatedModelre();

				},
				error: function(oError) {
					sap.m.MessageToast.show("Error while fetching report data");

				}
			});
		},
	
		fnre_clearbutt: function() {
			var oView = this.getView();

			// --- Clear Vendor "From" ComboBox ---
			var oVendorCombo = oView.byId("id_Vendor");
			if (oVendorCombo) {
				oVendorCombo.setSelectedKey("");
				oVendorCombo.setValue("");
			}

			// --- Clear Vendor "To" ComboBox ---
			var oVendorComboTo = oView.byId("id_Vendorto");
			if (oVendorComboTo) {
				oVendorComboTo.setSelectedKey("");
				oVendorComboTo.setValue("");
			}

			// --- Clear From Date ---
			var oFromDate = oView.byId("id_fromdate");
			if (oFromDate) {
				oFromDate.setValue("");
			}

			// --- Clear To Date ---
			var oToDate = oView.byId("id_todate");
			if (oToDate) {
				oToDate.setValue("");
			}

			// --- Reset internal arrays used for pagination ---
			this.aFullDatare = [];
			this.aFilteredDatare = [];
			this.iCurrentPagere = 1;

			// --- Clear the Report model ---
			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			oView.setModel(oEmptyModel, "JSReport");

			// --- Reset the badge counter to 0 ---
			var oBadge = oView.byId("id_badge_counter");
			if (oBadge) {
				oBadge.setText("0");
			}

			// --- Clear the table content visually ---
			var oTable = oView.byId("id_re_Table");
			if (oTable) {
				oTable.clearSelection();
				oTable.setVisibleRowCount(7);
			}

			// --- Clear page number buttons ---
			var oPageBox = oView.byId("idPageNumbersBoxre");
			if (oPageBox) {
				oPageBox.removeAllItems();
			}

			// --- Hide Previous and Next buttons ---
			var oPrevBtn = oView.byId("previousre");
			var oNextBtn = oView.byId("nextre");
			if (oPrevBtn) oPrevBtn.setVisible(false);
			if (oNextBtn) oNextBtn.setVisible(false);

		},

		fn_search: function() {
			var vCocd = this.getView().byId("idCCode").getValue();

			var vVendorFrom = this.getView().byId("idvendorFrom").getSelectedKey();

			var vVendorTo = this.getView().byId("idvendorTo").getSelectedKey();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oGlobalBusyDialog.open();
			oModel.read("/MsmeUpdateSet", {
				filters: [
					new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.BT, vVendorFrom, vVendorTo),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, vCocd),
					new sap.ui.model.Filter("Message", sap.ui.model.FilterOperator.EQ, 'Search')
				],
				success: function(oData) {
					oGlobalBusyDialog.close();
					if (oData.results.length > 0) {
						that.getView().byId("id_submit").setVisible(true);
						that.getView().byId("id_search").setVisible(false);
						that.aFullData = oData.results; // all results
						that.aFilteredData = oData.results; // initially same (for pagination)
						that.iCurrentPage = 1; // reset to page 1

						// Call pagination method
						that.updatePaginatedModel();
						// Set data in the JSON model
						var oJSONModel = new sap.ui.model.json.JSONModel();
						oJSONModel.setData(oData.results);
						that.getView().setModel(oJSONModel, "MsmeModel");
						var oTable = that.getView().byId("id_MsmeTable");
						var iLength = oData.results.length;

						if (iLength > 7) iRowCount = 7; // max 7 rows
						if (iLength < 1) iRowCount = 1; // min 2
						oTable.setVisibleRowCount(iLength);

						// **Update the count text**
						that.getView().byId("LabTabSFRTitle").setText(oData.results.length.toString());
					} else {
						// If no results, optionally set count to 0
						that.getView().byId("LabTabSFRTitle").setText("0");
					}
				},
				error: function(oError) {
					oGlobalBusyDialog.close();

				}
			});

		},
		fn_Submit: function(oEvent) {
			var oTable = this.byId("id_MsmeTable");
			var aIndices = oTable.getSelectedIndices();
			var oContext;
			var oLifnr, oEmail;
			var vArr_Msme = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var vSt_Msme;
			var hasError = false; // Flag to check if any row has Type 'E'

			if (aIndices.length === 0) {
				// sap.m.MessageBox.warning("Please select at least one row");
				this.openwarnDialog("Please select at least one row")
			} else {
				for (var i = 0; i < aIndices.length; i++) {
					oContext = oTable.getContextByIndex(aIndices[i]);

					// Check if Type is 'E'
					if (oContext.getObject().Type === 'E') {
						hasError = true;
						break; // Exit the loop early if an error is found
					}

					oLifnr = oContext.getObject().Lifnr;
					vSt_Msme = {
						"Lifnr": oContext.getObject().Lifnr,
						"Name1": oContext.getObject().Name1,
						"Email": oContext.getObject().Email,
						"Gjahr": oContext.getObject().Gjahr,
						"Brsch": oContext.getObject().Brsch
					};
					vArr_Msme.push(vSt_Msme);
				}

				if (hasError) {
					// Set the error message in the model
					this.getView().getModel("errorModel").setProperty("/message", "Please select the correct line items without errors.");

					// Load and open the error dialog
					if (!this._errorDialog) {
						this._errorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ErrorReuse", this);
						this.getView().addDependent(this._errorDialog);
					}
					this._errorDialog.open();

					return;
				}
				oGlobalBusyDialog.open();
				var oEntity = {};
				oEntity.NavMsmeUpdate = vArr_Msme;

				oModel.create("/MsmeUpdateSet", oEntity, {
					success: function(oData) {
						oGlobalBusyDialog.close();

						if (oData.Type == 'E') {
							// sap.m.MessageBox.error(oData.Message);
							var errmsg = oData.Message;
							this.openErrorDialog(errmsg);
						} else {
							// Set the success message in the model
							this.getView().getModel("successModel").setProperty("/message", "Mail triggered successfully.");

							// Load and open the success dialog
							if (!this._successDialog) {
								this._successDialog = sap.ui.xmlfragment("FSC360NEW.fragment.SuccessReuse", this);
								this.getView().addDependent(this._successDialog);
							}
							this._successDialog.open();
						}
					}.bind(this),
					error: function(oError) {
						oGlobalBusyDialog.close();
						// sap.m.MessageBox.error("Update failed.");
						this.openErrorDialog(' Update failed.');
					}
				});
			}
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
			if (this._errorDialog) {
				this._errorDialog.close();
				this._errorDialog.destroy();
				this._errorDialog = null;
			}
		},
		fn_closeSuccess: function() {
			if (this._successDialog) {
				this._successDialog.close();
				this._successDialog.destroy();
				this._successDialog = null;
			}
		},

		fnclearbutt: function() {
			var oView = this.getView();

			// Hide submit, show search
			oView.byId("id_submit").setVisible(false);
			oView.byId("id_search").setVisible(true);

			// Clear filter inputs
			oView.byId("idCCode").setValue('');
			oView.byId("idvendorFrom").setValue('');
			oView.byId("idvendorTo").setValue('');

			// Reset internal data used for pagination
			this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;

			// Clear the model bound to the table
			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			oView.setModel(oEmptyModel, "MsmeModel");

			// Reset table count and clear visible rows
			var oTable = oView.byId("id_MsmeTable");
			oTable.setVisibleRowCount(7);
			oTable.clearSelection();

			// Reset the count badge to 0
			oView.byId("LabTabSFRTitle").setText("0");

			// Optionally clear pagination buttons (if created dynamically)
			if (oView.byId("idPageNumbersBox")) {
				oView.byId("idPageNumbersBox").removeAllItems();
			}
			var oPrevBtn = oView.byId("previous");
			var oNextBtn = oView.byId("next");
			if (oPrevBtn) oPrevBtn.setVisible(false);
			if (oNextBtn) oNextBtn.setVisible(false);
		},
		onSelectionChange: function(oEvent) {
			var c = 0;
		},
		removeLeadingZeros: function(sValue) {
			if (!sValue) {
				return "";
			}
			return sValue.replace(/^0+/, ""); // removes all leading zeros
		},
		openwarnDialog: function(sMessage) {
			var oView = this.getView();

			// Set dynamic message
			oView.getModel("warnModel").setProperty("/message", sMessage);

			// Load fragment only once
			if (!this.warnDialog) {
				this.warnDialog = sap.ui.xmlfragment(oView.getId(), "FSC360NEW.Fragment.WarningReuse", this);
				oView.addDependent(this.warnDialog);
			}

			this.warnDialog.open();
		},
		fn_closewarn: function() {
			if (this.warnDialog) {
				// this.ErrorDialog.close();
				this.warnDialog.destroy();
				this.warnDialog = null;
			}
		},
		updatePaginatedModel: function() {
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "MsmeModel");
			this.renderPageNumbers();
			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage);

			var oPrevBtn = this.byId("previous");
			var oNextBtn = this.byId("next");

			if (oPrevBtn) {
				oPrevBtn.setVisible(this.iCurrentPage > 1);
			}
			if (oNextBtn) {
				oNextBtn.setVisible(this.iCurrentPage < iTotalPages);
			}
		},
		onNextPage: function() {
			var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			if (this.iCurrentPage < iTotalPages) {
				this.iCurrentPage++;
				this.updatePaginatedModel();
			}
		},
		onPreviousPage: function() {
			if (this.iCurrentPage > 1) {
				this.iCurrentPage--;
				this.updatePaginatedModel();
			}
		},
		renderPageNumbers: function() {
			var oPageBox = this.byId("idPageNumbersBox");
			oPageBox.removeAllItems();
			this.getView().byId("LabTabSFRTitle").setText(parseInt(this.aFilteredData.length));
			// var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage); // 
			if (iTotalPages <= 1) {

				return;
			}
			var currentPage = this.iCurrentPage;
			var that = this;

			function getPageNumbers(currentPage, totalPages) {
				var pages = [];

				if (totalPages <= 7) {
					// Show all if few pages
					for (var i = 1; i <= totalPages; i++) {
						pages.push(i);
					}
				} else {
					if (currentPage <= 2) {
						// Show first 3, ellipsis, and last 3
						pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
					} else if (currentPage >= totalPages - 1) {
						// Show first 3, ellipsis, and last 3
						pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
					} else {
						// Show start, ellipsis, middle 3, ellipsis, end
						pages.push(1, "...");
						pages.push(currentPage - 1, currentPage, currentPage + 1);
						pages.push("...", totalPages);
					}
				}

				// Remove duplicates and keep order
				return [...new Set(pages)];
			}

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.updatePaginatedModel();
					},
					// Add a custom class to all buttons
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

					var oVBox = new sap.m.VBox({
						items: [oText],
						justifyContent: "Start", // Align content to the top
						alignItems: "Center", // Center horizontally
						height: "32px" // Optional: control total height
					});

					oPageBox.addItem(oVBox);
				} else {
					addPageButton(page);
				}

			}
		},

		updatePaginatedModelre: function() {
			var iStart = (this.iCurrentPagere - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredDatare.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "JSReport");
			this.renderPageNumbersre();
			var iTotalPages = Math.ceil(this.aFilteredDatare.length / this.iRowsPerPage);

			var oPrevBtn = this.byId("previousre");
			var oNextBtn = this.byId("nextre");

			if (oPrevBtn) {
				oPrevBtn.setVisible(this.iCurrentPagere > 1);
			}
			if (oNextBtn) {
				oNextBtn.setVisible(this.iCurrentPagere < iTotalPages);
			}
		},
		onNextPagere: function() {
			var iTotalPages = Math.ceil(this.aFullDatare.length / this.iRowsPerPage);
			if (this.iCurrentPagere < iTotalPages) {
				this.iCurrentPagere++;
				this.updatePaginatedModelre();
			}
		},
		onPreviousPagere: function() {
			if (this.iCurrentPagere > 1) {
				this.iCurrentPagere--;
				this.updatePaginatedModelre();
			}
		},
		renderPageNumbersre: function() {
			var oPageBox = this.byId("idPageNumbersBoxre");
			oPageBox.removeAllItems();
			this.getView().byId("id_badge_counter").setText(parseInt(this.aFilteredDatare.length));
			// var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			var iTotalPages = Math.ceil(this.aFilteredDatare.length / this.iRowsPerPage); // 
			if (iTotalPages <= 1) {

				return;
			}
			var currentPage = this.iCurrentPagere;
			var that = this;

			function getPageNumbers(currentPage, totalPages) {
				var pages = [];

				if (totalPages <= 7) {
					// Show all if few pages
					for (var i = 1; i <= totalPages; i++) {
						pages.push(i);
					}
				} else {
					if (currentPage <= 2) {
						// Show first 3, ellipsis, and last 3
						pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
					} else if (currentPage >= totalPages - 1) {
						// Show first 3, ellipsis, and last 3
						pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
					} else {
						// Show start, ellipsis, middle 3, ellipsis, end
						pages.push(1, "...");
						pages.push(currentPage - 1, currentPage, currentPage + 1);
						pages.push("...", totalPages);
					}
				}

				// Remove duplicates and keep order
				return [...new Set(pages)];
			}

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.updatePaginatedModel();
					},
					// Add a custom class to all buttons
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

					var oVBox = new sap.m.VBox({
						items: [oText],
						justifyContent: "Start", // Align content to the top
						alignItems: "Center", // Center horizontally
						height: "32px" // Optional: control total height
					});

					oPageBox.addItem(oVBox);
				} else {
					addPageButton(page);
				}

			}
		}

	});

});