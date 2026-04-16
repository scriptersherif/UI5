sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageToast',
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageToast, MessageBox, Filter, FilterOperator, BusyIndicator) {
	"use strict";
	var g_plant, oModel;
	var g_obj;
	return Controller.extend("FSC360NEW.controller.VendorOnboard", {

		onInit: function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRoutePatternMatched(this.fn_initial, this);
			this.fn_LoadData();
		},

		fn_initial: function() {

			oModel = this.getView().getModel();
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/RequestSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, 'F')
				],
				urlParameters: {
					$expand: "NavToPlant,NavToVendor,NavPurchase,NavDept,NavCompany,NavToReturn,NavOrg"
				},
				success: function(oData, oResponse) {

					sap.ui.core.BusyIndicator.hide();

					if (oData.results[0].NavToReturn.results.length == 0) {
						var oPlant = new sap.ui.model.json.JSONModel();
						var oVendorType = new sap.ui.model.json.JSONModel(oData.results[0].NavToVendor.results);

						var plant = oData.results[0].NavToPlant.results;

						oPlant.setData(plant);

						that.getView().setModel(oPlant, 'jsPlant');
						that.getView().setModel(oVendorType, 'jsVendor');
						that.byId("id_vendorTyp").bindItems({
							path: "jsVendor>/",
							length: oData.results[0].NavToVendor.results.length,
							template: new sap.ui.core.ListItem({
								key: "{jsVendor>DomvalueL}",
								text: "{jsVendor>DomvalueL}",
								additionalText: "{jsVendor>Ddtext}"
							})
						});

						var ODept = new sap.ui.model.json.JSONModel();
						var Dept = oData.results[0].NavDept.results;
						ODept.setData(Dept);
						that.getView().setModel(ODept, 'JSDept');
						that.byId("id_Department").bindItems({
							path: "JSDept>/",
							length: oData.results[0].NavDept.results.length,
							template: new sap.ui.core.ListItem({
								key: "{JSDept>Dept}",
								text: "{JSDept>Dept}",
								additionalText: "{JSDept>Text30}"
							})
						});
						var OBukrs = new sap.ui.model.json.JSONModel();
						var Bukrs = oData.results[0].NavCompany.results;
						OBukrs.setData(Bukrs);
						that.getView().setModel(OBukrs, 'jsCompany');

						var Opurchase = new sap.ui.model.json.JSONModel();
						var PurchaseGrp = oData.results[0].NavOrg.results;
						Opurchase.setData(PurchaseGrp);
						that.getView().setModel(Opurchase, 'JSPurchaseOrg');
						that.byId("id_Purchasegrp").bindItems({
							path: "JSPurchaseOrg>/",
							length: oData.results[0].NavOrg.results.length,
							template: new sap.ui.core.ListItem({
								key: "{JSPurchaseOrg>Ekorg}",
								text: "{JSPurchaseOrg>Ekorg}",
								additionalText: "{JSPurchaseOrg>Ekotx}"
							})
						});

						that.fnReadAccGrp();
					} else if (oData.results[0].NavToReturn.results[0].Type == 'E') {
						that.fnShowErrorDialog(oData.results[0].NavToReturn.results[0].Message);
					}
				},
				error: function(oRes) {
					sap.m.MessageToast.show('Http Error');
					sap.ui.core.BusyIndicator.hide();
				}

			});
			this.fn_clear();

		},
fn_LoadData: function() {

		var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
		if (oKeyDataModel) {
		    var oData = oKeyDataModel.getData();
		    var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
		    this.getView().setModel(oJSONUserName, "JSusername");
		}
		},
		fn_Purchase: function() {

			this.getView().byId('id_Purchasegrp').setValue();
			oModel = this.getView().getModel();
			var vBukrs = this.getView().byId('id_Bukrs').getValue().split('-')[0];
			var that = this;
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/RequestSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, 'G'),
					new Filter("Bukrs", FilterOperator.EQ, vBukrs)
				],
				urlParameters: {
					$expand: "NavToPlant,NavToVendor,NavOrg,NavDept"
				},
				success: function(oData, oResponse) {
					// MessageBox.success('Something');
					sap.ui.core.BusyIndicator.hide();

					var Opurchase = new sap.ui.model.json.JSONModel();
					var PurchaseGrp = oData.results[0].NavOrg.results;
					Opurchase.setData(PurchaseGrp);
					that.getView().setModel(Opurchase, 'JSPurchaseOrg');
					if (oData.results[0].NavOrg.results.length == 1) {
						that.getView().byId('id_Purchasegrp').setValue(oData.results[0].NavOrg.results[0].Ekorg + ' - ' + oData.results[0].NavOrg.results[
							0].Ekotx);
					}

				},
				error: function(oRes) {
					sap.m.MessageToast.show('Http Error');
					sap.ui.core.BusyIndicator.hide();
				}

			});

		},

		fn_mailCheck: function() {
			var email = this.getView().byId('id_email').getValue();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!mailregex.test(email)) {
				this.getView().byId('id_email').setValueState('Error');
				this.getView().byId('id_email').setValueStateText('Invalid Email Id');

				this.getView().byId('id_email').removeStyleClass('cl_inputBox');
				this.getView().byId('id_email').addStyleClass('cl_error');
			} else {
				this.getView().byId('id_email').setValueState('None');

				this.getView().byId('id_email').removeStyleClass('cl_error');
				this.getView().byId('id_email').addStyleClass('cl_inputBox');
			}

		},
	
		

		fn_liveChange: function() {
			var msg = '';
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			// id_email id_plant id_vendorTyp  id_name
			var oCombo = this.getView().byId('id_Bukrs');
			var department = this.getView().byId('id_Department');
			var purchasegrp = this.getView().byId('id_Purchasegrp');
			var accgrp = this.getView().byId('id_Accgrp');
			var vendortyp = this.getView().byId('id_vendorTyp');
			var oCombovalue = oCombo.getSelectedKey();
			var departmentvalue = department.getSelectedKey();
			var purchasegrpvalue = purchasegrp.getSelectedKey();
			var accgrpvalue = accgrp.getSelectedKey();
			var vendortypvalue = vendortyp.getSelectedKey();

			var email = this.getView().byId('id_email').getValue();
			if (!email) {
				msg = msg + 'Please Enter E-mail.\n';
				this.getView().byId('id_email').setValueState('Error');
				this.getView().byId('id_email').setValueStateText('Enter Email Id');

				this.getView().byId('id_email').removeStyleClass('cl_inputBox');
				this.getView().byId('id_email').addStyleClass('cl_error');

			} else {
				if (!mailregex.test(email)) {
					msg = msg + 'Invalid Email Id.\n';
					this.getView().byId('id_email').setValueState('Error');
					this.getView().byId('id_email').setValueStateText('Invalid Email Id');

					this.getView().byId('id_email').removeStyleClass('cl_inputBox');
					this.getView().byId('id_email').addStyleClass('cl_error');

				}
			}

			if (!oCombovalue) {
				msg = msg + 'Please Select Company Code.\n';

				oCombo.setValueState(sap.ui.core.ValueState.Error);
				oCombo.setValueStateText('Choose Company Code');
				oCombo.addStyleClass('cl_combo_error');
			} else {
				oCombo.setValueState(sap.ui.core.ValueState.None);
				oCombo.removeStyleClass('cl_combo_error');
			}

			if (!purchasegrpvalue) {
				msg = msg + 'Please Select Purchase Group.\n';
				purchasegrp.setValueState(sap.ui.core.ValueState.Error);
				purchasegrp.setValueStateText('Choose Purchase Group');
				purchasegrp.addStyleClass('cl_combo_error');
			} else {
				purchasegrp.setValueState(sap.ui.core.ValueState.None);
				purchasegrp.removeStyleClass('cl_combo_error');
			}
			if (!accgrpvalue) {
				msg = msg + 'Please Select Account Group.\n';
				accgrp.setValueState(sap.ui.core.ValueState.Error);
				accgrp.setValueStateText('Choose Account Group');
				accgrp.addStyleClass('cl_combo_error');
			} else {
				accgrp.setValueState(sap.ui.core.ValueState.None);
				accgrp.removeStyleClass('cl_combo_error');
			}
			if (!departmentvalue) {
				msg = msg + 'Please Select Department.\n';

				department.setValueState(sap.ui.core.ValueState.Error);
				department.setValueStateText('Chooese Department');
				department.addStyleClass('cl_combo_error');
			} else {
				department.setValueState(sap.ui.core.ValueState.None);
				department.removeStyleClass('cl_combo_error');
			}
			if (!vendortypvalue) {
				msg = msg + 'Please Select Vendor Type.\n';

				vendortyp.setValueState(sap.ui.core.ValueState.Error);
				vendortyp.setValueStateText('Chooese Vendor Type');
				vendortyp.addStyleClass('cl_combo_error');

			} else {
				vendortyp.setValueState(sap.ui.core.ValueState.None);
				vendortyp.removeStyleClass('cl_combo_error');
			}
			if (!name) {
				msg = msg + 'Please Enter a Name.\n';
				this.getView().byId('id_name').setValueState("Error");
				this.getView().byId('id_name').setValueStateText('Enter Name');

				this.getView().byId('id_name').removeStyleClass('cl_inputBox');
				this.getView().byId('id_name').addStyleClass('cl_error');
			} else {
				if (name.length < 2) {
					msg = msg + 'Name Must Contain Atleast 2 Characters.\n';

					this.getView().byId('id_name').setValueState("Error");
					this.getView().byId('id_name').setValueStateText('Enter Atleast 2 Characters');

					this.getView().byId('id_name').removeStyleClass('cl_inputBox');
					this.getView().byId('id_name').addStyleClass('cl_error');

				}
			}

		},

		fn_check: function(email, vendorType, name, Purchase, Dept, Accgrp, Company) {
			var msg = '';
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

			var oCombo = this.getView().byId('id_Bukrs');
			var department = this.getView().byId('id_Department');
			var purchasegrp = this.getView().byId('id_Purchasegrp');
			var accgrp = this.getView().byId('id_Accgrp');
			var vendortyp = this.getView().byId('id_vendorTyp');
			if (!email) {
				msg = msg + 'Please Enter E-mail.\n';
				this.getView().byId('id_email').setValueState('Error');
				this.getView().byId('id_email').setValueStateText('Enter Email Id');

				this.getView().byId('id_email').removeStyleClass('cl_inputBox');
				this.getView().byId('id_email').addStyleClass('cl_error');

			} else {
				if (!mailregex.test(email)) {
					msg = msg + 'Invalid Email Id.\n';
					this.getView().byId('id_email').setValueState('Error');
					this.getView().byId('id_email').setValueStateText('Invalid Email Id');

					this.getView().byId('id_email').removeStyleClass('cl_inputBox');
					this.getView().byId('id_email').addStyleClass('cl_error');

				}
			}

			if (!Company) {
				msg = msg + 'Please Select Company Code.\n';

				oCombo.setValueState(sap.ui.core.ValueState.Error);
				oCombo.setValueStateText('Choose Company Code');
				oCombo.addStyleClass('cl_combo_error');
			} else {
				oCombo.setValueState(sap.ui.core.ValueState.None);
				oCombo.removeStyleClass('cl_combo_error');
			}

			if (!Purchase) {
				msg = msg + 'Please Select Purchase Group.\n';
				purchasegrp.setValueState(sap.ui.core.ValueState.Error);
				purchasegrp.setValueStateText('Choose Purchase Group');
				purchasegrp.addStyleClass('cl_combo_error');
			} else {
				purchasegrp.setValueState(sap.ui.core.ValueState.None);
				purchasegrp.removeStyleClass('cl_combo_error');
			}
			if (!Accgrp) {
				msg = msg + 'Please Select Account Group.\n';
				accgrp.setValueState(sap.ui.core.ValueState.Error);
				accgrp.setValueStateText('Choose Account Group');
				accgrp.addStyleClass('cl_combo_error');
			} else {
				accgrp.setValueState(sap.ui.core.ValueState.None);
				accgrp.removeStyleClass('cl_combo_error');
			}
			if (!Dept) {
				msg = msg + 'Please Select Department.\n';

				department.setValueState(sap.ui.core.ValueState.Error);
				department.setValueStateText('Chooese Department');
				department.addStyleClass('cl_combo_error');
			} else {
				department.setValueState(sap.ui.core.ValueState.None);
				department.removeStyleClass('cl_combo_error');
			}
			if (!vendorType) {
				msg = msg + 'Please Select Vendor Type.\n';

				vendortyp.setValueState(sap.ui.core.ValueState.Error);
				vendortyp.setValueStateText('Chooese Vendor Type');
				vendortyp.addStyleClass('cl_combo_error');

			} else {
				vendortyp.setValueState(sap.ui.core.ValueState.None);
				vendortyp.removeStyleClass('cl_combo_error');
			}
			if (!name) {
				msg = msg + 'Please Enter a Name.\n';
				this.getView().byId('id_name').setValueState("Error");
				this.getView().byId('id_name').setValueStateText('Enter Name');

				this.getView().byId('id_name').removeStyleClass('cl_inputBox');
				this.getView().byId('id_name').addStyleClass('cl_error');
			} else {
				if (name.length < 2) {
					msg = msg + 'Name Must Contain Atleast 2 Characters.\n';

					this.getView().byId('id_name').setValueState("Error");
					this.getView().byId('id_name').setValueStateText('Enter Atleast 2 Characters');

					this.getView().byId('id_name').removeStyleClass('cl_inputBox');
					this.getView().byId('id_name').addStyleClass('cl_error');

				}
			}

			if (msg) {

				this.fn_display_error_msg(msg);
				return false;
			}
			return true;

		},
		fn_onSumbit: function() {
			var email = this.getView().byId('id_email').getValue();

			var Company = this.getView().byId('id_Bukrs').getValue();

			var vendorType = this.getView().byId('id_vendorTyp').getValue();
			var name = this.getView().byId('id_name').getValue();

			var AccGrp = this.getView().byId('id_Accgrp').getValue();
			var Purchase = this.getView().byId('id_Purchasegrp').getValue();
			var Dept = this.getView().byId('id_Department').getValue();
			var vend, Desc;
			// id_email id_plant id_vendorTyp  id_name
			if (this.fn_check(email, vendorType, name, Purchase, Dept, AccGrp, Company)) {

				var oVendor = this.getView().getModel('jsVendor').getData();
				for (var i = 0; i < oVendor.length; i++) {
					if (oVendor[i].Ddtext === vendorType) {
						vend = oVendor[i].DomvalueL;
						Desc = oVendor[i].Ddtext;
					}
				}

				var obj = {
					'Werks': g_plant,
					'Bukrs': Company.split('-')[0].trim(),
					'Name1': name,
					'Email': email,
					// 'Gstno': gstno,
					'Ktokk': AccGrp.split('-')[0].trim(),
					'Ventype': vend,
					'Dept': Dept.split('-')[0].trim(),
					'Ekorg': Purchase.split('-')[0].trim(),
					'Ventypedesc': Desc,
					'Flag': 'V'
				};

				obj.NavToReturn = [];

				obj.NavtoDuplicate = [];

				this.fn_checkLifnr(obj);
			}
		},

		fn_checkLifnr: function(obj) {
			g_obj = obj;

			var that = this;

			sap.ui.core.BusyIndicator.show(0);
			oModel.create('/RequestSet', obj, {
				success: function(oData) {
					g_obj = obj;

					sap.ui.core.BusyIndicator.hide();
					var msgtyp = oData.NavToReturn.results[0].Type;
					var msg = oData.NavToReturn.results[0].Message;
					if (msgtyp === 'E') {

						var oVendor = new sap.ui.model.json.JSONModel();
						var vendor = oData.NavtoDuplicate.results;
						oVendor.setData(vendor);
						that.getView().setModel(oVendor, 'jsMatchVen');
						// that.fn_display_check();
						that.fnShowErrorDialog(msg);
					} else if (msgtyp === 'S') {

						that.fn_display_confirm();
					}
				},
				error: function(oRes) {

					sap.ui.core.BusyIndicator.hide();
					that.fnShowErrorDialog(oRes.message);

				}
			});

		},

		fn_proceed: function(obj) {

			var that = this;
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			sap.ui.core.BusyIndicator.show(0);
			oModel.create('/RequestSet', obj, {
				success: function(oData) {

					var msgtyp = oData.NavToReturn.results[0].Type;
					var msg = oData.NavToReturn.results[0].Message;
					sap.ui.core.BusyIndicator.hide();
					if (msgtyp === 'S') {

						that.fn_display_success(msg);
						that.fn_clear();
					} else {

						that.fnShowErrorDialog(msg);
					}
				},
				error: function(oRes) {

					that.fnShowErrorDialog("Http error");
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

	

		

		fn_clear: function() {
			this.getView().byId('id_email').setValue('');

			this.getView().byId('id_Bukrs').setValue('');

			this.getView().byId('id_vendorTyp').setSelectedKey('');
			this.getView().byId('id_name').setValue('');

			this.getView().byId('id_Accgrp').setValue('');
			this.getView().byId('id_Purchasegrp').setValue('');
			this.getView().byId('id_Department').setValue('');

			this.getView().byId('id_email').setValueState('None');
			this.getView().byId('id_email').removeStyleClass('cl_error');
			this.getView().byId('id_email').addStyleClass('cl_inputBox');

			this.getView().byId('id_Bukrs').setValueState('None');
			this.getView().byId('id_Bukrs').removeStyleClass('cl_error');
			this.getView().byId('id_Bukrs').addStyleClass('cl_inputBox');

			this.getView().byId('id_Accgrp').setValueState('None');
			this.getView().byId('id_Accgrp').removeStyleClass('cl_error');
			this.getView().byId('id_Accgrp').addStyleClass('cl_inputBox');
			this.getView().byId('id_Purchasegrp').setValueState('None');
			this.getView().byId('id_Purchasegrp').removeStyleClass('cl_error');
			this.getView().byId('id_Purchasegrp').addStyleClass('cl_inputBox');
			this.getView().byId('id_Department').setValueState('None');
			this.getView().byId('id_Department').removeStyleClass('cl_error');
			this.getView().byId('id_Department').addStyleClass('cl_inputBox');

			this.getView().byId('id_vendorTyp').removeStyleClass('cl_combo_error');
			this.getView().byId('id_vendorTyp').addStyleClass('cl_combo');

			this.getView().byId('id_name').setValueState('None');
			this.getView().byId('id_name').removeStyleClass('cl_error');
			this.getView().byId('id_name').addStyleClass('cl_inputBox');

			this.getView().byId('id_Accgrp').setValueState('None');
			this.getView().byId('id_Accgrp').removeStyleClass('cl_error');
			this.getView().byId('id_Accgrp').addStyleClass('cl_inputBox');

		},
	
		fn_display_check: function() {
			if (!this.errorFrag) {
				this.errorFrag = sap.ui.xmlfragment("FSC360NEW.fragment.error", this);
				this.getView().addDependent(this.errorFrag);
			}
			this.errorFrag.open();
		},
		fn_display_success: function(msg) {
			if (!this.successFrag) {
				this.successFrag = sap.ui.xmlfragment("FSC360NEW.fragment.success", this);
				this.getView().addDependent(this.successFrag);
			}
			this.successFrag.open();
			sap.ui.getCore().byId('id_successText').setText(msg);
		},
		fn_display_confirm: function() {
			if (!this.confirmFrag) {
				this.confirmFrag = sap.ui.xmlfragment(this.getView().getId(), "FSC360NEW.fragment.ConfirmDialog", this);
				this.getView().addDependent(this.confirmFrag);
			}
			this.confirmFrag.open();
			sap.ui.core.Fragment.byId(this.getView().getId(), "confirmText").setText("Do you want to continue?");

		},
		fn_display_error_msg: function(msg) {
			if (!this.inpErrorFrag) {
				this.inpErrorFrag = sap.ui.xmlfragment("FSC360NEW.fragment.inputError", this);
				this.getView().addDependent(this.inpErrorFrag);
			}
			this.inpErrorFrag.open();
			sap.ui.getCore().byId('id_errorText').setText(msg);
		},
		fn_close_error: function() {
			this.inpErrorFrag.close();
		},
		onConfirmNoPress: function() {
			this.confirmFrag.close();
			MessageToast.show('Request cancled by the user');
		},
		onConfirmYesPress: function() {
			this.confirmFrag.close();
			g_obj.Flag = 'P';
			this.fn_proceed(g_obj);
		},
		fn_ignoreAndCont: function() {
			this.errorFrag.close();
			g_obj.Flag = 'P';
			this.fn_proceed(g_obj);
		},
		fn_ignorerReq: function() {
			this.errorFrag.close();
			MessageToast.show('Request cancled by the user');

		},
		fn_closeSuccess: function() {
			this.successFrag.close();
		},

		fnReadAccGrp: function() {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			oModel.read("/HT077kSet", {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var ACCGrpJson = new sap.ui.model.json.JSONModel();
					ACCGrpJson.setData(oData.results);
					that.getView().setModel(ACCGrpJson, "JSAccGrp");
					that.byId("id_Accgrp").bindItems({
						path: "JSAccGrp>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSAccGrp>Ktokk}",
							text: "{JSAccGrp>Ktokk}",
							additionalText: "{JSAccGrp>Txt30}"
						})
					});

				},
				error: function(response) {
					sap.ui.core.BusyIndicator.hide();
				}

			});
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
			}, 2000);

		},
		fn_onCloseErrorDialog: function() {
			this._oErrorDialog.destroy();
			this._oErrorDialog = null;
			// this._oErrorDialog.close();
		}

	});

});