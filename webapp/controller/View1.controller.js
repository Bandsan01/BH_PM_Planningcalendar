sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
],
	function (Controller, coreLibrary, Fragment, DateFormat, JSONModel, unifiedLibrary, mobileLibrary, MessageToast, Filter) {
		"use strict";

		var CalendarDayType = unifiedLibrary.CalendarDayType;
		var ValueState = coreLibrary.ValueState;
		var StickyMode = mobileLibrary.PlanningCalendarStickyMode;

		return Controller.extend("com.app.zuiplanningcalender.controller.View1", {
			onInit: function () {

				var oModel = new JSONModel();
				oModel.setData({ allDay: false });
				this.getView().setModel(oModel, "allDay");

				oModel = new JSONModel();
				oModel.setData({ stickyMode: StickyMode.None, enableAppointmentsDragAndDrop: true, enableAppointmentsResize: true, enableAppointmentsCreate: true });
				this.getView().setModel(oModel, "settings");
				var firstday = new Date();
				var lastday = new Date();
				this.getdetails(firstday, lastday);

			},

			getdetails: function (firstday, lastday) {
				var oModel1 = this.getOwnerComponent().getModel();
				//var Filter2 = new Filter('Startdate', 'EQ', "2024-12-01T00:00:00");
				var Filter3 = new Filter('Enddate', 'EQ', "2024-12-30T00:00:00");
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT23:59:00"
				});
				var Filter1 = new Filter('Iwerk', 'EQ', "0595");
				var Filter2 = new Filter('Startdate', 'EQ', dateFormat.format(firstday));
				var Filter3 = new Filter('Enddate', 'EQ', dateFormat1.format(lastday));
				var ofilter = [Filter1, Filter2, Filter3];
				var entity = "/GetPMCalendarSet"
				//	var entity = "/GetPMCalendarSet?$filter=(Iwerk eq '0595' and Startdate eq datetime'2024-12-18T00:00:00' and Enddate eq datetime'2024-12-23T00:00:00')";

				var that = this;
				//var arr = [];
				///var arr1 = [];
				var appointments = []
				oModel1.read(entity, {
					filters: ofilter,
					"async": true,
					"success": function (oData) {
						
						const dateFrmtst = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "yyyy-MM-ddT00:00:00"
						});
						const dateFrmtend = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "yyyy-MM-ddT23:59:00"
						});

						for (var i = 0; i < oData.results.length; i++) {
							var data = {
								title: oData.results[i].Equnr,
								startDate: new Date(dateFrmtst.format(oData.results[i].Enddate)),
								endDate: new Date(dateFrmtend.format(oData.results[i].Enddate)),
								Warpl: oData.results[i].Warpl,
								Wapos: oData.results[i].Wapos,
								Laufn: oData.results[i].Laufn
							};
							//arr.push();
							appointments.push(data);
						}
						var appointments1 = { startDate: new Date(), appointments }
						var newDat = new Date();
						// var newDat1 = dateFormat.format(newDat).split('-')
						// var startDate = UI5Date.getInstance(newDat1[2], newDat1[1], newDat1[0]);
						that.calModel = new JSONModel([]);
						that.calModel.setData(appointments1)
						that.getView().setModel(that.calModel);
					},
					"error": function (oError) {

					}
				});
			},
			handleViewChange: function (evt) {
				var selectedItm = evt.getSource().getSelectedView();
				//this.firstday = ""lastday = "";
				switch (selectedItm) {
					case "__view0":
						///   var date = new Date();
						var firstday = new Date();
						var lastday = new Date();
						this.getdetails(firstday, lastday);
						break;
					case "__view1":
						var curr = new Date;
						var first = (curr.getDate() - curr.getDay()) + 1;
						var last = first + 4;
						var firstday1 = new Date(curr.setDate(first));
						var lastday1 = new Date(curr.setDate(last));
						this.getdetails(firstday1, lastday1);
						break;
					case "__view2":
						var curr = new Date; // get current date
						var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
						var last = first + 6; // last day is the first day + 6
						var firstday2 = new Date(curr.setDate(first));
						var lastday2 = new Date(curr.setDate(last));
						this.getdetails(firstday2, lastday2);
						break;
					case "__view3":
						var date = new Date();
						var firstDay3 = new Date(date.getFullYear(), date.getMonth(), 1);
						var lastDay3 = new Date(date.getFullYear(), date.getMonth() + 1, 0);
						this.getdetails(firstDay3, lastDay3);
						break;
				}

			},

			handleStartDateChange : function(oEvent){
				var oStartDate = oEvent.getParameter("date");
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate,
					oEndDate,
					oTrimmedStartDate,
					oTrimmedEndDate,
					bAllDate,
					oModel,
					oView = this.getView();

				if (oAppointment === undefined) {
					return;
				}
				// var oView = this.getView();
				// if (!this._pValueHelpDialog) {
				// 	this._pValueHelpDialog = Fragment.load({
				// 		id: oView.getId(),
				// 		name: "com.app.zuiplanningcalender.Fragment.Details",
				// 		controller: this
				// 	}).then(function (oValueHelpDialog) {
				// 		oView.addDependent(oValueHelpDialog);
				// 		return oValueHelpDialog;
				// 	});
				// }
				// this._pValueHelpDialog.then(function (oValueHelpDialog) {
				// 	oValueHelpDialog.open();
				// }.bind(this));
				// oStartDate = oAppointment.getStartDate();
				// oEndDate = oAppointment.getEndDate();
				// oTrimmedStartDate = UI5Date.getInstance(oStartDate);
				// oTrimmedEndDate = UI5Date.getInstance(oEndDate);
				// bAllDate = false;
				// oModel = this.getView().getModel("allDay");

				if (!oAppointment.getSelected() && this._pDetailsPopover) {
					this._pDetailsPopover.then(function (oResponsivePopover) {
						oResponsivePopover.close();
					});
					return;
				}

				// this._setHoursToZero(oTrimmedStartDate);
				// this._setHoursToZero(oTrimmedEndDate);

				// if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
				// 	bAllDate = true;
				// }

				// oModel.getData().allDay = bAllDate;
				// oModel.updateBindings();

				if (!this._pDetailsPopover) {
					this._pDetailsPopover = Fragment.load({
						id: oView.getId(),
						name: "com.app.zuiplanningcalender.Fragment.Details",
						controller: this
					}).then(function (oResponsivePopover) {
						oView.addDependent(oResponsivePopover);
						return oResponsivePopover;
					});
				}
				this._pDetailsPopover.then(function (oResponsivePopover) {
					oResponsivePopover.setBindingContext(oAppointment.getBindingContext());
					oResponsivePopover.openBy(oAppointment);
				});
			},

			handleMoreLinkPress: function (oEvent) {
				var oDate = oEvent.getParameter("date"),
					oSinglePlanningCalendar = this.getView().byId("SPC1");
				oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[2]); // DayView
				this.getView().getModel().setData({ startDate: oDate }, true);
			}
		});
	});
