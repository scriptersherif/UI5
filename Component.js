sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "FSC360NEW/model/models"
], function (UIComponent, Device, models) {
    "use strict";
 
    return UIComponent.extend("FSC360NEW.Component", {
 
        metadata: {
            manifest: "json"
        },
 
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
            this.setModel(models.createDeviceModel(), "device");
 
            this._loadInitialData();
        },
 
        _loadInitialData: function () {
            var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
            var that = this;
 
            oModel.read("/DEEPHEADSet", {
                urlParameters: {
                    $expand: "NavDomain"
                },
                success: function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        var oUserModel = new sap.ui.model.json.JSONModel(oData.results[0]);
                        // Set model globally
                        sap.ui.getCore().setModel(oUserModel, "JSusername");
                        // or on component if you prefer
                        that.setModel(oUserModel, "JSusername");
                    }
                },
                error: function () {
                    sap.m.MessageBox.error("HTTP Error while loading user data.");
                }
            });
        }
    });
});