sap.ui.define(
    ["sap/ui/core/mvc/Controller",
     "sap/f/library",
     "sap/ui/model/json/JSONModel",
     "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
    ],
    
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, library, JSONModel, Filter, FilterOperator) {
      "use strict";
  
      return Controller.extend("sync.c201.grmanagement.controller.Main", {
        onInit: function () {          
          this.oRouter = this.getOwnerComponent().getRouter();

          var oData = {
            oTableData : [],
            sSearchPlant : null,
            sSearchPono  : null,
            sSearchSeqno : null
          }
          var oDataModel = new JSONModel(oData);
          this.getView().setModel(oDataModel, "Main");

          this.oRouter.attachRoutePatternMatched( this._onPatternMatched, this );

        },

        _onPatternMatched: function() {
          var oModel =  this.getView().getModel();
          var oViewModel = this.getView().getModel("Main")
          var oFilter1 = new Filter("Plant", FilterOperator.EQ, 'S');
          var oFilter2 = new Filter("Pono",  FilterOperator.EQ, 'SO000029');
          var oFilter3 = new Filter("Seqno", FilterOperator.EQ, '100');
    
          var aFilters = [];
    
          aFilters.push(oFilter1, oFilter2, oFilter3);
          
          oModel.read("/GRdataSet", {
            success: function(oModelData){
              var data = oModelData; 
              var aData = data.results;
              var oData = [];

              oData.push(aData);
              
              oViewModel.setProperty("/oTableData", aData);
            }
          })
        },
  
        /**
         * 아이템 클릭 시 Detail View로 이동
         */
        onListItemPress: function (oEvent) {
          var oNextUIState = this.getOwnerComponent()
            .getHelper()
            .getNextUIState(1);
  
          this.oView
            .getParent()
            .getParent()
            .setLayout(library.LayoutType.TwoColumnsMidExpanded);

          var oControl = oEvent.getSource(), // oControl = Selected Item
              oBindingContext = oControl.getBindingContext('Main'), // oBinding = binding info
              sPath = oBindingContext.getPath();  // binding path -> /table/0/aaa

          var oMainData = oControl.getModel('Main').getProperty(sPath); // get Data

          this.oRouter.navTo("Detail", {
              layout: oNextUIState.layout,
              Plant: oMainData.Plant,
              Pono: oMainData.Pono,
              Seqno: oMainData.Seqno
          });
        },

        onSearch:function(){
          var oViewModel = this.getView().getModel("Main");
          var sSearchPlant = oViewModel.getProperty("/sSearchPlant");
          var sSearchPono  = oViewModel.getProperty("/sSearchPono");
          var sSearchSeqno = oViewModel.getProperty("/sSearchSeqno");

          var oTable = this.getView().byId("GRTable"); 
          var oBinding = oTable.getBinding("items"); 

          var aFilter = [];

          if(sSearchPlant){
            var oFilter = new Filter ({
                path : 'Plant', 
                operator: FilterOperator.Contains,
                value1: sSearchPlant,
                caseSensitive : false
            });
            aFilter.push(oFilter)
          }

          if(sSearchPono){
            var oFilter = new Filter ({
                path : 'Pono', 
                operator: FilterOperator.Contains,
                value1: sSearchPono,
                caseSensitive : false
            });
            aFilter.push(oFilter)
          }
          
          if(sSearchSeqno){
            var oFilter = new Filter ({
                path : 'Seqno', 
                operator: FilterOperator.Contains,
                value1: sSearchSeqno,
                caseSensitive : false
            });
            aFilter.push(oFilter)
          }

          oBinding.filter(aFilter);
        },

        onTest: function(){
          var oViewModel = this.getView().getModel("Main");
        }

      });
    }
  );
  