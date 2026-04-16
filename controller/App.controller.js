sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, MessageBox, Filter, FilterOperator) {
	"use strict";
var g_plant,oModel;
	var g_obj;
	return Controller.extend("FSC360NEW.controller.App", {
		onInit: function() {
			this._isSidebarCollapsed = false;
			var sActiveId = localStorage.getItem("activeSidebarItem");
			if (sActiveId) {
				var oHBox = this.byId(sActiveId);
				if (oHBox) {
					oHBox.addStyleClass("activeButton");
				}
			}
 var oRadioModel = new sap.ui.model.json.JSONModel({
        selectedKey: "" // Initially no radio button selected
    });

    // Set the model globally so it can be accessed by all views
    this.getView().setModel(oRadioModel, "radioState");
			// rabooni	
			// Initialize the appState model with sidebarCollapsed property
			var oAppStateModel = new sap.ui.model.json.JSONModel({
				sidebarCollapsed: false
			});

			// Set the model to the view with the name "appState"
			this.getView().setModel(oAppStateModel, "appState");
			this.handleNavigationPress(null, "hboxDashboard");
//  Determine initial route from URL hash
	var sHash = window.location.hash;

	if (!sHash || sHash === "#/" || sHash === "") {
		// No specific route -> highlight Dashboard
		this.handleNavigationPress(null, "hboxDashboard");
	} else if (sHash.includes("Fulfilment")) {
		this.handleNavigationPress(null, "hboxFulfillment");
	} 
	// else if (sHash.includes("StatusFlow")) {
	// 	this.handleNavigationPress(null, "hboxStatusflow");
	// } 
		else if (sHash.includes("Assigngrn")) {
		this.handleNavigationPress(null, "hboxAssigngrn");
	} 
	else if (sHash.includes("Barcode")) {
		this.handleNavigationPress(null, "hboxAssignbarcode");
	} else if (sHash.includes("Capture")) {
		this.handleNavigationPress(null, "hboxCapture");
	} else if (sHash.includes("Spend")) {
		this.handleNavigationPress(null, "hboxSpend");
	} else if (sHash.includes("Advance")) {
		this.handleNavigationPress(null, "hboxAdvance");
	} else if (sHash.includes("Approval")) {
		this.handleNavigationPress(null, "hboxApproval");
	} else if (sHash.includes("VendorOnboard")) {
		this.handleNavigationPress(null, "hboxVendorOnboard");
	} else if (sHash.includes("creditNote")) {
		this.handleNavigationPress(null, "hboxcreditnote");}
	else if (sHash.includes("Autopark")) {
		this.handleNavigationPress(null, "hboxAutopark");
	} else if (sHash.includes("Pagetip")) {
		this.handleNavigationPress(null, "btnPagetipHBox");
	} else if (sHash.includes("Setting")) {
		this.handleNavigationPress(null, "btnSettingHBox");
	} else if (sHash.includes("Logout")) {
		this.handleNavigationPress(null, "btnLogoutHBox");
	}

			// rabooni

			this.oRouter = this.getOwnerComponent().getRouter();
			sap.ui.getCore().AppController = this;
				setTimeout(() => {
				this._applyFlexGrow();
			}, 0);
				

		},
			_applyFlexGrow: function () {
    var $view = this.getView().$();

    $view.find(".formInputB1").each(function () {
        var oParent = this.parentElement;
        if (oParent) {
            oParent.style.flexGrow = "1";
        }
    });

    $view.find(".cl_combo_transBar").each(function () {
        var oParent = this.parentElement;
        if (oParent) {
            oParent.style.flexGrow = "1";
        }
    });
},
onAnalyticsToggle: function (oEvent) {
  var oVBox = this.byId("vboxAnalyticsSub");
  var oArrow = this.byId("imgAnalyticsArrow");
  	this.handleNavigationPress(oEvent, "vboxAnalytics");
  	  var assign = this.byId("hboxAssignbarcode");
  var capture = this.byId("hboxCapture");
  var recurringbill = this.byId("hboxRecurringbill");
  var vendoronboard = this.byId("hboxVendorOnboard");
  var payment = this.byId("hboxPayWork");
    var msme  = this.byId("hboxAutopark");
  if (oVBox.getVisible()) {
    oVBox.setVisible(false);
    oArrow.setSrc("Images/down_arrow.svg"); // collapsed
     assign.setVisible(true);
    capture.setVisible(true);
    recurringbill.setVisible(true);
    vendoronboard.setVisible(true);
    payment.setVisible(true);
    msme.setVisible(true);
  } else {
    oVBox.setVisible(true);
     assign.setVisible(false);
    capture.setVisible(false);
     capture.setVisible(false);
    recurringbill.setVisible(false);
    vendoronboard.setVisible(false);
    payment.setVisible(false);
    msme.setVisible(false);
    oArrow.setSrc("Images/up-arrow.svg"); // expanded
  }
  
},
fn_CollapseAnalytics:function(){
	var oVBox = this.byId("vboxAnalyticsSub");
  var oArrow = this.byId("imgAnalyticsArrow");
  
   oVBox.setVisible(false);
   oArrow.setSrc("Images/down_arrow.svg"); 
	  var assign = this.byId("hboxAssignbarcode");
  var capture = this.byId("hboxCapture");
   var recurringbill = this.byId("hboxRecurringbill");
  var vendoronboard = this.byId("hboxVendorOnboard");
  var payment = this.byId("hboxPayWork");
    var msme  = this.byId("hboxAutopark");
  
  assign.setVisible(true);
    capture.setVisible(true);
    recurringbill.setVisible(true);
    vendoronboard.setVisible(true);
    payment.setVisible(true);
    msme.setVisible(true);
   
},
		onToggleSidebar: function() {
			var oView = this.getView();
			var oSplitContainer = oView.byId("id_split");
			var $sidebar = oView.byId("idMainSidebar").$();

			this._isSidebarCollapsed = !this._isSidebarCollapsed;
			// 		// rabooni
			var oAppStateModel = oView.getModel("appState");
			oAppStateModel.setProperty("/sidebarCollapsed", this._isSidebarCollapsed);
			// // rabooni
			if (this._isSidebarCollapsed) {
				oSplitContainer.setSecondaryContentWidth("58px");
				$sidebar.addClass("sidebar-collapsed");

				oView.byId("btnDashboard").setText("");
				oView.byId("btnFulfilment").setText("");
				// oView.byId("btnStatusflow").setText("");
				oView.byId("btnAssignbarcode").setText("");
					oView.byId("btnAssigngrn").setText("");
				oView.byId("btnCapture").setText("");
				oView.byId("btnSpend").setText("");
					oView.byId("btnAdvance").setText("");
						oView.byId("btnApproval").setText("");
							oView.byId("btnVendorOnboard").setText("");
								oView.byId("btnAutopark").setText("");
								oView.byId("id_creditnote").setText("");
				// oView.byId("btnPagetip").setText("");
				// oView.byId("btnSetting").setText("");
				oView.byId("btnLogout").setText("");
			} else {
				oSplitContainer.setSecondaryContentWidth("175px");
				$sidebar.removeClass("sidebar-collapsed");

				oView.byId("btnDashboard").setText("Dashboard");
				oView.byId("btnFulfilment").setText("Fulfilment");
				// oView.byId("btnStatusflow").setText("Status Flow");
				oView.byId("btnAssignbarcode").setText("Freight Management");
					oView.byId("btnAssigngrn").setText("Assign GRN");
				oView.byId("btnCapture").setText("Capture Center");
				oView.byId("btnSpend").setText("SES Desk");
					oView.byId("btnAdvance").setText("Advance App");
						oView.byId("btnApproval").setText("Approval");
							oView.byId("btnVendorOnboard").setText("Vendor Onboard");
							oView.byId("btnAutopark").setText("MSME");
							oView.byId("id_creditnote").setText("Adjustment Posting");
				// oView.byId("btnPagetip").setText("Page Tips");
				// oView.byId("btnSetting").setText("Settings");
				oView.byId("btnLogout").setText("Log Out");
				//     	// Show columns
				// if (oStatusCol) oStatusCol.setVisible(true);
				// if (oCurrencyCol) oCurrencyCol.setVisible(true);
			}
		},

		// handleNavigationPress: function(oEvent, sHBoxId) {
		// 	var aButtonContainers = [
		// 		"hboxDashboard",
		// 		"hboxFulfillment",
		// 		"hboxStatusflow",
		// 		"hboxAssignbarcode",
		// 		"hboxCapture",
		// 		"hboxSpend",
		// 		"btnPagetipHBox",
		// 		"btnSettingHBox",
		// 		"btnLogoutHBox"
		// 	];

		// 	aButtonContainers.forEach(function(sId) {
		// 		var oHBox = this.byId(sId);
		// 		if (oHBox) {
		// 			oHBox.removeStyleClass("activeButton");
		// 		}
		// 	}, this);

		// 	var oActiveHBox = this.byId(sHBoxId);
		// 	if (oActiveHBox) {
		// 		oActiveHBox.addStyleClass("activeButton");
		// 	}
		// },
		handleNavigationPress: function(oEvent, sHBoxId) {
			var aButtonContainers = [
				"hboxDashboard",
				"hboxFulfillment",
				"hboxStatusflow",
				"hboxAssignbarcode",
					"hboxAssigngrn",
				"hboxCapture",
				"hboxSpend",
				"hboxAdvance",
				"hboxApproval",
					"hboxVendorOnboard",
					"hboxcreditnote",
						"hboxAutopark",
					"hboxPayWork",
					"hboxRecurringbill",
						"vboxAnalytics",
				"btnPagetipHBox",
				"btnSettingHBox",
				"btnLogoutHBox"
			];

			aButtonContainers.forEach(function(sId) {
				var oHBox = this.byId(sId);
				if (oHBox) {
					oHBox.removeStyleClass("activeButton");
				}
			}, this);

			var oActiveHBox = this.byId(sHBoxId);
			if (oActiveHBox) {
				oActiveHBox.addStyleClass("activeButton");
				// Store in localStorage
				localStorage.setItem("activeSidebarItem", sHBoxId);
			}
		},
// 
		onDashboardPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxDashboard");
			this.oRouter.navTo("Dashboard");
					this.fn_CollapseAnalytics();
		},

		onFulfilmentPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxFulfillment");
		this.oRouter.navTo("Fulfilment",{ btnstat: "W" });
				this.fn_CollapseAnalytics();
		},
onScanAppReportPress : function(oEvent) {
			// this.handleSubNavigationPress(oEvent, "hboxScan");
				this.handleNavigationPress(oEvent, "vboxAnalytics");
				
			this.oRouter.navTo("StatusFlow");
		},
		onTATPress : function(oEvent){
				this.handleNavigationPress(oEvent, "vboxAnalytics");
			this.oRouter.navTo("Tatanalysis");
		},
						//Added by Lokesh R on 07.08.2025 - Start
		onInvoiceUnblockPress : function(oEvent){
				this.handleNavigationPress(oEvent, "vboxAnalytics");
			this.oRouter.navTo("InvoiceUnblock");
		},
		//Added by Lokesh R on 07.08.2025 - End
		onStatusFlowPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "vboxAnalytics");
			this.oRouter.navTo("StatusFlow");
		},

		onAssignBarcodePress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxAssignbarcode");
			this.oRouter.navTo("Barcode");
					this.fn_CollapseAnalytics();
		},
			onAssignGrnPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxAssigngrn");
			this.oRouter.navTo("Assigngrn");
					this.fn_CollapseAnalytics();
		},
		onRecallPress: function(oEvent) {
		 this.handleNavigationPress(oEvent, "vboxAnalytics");
			this.oRouter.navTo("Recall");
		},
		onCaptureCenterPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxCapture");
			// this.oRouter.navTo("CaptureCenter");
			var c_flag = "C";
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("CaptureCenter", {
				"cFlag": c_flag
			});
					this.fn_CollapseAnalytics();
		},

		onSESPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxSpend");
					this.fn_CollapseAnalytics();
			this.oRouter.navTo("SES");
		},
			onAdvanceAppPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxAdvance");
			this.oRouter.navTo("AdvanceApp");
					this.fn_CollapseAnalytics();
		},
		onAutoparkPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxAutopark");
					this.fn_CollapseAnalytics();
			this.oRouter.navTo("MSME");
		},
			fn_PayworkbenchPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "hboxPayWork");
			this.oRouter.navTo("PaymentWorkbench");
					this.fn_CollapseAnalytics();
				// this.oRouter.navTo("PayWB-Approver");
				// this.oRouter.navTo("PayWBFinal");
		},
		onPhysicalTrackingPress: function(oEvent){
				this.handleNavigationPress(oEvent, "vboxAnalytics");
				this.oRouter.navTo("PhysicalTracking");
		},
		onDeviationPress: function(oEvent){
				this.handleNavigationPress(oEvent, "vboxAnalytics");
				this.oRouter.navTo("Deviation");
		},
		fn_recurringbill: function(oEvent){
				this.handleNavigationPress(oEvent, "hboxRecurringbill");
				this.oRouter.navTo("RecurringBill");
					this.fn_CollapseAnalytics();
		},
		fnAgentReassignPress: function(oEvent){
				// this.handleNavigationPress(oEvent, "hboxRecurringbill");
				this.oRouter.navTo("AgentReassign");
		},
		fnStatusUpdate: function(oEvent){
				// this.handleNavigationPress(oEvent, "hboxRecurringbill");
				this.oRouter.navTo("StatusUpdate");
		},
		// 	onApprovalPress: function(oEvent) {
		// 	this.handleNavigationPress(oEvent, "hboxApproval");
		// 	  document.body.classList.add("smartphone");
		// 	this.oRouter.navTo("ApprovalMobile");
		// },
		onApprovalPress: function(oEvent) {
    this.handleNavigationPress(oEvent, "hboxApproval");
    		this.fn_CollapseAnalytics();
    				this.fn_CollapseAnalytics();

    var isMobile = sap.ui.Device.system.phone || window.innerWidth <= 600;

    if (isMobile) {
        document.body.classList.add("smartphone");
        this._hideSidebar();
        this.oRouter.navTo("ApprovalMobile");
    } 
    else {
        document.body.classList.remove("smartphone");
        // this._showSidebar();
        this.oRouter.navTo("Approval");
    }
},
onVendorOnboardPress: function(oEvent) {
		this.handleNavigationPress(oEvent, "hboxVendorOnboard");
			this.oRouter.navTo("VendorOnboard");


},
fn_creditnote: function(oEvent) {
		this.handleNavigationPress(oEvent, "hboxcreditnote");
			this.oRouter.navTo("creditNote");


},



_hideSidebar: function() {
    var oSplitContainer = this.byId("id_split");
    if (oSplitContainer) {
        oSplitContainer.setShowSecondaryContent(false);
        var oSidebar = this.byId("idMainSidebar");
        if (oSidebar) {
            oSidebar.setVisible(false);
        }
    }
},


		onPageTipsPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "btnPagetipHBox");
			this.oRouter.navTo("PageTips");
		},

		onSettingsPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "btnSettingHBox");
			this.oRouter.navTo("Settings");
		},

		onLogoutPress: function(oEvent) {
			this.handleNavigationPress(oEvent, "btnLogoutHBox");
			sap.m.MessageBox.show("Are you sure you want to log out?", {
				title: "Confirmation",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction == sap.m.MessageBox.Action.YES) {
						jQuery.ajax({
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
		collapseSidebar: function() {
			var oView = this.getView();
			var oSplitContainer = oView.byId("id_split");
			var $sidebar = oView.byId("idMainSidebar").$();

			this._isSidebarCollapsed = true;

			var oAppStateModel = oView.getModel("appState");
			oAppStateModel.setProperty("/sidebarCollapsed", true);

			oSplitContainer.setSecondaryContentWidth("58px");
			$sidebar.addClass("sidebar-collapsed");

			oView.byId("btnDashboard").setText("");
			oView.byId("btnFulfilment").setText("");
			// oView.byId("btnStatusflow").setText("");
			oView.byId("btnAssignbarcode").setText("");
			oView.byId("btnCapture").setText("");
			oView.byId("btnSpend").setText("");
			// oView.byId("btnPagetip").setText("");
			// oView.byId("btnSetting").setText("");
			oView.byId("btnLogout").setText("");
		},
			

	});
});