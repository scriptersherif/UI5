sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var oCreditJson;
	var oModelCC;
	var gQueid;
	var Ind;
	var aLocJson = {
		"credit": []
	};
	return Controller.extend("FSC360NEW.controller.creditNote", {

		onInit: function() {
			var oView = this.getView();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRoutePatternMatched(this.fnHandleCredit, this);
			this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(oView, function() {
				this._applyFlexGrow();
			}.bind(this));
			var oView = this.getView();
			var currentYear = new Date().getFullYear();
			var aYears = [];
			var aType = [];

			for (var i = 0; i < 30; i++) {
				aYears.push({
					Year: (currentYear - i).toString()
				});
			}
			aType.push({
				Type: "Credit Memo"
			});
			aType.push({
				Type: "Subsequent Credit"
			});
			aType.push({
				Type: "Subsequent Debit"
			});

			var oYearModel = new sap.ui.model.json.JSONModel({
				results: aYears
			});
			var oTypeModel = new sap.ui.model.json.JSONModel({
				results: aType
			});
			oView.setModel(oTypeModel, "JSType")
			oView.setModel(oYearModel, "JSYear");
			var oComboBox = this.byId("id_typesel");
			oComboBox.setSelectedKey("Credit Memo");
			Ind = "M";
			var oVisibilityModel = new sap.ui.model.json.JSONModel({
				Qty: true,
				Amt: false
			});
			this.getView().setModel(oVisibilityModel, "JSVisibility");
			setTimeout(() => {
				var oField = this.getView().byId("id_grn");
				if (oField && oField.getFocusDomRef()) {
					oField.focus();
				}
			}, 200);
		},
		fnHandleCredit: function(oEvent) {
			var oView = this.getView();
			sap.ui.core.BusyIndicator.hide();

			var oModelCC = this.getView().getModel();
			oCreditJson = new sap.ui.model.json.JSONModel();
			oCreditJson.setData(aLocJson);
			oCreditJson.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oView.setModel(oCreditJson, "JSBCTable");

			// oView.byId("id_matDoc").setValue("");
			// oView.byId("fileUploader").setValue("");
			// oView.byId("id_FisicalYr").setValue("");
			// oView.byId("id_invdt").setDateValue(new Date());
			// //oView.byId("id_movType").setValue("");
			// oView.byId("id_comment").setValue("");
			// oView.byId("id_RbSelect").setSelectedIndex(0);
			oCreditJson.setData({});

			var oModelCC = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oModelCC.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oView.setModel(oModelCC);
		},
		onGrnValueHelp: function(oEvent) {
			var that = this;
			// var oInput = oEvent.getSource();
			// var oContext = oInput.getBindingContext("JSGoods");
			// var sPath = oContext.getPath();
			var sBukrs = 6000;

			if (!sBukrs) {
				sap.m.MessageToast.show("Please select Company Code first");
				return;
			}

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oGlobalBusyDialog.open();

			oModel.read("/GrnlistSet", {
				filters: [new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs)],
				success: function(oData) {
					oGlobalBusyDialog.close();

					if (!oData.results || oData.results.length === 0) {
						sap.m.MessageBox.warning("No GRN numbers found for the selected company.");
						return;
					}

					// Always create new dialog per click to prevent old bindings
					var oGrnDialog = new sap.m.SelectDialog({
						title: "Select GRN Number",
						search: function(evt) {
							var sValue = evt.getParameter("value");
							var oFilter = new sap.ui.model.Filter("Mblnr", sap.ui.model.FilterOperator.Contains, sValue);
							evt.getSource().getBinding("items").filter([oFilter]);
						},
						liveChange: function(evt) {
							var sValue = evt.getParameter("value");
							var oFilter = new sap.ui.model.Filter("Mblnr", sap.ui.model.FilterOperator.Contains, sValue);
							evt.getSource().getBinding("items").filter([oFilter]);
						},
						confirm: function(evt) {
							var oSelected = evt.getParameter("selectedItem");
							if (oSelected) {
								var oSelData = oSelected.getBindingContext().getObject();
								// var sel = that.getView().byId("id_grn");
								var oModel1 = new sap.ui.model.json.JSONModel(oSelData);
								that.getView().setModel(oModel1, "JSGoods");
								that.getView().byId("id_grn").setValueState("None");
								that.getView().byId("id_fiscalYearCombo").setValueState("None");
								that.getView().byId("id_fiscalYearCombo").addStyleClass("cl_combo_transBar");
								that.getView().byId("id_fiscalYearCombo").removeStyleClass("cl_combo_transBarerror");
								// that.getView().getModel("JSGoods").setProperty("/Mblnr", oSelData.Mblnr);
								// 	var oTableModel = that.getView().getModel("JSGoods");
								// 	var oRowData = oTableModel.getProperty(sPath);

								// 	// Update GRN & Year only for this row
								// 	oRowData.Mblnr = oSelData.Mblnr;
								// 	oRowData.Gjahr = oSelData.Mjahr;
								// 	oTableModel.setProperty(sPath, oRowData);

								// 	sap.m.MessageToast.show("GRN selected: " + oSelData.Mblnr);
							}
							oGrnDialog.destroy(); // Destroy after use
						},
						cancel: function() {
							oGrnDialog.destroy(); // destroy even if cancelled
						}
					});

					var oItemTemplate = new sap.m.StandardListItem({
						title: "{Mblnr}",
						description: "{Mjahr}"
					});

					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
					oGrnDialog.setModel(oJSONModel);
					oGrnDialog.bindAggregation("items", "/", oItemTemplate);

					oGrnDialog.open();
				},
				error: function() {
					oGlobalBusyDialog.close();
					sap.m.MessageBox.error("Failed to load GRN list. Please try again later.");
				}
			});
		},
		_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".formInputB1").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});
			$view.find(".formInputB01").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.minWidth = "50%";
				}
			});
			$view.find(".formInputBw").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

			$view.find(".cl_combo_transBar").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

			$view.find(".cl_combo_transBarw").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

		},
		fnPressSearch: function() {
			if (Ind === "M" || Ind === "D" || Ind === "C") {
				this.submit = false;
				var oView = this.getView();
				this.vMatDoc = this.getView().byId("id_grn").getValue();
				this.vFisYr = this.getView().byId("id_fiscalYearCombo").getValue();
				if (this.vMatDoc.length == 0) {
					this.getView().byId("id_grn").setValueState("Error").setValueStateText("Please Enter GRN number!");
				}
				if (this.vFisYr.length == 0) {
					this.getView().byId("id_fiscalYearCombo").removeStyleClass("cl_combo_transBar");
					this.getView().byId("id_fiscalYearCombo").addStyleClass("cl_combo_transBarerror");
					this.getView().byId("id_fiscalYearCombo").setValueState("Error").setValueStateText("Please Enter Document (fiscal) Year !");
				}
				if (this.vMatDoc.length != 0 && this.vFisYr.length != 0) {
					this.fnGetData();
					this.submit = true;
				}
			} else {
				sap.m.MessageToast.show("Please Enter Valid Document Type...");
			}
		},
		/* ================================================================================ *
		 * ============== Getting Data From Database ====================================== */
		fnGetData: function() {
			var oModelCC = this.getView().getModel();
			var oView = this.getView();
			var oController = this;
			var fnSuccess = function(oData, oResponse) {
				if (oData.results.length > 0) {
					if (oData.results[0].Bukrs.length == 0) {
						oView.byId("id_grn").setValueState("Error").setValueStateText(oData.results[0].Message);
						oCreditJson.setData({});
						//oController.fnSetTitle();
					} else {
						for (var i = 0; i < oData.results.length; i++) {
							oData.results[i].Edmbtr = parseInt(oData.results[i].Edmbtr).toFixed(2);
							oData.results[i].Emenge = parseInt(oData.results[i].Emenge).toFixed(2);
							if (Ind === "M") {

							} else if (Ind === "D") {
								oData.results[i].Emenge = parseInt(oData.results[i].Menge).toFixed(2);
							} else if (Ind === "C") {
								oData.results[i].Emenge = parseInt(oData.results[i].Menge).toFixed(2);
							}
						}
						aLocJson = oData.results;
						oController.fnSetTable(oData.results);
						oCreditJson.setData(aLocJson);
						oCreditJson.refresh();
						// oView.byId("id_toolbar").setVisible(true);
						oView.byId("id_title").setText(oData.results[0].Name1 + " ( " + oData.results[0].Werks + " )");

						oController.lifnr = oData.results[0].Lifnr;
						oController.Werks = oData.results[0].Werks;
					}
				} else {
					oCreditJson.setData({});
					sap.m.MessageToast.show("No Data Found");
					//oController.fnSetTitle();
				}

			};
			var fnFail = function() {

			};
			oModelCC.read("/CreditControlSet", {
				filters: [
					new sap.ui.model.Filter("Mblnr", sap.ui.model.FilterOperator.EQ, this.vMatDoc),
					new sap.ui.model.Filter("Mjahr", sap.ui.model.FilterOperator.EQ, this.vFisYr),
					new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, Ind)
				],
				success: fnSuccess,
				error: fnFail
			});
		},
		fnSetTable: function(aArray) {
			var oTable = this.getView().byId("id_table");
			for (var i = 0; i < aArray.length; i++) {
				// oTable.getRows()[i].getCells()[5].setValueState("None");
			}
			this.submit = true;
		},
		fnSelectRB: function(oEvent) {
			this.getView().byId("id_grn").setValueState("None");
			this.getView().byId("id_fiscalYearCombo").setValueState("None");
			var oView = this.getView();

			var vSelected = oView.byId("id_posel").getSelectedButton().getText();
			if (vSelected === "Quantity") {
				this.getView().byId("id_grnqty").setVisible(true);
				this.getView().byId("id_rtnqty").setVisible(true);
				this.getView().byId("id_grnedit").setVisible(true);
				this.getView().byId("id_grnamt").setVisible(true);
				this.getView().byId("id_currency").setVisible(true);
				// this.getView().byId("id_grnedit").setVisible(false);
				// this.getView().byId("id_grnamt").setVisible(false);
				// this.getView().byId("id_currency").setVisible(false);
				this.getView().byId("id_uom").setVisible(true);
			} else if (vSelected === "Value") {
				this.getView().byId("id_grnqty").setVisible(true);
				this.getView().byId("id_rtnqty").setVisible(true);
				this.getView().byId("id_uom").setVisible(true);
				// this.getView().byId("id_grnqty").setVisible(false);
				// this.getView().byId("id_rtnqty").setVisible(false);
				// this.getView().byId("id_uom").setVisible(false);
				this.getView().byId("id_grnedit").setVisible(true);
				this.getView().byId("id_grnamt").setVisible(true);
				this.getView().byId("id_currency").setVisible(true);
			}
		},
		fnclearbutt: function() {
			this.getView().byId("id_textarea").setValue("");
			this.getView().byId("id_title").setText("");
			this.getView().byId("id_grn").setValueState("None");
			this.getView().byId("id_fiscalYearCombo").setValueState("None");
			this.getView().byId("id_invno").setValueState("None");
			this.getView().byId("id_grn").setValue("");
			this.getView().byId("id_fiscalYearCombo").setValue("");
			this.getView().byId("id_invno").setValue("");
			this.getView().byId("id_invdt").setValue("");
			this.getView().byId("fileUploader").setValue("");
			var oRadioGroup = this.byId("id_posel"); // Assuming "myRadioGroup" is the ID of your RadioButtonGroup
			oRadioGroup.setSelectedIndex(0);
			this.getView().byId("id_grnqty").setVisible(true);
			this.getView().byId("id_rtnqty").setVisible(true);
			// this.getView().byId("id_grnedit").setVisible(false);
			// this.getView().byId("id_grnamt").setVisible(false);
			// this.getView().byId("id_currency").setVisible(false);
			this.getView().byId("id_grnedit").setVisible(true);
			this.getView().byId("id_grnamt").setVisible(true);
			this.getView().byId("id_currency").setVisible(true);
			this.getView().byId("id_uom").setVisible(true);
			this.submit = false;
			this.getView().byId("id_fiscalYearCombo").addStyleClass("cl_combo_transBar");
			this.getView().byId("id_fiscalYearCombo").removeStyleClass("cl_combo_transBarerror");
			var oComboBox = this.byId("id_typesel");
			oComboBox.setSelectedKey("Credit Memo");
			Ind = "M";
			var oVisibilityModel = new sap.ui.model.json.JSONModel({
				Qty: true,
				Amt: false
			});
			oCreditJson.setData({});
		},
		fnclearbutt1: function() {
			this.getView().byId("id_textarea").setValue("");
			this.getView().byId("id_title").setText("");
			this.getView().byId("id_grn").setValueState("None");
			this.getView().byId("id_fiscalYearCombo").setValueState("None");
			this.getView().byId("id_invno").setValueState("None");
			this.getView().byId("id_grn").setValue("");
			this.getView().byId("id_fiscalYearCombo").setValue("");
			this.getView().byId("id_invno").setValue("");
			this.getView().byId("id_invdt").setValue("");
			this.getView().byId("fileUploader").setValue("");
			var oRadioGroup = this.byId("id_posel"); // Assuming "myRadioGroup" is the ID of your RadioButtonGroup
			oRadioGroup.setSelectedIndex(0);
			this.getView().byId("id_grnqty").setVisible(true);
			this.getView().byId("id_rtnqty").setVisible(true);
			// this.getView().byId("id_grnedit").setVisible(false);
			// this.getView().byId("id_grnamt").setVisible(false);
			// this.getView().byId("id_currency").setVisible(false);
			this.getView().byId("id_grnedit").setVisible(true);
			this.getView().byId("id_grnamt").setVisible(true);
			this.getView().byId("id_currency").setVisible(true);
			this.getView().byId("id_uom").setVisible(true);
			this.submit = false;
			this.getView().byId("id_fiscalYearCombo").addStyleClass("cl_combo_transBar");
			this.getView().byId("id_fiscalYearCombo").removeStyleClass("cl_combo_transBarerror");
			oCreditJson.setData({});
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
		/* ================================================================================ *
		 * ============== Changing Value State Of Input Box =============================== */
		fnChangeState: function(oEvent) {
			var oView = this.getView();
			oEvent.getSource().setValueState("None");
			var vValue = oEvent.getSource().getValue();
			var flag = 0;
			/*if(isNaN(vValue)){
			  oEvent.getSource().setValue("");
			}*/
			var vFormatValue = vValue.replace(/\D/g, '')

			if (isNaN(vValue)) {
				oEvent.getSource().setValue(vFormatValue);
			}

			try {
				var vQId = oEvent.getSource().getId();
				var vQId1 = vQId.split("__xmlview2--")[1];
				vQid = vQId1.split("-__clone239")[0];
				if (vQid == "id_rtnqty1") {
					var vRowNo = oEvent.getSource().getId();

					try {
						var vRowNo1 = vRowNo.split("__component0---ViewCreditNote--id_credit-col5-row")[1];
						flag = 1;
						debugger;
					} catch (e) {
						flag = 0;
					}
				}
				if (vQId.includes("id_rtnqty1")) {
					//var vRowNo = oEvent.getSource().getId();

					try {
						var path = oEvent.getSource().getBindingContext('JSBCTable').getPath();
						var vRowNo1 = path.split("/credit/")[1];
						flag = 1;
						debugger;
					} catch (e) {
						flag = 0;
					}
				}
			} catch (e) {

			}

			if (vQId.includes("id_rtnqty1")) {
				//var vRowNo = oEvent.getSource().getId();

				try {
					var path = oEvent.getSource().getBindingContext('JSBCTable').getPath();
					var vRowNo1 = path.split("/")[1];
					flag = 1;
					debugger;
				} catch (e) {
					flag = 0;
				}
			} else if (vQId.includes("id_grnedit1")) {
				try {
					var path = oEvent.getSource().getBindingContext('JSBCTable').getPath();
					var vRowNo1 = path.split("/")[1];
					flag = 1;
					debugger;
				} catch (e) {
					flag = 0;
				}
			}

			if (flag == 1) {
				var vLength = oView.getModel("JSBCTable").oData.length;
				for (var i = 0; i < vLength; i++) {
					if (i == vRowNo1) {
						var vDmbtr = oView.getModel("JSBCTable").oData[i].Dmbtr;
						var vMenge = oView.getModel("JSBCTable").oData[i].Menge;
						var vEmenge = oView.getModel("JSBCTable").oData[i].Emenge;
						var vEdmbtr = oView.getModel("JSBCTable").oData[i].Edmbtr;
						this.getView().byId(vQId).setValueState("None");
						if (parseFloat(vMenge) > parseFloat(vEmenge) && parseFloat(vDmbtr) > parseFloat(vEdmbtr)) {
							if (vQId.includes("id_rtnqty1")) {
								var vNewQty = oEvent.getSource().getValue();
								var vAmount1 = (parseFloat(vDmbtr) / parseInt(vMenge));
								vAmount1 = vAmount1 * vNewQty;
								vAmount1 = parseFloat(vAmount1).toFixed(2);
								oView.getModel("JSBCTable").oData[i].Edmbtr = vAmount1;
								oCreditJson.refresh(true);
							}
						} else {
							if (parseFloat(vMenge) < parseFloat(vEmenge)) {
								oView.getModel("JSBCTable").oData[i].Edmbtr = 0.00;
								oCreditJson.refresh(true);
								this.getView().byId(vQId).setValueState("Error");
								this.getView().byId(vQId).setValueStateText("Credit Quantity Cannot be greater than the GRN Quantity!");
							} else if (parseFloat(vDmbtr) < parseFloat(vEdmbtr)) {
								oCreditJson.refresh(true);
								this.getView().byId(vQId).setValueState("Error");
								this.getView().byId(vQId).setValueStateText("Amount Should not be greater than GRN Amount!");
							}
						}
					}
				}
			}

		},
		fnChangeValue: function(oEvent) {
			var vValue = oEvent.getSource().getValue();
			var vAmount = parseInt(vValue).toFixed(2);
			var vQId = oEvent.getSource().getId();
			this.getView().byId(vQId).setValue(vAmount);
		},
		fnLiveComment: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		fn_sortByQueid: function() {
			if (!(oCreditJson.getData()) || !Array.isArray(oCreditJson.getData())) {
				// sap.m.MessageBox.error("No data to sort.");
				this.openErrorDialog('No data to sort');
				return;
			}

			// Set default to ascending (up arrow) on first click
			if (this._bSortDescending === undefined) {
				this._bSortDescending = false; // false means ascending by your code
			} else {
				// Toggle on every click after first
				this._bSortDescending = !this._bSortDescending;
			}

			// Sort data based on current flag
			oCreditJson.getData().sort(function(a, b) {
				return this._bSortDescending ? b.Matnr.localeCompare(a.Matnr) // descending
					: a.Matnr.localeCompare(b.Matnr); // ascending
			}.bind(this));

			// Update icon accordingly
			var oIcon = this.byId("qidSortIcon");
			if (oIcon) {
				var sIconSrc = this._bSortDescending ? "Images/arrow-down.svg" : "Images/arrow-up.svg";
				oIcon.setSrc(sIconSrc);
			}
			oCreditJson.refresh(true);

			// this.iCurrentPage = 1;
			// this.fn_updatePaginatedModel();
		},
		fn_onYearSelect: function(oEvent) {
			oEvent.getSource().setValueState("None");
			this.getView().byId("id_fiscalYearCombo").addStyleClass("cl_combo_transBar");
			this.getView().byId("id_fiscalYearCombo").removeStyleClass("cl_combo_transBarerror");
		},
		fnPressSubmit: function() {
			var oView = this.getView();
			var vOption = oView.byId("id_posel").getSelectedButton().getText();
			if (this.submit == true) {
				this.fnCheckCell(vOption);
			} else {
				this.fnPressSearch();
			}

		},
		/* ================================================================================ *
		 * ============== Validating Cell for Atleast One User Input ====================== */
		fnCheckCell: function(vOption) {
			var oModelCC = this.getView().getModel();
			var oView = this.getView();
			var aCredit = oView.getModel("JSBCTable").getData();
			var oTable = oView.byId("id_table").getRows();
			var vQty = false,
				vVal = false;
			var vCell = aCredit.length - 1;
			this.fnSetTable(aCredit);
			for (var i = 0; i < aCredit.length;) {
				if (Ind === "M") {
					/*if(parseInt(oTable[i].getCells()[5].getValue())== 0){*/
					if (parseInt(aCredit[i].Emenge) == 0) {
						i++;
						vQty = true;
					} else {
						vQty = false;
						break;
					}
				} else if (Ind === "C" || Ind === "D") {
					/*if(parseInt(oTable[i].getCells()[5].getValue())== 0){*/
					if (parseInt(aCredit[i].Edmbtr) == 0) {
						i++;
						vVal = true;
					} else {
						vVal = false;
						break;
					}
				}
			}
			if (vQty == true) {
				oView.byId("id_table").getRows()[vCell].getCells()[5].setValueState("Error");
				oView.byId("id_table").getRows()[vCell].getCells()[5].setValueState("Error").setValueStateText(
					"Please Enter Credit Quantity For Atleast One Record ! ");
				sap.m.MessageToast.show("Please Enter Credit Quantity For Atleast One Record !");
			} else if (vVal == true) {
				oView.byId("id_table").getRows()[vCell].getCells()[7].setValueState("Error").setValueStateText("Amount Should Not Be Empty !");
				sap.m.MessageToast.show("Amount Should Not Be Empty !");
			} else {
				this.fnValidate(vOption);
			}
		},
		/* ================================================================================ *
		 * ============== Validating The Cells  =========================================== */
		fnValidate: function(vOption) {
			var oModelCC = this.getView().getModel();
			var oView = this.getView();
			var aCredit = oView.getModel("JSBCTable").getData();
			var oTable = oView.byId("id_table").getRows();
			var vFlag = false;
			for (var i = 0; i < aCredit.length; i++) {
				if (Ind === "M") {
					/*var vCell4 = oTable[i].getCells()[4].getText();
					var vCell5 = oTable[i].getCells()[5].getValue();*/
					if (parseInt(aCredit[i].Emenge) > parseInt(aCredit[i].Menge)) {
						oView.byId("id_table").getRows()[i].getCells()[5].setValueState("Error").setValueStateText(
							"Credit Quantity Cannot be greater than GRN quantity!");
						vFlag = false;
						break;
					} else
						vFlag = true;
				} else if (Ind === "C" || Ind === "D") {
					/*var vCell4 = oTable[i].getCells()[4].getText();
					var vCell5 = oTable[i].getCells()[5].getValue();*/
					if (parseInt(aCredit[i].Edmbtr) > parseInt(aCredit[i].Dmbtr)) {
						oView.byId("id_table").getRows()[i].getCells()[7].setValueState("Error").setValueStateText(
							"Amount Should not be Greater than GRN Amount !");
						vFlag = false;
						break;
					} else
						vFlag = true;
				}
			}
			if (vFlag == true) {
				this.fnUpdateTable();
			}
		},
		/* ================================================================================ *
		 * ============== Updating Header Table  ========================================== */
		fnUpdateTable: function() {
			var oController = this;
			var vComment = this.getView().byId("id_invno").getValue();
			var oEntry = [];
			var oModelCC = this.getView().getModel();
			var vInvno = this.getView().byId("id_invno").getValue();
			var vInvdt = this.getView().byId("id_invdt").getDateValue();
			var oView = this.getView();
			var vSelect = oView.byId("id_posel").getSelectedButton().getText();
			var vOpt = "";
			var oFileUploader = oView.byId("fileUploader").getFocusDomRef().files[0];
			if (vSelect == "Quantity") {
				vOpt = 'Q';
			} else if (vSelect == "Value") {
				vOpt = 'V';
			}
			oController.fndatevalidate();
			if (Ind === "M" || Ind === "D" || Ind === "C") {
				if (this.flag != "true") {
					if (vComment.length != 0) {
						if (oFileUploader !== undefined && oFileUploader !== null && oFileUploader !== "") {
							oEntry = {
								Mblnr: oView.byId("id_grn").getValue(),
								Mjahr: oView.byId("id_fiscalYearCombo").getValue(),
								Werks: oController.Werks,
								Usercomment: vComment,
								Lifnr: oController.lifnr,
								Invno: vInvno,
								Invdt: vInvdt,
								Flag: Ind

							};

							//      debugger;
							var oChild = [];
							var vLen = oView.getModel("JSBCTable").oData.length;
							for (var i = 0; i < vLen; i++) {
								if (parseInt(oView.getModel("JSBCTable").oData[i].Edmbtr) != 0 ||
									parseInt(oView.getModel("JSBCTable").oData[i].Emenge) != 0) {
									oChild.push({
										Bukrs: oView.getModel("JSBCTable").oData[i].Bukrs,
										Bwart: oView.getModel("JSBCTable").oData[i].Bwart,
										Dmbtr: oView.getModel("JSBCTable").oData[i].Dmbtr,
										Ebeln: oView.getModel("JSBCTable").oData[i].Ebeln,
										Ebelp: oView.getModel("JSBCTable").oData[i].Ebelp,
										Edmbtr: oView.getModel("JSBCTable").oData[i].Edmbtr,
										Emenge: oView.getModel("JSBCTable").oData[i].Emenge,
										Lgort: oView.getModel("JSBCTable").oData[i].Lgort,
										Lifnr: oView.getModel("JSBCTable").oData[i].Lifnr,
										Maktx: oView.getModel("JSBCTable").oData[i].Maktx,
										Matnr: oView.getModel("JSBCTable").oData[i].Matnr,
										Mblnr: oView.getModel("JSBCTable").oData[i].Mblnr,
										Meins: oView.getModel("JSBCTable").oData[i].Meins,
										Menge: oView.getModel("JSBCTable").oData[i].Menge,
										Message: oView.getModel("JSBCTable").oData[i].Message,
										Mjahr: oView.getModel("JSBCTable").oData[i].Mjahr,
										Name1: oView.getModel("JSBCTable").oData[i].Name1,
										Usercomment: oView.getModel("JSBCTable").oData[i].Usercomment,
										Waers: oView.getModel("JSBCTable").oData[i].Waers,
										Werks: oView.getModel("JSBCTable").oData[i].Werks,
										Zeile: oView.getModel("JSBCTable").oData[i].Zeile,

									});
								}
							}

							oEntry.NavCredit = oChild;

							//      oEntry.NavCredit =  oView.getModel("JMCredit").getData().credit;
							var Msg;
							if (Ind === "M") {
								Msg = "Do you want to create credit note request?"
							} else if (Ind === "C") {
								Msg = "Do you want to create subsequent credit note request?"
							} else if (Ind === "D") {
								Msg = "Do you want to create subsequent debit note request?"
							}
							sap.m.MessageBox.confirm(Msg, {
								title: "Submit : Confirmation",
								actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
								onClose: function(oEvent) {
									if (oEvent == "YES") {
										var fnSuccess = function(oData, oResponse) {
											sap.ui.core.BusyIndicator.hide();
											sap.m.MessageBox.success(oData.Message);
											gQueid = oController.fnGetQID(oData.Message);
											oController.fnCheckFileUpload();
											oController.fnclearbutt();
											oController.submit = false;
										};

										var fnFail = function(oResponse) {
											sap.ui.core.BusyIndicator.hide();
										};
										sap.ui.core.BusyIndicator.show(0);
										oModelCC.create("/CreditControlSet", oEntry, {
											success: fnSuccess,
											error: fnFail
										});

									}
								}
							});
						} else {
							var oUploader = this.getView().byId("fileUploader");
							oUploader.setValueState("Error");
							// oUploader.setValueStateText("Upload File");
							sap.m.MessageToast.show("Upload File...");
						}
					} else {
						this.getView().byId("id_invno").setValueState("Error").setValueStateText("Please Enter Valid Invoice Number..");
						sap.m.MessageToast.show("Please Enter Valid Invoice Number...");
					}
				} else {
					this.getView().byId("id_invdt").setValueState("Error").setValueStateText("Enter valid Date");
					sap.m.MessageToast.show("Please Enter Valid Invoice Date...");
				}
			} else {
				sap.m.MessageToast.show("Please Enter Valid Document sType...");
			}
		},
		fnGetQID: function(vMsg) {
			var aQid = vMsg.split(":");
			return aQid[1];
			var oModelCC = this.getView().getModel();
			var oView = this.getView();
		},
		fnCheckFileUpload: function() {
			var oImgID = this.getView().byId("fileUploader").getValue();
			if (gQueid.length != 0 && oImgID.length != 0) {
				this.fnPressAttach();
			} else {
				//sap.m.MessageToast.show("Please Selecet a File");
			}
		},
		// fnPressAttach: function() {
		// 	var oModelCC = this.getView().getModel();
		// 	var oView = this.getView();
		// 	var oFileUploader = oView.byId("fileUploader");
		// 	//        var oModel         = sap.ui.getCore().getModel();
		// 	var oImgID = this.getView().byId("fileUploader").FUEl.id;
		// 	var file = jQuery.sap.domById(oImgID).files[0];
		// 	var oCont = this;

		// 	//        var token = oModel.getSecurityToken();
		// 	try {
		// 		this._bUploading = true;
		// 		var that = this;
		// 		/* ------------- To Fetch CSRF Token ------------- */
		// 		var a = "/sap/opu/odata/EXL/FSCNXT360_SRV/";
		// 		var f = {
		// 			headers: {
		// 				"X-Requested-With": "XMLHttpRequest",
		// 				"Content-Type": "application/atom+xml",
		// 				DataServiceVersion: "2.0",
		// 				"X-CSRF-Token": "Fetch"
		// 			},
		// 			requestUri: a,
		// 			method: "GET"
		// 		};
		// 		var oHeaders;
		// 		var sUrl = a + "/AttachmentSet";
		// 		var oModel1 = new sap.ui.model.odata.ODataModel(sUrl, true);
		// 		sap.ui.getCore().setModel(oModel1);
		// 		/* -------------- To Fetch CSRF Token ------------- */
		// 		OData.request(f, function(data, oSuccess) {
		// 			oToken = oSuccess.headers['x-csrf-token'];
		// 			oHeaders = {
		// 				"x-csrf-token": oToken,
		// 				"slug": file.name + "*" + gQueid,
		// 			};
		// 			/* ----------------- To Upload File ------------------*/
		// 			var oURL = a + "/AttachmentSet";
		// 			jQuery.ajax({
		// 				type: 'POST',
		// 				url: oURL,
		// 				headers: oHeaders,
		// 				cache: false,
		// 				contentType: file.type,
		// 				processData: false,
		// 				data: file,
		// 				success: function(response) {
		// 					var rec = data.getElementsByTagName("entry")[0].children[5].getAttribute("src");
		// 					sap.m.MessageToast.show("File Uploaded Successfully" + rec);

		// 				},
		// 				error: function(oData) {
		// 					//                 sap.m.MessageBox.error("Error");

		// 				}
		// 			});
		// 		});
		// 	} catch (oException) {
		// 		sap.m.MessageToast.show("Upload Not Possible");
		// 	}
		// },
		fnPressAttach: function() {
			var oView = this.getView();
			var oFileUploader = oView.byId("fileUploader");
			var file = oFileUploader.getFocusDomRef().files[0];

			if (!file) {
				sap.m.MessageToast.show("Please select a file to upload.");
				return;
			}

			var sServiceUrl = "/sap/opu/odata/EXL/FSCNXT360_SRV/";
			var that = this;

			// Fetch CSRF Token
			$.ajax({
				url: sServiceUrl,
				type: "GET",
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function(data, textStatus, jqXHR) {
					var sToken = jqXHR.getResponseHeader("X-CSRF-Token");

					// Upload file
					$.ajax({
						url: sServiceUrl + "AttachmentSet",
						type: "POST",
						headers: {
							"X-CSRF-Token": sToken,
							"slug": file.name + "*" + gQueid
						},
						cache: false,
						contentType: "application/octet-stream",
						processData: false,
						data: file,
						success: function(response) {
							sap.m.MessageToast.show("File uploaded successfully!");
						},
						error: function(err) {
							// sap.m.MessageBox.error("File upload failed!");
						}
					});
				},
				error: function() {
					sap.m.MessageBox.error("Failed to fetch CSRF token.");
				}
			});
		},

		fndatevalidate: function() {
			this.flag = "false";
			var oView = this.getView();
			//var begda = oView.byId("id_Qid_DateF").getValue();
			//var endda = oView.byId("id_Qid_DateT").getValue();
			var CrntDt = new Date();
			var date1 = oView.byId("id_invdt").getDateValue();
			//var date2 = oView.byId("id_Qid_DateT").getDateValue();
			/*  var fyear = vQFY.getValue();*/
			//    var oFyear = oView.byId("id_Qid_FY").getValue();
			if (date1 > CrntDt || date1 === null) {
				oView.byId("id_invdt").setValueState("Error");
				oView.byId("id_invdt").setValueStateText("Enter valid Date");
				this.flag = "true";
			} else {
				oView.byId("id_invdt").setValueState("None");
				this.flag = "false";
			}

		},
		fn_Invoicedate_change: function(oEvent) {
			this.flag = "true";
			oEvent.getSource().setValueState("None");
		},
		handleUploadComplete: function(oEvent) {
			oEvent.getSource().setValueState("None");
		},
		fnChangeTypeLive: function(oEvent) {
			var Type = oEvent.getSource().getSelectedKey();
			Ind = "";
			if (Type) {
				if (Type === 'Credit Memo') {
					Ind = 'M';
					var oVisibilityModel = new sap.ui.model.json.JSONModel({
						Qty: true,
						Amt: false
					});
					this.getView().setModel(oVisibilityModel, "JSVisibility");
					this.fnclearbutt1();
					// this.getView().byId("id_rtnqty1").setEditable(true);
					// this.getView().byId("id_rtnqty1").setEnabled(true);
					// this.getView().byId("id_grnedit1").setEditable(false);
					// this.getView().byId("id_grnedit1").setEnabled(false);
				} else if (Type === 'Subsequent Credit') {
					Ind = 'C';
					var oVisibilityModel = new sap.ui.model.json.JSONModel({
						Qty: false,
						Amt: true
					});
					this.getView().setModel(oVisibilityModel, "JSVisibility");
					this.fnclearbutt1();
					// this.getView().byId("id_rtnqty1").setEditable(false);
					// this.getView().byId("id_rtnqty1").setEnabled(false);
					// this.getView().byId("id_grnedit1").setEditable(true);
					// this.getView().byId("id_grnedit1").setEnabled(true);
				} else if (Type === 'Subsequent Debit') {
					Ind = 'D';
					var oVisibilityModel = new sap.ui.model.json.JSONModel({
						Qty: false,
						Amt: true
					});
					this.getView().setModel(oVisibilityModel, "JSVisibility");
					this.fnclearbutt1();
					// this.getView().byId("id_rtnqty1").setEditable(false);
					// this.getView().byId("id_rtnqty1").setEnabled(false);
					// this.getView().byId("id_grnedit1").setEditable(true);
					// this.getView().byId("id_grnedit1").setEnabled(true);
				} else {
					sap.m.MessageToast.show("Enter Valid Document Type");
				}
			}
			setTimeout(() => {
				var oField = this.getView().byId("id_grn");
				if (oField && oField.getFocusDomRef()) {
					oField.focus();
				}
			}, 200);
		},
		fnChangeType: function(oEvent) {
			var Type = oEvent.getSource().getValue();
			Ind = "";
			if (Type) {
				if (Type === 'Credit Memo') {
					Ind = 'M';
					var oVisibilityModel = new sap.ui.model.json.JSONModel({
						Qty: true,
						Amt: false
					});
					this.getView().setModel(oVisibilityModel, "JSVisibility");
					this.fnclearbutt1();
					// this.getView().byId("id_rtnqty1").setEditable(true);
					// this.getView().byId("id_rtnqty1").setEnabled(true);
					// this.getView().byId("id_grnedit1").setEditable(false);
					// this.getView().byId("id_grnedit1").setEnabled(false);
				} else if (Type === 'Subsequent Credit') {
					Ind = 'C';
					var oVisibilityModel = new sap.ui.model.json.JSONModel({
						Qty: false,
						Amt: true
					});
					this.getView().setModel(oVisibilityModel, "JSVisibility");
					this.fnclearbutt1();
					// this.getView().byId("id_rtnqty1").setEditable(false);
					// this.getView().byId("id_rtnqty1").setEnabled(false);
					// this.getView().byId("id_grnedit1").setEditable(true);
					// this.getView().byId("id_grnedit1").setEnabled(true);
				} else if (Type === 'Subsequent Debit') {
					Ind = 'D';
					var oVisibilityModel = new sap.ui.model.json.JSONModel({
						Qty: false,
						Amt: true
					});
					this.getView().setModel(oVisibilityModel, "JSVisibility");
					this.fnclearbutt1();
					// this.getView().byId("id_rtnqty1").setEditable(false);
					// this.getView().byId("id_rtnqty1").setEnabled(false);
					// this.getView().byId("id_grnedit1").setEditable(true);
					// this.getView().byId("id_grnedit1").setEnabled(true);
				} else {
					sap.m.MessageToast.show("Enter Valid Document Type");
				}
			}
			setTimeout(() => {
				var oField = this.getView().byId("id_grn");
				if (oField && oField.getFocusDomRef()) {
					oField.focus();
				}
			}, 200);
		},
		handleUploadComplete: function(oEvent) {
			oEvent.getSource().setValueState("None");
		}
	});

});