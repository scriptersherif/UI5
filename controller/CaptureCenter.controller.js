sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageBox, MessageToast, Filter, FilterOperator, formatter, BusyIndicator) {
	"use strict";
	var vPlant, vFlag, Bukrs = '',
		bcode, QID, vFilename, Docid, errchk, errda, vfromdate, vtdate;
	var vclick = 'PO';
	var vData = [];
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	return Controller.extend("FSC360NEW.controller.CaptureCenter", {

		onInit: function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRoutePatternMatched(this.fn_loadInitial, this);

			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "Mymodel");
			var oModel = this.getView().getModel("Mymodel");
			oModel.setProperty("/potype", "true");
			oModel.setProperty("/nonpotype", "false");
			this.fnGetF4Help();
			this.fncompanycode();
			this.fn_getVendor();
			this.fnExpenseSearchHelp();
			var oViewData = this.getView().getViewData();
			if (oViewData && oViewData.appStateModel) {
				this.getView().setModel(oViewData.appStateModel, "appState");
			}
			if (!this._oConfirmDialog) {
				this._oConfirmDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ConfirmDialog", this);
				this.getView().addDependent(this._oConfirmDialog);
			}
			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");
			this.byId("idFileBox").attachBrowserEvent("click", this.onFileBoxClick.bind(this));
		},
		_openConfirmDialog: function(sMessage, oData) {

			// sap.ui.getCore().byId("confirmText").setText(sMessage);
			this._pendingData = oData; // store context if needed
			this._oConfirmDialog.open();

		},
		onConfirmYesPress: function() {
			this._oConfirmDialog.close();
			sap.ui.core.BusyIndicator.show(0);
			// this._oConfirmDialog.destroy();
			// this._oConfirmDialog = null;
			var that = this;
			var vFile = this._pendingFile;
			var vBarcode = this._pendingBarcode;
			var vpurchase = this._pendingPurchase;
			var comm = this._pendingComm;
			var vendor = this._pendingVendor;
			var vinvon = this._pendingVinvon;
			var invoDate = this._pendingInvoDate;
			var vamount = this._pendingAmount;
			var vcurrency = this._pendingCurrency;
			var oMultiComboBox = this.getView().byId("id_PO");
			var selectedPOs = oMultiComboBox.getSelectedKeys();
			vpurchase = selectedPOs[0];
			// Map into array of objects
			var Puord = selectedPOs.map(function(po) {
				return {
					Ebeln: po
				};
			});
			// var Puord = this._pendingPuord;
			var transtype = this.getView().byId("id_transactiontyp").getSelectedKey();

			var vThat = this;
			if (vBarcode == "") { //line added by yasin obn 16-10-2025
				errchk = true;
			} else {
				vThat.fn_barcode_check();
			}

			if (errchk === true) {
				var oModel = vThat.getView().getModel();
				var vSlug = vFile.name + '#' + vpurchase + '#' + vBarcode;
				sap.ui.core.BusyIndicator.show(0);
				var vTaskService = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet";

				jQuery.ajax({
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
						xhr.setRequestHeader("X-CSRF-Token", oModel.getSecurityToken());
						xhr.setRequestHeader("Content-Type", vFile.type);
						xhr.setRequestHeader("slug", vSlug);
					},
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						if (oData.d.Message === "") {
							if (oData.d.Doc !== "") {
								QID = oData.d.Qid;
								Docid = oData.d.Doc;
								vFilename = oData.d.Txturl;

								var oModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
								var obj = {
									Flag: 'B',
									IvText: comm.getValue(),
									NavHead: [{
										Qid: QID,
										Barcode: vBarcode,
										Lifnr: vendor,
										Invno: vinvon,
										Invdt: invoDate,
										Ntamt: vamount,
										Waers: vcurrency,
										Filename: vFilename,
										Transtype: transtype
									}],
									// NavGetItemValues: [{ Ebeln: Puord }]
									NavGetItemValues: Puord
								};
								var vThat = this;
								sap.ui.core.BusyIndicator.show(0);
								oModel2.create('/DEEPHEADSet', obj, {
									success: function() {
										sap.ui.core.BusyIndicator.hide();
										var aMessages = "QID " + QID + " Successfully Uploaded";
										sap.ui.core.BusyIndicator.hide();
										var oSuccessModel = new sap.ui.model.json.JSONModel({
											message: aMessages
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
												that.fnclear();
											}
										}, 3000);
										// sap.m.MessageBox.success("QID " + QID + " Successfully Uploaded");

									},

									error: function(oError) {
										sap.ui.core.BusyIndicator.hide();
										vThat.fnShowErrorDialog('Upload failed. Please try again.');

									}
								});

							} else {
								vThat.fnShowErrorDialog('Failed To Generate QID');

							}
						} else {
							var aMessages = oData.d.Message;
							var oErrorModel = new sap.ui.model.json.JSONModel({
								message: aMessages
							});
							that.getView().setModel(oErrorModel, "errorModel");

							if (!that._oErrorDialog) {
								sap.ui.core.BusyIndicator.hide();
								that._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.fragment.ErrorReuse", that);
								that.getView().addDependent(that._oErrorDialog);
							}

							that._oErrorDialog.open();

							setTimeout(function() {
								if (that._oErrorDialog && that._oErrorDialog.isOpen()) {
									that._oErrorDialog.close();
									that._oErrorDialog.destroy();
									that._oErrorDialog = null;
								}
							}, 2000);

						}
					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("Failed to Save Image");
					}
				});
			} else {
				sap.m.MessageToast.show("Please enter valid barcode");
			}

			// cleanup pending data
			this._pendingFile = null;
		},

		onConfirmNoPress: function() {
			this._oConfirmDialog.close();
			// this._oConfirmDialog.destroy();
			// this._oConfirmDialog = null;
			sap.m.MessageToast.show("Upload cancelled");
		},

		onConfirmDialogClose: function() {
			this._pendingData = null;
		},
		fnExpenseSearchHelp: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/SH_EXPENSE_TYPESSet", {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					// Create JSON Model
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSExpense");

					// Bind ComboBox items
					that.byId("id_exty").bindItems({
						path: "JSExpense>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSExpense>Expty}",
							text: "{JSExpense>Expty}"

						})
					});

				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					that.fnShowErrorDialog('HTTP Error while fetching Vendor list');

				}
			});
		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		onRadioSelectionChange: function(oEvent) {
			var selectedIndex = oEvent.getParameter("selectedIndex");
			if (selectedIndex === 0) {
				this.fn_POclick();
			} else if (selectedIndex === 1) {
				this.fn_NPOclick();
			}
		},
		fn_getVendor: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/KredaSet", {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
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

				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					that.fnShowErrorDialog('HTTP Error while fetching Vendor list');

				}
			});
		},
		onAfterRendering: function() {
			setTimeout(() => {
				this._applyFlexGrow("formInputB1", "cl_saleAmountBox1", "cl_combo_transBar");
			}, 0);
		},
		_applyFlexGrow: function(...aClassNames) {
			var $view = this.getView().$();
			aClassNames.forEach(function(sClassName) {
				$view.find("." + sClassName + ":visible").each(function() {
					if (this.parentElement) {
						this.parentElement.style.flexGrow = "1";
					}
				});
			});
		},

		fn_loadInitial: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			var oFlag = oArguments.cFlag;
			if (oFlag === 'D-Non Po' || oFlag === 'D-PO') {
				this.getView().byId("id_fnback").setVisible(true);
			} else {
				this.getView().byId("id_fnback").setVisible(false);
			}
			if (oFlag === 'D-Non Po') {
				this.getView().byId("rd2").setVisible(true);
				this.getView().byId("rd2").setSelected(true);
				this.getView().byId("rd1").setVisible(false);
				this.fn_NPOclick();
			} else if (oFlag === 'D-PO') {
				this.getView().byId("rd1").setVisible(true);
				this.getView().byId("rd1").setSelected(true);
				this.getView().byId("rd2").setVisible(false);
				this.fn_POclick();
			} else {
				this.getView().byId("rd1").setVisible(true);
				this.getView().byId("rd2").setVisible(true);
				this.getView().byId("rd1").setSelected(true);
				this.fn_POclick();

			}
		},
		fn_back: function() {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo('DashBoard');
			sap.ui.getCore().AppController.handleNavigationPress(null, "hboxDashboard");
		},
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			// To Get Vendor
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/KredaSet", {

				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSVendor');

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					that.fnShowErrorDialog('Http Error');

				}

			});
			sap.ui.core.BusyIndicator.show(0);
			// To Get Plant
			oModel.read("/HWerksSet", {

				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSPlant');

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					that.fnShowErrorDialog('Http Error');

				}

			});

			// To get user name...
			var val_flag = 'W';
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, val_flag)
					// new Filter("Qid", FilterOperator.EQ, QueueID)
				],
				urlParameters: {
					$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavDomain"

				},

				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0]);
					that.getView().setModel(oModel, 'JSusername');
					var transactionmodel = new sap.ui.model.json.JSONModel();
					transactionmodel.setData(oData.results[0].NavDomain.results);
					that.getView().setModel(transactionmodel, 'JSTransType');
					var oComboBox = that.getView().byId("id_transactiontyp");
					oComboBox.setSelectedKey("1");

				},
				error: function(oRes) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show('Http Error');

				}

			});

		},

		// To get Currency, GL account, Costcenter...
		fncompanycode: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var QueueID, Stats;

			QueueID = '';

			Stats = '';
			if (Bukrs === '') {
				Bukrs = '6000';
			}
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/DEEPHEADSet", {
				filters: [
					// new Filter("Qid", FilterOperator.EQ, QueueID),
					new Filter("Bukrs", FilterOperator.EQ, Bukrs)
					// new Filter("Stats", FilterOperator.EQ, Stats)
				],
				urlParameters: {
					$expand: "NavImgList,NavDebit,NavReldoc,NavBusPlace,NavGoodsType,NavChangeGRN,NavHead,NavHeadSt,NavDomain,NavGetItemValues,NavItemTabDetails,NavTransHis,NavCurrency,NavLifnr,NavHsnSrch,NavGetTax,NavSpecialGL,NavGLSrch,NavCost,NavPayTerm,NavPayBlock,NavWithHoldTax,NavTaxTab,NavSection,NavChecklist"

				},
				success: function(oData, oResponse) {

					sap.ui.core.BusyIndicator.hide();
					var aCurrencyList = oData.results[0].NavCurrency.results;
					var oCurrencyModel = new sap.ui.model.json.JSONModel({
						CurrencyList: aCurrencyList
					});

					that.getView().setModel(oCurrencyModel, "JSCurrency");
					var oSelect = that.getView().byId("id_currency");
					var aData = that.getView().getModel("JSCurrency").getProperty("/CurrencyList");

					oSelect.destroyItems();

					aData.forEach(function(item) {
						oSelect.addItem(new sap.ui.core.Item({
							key: item.Waers,
							text: item.Waers
						}));
					});

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavGLSrch.results);
					that.getView().setModel(oModel, 'JSGLAccount');
						that.byId("id_GL").bindItems({
							path: "JSGLAccount>/",
							length: oData.results[0].NavGLSrch.results.length,
							template: new sap.ui.core.ListItem({
								key: "{JSGLAccount>Saknr}",
								text: "{JSGLAccount>Saknr}",
								additionalText: "{JSGLAccount>Txt50}"
							})
						});

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavCost.results);
					that.getView().setModel(oModel, 'JSCostCenter');
					that.byId("id_cc").bindItems({
							path: "JSCostCenter>/",
							length: oData.results[0].NavCost.results.length,
							template: new sap.ui.core.ListItem({
								key: "{JSCostCenter>Kostl}",
								text: "{JSCostCenter>Kostl}",
								additionalText: "{JSCostCenter>Ktext}"
							})
						});
					
					var oModel = new sap.ui.model.json.JSONModel({
						Waers: "INR"
					}); // default
					that.getView().setModel(oModel, "JSSelectedCurrency");

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					that.fnShowErrorDialog('Http Error');

				}

			});

		},

		fnPOChange: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var vAgent = '';
			if (vclick === 'PO') {
				bcode = this.getView().byId('id_barcode').getValue();
				vPlant = bcode.slice(0, 4);
			} else if (vclick === 'NPO') {
				bcode = this.getView().byId('id_barcode').getValue();
				vPlant = bcode.slice(0, 4);
			}

			if (vFlag === 'A') {

				var vPlantFrom = this.getView().byId("id_frompoDate1").getValue();
				var vPlantTo = this.getView().byId("id_EndpoDate1").getValue();
				sap.ui.core.BusyIndicator.show(0);
				oModel.read("/AssignbcHeadSet", {
					filters: [
						new Filter("Werks", FilterOperator.BT, vPlant),
						new Filter("Erdat", FilterOperator.BT, vPlantFrom, vPlantTo),
						new Filter("Agent", FilterOperator.EQ, vAgent),
						new Filter("Flag", FilterOperator.EQ, vFlag)
					],
					urlParameters: {
						$expand: "NavBillentry,NavPurchaseOrder,NavConditiontype"

					},
					success: function(oData, Response) {
						sap.ui.core.BusyIndicator.hide();
						var oPoJson = new sap.ui.model.json.JSONModel();
						oPoJson.setData(oData.results[0].NavPurchaseOrder.results);
						that.getView().setModel(oPoJson, 'JSPO');

					},
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show('Failed to fetch Purchase Order');
					}
				});

				// To get companycode...
			} else if (vFlag === 'B') {
				sap.ui.core.BusyIndicator.show(0);
				oModel.read("/AssignbcHeadSet", {
					filters: [
						new Filter("Werks", FilterOperator.BT, vPlant),
						new Filter("Agent", FilterOperator.EQ, vAgent),
						new Filter("Flag", FilterOperator.EQ, vFlag)
					],

					success: function(oData, Response) {
						sap.ui.core.BusyIndicator.hide();
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results);
						that.getView().setModel(oModel, 'JSPO1');
						vData = that.getView().getModel('JSPO1').getData();
						Bukrs = vData[0].Bukrs;

					},
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show('HTTP error');
					}
				});

				this.fncompanycode();
			}

		},

		fn_barcode_check: function() {
			this.checkfn();
			var vcall;
			if (vclick === 'PO') {
				vcall = this.getView().byId('id_barcode');
			} else if (vclick === 'NPO') {
				vcall = this.getView().byId('id_barcode');
			}

			if (errchk === true) {
				vcall.setValueState(sap.ui.core.ValueState.None);
			} else if (errchk === false) {
				vcall.setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter a valid barcode number");
			}
		},

		checkfn: function() {
			var arr = [];
			arr = this.getView().getModel('JSPlant').getData();
			var vplant, vcode;
			if (vclick === 'PO') {
				vplant = this.getView().byId('id_barcode').getValue();
				vcode = vplant.slice(0, 4);
			} else if (vclick === 'NPO') {
				vplant = this.getView().byId('id_barcode').getValue();
				vcode = vplant.slice(0, 4);
			}
			errchk = false;
			for (var i = 0; i < arr.length; i++) {
				if (vcode === arr[i].Werks) {
					errchk = true;
					break;
				}
			}
		},

		fnchange_barcode1: function() {
			this.handleDateChange1();
			this.getView().byId("id_PO").setValue("");
			this.getView().byId("id_barcode").setValueState(sap.ui.core.ValueState.None);

			vFlag = '';
		},

		fnchange_barcode2: function() {

			vFlag = 'B';
			this.fnPOChange();
			this.getView().byId("id_GL").setValue("");
			this.getView().byId("id_cc").setValue("");
		},

		handleDateChange1: function() {
			var vPlantFrom = this.getView().byId("id_frompoDate1").getValue();
			var vPlantTo = this.getView().byId("id_EndpoDate1").getValue();
			if (vPlantFrom !== '' && vPlantTo !== '' && vPlantFrom >= vPlantTo) {
				this.getView().byId("id_frompoDate1").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("id_EndpoDate1").setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter valid date");
			} else if (vPlantFrom === '' && vPlantTo === '') {
				this.getView().byId("id_frompoDate1").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("id_EndpoDate1").setValueState(sap.ui.core.ValueState.None);
			} else if (vPlantFrom === '') {
				this.getView().byId("id_frompoDate1").setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter 'from date'");
			} else if (vPlantTo === '') {
				this.getView().byId("id_EndpoDate1").setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter 'to date'");
			} else {
				this.getView().byId("id_frompoDate1").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("id_EndpoDate1").setValueState(sap.ui.core.ValueState.None);
				vfromdate = this.getView().byId("id_frompoDate1").getValue();
				vtdate = this.getView().byId("id_EndpoDate1").getValue();

				vFlag = 'A';
				this.fnPOChange();

			}
		},

		handleDateChange2: function() {
			var vPlantFrom = this.getView().byId("id_frompoDate2").getValue();
			var vPlantTo = this.getView().byId("id_EndpoDate2").getValue();
			if (vPlantFrom !== '' && vPlantTo !== '' && vPlantFrom >= vPlantTo) {
				this.getView().byId("id_frompoDate2").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("id_EndpoDate2").setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter valid date");
			} else if (vPlantFrom === '' && vPlantTo === '') {
				this.getView().byId("id_frompoDate2").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("id_EndpoDate2").setValueState(sap.ui.core.ValueState.None);
			} else if (vPlantFrom === '') {
				this.getView().byId("id_frompoDate2").setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter 'from date'");
			} else if (vPlantTo === '') {
				this.getView().byId("id_EndpoDate2").setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter 'to date'");
			} else {
				this.getView().byId("id_frompoDate2").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("id_EndpoDate2").setValueState(sap.ui.core.ValueState.None);
				vfromdate = this.getView().byId("id_frompoDate2").getValue();
				vtdate = this.getView().byId("id_EndpoDate2").getValue();
				// this.fnvaliddate();
				// if (errda === true) {
				vFlag = 'B';
				this.fnPOChange();

			}

		},

		fn_pressupload: function() {
			this.getView().byId("id_close").setVisible(true);
			this.getView().byId("id_upload").setVisible(false);
			this.fnclear();
		},
		fn_pressclose: function() {
			this.getView().byId("id_close").setVisible(false);
			this.getView().byId("id_upload").setVisible(true);
			this.fnclear();
		},

		fn_POclick: function() {
			vclick = 'PO';
			var oModel = this.getView().getModel("Mymodel");
			if (!oModel) {
				oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel, "Mymodel");
			}
			oModel.setProperty("/potype", "true");
			oModel.setProperty("/nonpotype", "false");
			this.fnclear();

			// Apply flexGrow after UI updates
			setTimeout(() => {
				this._applyFlexGrow("formInputB1", "cl_saleAmountBox1", "cl_combo_transBar");
			}, 0);
		},

		fn_NPOclick: function() {
			vclick = 'NPO';
			var oModel = this.getView().getModel("Mymodel");
			if (!oModel) {
				oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel, "Mymodel");
			}
			oModel.setProperty("/potype", "false");
			oModel.setProperty("/nonpotype", "true");
			this.fnclear();

			setTimeout(() => {
				this._applyFlexGrow("formInputB1", "cl_saleAmountBox1", "cl_combo_transBar");
			}, 0);
		},

	
		fn_Invoicedate_change: function() {
			this.fn_getPO();
		},
		fn_getPO: function() {
 
			var oDateRange = this.getView().byId("id_PODateRange");
			console.log(oDateRange.getDateValue());
			var vPlantFrom = oDateRange.getDateValue(); // from date as Date object
			var vPlantTo = oDateRange.getSecondDateValue(); // to date as Date object
			vPlantFrom = new Date(vPlantFrom.setDate(vPlantFrom.getDate() ));
			vPlantTo = new Date(vPlantTo.setDate(vPlantTo.getDate() ))
			var vbarcode = this.getView().byId("id_barcode").getValue();
			var vFlag = 'A';
			var vPlant = vbarcode.substring(0, 4);
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/AssignbcHeadSet", {
				filters: [
					// new Filter("Werks", FilterOperator.BT, 6001),
					new Filter("Erdat", FilterOperator.BT, vPlantFrom, vPlantTo),
					// new Filter("Agent", FilterOperator.EQ, vAgent),
					new Filter("Flag", FilterOperator.EQ, vFlag)
				],
				urlParameters: {
					$expand: "NavBillentry,NavPurchaseOrder,NavConditiontype"
				},
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide();
					var oPoJson = new sap.ui.model.json.JSONModel();
					oPoJson.setData(oData.results[0].NavPurchaseOrder.results);
					that.getView().setModel(oPoJson, 'fn_PO_LC');
				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show('Failed to fetch Purchase Order');
				}
			});
		},
		fnPOConfrm_: function(oEvent) {
			var PO = oEvent.getParameter('selectedItem').getTitle();
			var PO_des = oEvent.getParameter('selectedItem').getDescription();
			this.getView().byId("id_PO").setValue(PO);
			oEvent.getSource().getBinding("items").filter('');

		},

		fn_PO_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);

		},



	

	
		fn_Head_Currency: function(oEvent) {
			var curr_name = oEvent.getParameter('selectedItem').getTitle();
			var ltext = oEvent.getParameter('selectedItem').getDescription();
			if (vclick === 'PO') {
				this.getView().byId("id_currency").setValue(curr_name);
			} else if (vclick === 'NPO') {
				this.getView().byId("id_currency").setValue(curr_name);
			}
			oEvent.getSource().getBinding("items").filter('');

		},
		fnclear: function() {

			// if (vclick === 'PO') {
			this.getView().byId("id_vendor").setValue("");
			this.getView().byId("id_barcode").setValue("");
			this.getView().byId("id_frompoDate1").setValue("");
			this.getView().byId("id_EndpoDate1").setValue("");
			this.getView().byId("id_invon").setValue("");
			this.getView().byId("id_invoDate").setValue("");
			this.getView().byId("id_transactiontyp").setValue("");
			this.getView().byId("id_PO").setSelectedKeys([]);
			this.getView().byId("id_comment").setValue("");
			this.getView().byId("id_amount").setValue("");
			this.getView().byId("id_currency").setValue("");
			this.getView().byId("id_currency_symb").setText("");
			this.getView().byId("id_PODateRange").setValue("");

			this.getView().byId("id_vendor").setValue("");
			this.getView().byId("id_vendor").setValue("");
			this.getView().byId("id_barcode").setValue("");
			this.getView().byId("id_invoDate").setValue("");
			// this.getView().byId("id_EndpoDate2").setValue("");
			this.getView().byId("id_invon").setValue("");
			this.getView().byId("id_comment").setValue("");
			this.getView().byId("id_cc").setValue("");
			this.getView().byId("id_GL").setValue("");
			this.getView().byId("id_exty").setValue("");
			this.getView().byId("id_amount").setValue("");
			this.getView().byId("id_currency").setValue("");

			this.onClearAll();

		},

		fnSave: function() {
			var that = this;
			var vendor, vendor1, barcode, invon, invondt, Puord, comm, vgla, vcostcc, vexpensety, amount, currency, vfile, transtype;
			if (vclick === 'PO') {
				vendor = this.getView().byId("id_vendor").getValue();
				vendor1 = this.getView().byId("id_vendor");
				barcode = this.getView().byId("id_barcode");

				invon = this.getView().byId("id_invon");

				var oMultiComboBox = this.getView().byId("id_PO");
				var Puord = oMultiComboBox.getSelectedKeys();
				comm = this.getView().byId("id_comment");
				amount = this.getView().byId("id_amount");
				currency = this.getView().byId("id_currency");
				vfile = this.getView().byId("fileuploader");

			} else if (vclick === 'NPO') {
				vendor = this.getView().byId("id_vendor").getValue();
				vendor1 = this.getView().byId("id_vendor");
				barcode = this.getView().byId("id_barcode");

				invon = this.getView().byId("id_invon");
				comm = this.getView().byId("id_comment");
				var vcostcc1 = this.getView().byId("id_cc").getValue();
				if (vcostcc1) {
					vcostcc = this.getView().byId("id_cc").getValue().split('-')[0].trim();
				}

				var vgla1 = this.getView().byId("id_GL").getValue();
				if (vgla1) {
					vgla = this.getView().byId("id_GL").getValue().split('-')[0].trim();
				}
				vexpensety = this.getView().byId("id_exty").getValue();
				amount = this.getView().byId("id_amount");
				currency = this.getView().byId("id_currency");
				vfile = this.getView().byId("fileuploader");
			}
			if (vendor != '') {
				vendor1.setValueState(sap.ui.core.ValueState.None);
				var vinvon = invon.getValue();
				var vbarcode = barcode.getValue();

				var vamount = amount.getValue();
				vamount = vamount.replace(",", "");
				var vcurrency = currency.getSelectedKey();
				var vfileupload = vfile.getValue();
				if (vinvon !== '' && vinvon.length > 16) {

					sap.m.MessageToast.show("Length of the Invoice-No should be less than 16");
				} else if (vinvon === '') {
					sap.m.MessageToast.show("Please enter the Invoice-No");
				} else if (vbarcode !== '' && vbarcode.length > 14) {
					sap.m.MessageToast.show("Length of the Barcode should be 14");
				} else if (vinvon !== '' && vinvon.length > 16) {

					sap.m.MessageToast.show("Length of the Invoice-No should be less than 16");
				} else if (vamount === '' || vcurrency === '') {
					sap.m.MessageToast.show("Please enter amount and currency");
				} else if (vfileupload === '') {
					sap.m.MessageToast.show("Please choose the file");
				} else if (vclick === 'PO') {
					var invoDate = this.getView().byId("id_invoDate").getDateValue();
					if (Puord === '') {
						sap.m.MessageToast.show("Please enter PO");
					} else if (invoDate === '') {
						sap.m.MessageToast.show("Please enter Invoice date");
					} else if (QID != '') {
						if (vbarcode == "") { //line added by yasin
							errchk = true;
							var vbarcodeManditory = true;

						} else {
							this.checkfn();
						}

						if (errchk === true) {

							var oError = "";
							var barcode = this.getView().byId('id_barcode').getValue();
							var vpurchase = this.getView().byId("id_PO").getValue();

							if (!(barcode || vbarcodeManditory)) {
								oError = oError + "Enter Barcode" + "\n";
								sap.m.MessageToast.show(oError);
								this.getView().byId('fileuploader').setValue("");
							} else {
								if (barcode.length > 14) {
									oError = oError + "Please check the length of barcode " + "\n";

									this.getView().byId('fileuploader').setValue("");

								} else {
									var vBarcode = barcode;
								}
								var vThat = this;
								var vError = false;
								var oFileUploader, vFileUploader;
								oFileUploader = sap.ui.getCore().byId("fileuploader");
								vFileUploader = this.getView().byId('fileuploader');

								var vFile = this.selectedFile;
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
									vFileUploader.setValueState('None');

									this._pendingFile = vFile;
									this._pendingBarcode = vBarcode;
									this._pendingPurchase = vpurchase;
									this._pendingComm = comm;
									this._pendingVendor = vendor;
									this._pendingVinvon = vinvon;
									this._pendingInvoDate = invoDate;
									this._pendingAmount = vamount;
									this._pendingCurrency = vcurrency;
									this._pendingPuord = Puord;

									if (!this._oConfirmDialog) {
										this._oConfirmDialog = sap.ui.xmlfragment(
											this.getView().getId(),
											"FSC360NEW.fragment.ConfirmDialog",
											this
										);
										this.getView().addDependent(this._oConfirmDialog);
									}

									// sap.ui.getCore().byId("confirmText").setText("Are you sure you want to upload file");
									// this._oConfirmDialog.open();
									// this._openConfirmDialog("Are you sure you want to upload file  ?", {
									// 	file: vFile
									// });
									// line added by yasin on 23-10-2025 start

									this._oConfirmDialog.open();
									sap.ui.getCore().byId("confirmText").setText("Are you sure you want to upload file");
									this._pendingData = {
										file: vFile
									};
									//line added by yasin on 23-10-2025 end

								}

							}

						} else if (errchk === false) {
							that.fnShowErrorDialog('Please enter valid barcode number');

						}
					}

				} else if (vclick === 'NPO') {
					var invoDate = this.getView().byId("id_invoDate").getValue();
					if (vgla === '') {
						sap.m.MessageToast.show("Please enter GL Account");
					} else if (vcostcc === '') {
						sap.m.MessageToast.show("Please enter Costcenter");
					} else if (vexpensety === '') {
						sap.m.MessageToast.show("Please enter Expense type");
					} else if (invoDate === "") {
						sap.m.MessageToast.show("Please enter Invoice Date");
					} else if (vfileupload === '') {
						sap.m.MessageToast.show("Please choose the file");
					} else if (QID != '') {
						this.checkfn();
						if (errchk === true) {

							var oError = "";
							var barcode;
							var vprocess;

							barcode = this.getView().byId('id_barcode').getValue();
							vprocess = 'NPO';

							if (!(barcode)) {
								oError = oError + "Enter Barcode" + "\n";
								sap.m.MessageToast.show(oError);

								this.getView().byId('fileuploader').setValue("");

							} else {
								if (barcode.length > 14) {
									oError = oError + "Please check the length of barcode " + "\n";

									this.getView().byId('fileuploader').setValue("");

								} else {
									var vBarcode = barcode;
								}
								var vThat = this;
								var vError = false;
								var oFileUploader, vFileUploader;
								oFileUploader = sap.ui.getCore().byId("fileuploader");
								vFileUploader = this.getView().byId('fileuploader');

								var vFile = this.selectedFile;
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
									vFileUploader.setValueState('None');
									sap.m.MessageBox.confirm('Are you sure you want to upload file po ?', {
										icon: sap.m.MessageBox.Icon.CONFIRMATION,
										title: "Confirmation",
										styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
										actions: ['Yes', 'No'],
										defaultAction: sap.m.MessageBox.Action.YES,
										onClose: function(oAction) {
											if (oAction === "Yes") {
												vThat.fn_barcode_check();
												if (errchk === true) {
													//====================Create Header Table Entry============================
													//sap.ui.core.BusyIndicator.show(10);
													sap.ui.core.BusyIndicator.show(0);
													var oModel = vThat.getView().getModel();
													var vSlug = vFile.name + '#' + vprocess + '#' + vBarcode;
													var vTaskService = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet";
													$.ajaxSetup({
														cache: false
													});
													jQuery.ajax({
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
																sap.ui.core.BusyIndicator.hide();
																QID = (oData.d.Qid);
																Docid = oData.d.Doc;
																vFilename = oData.d.Txturl;
																var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
																var obj = {};
																obj.Flag = 'B';
																obj.IvText = comm.getValue();
																obj.NavHead = [];
																obj.NavGetItemValues = [];
																invoDate = invoDate + "T00:00:00";

																var temp1 = {
																	// 'Assignedto': Current_User,
																	'Qid': QID,
																	'Barcode': vbarcode,
																	'Lifnr': vendor,
																	'Invno': vinvon,
																	'Invdt': invoDate,
																	'Ntamt': vamount,
																	'Waers': vcurrency,
																	//'Transtype': transtype,
																	'Filename': vFilename

																};
																obj.NavHead.push(temp1);
																var temp2 = {

																	'Saknr': vgla,
																	'Kostl': vcostcc

																};
																obj.NavGetItemValues.push(temp2);
																sap.ui.core.BusyIndicator.show(0);
																oModel.create('/DEEPHEADSet', obj, {

																	success: function(oData) {
																		sap.ui.core.BusyIndicator.hide();
																		var aMessages = "QID " + QID + " Successfully Uploaded";
																		var oSuccessModel = new sap.ui.model.json.JSONModel({
																			message: aMessages
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

																			}
																		}, 3000);

																		// sap.m.MessageBox.success();
																		vThat.fnclear();

																	},
																	error: function() {
																		sap.ui.core.BusyIndicator.hide();
																		that.fnShowErrorDialog('Error');

																		// sap.ui.core.BusyIndicator.hide();
																	}

																});
															} else {
																var vMsg1 = 'Failed To Generate QID';
																that.fnShowErrorDialog(vMsg1);

															}
														},
														error: function(oData) {
															sap.ui.core.BusyIndicator.hide();
															sap.m.MessageToast.show("Failed to Save Image");
														}
													});
												} else {

													sap.m.MessageToast.show("Please enter valid barcode");
												}
											}
										}
									});
									setTimeout(function() {
										var buttons = document.querySelectorAll(".fragmentButton .sapMBtn");
										if (buttons[0]) buttons[0].classList.add("yesButtonHack");
										if (buttons[1]) buttons[1].classList.add("noButtonHack");
									}, 100);
								}
							}
						}
					} else if (errchk === false) {
						that.fnShowErrorDialog('Please enter valid barcode number');

					}

				}
			} else {
				vendor1.setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter Vendor details");
			}

		},

		fn_capturerefresh: function() {
			this.fnclear();
		},

		fn_poview: function() {

			var vFlag = this.getView().byId("id_potype").getVisible();
			if (vFlag === true) {
				this.getView().byId("id_potype").setVisible(false);
				this.getView().byId('id_expandblueima').setVisible(true);
				this.getView().byId('id_expandima').setVisible(false);
			} else {
				this.getView().byId("id_potype").setVisible(true);
				this.getView().byId('id_expandblueima').setVisible(false);
				this.getView().byId('id_expandima').setVisible(true);
			}

		},

		fnamount: function() {

			var amt = Number(this.getView().byId('id_amount').getValue().replace(",", "")).toFixed(2);

			this.getView().byId('id_amount').setValue(amt);

		},
		fn_page_top: function() {
			if (this.getView().byId("id_potype").getVisible() == true) {
				this.getView().byId("id_potype").setVisible(false);
			} else {
				this.getView().byId("id_potype").setVisible(true);
			}
		},
		fnSave1: function() {

		},
		onFileBoxClick: function() {
			var oFileUploader = this.byId("fileuploader");
			var oFileInput = document.getElementById(oFileUploader.getId() + "-fu"); // Native file input element
			if (oFileInput) {
				oFileInput.value = "";
				oFileInput.click(); // Opens the file selection dialog
			}
		},

		onFileChange: function(oEvent) {
			var oFile = oEvent.getParameter("files")[0];
			if (oFile) {
				this.selectedFile = oFile;

				// Read and preview
				var reader = new FileReader();
				var that = this;
				reader.onload = function(e) {
					that.addPreviewToContainer(e.target.result, oFile.type, oFile.name);
				};
				reader.readAsDataURL(oFile);

				this.byId("fullbox_before").setVisible(false);
				this.byId("fullbox_after").setVisible(true);
				this.byId("idFileBox").setVisible(false);
				this.byId("idPreviewContainer").setVisible(true);
			}
		},

		onDragEnter: function(oEvent) {
			oEvent.preventDefault();
		},

		onDragOver: function(oEvent) {
			oEvent.preventDefault();
		},

		onFileDrop: function(oEvent) {
			oEvent.preventDefault();

			var files = oEvent.dataTransfer.files;

			if (files.length > 0) {
				var vFile = files[0];
				this.selectedFile = vFile;

				var vFileUploader = this.byId('fileuploader');
				vFileUploader.clear();
				vFileUploader.setValue(vFile.name);

				var nativeInputDomRef = jQuery.sap.domById(vFileUploader.getId() + "-fu");
				nativeInputDomRef.files = files;

				var oChangeEvent = new Event('change', {
					bubbles: true
				});
				nativeInputDomRef.dispatchEvent(oChangeEvent);

				sap.m.MessageToast.show("File " + vFile.name + " added. Click Save to upload.");
				this.byId("fullbox_before").setVisible(false);
				this.byId("fullbox_after").setVisible(true);
				this.byId("idFileBox").setVisible(false);
				this.byId("idPreviewContainer").setVisible(true);

				var reader = new FileReader();
				var that = this;
				reader.onload = function(e) {
					that.addPreviewToContainer(e.target.result, vFile.type, vFile.name);
				};
				reader.readAsDataURL(vFile);
			}
		},

		_base64ToUint8Array: function(base64) {
			var raw = atob(base64);
			var uint8Array = new Uint8Array(raw.length);
			for (var i = 0; i < raw.length; i++) {
				uint8Array[i] = raw.charCodeAt(i);
			}
			return uint8Array;
		},
		addPreviewToContainer: function(base64, fileType, fileName) {
			var oPreviewContainer = this.byId("idPreviewContainer");
			oPreviewContainer.removeAllItems(); // clear previous previews

			var oVBox = new sap.m.VBox({
				width: "auto",
				height: "auto",
				alignItems: "Center",
				justifyContent: "Center",
				class: "sapUiSmallMargin"
			});

			if (fileType.includes("image")) {
				oVBox.addItem(new sap.m.Image({
					src: base64,
					width: "300px",
					height: "300px",
					densityAware: false
				}));
				oVBox.addItem(new sap.m.Text({
					text: fileName,
					wrapping: true
				}));
				oPreviewContainer.addItem(oVBox);
			} else if (fileType.includes("pdf")) {
				var typedArray = this._base64ToUint8Array(base64.split(',')[1]);
				var that = this;

				pdfjsLib.getDocument({
					data: typedArray
				}).promise.then(function(pdf) {
					var pagePromises = [];

					for (let i = 1; i <= pdf.numPages; i++) {
						pagePromises.push(
							pdf.getPage(i).then(function(page) {
								var viewport = page.getViewport({
									scale: 1.5
								});
								var canvas = document.createElement("canvas");
								var context = canvas.getContext("2d");
								canvas.height = viewport.height;
								canvas.width = viewport.width;

								return page.render({
									canvasContext: context,
									viewport: viewport
								}).promise.then(function() {
									return canvas.toDataURL(); // resolve with image data URL
								});
							})
						);
					}

					// Wait for all pages to render
					Promise.all(pagePromises).then(function(images) {
						images.forEach(function(imgSrc, index) {
							var img = new sap.m.Image({
								src: imgSrc,
								width: "300px",
								height: "auto",
								densityAware: false
							});

							var pageBox = new sap.m.VBox({
								width: "auto",
								height: "auto",
								alignItems: "Center",
								justifyContent: "Center",
								styleClass: "sapUiSmallMarginEnd sapUiSmallMarginBottom"
							});
							pageBox.addItem(img);
							pageBox.addItem(new sap.m.Text({
								text: fileName + " - Page " + (index + 1),
								wrapping: true
							}));

							oPreviewContainer.addItem(pageBox);
						});
					});
				});
			} else {
				oVBox.addItem(new sap.m.Text({
					text: "Preview not available"
				}));
				oVBox.addItem(new sap.m.Text({
					text: fileName,
					wrapping: true
				}));
				oPreviewContainer.addItem(oVBox);
			}
		},
		onClearAll: function() {
			// Clear FileUploader value
			var oFileUploader = this.byId("fileuploader");
			if (oFileUploader) {
				oFileUploader.clear();
				oFileUploader.setValue("");
			}

			// Clear selected file reference
			this.selectedFile = null;

			// Remove all previews
			var oPreviewContainer = this.byId("idPreviewContainer");
			if (oPreviewContainer) {

				oPreviewContainer.removeAllItems();
			}

			this.byId("fullbox_before").setVisible(true);
			this.byId("fullbox_after").setVisible(false);
			this.byId("idFileBox").setVisible(true);
			this.byId("idPreviewContainer").setVisible(false);
			var that = this;
			setTimeout(function() {
				var oDragDropBox = that.byId("idDragDropBox").getDomRef();

				if (oDragDropBox) {
					oDragDropBox.removeEventListener("dragenter", that._dragEnterHandler);
					oDragDropBox.removeEventListener("dragover", that._dragOverHandler);
					oDragDropBox.removeEventListener("drop", that._dropHandler);

					that._dragEnterHandler = that.onDragEnter.bind(that);
					that._dragOverHandler = that.onDragOver.bind(that);
					that._dropHandler = that.onFileDrop.bind(that);

					oDragDropBox.addEventListener("dragenter", that._dragEnterHandler);
					oDragDropBox.addEventListener("dragover", that._dragOverHandler);
					oDragDropBox.addEventListener("drop", that._dropHandler);
				}

			}, 300); // Small delay to allow DOM to refresh

		},
		fn_reupload: function() {
			var that = this;

			// Clear previous file and preview
			this.selectedFile = null;
			this.onClearAll(); // resets preview & UI

			// Wait for DOM to update, then trigger file selection
			setTimeout(function() {
				var oFileUploader = that.byId("fileuploader");
				if (oFileUploader) {
					var oFileInput = document.getElementById(oFileUploader.getId() + "-fu");
					if (oFileInput) {
						oFileInput.value = ""; // reset input
						oFileInput.click(); // open file browser
					}
				}
			}, 200); // small delay to ensure DOM is ready
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
	});

});