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
				this.firstday = new Date();
				this.lastday = new Date();
				this.ind = "";
				var serviceurl = "/sap/opu/odata/sap/ZC_PM_GETPLANT_CDS/";
				var oModelF4 = new sap.ui.model.odata.ODataModel(serviceurl);
				var entity = "/ZC_PM_GETPLANT"
				var that = this;
				oModelF4.read(entity, {
					method: "GET",
					success: function (oData) {
						that.selectedPlant = oData.results[0].Plant;
						var f4Model = new JSONModel([]);
						f4Model.setData(oData.results);
						that.getView().setModel(f4Model, "F4Data");
						that.getdetails(that.firstday, that.lastday);
					},
					error: function (e) {
						alert("error");
					}
				})
			},
			onChange: function (evt) {
				this.selectedPlant = evt.oSource.getSelectedKey();
				if (this.ind === "") {
					this.getdetails(this.firstday, this.lastday);
				} else {
					this.getdetails1(this.firstday, this.lastday);
				}
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
				var Filter1 = new Filter('Iwerk', 'EQ', this.selectedPlant);
				var Filter2 = new Filter('Startdate', 'EQ', dateFormat.format(firstday));
				var Filter3 = new Filter('Enddate', 'EQ', dateFormat1.format(lastday));
				var ofilter = [Filter1, Filter2, Filter3];
				var entity = "/GetPMCalendarSet"
				var that = this;
				var appointments = []
				oModel1.read(entity, {
					filters: ofilter,
					"async": true,
					"success": function (oData) {
						const dateFrmtst = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "yyyy-MM-ddT01:00:00"
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
						that.calModel = new JSONModel([]);
						that.calModel.setData(appointments1)
						that.getView().setModel(that.calModel);
					},
					"error": function (oError) {

					}
				});
			},
			handleViewChange: function (evt) {
				this.ind = "";
				var a = this.getView().byId("SPC1");
				var selectedItm = evt.getSource().getSelectedView().split("--")[2];
				switch (selectedItm) {
					case "ID1":
						this.firstday = new Date();
						this.lastday = new Date();
						this.getdetails(this.firstday, this.lastday);
						break;
					case "ID2":
						var curr = new Date;
						var first = (curr.getDate() - curr.getDay()) + 1;
						var last = first + 4;
						this.firstday = new Date(curr.setDate(first));
						this.lastday = new Date(curr.setDate(last));
						this.getdetails(this.firstday, this.lastday);
						break;
					case "ID3":
						var curr = new Date; // get current date
						var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
						var last = first + 6; // last day is the first day + 6
						this.firstday = new Date(curr.setDate(first));
						this.lastday = new Date(curr.setDate(last));
						this.getdetails(this.firstday, this.lastday);
						break;
					case "ID4":
						var date = new Date();
						this.firstday = new Date(date.getFullYear(), date.getMonth(), 1);
						this.lastday = new Date(date.getFullYear(), date.getMonth() + 1, 0);
						this.getdetails(this.firstday, this.lastday);
						break;
				}

			},

			handleStartDateChange: function (oEvent) {
				this.ind = "X";
				var oStartDate = oEvent.getParameter("date");
				var selectedView = oEvent.getSource().getSelectedView().split("--")[2];
				//this.firstday = ""lastday = "";
				switch (selectedView) {
					case "ID1":
						///   var date = new Date();
						this.firstday = new Date(oStartDate);
						this.lastday = new Date(oStartDate);
						this.getdetails1(this.firstday, this.lastday);
						break;
					case "ID2":
						var curr = oStartDate;
						var first = (curr.getDate() - curr.getDay()) + 1;
						var last = first + 4;
						this.firstday = new Date(curr.setDate(first));
						this.lastday = new Date(curr.setDate(last));
						this.getdetails1(this.firstday, this.lastday);
						break;
					case "ID3":
						var curr = oStartDate; // get current date
						var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
						var last = first + 6; // last day is the first day + 6
						this.firstday = new Date(curr.setDate(first));
						this.lastday = new Date(curr.setDate(last));
						this.getdetails1(this.firstday, this.lastday);
						break;
					case "ID4":
						var date = oStartDate;
						this.firstday = new Date(date.getFullYear(), date.getMonth(), 1);
						this.lastday = new Date(date.getFullYear(), date.getMonth() + 1, 0);
						this.getdetails1(this.firstday, this.lastday);
						break;
				}

			},


			getdetails1: function (firstday, lastday) {
				var oModel1 = this.getOwnerComponent().getModel();
				//var Filter2 = new Filter('Startdate', 'EQ', "2024-12-01T00:00:00");
				var Filter3 = new Filter('Enddate', 'EQ', "2024-12-30T00:00:00");
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT23:59:00"
				});
				var Filter1 = new Filter('Iwerk', 'EQ', this.selectedPlant);
				var Filter2 = new Filter('Startdate', 'EQ', dateFormat.format(firstday));
				var Filter3 = new Filter('Enddate', 'EQ', dateFormat1.format(lastday));
				var ofilter = [Filter1, Filter2, Filter3];
				var entity = "/GetPMCalendarSet"
				var that = this;
				var appointments = []
				oModel1.read(entity, {
					filters: ofilter,
					"async": true,
					"success": function (oData) {

						const dateFrmtst = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "yyyy-MM-ddT01:00:00"
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
						var appointments1 = { startDate: new Date(firstday), appointments }
						//var newDat = new Date();
						that.calModel = new JSONModel([]);
						that.calModel.setData(appointments1)
						that.getView().setModel(that.calModel);
					},
					"error": function (oError) {

					}
				});
			},

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oView = this.getView();
				if (oAppointment === undefined) {
					return;
				}

				if (!oAppointment.getSelected() && this._pDetailsPopover) {
					this._pDetailsPopover.then(function (oResponsivePopover) {
						oResponsivePopover.close();
					});
					return;
				}

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
				oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[0]); // DayView
				this.getView().getModel().setData({ startDate: oDate }, true);
			},
			onExit: function () {
				this.getView().byId("SPC1").destroy();
			}
		});
	});
