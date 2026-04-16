sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"FSC360NEW/model/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, formatter, Export, ExportTypeCSV, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("FSC360NEW.controller.Deviation", {

		onInit: function() {
			this.aSelectedItems = [];
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Deviation").attachPatternMatched(this.fn__onRouteMatched, this);
			// var aColumnMeta = [{
			

var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {
   
});
this.getView().setModel(oTemplateModel, "TemplateModel");
			this.aColumnMeta = [{
				key: "Qid",
				label: "Queue Id",
				visible: true
			}, {
				key: "Erdat",
				label: "Creation Date",
				visible: true
			}, {
				key: "Bukrs",
				label: "Company Code",
				visible: false
			}, {
				key: "Documentnumber",
				label: "Doc Number",
				visible: true
			}, {
				key: "Gjahr",
				label: "Fiscal Year",
				visible: false
			}, {
				key: "Belnr",
				label: "Accounting Document",
				visible: false
			}, {
				key: "Zterm",
				label: "Payment Terms",
				visible: false
			}, {
				key: "Lifnr",
				label: "Vendor",
				visible: true
			}, {
				key: "Hkont",
				label: "GL Account",
				visible: false
			}, {
				key: "Matnr",
				label: "Material",
				visible: true
			}, {
				key: "Agent",
				label: "Agent",
				visible: true
			}, {
				key: "Unplanned",
				label: "Unplanned",
				visible: true
			}, {
				key: "Discount",
				label: "Discount",
				visible: true
			}, {
				key: "Beznk",
				label: "Amount",
				visible: true
			}, {
				key: "Budat",
				label: "Posting Date",
				visible: false
			}, {
				key: "Zfbdt",
				label: "Baseline Date",
				visible: false
			}, {
				key: "Wskto",
				label: "Cash Discount Amount",
				visible: false
			}, {
				key: "Assignedto",
				label: "Assigned To",
				visible: false
			}];

			// Create JSONModel for columns
			// const oColModel = new sap.ui.model.json.JSONModel(aColumnMeta);
			// const oColModel = new sap.ui.model.json.JSONModel(this.aColumnMeta);
			// this.getView().setModel(oColModel, "FilterTableModel");
			// this.getView().setModel(new sap.ui.model.json.JSONModel({
			// 	selectedTemplate: "",
			// 	templates: [],
			// 	forceFullWidth: false
			// }), "viewModel");
			
const oColModel = new sap.ui.model.json.JSONModel(this.aColumnMeta);
this.getView().setModel(oColModel, "FilterTableModel");
			  // ViewModel for templates
  this.getView().setModel(new sap.ui.model.json.JSONModel({
    selectedTemplate: "",
    templates: [],
     forceFullWidth: false,
      wrapText: false
  }), "viewModel1");
			var mcbjData = [{
				id: "Belnr",
				name: "Base Line"
			}, {
				id: "Lifnr",
				name: "Invoicing Party"
			}, {
				id: "Zterm",
				name: "Payment Terms"
			}, {
				id: "Unplanned",
				name: "Unplanned Cost"
			}, {
				id: "Discount",
				name: "Discount"
			}, {
				id: "Hkont",
				name: "GL Account"
			}, {
				id: "Matnr",
				name: "Material"
			}];

			var jModel = new sap.ui.model.json.JSONModel(mcbjData);
			this.getView().setModel(jModel, "MCB");

			this.fn_LoadData();
			this.fn_loadCompanyCodes();
			var oModeldev = new sap.ui.model.json.JSONModel({
				Emails: []
			});
			this.getView().setModel(oModeldev, "JMManualDel");
			console.log("Model data:", oModeldev.getData());
		},
	fn_onAddEmail: function () {
    var oInput = sap.ui.getCore().byId("idEmailEntry");
    var sEmail = oInput.getValue().trim();
    var oModel = this.getView().getModel("JMManualDel");
    var aEmails = oModel.getProperty("/Emails") || [];

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sEmail)) {
        sap.m.MessageToast.show("Please enter a valid email address");
        return;
    }

 
    if (aEmails.indexOf(sEmail) !== -1) {
        sap.m.MessageToast.show("Email already added");
        return;
    }


    aEmails.push(sEmail);
    oModel.setProperty("/Emails", aEmails);

    oInput.setValue(""); 
},

fn_onRemoveEmail: function (oEvent) {
    var oItem = oEvent.getSource().getParent().getParent(); 
    var oCtx = oItem.getBindingContext("JMManualDel");
    var sPath = oCtx.getPath(); 
    var iIndex = parseInt(sPath.split("/")[2]); 
    var oModel = this.getView().getModel("JMManualDel");
    var aEmails = oModel.getProperty("/Emails");

    if (iIndex > -1) {
        aEmails.splice(iIndex, 1);
        oModel.setProperty("/Emails", aEmails);
    }
},

		fn__onRouteMatched: function(oEvent) {
			this.fn_LoadData();
			this.fnclearbutt();
			this.fn_loadCompanyCodes();
		},
		fn__onRowSelectionChange: function(oEvent) {
			var oTable = this.byId("idTable");
			var iRowIndex = oEvent.getParameter("rowIndex");

		
			if (iRowIndex === -1) {
				var aData = this.aFilteredData || []; // store your filtered dataset separately
				if (oTable.getSelectedIndices().length === 0) {
					// Checkbox deselected
					this.aSelectedItems = [];
					sap.m.MessageToast.show("Selection cleared");
				} else {
					// Checkbox selected -> select ALL filtered data
					this.aSelectedItems = aData.slice(); // copy entire filtered dataset
					sap.m.MessageToast.show("All rows selected (" + this.aSelectedItems.length + ")");
				}
			} else {
				// Single row selection case
				this.aSelectedItems = oTable.getSelectedIndices().map(function(iIndex) {
					return oTable.getContextByIndex(iIndex).getObject();
				});
			}
		},

		fn_LoadData: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			this.aFilteredData = [];
			oModel.read("/DEEPHEADSet", {
				urlParameters: {
					$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt,NavUsername"
				},
				success: function(oData) {
					if (oData && oData.results && oData.results.length > 0) {
						var oJSusernameModel = new sap.ui.model.json.JSONModel();
						oJSusernameModel.setData(oData.results[0]);
						that.getView().setModel(oJSusernameModel, "JSusername1");
						var oJSusernameModel1 = new sap.ui.model.json.JSONModel();
						oJSusernameModel1.setData(oData.results[0].NavUsername.results || []);
						that.getView().setModel(oJSusernameModel1, "jsUserName");
						that.fn_updatePaginatedModel();
					}
				},
				error: function(oError) {
					console.error("Error loading data:", oError);
				}
			});
		},
	
		fn_loadCompanyCodes: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/StatusFlowSet", {
				filters: [
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "BUKRS")
				],
				success: function(oData) {
					var oJSONModel = new sap.ui.model.json.JSONModel({
						Company: oData.results
					});
					that.getView().setModel(oJSONModel, "JSCCode");
				},
				error: function() {
					sap.m.MessageBox.error("Error loading company codes");
				}
			});
		},
		fn__onCompanyChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sCompanyCode = oSelectedItem.getKey(); // Bukrs
				var sCompanyName = oSelectedItem.getText(); // Butxt

				// You can store or use it as needed

			}
		},

		fn__onAgentChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oCtx = oSelectedItem.getBindingContext("jsUserName");
				var oData = oCtx.getObject();

				// Proper way: select by key
				this.getView().byId("id_Agent").setSelectedKey(oData.Bname);
			}
		},
		fn_onDownPress: function() {
			var oTable = this.byId("idTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			var aSelectedData = [];

			if (aSelectedIndices.length === 0) {
				// No row selected => download all data from full data
				aSelectedData = this.aFilteredData;
			} else {
				// Download only selected rows from current page
				aSelectedIndices.forEach(function(iIndex) {
					var oContext = oTable.getContextByIndex(iIndex);
					if (oContext) {
						aSelectedData.push(oContext.getObject());
					}
				});
			}
if (!aSelectedData || aSelectedData.length === 0) {
        sap.m.MessageToast.show("No Data Found");
        return;
    }
		
			var aExportColumns = this.aColumnMeta
				.filter(function(col) {
					return col.visible;
				})
				.map(function(col) {
					return {
						name: col.label,
						template: {
							content: "{" + col.key + "}"
						}
					};
				});

			var oExport = new sap.ui.core.util.Export({
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ",",
					mimeType: "application/vnd.ms-excel",
					charset: "utf-8",
					fileExtension: "csv",
					fileName: "Recall_Selected_Rows"
				}),
				models: new sap.ui.model.json.JSONModel({
					rows: aSelectedData
				}),
				rows: {
					path: "/rows"
				},
				columns: aExportColumns
			});

			oExport.saveFile().always(function() {
				this.destroy();
			});
		},

		fnemail: function(oEvent) {
			if (!this.oMail) {
				this.oMail = sap.ui.xmlfragment(
					"FSC360NEW.fragment.MailPhyTr", this);
				this.getView().addDependent(this.oMail);
			}
			this.oMail.open();
			var vTemp = [{
				"EmailId": ""
			}];

			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");
		},
		fnPressAddemail: function(oEvent) {
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"EmailId": ""
			});

			oTabModel.refresh();
		},

		fnPressDeleteemail: function(oEvent) {

			var vPath = Number(oEvent.getSource().getBindingContext("JMManualDel").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);

				oTabModel.refresh();
			} else {
				oTabData.splice(vPath, 1);
				oTabData.push({
					"EmailId": ""
				});

				oTabModel.refresh();
			}

		},
		fnCloseMail: function() {
			this.oMail.close();
			// sap.ui.getCore().byId("id_Email").setValue();
		},
	
fnmailsubmit: function (oEvent) {
    var that = this;
    var oModel = this.getView().getModel();
    var oTable = this.getView().byId("idTable");

    // get email array from JMManualDel model
    var aMailData = this.getView().getModel("JMManualDel").getProperty("/Emails") || [];

    var oFrom = this.getView().byId("id_creationdatefrm").getDateValue();
    var oTo = this.getView().byId("id_creationdateend").getDateValue();

    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "yyyy-MM-dd"
    });

    // validate emails
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var bInvalidEmail = aMailData.some(function (email) {
        return !emailRegex.test(email);
    });

    if (aMailData.length === 0 || bInvalidEmail) {
        sap.m.MessageToast.show("Enter Valid Email Id");
        sap.ui.core.BusyIndicator.hide();
        return;
    }

    sap.ui.core.BusyIndicator.show(0);

    // helper functions for deviation revert
    function fn_revertDeviation(value) {
        if (value === "No Deviation") {
            return "green";
        } else if (value === "Deviation") {
            return "red";
        }
        return value;
    }

    function fn_revertDeviationZterm(value) {
        if (value === "No Deviation") {
            return "gree";
        } else if (value === "Deviation") {
            return "red";
        }
        return value;
    }

    // collect selected rows or all filtered rows
    var aSelectedIndices = oTable.getSelectedIndices();
    var aDeviationSource = [];

    if (aSelectedIndices.length === 0) {
        // nothing selected → take full filtered data
        aDeviationSource = this.aFilteredData || [];
    } else {
        // only selected rows
        aSelectedIndices.forEach(function (iIndex) {
            var oContext = oTable.getContextByIndex(iIndex);
            if (oContext) {
                aDeviationSource.push(oContext.getObject());
            }
        });
    }
if (!aDeviationSource || aDeviationSource.length === 0) {
        sap.m.MessageToast.show("No Data Found");
           sap.ui.core.BusyIndicator.hide();
        return;
    }
    // build deviation payload
    var aDeviationPayload = [];
    aDeviationSource.forEach(function (row) {
        var obj = {
            Qid: row.Qid,
            Erdat: row.Erdat,
            Bukrs: row.Bukrs,
            Documentnumber: row.Documentnumber,
            Gjahr: row.Gjahr,
            Belnr: fn_revertDeviation(row.Belnr),
            Zterm: fn_revertDeviationZterm(row.Zterm),
            Lifnr: fn_revertDeviation(row.Lifnr),
            Hkont: fn_revertDeviation(row.Hkont),
            Matnr: fn_revertDeviation(row.Matnr),
            Agent: row.Agent,
            Unplanned: fn_revertDeviation(row.Unplanned),
            Discount: fn_revertDeviation(row.Discount),
            Beznk: String(row.Beznk || ""),
            Budat: row.Budat,
            Zfbdt: row.Zfbdt,
            Wskto: String(row.Wskto || ""),
            Assignedto: row.Assignedto
        };

        if (oFrom) {
            obj.Bldatfrom = oDateFormat.format(oFrom) + "T00:00:00";
        }
        if (oTo) {
            obj.Bldatto = oDateFormat.format(oTo) + "T00:00:00";
        }

        aDeviationPayload.push(obj);
    });

    // build email payload
    var aMailPayload = aMailData.map(function (email) {
        return { EmailId: email };
    });

    // final OData payload
    var oPayload = {
        NavMaildeviation: aDeviationPayload,
        NavMailiddeviation: aMailPayload
    };

    // OData create call
    oModel.create("/DeviationSet", oPayload, {
        success: function () {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Mail Sent Successfully");
            that.oMail.close();
        },
        error: function () {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Error while sending mail");
            that.oMail.close();
        }
    });
},



	
		fnSearch: function(aSelectedFields) {
			var oView = this.getView();
			var that = this;

			var sBukrs = oView.byId("id_companycode").getValue().trim();
			var sAgent = oView.byId("id_Agent").getValue().trim();
			var sDateFrom = oView.byId("id_creationdatefrm").getValue().trim();
			var sDateTo = oView.byId("id_creationdateend").getValue().trim();

			var aSelectedFields = oView.byId("idCCode").getSelectedKeys();
			if (!sBukrs) {
				sap.m.MessageToast.show("Please enter Company Code");
				return;
			}

			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs));

			if (sAgent) {
				aFilters.push(new sap.ui.model.Filter("Agent", sap.ui.model.FilterOperator.EQ, sAgent));
			}

			if (sDateFrom && sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, sDateFrom, sDateTo));
			} else if (sDateFrom) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.GE, sDateFrom));
			} else if (sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.LE, sDateTo));
			}
			aSelectedFields.forEach(function(sKey) {

				aFilters.push(new sap.ui.model.Filter(sKey, sap.ui.model.FilterOperator.EQ, "red"));
			});

			oModel.read("/DeviationSet", {
				filters: aFilters,
				success: function(oData) {
					var arrTable = oData.results;

					arrTable.forEach(function(row) {
						function mapDeviation(field) {
							if (row[field] === "green" || row[field] === "gree") {
								row[field] = "No Deviation";
								row[field + "Icon"] = "sap-icon://accept";
							} else if (row[field] === "red") {
								row[field] = "Deviation";
								row[field + "Icon"] = "sap-icon://message-warning";
							}
						}

						["Matnr", "Unplanned", "Discount", "Zterm", "Lifnr", "Hkont", "Belnr"].forEach(mapDeviation);
					});

					that.aFullData = arrTable;
					that.aFilteredData = arrTable;

					that.iCurrentPage = 1;
					that.iRowsPerPage = 11;
					that.fn_updatePaginatedModel();

					var iCount = arrTable.length;
					that.getView().byId("id_LabTabSFRTitle").setText(iCount);

					oModel.refresh(true);
				},
				error: function(oError) {
					console.error("Error fetching data:", oError);
					sap.m.MessageToast.show("Failed to fetch data");
				}
			});
		},
		fn_handleSelectionFinish: function(oEvent) {
			var oView = this.getView();
			var aSelectedFields = oEvent.getSource().getSelectedKeys(); // from MultiComboBox
			var that = this;
			var sBukrs = oView.byId("id_companycode").getValue().trim();
			var sAgent = oView.byId("id_Agent").getValue().trim();
			var sDateFrom = oView.byId("id_creationdatefrm").getValue().trim();
			var sDateTo = oView.byId("id_creationdateend").getValue().trim();

			if (!sBukrs) {
				sap.m.MessageToast.show("Please enter Company Code");
				return;
			}

			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [
				new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, sBukrs)
			];

			if (sAgent) {
				aFilters.push(new sap.ui.model.Filter("Agent", sap.ui.model.FilterOperator.EQ, sAgent));
			}

			if (sDateFrom && sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, sDateFrom, sDateTo));
			} else if (sDateFrom) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.GE, sDateFrom));
			} else if (sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.LE, sDateTo));
			}

			aSelectedFields.forEach(function(sKey) {
				aFilters.push(new sap.ui.model.Filter(sKey, sap.ui.model.FilterOperator.EQ, "red"));
			});

			oModel.read("/DeviationSet", {
				filters: aFilters,
				success: function(oData) {
					var arrTable = oData.results;
					arrTable.forEach(function(row) {
						function mapDeviation(field) {
							if (row[field] === "green" || row[field] === "gree") {
								row[field] = "No Deviation";
								row[field + "Icon"] = "sap-icon://accept";
							} else if (row[field] === "red") {
								row[field] = "Deviation";
								row[field + "Icon"] = "sap-icon://message-warning";
							}
						}
						["Matnr", "Unplanned", "Discount", "Zterm", "Lifnr", "Hkont", "Belnr"].forEach(mapDeviation);
					});

					var oJSONModel = new sap.ui.model.json.JSONModel(arrTable);
					oView.setModel(oJSONModel, "DeviationModel");
					that.aFullData = arrTable;
					that.aFilteredData = arrTable;

					that.iCurrentPage = 1;
					that.iRowsPerPage = 11;
					that.fn_updatePaginatedModel();

					var iCount = arrTable.length;
					that.getView().byId("id_LabTabSFRTitle").setText(iCount);

					oModel.refresh(true);
				}
			});
		},

		fn_updatePaginatedModel: function() {
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "DeviationModel");

			var oFooter = this.getView().byId("id_paginationfooter");
			if (pageData.length > 0) {
				oFooter.setVisible(true);
				this.fn_renderPageNumbers();
			} else {
				oFooter.setVisible(false);
			}
		},

		fn_onNextPage: function() {
			var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			if (this.iCurrentPage < iTotalPages) {
				this.iCurrentPage++;
				this.fn_updatePaginatedModel();
			}
		},
		fn_onPreviousPage: function() {
			if (this.iCurrentPage > 1) {
				this.iCurrentPage--;
				this.fn_updatePaginatedModel();
			}
		},
		fn_renderPageNumbers: function() {

			var oPageBox = this.byId("idPageNumbersBox");
			oPageBox.removeAllItems();
		

			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage);
			var oPrevBtn = this.byId("idPrevBtn");
			if (oPrevBtn) {
				oPrevBtn.setVisible(this.iCurrentPage > 1);
			}

			// Show/hide Next button
			var oNextBtn = this.byId("idNextBtn");
			if (oNextBtn) {
				oNextBtn.setVisible(this.iCurrentPage < iTotalPages);
			}
			if (iTotalPages <= 1) {
				return;
			}

			var currentPage = this.iCurrentPage;
			var that = this;

			function fn_getPageNumbers(currentPage, totalPages) {
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

			function fn_addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.fn_updatePaginatedModel();
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

			var pagesToShow = fn_getPageNumbers(currentPage, iTotalPages);

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
					fn_addPageButton(page);
				}
			}
		},
	fnFilterPop: function (oEvent) {
	var oButton = oEvent.getSource();

	if (!this._oFilterPopover) {
		this._oFilterPopover = sap.ui.xmlfragment(
			"FSC360NEW.fragment.FilterPopovers", 
			this
		);
		this.getView().addDependent(this._oFilterPopover);
	}

	this._oFilterPopover.openBy(oButton);
}
,
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
				this._oCreateTemplatePopover = sap.ui.xmlfragment(oView.getId(),"FSC360NEW.fragment.CreateTemplate_fullfill", this);
				this.getView().addDependent(this._oCreateTemplatePopover);
			}

			this._oCreateTemplatePopover.openBy(oEvent.getSource());
		},
fn_onCancelCreateTemplate: function () {
  if (this._oCreateTemplatePopover) {
    this._oCreateTemplatePopover.close();
    this._oCreateTemplatePopover.destroy();
    this._oCreateTemplatePopover = null; // ✅ Fix
  }
  if (this._oCustomizePopover) {
    this._oCustomizePopover.close();
    this._oCustomizePopover.destroy();
    this._oCustomizePopover = null; // ✅ Fix
  }
  if (this._oFilterPopover) {
    this._oFilterPopover.close();
    this._oFilterPopover.destroy();
    this._oFilterPopover = null; // ✅ Fix
  }
}
,
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
    const sTableName = "/EXL/FSC_DEVI";

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
fn_reloadTemplates: function () {
    const oView = this.getView();
    const oODataModel = this.getOwnerComponent().getModel();
    const oViewModel = oView.getModel("viewModel1");
    const sUserId = oView.getModel("JSusername1").getProperty("/Userid");

    oODataModel.read("/SaveTemplateSet", {
        filters: [
            new sap.ui.model.Filter("Userid", sap.ui.model.FilterOperator.EQ, sUserId)
        ],
        success: function (oData) {
            const aTemplateArray = oData.results.map(item => ({
                name: item.TemplateId,
                userid: item.Userid,
                columns: item.Columns || ""
            }));
            oViewModel.setProperty("/templates", aTemplateArray);
        },
        error: function () {
            sap.m.MessageToast.show("Failed to reload templates");
        }
    });
},
onApplyTemplate: function () {
  //this.applyVisibleColumns();
  if (this._oCustomizePopover) {
  this._oCustomizePopover.close();
  this._oCustomizePopover.destroy();
  this._oCustomizePopover = null;  // ✅ Fix added here
}

},

fn_onOpenTemplatePopover: function (oEvent) {
    const oView = this.getView();
const sTableName = "/EXL/FSC_DEVI";
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
        success: function (oData) {
       
            // Map backend fields to UI model
            const aTemplateArray = oData.results.map(item => ({
                name: item.TemplateId, // template name
                userid: item.Userid,
                
                columns: item.Columns || "" // comma-separated columns
            }));

            oViewModel.setProperty("/templates", aTemplateArray);
        }.bind(this),
        error: function () {
            sap.m.MessageToast.show("Failed to load templates");
        }
    });

    // Open popover near the source control
    this._oTemplatePopover.openBy(oEvent.getSource());
},
fn_onTemplateListItemPress: function (oEvent) {
    // const oCtx = oEvent.getSource().getBindingContext("viewModel1");
    // if (!oCtx) {
    //     console.error("No binding context found for viewModel1");
    //     return;
    // }
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
	fn_onDeleteTemplateRow: function (oEvent) {
    var oButton = oEvent.getSource();
    var oCtx = oButton.getBindingContext("viewModel1");
    if (!oCtx) {
        return;
    }

    var sTemplateName = oCtx.getProperty("name");
    var sReportName = "/EXL/FSC_DEVI"; // Hardcoded Tabid

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

onConfirmYesPress: function () {
    var that = this; // maintain controller context
    var oTemplateModel = this.getView().getModel("TemplateModel");

    // case 1 → overwrite (from Save)
    if (this._oPendingTemplatePayload) {
        var oPayload = this._oPendingTemplatePayload;
        var sTemplateName = this._sPendingTemplateName;

        oTemplateModel.create("/SaveTemplateSet", oPayload, {
            success: function () {
                sap.m.MessageToast.show("Template \"" + sTemplateName + "\" updated successfully");
                that.fn_reloadTemplates();
            },
            error: function () {
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
            "',Tabid='" + encodeURIComponent(sReport) + "')",
            {
                success: function () {
                    sap.m.MessageToast.show("Template \"" + sTemplate + "\" deleted successfully");

                    var aTemplates = oViewModel.getProperty("/templates") || [];
                    oViewModel.setProperty("/templates",
                        aTemplates.filter(function (t) {
                            return t.name !== sTemplate;
                        })
                    );
                },
                error: function () {
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

onConfirmNoPress: function () {
    sap.m.MessageToast.show("Action cancelled");

    if (this._oConfirmDialog) {
        this._oConfirmDialog.close();
        this._oConfirmDialog.destroy();
        this._oConfirmDialog = null;
    }

    this._clearTempData();
    this._clearDeleteData();
},

onConfirmDialogClose: function () {
    if (this._oConfirmDialog) {
        this._oConfirmDialog.destroy();
        this._oConfirmDialog = null;
    }
},

_clearTempData: function () {
    delete this._oPendingTemplatePayload;
    delete this._sPendingTemplateName;
},

_clearDeleteData: function () {
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
        oItem.visible = bSelected;  // select or deselect all
    });

    oModel.refresh(true); // update bindings
},
	fn_fulfillrefresh: function() {
			location.reload();
		},
		fnclearbutt: function() {
			var oView = this.getView();

			oView.byId("id_companycode").setValue("");
			oView.byId("id_Agent").setValue("");
			oView.byId("id_creationdatefrm").setValue("");
			oView.byId("id_creationdateend").setValue("");

			var oMCB = oView.byId("idCCode");
			if (oMCB) {
				oMCB.setSelectedKeys([]);
			}

			var oEmptyModel = new sap.ui.model.json.JSONModel([]);
			oView.setModel(oEmptyModel, "DeviationModel");

			this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;
			this.fn_updatePaginatedModel();

			oView.byId("id_LabTabSFRTitle").setText("0");
		}
	

	});

});