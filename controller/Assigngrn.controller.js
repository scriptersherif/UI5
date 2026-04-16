sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var oGlobalBusyDialog = new sap.m.BusyDialog();

	return Controller.extend("FSC360NEW.controller.Assigngrn", {
		onInit: function() {

			this.fn_LoadInitial();
			this.fn_Loadqueid();
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
		fn_LoadInitial: function() {

			var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
	if (oKeyDataModel) {
	    var oData = oKeyDataModel.getData();
 
	    var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
 
	    this.getView().setModel(oJSONUserName, "JSusername");
	}
		},
		fn_Loadqueid: function() {
			var that = this;

			var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			oODataModel.read("/QueidF4Set", {

				success: function(oData) {
					var aData = oData.results; // Original data
					var aSearchData = [];

					aData.forEach(function(item) {
						aSearchData.push({
							key: item.Qid, // Final selection returns QID
							// value: item.Qid + " | " + item.Bcode + " | " + item.Invno,
							value: item.Qid + " - " + item.Bcode + " - " + item.Invno,
							full: item // Store full object if needed
						});
					});

					var oJsonModel = new sap.ui.model.json.JSONModel({
						combinedResults: aSearchData
					});

					that.getView().setModel(oJsonModel, "QidModel");
				},
				error: function() {
					sap.m.MessageToast.show("Failed to load Queue IDs");
				}
			});
		},
		fn_onSelectSearch: function(oEvent) {
			var sText = oEvent.getSource().getSelectedItem().getText(); // "qid | barcode | invoice"
			// var aParts = sText.split("|").map(s => s.trim());
			var aParts = sText.split("-").map(s => s.trim());
			this._selectedQid = aParts[0];
			this._selectedBarcode = aParts[1];
			this._selectedInvno = aParts[2];

		
		},

		fnCustomFilter: function(sTerm, oItem) {
			// Convert search term to lowercase
			var sSearch = sTerm.toLowerCase();

			// Get the full object stored in the ComboBox item
			var oData = oItem.getBindingContext("QidModel").getObject();

			// Check if QID, Barcode, or Invoice contains the search term
			if (oData.key.toLowerCase().includes(sSearch) ||
				oData.full.Bcode.toLowerCase().includes(sSearch) ||
				oData.full.Invno.toLowerCase().includes(sSearch)) {
				return true; // Show this item
			}
			return false; // Hide this item
		},

		fn_onchangeQid: function(oEvent) {
			var vQid = oEvent.getSource().getSelectedKey(); // Get selected QID
			this.selectedQid = vQid; // Store in controller
		},

		fn_search: function() {
			var oView = this.getView();
			var oCombo = oView.byId("id_SearchBox");
			var oAttachBox = oView.byId("id_AttachmentBox");
			if (oAttachBox) {
				oAttachBox.setVisible(true);
			}
			var sSelectedKey = oCombo.getSelectedKey(); // This is QID only

			if (!sSelectedKey) {
				sap.m.MessageToast.show("Please select a value to search");
				return;
			}

			// Only filter by QID
			var aFilters = [
				new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.EQ, sSelectedKey)
			];

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oGlobalBusyDialog.open();

			oModel.read("/AssignGrnSet", {
				filters: aFilters,
				success: function(oData) {
					var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);

					that.getView().setModel(oJSONModel, "Assgrn");
  					 var oTable = that.getView().byId("id_GrnTable");
					 var iLength = oData.results.length;
					 oTable.setVisibleRowCount(iLength);
					 
					oGlobalBusyDialog.close();
				},
				error: function() {
					oGlobalBusyDialog.close();
					// sap.m.MessageBox.error("Failed to load GRN data");
						that.openErrorDialog(' Failed to load GRN data');
				}
			});
		},

		fnclearbutt: function() {
			var oView = this.getView();

			// Clear ComboBox
			var oCombo = oView.byId("id_SearchBox");
			if (oCombo) {
				oCombo.setSelectedKey("");
				oCombo.setValue("");
			}

			// Clear Table
			var oModel = oView.getModel("Assgrn");
			if (oModel) {
				oModel.setData([]);
			}

			// Hide attachments box
			var oAttachBox = oView.byId("id_AttachmentBox");
			if (oAttachBox) {
				oAttachBox.setVisible(false);
			}

			// Clear selections
			var oTable = oView.byId("id_GrnTable");
			if (oTable) {
				oTable.clearSelection();
			}

		},

		onSelectionChange: function(oEvent) {
			var oTable = oEvent.getSource();
			var aSelectedIndices = oTable.getSelectedIndices();
			var oModel = this.getView().getModel("Assgrn");
			var aSelectedData = [];

			aSelectedIndices.forEach(function(iIndex) {
				var oContext = oTable.getContextByIndex(iIndex);
				if (oContext) {
					aSelectedData.push(oContext.getObject());
				}
			});

			this.aSelectedGrns = aSelectedData; // store selected GRNs for later use
		},
		fn_assign: function() {
			var aSelectedGrns = this.aSelectedGrns;

			if (!aSelectedGrns || aSelectedGrns.length === 0) {
				sap.m.MessageToast.show("Please select at least one GRN");
				return;
			}

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			// Prepare payload — if multiple GRNs, send as array (backend must handle deep insert)
			var oPayload = {
			
				NavAssGrn: aSelectedGrns
			};

			oModel.create("/AssignGrnSet", oPayload, {
				success: function(oData, response) {
					// sap.m.MessageBox.success("GRN(s) assigned successfully");
					that.openSuccessDialog('GRN(s) assigned successfully');

					that.fnclearbutt();
				},
				error: function(oError) {
					// sap.m.MessageBox.error("Assignment failed. Please try again.");
					that.openErrorDialog('Assignment failed. Please try again.');
				}
			});
		},

		fn_pdf: function(oEvent) {
			if (!this.pdf) {
				this.pdf = sap.ui.xmlfragment("FSC360NEW.fragment.getPDF", this);
				this.getView().addDependent(this.pdf);
			}
			this.pdf.open();
			//var QueueID = oEvent.getSource().getBindingContext('JMQidlist').getProperty('Qid');
			if (!this._selectedQid) {
				this.pdf.close();
				this.openErrorDialog("Please select a Queue ID");
				// sap.m.MessageBox.error("Please select a Queue ID");
				return;
			}

			var QueueID = this._selectedQid;

			this.fnGetPDF(QueueID);
		},
		fnfragPDFClose: function() {
			this.pdf.close();
		},
		fnGetPDF: function(Queid) {

			sap.ui.getCore().byId("id_scrll").setBusy(false);
			var oScorl = sap.ui.getCore().byId("id_scrll");

			oScorl.destroyContent();
			var Url = "/sap/opu/odata/exl/FSC_INVOICEAPP_SRV/ImageSet('" + Queid + "')/$value#toolbar=0";

			var oHtml = new sap.ui.core.HTML({

			});
			var oContent = "<div class='overlay'><iframe src=" + Url + " id='id_scrll' ' class='cl_pdfali'></iframe></div>";

			oHtml.setContent(oContent);

			var oScrl = sap.ui.getCore().byId("id_scrll");
			oScrl.addContent(oHtml);

			oScrl.setVisible(true);

			$('id_scrll').click(false);

		},
		fn_onZoomIn: function() {
			var oScroll = sap.ui.getCore().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale, default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;
			var newScale = currentScale + 0.1;
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // scale from top-left corner
		},

		fn_onZoomOut: function() {
			var oScroll = sap.ui.getCore().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale or default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;

			// Reduce scale but don’t go below 0.5
			var newScale = Math.max(currentScale - 0.1, 0.5);
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // Keep same origin as Zoom In
		},
		// call fnGetPDF(QueueID)

		fn_onPrint: function() {
			var iframe = sap.ui.getCore().byId("id_scrll").getContent()[0].getDomRef().querySelector('iframe');
			if (iframe) {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			}
		},

		fn_onDownload: function() {
			var QueueID = this._selectedQid;

			var url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value";

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
					link.download = "Invoice_" + QueueID + ".pdf";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					sap.m.MessageBox.error("Error while downloading: " + err.message);
				});
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