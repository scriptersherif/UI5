sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/ui/model/Sorter", "sap/ui/model/FilterOperator", "sap/ui/model/Filter",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/Currency",
	"FSC360NEW/model/formatter"

], function(Controller, MessageBox, Sorter, FilterOperator, Filter, NumberFormat, Currency, formatter) {
	"use strict";
	var v_compcode;
	var doc_num;
	var message;
	var vTrans = [];
	var v_housebank;
	var mode_1;
	var v_mode;
	var v_payloc;
	var flag_err = 0;
	var vTotal = 0;
	var Vmsgtxt = '';
	var Mode;
	var uname_1;
	var first_letter;
	var Id;
	var Payamt;
	var Indi;
	var flag;
	var pay_loc;
	var comment;
	var SuccessInd = "";
	var Comments_Rem;

	return Controller.extend("FSC360NEW.controller.PayWBFinal", {

		onInit: function(oEvent) {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this); // <-- FIX
				 this.oRouter.attachRoutePatternMatched(this.fn_radio, this);
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.attachRoutePatternMatched(this.ready, this);
			this.fn_user();
			 
			var obj = {};
			obj.Flag = 'B';
			obj.NavPay = [];
			obj.navPay2 = [];
			var that = this;
			var oErrorModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			var oSuccessModel = new sap.ui.model.json.JSONModel({
				message: ""
			});
			this.getView().setModel(oSuccessModel, "successModel");

			this.getView().setModel(oErrorModel, "errorModel");
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			oModel.create('/OpenSet', obj, {
				success: function(oData, Response) {
					var oModel1 = new sap.ui.model.json.JSONModel();
					oModel1.setData(oData.NavPay.results);
					that.getView().setModel(oModel1, "MId");

					var oModel2 = new sap.ui.model.json.JSONModel();
					oModel2.setData(oData.navPay2.results);
					that.getView().setModel(oModel2, "MProfit1");
					that.ready();
				},
				error: function() {
					that.openErrorDialog("Error!");
					that._loadRemarksFragment();
					that._loadRemarksFragment();
					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});
			

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
		_loadRemarksFragment: function() {
			if (!this.Remarks) {
				this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksPayLoc", this);
				this.getView().addDependent(this.Remarks);
			}
		},

		fn_work: function(oEvent) {
			this.oRouter.navTo("PaymentWorkbench");
			location.reload();

		},
		fn_appr: function(oEvent) {
			this.oRouter.navTo("PayWB-Approver");
			location.reload();

		},
			 fn_radio: function(){
		 	 var oRadioGroup = this.byId("idViewSelector");

// Select "PayWB Final"
oRadioGroup.setSelectedIndex(2); 
		 },
		fn_user: function() {
		
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var v_flag = 'U';
			oModel.read("/NameSet('" + v_flag + "')", {

				success: function(oData) {
					uname_1 = oData.UserName;
					that.getView().byId("id_uname").setText(uname_1);
					first_letter = uname_1.charAt(0);
					//that.getView().byId("id_user").setText(first_letter);
				},
				error: function() {}
			});
		},
		ready: function(oEvent) {
			// var page_name = oEvent.getParameter("name");
			// if (page_name === "Processing") {

			//  this.fn_editSec();
			//  vTrans = [];
			//  // this.onSelectAll();
			//  var data_len_check = this.getView().getModel('MOpenitems').getData().length;
			//  if (data_len_check === undefined) {
			//    sap.ui.core.UIComponent.getRouterFor(this).navTo("Items");
			//  } else {
			// v_compcode = oEvent.getParameters().arguments.c1;
			// var uname1 = oEvent.getParameters().arguments.c2;
			// var first = oEvent.getParameters().arguments.c3;
			// var global = this.getView().getModel('MOpenitems').getData();

			// this.getView().byId("id_uname").setText(uname1);
			// this.getView().byId("id_unameF").setText(first);
			// this.getView().byId("id_submit").setText("Submit (0)");
			// this.getView().byId("id_msme1").setText(0);
			// this.getView().byId("id_msmeselected").setText(0);
			this.getView().byId("id_totalamo").setText(0);
			this.getView().byId("id_actamo").setText(0);
			vTotal = 0;
			this.getView().byId("id_bankbalance").setText(0);
			//.......

			//window.cookies.clear(function() {
			//oModel = '';
			// });
			// this.getHouseBank();

			// this.getView().byId("id_tablepay").selectAll();
			// this.getPaymentLoc();

			// var v_model = this.getView().getModel('Mopen');
			// v_model.refresh();
			// this.getView().byId("id_tablepay").selectAll();
			// this.onSelectAll();

			//  }
			// }
			// this.onSelectAll();
			// this.getView().byId("id_tablepay").clearSelection();
			//this.getView().byId("id_tablepay").selectAll();
		},
		getHouseBank: function() {
			var v_flag = 'H';
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();
			var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			Filters.push(CompanyCodeFlag, comcode);
			oModel.read("/HouseBankSet", {
				filters: [
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode)
				],

				success: function(oData) {
					var JsonoModel = new sap.ui.model.json.JSONModel();
					JsonoModel.setData(oData.results);
					that.getView().setModel(JsonoModel, "MHouseBank");
					BI.close();
					// var uname = oData.results.UserName;
					// that.getView().byId("id_uname").setText(uname);
					// var first_letter = uname.charAt(0);
					// that.getView().byId("id_unameF").setText(first_letter);
					// var bankbalance = oData.results.Balance;
					// bankbalance = bankbalance / 100000;
					// that.getView().byId("id_bankbalance").setText(bankbalance);

					// that.onSelectOpenItems();
				},
				error: function() {
					BI.close();
					this.openErrorDialog("Error!");

					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});
			this.fnGetModeF4();
		},
		getGLAccount: function() {
			var v_flag = 'G';
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();
			// var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			Filters.push(comcode);
			// var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			// var house = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, v_housebank);
			// Filters.push(comcode, house);
			oModel.read("/AccountSet", {
				filters: Filters,
				success: function(oData) {
					var JsonoModel = new sap.ui.model.json.JSONModel();
					JsonoModel.setData(oData.results);
					that.getView().setModel(JsonoModel, "MGLAccount");
					BI.close();
				},
				error: function() {
					BI.close();
					this.openErrorDialog("Error!");

					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});
			this.fnGetModeF4();
		},
		// onSelectAll:function()
		// {
		// this.getView().byId("id_tablepay").clearSelection();
		//this.getView().byId("id_tablepay").selectAll();
		//    var v_model = this.getView().getModel('Mopen');
		//      v_model.refresh();
		//      // v_model.destroy();
		//      // this.getView().byId("id_tablepay").selectAll();
		//      // this.onSelectAll();
		//      this.getView().byId("id_tablepay").clearSelection();
		//       this.getView().byId("id_tablepay").selectAll();

		// },
		onPressBack: function() {
			var arr_com_glo1 = this.getView().getModel('JComp');

			arr_com_glo1.setData(arr_com_glo1);
			arr_com_glo1.refresh();
			if (Vmsgtxt !== '') {
				arr_com_glo1.FlagSave = "S"; //Added by Sakthi C on 01.09.2023
				arr_com_glo1.Flag = "Y";
			} else {
				arr_com_glo1.FlagSave = "B";
			}
			this.getView().setModel(arr_com_glo1, "JComp");

			// this.getView().byId("id_tablepay").clearSelection();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Items");

			this.onclear1();

		},
		getPaymentLoc: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var Filters = [];
			var CompanyCodeFlag = new sap.ui.model.Filter("ZfieldRef", sap.ui.model.FilterOperator.EQ, v_compcode);
			Filters.push(CompanyCodeFlag);
			oModel.read("/PaymentLocSet", {
				filters: Filters,
				success: function(oData) {

					var JsonoModel = new sap.ui.model.json.JSONModel();
					JsonoModel.setData(oData.results);
					that.getView().setModel(JsonoModel, "MPaymentLoc");

				},
				error: function() {}
			});

		},

		onValueHelpRequestedglacc: function() {
			var hous = this.getView().byId("id_housebank").getValue();
			// if (hous !== "") {
			if (!this.Value3) {
				this.Value3 = sap.ui.xmlfragment("FSC360NEW.Fragment.GLAccount", this);
				this.getView().addDependent(this.Value3);
			}
			this.Value3.open();
			// } else {
			//  // MessageBox.error(" Please select Bank! ", {

			//  //  actions: ["OK"],

			//  //  onClose: function(nAction) {
			//  //    if (nAction === "OK") {}
			//  //  }
			//  // });

			// }
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

		OnSelectGLAccount: function(oEvent) {
			var glacc = this.getView().byId("id_glacc").getValue();

			if (typeof oEvent !== "undefined") {
				var gl = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
				this.getView().byId("id_glacc").setValue(gl);
			} else {
				gl = glacc;
				this.getView().byId("id_housebank").setValueState("None");
			}
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			var house = new sap.ui.model.Filter("Ukont", sap.ui.model.FilterOperator.EQ, gl);
			Filters.push(comcode, house);
			oModel.read("/AccountSet", {
				filters: Filters,
				success: function(oData) {
					if (oData.results.length === 1) {
						that.getView().byId("id_housebank").setValue(oData.results[0].Hbkid);
						that.fnBalance();
						// var value_hbkid = oData.results[0].Ukont;
						// var len_hbkid = value_hbkid.length - 1;

					}

					BI.close();
				},
				error: function() {
					BI.close();
					this.openErrorDialog("G/L Account not Maintained!");

					//MessageBox.error("G/L Account not Maintained! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}

			});
			if (this.Value3) {
				// oBinding.filter(allFilter);
				// oBinding.filter([]);
				oEvent.getSource().getBinding("items").filter([]);
				this.Value3.close();
			}

			this.fnBalance();

		},
		fnBalance: function() {
			var v_flag = 'B';
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			// this.ValueSuccess.close();
			var BI = new sap.m.BusyDialog();
			BI.open();
			var hkont = this.getView().byId("id_glacc").getValue();
			// var v_housebank =  this.getView().byId("id_housebank").getValue();
			// var v_housebank2 =   v_housebank.substring(0, v_housebank.indexOf('-'));
			var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			var glacc = new sap.ui.model.Filter("Hkont", sap.ui.model.FilterOperator.EQ, hkont);
			// var house = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, v_housebank);
			Filters.push(CompanyCodeFlag, comcode, glacc);
			oModel.read("/AccBalanceSet", {
				filters: Filters,
				// urlParameters: {
				//  $expand: "NavCompanyCode,NavGLAccount,NavHouseBank,NavModeOfPay,NavPay,NavProfitCenter,NavVendor,NavCheckLot"
				// },
				success: function(oData) {
					// var JsonoModel = new sap.ui.model.json.JSONModel();
					// JsonoModel.setData(oData.results[0].NavGLAccount.results);
					// that.getView().setModel(JsonoModel, "MGLAccount");
					if (oData.results.length !== 0) {
						var bankbalance = parseFloat(oData.results[0].Balance);
						bankbalance = bankbalance / 100000;
						that.getView().byId("id_bankbalance").setText(bankbalance);
						var gl_acc = oData.results[0].Hkont;
						that.getView().byId("id_glaccount").setText(gl_acc);
						BI.close();
					} else {
						BI.close();
					}
				},
				error: function() {
					BI.close();
					this.openErrorDialog("Error!");

					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}

			});
		},
		onValueHelpRequestedHouseBank: function() {
			if (!this.Value2) {
				this.Value2 = sap.ui.xmlfragment("FSC360NEW.Fragment.HouseBank", this);
				this.getView().addDependent(this.Value2);
			}
			this.Value2.open();
		},
		OnSelectHouseBank: function(oEvent) {
			var housebk = this.getView().byId("id_housebank").getValue();

			if (typeof oEvent !== "undefined") {
				v_housebank = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
				this.getView().byId("id_housebank").setValue(v_housebank);
			} else {
				v_housebank = housebk;
			}
			// this.getView().byId("id_submit").setEnabled(true);

			var v_flag = 'G';
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			// this.ValueSuccess.close();
			var BI = new sap.m.BusyDialog();
			BI.open();
			// var v_housebank =  this.getView().byId("id_housebank").getValue();
			// var v_housebank2 =   v_housebank.substring(0, v_housebank.indexOf('-'));
			// var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			var house = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, v_housebank);
			Filters.push(comcode, house);
			oModel.read("/AccountSet", {
				filters: Filters,
				success: function(oData) {
					// var JsonoModel = new sap.ui.model.json.JSONModel();
					// JsonoModel.setData(oData.results);
					// that.getView().setModel(JsonoModel, "MGLAccount");
					if (oData.results.length === 1) {
						that.getView().byId("id_glacc").setValue(oData.results[0].Ukont);
						that.fnBalance();
						var value_hbkid = oData.results[0].Ukont;
						var len_hbkid = value_hbkid.length - 1;

						// var v_zero = value_hbkid.charAt(len_hbkid);
						// if (v_zero === '0') {
						//  MessageBox.error("Select the correct outgoing GL account!", {

						//    actions: ["OK"],

						//    onClose: function(nAction) {
						//      if (nAction === "OK") {}
						//    }
						//  });
						// }

					}
					// var bankbalance = parseFloat(oData.results[0].Balance);
					// that.getView().byId("id_bankbalance").setText(bankbalance);

					BI.close();
				},
				error: function() {
					BI.close();
					this.openErrorDialog("G/L Account not Maintained! ");

					//MessageBox.error("G/L Account not Maintained! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}

			});
			if (this.Value2) {
				// oBinding.filter(allFilter);
				// oBinding.filter([]);
				oEvent.getSource().getBinding("items").filter([]);
				// this.Value2.close();
			}

			// oModel.read("/HeadSet", {
			//  filters: Filters,
			//  urlParameters: {
			//    $expand: "NavGLAccount"
			//  },
			//  success: function(oData) {
			//    var JsonoModel = new sap.ui.model.json.JSONModel();
			//    JsonoModel.setData(oData.results[0].NavGLAccount.results);
			//    that.getView().setModel(JsonoModel, "MGLAccount");
			//    var bankbalance = parseFloat(oData.results[0].Balance);
			//    that.getView().byId("id_bankbalance").setText(bankbalance);
			//    if (oData.results[0].NavGLAccount.results.length === 1) {
			//      that.getView().byId("id_glacc").setValue();
			//    }
			//    BI.close();
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

		},
		onValueHelpRequestedMode: function() {
			if (!this.Value4) {
				this.Value4 = sap.ui.xmlfragment("FSC360NEW.Fragment.Mode", this);
				this.getView().addDependent(this.Value4);
			}
			this.Value4.open();
			this.fnGetModeF4();

			// oModel.read("/HeadSet", {
			//  filters: Filters,
			//  urlParameters: {
			//    $expand: "NavModeOfPay"
			//  },
			//  success: function(oData) {
			//    var JsonoModel = new sap.ui.model.json.JSONModel();
			//    JsonoModel.setData(oData.results[0].NavModeOfPay.results);
			//    that.getView().setModel(JsonoModel, "MModeOfPay");
			//    BI.close();
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

		},
		fnGetModeF4: function() {

			var v_flag = 'H';
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();
			var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			Filters.push(CompanyCodeFlag, comcode);
			oModel.read("/ModeSet", {
				filters: [
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode)
				],
				success: function(oData) {
					BI.close();
					var JsonoModel = new sap.ui.model.json.JSONModel();
					JsonoModel.setData(oData.results);

					that.getView().setModel(JsonoModel, "MModeOfPay");
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].Zlsch == 'D') {
							that.getView().byId("id_modecode").setValue(oData.results[i].Zlsch);
							break;
						}
					}

				},
				error: function() {
					BI.close();
					this.openErrorDialog("Error!");

					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});

		},
		onPressSubmitfordirectPay: function() {

			if (Vmsgtxt === '') { //Added by Sakthi C on 31.08.2023 for restricting to save after doc no generated
				var bank = this.getView().byId("id_housebank").getValue();
				var glaccount = this.getView().byId("id_glacc").getValue();
				var Table_open = this.getView().byId("id_tablepay");
				var myTableRows = Table_open.getRows();
				// var selectedIndeices = Table_open.getSelectedIndices();

				var vError = '';
				if (bank === "" || glaccount === "") {
					vError = vError + ' Please select Bank and GLAccount ! ' + "\n";
				}
				// if (selectedIndeices.length === 0) {
				//  vError = vError + '  Please select items for Processing ! ' + "\n";
				// } 
				if (vTotal <= 0) {
					vError = vError + ' Total Amount should not be in Negative ! ' + "\n";
				}
				if (vError !== '') {
					this.openErrorDialog(vError);

					//MessageBox.error(vError, {

					//  actions: ["OK"],

					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				} else {

					if (!this.ValueSuccess) {

						this.ValueSuccess = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksUTR", this);
						this.getView().addDependent(this.ValueSuccess);
					}
					this.ValueSuccess.open();
					sap.ui.getCore().byId("id_InBuDat").setDateValue(new Date()); //for currentdate

					if (bank.charAt(0) === 'H') {
						// sap.ui.getCore().byId("id_payloc").setVisible(true);
						sap.ui.getCore().byId("id_tpl").setVisible(true);
						// sap.ui.getCore().byId("id_pl").setVisible(true);
					}
					if (bank.charAt(0) === 'I') {
						// sap.ui.getCore().byId("id_payloc").setVisible(false);
						// sap.ui.getCore().byId("id_pl").setVisible(false);
						sap.ui.getCore().byId("id_tpl").setVisible(false);
					}

					this.getPaymentLoc();
					// sap.ui.getCore().byId("id_payloc").setValue(' ');
					//sap.ui.getCore().byId("id_InBuDat").setDateValue(new Date()); // Commented by Lokesh R on 26.08.2024
					// Added by Asha on 15.12.2021
					sap.ui.getCore().byId("id_textbackend").setValue(Comments_Rem);
					sap.ui.getCore().byId("id_textbackend_gl").setValue(Comments_Rem); //Added by Lokesh R on 02.09.2024

				}
			} //Added by Sakthi C on 31.08.2023 - start for restricting to save after doc no generated
			else {
				this.openErrorDialog(
					"Document already Posted, file not generated as you have skipped that step. Request you to extract file generation separately.");

				// sap.m.MessageBox.error(
				//"Document already Posted, file not generated as you have skipped that step. Request you to extract file generation separately.");
			} //Added by Sakthi C on 31.08.2023 - End for restricting to save after doc no generated

			// if (bank === "" || glaccount === "") {
			//  MessageBox.error("  Please select Bank and GLAccount ! ", {

			//    actions: ["OK"],

			//    onClose: function(nAction) {
			//      if (nAction === "OK") {}
			//    }
			//  });
			// } else if (selectedIndeices.length === 0) {
			//  MessageBox.error(" Please select items ! ", {

			//    actions: ["OK"],

			//    onClose: function(nAction) {
			//      if (nAction === "OK") {}
			//    }
			//  });
			// } else {
			//  if (!this.ValueSuccess) {

			//    this.ValueSuccess = sap.ui.xmlfragment("PaymentSolution.Fragment.Success", this);
			//    this.getView().addDependent(this.ValueSuccess);
			//  }
			//  this.ValueSuccess.open();
			//  this.getPaymentLoc();
			//  sap.ui.getCore().byId("id_payloc").setValue(' ');

			// }
		},
		onSaveConform: function(oEvent) {

			this.ValueSuccess.close();
			var bank = this.getView().byId("id_housebank").getValue();
			var glaccount = this.getView().byId("id_glacc").getValue();

			var text = sap.ui.getCore().byId("id_textbackend").getValue();
			var text_2 = sap.ui.getCore().byId("id_textbackend_gl").getValue();
			var text_3 = sap.ui.getCore().byId("id_textbackend_utr").getValue(); //Added by Lokesh R on 06.01.2025
			// var pay_loc = sap.ui.getCore().byId("id_payloc").getValue();
			var Budat = sap.ui.getCore().byId("id_InBuDat").getDateValue();
			//Added by Lokesh R on 26.08.2024 - Start
			if (Budat !== "" && Budat !== null) {
				v_mode = this.getView().byId("id_modecode").getValue();
				var totalamount = 0;
				var total_msme = 0;
				var msmeselected = 0;
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				var vReqDate = dateFormat.format(new Date(Budat));
				vReqDate = vReqDate + "T00:00:00";
				var vCuDate = dateFormat.format(new Date());
				vCuDate = vCuDate + "T00:00:00";
				var Table_open = this.getView().byId("id_tablepay");
				var myTableRows = Table_open.getRows();
				// var selectedIndeices = Table_open.getSelectedIndices
				var arr_directpay = [];
				var arr_directpay1 = [];
				var arr = [];
				if (pay_loc === " " && bank.charAt(0) === 'H') {
					this.openErrorDialog("Please select Payment Location!");

				}
				//Commented by Lokesh R on 26.08.2024 - Start
				//else if (vReqDate < vCuDate) {
				//  MessageBox.error(" Please Select current date or Future date  ", {
				//    actions: ["OK"],
				//    onClose: function(nAction) {
				//      if (nAction === "OK") {}
				//    }
				//  });
				// } Commented by Lokesh R on 26.08.2024 - End
				else {
					var model = this.getView().getModel("Mopen");
					var model1 = this.getView().getModel("Mopen").getData();
					if (model1.length != 0) {
						for (var i = 0; i < model1.length; i++) {
							// var data = model.getData()[selectedIndeices[i]];
							arr_directpay.push(model1[i]);
							if (arr_directpay[i].Shkzg == 'H') {
								totalamount = parseFloat(totalamount) + parseFloat(arr_directpay[i].PayAmount);
							} else if (arr_directpay[i].Shkzg == 'S') {
								totalamount = parseFloat(totalamount) - parseFloat(arr_directpay[i].PayAmount);
							}
						}
					}
					vTotal = totalamount;
					var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
						style: "INR",
						currencyCode: false
					});
					var act_amt = oCurrencyFormatter.format(totalamount);
					var tot_amt = act_amt;
					var tot1 = (parseFloat(totalamount) / 100000).toFixed(2);
					this.getView().byId("id_totalamo").setText(tot1);
					this.getView().byId("id_actamo").setText(tot_amt);
					for (var y = 0; y < arr_directpay.length; y++) {
						if (arr_directpay[y].Mindk !== '') {
							msmeselected++;
							if (arr_directpay[y].Shkzg == 'H') {
								total_msme = parseFloat(total_msme) + parseFloat(arr_directpay[y].PayAmount);
							} else if (arr_directpay[y].Shkzg == 'S') {
								total_msme = parseFloat(total_msme) - parseFloat(arr_directpay[y].PayAmount);
							}
						}
					}
					var tot_msme = (parseFloat(total_msme) / 100000).toFixed(2);
					this.getView().byId("id_msme1").setText(tot_msme);
					// this.getView().byId("id_msmeselected").setText(msmeselected);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					});

					var obj = {};
					// obj.Prctr = "";
					obj.Bukrs = v_compcode;
					obj.Hkont = glaccount;
					obj.Hbkid = bank;
					obj.ZsapValue = pay_loc;
					obj.NavPay = [];
					obj.NavRet1 = [];
					obj.NavMessage = [];
					obj.NavTrans = [];
					obj.Htext = text;
					obj.Rzawe = v_mode;
					obj.Remarks = text_2;
					obj.Utrno = text_3; //Added by Lokesh R on 06.01.2025
					obj.Fromdate = vReqDate;
					obj.Transid = Id;
					//var count = 0;
					for (var cr = 0; cr < arr_directpay.length; cr++) {
						var temp = {};
						//  count = count + 1;
						temp = arr_directpay[cr];
						//  temp.Sno = String(count);
						obj.NavPay.push(temp);
					}
					var BI = new sap.m.BusyDialog();
					BI.open();
					var serialmodel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
					var that = this;
					serialmodel.create('/HeadSet', obj, {
						success: function(oData) {
							var msglen = oData.NavRet1.results.length;
							var oMessage = "";
							var n_error = 0;
							var n_success = 0;
							for (var i = 0; i < msglen; i++) {
								oMessage = oMessage + "\n" + oData.NavRet1.results[i].Message;
								if (oData.NavRet1.results[i].Type === 'E') //" changed by dinesh 15.05.2021
								{
									n_error = n_error + 1;
								} else {
									n_success = n_success + 1;
								}
							} //" changed by dinesh 15.05.2021

							// for (var k = 0 ; k < msglen ; k++)
							// {
							//  if(oData.NavRet1.results[k].Type === 'E')
							//  {
							//    n_error = n_error + 1;
							//  }
							//  else
							//  {
							//    n_success = n_success + 1;
							//  }
							// }

							if (n_error === msglen) {
								var msglen = oData.NavRet1.results.length;
								var oMessage = "";
								for (var i = 0; i < msglen; i++) {
									oMessage = oMessage + "\n" + oData.NavRet1.results[i].Message;

								}
								that.openErrorDialog(oMessage, function() {
									window.location.reload(); // Reload the page
									BI.close(); // Close the BusyDialog
								});

								//MessageBox.error(oMessage, {

								//  actions: ["OK"],

								//  onClose: function(nAction) {
								//    if (nAction === "OK") {
								//      window.location.reload();
								//      // var arr_com_glo = that.getView().getModel('JComp');
								//      // arr_com_glo.Comp = v_compcode;
								//      // arr_com_glo.Flag = "Y";
								//      // // var JsonoModelComp = new sap.ui.model.json.JSONModel();
								//      // arr_com_glo.setData(arr_com_glo);
								//      // arr_com_glo.refresh();
								//      // that.getView().setModel(arr_com_glo, "JComp");
								//      // that.onclear();
								//      // sap.ui.core.UIComponent.getRouterFor(that).navTo("Items");
								//      BI.close();
								//    }
								//  }
								//});
							}
							if (n_success === msglen) {

								BI.close();
								// that.onclear();
								// that.fn_dialog();
								flag_err = 0;

								var msglen = oData.NavRet1.results.length;
								var oMessage = "";
								for (var i = 0; i < msglen; i++) {
									oMessage = oMessage + "\n" + oData.NavRet1.results[i].Message;

								}
								// vTrans = oData.NavTrans.results[0].Transid;
								vTrans = oData.NavTrans.results;

								var oArr = [];
								var oJsonMsgModel = new sap.ui.model.json.JSONModel();
								oJsonMsgModel.setData(oArr);
								that.getView().setModel(oJsonMsgModel, "JMMessage");
								that.getView().getModel("JMMessage").refresh();

								var oJsonMsgModel = new sap.ui.model.json.JSONModel();
								oJsonMsgModel.setData(oData.NavMessage.results);
								that.getView().setModel(oJsonMsgModel, "JMMessage");
								that.fn_openSimulate(oMessage);

								// var attach = oData.NavReturn.MessageV3;
								// if (attach !== 'X') {
								//  sap.ui.getCore().byId("id_downloadlink").setEnabled(false);
								// } else {
								//  sap.ui.getCore().byId("id_downloadlink").setEnabled(true);
								// }

							}
							// start of added on 14.05.2021
							if (n_success < msglen && n_success !== 0) {

								BI.close();
								// that.onclear();
								// that.fn_dialog();
								flag_err = 1;

								var msglen = oData.NavRet1.results.length;
								var oMessage = "";
								for (var i = 0; i < msglen; i++) {
									oMessage = oMessage + "\n" + oData.NavRet1.results[i].Message;

								}
								// vTrans = oData.NavTrans.results[0].Transid;
								vTrans = oData.NavTrans.results;

								var oArr = [];
								var oJsonMsgModel = new sap.ui.model.json.JSONModel();
								oJsonMsgModel.setData(oArr);
								that.getView().setModel(oJsonMsgModel, "JMMessage");
								that.getView().getModel("JMMessage").refresh();

								var oJsonMsgModel = new sap.ui.model.json.JSONModel();
								oJsonMsgModel.setData(oData.NavMessage.results);
								that.getView().setModel(oJsonMsgModel, "JMMessage");
								that.fn_openSimulate(oMessage);
								var flag_brk = 0;
								for (var j = 0; j < msglen; j++) {
									if ((oData.NavRet1.results[j].LogNo != "") && (oData.NavRet1.results[j].Field === "X")) {
										var doc = oData.NavRet1.results[j].LogNo;
										var mod_len = that.getView().getModel('MOpenitems').getData().length;
										for (var it = 0; it < mod_len; it++) {

											var doc1 = that.getView().getModel('Mopen').getData()[it].Belnr;
											if (doc === doc1) {
												var arr6 = that.getView().getModel('Mopen').getData();

												if (it === 0) {
													arr6.shift();
												} else {
													arr6.slice(0, it).concat(arr6.slice(it + 1, arr6.length));
												}
												that.getView().getModel("Mopen").setData(arr6);
												that.getView().getModel("Mopen").refresh();
												break;

											}

										}

									}
									// end of added on 14.05.2021
								}

								// var arr_com_glo = that.getView().getModel('JComp');
								// arr_com_glo.Comp = v_compcode;
								// arr_com_glo.Flag = "Y";
								// // var JsonoModelComp = new sap.ui.model.json.JSONModel();
								// arr_com_glo.setData(arr_com_glo);
								// arr_com_glo.refresh();
								// that.getView().setModel(arr_com_glo, "JComp");

							}

							// MessageBox.success(doc_num, {

							//  actions: ["OK"],

							//  onClose: function(nAction) {
							//    if (nAction === "OK") {
							//      var arr_com_glo = that.getView().getModel('JComp');
							//      arr_com_glo.Comp = v_compcode;
							//      arr_com_glo.Flag = "Y";
							//      // var JsonoModelComp = new sap.ui.model.json.JSONModel();
							//      arr_com_glo.setData(arr_com_glo);
							//      arr_com_glo.refresh();
							//      that.getView().setModel(arr_com_glo, "JComp");
							//      that.onclear();
							//      sap.ui.core.UIComponent.getRouterFor(that).navTo("Items");

							//    }
							//  }
							// });

						},
						error: function() {
							BI.close();
							this.openErrorDialog("Error!");

							this.fn_onCloseErrorDialog = function() {
								if (this.ErrorDialog) {
									this.ErrorDialog.close();
									BI.close();
									window.location.reload();
								}
							}.bind(this);
						}.bind(this)

						//error: function(oEvent) {
						//  BI.close();
						//  // var doc_num = oData.NavReturn.Message;
						//  // var error = oData.NavReturn.Message;
						//  MessageBox.error(" Error! ", {

						//    actions: ["OK"],

						//    onClose: function(nAction) {
						//      if (nAction === "OK") {
						//        BI.close();
						//        window.location.reload();
						//      }
						//    }
						//  });
						//  BI.close();

						//}
					});
				}
			} else {
				this.openErrorDialog("Please enter the posting date");

			}
		},
		handleSearchPaymentLocation: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("ZsapValue", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter(Filter1);

		},

		fn_dialog: function() {
			if (!this.Value5) {
				this.Value5 = sap.ui.xmlfragment("FSC360NEW.Fragment.Attach", this);
				this.getView().addDependent(this.Value5);
			}
			// this.ValueSuccess.destroy(true);
			this.Value5.open();
			sap.ui.getCore().byId("id_msg").setText(doc_num);
			sap.ui.getCore().byId("id_msg2").setText(message);

			// BI.close();
		},
		handleSearcHouseBank: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		// onSelectOpenItemstopay: function() {
		//  var Table_open = this.getView().byId("id_tablepay");
		//  var myTableRows = Table_open.getRows();
		//  var selectedIndeices = Table_open.getSelectedIndices();
		//  // var message = "";
		//  // var aSelectedItems = Table_open.getSelectedItems();
		//  // oEvent.getParameter("listItem").getBindingContext().getObject();
		//  // var myTable = this.getView().byId("id_table");
		//  // var myTableRows = myTable.getRows();
		//  // var selectedIndeices = myTable.getSelectedIndices();
		//  var len = selectedIndeices.length;
		//  this.getView().byId("id_selected").setText(len);
		// },
		fn_OK: function() {
			this.Value5.close();
			// this.Value5.destroy(true);

			var arr_com_glo = this.getView().getModel('JComp');
			arr_com_glo.Comp = v_compcode;
			arr_com_glo.Flag = "Y";
			// var JsonoModelComp = new sap.ui.model.json.JSONModel();
			arr_com_glo.setData(arr_com_glo);
			arr_com_glo.refresh();
			this.getView().setModel(arr_com_glo, "JComp");
			this.onclear();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Items");
		},
		onPressDownload: function(evt) {
			// var vUrl = '/sap/bc/gui/sap/its/webgui?~transaction=*OLR3_ME2XN%20OLR3_R3_TS_PDOC-EBELN='+po+';DYNP_OKCODE=DISP';
			var vUrl = 'http://emamidev.emami.local:8080/sap/bc/gui/sap/its/webgui?~transaction=*/exl/pay_dwnld%20s_trans=' + vTrans +
				';%20DYNP_FCODE=ONLI#';
			sap.m.URLHelper.redirect(
				vUrl, true);
		},
		onPressDownload1: function(evt) {
			// var opdfViewer = new sap.m.PDFViewer();
			// this.getView().addDependent(opdfViewer);
			var v_bukrs = v_compcode;
			var belnr = sap.ui.getCore().byId("id_MsgTxt").getText().slice(10, 20);
			var doc_length = this.getView().getModel('JMMessage').getData().length;
			var v_doc_no;
			// for(var v_it = 0;v_it < doc_length; v_it++)
			// { 
			v_doc_no = this.getView().getModel('JMMessage').getData()[0].Belnr;
			// oData.NavRunPayReturn.results[0].MessageV2

			var sServiceURL = "/sap/opu/odata/exl/PAY_ODATA_V1_SRV/AttachSet(Bukrs='" + v_bukrs + "',Belnr='" + v_doc_no + "')/$value";
			// var encodeUrl = encodeURI(sServiceURL);

			var filename = "";
			for (var v_it = 0; v_it < doc_length; v_it++) {
				filename = this.getView().getModel('JMReturn').getData()[0].MessageV2;

			}
			// filename = filename + ".txt";

			var name = filename;

			// window.location(encodeUrl);
			// window.open(encodeUrl);
			var link = document.createElement("a");
			link.setAttribute('download', name);
			link.href = sServiceURL;
			document.body.appendChild(link);
			link.click();
			// }
			var oMessage = sap.ui.getCore().byId("id_MsgTxt").getText();
			oMessage = oMessage + "\n" + "The File downloaded Successfully";

			sap.ui.getCore().byId("id_MsgTxt").setText(oMessage);
		},

		OnSelectMode: function(oEvent) {
			Mode = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
			this.getView().byId("id_modecode").setValue(Mode);
			if (this.Value4) {
				// oBinding.filter(allFilter);
				// oBinding.filter([]);
				oEvent.getSource().getBinding("items").filter([]);
				this.Value4.close();
			}
		},
		handleSearchMode: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Zlsch", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Text1", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		onSelectOpenItems: function() {

			var myTable = this.getView().byId("id_tablepay");
			// var myTableRows = myTable.getRows();
			var selectedIndeices = myTable.getSelectedIndices();
			var len = selectedIndeices.length;
			var tex = "Submit" + "(" + len + ")";
			this.getView().byId("id_submit").setText(tex);
			this.fn_calculate();

		},
		onCloseSuccess: function() {
			sap.ui.getCore().byId("id_InBuDat").setValue(null);
			sap.ui.getCore().byId("id_textbackend").setValue(null);
			sap.ui.getCore().byId("id_textbackend_gl").setValue(null);
			sap.ui.getCore().byId("id_textbackend_utr").setValue(null); //Added by Lokesh R on 06.01.2025
			this.ValueSuccess.close();
			this.ValueSuccess.destroy();
			this.ValueSuccess = null;
		},
		onPayAmountchange: function(oEvent) {
			var t = 0;
			var value = oEvent.getSource().getValue();
			var amount = oEvent.getSource().oParent.getCells()[8].getText();
			var partialpaid = oEvent.getSource().oParent.getCells()[11].getText();
			// value = Number(value);
			// value = value.replace(/[^0-9]/g, ''); //added By dinesh 15.05.2021/
			// oEvent.getSource().setValue(value); //added By dinesh 15.05.2021
			// value = value.replace(/[^\d]/g, '');
			// if(value !== "")
			//          {
			// if(value !== "") //added By dinesh 15.05.2021
			// {
			if (parseFloat(partialpaid) === 0) {
				if (parseFloat(value) <= parseFloat(amount)) {
					oEvent.getSource().setValue(value);
					this.fn_calculate();
				}
				if (parseFloat(value) > parseFloat(amount)) {
					oEvent.getSource().setValue(amount);

				}
			}
			if (parseFloat(partialpaid) !== 0) {

				var value3 = partialpaid;
				var value4 = parseFloat(amount) - parseFloat(value3);
				if (parseFloat(value) <= parseFloat(value4)) {
					oEvent.getSource().setValue(value);
					this.fn_calculate();
				}
				if (parseFloat(value) > parseFloat(value4)) {

					oEvent.getSource().setValue(value4);
				}
			}

			// }
			// else //added By dinesh 15.05.2021
			// {
			//    // oEvent.getSource().setValue(amount);  
			// }

			// For Total amount

		},
		fn_calculate: function() {
			var totalamount = 0;
			var total_msme = 0;
			var msmeselected = 0;
			var Table_open = this.getView().byId("id_tablepay");
			var myTableRows = Table_open.getRows();
			var arr_directpay = [];
			// var selectedIndeices = Table_open.getSelectedIndices();
			var model = this.getView().getModel("Mopen");
			var model1 = this.getView().getModel("Mopen").getData();
			if (model1.length != 0) {
				for (var i = 0; i < model1.length; i++) {
					// var data = model.getData()[selectedIndeices[i]];
					arr_directpay.push(model1[i]);
					if (arr_directpay[i].Shkzg == 'H') {
						totalamount = parseFloat(totalamount) + parseFloat(arr_directpay[i].PayAmount);
					} else if (arr_directpay[i].Shkzg == 'S') {

						totalamount = parseFloat(totalamount) - parseFloat(arr_directpay[i].PayAmount);
					}
				}
			}
			vTotal = totalamount;
			var total_amt = totalamount;
			var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
				style: "INR",
				currencyCode: false
			});
			var act_amt = oCurrencyFormatter.format(totalamount);
			var tot1 = (parseFloat(totalamount) / 100000).toFixed(4);
			this.getView().byId("id_totalamo").setText(tot1);
			this.getView().byId("id_actamo").setText(act_amt);
			for (var y = 0; y < arr_directpay.length; y++) {
				if (arr_directpay[y].Mindk !== '') {
					msmeselected++;
					if (arr_directpay[y].Shkzg == 'H') {
						total_msme = parseFloat(total_msme) + parseFloat(arr_directpay[y].PayAmount);
					} else if (arr_directpay[y].Shkzg == 'S') {

						total_msme = parseFloat(total_msme) - parseFloat(arr_directpay[y].PayAmount);
					}
				}
			}
			var tot_msme = (parseFloat(total_msme) / 100000).toFixed(4);
			this.getView().byId("id_msme1").setText(tot_msme);
			// this.getView().byId("id_msmeselected").setText(msmeselected);

		},
		// onValueHelpRequestedPrintForForms: function() {
		//  if (!this.print) {
		//    this.print = sap.ui.xmlfragment("PaymentSolution.Fragment.PrintForms", this);
		//    this.getView().addDependent(this.print);
		//  }
		//  this.print.open();
		// },
		// OnSelectPrintforms: function(oEvent) {
		//  var Print = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();

		//  this.getView().byId("id_print").setValue(Print);
		// },
		// onValueHelpRequestedCheckLot: function(oEvent) {
		//  //  var lot = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();

		//  // this.getView().byId("id_lot").setValue(lot);
		//  if (!this.Lot) {
		//    this.Lot = sap.ui.xmlfragment("PaymentSolution.Fragment.Lot", this);
		//    this.getView().addDependent(this.Lot);
		//  }
		//  this.Lot.open();
		//  this.onSelectedLot();
		// },
		onSelectedLot: function() {
			var v_flag = 'L';
			var Filters = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();
			var v_housebank = this.getView().byId("id_housebank").getValue();
			var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
			var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			var house = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, v_housebank);
			Filters.push(CompanyCodeFlag, comcode, house);
			oModel.read("/HeadSet", {
				filters: Filters,
				urlParameters: {
					$expand: "NavCompanyCode,NavGLAccount,NavHouseBank,NavModeOfPay,NavPay,NavProfitCenter,NavVendor,NavCheckLot"
				},
				success: function(oData) {
					var JsonoModel = new sap.ui.model.json.JSONModel();
					JsonoModel.setData(oData.results[0].NavCheckLot.results);
					that.getView().setModel(JsonoModel, "MLot");
					BI.close();
				},
				error: function() {
					BI.close();
					that.openErrorDialog("Error!");

					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});

		},
		OnSelectLot: function(oEvent) {
			var v_lot = oEvent.getParameters("selectedItem").selectedItems[0].getTitle();
			// var v_lotdes = oEvent.getParameters("selectedItem").selectedItems[0].getInfo();
			var str = v_lot;
			// this.getView().byId("id_lot").setValue(str);
			sap.ui.getCore().byId("id_lot").setValue(str);
		},
		onclear: function() {
			// sap.ui.getCore().byId("id_lot").setValue("");
			this.getView().byId("id_housebank").setValue("");
			this.getView().byId("id_glacc").setValue("");
			sap.ui.getCore().byId("id_textbackend").setValue("");
			sap.ui.getCore().byId("id_textbackend_gl").setValue("");
			sap.ui.getCore().byId("id_textbackend_utr").setValue(""); //Added by Lokesh R on 06.01.2025
			this.getView().byId("id_modecode").setValue("");
			// this.getView().byId("id_tablepay").removeSelections();
			this.fn_clear_submit_val(); //Added by Sakthi C on 01.09.2023 
		},
		onclear1: function() {
			// sap.ui.getCore().byId("id_lot").setValue("");
			this.getView().byId("id_housebank").setValue("");
			this.getView().byId("id_glacc").setValue("");

			// sap.ui.getCore().byId("id_textbackend").setValue("");
			this.getView().byId("id_modecode").setValue("");
			this.fn_clear_submit_val(); //Added by Sakthi C on 01.09.2023 
		},
		//Added by Sakthi C on 01.09.2023 - Start
		fn_clear_submit_val: function() {
			Vmsgtxt = '';
			this.getView().byId("id_submit_inv").removeStyleClass("cl_greenbox_validation");
			var oModel = this.getView().getModel("Mopen");
			oModel.setProperty("/edit_amount", "true");
			this.getView().byId("id_housebank").setEditable(true);
			this.getView().byId("id_modecode").setEditable(true);
			this.getView().byId("id_glacc").setEditable(true);
			this.getView().byId("id_tablepay").setSelectionMode("MultiToggle");
		},
		//Added by Sakthi C on 01.09.2023 - End
		fn_editSec: function() {
			var Mode_edit = this.getView().byId('id_modecode');
			Mode_edit.addEventDelegate({
				onAfterRendering: function() {
					Mode_edit.$().find("input").attr("readonly", true);
				}
			});
			var House_edit = this.getView().byId('id_housebank');
			// House_edit.addEventDelegate({
			//  onAfterRendering: function() {
			//    House_edit.$().find("input").attr("readonly", true);
			//  }
			// });

			var GLAcc_edit = this.getView().byId('id_glacc');
			GLAcc_edit.addEventDelegate({
				onAfterRendering: function() {
					GLAcc_edit.$().find("input").attr("readonly", true);
				}
			});
		},
		fn_openSimulate: function(oMessage) {
			if (!this.oFragStatus) {

				this.oFragStatus = sap.ui.xmlfragment("FSC360NEW.Fragment.Simulation", this);
				this.getView().addDependent(this.oFragStatus);
			}
			this.oFragStatus.open();
			SuccessInd = 'X';
			var mModel = this.getView().getModel('JMMessage').getData();
			if (mModel.length == 0) {
				// sap.ui.getCore().byId('id_simulatebtn').setVisible(false);
				// sap.ui.getCore().byId('id_submitbtn').setVisible(false);
			} else {
				// sap.ui.getCore().byId('id_simulatebtn').setVisible(true);
				// sap.ui.getCore().byId('id_submitbtn').setVisible(true);
			}

			// sap.ui.getCore().byId("id_simulatebtn").setVisible(true);
			// sap.ui.getCore().byId("id_submitbtn").setVisible(true);
			// sap.ui.getCore().byId("id_downloadbtn").setVisible(false);
			// sap.ui.getCore().byId("id_cancelbtn").setVisible(false);
			sap.ui.getCore().byId("id_MsgTxt").setText(oMessage);
			this.fn_validate_submit(oMessage); //Added by Sakthi C on 31.08.2023 -for restricting to save after doc no generated
		},
		//Added by Sakthi C on 31.08.2023 - start for restricting to save after doc no generated
		fn_validate_submit: function(oMessage) {
			Vmsgtxt = oMessage;
			this.getView().byId("id_submit_inv").addStyleClass("cl_greenbox_validation");
			var oModel = this.getView().getModel("Mopen");
			oModel.setProperty("/edit_amount", "false");
			for (var i = 0; i < oModel.oData.length; i++) {
				oModel.oData[i].PayAmount = '';
			}
			this.getView().setModel(oModel, "Mopen");
			this.getView().getModel("Mopen").refresh();
			this.getView().byId("id_housebank").setEditable(false);
			this.getView().byId("id_modecode").setEditable(false);
			this.getView().byId("id_glacc").setEditable(false);
			this.getView().byId("id_tablepay").setSelectionMode("None");
		},
		//Added by Sakthi C on 31.08.2023 - End for restricting to save after doc no generated
		fn_closeSimulate: function() {

			this.oFragStatus.close();

			var arr_com_glo = this.getView().getModel('JComp');
			arr_com_glo.Comp = v_compcode;
			arr_com_glo.Flag = "Y";
			// var JsonoModelComp = new sap.ui.model.json.JSONModel();
			arr_com_glo.setData(arr_com_glo);
			arr_com_glo.refresh();
			this.getView().setModel(arr_com_glo, "JComp");
			// this.onclear();
			if (flag_err === 0) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("Items");
			}
			Vmsgtxt = ''; //Added by Sakthi C on 31.08.2023 - start for restricting to save after doc no generated
		},
		fn_Simulate: function() {
			var bank = v_housebank;
			// var pay_loc = sap.ui.getCore().byId("id_payloc").getValue();

			// var Filters = [];
			// var v_bank = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, bank);
			// Filters.push(v_bank);
			// var v_pay_loc = new sap.ui.model.Filter("ZsapValue", sap.ui.model.FilterOperator.EQ, pay_loc);
			// Filters.push(v_pay_loc);
			// var v_mode = new sap.ui.model.Filter("Rzawe", sap.ui.model.FilterOperator.EQ, mode);
			// Filters.push(v_mode);
			// var v_comp = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			// Filters.push(v_comp);
			// var v_Transid = new sap.ui.model.Filter("Transid", sap.ui.model.FilterOperator.EQ, vTrans);
			// Filters.push(v_Transid);
			// var v_Flag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, 'X');
			// Filters.push(v_Flag);
			// var oDocNo = sap.ui.getCore().byId("id_MsgTxt").getText().slice(9, 19);
			// var v_oDocNo = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.EQ, oDocNo);
			// Filters.push(v_oDocNo);
			var obj = {};
			var doc_length = this.getView().getModel('JMMessage').getData().length;
			var v_doc_no;

			obj.NavPay3 = [];
			for (var v_it = 0; v_it < doc_length; v_it++) {
				v_doc_no = this.getView().getModel('JMMessage').getData()[v_it].Belnr;

				var v_doc_belnr = {
					Belnr: v_doc_no

				};

				obj.NavPay3.push(v_doc_belnr);
			}

			var oDocNo = sap.ui.getCore().byId("id_MsgTxt").getText().slice(10, 20);
			obj.Bukrs = v_compcode;
			// obj.Transid = vTrans[0].Transid;
			obj.Transid = '';
			obj.Hbkid = bank;
			obj.ZsapValue = pay_loc;
			obj.Rzawe = v_mode;
			obj.Flag = 'X';
			obj.NavRunpayMessage = [];
			obj.NavRunPayReturn = [];
			obj.NavTrs = vTrans;

			var serialmodel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			sap.ui.core.BusyIndicator.show();
			serialmodel.create('/RunPaymentSet', obj, {
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide();
					// var temp = {};
					// oArr = that.getView().getModel("JMMessage").getData();
					// for (var i = 0; i < oData.NavRunpayMessage.results.length; i++) {
					//  temp = oData.NavRunpayMessage.results[i];
					//  oArr.push(temp);
					// }
					var oArr = [];
					var oJsonMsgModel = new sap.ui.model.json.JSONModel();
					oJsonMsgModel.setData(oArr);
					that.getView().setModel(oJsonMsgModel, "JMMessage");
					that.getView().getModel("JMMessage").refresh();

					var oJsonMsgModel = new sap.ui.model.json.JSONModel();
					oJsonMsgModel.setData(oData.NavRunpayMessage.results);
					that.getView().setModel(oJsonMsgModel, "JMMessage");

					var oJsonMsgModel = new sap.ui.model.json.JSONModel();
					oJsonMsgModel.setData(oData.NavRunpayMessage.results);
					that.getView().setModel(oJsonMsgModel, "JMReturn");

					var oMessage = sap.ui.getCore().byId("id_MsgTxt").getText();
					oMessage = oMessage + "\n" + "The Simulated Successfully";

					sap.ui.getCore().byId("id_MsgTxt").setText(oMessage);
				},
				error: function(oResponse) {
					//sap.m.MessageBox.error("Error");
					that.openErrorDialog("Error!");

				}
			});

		},
		fn_submitFinal: function() {
			var bank = this.getView().byId("id_housebank").getValue();
			// var pay_loc = sap.ui.getCore().byId("id_payloc").getValue();
			// mode_1 = this.getView().byId("id_modecode").getValue();
			// var Filters = [];
			// var v_bank = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, bank);
			// Filters.push(v_bank);
			// var v_pay_loc = new sap.ui.model.Filter("ZsapValue", sap.ui.model.FilterOperator.EQ, pay_loc);
			// Filters.push(v_pay_loc);
			// var v_mode = new sap.ui.model.Filter("Rzawe", sap.ui.model.FilterOperator.EQ, mode);
			// Filters.push(v_mode);
			// var v_comp = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
			// Filters.push(v_comp);
			// var v_Transid = new sap.ui.model.Filter("Transid", sap.ui.model.FilterOperator.EQ, vTrans);
			// Filters.push(v_Transid);
			// var v_Flag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, '');
			// Filters.push(v_Flag);
			// var oDocNo = sap.ui.getCore().byId("id_MsgTxt").getText().slice(9, 19);
			// var v_oDocNo = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.EQ, oDocNo);
			// Filters.push(v_oDocNo);

			var obj = {};

			var doc_length = this.getView().getModel('JMMessage').getData().length;
			var v_doc_no;
			//Commented by Asha on 15.12.2021
			// obj.NavPay3 = [];
			// for (var v_it = 0; v_it < doc_length; v_it++) {
			//  v_doc_no = this.getView().getModel('JMMessage').getData()[v_it].Belnr;

			//  var v_doc_belnr = {
			//    Belnr: v_doc_no

			//  };

			//  obj.NavPay3.push(v_doc_belnr);
			// }
			obj.NavPay3 = [];
			var oDocNo = sap.ui.getCore().byId("id_MsgTxt").getText().slice(10, 20);
			obj.Bukrs = v_compcode;
			obj.Transid = '';
			obj.Hbkid = v_housebank;
			obj.ZsapValue = v_payloc;

			obj.Rzawe = v_mode;
			obj.Flag = '';
			obj.NavRunpayMessage = [];
			obj.NavRunPayReturn = [];
			obj.NavTrs = vTrans; //added by Dinesh Saravanna R --- 15.03.2022
			sap.ui.core.BusyIndicator.show();
			var serialmodel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var that = this;
			serialmodel.create('/RunPaymentSet', obj, {
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide();
					// sap.ui.getCore().byId("id_simulatebtn").setVisible(false);
					// sap.ui.getCore().byId("id_submitbtn").setVisible(false);
					// sap.ui.getCore().byId("id_downloadbtn").setVisible(true);
					// sap.ui.getCore().byId("id_cancelbtn").setVisible(true);
					// for(var i = 0 ; i < oData.NavTrs.results.length ; i++)
					// {
					var vUrl = '/sap/bc/gui/sap/its/webgui?~transaction=*/exl/pay_dwnld%20s_trans-low=' + vTrans[0].Transid +
						';%20DYNP_FCODE=ONLI#';
					sap.m.URLHelper.redirect(
						vUrl, true);
					// }
					// var vUrl = '/sap/bc/gui/sap/its/webgui?~transaction=*/exl/pay_dwnld%20s_trans=' + oData.Transid + ';%20DYNP_FCODE=ONLI#';
					// sap.m.URLHelper.redirect(
					//  vUrl, true);

					// var temp = {};
					// oArr = that.getView().getModel("JMMessage").getData();
					// for (var i = 0; i < oData.NavRunpayMessage.results.length; i++) {
					//  temp = oData.NavRunpayMessage.results[i];
					//  oArr.push(temp);
					// }
					var oArr = [];
					var oJsonMsgModel = new sap.ui.model.json.JSONModel();
					oJsonMsgModel.setData(oArr);
					that.getView().setModel(oJsonMsgModel, "JMMessage");
					that.getView().getModel("JMMessage").refresh();

					var oJsonMsgModel = new sap.ui.model.json.JSONModel();
					oJsonMsgModel.setData(oData.NavRunpayMessage.results);
					that.getView().setModel(oJsonMsgModel, "JMMessage");

					var oJsonMsgModel = new sap.ui.model.json.JSONModel();
					oJsonMsgModel.setData(oData.NavRunPayReturn.results);
					that.getView().setModel(oJsonMsgModel, "JMReturn");

					var oMessage = sap.ui.getCore().byId("id_MsgTxt").getText();
					oMessage = oMessage + "\n" + "The File generated Successfully";

					sap.ui.getCore().byId("id_MsgTxt").setText(oMessage);

				},
				error: function(oResponse) {
					that.openErrorDialog("Error!");

					//sap.m.MessageBox.error("Error");
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		fn_housebank: function(oEvent) {
			var oData = this.getView().getModel("MHouseBank").getData();
			var house = this.getView().byId("id_housebank").getValue();
			var flag2 = "";
			for (var i = 0; i < oData.length; i++) {
				if (house === oData[i].Hbkid) {
					flag2 = 'X';
				}
			}
			if (flag2 === 'X') {
				this.getView().byId("id_glacc").setValueState("None");
				this.getView().byId("id_housebank").setValueState("None");
				v_housebank = this.getView().byId("id_housebank").getValue();
				var v_flag = 'G';
				var Filters = [];
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
				var that = this;
				// this.ValueSuccess.close();
				var BI = new sap.m.BusyDialog();
				BI.open();
				// var v_housebank =  this.getView().byId("id_housebank").getValue();
				// var v_housebank2 =   v_housebank.substring(0, v_housebank.indexOf('-'));
				// var CompanyCodeFlag = new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, v_flag);
				var comcode = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, v_compcode);
				var house = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, v_housebank);
				Filters.push(comcode, house);
				oModel.read("/AccountSet", {
					filters: Filters,
					success: function(oData) {
						// var JsonoModel = new sap.ui.model.json.JSONModel();
						// JsonoModel.setData(oData.results);
						// that.getView().setModel(JsonoModel, "MGLAccount");
						if (oData.results.length === 1) {

							that.getView().byId("id_glacc").setValue(oData.results[0].Ukont);
							that.fnBalance();
							var value_hbkid = oData.results[0].Ukont;
							var len_hbkid = value_hbkid.length - 1;

							var v_zero = value_hbkid.charAt(len_hbkid);
							if (v_zero === '0') {
								that.openErrorDialog("Select the correct outgoing GL account!");

								// MessageBox.error("Select the correct outgoing GL account!", {

								//   actions: ["OK"],

								//   onClose: function(nAction) {
								//     if (nAction === "OK") {}
								//   }
								// });
							}

						}
						//  if (oData.results.length === 0) {
						//    MessageBox.error("Select the correct outgoing GL account!", {

						//      actions: ["OK"],

						//      onClose: function(nAction) {
						//        if (nAction === "OK") {}
						//      }
						//    });
						// }
						// var bankbalance = parseFloat(oData.results[0].Balance);
						// that.getView().byId("id_bankbalance").setText(bankbalance);

						BI.close();
					},
					error: function() {
						BI.close();

					}

				});
			} else {
				this.getView().byId("id_housebank").setValueState("Error");
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
		handleSuggestHouse: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setFilterSuggests(false);

		},
		handleSuggestGL: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("Ukont", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setFilterSuggests(false);

		},
		fnChangeReqDateValidate: function(oEvent) {
			var date = oEvent.getSource().getDateValue();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd"
			});
			var vReqDate = dateFormat.format(new Date(date));
			vReqDate = vReqDate + "T00:00:00";
			var vCuDate = dateFormat.format(new Date());
			vCuDate = vCuDate + "T00:00:00";
			//Commented by Lokesh R on 26.08.2024 - Start
			//if (vReqDate < vCuDate) {
			//  sap.m.MessageBox.error("Please Select Current date or Future Date Only");
			//  oEvent.getSource().setDateValue(new Date());
			//}
			//Commented by Lokesh R on 26.08.2024 - End
		},
		onBack: function() {
			window.location.reload();
			window.scrollTo(0, 0);
		},
		onselection: function(oEvent) {
			var oClickedItem = oEvent.getParameter("listItem");
			var oList = this.byId("id_list");

			// --- Step 1: Handle Styling ---
			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});
			oClickedItem.addStyleClass("selectedListItem");
			flag = "";
			Id = "";
			Payamt = "";
			v_compcode = "";
			Indi = "";
			pay_loc = "";
			Id = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Transid");
			Payamt = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("PayAmount");
			v_compcode = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Name1");
			pay_loc = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("PayLoc");
			comment = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Tdline");
			this.tdline = comment;
			Comments_Rem = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Comments");
			Indi = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Indi");
			var house = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Housebank");
			var GL = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Glaccount");
			var paymode = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Paymentmode");

			this.getView().byId("id_reject").setVisible(false);
			this.getView().byId("id_submit").setVisible(false);
			this.getView().byId("id_approve").setVisible(false);
			this.getView().byId("id_trigger").setVisible(false);
			this.getView().byId("id_pdf").setVisible(false);
			this.getView().byId("id_comments").setVisible(false);
			this.getHouseBank();
			this.getGLAccount();
			if (Indi === "F") {
				this.getView().byId("id_reject").setVisible(true);
				this.getView().byId("id_submit").setVisible(true);
				this.getView().byId("id_exceldownl2").setVisible(true);
				this.getView().byId("id_trigger").setVisible(true);
				this.getView().byId("id_pdf").setVisible(true);
				this.getView().byId("id_comments").setVisible(true);
			} else {
				this.getView().byId("id_modecode").setValue("A");
				this.getView().byId("id_reject").setVisible(true);
				this.getView().byId("id_exceldownl2").setVisible(false);
				this.getView().byId("id_approve").setVisible(true);
				this.getView().byId("id_trigger").setVisible(true);
				this.getView().byId("id_pdf").setVisible(true);
				this.getView().byId("id_comments").setVisible(true);
			}
			var arr = [];
			var arr1 = [];
			var oModel = this.getView().getModel("MProfit1");
			arr = oModel.getData();

			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Transid === Id) {
					var temp = arr[i];
					arr1.push(temp);
				}
			}
			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.setData(arr1);
			this.getView().setModel(oModel1, "Mopen");
			// this.getView().byId("id_actamo").setText(Payamt);
			// var tott_sec = (parseFloat(Payamt) / 100000).toFixed(4);
			// this.getView().byId("id_totalamo").setText(tott_sec);
			// var global = this.getView().getModel('MOpenitems').getData();
			// var JsonoModel = new sap.ui.model.json.JSONModel();
			// JsonoModel.setData(global);
			// this.getView().setModel(JsonoModel, "Mopen");
			oModel1.setProperty("/edit_amount", "true");
			// this.onSelectAll();
			var setmodel = this.getView().getModel('Mopen').getData();
			var total_amount_sec = this.getView().byId("id_totalamo").getText();
			var total_msme_sec = this.getView().byId("id_msme1").getText();
			var count_msme = 0;
			for (var h = 0; h < setmodel.length; h++) {
				// this.getView().byId("id_tablepay").setSelectedIndex(h);
				if (setmodel[h].Shkzg == 'H') {
					total_amount_sec = parseFloat(total_amount_sec) + parseFloat(setmodel[h].PayAmount);
				} else if (setmodel[h].Shkzg == 'S') {
					total_amount_sec = parseFloat(total_amount_sec) - parseFloat(setmodel[h].PayAmount);
				}

			}
			for (var y = 0; y < setmodel.length; y++) {
				if (setmodel[y].Mindk !== '') {
					count_msme++;
					// this.getView().byId("id_tablepay").setSelectedIndex(h);
					if (setmodel[y].Shkzg == 'H') {
						total_msme_sec = parseFloat(total_msme_sec) + parseFloat(setmodel[y].PayAmount);
					} else if (setmodel[y].Shkzg == 'S') {
						total_msme_sec = parseFloat(total_msme_sec) - parseFloat(setmodel[y].PayAmount);
					}

				}
			}
			var tot_msme = (parseFloat(total_msme_sec) / 100000).toFixed(4);
			if (tot_msme === 'NaN') {
				this.getView().byId("id_msme1").setText("0");
			} else {
				this.getView().byId("id_msme1").setText(tot_msme);
			}

			// this.getView().byId("id_msmeselected").setText(count_msme);
			vTotal = total_amount_sec;
			var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
				style: "INR",
				currencyCode: false
			});
			var act_amt = oCurrencyFormatter.format(total_amount_sec);
			var tot_amt = act_amt;
			var tott_sec = (parseFloat(total_amount_sec) / 100000).toFixed(4);
			this.getView().byId("id_totalamo").setText(tott_sec);
			this.getView().byId("id_actamo").setText(tot_amt);
			var len = setmodel.length;
			if (len === "") {
				this.getView().byId("id_open").setText(0);
			} else {
				this.getView().byId("id_open").setText(len);
			}
			this.getView().byId("id_glacc").setValue(GL);
			this.getView().byId("id_housebank").setValue(house);
			//this.getView().byId("id_modecode").setValue(paymode);
			if (Indi !== "O") {
				this.getView().byId("id_modecode").setValue(paymode);
			}
			this.fnBalance();

		},
		OnPressList: function(oEvent) {
			var list = this.getView().byId("id_list").getAggregation("items");
			var oList = this.byId("id_list");

			var items = oList.getSelectedItems();
			var id = oEvent.getSource().getAggregation("content")[0].getId();
			for (var i = 0; i < list.length; i++) {
				var agg = list[i].getAggregation("content")[0].getId();
				if (agg !== id) {
					//this.byId(agg).addStyleClass("cl_masterclick");
					//this.byId(agg).removeStyleClass("cl_masterclick1");
				}
			}
			//this.byId(id).removeStyleClass("cl_masterclick");
			//this.byId(id).addStyleClass("cl_masterclick1");
			this.getView().byId("id_reject").setVisible(true);
			this.getView().byId("id_approve").setVisible(true);
			this.getView().byId("id_trigger").setVisible(true);

			var oSplitapp = this.byId("SplitAppDemo");
			var oDetailPage = this.byId("detail");

			oSplitapp.toDetail(oDetailPage);
			//this.Remarks.destroy();
			//    this.ValueSuccess.destroy();
		},
		fn_docdisplay: function(oEvent) {
			var Docno = oEvent.getSource().getBindingContext('Mopen').getProperty('Belnr');
			var Gjahr = oEvent.getSource().getBindingContext('Mopen').getProperty('Gjahr');
			var Type = oEvent.getSource().getBindingContext('Mopen').getProperty('Type');
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
		OnPressSuccess: function() {
			var mode = this.getView().byId("id_modecode").getValue();
			var glacc = this.getView().byId("id_glacc").getValue();
			var house = this.getView().byId("id_housebank").getValue();
			if (mode !== "" && glacc !== "" && house !== "") {
				flag = 'A';
				if (!this.Remarks) {
					this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksPayLoc", this);
					this.getView().addDependent(this.Remarks);
				}
				this.Remarks.open();
				sap.ui.getCore().byId("textAreaWithBinding2").setValue(Comments_Rem);
				sap.ui.getCore().byId("toolid").setVisible(false);
				sap.ui.getCore().byId("id_pl").setVisible(false);
				// sap.ui.getCore().byId("id_dialog").setWidth("95%");
				sap.ui.getCore().byId("id_dialog").setTitle("Remarks");
				sap.ui.getCore().byId("id_payloc").setVisible(false);
				sap.ui.getCore().byId("toolid").setVisible(false);
			} else {
				// MessageBox.error("Please Enter the Mandatory Fields");
				this.openErrorDialog("Please Enter the Mandatory Fields");

			}
		},
		OnPressReject: function() {
			flag = 'R';
			if (!this.Remarks) {
				this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksPayLoc", this);
				this.getView().addDependent(this.Remarks);
			}
			this.Remarks.open();
			sap.ui.getCore().byId("toolid").setVisible(false);
			sap.ui.getCore().byId("textAreaWithBinding2").setText(Comments_Rem);
			sap.ui.getCore().byId("id_dialog").setTitle("Remarks");
			sap.ui.getCore().byId("id_payloc").setVisible(false);
			sap.ui.getCore().byId("id_pl").setVisible(false);
			sap.ui.getCore().byId("toolid").setVisible(false);
			sap.ui.getCore().byId("id_dialog").setWidth("95%");
		},
		fn_success_confirm: function(RemarksS) {
			if (RemarksS !== "") {
				var mode = this.getView().byId("id_modecode").getValue();
				var glacc = this.getView().byId("id_glacc").getValue();
				var house = this.getView().byId("id_housebank").getValue();
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
				var arr = this.getView().getModel("Mopen").getData();
			this.openConfirmDialog(
    "Do you want to approve the Proposal ID " + parseInt(Id),
    function() { // YES callback
        var obj = {};
        obj.Flag = 'X';
        obj.NavPay = [];
        obj.Remarks = RemarksS;
        obj.Hkont = glacc;
        obj.Hbkid = house;
        obj.Rzawe = mode;
        obj.navPay2 = [];
        for (var i = 0; i < arr.length; i++) {
            obj.navPay2.push(arr[i]);
        }
        var temp = { "Transid": Id };
        obj.NavPay.push(temp);

        var that = this;
        var BI = new sap.m.BusyDialog();
        BI.open();

        oModel.create('/OpenSet', obj, {
            success: function(oData, Response) {
                BI.close();
                that.openSuccessDialog("Approved Successfully");
               window.location.reload();
            },
            error: function() {
                BI.close();
                that.openErrorDialog("Error!");
            }
        });
    }.bind(this),
    function() { // NO callback
        console.log("Approval canceled");
    }
);

			} else {
				this.openErrorDialog("Please Enter the Remarks ");
				// MessageBox.error(" Please Enter the Remarks ", {
				//   actions: ["OK"],
				//   onClose: function(nAction) {
				//     if (nAction === "OK") {}
				//   }
				// });
			}
		},
		fn_reject_confirm: function(RemarksR) {
			if (RemarksR !== "") {
				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
				this.openConfirmDialog(
    "Do you want to reject the Proposal ID " + parseInt(Id),
    function() { // YES callback
        var obj = {};
        obj.Flag = 'Y';
        obj.NavPay = [];
        obj.Remarks = RemarksR;
        var temp = { "Transid": Id };
        obj.NavPay.push(temp);

        var that = this;
        var BI = new sap.m.BusyDialog();
        BI.open();

        oModel.create('/OpenSet', obj, {
            success: function(oData, Response) {
                BI.close();
                that.openSuccessDialog("Rejected Successfully");
                  window.location.reload();
            },
            error: function() {
                BI.close();
                that.openErrorDialog("Error!");
            }
        });
    }.bind(this),
    function() { // NO callback
        console.log("Rejection canceled");
    }
);

			} else {
				this.openErrorDialog("Please Enter the Remarks !");

				// MessageBox.error("Please Enter the Remarks ! ", {
				//   actions: ["OK"],
				//   onClose: function(nAction) {
				//     if (nAction === "OK") {}
				//   }
				// });
			}
		},
		openConfirmDialog: function(sMessage, fnCallbackYes, fnCallbackNo) {
    var oView = this.getView();

    // Save the callbacks to call later when user presses Yes or No
    this._fnConfirmYes = fnCallbackYes;
    this._fnConfirmNo = fnCallbackNo;

    // Load fragment only once
    if (!this._confirmDialog) {
        this._confirmDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.ConfirmDialog", this);
        this.getView().addDependent(this._confirmDialog);
    }

    // Set dynamic text
    sap.ui.getCore().byId("confirmText").setText(sMessage);

    // Open the dialog
    this._confirmDialog.open();
},

onConfirmYesPress: function() {
    if (typeof this._fnConfirmYes === "function") {
        this._fnConfirmYes(); // Execute the Yes callback
    }
    this._confirmDialog.close();
},

onConfirmNoPress: function() {
    if (typeof this._fnConfirmNo === "function") {
        this._fnConfirmNo(); // Execute the No callback
    }
    this._confirmDialog.close();
},

onConfirmDialogClose: function() {
    // Optional: reset callbacks
    this._fnConfirmYes = null;
    this._fnConfirmNo = null;
}
,
		fn_trigger_confirm: function(RemarksT, payloc) {

			if (RemarksT !== "" && payloc !== "") {
				if (payloc !== pay_loc) {
					var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
					MessageBox.show(
						"Do you want to Trigger the Proposal ID " + parseInt(Id), {
							icon: MessageBox.Icon.INFORMATION,
							title: "User Action",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							emphasizedAction: MessageBox.Action.YES,
							onClose: function(oAction) {

								if (oAction === 'YES') {
									var obj = {};
									obj.Flag = 'T';
									obj.NavPay = [];
									obj.Remarks = RemarksT;
									obj.ZsapValue = payloc;
									var temp = {
										"Transid": Id
									};
									obj.NavPay.push(temp);
									var that = this;
									var BI = new sap.m.BusyDialog();
									BI.open();

									oModel.create('/OpenSet', obj, {
										success: function(oData, Response) {
											BI.close();
											var oMessage = "";
											// if (oData.NavReturn.results.length !== 0) {
											//  if (oData.NavReturn.results[0].Type === 'E') {
											//    oMessage = oData.NavReturn.results[0].Message;
											//  }
											// }
											if (oData.MsgType === 'E') {
												oMessage = oData.Msg;
											}
											BI.close();
											if (oMessage === "") {
												BI.close();
												that.openSuccessDialog("Triggered Successfully");
												  window.location.reload();

												// MessageBox.success("Triggered Successfully", {
												//   actions: ["OK"],
												//   onClose: function(nAction) {
												//     if (nAction === "OK") {
												//       window.location.reload();
												//     }
												//   }
												// });
											} else {
												that.openErrorDialog(oMessage, function() {
													BI.close();
													window.location.reload();
												});

												// sap.m.MessageBox.error(oMessage, {
												//   title: "Error", // default
												//   onClose: function(oAction) {
												//     BI.close();
												//     window.location.reload();
												//   }, // default
												//   styleClass: "", // default
												//   actions: sap.m.MessageBox.Action.CLOSE, // default
												//   emphasizedAction: null, // default
												//   initialFocus: null, // default
												//   textDirection: sap.ui.core.TextDirection.Inherit // default
												// });
											}
										},
										error: function() {
											BI.close();
											that.openErrorDialog(" Error! ");
											//MessageBox.error(" Error! ", {
											//  actions: ["OK"],
											//  onClose: function(nAction) {
											//    if (nAction === "OK") {}
											//  }
											//});
										}
									});

								}
							}
						});
				} else {
					this.openErrorDialog(" Please Select Different Payment Location ");

					//MessageBox.error(" Please Select Different Payment Location ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			} else {
				this.openErrorDialog(" Please Fill all the Fields ! ");
				// MessageBox.error(" Please Fill all the Fields ! ", {
				//   actions: ["OK"],
				//   onClose: function(nAction) {
				//     if (nAction === "OK") {}
				//   }
				// });
			}
		},
		fn_okremarks: function() {
			var BI = new sap.m.BusyDialog();
			BI.open();
			if (flag === 'A') {
				var RemarksA = sap.ui.getCore().byId("textAreaWithBinding2").getValue();
				if (RemarksA === "") {
					BI.close();
					this.openErrorDialog("Please Enter the remarks to Approver", function() {
						BI.close(); // This will execute when the dialog is closed
					});

					//sap.m.MessageBox.error("Please Enter the remarks to Approver", {
					//  title: "Error", // default
					//  onClose: function(oAction) {
					//    BI.close();
					//  }, // default
					//  styleClass: "", // default
					//  actions: sap.m.MessageBox.Action.CLOSE, // default
					//  emphasizedAction: null, // default
					//  initialFocus: null, // default
					//  textDirection: sap.ui.core.TextDirection.Inherit // default
					//});
				} else {
					this.fn_success_confirm(RemarksA);
				}
			} else if (flag === 'R') {
				var RemarksR = sap.ui.getCore().byId("textAreaWithBinding2").getValue();
				if (RemarksR === "") {
					BI.close();
					this.openErrorDialog("Please Enter the remarks to Reject", function() {
						BI.close(); // This will execute when the dialog is closed
					});

					//sap.m.MessageBox.error("Please Enter the remarks to Reject", {
					//  title: "Error", // default
					//  onClose: function(oAction) {
					//    BI.close();
					//  }, // default
					//  styleClass: "", // default
					//  actions: sap.m.MessageBox.Action.CLOSE, // default
					//  emphasizedAction: null, // default
					//  initialFocus: null, // default
					//  textDirection: sap.ui.core.TextDirection.Inherit // default
					//});
				} else {
					this.fn_reject_confirm(RemarksR);
				}
			} else if (flag === 'T') {
				var RemarksT = sap.ui.getCore().byId("textAreaWithBinding2").getValue();
				var payloc = sap.ui.getCore().byId("id_payloc").getValue();
				if (RemarksT === "") {
					BI.close();
					this.openErrorDialog("Please Enter the remarks to Trigger", function() {
						BI.close(); // This will execute when the dialog is closed
					});

					//sap.m.MessageBox.error("Please Enter the remarks to Trigger", {
					//  title: "Error", // default
					//  onClose: function(oAction) {
					//    BI.close();
					//  }, // default
					//  styleClass: "", // default
					//  actions: sap.m.MessageBox.Action.CLOSE, // default
					//  emphasizedAction: null, // default
					//  initialFocus: null, // default
					//  textDirection: sap.ui.core.TextDirection.Inherit // default
					//});
				} else if (payloc === "") {
					BI.close();
					this.openErrorDialog("Please Enter the Payment Location to Trigger", function() {
						BI.close(); // This will execute when the dialog is closed
					});
					//sap.m.MessageBox.error("Please Enter the Payment Location to Trigger", {
					//  title: "Error", // default
					//  onClose: function(oAction) {
					//    BI.close();
					//  }, // default
					//  styleClass: "", // default
					//  actions: sap.m.MessageBox.Action.CLOSE, // default
					//  emphasizedAction: null, // default
					//  initialFocus: null, // default
					//  textDirection: sap.ui.core.TextDirection.Inherit // default
					//});
				} else {
					this.fn_trigger_confirm(RemarksT, payloc);
				}
			}
			if (!this.Remarks) {
				this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksPayLoc", this);
				this.getView().addDependent(this.Remarks);
			}
			this.Remarks.close();

			BI.close();
		},
		fn_closeremarks: function() {
			if (!this.Remarks) {
				this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksPayLoc", this);
				this.getView().addDependent(this.Remarks);
			}
			this.Remarks.close();
			sap.ui.getCore().byId("textAreaWithBinding2").setValue(null);
			if (this.Remarks) {
				this.Remarks.destroy();
				this.Remarks = null;
			}
		},
		onPressTrigger: function() {
			this.getPaymentLoc();
			if (!this.Remarks) {
				this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.RemarksPayLoc", this);
				this.getView().addDependent(this.Remarks);
			}
			this.Remarks.open();
			sap.ui.getCore().byId("id_payloc").setVisible(true);
			sap.ui.getCore().byId("toolid").setVisible(true);
			var payloctf = sap.ui.getCore().byId("id_payloc").getVisible();
			if (payloctf === true) {
				sap.ui.getCore().byId("id_payloc").setValue(null);
				sap.ui.getCore().byId("id_pl").setVisible(true);
			}
			sap.ui.getCore().byId("toolid").setVisible(true);
			sap.ui.getCore().byId("id_dialog").setTitle("Trigger Details");
			sap.ui.getCore().byId("textAreaWithBinding2").setValue(Comments_Rem);
			flag = 'T';
		},
				handleSearch1: function (oEvent) {
    var sQuery = oEvent.getParameter("value");
    sQuery = sQuery ? sQuery.trim().toLowerCase() : "";

    var oList = this.byId("id_list");
    var oBinding = oList.getBinding("items");
    var aFilters = [];

    if (sQuery) {
        var aSubFilters = [
            new sap.ui.model.Filter("Transid", sap.ui.model.FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("PayLoc", sap.ui.model.FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("PayAmount", sap.ui.model.FilterOperator.Contains, sQuery)
        ];

        // Date filter support
        var fnNormalizeDate = function (sDate) {
            return sDate.replace(/[-.]/g, "/");
        };
        var sDateQuery = fnNormalizeDate(sQuery);

        aSubFilters.push(new sap.ui.model.Filter({
            path: "Reindat",
            test: function (value) {
                if (!value) return false;
                try {
                    var sVal = new Date(value);
                    var formatted = sVal.toLocaleDateString("en-GB"); // e.g. 10/10/2025
                    return formatted.toLowerCase().includes(sDateQuery);
                } catch (e) {
                    return String(value).toLowerCase().includes(sDateQuery);
                }
            }
        }));

        aFilters.push(new sap.ui.model.Filter({
            filters: aSubFilters,
            and: false
        }));
    }

    oBinding.filter(aFilters);
},
		fncancel: function(oEvent) {
			var JsonoModelProfit = new sap.ui.model.json.JSONModel();
			var arr = this.getView().getModel("MId").getData();
			JsonoModelProfit.setData(arr);
			this.getView().setModel(JsonoModelProfit, "MId");
			var length_data = arr.length;
			//Added by Lokesh R on 21.09.2023 - Start
			if (length_data) {
				for (var i = 0; i < length_data; i++) {
					arr[i].Transid = String(arr[i].Transid);
					arr[i].Reindat = String(arr[i].Reindat);
					arr[i].PayAmount = String(arr[i].PayAmount);
				}
			}
			JsonoModelProfit.refresh();
		},
		onPressPDF: function() {
			var arr = [];
			var arr1 = [];
			var final_arr = this.getView().getModel("Mopen").getData();
			for (var i = 0; i < final_arr.length; i++) {
				var temp = {
					Ven: final_arr[i].Lifnr,
					Name: final_arr[i].Name1
				};
				arr.push(temp);
				arr1.push(final_arr[i].Lifnr);
			}

			var unique = [];
			var unique1 = [];
			for (i = 0; i < arr1.length; i++) {
				if (unique1.indexOf(arr1[i]) === -1) {
					unique1.push(arr1[i]);
					unique.push(arr[i]);
				}
			}

			var JsonoModel = new sap.ui.model.json.JSONModel();
			JsonoModel.setData(unique);
			this.getView().setModel(JsonoModel, "MVen");
			if (!this.Details) {
				this.Details = sap.ui.xmlfragment("FSC360NEW.Fragment.DetailsPDF", this);
				this.getView().addDependent(this.Details);
			}
			this.Details.open();

			if (SuccessInd === 'X') {
				// sap.ui.getCore().byId("id_smartformcheck").setSelected(true);
			}
		},
		fn_closedetail: function() {
			if (!this.Details) {
				this.Details = sap.ui.xmlfragment("FSC360NEW.Fragment.DetailsPDF", this);
				this.getView().addDependent(this.Details);
			}
			// sap.ui.getCore().byId("id_smartformcheck").setSelected(false);
			this.Details.close();
			if (this.Details) {
				this.Details.destroy();
				this.Details = null;
			}
		},
		onOpenPDF: function(oEvent) {
			//var smcheck = sap.ui.getCore().byId("id_smartformcheck").getSelected();
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
			//if (smcheck === true) {
			//  ind = 'X';
			//}
			var String1 = Ven;
			var String2 = Id;
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
			//var smcheck = sap.ui.getCore().byId("id_smartformcheck").getSelected();
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
			//if (smcheck === true) {
			//  ind = 'X';
			//}
			var String1 = Ven;
			var String2 = Id;
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
			if (this.Value5) {
				this.Value5.destroy();
				this.Value5 = null;
			}
		},
		OnPressComment: function() {
		 var oView = this.getView();
    // var tdline = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Tdline");

    // Split each block by double newlines if needed
    var comments = this.tdline.split("\n\n")
    .map(function(c, index, arr) {
        var lines = c.split("\n");
        var title = lines[0] || "";
        var message = lines.slice(1).join("\n") || "";
        return {
            title: title,
            message: message,
            showLine: index < arr.length - 1
        };
    })
    .filter(function(item) {
        // Remove empty items
        return item.title !== "" || item.message !== "";
    });
		 if (!this.Comment) {
        this.Comment = sap.ui.xmlfragment("FSC360NEW.Fragment.Comments", this);
        oView.addDependent(this.Comment);

        var that = this;
        $(document).on("mousedown.commentDialog", function (e) {
            var $target = $(e.target);
            var bInsideDialog = $target.closest(".sapMDialog").length > 0;
            if (!bInsideDialog && that.Comment.isOpen()) {
                that.Comment.close();
            }
        });
    }

    // Set the model to the fragment
    var oCommentModel = new sap.ui.model.json.JSONModel();
    oCommentModel.setData({ comments: comments });
    this.Comment.setModel(oCommentModel, "CommentModel");

    this.Comment.open();

		},
		fn_closecomment: function() {
			if (!this.Comment) {
				this.Comment = sap.ui.xmlfragment("FSC360NEW.Fragment.Comments", this);
				this.getView().addDependent(this.Comment);
			}
			this.Comment.close();
			sap.ui.getCore().byId("id_comment").setText("");
			if (this.Comment) {
				this.Comment.destroy();
				this.Comment = null;
			}
		},
		fn_sorting1: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("id_list");
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
		fn_sort_frag1: function() {
			var JsonoModelId = new sap.ui.model.json.JSONModel();
			var arr = this.getView().getModel("MId").getData();
			JsonoModelId.setData(arr);
			this.getView().setModel(JsonoModelId, "MId");
			// var length_data = arr.length;
			//Added by Lokesh R on 21.09.2023 - Start
			// if (length_data) {
			//  for (var i = 0; i < length_data; i++) {
			//    arr[i].Lifnr = parseInt(arr[i].Lifnr);
			//    arr[i].Belnr = parseInt(arr[i].Belnr);
			//  }
			// }
			JsonoModelId.refresh();
			if (!this.Value56) {
				this.Value56 = sap.ui.xmlfragment("FSC360NEW.Fragment.Sort1", this);
				this.getView().addDependent(this.Value55);
			}
			this.Value56.open();
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
		onSubmitGL: function() {
			var oData = this.getView().getModel("MGLAccount").getData();
			var glacc = this.getView().byId("id_glacc").getValue();
			var flag1 = "";
			for (var i = 0; i < oData.length; i++) {
				if (glacc === oData[i].Ukont) {
					flag1 = 'X';
				}
			}
			if (flag1 === 'X') {
				this.getView().byId("id_glacc").setValueState("None");
				this.OnSelectGLAccount();
			} else {
				this.getView().byId("id_glacc").setValueState("Error");
			}
		},
		onExcelDowload: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var oView = this.getView();
			var obj = {};
			obj.Flag = 'D';
			obj.NavPay = [];
			var temp = {
				"Transid": Id
			};
			obj.NavPay.push(temp);
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();

			oModel.create('/OpenSet', obj, {
				success: function(oData, Response) {
					BI.close();
					if (oData.Flag1 !== 'X') {
						var oPay = "Payment_";
						var oFilename = oPay.concat(String(parseInt(Id)) + ".xlsx");
						var workbook = new kendo.ooxml.Workbook({
							sheets: [{
								rows: []
							}]
						});
						var oTab = sap.ui.getCore().byId("id_tablesimulate");
						var FinalArray = [];
						if (oTab.getModel("JMMessage").oData !== undefined) {
							for (var i = 0; i < oTab.getModel("JMMessage").oData.length; i++) {
								var arrTabValue = [];
								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].Slno
								};
								arrTabValue.push(locValues);
								//Added by Lokesh R on 31.07.2024 - Start
								if (oTab.getModel("JMMessage").oData[i].Kunnr !== "") {
									var locValues = {
										"value": oTab.getModel("JMMessage").oData[i].Kunnr
									};
									arrTabValue.push(locValues);
								}
								//Added by Lokesh R on 31.07.2024 - End
								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].CompName
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].BankNum
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].PayType
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": String(Math.trunc(oTab.getModel("JMMessage").oData[i].Rwbtr))
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].VendName
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].BankIfsc
								};
								arrTabValue.push(locValues);

								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].BankAcc
								};
								arrTabValue.push(locValues);

								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].DefaultText
								};
								arrTabValue.push(locValues);

								var locValues = {
									"value": oTab.getModel("JMMessage").oData[i].DefaultMail
								};
								arrTabValue.push(locValues);
								workbook.options.sheets[0].rows.push({
									cells: arrTabValue
								});
							}
						}
						workbook.toDataURLAsync().then(function(dataURL) {
							kendo.saveAs({
								dataURI: dataURL,
								fileName: oFilename
							});
						});
						that.openSuccessDialog("Excel Downloaded Successfully");

						// MessageBox.success("Excel Downloaded Successfully", {
						//   actions: ["OK"],
						//   onClose: function(nAction) {
						//     if (nAction === "OK") {

						//     }
						//   }
						// });
					} else {
						that.openErrorDialog(" Excel Already Downloaded ");
						// MessageBox.error(" Excel Already Downloaded ", {
						//   actions: ["OK"],
						//   onClose: function(nAction) {
						//     if (nAction === "OK") {}
						//   }
						// });
					}
				},
				error: function() {
					BI.close();
					this.openErrorDialog(" Error! ");
					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});
		},
		onExcelDowloadLvl2: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
			var oView = this.getView();
			var obj = {};
			obj.Flag = 'D';
			obj.Transid = Id;
			obj.NavPay3 = [];
			obj.NavRunPayReturn = [];
			obj.NavPayMessage = [];
			obj.NavExlMsg = [];
			var that = this;
			var BI = new sap.m.BusyDialog();
			BI.open();

			oModel.create('/RunPaymentSet', obj, {
				success: function(oData, Response) {
					BI.close();
					if (oData.Flag !== 'E') {
						var oPay = "Payment_";
						var oFilename = oPay.concat(String(parseInt(Id)) + ".xlsx");
						var workbook = new kendo.ooxml.Workbook({
							sheets: [{
								rows: []
							}]
						});
						// var oTab = sap.ui.getCore().byId("id_tablesimulate");
						var FinalArray = [];
						var oArr = oData.NavExlMsg.results;
						//var oJsonMsgModel = new sap.ui.model.json.JSONModel();
						// oJsonMsgModel.setData(oArr);
						// that.getView().setModel(oJsonMsgModel, "JMMessage");
						// that.getView().getModel("JMMessage").refresh();
						if (oArr !== undefined) {
							for (var i = 0; i < oArr.length; i++) {
								var arrTabValue = [];
								var locValues = {
									"value": oArr[i].Slno
								};
								arrTabValue.push(locValues);
								//Added by Lokesh R on 31.07.2024 - Start
								if (oArr[i].Kunnr !== "") {
									var locValues = {
										"value": oArr[i].Kunnr
									};
									arrTabValue.push(locValues);
								}
								//Added by Lokesh R on 31.07.2024 - End
								var locValues = {
									"value": oArr[i].CompName
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oArr[i].BankNum
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oArr[i].PayType
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": String(Math.trunc(oArr[i].Rwbtr))
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oArr[i].VendName
								};
								arrTabValue.push(locValues);
								var locValues = {
									"value": oArr[i].BankIfsc
								};
								arrTabValue.push(locValues);

								var locValues = {
									"value": oArr[i].BankAcc
								};
								arrTabValue.push(locValues);

								var locValues = {
									"value": oArr[i].DefaultText
								};
								arrTabValue.push(locValues);

								var locValues = {
									"value": oArr[i].DefaultMail
								};
								arrTabValue.push(locValues);
								workbook.options.sheets[0].rows.push({
									cells: arrTabValue
								});
							}
						}
						workbook.toDataURLAsync().then(function(dataURL) {
							kendo.saveAs({
								dataURI: dataURL,
								fileName: oFilename
							});
						});
						that.openSuccessDialog("Excel Downloaded Successfully");

						// MessageBox.success("Excel Downloaded Successfully", {
						//   actions: ["OK"],
						//   onClose: function(nAction) {
						//     if (nAction === "OK") {

						//     }
						//   }
						// });
					} else {
						that.openErrorDialog(" Excel Already Downloaded ");
						// MessageBox.error(" Excel Already Downloaded ", {
						//   actions: ["OK"],
						//   onClose: function(nAction) {
						//     if (nAction === "OK") {}
						//   }
						// });
					}
				},
				error: function() {
					BI.close();
					that.openErrorDialog("Error!");

					//MessageBox.error(" Error! ", {
					//  actions: ["OK"],
					//  onClose: function(nAction) {
					//    if (nAction === "OK") {}
					//  }
					//});
				}
			});
		},
		openErrorDialog: function(sMessage, fnOnClose) {
			var oView = this.getView();

			// Set the dynamic message in the model
			oView.getModel("errorModel").setProperty("/message", sMessage);

			// Save the callback function for later use
			this._errorDialogCloseCallback = fnOnClose || null;

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
				this.ErrorDialog.close();

				// If there is a callback, execute it
				if (typeof this._errorDialogCloseCallback === "function") {
					this._errorDialogCloseCallback();
				}

				// Reset callback to avoid accidental multiple calls
				this._errorDialogCloseCallback = null;
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
				this.SuccessDialog.Destroy();
				this.SuccessDialog=null;

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