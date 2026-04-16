sap.ui.define([
  "sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/ui/model/Sorter",	"FSC360NEW/model/formatter"
], function(Controller, MessageBox, Sorter , formatter) {
  "use strict";
  var uname_1;
  var first_letter;
  var Id;
  var Workitem;
  var Comments_Rem;
  var Payamt;
  var Remarks;
  var flag;
  var comment;
	return Controller.extend("FSC360NEW.controller.PayWB-Approver", {

	 onInit: function(evt) {
	 		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this); // <-- FIX
	 		 this.oRouter.attachRoutePatternMatched(this.fn_radio, this);
      this.fn_user();
      var obj = {};
      obj.Flag = 'O';
      obj.NavPay = [];
      obj.navPay2 = [];
     
      var that = this;
      var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
      oModel.create('/OpenSet', obj, {
        success: function(oData, Response) {
          var oModel1 = new sap.ui.model.json.JSONModel();
          oModel1.setData(oData.NavPay.results);
          that.getView().setModel(oModel1, "MId");

          var oModel2 = new sap.ui.model.json.JSONModel();
          oModel2.setData(oData.navPay2.results);
          that.getView().setModel(oModel2, "MProfit1");
        },
        error: function() {
that._openErrorDialog(" Error! ");
          //MessageBox.error(" Error! ", {
          //  actions: ["OK"],
          //  onClose: function(nAction) {
          //    if (nAction === "OK") {}
          //  }
          //});
        }
      });

      this.fn_clear();
      window.scrollTo(0, 0);
       this.getView().byId("id_selected").setText(0);
       	 var oSearchConfig = new sap.ui.model.json.JSONModel({
        Prctr: false,
        Belnr: false,
        Blart: false,
        Reindat: false,
        Lifnr: false,
        Name1: false,
        Xblnr: false,
        Bldat: false,
        Dmbtr: false,
        Netdt: false,
        PayAmount: false,
        PartialPaid: false,
        Waers: false,
        Ageing: false,
        Shkzg: false
    });
    this.getView().setModel(oSearchConfig, "SearchConfig");
      var oErrorModel = new sap.ui.model.json.JSONModel({
        message: ""
    });
    this.getView().setModel(oErrorModel, "errorModel");
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
	 fn_work: function(oEvent) {
		 		this.oRouter.navTo("PaymentWorkbench");
		 			location.reload();
		 		
		 },
		 fn_final: function(oEvent) {
		 		this.oRouter.navTo("PayWBFinal");
		 			location.reload();
		 },
		 fn_radio: function(){
		 	 var oRadioGroup = this.byId("idViewSelector");

// Select "PayWB Final"
oRadioGroup.setSelectedIndex(1); 
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

   handleSearch1: function (oEvent) {
    var sQuery = oEvent.getParameter("value");
    sQuery = sQuery ? sQuery.trim().toLowerCase() : "";

    var oList = this.byId("id_list");
    var oBinding = oList.getBinding("items");
    var aFilters = [];

    if (sQuery) {
        // Add filters for string-based fields
        var aSubFilters = [
            new sap.ui.model.Filter("Transid", sap.ui.model.FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("PayLoc", sap.ui.model.FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("PayAmount", sap.ui.model.FilterOperator.Contains, sQuery)
        ];

        // Handle date search — convert to normalized format (DD/MM/YYYY etc.)
        var fnNormalizeDate = function (sDate) {
            return sDate.replace(/[-.]/g, "/"); // support "-", ".", etc.
        };
        var sDateQuery = fnNormalizeDate(sQuery);

        // Custom filter for date field (works with formatted dates in your list)
        aSubFilters.push(new sap.ui.model.Filter({
            path: "Reindat",
            test: function (value) {
                if (!value) return false;
                try {
                    // Convert date object or string to display format
                    var sVal = new Date(value);
                    var formatted = sVal.toLocaleDateString("en-GB"); // e.g. 10/10/2025
                    return formatted.toLowerCase().includes(sDateQuery);
                } catch (e) {
                    // fallback: direct string compare
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
    handleSearch2: function(oEvent) {
      this.fncancel();
      var aFilters = [];
      var vValue = this.getView().byId("id_search2").getValue();
      var oBinding = this.getView().byId("id_table").getBinding("rows");
      if (vValue) {
        var oFilter1 = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, vValue);
        var oFilter2 = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.StartsWith, vValue);
        var oFilter4 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
        var oFilter5 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
        var oFilter6 = new sap.ui.model.Filter("Xblnr", sap.ui.model.FilterOperator.Contains, vValue);
        var oFilter8 = new sap.ui.model.Filter("Dmbtr", sap.ui.model.FilterOperator.Contains, vValue);
        var oFilter10 = new sap.ui.model.Filter("PayAmount", sap.ui.model.FilterOperator.StartsWith, vValue);
        var oFilter11 = new sap.ui.model.Filter("Waers", sap.ui.model.FilterOperator.Contains, vValue);
        var oFilter12 = new sap.ui.model.Filter("Ageing", sap.ui.model.FilterOperator.Contains, vValue);
        var allFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter4, oFilter5, oFilter6, oFilter8, oFilter10, oFilter11,
          oFilter12
        ]);
        oBinding.filter(allFilter);
      } else {
        oBinding.filter([]);
      }

    },
    fn_sort_frag: function() {
      var JsonoModelProfit = new sap.ui.model.json.JSONModel();
      var arr = this.getView().getModel("MProfit").getData();
      JsonoModelProfit.setData(arr);
      this.getView().setModel(JsonoModelProfit, "MProfit");
      var length_data = arr.length;
      //Added by Lokesh R on 21.09.2023 - Start
      if (length_data) {
        for (var i = 0; i < length_data; i++) {
          arr[i].Lifnr = parseInt(arr[i].Lifnr);
          arr[i].Belnr = parseInt(arr[i].Belnr);
        }
      }
      JsonoModelProfit.refresh();
      if (!this.Value55) {
        this.Value55 = sap.ui.xmlfragment("FSC360NEW.Fragment.Sort", this);
        this.getView().addDependent(this.Value55);
      }
      this.Value55.open();
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
    fncancel1: function(oEvent) {
      var JsonoModelProfit = new sap.ui.model.json.JSONModel();
      var arr = this.getView().getModel("MProfit").getData();
      JsonoModelProfit.setData(arr);
      this.getView().setModel(JsonoModelProfit, "MProfit");
      var length_data = arr.length;
      //Added by Lokesh R on 21.09.2023 - Start
      if (length_data) {
        for (var i = 0; i < length_data; i++) {
          arr[i].Lifnr = String(arr[i].Lifnr);
          arr[i].Belnr = String(arr[i].Belnr);
        }
      }
      JsonoModelProfit.refresh();
    },

    fn_sorting: function(oEvent) {

      var oView = this.getView();
      var oTable = oView.byId("id_table");
      var mParams = oEvent.getParameters();
      var oBinding = oTable.getBinding("rows");
      var aSorters = [];

      // apply sorter 
      var sPath = mParams.sortItem.getKey();
      var bDescending = mParams.sortDescending;
      aSorters.push(new Sorter(sPath, bDescending));
      oBinding.sort(aSorters);
      // this.fncancel();
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
          arr[i].Tdline = String(arr[i].Tdline);
        }
      }
      JsonoModelProfit.refresh();
    },
    fn_clear: function() {
      this.getView().byId("id_totamt").setText("Rs. 0");
      this.getView().byId("id_search2").setValue(null);
      this.getView().byId("id_search1").setValue(null);
      var oModel = new sap.ui.model.json.JSONModel({
        items: []
      });
      this.getOwnerComponent().setModel(oModel, "MProfits");
      this.getView().byId("id_reject").setVisible(false);
      this.getView().byId("id_pdf").setVisible(false);
      this.getView().byId("id_comments").setVisible(false);
      this.getView().byId("id_approve").setVisible(false);
    },
// OnPressComment: function () {
//     var oView = this.getView();

//     // Create the fragment only once
//     if (!this.Comment) {
//         this.Comment = sap.ui.xmlfragment("FSC360NEW.Fragment.Comments", this);
//         oView.addDependent(this.Comment);

//         // Attach event to detect outside clicks
//         var that = this;
//         $(document).on("mousedown.commentDialog", function (e) {
//             var $target = $(e.target);
//             var bInsideDialog = $target.closest(".sapMDialog").length > 0;

//             if (!bInsideDialog && that.Comment.isOpen()) {
//                 that.Comment.close();
//             }
//         });
//     }

//     // --- Step 5: Use controller-level variables here ---
//     sap.ui.getCore().byId("id_comment").setText(this._messageText || "");
//     sap.ui.getCore().byId("id_messageText").setText(this._commentText || "");

//     // Open the dialog
//     this.Comment.open();
// },

OnPressComment: function(oEvent) {
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

    // Create fragment if not already created
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
}
,

    fn_closecomment: function() {
      this.Comment.close();
      sap.ui.getCore().byId("id_comment").setText("");
    },
    OnPressList: function(oEvent) {
      var list = this.getView().byId("id_list").getAggregation("items");
      var oList = this.byId("id_list"),
        oBinding = oList.getBinding("items");

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
      this.getView().byId("id_pdf").setVisible(true);
      this.getView().byId("id_comments").setVisible(true);
      this.getView().byId("id_reject").setVisible(true);
      this.getView().byId("id_approve").setVisible(true);
      var oSplitapp = this.byId("SplitAppDemo");
      var oDetailPage = this.byId("detail");
      oSplitapp.toDetail(oDetailPage);
    },
   onselection: function (oEvent) {
    var oClickedItem = oEvent.getParameter("listItem");
    var oList = this.byId("id_list");

    // --- Step 1: Handle Styling ---
    oList.getItems().forEach(function (item) {
        item.removeStyleClass("selectedListItem");
    });
    oClickedItem.addStyleClass("selectedListItem");

    // Extract values
     Id = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Transid");
      Workitem = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Workitemid");
      Payamt = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("PayAmount");
      Comments_Rem = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Comments");
    comment = oEvent.getParameter("listItem").getBindingContext("MId").getProperty("Tdline");
this.tdline = comment;
    // --- Step 2: Split text into two parts ---
    var parts = comment.split("\n");
    this._messageText = parts[0] || "";  // Store globally
    this._commentText = parts.slice(1).join("\n") || "";

    // --- Step 3: Filter and bind table data ---
    var arr = [];
    var arr1 = [];
    var oModel = this.getView().getModel("MProfit1");
    arr = oModel.getData();

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].Transid === Id) {
            arr1.push(arr[i]);
        }
    }

    var oModel1 = new sap.ui.model.json.JSONModel();
    oModel1.setData(arr1);
    this.getView().setModel(oModel1, "MProfit");
    this.aFilteredData = oModel1.getData();

    // --- Step 4: Update table rows dynamically ---
    var oTable = this.getView().byId("id_table");
    var iRowCount = arr1.length;
    var iMaxRows = 10;
    oTable.setVisibleRowCount(Math.min(iRowCount, iMaxRows));

    this.getView().byId("id_selected").setText(iRowCount);
    this.getView().byId("id_totamt").setText("Rs. " + Payamt);

    this.iCurrentPage = 1;
    this.updatePaginatedModel();
},

    onBack: function() {
      window.location.reload();
      window.scrollTo(0, 0);
    },
    OnPressSuccess: function() {
    
      flag = 'A';
      if (!this.Remarks) {
        this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.Remarks", this);
        this.getView().addDependent(this.Remarks);
      }
      this.Remarks.open();
      //sap.ui.getCore().byId("textAreaWithBinding2").setValue(Comments_Rem);
       sap.ui.getCore().byId("id_approve").setText("Yes, Approve");
    },
    OnPressReject: function() {
      flag = 'R';
      if (!this.Remarks) {
        this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.Remarks", this);
        this.getView().addDependent(this.Remarks);
      }
      this.Remarks.open();
      //sap.ui.getCore().byId("textAreaWithBinding2").setValue(Comments_Rem);
        sap.ui.getCore().byId("id_approve").setText("Yes, Reject");
    },
  fn_success_confirm: function(RemarksS) {
  var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
  var obj = {};
  obj.Flag = 'A';
  obj.Flag1 = 'A';
  obj.NavPay = [];
  obj.Remarks = RemarksS;

  var temp = {
    "Transid": Id,
    "Workitemid": Workitem
  };
  obj.NavPay.push(temp);

  var BI = new sap.m.BusyDialog();
  BI.open();

  var that = this;

  oModel.create('/OpenSet', obj, {
    success: function(oData, Response) {
      BI.close();
      var oMessage = "";

      // Handle error message from backend
      if (oData.MsgType === 'E') {
        oMessage = oData.Msg;
      }

      if (oMessage === "") {
        // Close the Remarks dialog
        if (that.Remarks) {
          that.Remarks.close();
        }

        // Open success fragment instead of MessageBox
        that._openSuccessDialog("Approved Successfully", function() {
          window.location.reload();
        });
      } else {
        // Open error fragment instead of MessageBox
        that._openErrorDialog(oMessage);
      }
    },
    error: function() {
      BI.close();
      that._openErrorDialog("Error occurred while approving!");
    }
  });
},

fn_reject_confirm: function(RemarksR) {
  var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/PAY_ODATA_V1_SRV/");
  var obj = {};
  obj.Flag = 'R';
  obj.Flag1 = 'A';
  obj.NavPay = [];
  obj.Remarks = RemarksR;

  var temp = {
    "Transid": Id,
    "Workitemid": Workitem
  };
  obj.NavPay.push(temp);

  var BI = new sap.m.BusyDialog();
  BI.open();

  var that = this;

  oModel.create('/OpenSet', obj, {
    success: function(oData, Response) {
      BI.close();
      if (that.Remarks) {
        that.Remarks.close();
      }

      // Open success fragment instead of MessageBox
      that._openSuccessDialog("Rejected Successfully", function() {
        window.location.reload();
      });
    },
    error: function() {
      BI.close();
      that._openErrorDialog("Error occurred while rejecting!");
    }
  });
},

fn_okremarks: function() {
  var BI = new sap.m.BusyDialog();
  BI.open();

  var sRemarks = sap.ui.getCore().byId("textAreaWithBinding2").getValue();

  if (flag === 'A') {
    if (!sRemarks) {
      BI.close();
      this._openErrorDialog("Please enter remarks to Approve");
      return;
    }
    BI.close();
    this.fn_success_confirm(sRemarks);

  } else if (flag === 'R') {
    if (!sRemarks) {
      BI.close();
      this._openErrorDialog("Please enter remarks to Reject");
      return;
    }
    BI.close();
    this.fn_reject_confirm(sRemarks);
  }
},

fn_closeremarks: function() {
  if (!this.Remarks) {
    this.Remarks = sap.ui.xmlfragment("FSC360NEW.Fragment.Remarks", this);
    this.getView().addDependent(this.Remarks);
  }
  this.Remarks.close();
  sap.ui.getCore().byId("textAreaWithBinding2").setValue(null);
},

/* ----------------------- ERROR FRAGMENT ----------------------- */
_openErrorDialog: function(sMessage) {
  var oView = this.getView();

  if (!this._oErrorDialog) {
    this._oErrorDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.ErrorPayAppr", this);
    oView.addDependent(this._oErrorDialog);
  }

  // Set the error message dynamically
  sap.ui.getCore().byId("id_error_text").setText(sMessage);


  // Open the dialog
  this._oErrorDialog.open();
},

fn_onCloseErrorDialog: function() {
  if (this._oErrorDialog) {
    this._oErrorDialog.close();
  }
},

/* ----------------------- SUCCESS FRAGMENT ----------------------- */
_openSuccessDialog: function(sMessage, callback) {
  var oView = this.getView();

  if (!this._oSuccessDialog) {
    this._oSuccessDialog = sap.ui.xmlfragment("FSC360NEW.Fragment.SuccessPayAppr", this);
    oView.addDependent(this._oSuccessDialog);
  }

  // Set dynamic text
  sap.ui.getCore().byId("id_dynamictest").setText(sMessage);

  // Attach callback on close
  this._oSuccessDialog.attachAfterClose(function() {
    if (callback && typeof callback === "function") {
      callback();
    }
  });

  // Open the dialog
  this._oSuccessDialog.open();
},

fn_closeSuccess: function() {
  if (this._oSuccessDialog) {
    this._oSuccessDialog.close();
  }
}

,
    onPressPDF: function() {
    	
      var arr = [];
      var arr1 = [];
      var final_arr = this.getView().getModel("MProfit").getData();
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
      if (!this.DetailsPDF) {
        this.DetailsPDF = sap.ui.xmlfragment("FSC360NEW.Fragment.DetailsPDF", this);
        this.getView().addDependent(this.DetailsPDF);
      }
      this.DetailsPDF.open();
     
    },
    fn_closedetail: function() {
      if (!this.DetailsPDF) {
        this.DetailsPDF = sap.ui.xmlfragment("FSC360NEW.Fragment.DetailsPDF", this);
        this.getView().addDependent(this.DetailsPDF);
      }
      // sap.ui.getCore().byId("id_smartformcheck").setSelected(false);
      this.DetailsPDF.close();
      	  this.DetailsPDF.destroy(); // Destroy the dialog completely
       this.DetailsPDF = null;  
    },
    fn_docdisplay: function(oEvent) {
      var Docno = oEvent.getSource().getBindingContext('MProfit').getProperty('Belnr');
      var Gjahr = oEvent.getSource().getBindingContext('MProfit').getProperty('Gjahr');
      var Type = oEvent.getSource().getBindingContext('MProfit').getProperty('Type');
      if (Type === 'MIR4') {
        var vUrl = 'https://' + window.location.host + '/sap/bc/gui/sap/its/webgui?~transaction=*MIR4 RBKP-BELNR=' + Docno + ';RBKP-GJAHR=' +
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
    onOpenPDF: function(oEvent) {
      var Venarr = this.getView().getModel("MVen").getData();
      // var smcheck = sap.ui.getCore().byId("id_smartformcheck").getSelected();
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
      // if (smcheck === true) {
      //  ind = 'X';
      // }
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
      for(var i = 0; i<Venarr1.length; i++){
        Venarr.push(parseInt(Venarr1[i].Ven));
      }
      // var smcheck = sap.ui.getCore().byId("id_smartformcheck").getSelected();
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
      // if (smcheck === true) {
      //  ind = 'X';
      // }
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
    fn_close_docimg: function() {
      this.Value5.close();
    },
    	updatePaginatedModel: function() {
			var iStart = (this.iCurrentPage - 1) * this.iRowsPerPage;
			var iEnd = iStart + this.iRowsPerPage;

			var pageData = this.aFilteredData.slice(iStart, iEnd);
			var pagedModel = new sap.ui.model.json.JSONModel();
			pagedModel.setData(pageData);

			this.getView().setModel(pagedModel, "jsDet");
			this.renderPageNumbers();
			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage);

    var oPrevBtn = this.byId("previous");
    var oNextBtn = this.byId("next");

    if (oPrevBtn) {
        oPrevBtn.setVisible(this.iCurrentPage > 1); // Hide if on 1st page
    }
    if (oNextBtn) {
        oNextBtn.setVisible(this.iCurrentPage < iTotalPages); // Hide if on last page
    }
		},
			onNextPage: function() {
					var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
					if (this.iCurrentPage < iTotalPages) {
						this.iCurrentPage++;
						this.updatePaginatedModel();
					}
			},
			onPreviousPage: function() {
				if (this.iCurrentPage > 1) {
					this.iCurrentPage--;
					this.updatePaginatedModel();
				}
		    },
			renderPageNumbers: function() {
			var oPageBox = this.byId("idPageNumbersBox");
			oPageBox.removeAllItems();
			this.getView().byId("id_total_1").setText(parseInt(this.aFilteredData.length));
			// var iTotalPages = Math.ceil(this.aFullData.length / this.iRowsPerPage);
			var iTotalPages = Math.ceil(this.aFilteredData.length / this.iRowsPerPage); // 
			if (iTotalPages <= 1) {

				return;
			}
			var currentPage = this.iCurrentPage;
			var that = this;

		function getPageNumbers(currentPage, totalPages) {
	var pages = [];

	if (totalPages <= 7) {
		// Show all if few pages
		for (var i = 1; i <= totalPages; i++) {
			pages.push(i);
		}
	} else {
		if (currentPage <= 2) {
			// Show first 3, ellipsis, and last 3
			pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
		} else if (currentPage >= totalPages - 1) {
			// Show first 3, ellipsis, and last 3
			pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
		} else {
			// Show start, ellipsis, middle 3, ellipsis, end
			pages.push(1, "...");
			pages.push(currentPage - 1, currentPage, currentPage + 1);
			pages.push("...", totalPages);
		}
	}

	// Remove duplicates and keep order
	return [...new Set(pages)];
}

			function addPageButton(pageNum) {
				var oButton = new sap.m.Button({
					text: pageNum.toString(),
					press: function() {
						that.iCurrentPage = pageNum;
						that.updatePaginatedModel();
					},
					// Add a custom class to all buttons
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

			var pagesToShow = getPageNumbers(currentPage, iTotalPages);

			for (var k = 0; k < pagesToShow.length; k++) {
				var page = pagesToShow[k];
			if (page === "...") {
	var oText = new sap.m.Text({
		text: "...",
		design: "Bold",
		textAlign: "Center",
		width: "2rem"
	});

	var oVBox = new sap.m.VBox({
		items: [oText],
		justifyContent: "Start",  // Align content to the top
		alignItems: "Center",     // Center horizontally
		height: "32px"          // Optional: control total height
	});

	oPageBox.addItem(oVBox);
} else {
	addPageButton(page);
}


			}
		},
		fnSearchField: function(oEvent) {
    var sQuery = oEvent.getSource().getValue(); 
    var oTable = this.byId("id_table");
    var oBinding = oTable.getBinding("rows");
    var oConfig = this.getView().getModel("SearchConfig").getData();

    if (!sQuery) {
        oBinding.filter([]);
        return;
    }

    var aFilters = [];

    // String based filters
    ["Prctr","Belnr","Blart","Lifnr","Name1","Xblnr","Waers","Shkzg"].forEach(function(sField) {
        if (oConfig[sField]) {
            aFilters.push(new sap.ui.model.Filter(sField, sap.ui.model.FilterOperator.Contains, sQuery));
        }
    });

    // Numeric/date → use EQ (can also cast string if needed)
    ["Dmbtr","PayAmount","PartialPaid","Ageing","Reindat","Bldat","Netdt"].forEach(function(sField) {
        if (oConfig[sField]) {
            aFilters.push(new sap.ui.model.Filter(sField, sap.ui.model.FilterOperator.EQ, sQuery));
        }
    });

    var oFilter = new sap.ui.model.Filter({
        filters: aFilters,
        and: false // OR
    });

    oBinding.filter(oFilter);
}

,
// fn_AfterGetPDFOpen: function(oEvent) {
//     var oDialog = oEvent.getSource();
//     oDialog.$().css({
//     	 width: "402px",
//     	  height:"100%",
//         top: "0px",
//         right: "0px",
//         left: "auto",
//         bottom: "0px",
//         transform: "none"
//     });
// },
fn_AfterGetCommentsOpen: function(oEvent) {
    var oDialog = oEvent.getSource();
    oDialog.$().css({
    	 width: "402px",
    	  height:"100%",
        top: "0px",
        right: "0px",
        left: "auto",
        bottom: "0px",
        transform: "none"
    });
}	,
		fnSearchPop: function(oEvent) {
			var oButton = oEvent && oEvent.getSource ? oEvent.getSource() : null;

			if (!oButton) {
				sap.m.MessageToast.show("No source control for popover.");
				return;
			}

			if (!this._PopOverSearch) {
				this._PopOverSearch = sap.ui.xmlfragment("FSC360NEW.fragment.SearchfragPayment", this);
				this.getView().addDependent(this._PopOverSearch);
				sap.ui.getCore().byId("cb_docid").setSelected(true);
			}

			this._PopOverSearch.openBy(oButton);
		},
				openErrorDialog: function (sMessage) {
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
fn_onCloseErrorDialog: function () {
    if (this.ErrorDialog) {
        this.ErrorDialog.close();
    }
}

	});

});