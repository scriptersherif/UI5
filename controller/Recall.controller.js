sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
"sap/ui/unified/FileUploader" 
], function(Controller, Fragment, Filter, FilterOperator, MessageBox, formatter, MessageToast, FileUploader) {
	"use strict";
	var count = "0001";
	var oNavscreen = "";
	var oState = "";
	var count_war_sim = 0;
	var parameters = {}; // For store the Header Data
	var Balance_parameters = {};
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var vHsnID = ""; //HSN ID for getting the index of the list's item
	var vHsnID_PO = ""; //HSN ID for getting the index of the list's item for PO.
	var vCossID = ""; //Cost Center ID for getting the index of the list's item.
	var vGlAccID = ""; //GL Acc ID for getting the index of the list's item.
	var vTaxID = ""; // Tax ID for getting the index of the list's item.
	var vPlantID = ""; // Plant ID for getting the index of the list's item.
	var vMaterialID = ""; // Material ID for getting the index of the list's item.
	var vTaxTabId = ""; // Tax ID for getting the index of the Tax Tab.
	var Vattach_xstring = []; //Added by Sakthi C on 28.08.2023 
	var Vattach_filename = []; //Added by Sakthi C on 28.08.2023 
	var Uploadarr = [];
	var UserType = "";
	return Controller.extend("FSC360NEW.controller.Recall", {
		onInit: function() {

	this.byId("id_cancel_pdf").attachBrowserEvent("click", this.fn_onRemoveFile, this);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Recall").attachPatternMatched(this.fn_onRouteMatched, this);
			// this.byId("show_hide_search").attachBrowserEvent("click", this.togglehideshow, this);
			setTimeout(() => {
				this.fn_applyFlexGrow();

			}, 0);
			
var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {
   
});
this.getView().setModel(oTemplateModel, "TemplateModel");
			// this._sCurrentCompInputId = "";
			var aColumnMeta = [{
				key: "Qid",
				label: "Queue Id",
				visible: true
			}, {
				key: "Bukrs",
				label: "Company Code",
				visible: true
			}, {
				key: "Gjahr",
				label: "Fiscal Year",
				visible: true
			}, {
				key: "Transtype",
				label: "Transaction Type",
				visible: true
			}, {
				key: "Trntx",
				label: "Transaction Text",
				visible: true
			}, {
				key: "Scandate",
				label: "Scan Date",
				visible: true
			}, {
				key: "Lifnr",
				label: "Vendor Code",
				visible: true
			}, {
				key: "Assignedto",
				label: "Agent",
				visible: true
			}, {
				key: "Wfage",
				label: "Workflow Age",
				visible: false
			}, {
				key: "Invno",
				label: "Invoice No",
				visible: false
			}, {
				key: "Invdt",
				label: "Invoice Date",
				visible: false
			}, {
				key: "Ntamt",
				label: "Net Amount",
				visible: true
			}, {
				key: "Stats",
				label: "Status",
				visible: true
			},
			// {
			// 	key: "Sttxt",
			// 	label: "Status Text",
			// 	visible: false
			// },
			{
				key: "Substs",
				label: "Sub Status",
				visible: false
			}, {
				key: "Sstxt",
				label: "Sub Status Text",
				visible: false
			}, {
				key: "Commt",
				label: "Comments",
				visible: false
			},
			{
				key: "Attachment",
					label: "Attachment",
				visible: false
			}];
		
const oColModel = new sap.ui.model.json.JSONModel(aColumnMeta);
this.getView().setModel(oColModel, "FilterTableModel");
			  // ViewModel for templates
  this.getView().setModel(new sap.ui.model.json.JSONModel({
    selectedTemplate: "",
    templates: [],
     forceFullWidth: false,
      wrapText: false
  }), "viewModel1");

			var arr = [{
				"StatKey": "0",
				"StatText": "All"
			}, {
				"StatKey": "S30",
				"StatText": "In Workflow"
			}, {
				"StatKey": "S50",
				"StatText": "Rejected"
			}];
			var oModel1 = new sap.ui.model.json.JSONModel();
			oModel1.setData(arr);
			this.getOwnerComponent().setModel(oModel1, "JSStatusList");

			var arr1 = [{
				"StatKey": "0",
				"StatText": "All"
			}, {
				"StatKey": "PO",
				"StatText": "Logistics"
			}, {
				"StatKey": "NPO",
				"StatText": "Non Logistics"
			}];
			var oModel2 = new sap.ui.model.json.JSONModel();
			oModel2.setData(arr1);
			this.getOwnerComponent().setModel(oModel2, "JSTransList");
			this.fn_getVendor();
			this.fn_loadCompanyCodes();

			setTimeout(() => {
				this.byId("id_Statuss").setSelectedKey("S50");
				this.fn_updateTitle("S50");
				this.fn_getVendor();
				this.fn_loadCompanyCodes();
				this.fn_getqueid();
			}, 100);

		},
		fn_onStatusChange: function(oEvent) {
			var sKey;

			if (oEvent && oEvent.getSource) {

				sKey = oEvent.getSource().getSelectedKey();
			} else {

				var oStatusCombo = this.getView().byId("id_Statuss");
				if (oStatusCombo) {
					sKey = oStatusCombo.getSelectedKey();
				}
			}

			if (sKey !== undefined) {
				this.fn_updateTitle(sKey);
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
					var oJSONModel = new sap.ui.model.json.JSONModel({
						Company: oData.results
					});
					that.getView().setModel(oJSONModel, "JSCCode");
						that.byId("id_companycode").bindItems({
						path: "JSCCode>/Company",
						length: oData.results.length,
						template: new sap.ui.core.ListItem({
							key: "{JSCCode>Bukrs}",
							text: "{JSCCode>Bukrs}",
							additionalText: "{JSCCode>Butxt}"
						})
					});
				},
				error: function() {
					sap.m.MessageBox.error("Error loading company codes");
				}
			});
		},
		fn_onCompanyChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sCompanyCode = oSelectedItem.getKey(); // Bukrs
				var sCompanyName = oSelectedItem.getText(); // Butxt

				// You can store or use it as needed

			}
		},
		fn_updateTitle: function(sKey) {
			let title = "";
			const oRecallBtn = this.byId("id_unblock");
			// const attach = this.byId("attachment")

			switch (sKey) {
				case "S50":
					title = "Rejected In Workflow List";
					oRecallBtn.setVisible(true);
					// attach.setVisible(true);
					break;
				case "S30":
					title = "In Workflow List";
					oRecallBtn.setVisible(true);
					// attach.setVisible(true);
					break;
				case "0":
					title = "All Status List";
					// oRecallBtn.setEnabled(false); 
					oRecallBtn.setVisible(false);
					// attach.setVisible(false);
					break;
				default:
					title = "Status List";
					oRecallBtn.setVisible(true);
			}

			this.byId("idCardTitle").setText(title);
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
					that.byId("idvendor").bindItems({
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
					sap.m.MessageBox.error("HTTP Error while fetching Vendor list");
				}
			});
		},

		fn_VendorChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey();
				var sText = oSelectedItem.getText();

				this.byId("idvendor").setValue(sKey);

			}
		},
		fn_applyFlexGrow: function() {
			var $view = this.getView().$();

			$view.find(".cl_tat_status_combobox_inp, .cl_date_recall, .formFieldbarcode,.formInputB1").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});
		},
		fn_onRouteMatched: function(oEvent) {
			this.fn_LoadData();
			this.fnclearbutt();
			this.fn_applyFlexGrow();
			this.fnGetF4Help();
			setTimeout(() => {
				this.byId("id_Statuss").setSelectedKey("S50");
				this.fn_updateTitle("S50");
			}, 100);
		},
fn_LoadData: function() {

		var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
		if (oKeyDataModel) {
		    var oData = oKeyDataModel.getData();
		    var oJSONUserName = new sap.ui.model.json.JSONModel(oData);
		    this.getView().setModel(oJSONUserName, "JSusername");
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
    const sTableName = "/EXL/FSC_RECALL";

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
    const sUserId = oView.getModel("JSusername").getProperty("/Userid");

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
const sTableName = "/EXL/FSC_RECALL";
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
    var sReportName = "/EXL/FSC_RECALL"; // Hardcoded Tabid

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
		fn_search: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			var sTranstype = this.getView().byId("id_transactiontyp").getSelectedKey();
			var status = this.getView().byId("id_Statuss").getSelectedKey();
			var CompanyCode = this.getView().byId("id_companycode").getValue().trim();
			var Queid = this.getView().byId("id_Qid").getValue().trim();
			var sDateFrom = this.getView().byId("id_creationdatefrm").getValue();
			var sDateTo = this.getView().byId("id_creationdateend").getValue();
			var slifnr = this.getView().byId("idvendor").getValue();
			var aFilters = [];
			if (sTranstype && sTranstype !== "0") {
				aFilters.push(new sap.ui.model.Filter("Transtype", sap.ui.model.FilterOperator.EQ, sTranstype));
			}
			if (status && status !== "0") {
				aFilters.push(new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, status));
			}
			if (CompanyCode) {
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, CompanyCode));
			}
			if (Queid) {
				aFilters.push(new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.EQ, Queid));
			}
			if (slifnr) {
				aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, slifnr));
			}
			if (sDateFrom && sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Scandate", sap.ui.model.FilterOperator.BT, sDateFrom, sDateTo));
			} else if (sDateFrom) {
				aFilters.push(new sap.ui.model.Filter("Scandate", sap.ui.model.FilterOperator.GE, sDateFrom));
			} else if (sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Scandate", sap.ui.model.FilterOperator.LE, sDateTo));
			}
			oModel.read("/RecallReportSet", {
				filters: aFilters,
				success: function(oData, response) {
					// var oJSONModel = new sap.ui.model.json.JSONModel();
					// oJSONModel.setData(oData.results);
					// that.getView().setModel(oJSONModel, "RecallModel");
					var arrTable = [];
					arrTable = oData.results;
					arrTable.forEach(function(row) {
						switch (row.Stats) {
							case "S15":
								row.Sttxt = "Indexed";
								break;
							case "S20":
								row.Sttxt = "In Progress";
								break;
							case "S30":
								row.Sttxt = "In Workflow";
								break;
							case "S40":
								row.Sttxt = "Processed,Parked";
								break;
							case "S41":
								row.Sttxt = "Posted";
								break;
							case "S50":
								row.Sttxt = "Rejected";
								break;
							case "S60":
								row.Sttxt = "Hold";
								break;
							default:
								row.Sttxt = row.Stats; // fallback
						}
						 row.AttachmentIndicator = "N";
					});
					that.aFullData = arrTable; // for raw full list
					that.aFilteredData = arrTable; // assuming no filter for now

					that.iCurrentPage = 1;
					that.iRowsPerPage = 10;
					that.fn_updatePaginatedModel();
					var iCount = oData.results.length;
					that.getView().byId("LabTabSFRTitle").setText(iCount);
				},
				error: function(oError) {
					sap.m.MessageToast.show("Failed to load Recall Report data");
					console.error("OData Error:", oError);
				}
			});
		},
		fnclearbutt: function() {
			var oView = this.getView();
			var oStatusCombo = oView.byId("id_Statuss");
			oView.byId("id_transactiontyp").setSelectedKey("");
			oView.byId("idvendor").setValue("");
			oView.byId("id_companycode").setValue("");
			oView.byId("id_Qid").setValue("");
			oView.byId("idinvno").setValue("");
			// oView.byId("id_Statuss").setSelectedKey("0");
			oView.byId("id_creationdatefrm").setValue("");
			oView.byId("id_creationdateend").setValue("");
			// oView.fn_onStatusChange();

			var oViewModel = oView.getModel("viewModel");
			if (oViewModel) {
				oViewModel.setProperty("/selectedTemplate", "");
			}

			this.aFullData = [];
			this.aFilteredData = [];
			this.iCurrentPage = 1;

			this.fn_updatePaginatedModel();
			if (oStatusCombo) {
				oStatusCombo.setSelectedKey("0"); // reset to "All"
				this.fn_onStatusChange(); // call only if defined
			}

			oView.byId("LabTabSFRTitle").setText("0");
		},
		fn_updatePaginatedModel: function() {
			var oFooter = this.getView().byId("idPaginationFooter");
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "RecallModel");
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
			// this.getView().byId("id_total_1").setText(parseInt(this.aFilteredData.length));

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

	
	fn_onRecallPress: function () {
    var oController = this;
    var oTable = this.byId("idTable");
    var aSelectedIndices = oTable.getSelectedIndices();
    var oModel = this.getView().getModel("RecallModel");
    var aData = oModel.getData();
    var aSelectedRows = [];

    aSelectedIndices.forEach(function (iIndex) {
        var oRow = aData[iIndex];
        if (oRow) {
            aSelectedRows.push(oRow);
        }
    });

    if (aSelectedRows.length === 0) {
        sap.m.MessageBox.warning("Please select at least one item to recall.");
        return;
    }

    var bHasAttachment = (this._Vattach_xstring && this._Vattach_xstring.length > 0);

    var fnTriggerRecall = function () {
    	  var aCleanRows = aSelectedRows.map(function (oRow) {
        var oCleanRow = Object.assign({}, oRow); // copy
        delete oCleanRow.AttachmentIndicator;   // remove frontend-only fields
           
        return oCleanRow;
    });
        var oPayload = {
        Flag: 'r',
        NavRecall: aCleanRows
    };


        var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
        oODataModel.create("/DEEPHEADSet", oPayload, {
            success: function () {
                var oSuccessModel = new sap.ui.model.json.JSONModel({
                    message: "Recall triggered successfully."
                });
                oController.getView().setModel(oSuccessModel, "successModel");

                if (!oController._oSuccessDialog) {
                    oController._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.fragment.Agentsuccess", oController);
                    oController.getView().addDependent(oController._oSuccessDialog);
                }
                oController._oSuccessDialog.open();

                setTimeout(function () {
                    oController._oSuccessDialog.close();
                }, 3000);

                oController.fn_search();
            },
            error: function () {
                var oErrorModel = new sap.ui.model.json.JSONModel({
                    message: "Recall failed. Invalid status or system error."
                });
                oController.getView().setModel(oErrorModel, "successModel");

                if (!oController._oSuccessDialog) {
                    oController._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.fragment.Recallerror", oController);
                    oController.getView().addDependent(oController._oSuccessDialog);
                }
                oController._oSuccessDialog.open();

                setTimeout(function () {
                    oController._oSuccessDialog.close();
                }, 3000);
            }
        });
    };

    if (bHasAttachment) {
        // Call fn_LoadF5 first, then recall afterwards
        var oContext = oTable.getContextByIndex(aSelectedIndices[0]); 
        this.fn_LoadF5(oContext, this._Vattach_xstring, fnTriggerRecall);
    } else {
        // No attachment, directly recall
        fnTriggerRecall();
    }
},

		fn_LoadCC: function(oEvent) {
			var oSourceInput = oEvent.getSource().getParent().getItems()[0];
			this._sCurrentCompInputId = oSourceInput.getId();

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			oModel.read("/StatusFlowSet", {
				filters: [
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, 'BUKRS')
				],
				success: function(oData) {
					var oJSONModel = new sap.ui.model.json.JSONModel({
						Company: oData.results
					});
					that.getView().setModel(oJSONModel, "JSCCode");
					

				},
				error: function() {
					sap.m.MessageBox.error("HTTP Error");
				}
			});

			if (!this.Comp_frag) {
				this.Comp_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Company", this);
				this.getView().addDependent(this.Comp_frag);
			}

			var oItemsBinding = this.Comp_frag.getBinding("items");
			if (oItemsBinding) {
				oItemsBinding.filter([]);
			}
			this.Comp_frag.open();
			// Delay to make sure it's rendered before accessing control

		},
		fn_CompanySearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
					new sap.ui.model.Filter("Butxt", sap.ui.model.FilterOperator.Contains, sValue)
				],
				and: false
			});

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		fn_confirmCompany: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sCompanyCode = oSelectedItem.getTitle(); // Or use getDescription() for Butxt
				if (this._sCurrentCompInputId) {
					var oInput = sap.ui.getCore().byId(this._sCurrentCompInputId);
					if (oInput) {
						oInput.setValue(sCompanyCode);
					}
				}
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

		},
		fn_Lifnr_LC: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var Filter1 = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue);
			var Filter2 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue);
			var allFilter = new sap.ui.model.Filter([Filter1, Filter2]);
			oEvent.getSource().getBinding("items").filter(allFilter);
		},
		fn_getqueid: function(oEvent) {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

			oModel.read("/QidValueHelpSetSet", {
				success: function(oData) {
					var oJSON = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(oJSON, "JMqueid");
					var oCombo = that.byId("id_Qid");
					if (oCombo) {
						oCombo.bindItems({
							path: "JMqueid>/",
							template: new sap.ui.core.Item({
								key: "{JMqueid>Qid}",
								text: "{JMqueid>Qid}"
							})
						});
					} else {
						console.error("id_Qid not found in view");
					}
					//that.byId("id_Qid").bindItems({
					//           path: "JMqueid>/",
					//           template: new sap.ui.core.Item({
					//               key: "{JMqueid>Qid}",  
					//               text: "{JMqueid>Qid}"
					//           })
					//       });

				},
				error: function() {
					sap.m.MessageToast.show("Failed to load Queue IDs");
				}
			});
		},
		fn_QidChange: function() {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var sKey = oSelectedItem.getKey();
				var sText = oSelectedItem.getText();

				this.byId("id_Qid").setValue(sKey);

			}
		},
		fnSettingPop: function(oEvent) {
			var oButton = oEvent.getSource();

			if (!this._PopOverSetting_wb) {
				this._PopOverSetting_wb = sap.ui.xmlfragment(
					"FSC360NEW.fragment.Advancefrag",
					this
				);
				this.getView().addDependent(this._PopOverSetting_wb);

			}

			this._PopOverSetting_wb.openBy(oButton);

		},
		fn_add_attach_frag: function() {
			if (!this.AddAttach_frag) {
				this.AddAttach_frag = sap.ui.xmlfragment("FSC360NEW.fragment.AddAttachment", this);
				this.getView().addDependent(this.AddAttach_frag);
			}
			this.AddAttach_frag.open();
		},
		fn_cancel_add_attachment: function() {
			this.AddAttach_frag.close();
		},

		fn_clear_attachements: function() {
			Vattach_xstring = [];
			var oModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oModel, 'JSImgList');
		},

		onFileDeleted: function(oEvent) {
			var sFileName = oEvent.getParameter("item").getFileName();

			Vattach_xstring = Vattach_xstring.filter(function(obj) {
				return obj.fileName !== sFileName;
			});

			var oModel = this.getView().getModel('JSImgList');
			var aFiles = oModel.getData().filter(function(f) {
				return f.fileName !== sFileName;
			});
			oModel.setData(aFiles);
			MessageToast.show("File deleted successfully.");
		},

	
		fn_View_Attachment: function(oEvent) {
			try {
				// 1. Get Qid from selected table row
				var oTable = this.byId("idTable");
				var iIndex = oTable.getSelectedIndex();
				if (iIndex < 0) {
					sap.m.MessageToast.show("Please select a row to view attachment.");
					return;
				}
				var oContext = oTable.getContextByIndex(iIndex);
				var oRowData = oContext.getObject();

				// 2. Get Docid from clicked list item
				var Vdoc = oEvent.getSource().getBindingContext("JSImgList").getObject().Docid;

				// 3. Open file in new tab
				var sUrl = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" +
					oRowData.Qid + "',Doc='" + Vdoc + "')/$value";

				window.open(encodeURI(sUrl));
			} catch (e) {
				console.error(e);
			}
		},



		fn_ok_add_attachment: function() {
			if (!Vattach_xstring || Vattach_xstring.length === 0) {
				MessageToast.show("No attachment is added. Please click + to add the attachment.");
				return;
			}
			this.fn_LoadF5();
		},
		


fn_LoadF5: function (oContext, aAttachment, fnCallback) {
    var that = this;
    var oRowData = oContext.getObject();

    oGlobalBusyDialog.open();

    var oEntity = {
        Qid: oRowData.Qid,
        Flag: "L",
        NavItemTabDetails: [],
        NavHead: [],
        NavTaxTab: [],
        NavDeepImage: aAttachment
    };

    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

    oModel.create("/DEEPHEADSet", oEntity, {
        success: function () {
            oGlobalBusyDialog.close();
            MessageToast.show("Invoice Attached Successfully");

            // Trigger recall afterwards if a callback is provided
            if (typeof fnCallback === "function") {
                fnCallback();
            }
        },
        error: function (oResponse) {
            oGlobalBusyDialog.close();
            var msg = "Error";
            try {
                msg = JSON.parse(oResponse.responseText).error.message.value;
            } catch (e) {}
            sap.m.MessageBox.error(msg);
        }
    });
},


fn_openFileDialog: function (oEvent) {
    var oButton = oEvent.getSource();
    var oContext = oButton.getBindingContext("RecallModel"); 
    this._selectedContext = oContext;

    var oFileUploader = this.byId("idHiddenFileUploader");
    var oFileInput = document.getElementById(oFileUploader.getId() + "-fu");

    if (!oFileInput) return;

    // Reset value to allow re-upload of same file
    oFileInput.value = "";
    
    // Small timeout ensures browser sees the reset
    setTimeout(function() {
        oFileInput.click();
    }, 10);
},

onFileUploadChange: function(oEvent) {
    var oContext = this._selectedContext;
    if (!oContext) return;

    var oFile = oEvent.getParameter("files")[0];
    if (!oFile) return;

    // Check global restriction
    if (this._Vattach_xstring && this._Vattach_xstring.length > 0) {
        sap.m.MessageToast.show("Only one attachment allowed. Please remove the existing one first.");
        return; // revent new upload
    }

    var reader = new FileReader();
    var that = this;

    reader.onload = function(evt) {
        var base64String = evt.target.result.split(",")[1];
        var qid = oContext.getProperty("Qid");
        var oModel = oContext.getModel();

       
        that._Vattach_xstring = [{
            Doc: oFile.name,
            Qid: qid,
            MimeType: oFile.type,
            Xstring: base64String
        }];

        // mark only this row
        var sPath = oContext.getPath();
        oModel.setProperty(sPath + "/AttachmentIndicator", "Y");
        oModel.refresh(true);

        // select this row
        var oTable = that.byId("idTable");
        var iRowIndex = parseInt(sPath.split("/").pop(), 10);
        oTable.clearSelection();
        oTable.setSelectedIndex(iRowIndex);

        sap.m.MessageToast.show("File uploaded for Qid " + qid);
    };

    reader.readAsDataURL(oFile);
},


fn_onRemoveFile: function(oEvent) {
    var oContext = oEvent.getSource().getBindingContext("RecallModel");
    if (!oContext) return;

    var oModel = oContext.getModel();
    var sPath = oContext.getPath();
    var qid = oContext.getProperty("Qid");

    // reset the entire table (since only one file is allowed globally)
    oModel.getData().forEach(function(row){
        row.AttachmentIndicator = "N";
    });

    // clear global list
    this._Vattach_xstring = [];

    oModel.refresh(true);

    // unselect all rows
    var oTable = this.byId("idTable");
    oTable.clearSelection();

    sap.m.MessageToast.show("Attachment removed  for Qid " + qid  );
},




		fnchangeGrn: function(oEvent) {

			var vSelKey = oEvent.getSource().getSelectedKey();
			if (this.getView().getModel('JSInvdethead').getData()[0].Invtype == 'LOSO') {
				var vSES = this.getView().getModel('JSInvdet').getData()[0].Lfbnr;
			} else {
				var vGrn = this.getView().getModel('JSInvdet').getData()[0].Mblnr;
			}
			var vEbeln = this.getView().getModel('JSInvdet').getData()[0].Ebeln;

			if (vSelKey == "2") {
				this.getView().byId('id_InGrnChange').setValue(vEbeln);

			} else if (vSelKey == "1") {
				this.getView().byId('id_InGrnChange').setValue(vGrn);

			} else {
				this.getView().byId('id_InGrnChange').setValue(vSES);

			}
		}

	});

});