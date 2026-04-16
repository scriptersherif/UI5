sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter"
], function(Controller, Filter, FilterOperator, formatter) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var Docid = "";
	var vTrnsid = "";

	return Controller.extend("FSC360NEW.controller.NonPoIndexer", {
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("NonPoIndexer").attachPatternMatched(this.FnonRouteMatched, this);
			this.oGlobalBusyDialog = new sap.m.BusyDialog();
			this.fncompanycode();
			this.fnGetF4Help();
			Docid = "";
			var oData = [{
				TransactionId: "110004",
				VendorNo: "90001234567",
				VendorName: "Vendor Name"
			}, {
				TransactionId: "110005",
				VendorNo: "90007654321",
				VendorName: "Another Vendor"
			}];

			var oModel = new sap.ui.model.json.JSONModel(oData);
			this.getView().setModel(oModel, "JSListQid");

			setTimeout(function() {
				this.fn_applyFlexGrow();
			}.bind(this), 100);
			var oPressedBtn = this.getView().byId("id_nonpoindexer");
			var aCustomData = oPressedBtn.getCustomData();
			var sKey = "";

			for (var i = 0; i < aCustomData.length; i++) {
				if (aCustomData[i].getKey() === "key") {
					sKey = aCustomData[i].getValue();
					break;
				}
			}

			// Store last clicked type
			this.getOwnerComponent()._lastUserType = sKey;

			// Remove highlight
			var oHBox = this.getView().byId("id_usertype");
			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");
			});

			// Highlight clicked
			oPressedBtn.addStyleClass("activeGroupBtn");
			this.fn_LoadData("I");
			this.fn_getVendor();

		},
		FnonRouteMatched: function() {
			this.onClearAll();
			var oHBox = this.getView().byId("id_usertype");
			if (!oHBox) return;

			var sKey = "N";

			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");

				var btnKey = btn.getCustomData().find(cd => cd.getKey() === "key").getValue();
				if (btnKey === sKey) {
					btn.addStyleClass("activeGroupBtn");
				}
			});
		},
		fn_onUserTypePress: function(oEvent) {
			var oPressedBtn = oEvent.getSource();
			var sKey = oPressedBtn.getCustomData().find(cd => cd.getKey() === "key").getValue();

			this.getOwnerComponent()._lastUserType = sKey;

			var oHBox = this.getView().byId("id_usertype");
			oHBox.getItems().forEach(function(btn) {
				btn.removeStyleClass("activeGroupBtn");
			});

			oPressedBtn.addStyleClass("activeGroupBtn");

			if (sKey === "W" || sKey === "I" || sKey === "H" ) {
				this.oRouter.navTo("Fulfilment", {
					btnstat: sKey
				});
				// this.fn_LoadData(sKey);
			} else if (sKey === "A") {

				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("AutoPark");
			} else if (sKey === "N") {

				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.navTo("NonPoIndexer");
			}
		},
		onAfterRendering: function() {

			this.byId("idFileBox").attachBrowserEvent("click", this.onFileBoxClick.bind(this));
			setTimeout(() => {
				this.fn_applyFlexGrow("formInputB1", "cl_saleAmountBox1", "cl_combo_transBar");
			}, 0);
		},
		fn_applyFlexGrow: function() {
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
					//oParent.style.minWidth = "48%";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

			$view.find(".cl_combo_transBarw").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
					//oParent.style.minWidth = "48%";
					oParent.style.maxWidth = "100%";
					oParent.style.width = "100%";
				}
			});

		},
		fncompanycode: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var QueueID, Stats;

			QueueID = '';
			var Stats;
			Stats = '';
			var Bukrs;
			if (Bukrs === '') {
				Bukrs = '6000';
			}
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

					// 		  var aCurrencyList = oData.results[0].NavCurrency.results;

					//var oModel = new sap.ui.model.json.JSONModel();
					//oModel.setData({ CurrencyList: aCurrencyList });  // 👈 wrap inside an object
					//that.getView().setModel(oModel, "JSCurrency");
					var aCurrencyList = oData.results[0].NavCurrency.results; // full 211 array
					var oCurrencyModel = new sap.ui.model.json.JSONModel({
						CurrencyList: aCurrencyList
					});

					that.getView().setModel(oCurrencyModel, "JSCurrency");

					// Optional debug
					console.log("Currency Count:", aCurrencyList.length);
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

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results[0].NavCost.results);
					that.getView().setModel(oModel, 'JSCostCenter');
					var oModel = new sap.ui.model.json.JSONModel({
						Waers: "INR"
					}); // default
					that.getView().setModel(oModel, "JSSelectedCurrency");

				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');

				}

			});

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
				this.getView().byId("id_NonpoIndexerForm").setWidth("70%");
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
		fn_LoadData: function(sKey) {
			this.getView().byId("id_delete_upload").setVisible(false);
			this.getView().byId("id_re_upload").setVisible(false);
			oGlobalBusyDialog.open();
			// sap.ui.core.BusyIndicator.show();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, sKey || "F"), // use passed user type
					new Filter("IvAction", FilterOperator.EQ, "NonPoAuth" || "")
				],
				urlParameters: {
					$expand: "NavUsername"
				},
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var result = oData.results[0];
					var oUserModel = new sap.ui.model.json.JSONModel();
					oUserModel.setData(result);
					that.getView().setModel(oUserModel, "JSusername");

					oGlobalBusyDialog.close();
					if (oData.results[0].Flag === 'C') {
						that.getView().byId("id_creatorbox").setVisible(true);
						that.getView().byId("id_approverbox").setVisible(false);

						var oModel1 = new sap.ui.model.json.JSONModel();
						that.getView().setModel(oModel1, "JSKey");
						var oModel1 = that.getView().getModel("JSKey");
						oModel1.setProperty("/0/Key", true);
					} else if (oData.results[0].Flag === 'A' || 'V') {
						that.getView().byId("id_approverbox").setVisible(true);
						that.getView().byId("id_creatorbox").setVisible(false);
						var oModel1 = new sap.ui.model.json.JSONModel();
						that.getView().setModel(oModel1, "JSKey");
						var oModel1 = that.getView().getModel("JSKey");
						oModel1.setProperty("/0/Key", false);
					}
				},
				error: function(oError) {
					oGlobalBusyDialog.close();
					// optional: add error handling
					console.error("Data load failed", oError);
				}
			});
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
			this.getView().byId("id_delete_upload").setVisible(true);
			this.getView().byId("id_re_upload").setVisible(true);
			var oFile = oEvent.getParameter("files")[0];
			if (oFile) {
				this.selectedFile = oFile;

				// Read file as base64
				var reader = new FileReader();
				var that = this;

				reader.onload = function(e) {
					that.addPreviewToContainer(e.target.result, oFile.type, oFile.name);
				};
				this.byId("fullbox_before").setVisible(false);
				this.byId("fullbox_after").setVisible(true);
				this.byId("idFileBox").setVisible(false);
				this.byId("idPreviewContainer").setVisible(true);

				reader.readAsDataURL(oFile);
			}
		},

		onDragEnter: function(oEvent) {
			oEvent.preventDefault();
		},

		onDragOver: function(oEvent) {
			oEvent.preventDefault();
		},

		onFileDrop: function(oEvent) {
			this.getView().byId("id_delete_upload").setVisible(true);
			this.getView().byId("id_re_upload").setVisible(true);
			oEvent.preventDefault();

			var files = oEvent.dataTransfer.files;

			if (files.length > 0) {
				var vFile = files[0];
				this.selectedFile = vFile; // ✅ Fix: Set file for later use in Save

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
					for (var i = 1; i <= pdf.numPages; i++) {
						(function(pageNumber) {
							pdf.getPage(pageNumber).then(function(page) {
								var viewport = page.getViewport({
									scale: 1.5
								});
								var canvas = document.createElement("canvas");
								var context = canvas.getContext("2d");
								canvas.height = viewport.height;
								canvas.width = viewport.width;

								var renderContext = {
									canvasContext: context,
									viewport: viewport
								};

								page.render(renderContext).promise.then(function() {
									var img = new sap.m.Image({
										src: canvas.toDataURL(),
										width: "240px",
										height: "auto",
										densityAware: false
									});

									var pageBox = new sap.m.VBox({
										width: "120px",
										height: "auto",
										alignItems: "Center",
										justifyContent: "Center",
										styleClass: "sapUiSmallMarginEnd sapUiSmallMarginBottom"
									});

									pageBox.addItem(img);
									// pageBox.addItem(new sap.m.Text({ text: fileName + " - Page " + pageNumber, wrapping: true }));
									oPreviewContainer.addItem(pageBox);
								});
							});
						})(i); // Immediately-invoked function to capture `i`
					}
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
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			// To Get Vendor
			oModel.read("/KredaSet", {

				success: function(oData, oResponse) {

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, 'JSVendor');

				},
				error: function(oResponse) {
					sap.m.MessageBox.error('Http Error');

				}

			});

			var sBukrs = "6000";
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
					that.getView().setModel(oModel, 'JSExpty');
					console.log("NavSection loaded:", oData.results[0].NavSection.results);
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Section Codes.");
					console.error(oError);
				}
			});
		},
		fn_numberonly: function(oEvent) {
			  var oCB = oEvent.getSource();
    var sValue = oEvent.getParameter("value") || "";
    var sNumeric = sValue.replace(/\D/g, ""); // only numbers

    if (sValue !== sNumeric) {
        oCB.setValue(sNumeric);
    }

    var oCtx = oCB.getBindingContext("JSNonPo");
    if (oCtx) {
        // if source field is GL account (Hkont) set that,
        // else if it's Expty, set that
        var sPath = oCB.getBinding("value").getPath();
        oCtx.getModel().setProperty(sPath, sNumeric, oCtx);
    }
		},
		onSectionCodeChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();
			var oContext = oInput.getBindingContext("JSNonPo");

			// Update the model live
			oContext.getModel().setProperty("Expty", sValue, oContext);

		},
		fn_getvendorcode: function() {
			this.getView().byId("id_lifnr").setValue("");
			if (!this.Vendor_frag) {
				this.Vendor_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Lifnr", this);
				this.getView().addDependent(this.Vendor_frag);
			}
			this.Vendor_frag.open();
		},

		fn_getSuccessDialog: function() {
			if (!this._oSuccessDialog) {
				this._oSuccessDialog = sap.ui.xmlfragment(
					"FSC360NEW.fragment.InvUblsuccess",

				);
				this.getView().addDependent(this._oSuccessDialog);
			}
			return this._oSuccessDialog;
		},

		fn_submit: function() {
			var oController = this;
			var oView = this.getView();
			var bValid = true;

			// Header field validation
			var aFields = ["id_lifnr", "id_venname", "id_invdate", "id_invno", "id_amount"];
			aFields.forEach(function(sId) {
				var oField = oView.byId(sId);
				if (oField instanceof sap.m.Input || oField instanceof sap.m.DatePicker) {
					if (!oField.getValue()) {
						oField.setValueState("Error");
						oField.setValueStateText("This field is required");
						bValid = false;
					} else {
						oField.setValueState("None");
					}
				}
			});

			// Table row validation
			var oModelTable = this.getView().getModel("JSNonPo");
			var aRows = oModelTable.getProperty("/");

			aRows.forEach(function(oRow, iIndex) {
				if (!oRow.Expty || !oRow.Hkont || !oRow.KontoTxt || !oRow.Wrbtr || !oRow.Kostl || !oRow.Sgtxt) {
					bValid = false;
				}
			});

			// Final check
			if (!bValid) {
				sap.m.MessageBox.error("Please fill all mandatory fields .");
				return;
			}

			// . Build Payload for OData
			var obj = {
				IvAction: 'NonPo',
				'NavNonPoItem': []
			};

			var oNonPo = this.getView().getModel("JSNonPo").getData();
			for (var i = 0; i < oNonPo.length; i++) {
				var arobj = {
					'Lifnr': this.getView().byId("id_lifnr").getValue(),
					'Name1': this.getView().byId("id_venname").getValue(),
					'Invno': this.getView().byId("id_invno").getValue(),
					'Invdt': "/Date(" + new Date(this.getView().byId("id_invdate").getDateValue()).getTime() + ")/",
					'Wrbtr': this.getView().byId("id_amount").getValue(),
					'Waers': this.getView().byId("id_currency").getSelectedKey(),
					'Remarks': this.getView().byId("id_comments").getValue(),
					'Docid': Docid,
					'Expty': oNonPo[i].Expty,
					'Hkont': oNonPo[i].Hkont,
					'KontoTxt': oNonPo[i].KontoTxt,
					'Wrbtr': oNonPo[i].Wrbtr,
					'Kostl': oNonPo[i].Kostl,
					'Sgtxt': oNonPo[i].Sgtxt
				};
				obj.NavNonPoItem.push(arobj);
			}
			oGlobalBusyDialog.open();
			// 4. Call OData Service
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oModel.create('/DEEPHEADSet', obj, {
				success: function(oData) {
					var oResult = oData.NavNonPoItem.results;
					var transid = oResult[0].Trnsid;

					var oDialog = this.fn_getSuccessDialog();
					sap.ui.getCore().byId("id_dynamictest")
						.setText("Transid Created Successfully");
					sap.ui.getCore().byId("id_successText_ubl")
						.setText(" Trnsid: " + transid);
					oDialog.open();
					oGlobalBusyDialog.close();
					setTimeout(function() {
						oDialog.close();
						oController.onClearAll();
					}, 3000);
				}.bind(oController),
				error: function(oError) {
					sap.m.MessageBox.error("Error while creating Non-PO Approver Request");
					oGlobalBusyDialog.close();
					console.error(oError);
				}
			});
		},

		fnApprove: function() {
			if (!this._oCommentDialog) {
				this._oCommentDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.CommentsNpon", this);
				this.getView().addDependent(this._oCommentDialog);
			}
			this._oCommentDialog.open();

			// var oView = this.getView();
			// var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			// var obj = {
			// 	IvAction: 'NPoAppr',
			// 	'NavNonPoItem': []
			// };
			// var arobj = {
			// 	'Trnsid': vTrnsid

			// }
			// obj.NavNonPoItem.push(arobj);
			// oModel.create('/DEEPHEADSet', obj, {
			// 	success: function(oData) {
			// 		if (obj.IvText === 'Queid Generated' && obj.Qid !== undefined && obj.Qid !== '') {
			// 			sap.m.MessageBox.success("Approver Request Number" + obj.Trnsid + " successfully Approved & Queid- " + obj.Qid +
			// 				"Generated");
			// 		} else if (obj.IvText === 'Approved' && obj.Trnsid !== undefined && obj.Trnsid !== '') {
			// 			sap.m.MessageBox.success("Approver Request Number" + obj.Trnsid + " successfully Approved");
			// 		}
			// 	},
			// 	error: function(oError) {
			// 		sap.m.MessageBox.error("Error while Approving Non-PO Approver Request");
			// 		oGlobalBusyDialog.close();
			// 		console.error(oError);
			// 	}
			// });
		},
		fn_appsubmit: function() {

			var sComment = sap.ui.getCore().byId("id_appComments").getValue(); // fetch entered comment
			oGlobalBusyDialog.open();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var obj = {
				IvAction: "NPoAppr",

				NavNonPoItem: [{
					'Trnsid': vTrnsid,
					'WfComments': sComment
				}]
			};

			oModel.create("/DEEPHEADSet", obj, {
				success: function(oData) {
					// if (oData.IvText === "Queid Generated" && oData.Qid) {
					//     sap.m.MessageBox.success("Approver Request Number " + oData.Trnsid +
					//         " successfully Approved & Queid- " + oData.Qid + " Generated");
					// } else if (oData.IvText === "Approved" && oData.Trnsid) {
					//     sap.m.MessageBox.success("Approver Request Number " + oData.Trnsid + " successfully Approved");
					// }
					// oGlobalBusyDialog.close();
					// },
					var oDialog = this.fn_getSuccessDialog();

					if (oData.IvText === "Queid Generated" && oData.Qid) {
						sap.ui.getCore().byId("id_dynamictest")
							.setText("Approver Request Approved");
						sap.ui.getCore().byId("id_successText_ubl")
							.setText("Request " + oData.Trnsid +
								" approved & Queid " + oData.Qid + " generated");
					} else if (oData.IvText === "Approved" && oData.Trnsid) {
						sap.ui.getCore().byId("id_dynamictest")
							.setText("Approver Request Approved");
						sap.ui.getCore().byId("id_successText_ubl")
							.setText("Request " + oData.Trnsid + " successfully approved");
					}

					oDialog.open();
					oGlobalBusyDialog.close();

					setTimeout(function() {
						oDialog.close();
					}, 3000);

				}.bind(this),

				error: function(oError) {
					sap.m.MessageBox.error("Error while Approving Non-PO Approver Request");
					console.error(oError);
					oGlobalBusyDialog.close();
				}
			});

			// Close & destroy dialog after submit
			var oDialog = sap.ui.getCore().byId("id_nonpocomment");
			if (oDialog) {
				oDialog.close();
				oDialog.destroy();
				this._oCommentDialog = null;
			}
		},
		fn_appcancel: function() {
			// Close dialog
			var oDialog = sap.ui.getCore().byId("id_nonpocomment");
			if (oDialog) {
				oDialog.close();
				oDialog.destroy(); // ensures memory cleanup
				this._oCommentDialog = null; // reset reference
			}
		},

		fnReject: function() {
			if (!this._oCommentDialog) {
				this._oCommentDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.CommentsNponRej", this);
				this.getView().addDependent(this._oCommentDialog);
			}
			this._oCommentDialog.open();
			// var oView = this.getView();
			// var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			// var obj = {
			// 	IvAction: 'NPoRej',
			// 	'NavNonPoItem': []
			// };
			// var arobj = {
			// 	'Trnsid': vTrnsid
			// }
			// obj.NavNonPoItem.push(arobj);
			// oModel.create('/DEEPHEADSet', obj, {
			// 	success: function(oData) {
			// 		if (obj.IvText === 'Rejected') {
			// 			sap.m.MessageBox.success("Approver Request Number successfully Rejected - " + obj.Trnsid);
			// 		}
			// 	},
			// 	error: function(oError) {
			// 		sap.m.MessageBox.error("Error while Rejecting Non-PO Approver Request");
			// 		oGlobalBusyDialog.close();
			// 		console.error(oError);
			// 	}
			// });
		},
		fn_rejsubmit: function() {

			var sComment = sap.ui.getCore().byId("id_rejComments").getValue();
			oGlobalBusyDialog.open();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var obj = {
				IvAction: "NPoRej",

				NavNonPoItem: [{
					'Trnsid': vTrnsid,
					'WfComments': sComment,
				}]
			};

			oModel.create("/DEEPHEADSet", obj, {
				success: function(oData) {
					var oRejDialog = sap.ui.getCore().byId("id_nonpocommentrej");
					if (oRejDialog) {
						oRejDialog.close();
						oRejDialog.destroy();
						this._oCommentDialog = null;
					}

					var oDialog = this.fn_getSuccessDialog();

					if (oData.IvText === "Rejected" || oData.Trnsid) {
						sap.ui.getCore().byId("id_dynamictest")
							.setText("Approver Request Rejected");
						sap.ui.getCore().byId("id_successText_ubl")
							.setText("Request " + oData.Trnsid + " has been rejected successfully");
					}

					oDialog.open();
					oGlobalBusyDialog.close();

					// Auto close after 3s
					setTimeout(function() {
						oDialog.close();
					}, 3000);

				}.bind(this),
				error: function(oError) {
					sap.m.MessageBox.error("Error while Rejecting Non-PO Approver Request");
					console.error(oError);
					oGlobalBusyDialog.close();
				}
			});

			// Close & destroy fragment after submit
			var oDialog = sap.ui.getCore().byId("id_nonpocomment");
			if (oDialog) {
				oDialog.close();
				oDialog.destroy();
				this._oCommentDialog = null;
			}
		},
		fn_rejcancel: function() {
			// Close dialog
			var oDialog = sap.ui.getCore().byId("id_nonpocommentrej");
			if (oDialog) {
				oDialog.close();
				oDialog.destroy(); // ensures memory cleanup
				this._oCommentDialog = null; // reset reference
			}
		},
		onClearAll: function() {
			Docid = "";
			this.getView().byId("id_lifnr").setValue("");
			this.getView().byId("id_venname").setValue("");
			this.getView().byId("id_venname").setEditable(true);
			this.getView().byId("id_invdate").setValue("");
			this.getView().byId("id_invno").setValue("");
			this.getView().byId("id_amount").setValue("");
			this.byId("id_currency").setSelectedKey("");
			this.getView().byId("id_comments").setValue("");
			// Clear FileUploader value
			this.getView().byId("id_delete_upload").setVisible(false);
			this.getView().byId("id_re_upload").setVisible(false);
			var oFileUploader = this.byId("fileuploader");
			if (oFileUploader) {
				oFileUploader.clear();
				oFileUploader.setValue("");
			}
			var oNonPoModel = this.getView().getModel("JSNonPo");
			if (oNonPoModel) {
				oNonPoModel.setData([]); // reset
			}
			// Clear selected file reference
			this.selectedFile = null;

			// Remove all previews
			var oPreviewContainer = this.byId("idPreviewContainer");
			if (oPreviewContainer) {

				oPreviewContainer.removeAllItems();
			}

			// Show file upload UI again
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
				this.byId("idFileBox").attachBrowserEvent("click", this.onFileBoxClick.bind(this));

			}, 300); // Small delay to allow DOM to refresh

		},
		fn_Lifnr_Confrm: function(oEvent) {
			var oCtx = oEvent.getParameter('selectedItem').getBindingContext("JSVendor");
			var ven_name = oCtx.getProperty("Mcod1");
			var lifnr = oCtx.getProperty("Lifnr");

			// var ven_name = oEvent.getParameter('selectedItem').getTitle();
			// var lifnr = oEvent.getParameter('selectedItem').getDescription();

			this.getView().byId("id_lifnr").setValue(lifnr);
			this.getView().byId("id_venname").setValue(ven_name);
			this.getView().byId("id_venname").setEditable(false);
			this.getView().byId("id_lifnr").setValueState(sap.ui.core.ValueState.None);
			// this.getView().byId('Tx_vendor').setText(ven_name);
			oEvent.getSource().getBinding("items").filter('');

		},
		fn_Lifnr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);

		},
		fn_savedoc: function() {
			oGlobalBusyDialog.open();
			var vThat = this;
			var vError = false;
			var errchk = true;
			var oError = "";
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
				sap.m.MessageBox.confirm('Are you sure you want to upload file ?', {
					icon: sap.m.MessageBox.Icon.CONFIRMATION,
					title: "Confirmation",
					styleClass: ".cl_SettingDialog.sapMDialog fragmentButton",
					actions: ['Yes', 'No'],
					defaultAction: sap.m.MessageBox.Action.YES,
					onClose: function(oAction) {
						if (oAction === "Yes") {
							// vThat.fn_barcode_check();
							if (errchk === true) {
								//====================Create Header Table Entry============================
								//sap.ui.core.BusyIndicator.show(10);

								var oModel = vThat.getView().getModel();
								var vSlug = vFile.name;
								var vTaskService = "/sap/opu/odata/EXL/FSCNXT360_SRV/NonPoImgSet";
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
											oGlobalBusyDialog.close();
											// if (oData.d.Message === "") {
											if (oData.d.Lifnr !== "" && oData.d.Name1 !== "" && oData.d.WfComments === "") {
												vThat.getView().byId("id_lifnr").setValue(oData.d.Lifnr);
												vThat.getView().byId("id_venname").setValue(oData.d.Name1);
												vThat.getView().byId("id_venname").setEditable(false);
												var timestamp = parseInt(oData.d.Invdt.replace(/\/Date\((\d+)\)\//, "$1"), 10);
												vThat.getView().byId("id_invdate").setDateValue(new Date(timestamp));
												vThat.getView().byId("id_invno").setValue(oData.d.Invno);
												vThat.getView().byId("id_amount").setValue(Number(oData.d.Wrbtr).toFixed(2));
												Docid = oData.d.Docid;

												var temp1 = {
													'Wrbtr': Number(oData.d.Wrbtr).toFixed(2)
												};
												var vArr = [];
												vArr.push(temp1);

												var oModel = new sap.ui.model.json.JSONModel();
												// var oModel = vThat.getView().getModel("JSNonPo");
												oModel.setData(vArr);
												vThat.getView().setModel(oModel, "JSNonPo");
												sap.m.MessageToast.show("Details Fected Successfully");
												vThat.getView().byId("id_re_upload").setVisible(false);
												// obj.NavHead.push(temp1);
												// var temp2 = {

												// 	'Ebeln': Puord

												// };
												// obj.NavGetItemValues.push(temp2);

												// oModel.create('/DEEPHEADSet', obj, {
												// 	success: function(oData) {
												// 		sap.m.MessageBox.success("QID " + QID + " Successfully Uploaded");
												// 		vThat.fnclear();
												// 	},
												// 	error: function() {
												// 		sap.m.MessageBox.error("Error");
												// 		// oGlobalBusyDialog.close();
												// 	}
												// });
											} else {
												oGlobalBusyDialog.close();
												sap.m.MessageToast.error(oData.d.WfComments);
											}
											// } else {
											// 	sap.m.MessageBox.error(oData.d.Message);
											// }
										},
										error: function(oData) {
											oGlobalBusyDialog.close();
											Docid = ""
											sap.ui.core.BusyIndicator.hide();
											sap.m.MessageToast.show("Failed to get details");
										}
									});
							} else {
								oGlobalBusyDialog.close();
								sap.m.MessageToast.show("Please enter valid barcode");
							}
						}
					}
				});
			}
		},
		fn_ApproverLoad: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			this.getView().setModel(oModel);

			// bind list directly to OData entityset
			var oList = this.byId("id_qidList");
			oList.bindItems({
				path: "/NonPoHeadSet",
				template: new sap.m.CustomListItem({
					type: "Active",
					press: this.fn_ListItemPress.bind(this),
					content: new sap.m.VBox({
						items: [
							new sap.m.HBox({
								alignItems: "Center",
								items: [
									new sap.m.Text({
										text: "Transaction Id :"
									}) // class not working here
									.addStyleClass("queueid_text"),
									new sap.m.Text({
										text: "{Trnsid}"
									})
									.addStyleClass("queueId_ValText")
								]
							}),
							new sap.m.HBox({
								alignItems: "Center",
								items: [
									new sap.m.Image({
										src: "Images/account.svg"
									})
									.addStyleClass("iconImage iconImageAccount"),
									new sap.m.Text({
										text: "{Lifnr} - {Name1}"
									})
									.addStyleClass("invoiceText")
								]
							})
						]
					}).addStyleClass("listItemBox")
				})
			});
		},
		fn_ListItemPress: function(oEvent) {

			var oClickedItem = oEvent.getSource();
			var oList = this.byId("id_qidList");
			oList.getItems().forEach(function(item) {
				item.removeStyleClass("selectedListItem");
			});
			oClickedItem.addStyleClass("selectedListItem");
			vTrnsid = oEvent.getSource().getBindingContext().getProperty("Trnsid");
			var oModel = this.getView().getModel();
			var that = this;
			oModel.read("/DEEPHEADSet", {
				filters: [

					new sap.ui.model.Filter("Barcode", sap.ui.model.FilterOperator.EQ, vTrnsid),

				],
				urlParameters: {
					$expand: "NavNonPoItem"
				},
				success: function(oData) {
					if (oData.results && oData.results.length > 0) {
						// Full array from backend
						var aAll = oData.results[0].NavNonPoItem.results;

						// 1. Header = first record
						var oHeader = aAll[0];

						// 2. Items = remaining records
						// var aItems = aAll.slice(1);
						var aItems = aAll;
						// 3. Create separate models
						var oHeaderModel = new sap.ui.model.json.JSONModel(oHeader);
						var oItemsModel = new sap.ui.model.json.JSONModel({
							items: aItems
						});

						// 4. Set on view
						that.getView().setModel(oHeaderModel, "HeaderModel");
						that.getView().setModel(oItemsModel, "ItemsModel");
						// 5. Adjust visibleRowCount dynamically
						var oTable = that.byId("idItemsTable"); // <-- give your table an ID in XML
						if (oTable) {
							oTable.setVisibleRowCount(aItems.length > 0 ? aItems.length : 1);
						}
						that.fnGetNonPoPDF(vTrnsid);
						console.log("Header:", oHeader);
						console.log("Items:", aItems);
					} else {
						sap.m.MessageToast.show("No DeepHead data found");
					}
				},
				error: function(oError) {
					sap.m.MessageToast.show("Error loading DeepHead details");
					console.error(oError);
				}
			});
		},
		fnGetNonPoPDF: function(vTrnsid) {
			if (vTrnsid !== "") {
				this.getView().byId("id_scrllnpon").setBusy(true);

				var oScrl = this.getView().byId("id_scrllnpon");
				oScrl.destroyContent();

				// Build URL with TRNSID for NonPoImgSet
				var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/NonPoImgSet(Trnsid='" + vTrnsid + "',Doc='')/$value#toolbar=0";

				var oHtml = new sap.ui.core.HTML({});
				var oContent = "<div class='overlay'><iframe src=" + Url +
					" id='id_nonpo_iframe' allowtransparency='true' frameborder='0' scrolling='yes' height='450' width='350'></iframe></div>";

				oHtml.setContent(oContent);

				oScrl.addContent(oHtml);
				oScrl.setVisible(true);
				this.getView().byId("id_scrllnpon").setBusy(false);
			} else {
				sap.m.MessageBox.error("Please Select the Transaction ID");
			}
		},
		fn_getVendor: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/KredaSet", {
				success: function(oData) {
					// Create JSON Model
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JSVendor");

					// Bind ComboBox items
					that.byId("id_lifnr").bindItems({
						path: "JSVendor>/",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSVendor>Lifnr}",
							text: "{JSVendor>Lifnr}",
							additionalText: "{JSVendor>Mcod1}"
						})
					});
					// that.byId("id_vendorbill").bindItems({
					// 	path: "JSVendor>/",
					// 	length: oData.results.length,
					// 	template: new sap.ui.core.ListItem({
					// 		key: "{JSVendor>Lifnr}",
					// 		text: "{JSVendor>Lifnr}",
					// 		additionalText: "{JSVendor>Mcod1}"
					// 	})
					// });
				},
				error: function() {
					sap.m.MessageBox.error("HTTP Error while fetching Vendor list");
				}
			});
		},
		fn_VendorChange: function(oEvent) {

			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (oSelectedItem) {

				// Get binding context of selected vendor

				var oCtx = oSelectedItem.getBindingContext("JSVendor");

				var oVendorData = oCtx.getObject();

				// Set vendor name into input field

				this.byId("id_venname").setValue(oVendorData.Mcod1);

			} else {

				// Clear if nothing is selected

				this.byId("id_venname").setValue("");

			}

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf FSC360NEW.view.NonPoIndexer
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf FSC360NEW.view.NonPoIndexer
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf FSC360NEW.view.NonPoIndexer
		 */
		//	onExit: function() {
		//
		//	}

	});

});