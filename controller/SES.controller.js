sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"

], function(Controller, Filter, FilterOperator, formatter, MessageBox, MessageToast) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var zoom = "0";
	var vQid;
	var Total = 0;

	return Controller.extend("FSC360NEW.controller.SES", {

		onInit: function() {
			var oMultiInputPO = this.byId("id_ponumber");
			if (oMultiInputPO) {
				oMultiInputPO.addEventDelegate({
					onmouseover: function() {
						var aTokens = oMultiInputPO.getTokens();
						if (aTokens.length > 0) {
							var sTooltip = aTokens.map(function(oToken) {
								return oToken.getText();
							}).join(", ");
							oMultiInputPO.setTooltip(sTooltip);
						} else {
							oMultiInputPO.setTooltip("");
						}
					}
				});
			}
			//oGlobalBusyDialog.open();
	

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("SES").attachPatternMatched(this.Fn_RouteMatched, this);
		},
		Fn_RouteMatched: function() {
			this.fn_LoadQid();
		    this.fn_getVendor();
			var oList = this.byId("id_qidList");
			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});
			this.fnClearForm();

		},
		fnClearForm: function() {
			var oView = this.getView();

			// Inputs / TextFields
			oView.byId("id_vendor").setValue("");
			oView.byId("id_ponumber").setValue("");
			oView.byId("id_ponumber").removeAllTokens();
			oView.byId("id_headertxt").setValue("");
			oView.byId("id_itemno").setValue("");
			oView.byId("id_podate").setValue("");
			oView.byId("id_invoiceno").setValue("");
			oView.byId("id_vendor1").setValue("");
			oView.byId("id_ponumber1").setValue("");
			oView.byId("id_ponumber1").removeAllTokens("");
			oView.byId("id_headertxt1").setValue("");
			oView.byId("id_itemno1").setValue("");
			oView.byId("id_invoiceno1").setValue("");
			oView.byId("id_podate1").setValue("");
			oView.byId("id_totalamount").setValue("");
			oView.byId("id_totalamount1").setValue("");

			// DatePickers
			oView.byId("id_invoicedate").setDateValue(null);
			oView.byId("id_invoicedate1").setDateValue(null);

			// Clear JSON models if needed
			oView.setModel(new sap.ui.model.json.JSONModel(), "JSDate");
			oView.setModel(new sap.ui.model.json.JSONModel(), "JSSesDet");
		},

		fnSearchField: function(oEvent) {
			var FilterParameter = "Ebeln";
			var vValue = oEvent.getSource().getValue();
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter(FilterParameter, sap.ui.model.FilterOperator.Contains, vValue);
				var aFilter = new sap.ui.model.Filter([oFilter]);
			}
			var binding = this.getView().byId("id_table").getBinding("rows");
			binding.filter(aFilter);
		},
		fn_getVendor: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oGlobalBusyDialog.open();
			oModel.read("/KredaSet", {
				success: function(oData) {
					oGlobalBusyDialog.close();
					// Create JSON Model
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSVendor");

					// Bind ComboBox items
					that.byId("id_vendor").bindItems({
						path: "JSVendor>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSVendor>Lifnr}",
							text: "{JSVendor>Lifnr}",
							additionalText: "{JSVendor>Mcod1}"
						})
					});
						that.byId("id_vendor1").bindItems({
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
					oGlobalBusyDialog.close();
					that.fnShowErrorDialog('HTTP Error while fetching Vendor list');

				}
			});
		},

		onQidSearch: function(oEvent) {
			var sQuery = oEvent.getParameter("value").toLowerCase(); // get the typed value
			var oList = this.byId("id_qidList");
			var oBinding = oList.getBinding("items");

			if (!sQuery) {
				oBinding.filter([]); // clear filter if input is empty
				return;
			}

			var oFilter1 = new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.Contains, sQuery);
			var oFilter2 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sQuery);
			var oCombinedFilter = new sap.ui.model.Filter([oFilter1, oFilter2], false); // false = OR

			oBinding.filter([oCombinedFilter]);
		},
		fn_LoadQid: function() {

			this.getView().byId("id_Ses_post1").setVisible(false);

			var date = new Date();
			var invdt = [{
				Invdt: date,
				Aedat: date
			}];

			var oModel_date = new sap.ui.model.json.JSONModel();
			oModel_date.setData(invdt);
			this.getView().setModel(oModel_date, 'JSDate');

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oGlobalBusyDialog.open();
			oModel.read("/SESHeadSet", {
				filters: [

				],
				urlParameters: {
					$expand: "NavSESGetDetails"

				},

				success: function(oData, oResponse) {

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0]);
					that.getView().setModel(oModel, 'JSusername');

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavSESGetDetails.results);
					that.getView().setModel(oModel, 'JSListQid');

					that.getView().byId("id_scannedinvoiceno").setText(oData.results[0].NavSESGetDetails.results.length);
					oGlobalBusyDialog.close();

				},
				error: function(oRes) {

					sap.m.MessageToast.show('Http Error');
					oGlobalBusyDialog.close();

				}

			});
		},
		fnaddPo: function() {
			// create value help dialog
			if (!this.Po_frag) {
				this.Po_frag = sap.ui.xmlfragment(this.getView().getId(), "FSC360NEW.fragment.SESAdopt", this);
				this.getView().addDependent(this.Po_frag);
			}
			this.Po_frag.open();
			this._bFragmentOpened = true;
		},
		fnGrnClose: function() {
			this._bFragmentOpened = false;
			this.Po_frag.close();
			this.Po_frag.destroy();
			this.Po_frag = null;
		},
		onTokenValidatePO: function(oArgs) {
			var oMultiInput = oArgs.sender;
			var sText = oArgs.text.trim();

			if (!sText) {
				return null;
			}

			// Allow multiple PO numbers separated by space/comma
			var aValues = sText.split(/[\s,;]+/);
			var aTokens = [];

			aValues.forEach(function(sVal) {
				if (!sVal) return;

				var bExists = oMultiInput.getTokens().some(function(oTok) {
					return oTok.getKey() === sVal;
				});

				if (!bExists) {
					aTokens.push(new sap.m.Token({
						key: sVal,
						text: sVal
					}));
				}
			});

			// Clear the "value" field so pasted text doesn’t remain visible
			oMultiInput.setValue("");

			return aTokens.length ? aTokens : null;
		},

		onSubmitPO: function(oEvent) {
			var sValue = oEvent.getParameter("value"); // user typed PO
			var oMultiInput = oEvent.getSource();

			if (sValue) {
				var oItemInput = this.byId("id_itemno");
				var sItemNo = oItemInput ? oItemInput.getValue().trim() : "";
				if (sItemNo) {
					sItemNo = sItemNo.padStart(5, "0"); // leading zero safe
				}

				// Add token (show item no if entered)
				oMultiInput.addToken(new sap.m.Token({
					key: sValue + (sItemNo ? "/" + sItemNo : ""),
					text: sItemNo ? (sValue + " / " + sItemNo) : sValue,
					editable: true
				}));
				oMultiInput.setValue("");

				// Update model
				var oModel = this.getView().getModel("JSSesDet");
				var vData = oModel.getData();
				if (!Array.isArray(vData)) {
					vData = vData.results || [];
				}

				var bExists = vData.some(function(o) {
					return o.Ebeln === sValue && o.Ebelp === sItemNo;
				});

				if (!bExists) {
					vData.push({
						Ebeln: sValue,
						Ebelp: sItemNo 
					});
				}

				oModel.setData(vData);
				oModel.refresh(true);

				this.fnSubmitGRN();
			}
		},
		onLiveChangePO: function(oEvent) {
			var oMultiInput = oEvent.getSource();
			var sTypedValue = oEvent.getParameter("value").trim(); // what user is typing
			var aTokens = oMultiInput.getTokens();

			var oItemInput = this.byId("id_itemno");
			var sItemNo = oItemInput ? oItemInput.getValue().trim() : "";

			// If no Item No and no existing tokens, prevent typing
			if (!sItemNo && aTokens.length === 0 && sTypedValue) {
				sap.m.MessageToast.show("Please enter Item Number first");
				// Clear the typed value immediately
				oMultiInput.setValue("");
			}
		},

		onTokenUpdatePO: function(oEvent) {
			var sType = oEvent.getParameter("type");
			if (sType === "removed") {
				var aRemovedTokens = oEvent.getParameter("removedTokens");
				var oModel = this.getView().getModel("JSSesDet");
				var vData = oModel.getData();

				// Support both array and object-with-results
				var aData = Array.isArray(vData) ? vData : (vData.results || []);

				aRemovedTokens.forEach(function(oToken) {
					var sPO = oToken.getText();
					// Remove all entries for this PO
					aData = aData.filter(function(o) {
						return o.Ebeln !== sPO;
					});
				});

				// Update model
				if (Array.isArray(vData)) {
					oModel.setData(aData);
				} else {
					vData.results = aData;
					oModel.setData(vData);
				}
				oModel.refresh(true);

				// Update MultiInput tokens
				["id_ponumber", "id_ponumber1"].forEach(function(sId) {
					var oMultiInput = this.getView().byId(sId);
					if (oMultiInput) {
						oMultiInput.removeAllTokens();
						aData.forEach(function(oItem) {
							oMultiInput.addToken(new sap.m.Token({
								key: oItem.Ebeln,
								text: oItem.Ebeln,
								editable: true
							}));
						});
						oMultiInput.setValue("");
					}
				}.bind(this));

				// --- Update Table dynamically ---
				var oTable = this.getView().byId("id_table");
				oTable.setVisibleRowCount(Math.max(aData.length, 1));
				oTable.setVisible(true);
				oTable.setVisibleRowCountMode("Fixed");

				// --- Clear Item Number if no POs left ---
				if (aData.length === 0) {
					this.byId("id_itemno").setValue("");
				}
			}
		},

		fnSubmitGRN: function() {
			var oModel = this.getView().getModel("JSSesDet");
			var vData = oModel.getData();

			// Validate: check if Ebeln missing
			var vError = vData.some(function(o) {
				return !o.Ebeln;
			});

			if (!vError && vData.length > 0) {

				["id_ponumber", "id_ponumber1"].forEach(function(sId) {
					var oMultiInput = this.byId(sId);
					if (oMultiInput) {
						oMultiInput.removeAllTokens();

						var aUniquePOs = [];
						vData.forEach(function(oItem) {
							if (oItem.Ebeln && aUniquePOs.indexOf(oItem.Ebeln) === -1) {
								aUniquePOs.push(oItem.Ebeln);
							}
						});

						aUniquePOs.forEach(function(po) {
							oMultiInput.addToken(new sap.m.Token({
								key: po,
								text: po,
								editable: true
							}));
						});
					}
				}.bind(this));
				this.getQIDDEtailsAdd();

				if (this.Po_frag) {
					this.Po_frag.close();
					this.Po_frag.destroy();
					this.Po_frag = null;

				}
			} else {
				sap.m.MessageToast.show(
					this.getView().getModel("i18n").getProperty("AddPOError")
				);
			}
		},
		onItemNoChange: function(oEvent) {
			var sNewItemNo = oEvent.getParameter("value").trim();

			["id_ponumber", "id_ponumber1"].forEach(function(sId) {
				var oMultiInput = this.byId(sId);
				if (oMultiInput) {
					oMultiInput.removeAllTokens();
					oMultiInput.setValue("");
				}
			}.bind(this));

			var oModel = this.getView().getModel("JSSesDet");
			if (oModel) {
				var vData = Array.isArray(oModel.getData()) ? [] : {
					results: []
				};
				oModel.setData(vData);
				oModel.refresh(true);
			}

			// Optional: clear table if visible
			var oTable = this.byId("id_table");
			if (oTable) {
				oTable.setVisibleRowCount(1);

			}
		},

		fnPressAddPO: function() {
			var oTable = this.byId("Id_TbPO");
			var oTabModel = this.getView().getModel("JSSesDet");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"Ebeln": "",
				"Ebelp": ""
			});

			oTabModel.refresh();

			oTable.setVisibleRowCount(oTabData.length);
		},

		fnPressDeletePO: function() {
			var oTable = this.byId("Id_TbPO");
			var oTabModel = this.getView().getModel("JSSesDet");
			var oTabData = oTabModel.getData();

			// Get selected indices
			var aIndices = oTable.getSelectedIndices();

			if (aIndices.length === 0) {
				sap.m.MessageToast.show("Please select row(s) to delete");
				return;
			}

			// Sort indices descending so splicing doesn’t shift later indices
			aIndices.sort(function(a, b) {
				return b - a;
			});

			aIndices.forEach(function(iIndex) {
				if (oTabData.length > 1) {
					oTabData.splice(iIndex, 1);
				} else {
					// Always keep at least 1 empty row
					oTabData.splice(iIndex, 1);
					oTabData.push({
						"Ebeln": "",
						"Ebelp": ""
					});
				}
			});

			oTabModel.refresh();
			oTable.clearSelection();
			oTable.setVisibleRowCount(oTabData.length);
		},

		fnTypeNumber: function(oEvent) {
			oEvent.getSource().setValueState("None");
			var vValue = oEvent.getSource().getValue();
			if (vValue.length != 0) {
				var vFormatValue = vValue.replace(/\D/g, '');
				if (isNaN(vValue)) {
					oEvent.getSource().setValue(vFormatValue);
				}
			}
		},

		getQIDDEtailsAdd: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var readUrl = "/SESHeadSet";
			var that = this;

			// Get table data typed by the user
			var vData = this.getView().getModel("JSSesDet").getData() || [];
			if (!Array.isArray(vData)) {
				vData = vData.results || [];
			}

			// Collect unique POs from typed data
			var aPOs = [];
			vData.forEach(function(oRow) {
				if (oRow.Ebeln && aPOs.indexOf(oRow.Ebeln) === -1) {
					aPOs.push(oRow.Ebeln);
				}
			});

			// Build filters
			var aFilters = [];
			var vQid = this.vQid || "";
			if (vQid) {
				aFilters.push(new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.EQ, vQid));
			}

			// Add PO filters
			if (aPOs.length === 1) {
				aFilters.push(new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, aPOs[0]));
			} else if (aPOs.length > 1) {
				// Note: Multiple POs may need backend support for "in" or multiple OR filters
				var poFilters = aPOs.map(function(po) {
					return new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, po);
				});
				aFilters.push(new sap.ui.model.Filter(poFilters, false));
			}
			oGlobalBusyDialog.open();
			oModel.read(readUrl, {
				filters: aFilters,
				urlParameters: {
					$expand: "NavSESGetDetails,NavSESReturn"
				},
				success: function(oData) {

					var oResult = oData.results[0];

					// Handle backend errors
					if (oResult.NavSESReturn && oResult.NavSESReturn.results.length > 0) {
						var oMsg = oResult.NavSESReturn.results[0];
						if (oMsg.Type === "E" || oMsg.Type === "A") {
							// sap.m.MessageBox.error(oMsg.Message);
							that.fnShowErrorDialog(oMsg.Message);
							return;
						}
					}

					// Update vendor
					that.getView().byId("id_vendor").setValue(oResult.Lifnr + " - " + oResult.Name1);

					var oMultiInput = that.getView().byId("id_ponumber");

					that.getView().byId("id_headertxt").setValue(oResult.Slno);

					that.getView().byId("id_invoiceno").setValue(oResult.Invno);

					var sUserItemNo = that.byId("id_itemno").getValue().trim();

					if (!sUserItemNo) {
						that.byId("id_itemno").setValue(formatter.fnLeadingZero(oResult.Ebelp));
					}

					var sItemNo = that.getView().byId("id_itemno").getValue();
					var sItemNoPadded = sItemNo.padStart(5, "0");

					var filteredItems;
					if (that._bFragmentOpened) {

						filteredItems = oResult.NavSESGetDetails.results.filter(function(oItem) {
							return vData.some(function(vRow) {
								var vEbelpPadded = (vRow.Ebelp || "").padStart(5, "0");
								return vRow.Ebeln === oItem.Ebeln && vEbelpPadded === oItem.Ebelp;
							});
						});
					} else {

						filteredItems = oResult.NavSESGetDetails.results.filter(function(oItem) {
							return vData.some(function(vRow) {
								var vEbelpPadded = (vRow.Ebelp || "").padStart(5, "0");

								if (!sItemNo) {
									return vRow.Ebeln === oItem.Ebeln && vEbelpPadded === oItem.Ebelp;
								}

								return vRow.Ebeln === oItem.Ebeln && oItem.Ebelp === sItemNoPadded;
							});
						});
					}

					oMultiInput.removeAllTokens();

					var aUniquePOs = [];
					filteredItems.forEach(function(oItem) {
						if (oItem.Ebeln && aUniquePOs.indexOf(oItem.Ebeln) === -1) {
							aUniquePOs.push(oItem.Ebeln);
						}
					});

					// Add one token per unique PO
					aUniquePOs.forEach(function(po) {
						oMultiInput.addToken(new sap.m.Token({
							key: po,
							text: po,
							editable: true
						}));
					});

					oMultiInput.setValue("");
					// Update model with filtered line items
					var oDetailsModel = new sap.ui.model.json.JSONModel(filteredItems);
					that.getView().setModel(oDetailsModel, "JSSesDet");

					// Show table and adjust row count
					var oTable = that.getView().byId("id_table");
					oTable.setVisible(true);
					oTable.setVisibleRowCount(Math.max(filteredItems.length, 1));
					oTable.setVisibleRowCountMode("Fixed");
					that.getView().byId("id_scrll").setVisible(true);

					that.fnGetPDF(vQid);
					oGlobalBusyDialog.close();
				},
				error: function(oError) {
					oGlobalBusyDialog.close();
					that.fnShowErrorDialog('Invalid PO number');

				}
			});
		},

		fn_clear: function() {
			this.getView().byId("id_vendor").setValue("");
			this.getView().byId("id_podate").setValue("");
			this.getView().byId("id_ponumber").setValue("");
			this.getView().byId("id_itemno").setValue("");
			this.getView().byId("id_sestext").setValue("");
			this.getView().byId("id_headertxt").setValue("");
			this.getView().byId("id_invoiceno").setValue("");
			this.getView().byId("id_invoicedate").setValue("");
			this.getView().byId("id_totalamount").setValue("");
			this.getView().byId("id_totalamount1").setValue("");
			this.getView().getModel("JSSesDet").setData(null);
		},
		fn_list_display: function() {
			//Added by Lokesh R on 31.09.2023 - Start
			if (this.getView().byId("id_right_disp").getVisible() === true) {
				this.fn_clear();
			}
			if (this.getView().byId("id_1st_vbx").getVisible() === false && this.getView().byId("id_scrll").getVisible() === false && this.getView()
				.byId(
					"id_right_disp").getVisible() === true) {
				this.getView().byId("id_1st_vbx").setVisible(true);
				// Width
				this.getView().byId("id_1st_vbx").setWidth("17%");
				this.getView().byId("id_2nd_vbx").setWidth("79%");
				this.getView().byId("id_3rd_vbx").setWidth("0%");

				this.getView().byId("id_right_disp").setVisible(false);
				this.getView().byId("id_left_hide").setVisible(true);
				return;
			}
			if (this.getView().byId("id_right_disp").getVisible() === true && this.getView().byId("id_pdfclick").getVisible() === true) {
				this.fn_Pdf_Visble();
			}
			//Added by Lokesh R on 31.09.2023 - End
			if (this.getView().byId("id_1st_vbx").getVisible() === false) {
				this.getView().byId("id_table").setVisible(true);

				if (this.getView().byId("id_scrll").getVisible() === false) {
					this.getView().byId("id_1st_vbx").setVisible(true);

					this.getView().byId("id_1st_vbx").setWidth("17%");
					this.getView().byId("id_2nd_vbx").setWidth("79%");
					this.getView().byId("id_3rd_vbx").setWidth("0%");

					this.getView().byId("id_right_disp").setVisible(false);
					this.getView().byId("id_left_hide").setVisible(true);

				} else if (this.getView().byId("id_scrll").getVisible() === true) {
					this.getView().byId("id_1st_vbx").setVisible(true);

					this.getView().byId("id_1st_vbx").setWidth("17%");
					this.getView().byId("id_2nd_vbx").setWidth("40%");
					this.getView().byId("id_3rd_vbx").setWidth("42%");
					this.getView().byId("id_scrll").setVisible(true);

					this.getView().byId("id_right_disp").setVisible(false);
					this.getView().byId("id_left_hide").setVisible(true);
				}
			} else if (this.getView().byId("id_1st_vbx").getVisible() === true) {
				if (this.getView().byId("id_scrll").getVisible() === false) {

					this.getView().byId("id_1st_vbx").setVisible(false);
					this.getView().byId("id_right_disp").setVisible(true);
					this.getView().byId("id_left_hide").setVisible(false);
					this.getView().byId("id_2nd_vbx").setWidth("100%");
					this.getView().byId("id_1st_vbx").setWidth("0%");
					this.getView().byId("id_3rd_vbx").setWidth("0%");

				} else if (this.getView().byId("id_scrll").getVisible() === true) {
					this.getView().byId("id_1st_vbx").setVisible(false);

					this.getView().byId("id_2nd_vbx").setWidth("55%");
					this.getView().byId("id_3rd_vbx").setWidth("45%");

					this.getView().byId("id_right_disp").setVisible(true);
					this.getView().byId("id_left_hide").setVisible(false);
				}
			}
		},

		fn_ListItemPress: function(oEvent) {
			oGlobalBusyDialog.open();
			var oClickedItem = oEvent.getSource();
			var oList = this.byId("id_qidList");

			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});

			oClickedItem.addStyleClass("selectedListItem");
			vQid = oEvent.getSource().getBindingContext('JSListQid').getProperty('Qid');
			this.vQid = vQid;
			var vEbeln = oEvent.getSource().getBindingContext('JSListQid').getProperty('Ebeln');

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/SESHeadSet", {
				filters: [
					new Filter("Qid", FilterOperator.EQ, vQid),
					new Filter("Ebeln", FilterOperator.EQ, vEbeln)
				],
				urlParameters: {
					$expand: "NavSESGetDetails"
				},
				success: function(oData, oResponse) {
					that.getView().byId("id_Ses_post1").setVisible(true);
					that.getView().byId('id_vendor').setValue(oData.results[0].Lifnr + ' -' + oData.results[0].Name1);

					var oMultiInput = that.getView().byId("id_ponumber");
					oMultiInput.removeAllTokens();

					// create a token from the EBELN
					oMultiInput.addToken(new sap.m.Token({
						key: oData.results[0].Ebeln,
						text: oData.results[0].Ebeln
					}));

					var oMultiInput1 = that.getView().byId("id_ponumber1");
					oMultiInput1.removeAllTokens();

					// create a token from the EBELN
					oMultiInput1.addToken(new sap.m.Token({
						key: oData.results[0].Ebeln,
						text: oData.results[0].Ebeln
					}));

					that.getView().byId('id_headertxt').setValue(oData.results[0].Slno);
					that.getView().byId('id_itemno').setValue(formatter.fnLeadingZero(oData.results[0].Ebelp));
					var date = formatter.fnDate(oData.results[0].Aedat);
					that.getView().byId('id_podate').setValue(date);

					that.getView().byId("id_invoiceno").setValue(oData.results[0].Invno);
					that.getView().byId('id_vendor1').setValue(oData.results[0].Lifnr + ' -' + oData.results[0].Name1);

					that.getView().byId('id_headertxt1').setValue(oData.results[0].Slno);
					that.getView().byId('id_itemno1').setValue(formatter.fnLeadingZero(oData.results[0].Ebelp));
					that.getView().byId("id_invoiceno1").setValue(oData.results[0].Invno);
					that.getView().byId('id_podate1').setValue(date);
					that.getView().byId("id_totalamount").setValue("");
					that.getView().byId("id_totalamount1").setValue("");

					var invdt = [{
						Invdt: oData.results[0].Invdt,
						Aedat: oData.results[0].Aedat
					}];
					var rawDate = oData.results[0].Invdt;
					var oJSDate = new Date(rawDate); // safe conversion

					// 3. Set it to DatePicker by ID
					that.getView().byId("id_invoicedate").setDateValue(oJSDate);
					that.getView().byId("id_invoicedate1").setDateValue(oJSDate);
					var oModel_date = new sap.ui.model.json.JSONModel();
					oModel_date.setData(invdt);
					that.getView().setModel(oModel_date, 'JSDate');

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavSESGetDetails.results);
					that.getView().setModel(oModel, 'JSSesDet');
					var aRows = oData.results[0].NavSESGetDetails.results || [];
					var iRowCount = aRows.length;

					// Get the table by ID
					var oTable = that.getView().byId("id_table");

					// Set visibleRowCount and mode
					oTable.setVisibleRowCount(Math.max(iRowCount, 1)); // Minimum 1 row to avoid collapse
					oTable.setVisibleRowCountMode("Fixed");

					that.getView().byId("id_table").setVisible(true);

					that.getView().byId("id_3rd_vbx").setWidth("30%");

					that.fnGetPDF(vQid);
					oGlobalBusyDialog.close();
				},
				error: function(oRes) {

					sap.m.MessageToast.show('Http Error');
					oGlobalBusyDialog.close();
				}

			});

		},

		fn_ZoomIn: function() {
			if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom0") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom0');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom1');
			} else if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom1") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom1');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom2');
			} else if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom2") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom2');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom3');
			} else if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom3") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom3');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom4');
			}

		},

		fn_ZoomOut: function() {
			if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom4") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom4');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom3');
			} else if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom3") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom3');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom2');
			} else if (this.getView().byId('id_scrll').aCustomStyleClasses[0] === "cl_zoom2") {
				this.getView().byId('id_scrll').removeStyleClass('cl_zoom2');
				this.getView().byId('id_scrll').addStyleClass('cl_zoom1');
			}

		},

		fn_Search_Pad: function() {

			var vFlag = this.getView().byId("id_search_pad").getVisible();
			if (vFlag === true) {
				this.getView().byId("id_search_pad").setVisible(false);
			} else {
				this.getView().byId("id_search_pad").setVisible(true);
			}
		},

		fn_Pdf_Visble: function() {
			var vFlag = this.getView().byId("id_scrll").getVisible();
			if (this.getView().byId("id_left_hide").getVisible() === true && vFlag === false) {
				this.fn_list_display();
			}
			if (vFlag === true) {
				if (this.getView().byId("id_1st_vbx").getVisible() === false) {
					this.getView().byId("id_scrll").setVisible(false);
					this.getView().byId("id_2nd_vbx").setWidth("100%");
					this.getView().byId("id_1st_vbx").setWidth("0%");
					this.getView().byId("id_3rd_vbx").setWidth("0%");

				} else if (this.getView().byId("id_1st_vbx").getVisible() === true) {
					this.getView().byId("id_scrll").setVisible(false);
					this.getView().byId("id_2nd_vbx").setWidth("80%");
					this.getView().byId("id_1st_vbx").setWidth("20%");
					this.getView().byId("id_3rd_vbx").setWidth("0%");

				}

			} else {
				if (this.getView().byId("id_1st_vbx").getVisible() === false) {
					this.getView().byId("id_scrll").setVisible(true);
					this.getView().byId("id_2nd_vbx").setWidth("55%");
					this.getView().byId("id_1st_vbx").setWidth("0%");
					this.getView().byId("id_3rd_vbx").setWidth("45%");

				} else if (this.getView().byId("id_1st_vbx").getVisible() === true) {
					this.getView().byId("id_scrll").setVisible(true);
					this.getView().byId("id_3rd_vbx").setWidth("35%");

					this.getView().byId("id_2nd_vbx").setWidth("48%");
					this.getView().byId("id_1st_vbx").setWidth("20%");
				}

			}
		},

		onHidePdfPanel: function() {
			var oView = this.getView();

			oView.byId("id_3rd_vbx").setVisible(false);
			oView.byId("idFormFull").setVisible(false);

			var bLeftPanelVisible = oView.byId("id_left_panel").getVisible();

			if (bLeftPanelVisible) {
				oView.byId("idSesInputCont").setWidth("75%");
			} else {
				oView.byId("idSesInputCont").setWidth("90%");
			}

			oView.byId("idFormCompact").setWidth("100%");
			oView.byId("idFormCompact").setVisible(true);
			oView.byId("idOpenBarcodePdf").setVisible(true);

			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
		},
	// fnGetPDF: function(QueueID) {

	// 		if (QueueID !== "") {
	// 			oGlobalBusyDialog.open();
	// 			this.getView().byId('id_scrll').setBusy(false);
	// 			var oScorl = this.getView().byId("id_scrll");

	// 			oScorl.destroyContent();
			
	// 			// var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=0&zoom=60";
	// 			var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet((Queid='" + vQid + "',Doc='')/$value#toolbar=1";

	// 			var oHtml = new sap.ui.core.HTML({

	// 			});
	// 			// var oContent = "<div class='overlay'><iframe src=" + Url +
	// 			// 	" id='id_imageIfrm' '  scrolling='yes' height='380' width='400' ></iframe></div>";
	// 				var oContent = "<div class='overlay'><iframe src=" + Url +
	// 				"  id='id_imageIfrm' ' allowtransparency='false' scrolling='yes'  height='430' width='360'></iframe></div>";
	
	// 			oHtml.setContent(oContent);
	// 			var oScrl = this.getView().byId("id_scrll");
	// 			oScrl.addContent(oHtml);
	// 			// oScrl.setVisible(true);
	// 			$('id_scrll').click(false);
	// 			oGlobalBusyDialog.close();
	// 		} else {
	// 			this.fnShowErrorDialog("Please Select the Queue ID");
	// 		}
	// 	},
		fn_onPrint: function() {
			var iframe = this.getView().byId("id_scrll").getContent()[0].getDomRef().querySelector('iframe');
			if (iframe) {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			}
		},

	
		fn_onDownload: function() {
			// vQid = oEvent.getSource().getBindingContext('JSListQid').getProperty('Qid');
			// this.vQid = vQid;
			// var QueueID = window.QueueID || "";
			if (!vQid) {
				// sap.m.MessageBox.error("Please Select the Queue ID");
				this.openErrorDialog(' Please Select the Queue ID');
				return;
			}

			var url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + vQid + "',Doc='')/$value";

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
					link.download = "Invoice_" + QueueID + ".pdf"; // filename with QueueID
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					sap.m.MessageBox.error("Error while downloading: " + err.message);
				});
		},
	 fnGetPDF: function(vQid) {

      if (vQid !== "") {
        // oGlobalBusyDialog.open();
        this.getView().byId("id_scrll").setBusy(true);
        var oScorl = this.getView().byId("id_scrll");

        oScorl.destroyContent();
        // var Url = "/sap/opu/odata/EXL/FSC_WB_SRV/ImageSet('" + vQid + "')/$value#toolbar=1";
        var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + vQid + "',Doc='')/$value#toolbar=1";

        // var Url = "/sap/opu/odata/EXL/FSC_WB_SRV/ImageSet('" + vQid + "')/$value#toolbar=0";
        var oHtml = new sap.ui.core.HTML({

        });

        // var oContent = "<div class='overlay'><iframe src=" + Url +
        //   "  id='id_imageIfrm' height='482' width='700'   ></iframe></div>";
        	var oContent = "<div class='overlay'><iframe src=" + Url +
					"  id='id_imageIfrm' ' allowtransparency='false' scrolling='yes'  height='450' width='370'></iframe></div>";

        // encodeURI

        oHtml.setContent(oContent);

        // var file = new oContent([blob], 'a_name.pdf', {
        //  type: 'application/pdf'
        // })
        // iframe.src = URL.createObjectURL(file)

        var oScrl = this.getView().byId("id_scrll");
        oScrl.addContent(oHtml);
        oScrl.setVisible(true);
        $('id_scrll').click(false);
        this.getView().byId("id_scrll").setBusy(false);
        // oGlobalBusyDialog.close();
      } else {
        sap.m.MessageBox.error("Please Select the Queue ID");
      }

    },
		// fnGetPDF: function(vQid) {
		// 	var that = this;

		// 	if (!vQid) {
		// 		that.fnShowErrorDialog('Please Select the Queue ID');
		// 		return;
		// 	}

		// 	var oScroll = this.getView().byId("id_scrll");
		// 	oScroll.setBusy(true);
		// 	oScroll.destroyContent();

		// 	var pdfUrl = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Queid='" + vQid + "',Doc='')/$value#toolbar=1";

		// 	var xhr = new XMLHttpRequest();
		// 	xhr.open("GET", pdfUrl, true);
		// 	xhr.responseType = "blob";
		// 	xhr.onload = function() {
		// 		if (xhr.status === 200) {
		// 			var blob = xhr.response;
		// 			var reader = new FileReader();

		// 			reader.onload = function() {
		// 				var typedArray = new Uint8Array(this.result);

		// 				pdfjsLib.getDocument({
		// 					data: typedArray
		// 				}).promise.then(function(pdf) {
		// 					let pageNum = 1;

		// 					function renderPage() {
		// 						if (pageNum > pdf.numPages) {
		// 							oScroll.setBusy(false);
		// 							return;
		// 						}

		// 						pdf.getPage(pageNum).then(function(page) {
		// 							var viewport = page.getViewport({
		// 								scale: 1.3
		// 							});

		// 							var canvas = document.createElement("canvas");
		// 							canvas.width = viewport.width;
		// 							canvas.height = viewport.height;

		// 							var context = canvas.getContext("2d");
		// 							var renderContext = {
		// 								canvasContext: context,
		// 								viewport: viewport
		// 							};

		// 							page.render(renderContext).promise.then(function() {
		// 								var imageData = canvas.toDataURL("image/png");

		// 								var oHtml = new sap.ui.core.HTML({
		// 									content: "<div><img src='" + imageData + "' style='width:100%;margin-bottom:10px;' /></div>"
		// 								});

		// 								oScroll.addContent(oHtml);

		// 								pageNum++;
		// 								renderPage(); // Render next page
		// 							});
		// 						});
		// 					}

		// 					renderPage(); // Start rendering
		// 				});
		// 			};
		// 			reader.readAsArrayBuffer(blob);
		// 		} else {
		// 			oScroll.setBusy(false);
		// 			that.fnShowErrorDialog('HTTP Error while fetching Vendor list');

		// 		}
		// 	};
		// 	xhr.send();
		// },
		action: function(oEvent) {
			var myTable = this.getView().byId("id_table");
			var selectedIndeices = myTable.getSelectedIndices();
			if (selectedIndeices.length !== 0) {
				for (var i = 0; i < selectedIndeices.length; i++) {
					var amount = parseInt(myTable.getContextByIndex(selectedIndeices[i]).getProperty("Netwr"));
					Total = amount + Total;

				}
				this.getView().byId("id_totalamount").setValue(Total);
				this.getView().byId("id_totalamount1").setValue(Total);
				Total = 0;
			} else {
				this.getView().byId("id_totalamount").setValue("");
				this.getView().byId("id_totalamount1").setValue("");
			}
		},
	
		fn_Ses_post: function() {
			var that = this;
			var vInvdt = this.getView().byId("id_invoicedate").getValue();
			var vInvno = this.getView().byId("id_invoiceno").getValue();
			if (vInvno) {
				this.getView().byId("id_invoicedate").setValueState('None');
				this.getView().byId("id_invoiceno").setValueState('None');
				var vSelectedIndices = that.getView().byId("id_table").getSelectedIndices();
				if (vSelectedIndices.length > 0) {
					var vMsg = "Are you sure you want to post ?";

					if (!this._oConfirmDialog) {
						this._oConfirmDialog = sap.ui.xmlfragment(
							this.getView().getId(),
							"FSC360NEW.fragment.ConfirmDialog",
							this
						);
						this.getView().addDependent(this._oConfirmDialog);
					}
					this._oConfirmDialog.open();
					sap.ui.core.Fragment.byId(this.getView().getId(), "confirmText").setText(vMsg);

				} else {
					MessageToast.show('Select at least one entry to post');
				}
			} else {
				var vMsg;
				if (!vInvno) {
					this.getView().byId("id_invoiceno").removeStyleClass('cl_inp_ses ');
					this.getView().byId("id_invoiceno").addStyleClass('cl_inp_ses_err');
					this.getView().byId("id_invoiceno").setValueState('Error');
					vMsg = 'Enter Invoice Number';
				}

				if (vMsg) {
					that.fnShowErrorDialog(vMsg);

				}
			}

		},
		onConfirmYesPress: function() {
			this._oConfirmDialog.close();
		

			this.fnPostSES();
		},

		onConfirmNoPress: function() {
			this._oConfirmDialog.close();
	
		},
onDateChange: function(oEvent) {
    var oDate = oEvent.getSource().getDateValue();
    this.getView().getModel("JSDate").getData()[0].Aedat = formatter.fnBackendDate(oDate);
},
 normalizeToISO: function (sDate) {
            if (!sDate) return "";

            // Replace all separators with "-"
            sDate = sDate.replace(/[\/.]/g, "-").trim();

            // If already in ISO format (YYYY-MM-DD)
            if (/^\d{4}-\d{2}-\d{2}$/.test(sDate)) {
                return sDate;
            }

            // Split into parts
            var parts = sDate.split("-");
            if (parts.length !== 3) return "";

            let day, month, year;

            if (parts[0].length === 4) {
                // YYYY-MM-DD
                year = parts[0];
                month = parts[1];
                day = parts[2];
            } else if (parts[2].length === 4) {
                // DD-MM-YYYY (most common in SAP UI)
                year = parts[2];
                month = parts[1];
                day = parts[0];
            } else {
                return "";
            }

            // Pad with leading zeros if needed
            month = month.padStart(2, "0");
            day = day.padStart(2, "0");

            return `${year}-${month}-${day}`;
        },


		fnPostSES: function(oEvent) {
			oGlobalBusyDialog.open();
			var vPoNo = this.getView().byId("id_ponumber").getValue();
			var vHeaderTxt = this.getView().byId("id_headertxt").getValue();
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			// var oExistingData = that.getView().getModel('JMTab').getData().tab;
			var oItems = [];
			var oSelectedIndices = that.getView().byId('id_table').getSelectedIndices();
			var oSelecteddata = that.getView().byId('id_table').getModel('JSSesDet').getData();
			for (var i = 0; i < oSelectedIndices.length; i++) {
				var temp = {
					"Ebeln": oSelecteddata[oSelectedIndices[i]].Ebeln,
					"Ebelp": oSelecteddata[oSelectedIndices[i]].Ebelp,
					"Netwr": oSelecteddata[oSelectedIndices[i]].Netwr,
					"Meins": oSelecteddata[oSelectedIndices[i]].Meins,
					"Menge": oSelecteddata[oSelectedIndices[i]].Menge,
					"Ktext1": oSelecteddata[oSelectedIndices[i]].Ktext1,
					"Srvpos": oSelecteddata[oSelectedIndices[i]].Srvpos,
					'Packno': oSelecteddata[oSelectedIndices[i]].Packno,
					'Introw': oSelecteddata[oSelectedIndices[i]].Introw
				};
				oItems.push(temp);
			}

			var Invdate = this.getView().getModel("JSDate").getData()[0].Invdt;
			// var Budat = this.getView().getModel("JSDate").getData()[0].Aedat;
		var sBudat = this.getView().byId("id_podate").getValue(); //Added by Manosankari on 06.11.2025
	sBudat = this.normalizeToISO(sBudat);
		var Budat = new Date(sBudat + "T00:00:00");
		
			var oEntity = {
				Qid: vQid,
				Slno: vHeaderTxt,
				Invno: this.getView().byId("id_invoiceno").getValue(),
				Invdt: Invdate,
				Aedat: Budat
			};
			oEntity.NavSESGetDetails = oItems;
			oEntity.NavSESReturn = [];
			oModel.create("/SESHeadSet", oEntity, {
				success: function(oData, Response) {
					oGlobalBusyDialog.close();
					var type = oData.NavSESReturn.results[0].Type;
					if (type === 'S') {
						var aSuccess = oData.NavSESReturn.results;
						var sSuccessMsg = "";

						if (aSuccess && aSuccess.length > 0) {
							sSuccessMsg = aSuccess
								.map(function(msg) {
									return msg.Message;
								})
								.join("\n");
						}

						var oSuccessModel = new sap.ui.model.json.JSONModel({
							message: sSuccessMsg
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

						setTimeout(function() {
							if (that._oSuccessDialog && that._oSuccessDialog.isOpen()) {
								that._oSuccessDialog.close();
								that._oSuccessDialog.destroy();
								that._oSuccessDialog = null;

								that.fn_sesrefresh();
							}
						}, 3000);
					} else if (type === 'E') {
						var sErrorMsg = oData.NavSESReturn.results.map(function(msg) {
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
								that._oSuccessDialog.destroy();
								that._oSuccessDialog = null;

							}
						}, 3000);
					} else if (type === 'I') {
						var sSuccessMsg = oData.NavSESReturn.results[0].Message;
						var oSuccessModel = new sap.ui.model.json.JSONModel({
							message: sSuccessMsg
						});
						that.getView().setModel(oSuccessModel, "successModel");

						if (!that._oSuccessDialog) {
							that._oSuccessDialog = sap.ui.xmlfragment(
								"FSC360NEW.fragment.SuccessReuse",
								that
							);
							that.getView().addDependent(that._oSuccessDialog);
						}

						that._oSuccessDialog.open();

						setTimeout(function() {
							if (that._oSuccessDialog && that._oSuccessDialog.isOpen()) {
								that._oSuccessDialog.close();
								that.__oSuccessDialog.destroy();
								that.__oSuccessDialog = null;
								that.fn_sesrefresh();
							}
						}, 3000);

					}

				},
				error: function(oResponse) {
					oGlobalBusyDialog.close();
					sap.m.MessageToast.show('HTTP request failed');
				}
			});
		},
		fn_sesrefresh: function() {
			this.getView().byId("id_table").setVisible(true);

			if (this.getView().byId("id_scrll").getVisible() == false) {

			} else if (this.getView().byId("id_scrll").getVisible() == true) {

			}
			this.getView().byId('id_vendor').setValue('');
			this.getView().byId('id_ponumber').setValue('');
			this.getView().byId('id_headertxt').setValue('');
			this.getView().byId('id_podate').setValue('');
			this.getView().byId('id_sestext').setValue('');
			this.getView().byId('id_totalamount').setValue('');
			this.getView().byId("id_totalamount1").setValue("");
			this.getView().byId('id_invoiceno').setValue('');
			this.fn_LoadQid();
			this.getView().getModel('JSSesDet').setData([]);
			this.getView().byId('id_table').removeSelections(true);

		},

		onToggleFormLayout: function() {
			var oView = this.getView();
			var oCompact = oView.byId("idFormCompact");
			var oFull = oView.byId("idFormFull");
			var oContainer = oView.byId("idSesInputCont");
			var oLeftPanel = oView.byId("id_left_panel");

			var bCompactVisible = oCompact.getVisible();
			var bLeftPanelVisible = oLeftPanel.getVisible();

			oCompact.setVisible(!bCompactVisible);
			oFull.setVisible(bCompactVisible);

			// Update outer HBox width based on compact/full and left panel visibility
			if (!bCompactVisible) {
				// Switching to Compact view
				if (bLeftPanelVisible) {
					oContainer.setWidth("75%");
				} else {
					oContainer.setWidth("90%");
				}
			} else {
				// Switching to Full view
				if (bLeftPanelVisible) {
					oContainer.setWidth("45%");
				} else {
					oContainer.setWidth("65%");
				}
				oView.byId("idOpenBarcodePdf").setVisible(false);
				oView.byId("id_3rd_vbx").setVisible(true);

				oView.byId("id_Ses_post1").setVisible(true);
			}

			setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
		},
		fn_left_panel_collapse: function() {
			var oView = this.getView();
			var oleft = oView.byId("id_3rd_vbx");
			var bleftVisible = oleft.getVisible();
			if (!bleftVisible) {
				this.getView().byId("id_left_panel").setVisible(false);
				this.getView().byId("idSesInputCont").setWidth("100%");
				this.getView().byId("id_ses_left_open").setVisible(true);
			} else {
				this.getView().byId("idSesInputCont").setWidth("70%");
				this.getView().byId("id_left_panel").setVisible(false);

				this.getView().byId("id_3rd_vbx").setWidth("30%");
				this.getView().byId("id_ses_left_open").setVisible(true);
			}

		},
		fn_ses_left_open: function() {
			var oView = this.getView();
			var oright = oView.byId("id_3rd_vbx");
			var brightVisible = oright.getVisible();
			this.getView().byId("id_ses_left_open").setVisible(false);
			if (!brightVisible) {
				this.getView().byId("idSesInputCont").setWidth("75%");
				this.getView().byId("id_left_panel").setVisible(true);

			} else {
				this.getView().byId("id_left_panel").setVisible(true);
				this.getView().byId("idSesInputCont").setWidth("45%");
				this.getView().byId("id_3rd_vbx").setWidth("30%");
			}

		},
		_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".formInputB1").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});
			$view.find(".forminput3sec").each(function() {
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
		fn_fulfillrefresh: function() {
			location.reload();
		},

		onAfterRendering: function() {
			this._applyFlexGrow();

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
			setTimeout(function() {
				that.fn_onCloseErrorDialog();
			}, 3000);

		},
		fn_onCloseErrorDialog: function() {
			this._oErrorDialog.destroy();
			this._oErrorDialog = null;
			// this._oErrorDialog.close();
		},
		fn_closeSuccess: function() {
			this._oSuccessDialog.close();
			this._oSuccessDialog.destroy();
			this._oSuccessDialog = null;

		}

	});

});