sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/m/MessageBox"
], function(Controller, Fragment, Filter, FilterOperator, MessageBox, formatter) {
	"use strict";

	return Controller.extend("FSC360NEW.controller.Tatanalysis", {

		onInit: function() {
			this.fn_LoadCC();
			
			this.byId("id_show_hide_search").attachBrowserEvent("click", this.fn_togglehideshow, this);
			setTimeout(() => {
				this.fn_applyflexgrow();
				this.fnGetF4Help();
			}, 0);
			this._sCurrentCompInputId = "";
		

var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {
   
});
this.getView().setModel(oTemplateModel, "TemplateModel");
	var aColumnMeta = [{
				key: "Queid",
				label: "Queue Id",
				visible: true
			}, {
				key: "Erdat",
				label: "Creation date",
				visible: true
			}, {
				key: "Bukrs",
				label: "Company Code",
				visible: true
			}, {
				key: "Werks",
				label: "Plant Code",
				visible: true
			}, {
				key: "Ekgrp",
				label: "Purchase grp",
				visible: false
			}, {
				key: "Ebeln",
				label: "Purchase order",
				visible: true
			}, {
				key: "Veninvno",
				label: "Invoice no",
				visible: false
			}, {
				key: "Invdt",
				label: "Invoice Date",
				visible: true
			}, {
				key: "Invrfno",
				label: "Document no",
				visible: true
			}, 
			// {
			// 	key: "Invstats",
			// 	label: "Invoice Status",
			// 	visible: true
			// }, 
			{
				key: "Agent",
				label: "Agent",
				visible: true
			}, {
				key: "IndAgnt",
				label: "IndAgnt",
				visible: false
			}, {
				key: "Wbdate",
				label: "Wbdate",
				visible: false
			}, {
				key: "Wfagnt",
				label: "Wfagnt",
				visible: false
			}, {
				key: "Topid",
				label: "Workitem Id",
				visible: false
			}, {
				key: "Vendor",
				label: "Vendor",
				visible: true
			}, {
				key: "VenName",
				label: "Vendor Name",
				visible: false
			}, {
				key: "Gjahr",
				label: "Fiscal year",
				visible: false
			}, {
				key: "Prctr",
				label: "Profit Center",
				visible: false
			}, {
				key: "Substs",
				label: "Sub Status",
				visible: false
			}, {
				key: "RejReson",
				label: "Reject Reason",
				visible: false
			}, {
				key: "PostDate",
				label: "Post Date",
				visible: false
			}, {
				key: "GrnaprDt",
				label: "GRN Apprv Date",
				visible: false
			}, {
				key: "Waers",
				label: "Currency",
				visible: false
			}, {
				key: "Amnt",
				label: "Amount",
				visible: false
			}, {
				key: "Whtamnt",
				label: "Withhold Amount",
				visible: false
			}, {
				key: "Pablamnt",
				label: "Payable Amount",
				visible: false
			}, {
				key: "Bldat",
				label: "Document Date",
				visible: false
			}, {
				key: "Zterm",
				label: "Payment terms",
				visible: false
			}, {
				key: "Augbl",
				label: "Account Doc No",
				visible: false
			}, {
				key: "Cdate",
				label: "Clearing Data",
				visible: false
			}, {
				key: "Age",
				label: "Age",
				visible: false
			}, {
				key: "Gtt",
				label: "Gtt",
				visible: false
			}, {
				key: "Ntt",
				label: "Ntt",
				visible: false
			}, {
				key: "Xabln",
				label: "Goods Reciept",
				visible: false
			}, {
				key: "Budat",
				label: "Posting Date",
				visible: false
			}, {
				key: "ZsrlDate",
				label: "ZSRL_Date",
				visible: false
			}, {
				key: "Store",
				label: "Store",
				visible: false
			}, {
				key: "ScanDate",
				label: "Scan Date",
				visible: false
			}, {
				key: "ScanTime",
				label: "Scan Time",
				visible: false
			}, {
				key: "Email",
				label: "Email",
				visible: false
			}, {
				key: "EmailDate",
				label: "Email Date",
				visible: false
			}, {
				key: "EmailTime",
				label: "Email Time",
				visible: false
			}, {
				key: "Gdate",
				label: "Gate Date",
				visible: false
			}, {
				key: "Srvdate",
				label: "Service Date",
				visible: false
			}, {
				key: "Wbtime",
				label: "Weighbridge Time",
				visible: false
			}, {
				key: "Inddate",
				label: "Invoice Date",
				visible: false
			}, {
				key: "Indtime",
				label: "Invoice Time",
				visible: false
			}, {
				key: "Rejdate",
				label: "Reject Date",
				visible: false
			}, {
				key: "Rejtime",
				label: "Reject Time",
				visible: false
			}, {
				key: "Rejagnt",
				label: "Reject Agent",
				visible: false
			}, {
				key: "Aprdate",
				label: "Approval Date",
				visible: false
			}, {
				key: "Aprtime",
				label: "Approval Time",
				visible: false
			}, {
				key: "PostTime",
				label: "Post Time",
				visible: false
			}, {
				key: "Apragnt",
				label: "Approval Agent",
				visible: false
			}, {
				key: "QueAge",
				label: "Queue Age",
				visible: false
			}, {
				key: "WbAge",
				label: "WB Age",
				visible: false
			}, {
				key: "AprAge",
				label: "Approval Age",
				visible: false
			}, {
				key: "TatAge",
				label: "TAT Age",
				visible: false
			}, {
				key: "QueAged",
				label: "Queue Age",
				visible: false
			}, {
				key: "Vtext",
				label: "Payment Terms",
				visible: false
			}, {
				key: "Stats",
				label: "Status",
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
				"StatKey": "S15",
				"StatText": "Indexed"
			}, {
				"StatKey": "S20",
				"StatText": "In Progress"
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
			this.aFilteredData = [];
			this.fn_LoadData();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
this.oRouter.getRoute("Tatanalysis").attachPatternMatched(this.FnonRouteMatched, this);

		},
		FnonRouteMatched:function(){
			this.fnclearbutt();
		},
	// fn_LoadData: function() {
	// 		var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
	// 		var that = this;

	// 		oModel.read("/DEEPHEADSet", {
	// 			urlParameters: {
	// 				$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt"
	// 			},
	// 			success: function(oData) {
	// 				if (oData && oData.results && oData.results.length > 0) {
	// 					var oJSusernameModel = new sap.ui.model.json.JSONModel();
	// 					oJSusernameModel.setData(oData.results[0]);
	// 					that.getView().setModel(oJSusernameModel, "JSusername");
	// 					that.fn_updatePaginatedModel();
	// 				}
	// 			},
	// 			error: function(oError) {
	// 				console.error("Error loading data:", oError);
	// 			}
	// 		});
	// 	},
	fn_LoadData: function() {
 
	
	var oKeyDataModel = sap.ui.getCore().getModel("JSusername");
	if (oKeyDataModel) {
	    var oData = oKeyDataModel.getData();

	    var oJSONUserName = new sap.ui.model.json.JSONModel(oData);

	    this.getView().setModel(oJSONUserName, "JSusername");
	    	this.fn_updatePaginatedModel();
	}
 
		},
		fn_togglehideshow: function() {
			if (!this._oDialog) {

				this._oDialog = sap.ui.xmlfragment("advSearch", "FSC360NEW.fragment.Advancesearchtat", this);
				this.getView().addDependent(this._oDialog);
			}
			if (sap.ui.getCore().AppController) {
				sap.ui.getCore().AppController.collapseSidebar();
			}

			setTimeout(function() {
				this._oDialog.open();
				this.fn_syncMainToFragment();
			}.bind(this), 300);
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
    const sTableName = "/EXL/FSC_TAT";

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
const sTableName = "/EXL/FSC_TAT";
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
    var sReportName = "/EXL/FSC_TAT"; // Hardcoded Tabid

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
		fn_applyflexgrow: function() {
			var $view = this.getView().$();

			$view.find(".cl_tat_status_combobox_inp").each(function() {
				var oParent = this.parentElement;
				if (oParent) {
					oParent.style.flexGrow = "1";
				}
			});

		},
// 	fn_syncFragmentToMain: function() {
//     var oView = this.getView();


//     // var sCompCodeFrom = sap.ui.core.Fragment.byId("advSearch", "idCompcodeFrom").getValue().trim();
//     // var sCompCodeTo   = sap.ui.core.Fragment.byId("advSearch", "idCompCodeTo").getValue().trim();
//     // oView.byId("idCompcodeFrom").setValue(sCompCodeFrom);
//     // oView.byId("idCompCodeTo").setValue(sCompCodeTo);

    
//     var sDateFrom = sap.ui.core.Fragment.byId("advSearch", "id_creationdatefrm").getValue();
//     var sDateTo   = sap.ui.core.Fragment.byId("advSearch", "id_creationdateend").getValue();
//     oView.byId("id_creationdatefrm").setValue(sDateFrom);
//     oView.byId("id_creationdateend").setValue(sDateTo);


//     var sQueueIdFrom = sap.ui.core.Fragment.byId("advSearch", "idQueueFromfrag").getValue().trim();
//     var sQueueIdTo   = sap.ui.core.Fragment.byId("advSearch", "idQueueTofrag").getValue().trim();
//     oView.byId("idQueueFrom").setValue(sQueueIdFrom);
//     oView.byId("idQueueTo").setValue(sQueueIdTo);

//     var sStatusKey = sap.ui.core.Fragment.byId("advSearch", "id_Status").getSelectedKey();
//     oView.byId("id_Status").setSelectedKey(sStatusKey);
// },
// fn_syncMainToFragment: function() {
//     var oView = this.getView();


//     // var sCompCodeFrom = oView.byId("idCompcodeFrom").getValue().trim();
//     // var sCompCodeTo   = oView.byId("idCompCodeTo").getValue().trim();
//     // sap.ui.core.Fragment.byId("advSearch", "idCompcodeFrom").setValue(sCompCodeFrom);
//     // sap.ui.core.Fragment.byId("advSearch", "idCompCodeTo").setValue(sCompCodeTo);


//     var sDateFrom = oView.byId("id_creationdatefrm").getValue();
//     var sDateTo   = oView.byId("id_creationdateend").getValue();
//     sap.ui.core.Fragment.byId("advSearch", "id_creationdatefrm").setValue(sDateFrom);
//     sap.ui.core.Fragment.byId("advSearch", "id_creationdateend").setValue(sDateTo);

 
//     var sQueueIdFrom = oView.byId("idQueueFrom").getValue().trim();
//     var sQueueIdTo   = oView.byId("idQueueTo").getValue().trim();
//     sap.ui.core.Fragment.byId("advSearch", "idQueueFromfrag").setValue(sQueueIdFrom);
//     sap.ui.core.Fragment.byId("advSearch", "idQueueTofrag").setValue(sQueueIdTo);

 
//     var sStatusKey = oView.byId("id_Status").getSelectedKey();
//     sap.ui.core.Fragment.byId("advSearch", "id_Status").setSelectedKey(sStatusKey);
// },
fn_syncFragmentToMain: function() {
    var oView = this.getView();

    // --- Company Code ---
    var aSelKeysFrag = sap.ui.core.Fragment.byId("advSearch", "idCCodefrag").getSelectedKeys();
    oView.byId("idCCode").setSelectedKeys(aSelKeysFrag);

    // --- Dates ---
    var sDateFrom = sap.ui.core.Fragment.byId("advSearch", "id_creationdatefrm").getValue();
    var sDateTo   = sap.ui.core.Fragment.byId("advSearch", "id_creationdateend").getValue();
    oView.byId("id_creationdatefrm").setValue(sDateFrom);
    oView.byId("id_creationdateend").setValue(sDateTo);

    // --- Queue IDs ---
    var sQueueIdFrom = sap.ui.core.Fragment.byId("advSearch", "idQueueFromfrag").getValue().trim();
    var sQueueIdTo   = sap.ui.core.Fragment.byId("advSearch", "idQueueTofrag").getValue().trim();
    oView.byId("idQueueFrom").setValue(sQueueIdFrom);
    oView.byId("idQueueTo").setValue(sQueueIdTo);

    // --- Status ---
    var sStatusKey = sap.ui.core.Fragment.byId("advSearch", "id_Status").getSelectedKey();
    oView.byId("id_Status").setSelectedKey(sStatusKey);
},

fn_syncMainToFragment: function() {
    var oView = this.getView();

    // --- Company Code ---
    var aSelKeysMain = oView.byId("idCCode").getSelectedKeys();
    sap.ui.core.Fragment.byId("advSearch", "idCCodefrag").setSelectedKeys(aSelKeysMain);

    // --- Dates ---
    var sDateFrom = oView.byId("id_creationdatefrm").getValue();
    var sDateTo   = oView.byId("id_creationdateend").getValue();
    sap.ui.core.Fragment.byId("advSearch", "id_creationdatefrm").setValue(sDateFrom);
    sap.ui.core.Fragment.byId("advSearch", "id_creationdateend").setValue(sDateTo);

    // --- Queue IDs ---
    var sQueueIdFrom = oView.byId("idQueueFrom").getValue().trim();
    var sQueueIdTo   = oView.byId("idQueueTo").getValue().trim();
    sap.ui.core.Fragment.byId("advSearch", "idQueueFromfrag").setValue(sQueueIdFrom);
    sap.ui.core.Fragment.byId("advSearch", "idQueueTofrag").setValue(sQueueIdTo);

    // --- Status ---
    var sStatusKey = oView.byId("id_Status").getSelectedKey();
    sap.ui.core.Fragment.byId("advSearch", "id_Status").setSelectedKey(sStatusKey);
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
	
			setTimeout(function() {
				var oHBox = sap.ui.getCore().byId("id_show_hide_search");
				if (oHBox) {
					oHBox.addEventDelegate({
						onclick: function() {
							console.log("hi");
						}
					});
				}
			}, 100);
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
				var sCompanyCode = oSelectedItem.getTitle();
				if (this._sCurrentCompInputId) {
					var oInput = sap.ui.getCore().byId(this._sCurrentCompInputId);
					if (oInput) {
						oInput.setValue(sCompanyCode);
					}
				}
			}
		},
		fn_onFromIconPress: function(oEvent) {
			var that = this;

		
			var oSourceInput = oEvent.getSource().getParent().getItems()[0]; 
			that._sCurrentQidInputId = oSourceInput.getId();

			var oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			oODataModel.read("/QidValueHelpSetSet", {
				success: function(oData) {
					var oJsonModel = new sap.ui.model.json.JSONModel({
						results: oData.results
					});
					that.getView().setModel(oJsonModel, "QidVHModel");

					if (!that._oQidDialog) {
						that._oQidDialog = sap.ui.xmlfragment("FSC360NEW.fragment.qidf4help", that);
						that.getView().addDependent(that._oQidDialog);
					}
					that._oQidDialog.open();
				},
				error: function() {
					sap.m.MessageToast.show("Failed to load Queue IDs");
				}
			});
		},
		fn_onQidConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem && this._sCurrentQidInputId) {
				var sSelectedQid = oSelectedItem.getTitle();
				var oInput = sap.ui.getCore().byId(this._sCurrentQidInputId);
				if (oInput) {
					oInput.setValue(sSelectedQid);
				}
			}

			this._sCurrentQidInputId = null;
		},
		fn_onQidSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Qid", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		fnGetF4Help: function() {

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;
			
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
		fn_getVendor: function(oEvent) {
			var oIcon = oEvent.getSource(); 
			var oHBox = oIcon.getParent();
			var oInput = oHBox.getItems()[0];

			this._sCurrentVendorInputId = oInput.getId(); 

			if (!this.Vendor_frag) {
				this.Vendor_frag = sap.ui.xmlfragment("FSC360NEW.fragment.Lifnr", this);
				this.getView().addDependent(this.Vendor_frag);
			}

			
						var oBinding = this.Vendor_frag.getBinding("items");
			if (oBinding) {
				oBinding.filter([]);
			}

			this.Vendor_frag.open();

		
		},

		fn_Lifnr_Confrm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (!oSelectedItem || !this._sCurrentVendorInputId) return;

			var ven_name = oSelectedItem.getTitle();
			var vendorNumber = ven_name.split('-').pop().trim();

		
			var oInput = sap.ui.getCore().byId(this._sCurrentVendorInputId);
			if (oInput) {
				oInput.setValue(vendorNumber);
			}

			this._sCurrentVendorInputId = null; 
		},

		fn_onCancelPress: function() {
			if (this._oDialog) {
					this.fn_syncFragmentToMain();
				this._oDialog.close();
				this._oDialog.destroy();
				this._oDialog = null;
			
			}
			setTimeout(() => {
				this.fn_applyflexgrow();
			}, 0);
		},

	fn_LoadCC: function() {
    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
    var that = this;

    // Single JSON model for everything
    var oJSONModel = new sap.ui.model.json.JSONModel({
        Company: [],
        SelectedBukrs: [] // initialize selected keys
    });
    this.getView().setModel(oJSONModel, "CompanyModel"); // reuse this model

    oModel.read("/StatusFlowSet", {
        filters: [new Filter("Type", FilterOperator.EQ, 'BUKRS')],
        success: function(oData) {
            // store company results in the same model
            that.getView().getModel("CompanyModel").setProperty("/Company", oData.results || []);
            oGlobalBusyDialog.close();
        },
        error: function() {
            sap.m.MessageBox.error('Http Error');
            oGlobalBusyDialog.close();
        }
    });
},
		fn_search: function() {
			var oView = this.getView();

	var vtokens = this.getView().byId("idCCode").getSelectedItems();
		var Bukrslen = this.getView().byId("idCCode").getSelectedItems().length;
			if (vtokens.length !== 0) {
		
				var aFilters = [];
				if (Bukrslen !== 0) {
					for (var i = 0; i < Bukrslen; i++) {
						var vCompId = vtokens[i].getKey();
						var oFilter1 = new sap.ui.model.Filter("Bukrs", FilterOperator.EQ, vCompId);
						aFilters.push(oFilter1);
					}
				}
			}
			// var sCompCodeFrom = oView.byId("idCompcodeFrom").getValue().trim();
			// var sCompCodeTo = oView.byId("idCompCodeTo").getValue().trim();
			var sDateFrom = oView.byId("id_creationdatefrm").getValue();
			var sDateTo = oView.byId("id_creationdateend").getValue();
			var oComboBox = this.byId("id_Status"); 
			var sStatusKey = oComboBox.getSelectedKey(); 
			var sQueueIdFrom = oView.byId("idQueueFrom").getValue().trim();
			var sQueueIdTo = oView.byId("idQueueTo").getValue().trim();

	
			if (!Bukrslen) {
				sap.m.MessageToast.show("Please enter Company Code From");
				return;
			}

		


			// var aFilters = [
			// 	new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.GE, sCompCodeFrom),
			// 	new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.LE, sCompCodeTo)
			// ];
			if (sDateFrom && sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Cdate", sap.ui.model.FilterOperator.BT, sDateFrom, sDateTo));
			} else if (sDateFrom) {
				aFilters.push(new sap.ui.model.Filter("Cdate", sap.ui.model.FilterOperator.GE, sDateFrom));
			} else if (sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Cdate", sap.ui.model.FilterOperator.LE, sDateTo));
			}
			if (sStatusKey) {
				aFilters.push(new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, sStatusKey));
			}
			if (sQueueIdFrom && sQueueIdTo) {
				aFilters.push(new sap.ui.model.Filter("Queid", sap.ui.model.FilterOperator.BT, sQueueIdFrom, sQueueIdTo));
			} else if (sQueueIdFrom) {
				aFilters.push(new sap.ui.model.Filter("Queid", sap.ui.model.FilterOperator.GE, sQueueIdFrom));
			} else if (sQueueIdTo) {
				aFilters.push(new sap.ui.model.Filter("Queid", sap.ui.model.FilterOperator.LE, sQueueIdTo));
			}

	
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;

		
			oModel.read("/TatReportSet", {
				filters: aFilters,
				success: function(oData) {
	
						var arrTable = [];
					arrTable = oData.results;
					 arrTable.forEach(function(row) {
              
                if (row.Stats === "S15") {
                    row.Stats = "Indexed";
            
                } 
                else if (row.Stats === "S01") {
                    row.Stats = "Gate Entry";
            
                } 
                else if (row.Stats === "S05") {
                    row.Stats = "Attached";
            
                } 
                else if (row.Stats === "S10") {
                    row.Stats = "Attached SES";
            
                } 
                else if(row.Stats === "S20"){
                	 row.Stats = "In Progress";
                }
                 else if(row.Stats === "S30"){
                	 row.Stats = "In Workflow";
                }
                 else if(row.Stats === "S40"){
                	 row.Stats = "Processed,Parked";
                }
                 else if(row.Stats === "S41"){
                	 row.Stats = "Posted";
                }
                   else if(row.Stats === "S50"){
                	 row.Stats = "Rejected";
                }
                   else if(row.Stats === "S60"){
                	 row.Stats = "Hold";
                }
                else{
                	row.Stats = "Unknown";
                }
          
               
            });
				that.aFullData = arrTable;
					that.aFilteredData = arrTable; 

					that.iCurrentPage = 1;
					that.iRowsPerPage = 11;
					that.fn_updatePaginatedModel();
					var iCount = oData.results.length;
					that.getView().byId("id_LabTabSFRTitle").setText(iCount);
				},
				error: function(oError) {
					sap.m.MessageToast.show("Error fetching data");
				}
			});
		},
		fnclearbutt: function() {
			var oView = this.getView();

			// oView.byId("idCompcodeFrom").setValue("");
			// oView.byId("idCompCodeTo").setValue("");
			oView.byId("id_creationdatefrm").setValue("");
			oView.byId("id_creationdateend").setValue("");
			oView.byId("idQueueFrom").setValue("");
			oView.byId("idQueueTo").setValue("");

			var oViewModel = oView.getModel("viewModel");
			if (oViewModel) {
				oViewModel.setProperty("/selectedTemplate", "");
			}

			if (this.aFullData) this.aFullData = [];
			if (this.aFilteredData) this.aFilteredData = [];
			this.iCurrentPage = 1;

			this.fn_updatePaginatedModel();

			oView.byId("id_LabTabSFRTitle").setText("0");
		},
		fn_search_frag_adv: function() {

			var sCompCodeFrom = sap.ui.core.Fragment.byId("advSearch", "idCompcodeFrom").getValue().trim();
			var sCompCodeTo = sap.ui.core.Fragment.byId("advSearch", "idCompCodeTo").getValue().trim();
			var sDateFrom = sap.ui.core.Fragment.byId("advSearch", "id_creationdatefrm").getValue();
			var sDateTo = sap.ui.core.Fragment.byId("advSearch", "id_creationdateend").getValue();
			var sQueueIdFrom = sap.ui.core.Fragment.byId("advSearch", "idQueueFromfrag").getValue().trim();
			var sQueueIdTo = sap.ui.core.Fragment.byId("advSearch", "idQueueTofrag").getValue().trim();
			var sStatusKey = this.getView().getModel("viewModel").getProperty("/selectedTemplate");
			var sVendorFrom = sap.ui.core.Fragment.byId("advSearch", "idvendorfrom").getValue().trim();
			var sVendorTo = sap.ui.core.Fragment.byId("advSearch", "idvendorto").getValue().trim();
				if (!sCompCodeFrom) {
				sap.m.MessageToast.show("Please enter Company Code From");
				return;
			}
			var aFilters = [
				new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.GE, sCompCodeFrom),
				new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.LE, sCompCodeTo)
			];
			if (sDateFrom && sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Cdate", sap.ui.model.FilterOperator.BT, sDateFrom, sDateTo));
			} else if (sDateFrom) {
				aFilters.push(new sap.ui.model.Filter("Cdate", sap.ui.model.FilterOperator.GE, sDateFrom));
			} else if (sDateTo) {
				aFilters.push(new sap.ui.model.Filter("Cdate", sap.ui.model.FilterOperator.LE, sDateTo));
			}
			if (sStatusKey) {
				aFilters.push(new sap.ui.model.Filter("Stats", sap.ui.model.FilterOperator.EQ, sStatusKey));
			}
			if (sQueueIdFrom && sQueueIdTo) {
				aFilters.push(new sap.ui.model.Filter("Queid", sap.ui.model.FilterOperator.BT, sQueueIdFrom, sQueueIdTo));
			} else if (sQueueIdFrom) {
				aFilters.push(new sap.ui.model.Filter("Queid", sap.ui.model.FilterOperator.GE, sQueueIdFrom));
			} else if (sQueueIdTo) {
				aFilters.push(new sap.ui.model.Filter("Queid", sap.ui.model.FilterOperator.LE, sQueueIdTo));
			}
			if (sVendorFrom && sVendorTo) {
				aFilters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, sVendorFrom, sVendorTo));
			} else if (sVendorFrom) {
				aFilters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, sVendorFrom));
			} else if (sVendorTo) {
				aFilters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, sVendorTo));
			}

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var that = this;


			oModel.read("/TatReportSet", {
				filters: aFilters,
				success: function(oData) {
			
						var arrTable = [];
					arrTable = oData.results;
					 arrTable.forEach(function(row) {
              
                if (row.Stats === "S15") {
                    row.Stats = "Indexed";
            
                } 
                else if(row.Stats === "S20"){
                	 row.Stats = "In Progress";
                }
                 else if(row.Stats === "S30"){
                	 row.Stats = "In Workflow";
                }
                 else if(row.Stats === "S40"){
                	 row.Stats = "Processed,Parked";
                }
                 else if(row.Stats === "S41"){
                	 row.Stats = "Posted";
                }
                   else if(row.Stats === "S50"){
                	 row.Stats = "Escalated";
                }
                   else if(row.Stats === "S60"){
                	 row.Stats = "Hold";
                }
          
          
            });
				that.aFullData = arrTable; 
					that.aFilteredData = arrTable; 

					that.iCurrentPage = 1;
					that.iRowsPerPage = 12;
					that.fn_updatePaginatedModel();
					var iCount = oData.results.length;
					that.getView().byId("id_LabTabSFRTitle").setText(iCount);
				},
				error: function(oError) {
					sap.m.MessageToast.show("Error fetching data");
				}
			});

			this.fn_onCancelPress();

		
		},
		fn_onCancelPress_frag: function() {
			var aIds = [
				"idCompcodeFrom",
				"idCompCodeTo",
				"id_creationdatefrm",
				"id_creationdateend",
				"idQueueTofrag",
				"idQueueFromfrag"
			];

			// Clear input values
			aIds.forEach(function(sId) {
				var oControl = sap.ui.core.Fragment.byId("advSearch", sId);
				if (oControl) {
					if (oControl.setValue) {
						oControl.setValue("");
					}
				}
			});
		},

	fn_updatePaginatedModel: function() {
    var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
    var iEnd = iStart + this.iRowsPerPage;

    var pageData = this.aFilteredData.slice(iStart, iEnd);
    var pagedModel = new sap.ui.model.json.JSONModel();
    pagedModel.setData(pageData);

    this.getView().setModel(pagedModel, "AutoParkModel");

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
		}

	});

});