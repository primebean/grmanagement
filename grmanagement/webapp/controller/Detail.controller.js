sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      "sap/f/library"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, library) {
      "use strict";
  
      return Controller.extend("sync.c201.grmanagement.controller.Detail", {
        onInit: function () {
          var oOwnerComponent = this.getOwnerComponent();
  
          this.oRouter = oOwnerComponent.getRouter();
          this.oModel = oOwnerComponent.getModel();
  
          this.oRouter
            .getRoute("Detail")
            .attachPatternMatched(this._onPatternMatched, this);
        },
  
        _onPatternMatched: function (oEvent) {
          var oArguments = oEvent.getParameter("arguments");
          // this.byId("headerKey").setText(sValue);
  
          var oView = this.getView();
  
          oView.setBusy(true);
  
          oView.setModel( new JSONModel(
                {
                    today: new Date(),
                    stroage: {},
                    Strid: {},
                    headerKey : {
                      Plant: oArguments.Plant,
                      Pono: oArguments.Pono,
                      Seqno: oArguments.Seqno
                  }
                }
              ), "detail" );
  
  
          var oModel = this.getOwnerComponent().getModel();
  
          var sPath = oModel.createKey("/GRdataSet", {
              Plant: oArguments.Plant,
              Pono: oArguments.Pono,
              Seqno: oArguments.Seqno
          })
  
          oModel.read(sPath, {
              success: function (oData) {
                oView.getModel('detail')
                      .setProperty('/GRdataSet', oData);   // <== 오브젝트
  
                oView.getModel('detail')
                      .setProperty('/stroage/department', oData.Depid);   // <== 오브젝트
                    //.setProperty('/GRdataSet', [oData]);  <== 배열
  
                var oDetailData = oView.getModel('detail').getProperty('/')
                var aDepartment = [];
                aDepartment = this._getTprodq(aDepartment, oDetailData);
                aDepartment.forEach(function(item) {
                  var sCreateKey = oView.getModel().createKey("/GRdistributionSet", {
                    Plant: oDetailData.GRdataSet.Plant,
                    Prodid: oDetailData.GRdataSet.Prodid,
                    Strid: item.Strid,
  
                  });
  
                  oView.getModel()
                       .read(sCreateKey, {
                          success: function(oData) {
                            oView.getModel('detail')
                                .setProperty('/Strid/'+ item.Strid, oData.Tprodq);   // <== 오브젝트
                          },
                          error: function() {
  
                          }
                       })
                })
  
                oView.setBusy(false);
              }.bind(this),
              error: function() {
  
                oView.setBusy(false);
              }
          }); 
        },
  
        _getTprodq: function(aDepartment, oDetailData) {
  
          switch (oDetailData.stroage.department) {
            case "JFAC" :
              aDepartment = [
                {
                  Strid: "JFACS3B2",
                  Tpurq: oDetailData.stroage.b2 || 0
                }
              ];
              break;
            
            case "JFOD" :
              aDepartment = [
                {
                  Strid: "JFODSFB1",
                  Tpurq: oDetailData.stroage.sf || 0
                },
                {
                  Strid: "JFODSRB1",
                  Tpurq: oDetailData.stroage.sr || 0
                },
                {
                  Strid: "JFODSNB1",
                  Tpurq: oDetailData.stroage.sn || 0
                }
              ];
              break;
  
            case "JMAT" :
              aDepartment = [
                {
                  Strid: "JMATSNF3",
                  Tpurq: oDetailData.stroage.f3 || 0
                },
                {
                  Strid: "JMATSNF6",
                  Tpurq: oDetailData.stroage.f6 || 0
                },
                {
                  Strid: "JMATSNF9",
                  Tpurq: oDetailData.stroage.f9 || 0
                }
              ];
              break;
  
            case "SFAC" :
              aDepartment = [
                {
                  Strid: "SFACS3B2",
                  Tpurq: oDetailData.stroage.b2 || 0
                }
              ];
              break;
  
            case "SFOD" :
              aDepartment = [
                {
                  Strid: "SFODSFB1",
                  Tpurq: oDetailData.stroage.sf || 0
                },
                {
                  Strid: "SFODSRB1",
                  Tpurq: oDetailData.stroage.sr || 0
                },
                {
                  Strid: "SFODSNB1",
                  Tpurq: oDetailData.stroage.sn || 0
                }
              ];
              break;
  
            case "SMAT" :
              aDepartment = [
                {
                  Strid: "SMATSNF3",
                  Tpurq: oDetailData.stroage.f3 || 0
                },
                {
                  Strid: "SMATSNF6",
                  Tpurq: oDetailData.stroage.f6 || 0
                },
                {
                  Strid: "SMATSNF9",
                  Tpurq: oDetailData.stroage.f9 || 0
                }
              ];
  
              break;
            default:
              break;
          }
  
          return aDepartment;
        },
  
        onSave: function () {
          var oView = this.getView();
          var oModel = oView.getModel();
          var oDetailModel = oView.getModel('detail');
          var oDetailData = oDetailModel.getProperty('/');
  
          var msg = '재고 업데이트 완료!';
  
  
          // 지점코드와 제품ID, 창고코드
  
          var aDepartment = [];
  
          aDepartment = this._getTprodq(aDepartment, oDetailData);
  
          var sum = 0;
          Object.keys(oDetailData["stroage"]).forEach(function(list) {
            if(list !== 'department') sum += Number(oDetailData["stroage"][list]);
          });
  
          // 입고 수량  입력 수량
          if(
            Number(oDetailData.GRdataSet.Grprodq) !== Number(sum)
          ) {
            return sap.m.MessageBox.error( '입고 수량과 입력 수량이 같지 않습니다.' );
          }
          
          oView.setBusy(true);
          
  
          var aPromiseMap = aDepartment.map((item) => {
            var oUpdateData = {
              Plant: oDetailData.GRdataSet.Plant,
              Prodid: oDetailData.GRdataSet.Prodid,
              Strid: item.Strid,
              Tprodq: (parseInt(oDetailData["Strid"][item.Strid]) + parseInt(item.Tpurq)).toString()
            };
  
            var sCreateKey = oModel.createKey("/GRdistributionSet", {
              Plant: oUpdateData.Plant,
              Prodid: oUpdateData.Prodid,
              Strid: oUpdateData.Strid
            });
  
            return this._getPromise(oModel, sCreateKey, oUpdateData);
          });
  
          aPromiseMap.push(
            this._getPromise(
              oModel, 
              oModel.createKey("/GRdataSet",oDetailData.headerKey),
              {
                Plant: oDetailData.GRdataSet.Plant,
                Prodid: oDetailData.GRdataSet.Prodid,
                Pono:  oDetailData.GRdataSet.Pono,
                Seqno: oDetailData.GRdataSet.Seqno
              })
          );
          
          Promise.all(aPromiseMap).then(function() {
  
  
            sap.m.MessageBox.success(msg);    
            oView.setBusy(false);
  
            this.getView()
                .getParent()
                .getParent()
                .setLayout(library.LayoutType.OneColumn);
            
  
            this.getOwnerComponent()
                .getRouter()
                .navTo('Main', {
                  layout: 'OneColumn'
                });
          }.bind(this));
        },
  
        _getPromise: function(oModel, sCreateKey, oUpdateData) {
          return new Promise((resolve, reject) => {
            oModel.update(
              sCreateKey,
              oUpdateData,
              {
                success: function() {
                  resolve('ok');
                },
                error: function() {
                  resolve('error');
                }
              }
            )
          });
        },
  
        /**
         * 부서 변경시 초기화 작업.
         */
        onDepartmentChange: function() {
          var oView = this.getView();
          var oModel = oView.getModel();
          var oDetailModel = oView.getModel('detail');
          var oDetailData = oDetailModel.getProperty('/');
  
          oDetailData.stroage = {
            department: oDetailData.stroage.department
          };
  
          oDetailModel.setProperty('/', oDetailData);
        }
      });
    }
  );