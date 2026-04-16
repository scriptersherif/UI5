sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"FSC360NEW/model/formatter",
	"sap/ui/core/library",
	"sap/ui/unified/library",
	"sap/ui/unified/DateTypeRange",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/viz/ui5/controls/VizTooltip',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator"
], function(Controller, Sorter, Filter, FilterOperator, formatter, CoreLibrary, UnifiedLibrary, DateTypeRange, ChartFormatter, Format,
	VizTooltip,
	DateFormat, JSONModel, BusyIndicator) {
	"use strict";
	var splited_ids;
	var oFloatFormat;
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var JMTop5 = [];
	var RevenueVb, ExpenseVb, PayableVb, ReceivableVb, CashVb, OverdueVb, InvoiceVb, WeekpayVb, JRev, vIndex = [],
		JDue,
		FCount;
	var UserType = "";
	var arrTable = [];
	var FilterParameter = "";
	var Capop;
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var barchart_info;
	var bVendorSortAsc = true;
	var Docid = "";
	var QueueID = "";
	var PrevQid = "";
	var previousYear = "";
	var currentYear = "";
	return Controller.extend("FSC360NEW.controller.Dashboard", {
		formatIndianNumber: function(num) {
			if (num >= 10000000) {
				return (num / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
			} else if (num >= 100000) {
				return (num / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
			} else if (num >= 1000) {
				return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'k';
			}
			return num.toString();
		},

		onInit: function() {

			currentYear = new Date().getFullYear();
			previousYear = currentYear - 1;
			var oRouter = this.getOwnerComponent().getRouter();
		

			this.getOwnerComponent().getRouter()
				.getRoute("Dashboard")
				.attachPatternMatched(this._onRouteMatched, this);

			OverdueVb = this.byId("id_overduevb");
			//this.byId("id_payBlockBox").attachBrowserEvent("click", this.onPayBlockBoxClick, this);
			this.byId("tat_analysis_donut").attachBrowserEvent("click", this.onTatanalysisClick, this);
			this.byId("idCardTotal").attachBrowserEvent("click", this.onTotalCardClick, this);
			this.byId("idCardWithYou").attachBrowserEvent("click", this.onWithYouCardClick, this);
			this.byId("idCardUnassign").attachBrowserEvent("click", this.onUnassignCardClick, this);
			this.byId("idCardOntime").attachBrowserEvent("click", this.onOntimeCardClick, this);
			this.byId("idCardToday").attachBrowserEvent("click", this.onTodayCardClick, this);
			this.byId("idCardThisWeek").attachBrowserEvent("click", this.onThisWeekCardClick, this);
			this.byId("idCardNextWeek").attachBrowserEvent("click", this.onNextWeekCardClick, this);
		
			this.aFullData = [];
			this.iRowsPerPage = 4;
			this.iCurrentPage = 1;
			var today = new Date();
			var dd = today.getDate();
			var MM = today.getMonth() + 1;
			var yyyy = today.getFullYear();
			barchart_info = this.byId("barchart_info");
			today = dd + '/' + MM + '/' + yyyy;
			// Initialize global date range (default to current month)
			var oToday = new Date();
			this._grnFromDate = this.formatDateToYYYYMMDD(new Date(oToday.getFullYear(), oToday.getMonth(), 1));
			this._grnToDate = this.formatDateToYYYYMMDD(new Date(oToday.getFullYear(), oToday.getMonth() + 1, 0));
			// this.getView().byId("id_date").setText(today);

			var oModel = new sap.ui.model.json.JSONModel();
		
			// this.fn_LoadData();
			this.aFilterFields = ["Qid"]; // Default to Queue Id
			this.getView().byId("id_search_field").setPlaceholder("Search by Queue Id");

			var oTemplateModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/", {

			});
			this.getView().setModel(oTemplateModel, "TemplateModel");
			const aColumnMeta = [{
				key: "Qid",
				label: "QID",
				visible: true
			}, {
				key: "Qiddate",
				label: "Invoice Date",
				visible: true
			}, {
				key: "Qidtime",
				label: "Created Time",
				visible: true
			}, {
				key: "Invbtn",
				label: "Scan Copy",
				visible: true
			}, {
				key: "Invno",
				label: "Invoice No",
				visible: true
			}, {
				key: "Invdesc",
				label: "Type",
				visible: true
			}, {
				key: "Name1",
				label: "Vendor Name",
				visible: true
			}, {
				key: "Bukrs",
				label: "Company Code",
				visible: true
			}, {
				key: "Username",
				label: "Agent",
				visible: true
			}, {
				key: "Ntamt",
				label: "Amount",
				visible: false
			}, {
				key: "Waers",
				label: "Currency",
				visible: false
			}, {
				key: "Mwskz",
				label: "Tax Code",
				visible: false
			}, {
				key: "Bupla",
				label: "Business Place",
				visible: false
			}, {
				key: "Secco",
				label: "Section Code",
				visible: false
			}, {
				key: "Lifnr",
				label: "Vendor Code",
				visible: false
			}, {
				key: "Werks",
				label: "Plant",
				visible: false
			}, {
				key: "DisplayStatus",
				label: "Status",
				visible: false
			}];
			this.getView().byId("id_table_width").setWidth("100%");
			const oColModel = new sap.ui.model.json.JSONModel(aColumnMeta);
			this.getView().setModel(oColModel, "FilterTableModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				selectedTemplate: "",
				templates: [],
				forceFullWidth: false
			}), "viewModel1");

			this.getView().setModel(oModel);

			var that = this;
			["1", "2", "3", "4", "5"].forEach(function(i) {
				that.byId("id_glLegend" + i).addEventDelegate({
					onmouseover: that["_showGLPopover" + i],
					onmouseout: that._clearGLPopover
				}, that);
			});

			barchart_info.attachBrowserEvent("click", this.barchartClick, this);

		},
		fn_fulfillrefresh: function() {
			location.reload();
		},
		fnAdvancePOchart: function(aData, nameMap) {
			const el = document.querySelector("#advanceBarChart");
			if (!el) return;

			el.innerHTML = "";
			el.style.height = "165px";
			el.style.width = "100%";

			const values = aData.map(obj => parseFloat(obj.y));
			const labels = aData.map(obj => obj.x);

			// Add total calculation
			const totalAmount = values.reduce((sum, val) => sum + val, 0);
			let sFormattedAmount = "";

			if (totalAmount >= 10000000) {
				sFormattedAmount = "₹ " + (totalAmount / 10000000).toFixed(2) + " Cr";
			} else if (totalAmount >= 100000) {
				sFormattedAmount = "₹ " + (totalAmount / 100000).toFixed(2) + " L";
			} else {
				sFormattedAmount = "₹ " + totalAmount.toLocaleString('en-IN', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
			}

			const oText = this.byId("idAdvancePOTotal");
			if (oText) {
				oText.setText(sFormattedAmount);
			}

			let maxY = Math.max(...values) || 0;
			maxY = Math.ceil(maxY / 1000) * 1000;

			const capPixelHeight = 4; // e.g., 4px visually

			const yRange = maxY - 0; // your chart's value range
			const chartPixelHeight = 164; // your chart's height in px
			const fixedCapHeight = (capPixelHeight / chartPixelHeight) * yRange;

			const capValues = values.map(v => Math.min(v, fixedCapHeight));
			const patternValues = values.map(v => v - Math.min(v, fixedCapHeight));

			const options = {
				chart: {
					type: 'bar',
					stacked: true,
					height: 164,
					width: '105%',
					toolbar: {
						show: false
					},
					fontFamily: 'Geist, sans-serif',
					offsetX: -10,
					offsetY: -2
				},
				legend: {
					show: false // ← This hides "Pattern" and "Cap" in legend
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '46%',
						endingShape: 'flat'
					}
				},
				series: [{
					name: 'Pattern',
					data: patternValues
				}, {
					name: 'Cap',
					data: capValues
				}],
				xaxis: {
					categories: labels,
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist'
						},
						offsetY: -5
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					min: 0,
					max: maxY,
					tickAmount: 5,
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2'
						},
						formatter: function(val) {
							if (val >= 10000000) {
								return (val / 10000000).toFixed(0) + "Cr";
							} else if (val >= 100000) {
								return (val / 100000).toFixed(0) + "L";
							} else if (val >= 1000) {
								return (val / 1000).toFixed(0) + "K";
							} else {
								return val.toString();
							}
						}
					}
				},
				dataLabels: {
					enabled: false
				},
				fill: {
					type: ['pattern', 'solid'],
					pattern: {
						style: 'horizontalLines',
						width: 1,
						height: 2,
						strokeWidth: 1
					},
					colors: ['#4DB151', '#4DB151'] // pattern + cap
				},
				grid: {
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					},
					padding: {
						top: 5,
						bottom: 5
					}
				},
				tooltip: {
					enabled: true,
					fixed: {
						enabled: true,
						position: 'topLeft',
						offsetX: 0,
						offsetY: 0
					},
					marker: {
						show: false
					},
					y: {
						formatter: function(val, {
							dataPointIndex
						}) {
							const lifnr = aData[dataPointIndex].x;
							const name = nameMap[lifnr] || lifnr;
							return `${name}<br>₹${val.toLocaleString('en-IN')}`;
						},
						title: {
							formatter: () => ''
						}
					}
				}
			};

			const chart = new ApexCharts(el, options);
			chart.render();
		},
		fnLocationWiseChart: function() {
			const that = this;
			const oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/PlantSpendSet", {
				filters: [
					new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					const aChartData = oData.results.map(item => ({
						x: item.Plant,
						y: parseFloat(item.Amount)
					}));

					that._renderLocationChart(aChartData);
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					// console.error("Failed to fetch plant spend data", oError);
				}
			});
		},
		_onRouteMatched: function() {
			this.byId("id_search_field").setValue("");
			this.fn_close_pdf();
			this.fnIncomeExpenseCall();
			var oSelect = this.byId("idFilterSelect");
			oSelect.setSelectedKey("thisMonth");

			this.onFilterChange({
				getSource: function() {
					return oSelect;
				}
			});
		},
		// Below one commented for tootip changes
// 		fn_tatchart: function (aChartData) {
//     const canvas = this.byId("donutChart").getDomRef();
//     const ctx = canvas.getContext("2d");

//     const labels = aChartData.map(item => item.Status);
//     const values = aChartData.map(item => item.Count);

//     const maxValue = Math.max(...values) * 1.1;

//     const data = {
//         labels: labels,
//         datasets: [
//             // Background track (light bar)
           
//             // Actual value bar
//             {
//                 data: values,
//                 backgroundColor: '#8979FF',
//                 barThickness: 10,
//                 borderRadius: 4,
//                 grouped: false
                  
//             },
//               {
//                 data: new Array(values.length).fill(maxValue),
//                 backgroundColor: '#E6E9F5',
//                 barThickness: 10,
//                 borderRadius: 1,
//                 grouped: false
//             }
//         ]
//     };

//     const options = {
//         responsive: true,
//         maintainAspectRatio: false,
//         indexAxis: 'y',
//           layout: {
//         padding: {
//             left: 16   // 👈 creates the left gap like your TAT Analysis card
//         }
//     },
//         plugins: {
//             legend: { display: false },
//             tooltip: { enabled: true }
//         },
//         scales: {
//             // x: {
//             //     min: 0,
//             //     max: maxValue,
//             //     grid: {
//             //         color: '#D9D9E3',
//             //         borderDash: [2, 4],     // ✅ DOTTED LINES
//             //         drawBorder: false
//             //     },
//             //     ticks: {
//             //         color: '#000000B2',
//             //         font: {
//             //             family: 'Geist',
//             //             size: 9,
//             //             weight: '500'
//             //         }
//             //     }
//             // },
//             x: {
//     min: 0,
//     max: maxValue,
//     grid: {
//         color: '#D9D9E3',
//         borderDash: [2, 4],
//         drawBorder: false
//     },
//     ticks: {
//         callback: function (value) {
//             return Number(value).toFixed(1);   // one decimal only for no decimalmake i as 0 mano
//         },
//         color: '#000000B2',
//         font: {
//             family: 'Geist',
//             size: 9,
//             weight: '500'
//         }
//     }
// },
//             y: {
//                 grid: {
//                     display: false
//                 },
//                 ticks: {
//                     autoSkip: false,
//                     color: '#000000B2',
//                     font: {
//                         family: 'Geist',
//                         size: 11,
//                         weight: '500'
//                     }
//                 }
//             }
//         }
//     };

//     if (this.donutChart) {
//         this.donutChart.destroy();
//     }

//     this.donutChart = new Chart(ctx, {
//         type: 'bar',
//         data: data,
//         options: options
//     });
// },
// fn_tatchart: function (aChartData) {
//     const canvas = this.byId("donutChart").getDomRef();
//     const ctx = canvas.getContext("2d");

//     const labels = aChartData.map(item => item.Status);
//     const values = aChartData.map(item => item.Count);

//     const data = {
//         labels: labels,
//         datasets: [{
//             label: "TAT Count",
//             data: values,
//             backgroundColor: ["#8979FF"
                
//             ],
//             borderRadius: 4,
//             barThickness: 4
//         }]
//     };

//     const options = {
//         responsive: true,
//         maintainAspectRatio: false,
//         indexAxis: 'y',   // ✅ Horizontal bars
//         plugins: {
//             legend: {
//                 display: false
//             },
//             tooltip: {
//                 enabled: true
//             }
//         },
//         scales: {
//             x: {
//                 beginAtZero: true,
//                 grid: {
//                     display: false
//                 }
//             },
//             y: {
//                 ticks: {
//                     autoSkip: false   // ✅ show all 7 labels
                    
//                 },
//                 grid: {
//                     display: false
//                 }
//             }
//         }
//     };

//     if (this.donutChart) {
//         this.donutChart.destroy();
//     }

//     this.donutChart = new Chart(ctx, {
//         type: 'bar',
//         data: data,
//         options: options
//     });
// },
// fn_tatchart: function (aChartData) {
//     const canvas = this.byId("donutChart").getDomRef();
//     const ctx = canvas.getContext("2d");

//     const labels = aChartData.map(item => item.Status);
//     const values = aChartData.map(item => item.Count);

//     const data = {
//         labels: labels,
//         datasets: [{
//             data: values,
//             backgroundColor: "#8979FF",
//             borderRadius: 4,
//             barThickness: 6
//         }]
//     };

//     const options = {
//         responsive: true,
//         maintainAspectRatio: false,
//         indexAxis: 'y',
//         plugins: {
//             legend: {
//                 display: false
//             }
//         },
//         scales: {
//             x: {
//                 beginAtZero: true,
//                 grid: {
//                     display: false
//                 },
//                 ticks: {
//                     autoSkip: false,
//                     color: '#000000B2',
//                     font: {
//                         family: 'Geist',   // ✅ SAME AS APEX
//                         size: 9,           // ✅ NUMBER, NOT '9px'
//                         weight: '500'
//                     }
//                 }
//             },
//             y: {
//                 grid: {
//                     display: false
//                 },
//                 ticks: {
//                     autoSkip: false,
//                     color: '#000000B2',
//                     font: {
//                         family: 'Geist',   // ✅ SAME AS APEX
//                         size: 11,          // ✅ NUMBER
//                         weight: '500'
//                     },
//                     callback: function(value) {
//                         const label = labels[value];
//                         return label && label.length > 13
//                             ? label.substring(0, 13) + '...'
//                             : label;
//                     }
//                 }
//             }
//         }
//     };

//     if (this.donutChart) {
//         this.donutChart.destroy();
//     }

//     this.donutChart = new Chart(ctx, {
//         type: 'bar',
//         data: data,
//         options: options
//     });
// },
		// fn_tatchart: function(aChartData) {
		// 	const canvas = this.byId("donutChart").getDomRef();
		// 	// console.log(canvas);
		// 	const ctx = canvas.getContext("2d");

		// 	const labels = aChartData.map(item => item.Status);
		// 	const values = aChartData.map(item => item.Count);

		// 	const data = {
		// 		labels: labels,
		// 		datasets: [{
		// 			data: values,
		// 			backgroundColor: [
		// 				"#DF119D", " #C00E9D", "#82099D", "#82099D", "#44039D", "#44039D", "#25009D"
		// 			],
		// 			borderWidth: 0.5
		// 		}]
		// 	};

		// 	const options = {
		// 		cutout: "53%",
		// 		responsive: true,
		// 		maintainAspectRatio: false,
		// 		plugins: {
		// 			legend: {
		// 				display: false
		// 			},
		// 			tooltip: {
		// 				enabled: true
		// 			}
		// 		},
		// 		rotation: 180
		// 	};

		// 	if (this.donutChart) {
		// 		this.donutChart.destroy();
		// 	}

		// 	this.donutChart = new Chart(ctx, {
		// 		type: 'doughnut',
		// 		data: data,
		// 		options: options
		// 	});

		// 	// You can calculate total or pass a separate value
		// 	const total = values.reduce((sum, val) => sum + val, 0);
		// 	this.byId("idCenterValue").setText(total.toString());
		// },
			fn_tatchart: function (aChartData) {
    const canvas = this.byId("donutChart").getDomRef();
    const ctx = canvas.getContext("2d");

    const labels = aChartData.map(item => item.Status);
    const values = aChartData.map(item => item.Count);

    const maxValue = Math.max(...values) * 1.1;

    const data = {
        labels: labels,
        datasets: [
            // Background track (light bar)
           
            // Actual value bar
            {
                data: values,
                backgroundColor: '#8979FF',
                barThickness: 10,
                borderRadius: 4,
                grouped: false
                  
            },
              {
                data: new Array(values.length).fill(maxValue),
                backgroundColor: '#E6E9F5',
                barThickness: 10,
                borderRadius: 1,
                grouped: false
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        plugins: {
  legend: { display: false },

  tooltip: {
    backgroundColor: "#ffffff",
    titleColor: "#000000",
    bodyColor: "#000000",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    cornerRadius: 6,
    padding: 10,
    displayColors: false,

    callbacks: {
      // Title → Status name (Y-axis label)
      title: function (tooltipItems) {
        return tooltipItems[0].label;
      },

      // Body → Count value (ignore background bar)
      //label: function (context) {
      //  if (context.datasetIndex !== 0) {
      //    return null; // 🚫 hide tooltip for background track
      //  }
      //  return "Count: " + context.parsed.x.toFixed(1);
      //}
    }
  }
},
        scales: {
            // x: {
            //     min: 0,
            //     max: maxValue,
            //     grid: {
            //         color: '#D9D9E3',
            //         borderDash: [2, 4],     // ✅ DOTTED LINES
            //         drawBorder: false
            //     },
            //     ticks: {
            //         color: '#000000B2',
            //         font: {
            //             family: 'Geist',
            //             size: 9,
            //             weight: '500'
            //         }
            //     }
            // },
            x: {
    min: 0,
    max: maxValue,
    grid: {
        color: '#D9D9E3',
        borderDash: [2, 4],
        drawBorder: false
    },
    ticks: {
        callback: function (value) {
            return Number(value).toFixed(1);   // one decimal only for no decimalmake i as 0 mano
        },
        color: '#000000B2',
        font: {
            family: 'Geist',
            size: 9,
            weight: '500'
        }
    }
},
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    autoSkip: false,
                    color: '#000000B2',
                    font: {
                        family: 'Geist',
                        size: 11,
                        weight: '500'
                    }
                }
            }
        }
    };

    if (this.donutChart) {
        this.donutChart.destroy();
    }

    this.donutChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
},
		_renderLocationChart: function(aData) {
			const el = document.querySelector("#locationChart");
			if (!el) {
				// console.warn("Chart container not found.");
				return;
			}
			const maxValue = Math.max(...aData.map(item => item.y));
			el.innerHTML = "";

			const options = {
				chart: {
					type: 'area',
					height: 152,
					width: '101.8%',
					background: '#ffffff',
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false
					},
					offsetY: 14 // was 15 — reduced to remove top gap
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					curve: 'smooth',
					width: 1,
					colors: ['#8979FF']
				},
				fill: {
					type: 'gradient',
					gradient: {
						shade: 'light',
						shadeIntensity: 0.3,
						opacityFrom: 0.4,
						opacityTo: 0,
						stops: [0, 90, 100],
						colorStops: [{
							offset: 0,
							color: "#8979FF",
							opacity: 0.4
						}, {
							offset: 100,
							color: "#8979FF",
							opacity: 0
						}]
					}
				},
				markers: {
					size: 4,
					colors: ['#fff'],
					strokeColors: '#5A67D8',
					strokeWidth: 1,
					hover: {
						size: 6
					}
				},
				series: [{
					name: "Spend",
					data: aData.map(item => item.y)
				}],
				xaxis: {
					categories: aData.map(item => item.x),
					labels: {
						style: {
							fontSize: '9px',
							fontFamily: 'Geist',
							color: '#000000B2'
						},
						offsetY: -5
					},
					axisTicks: {
						show: false
					},
					axisBorder: {
						show: false
					},
					tickPlacement: 'between'
				},
				yaxis: {
					min: 0,
					max: maxValue,
					tickAmount: 4,
					labels: {
						formatter: function(val) {
							return Math.round(val / 100000) + " L";
						},
						style: {
							fontSize: '9px',
							fontFamily: 'Geist',
							color: '#000000B2'
						}
					}
				},
				grid: {
					padding: {
						top: -13
					}, // removes space inside chart area
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					theme: 'light',
					style: {
						fontSize: '12px',
						fontFamily: 'Geist, sans-serif'
					}
				}
			};

			const chart = new ApexCharts(el, options);
			chart.render();
		},
		onHouseBankChart: function(aChartData) {

			const labels = aChartData.map(item => item.Lifnr);
			const values = aChartData.map(item => parseFloat(item.TotalAmount));
			const totalAmount = values.reduce((sum, val) => sum + val, 0);

			let sFormattedAmount = "";

			if (totalAmount >= 10000000) {
				const croreVal = totalAmount / 10000000;
				sFormattedAmount = "₹ " + croreVal.toFixed(2) + " Cr";
			} else if (totalAmount >= 100000) {
				const lakhVal = totalAmount / 100000;
				sFormattedAmount = "₹ " + lakhVal.toFixed(2) + " L";
			} else {
				sFormattedAmount = "₹ " + totalAmount.toLocaleString('en-IN', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
			}

			var oText = this.byId("idTotalAmountText");
			if (oText) {
				oText.setText(sFormattedAmount);
			}
			// Destroy existing chart if needed
			if (this._houseBankChart) {
				this._houseBankChart.destroy();
				this._houseBankChart = null;
			}
			const canvas = document.getElementById("houseBankChart");

			canvas.style.height = "103px";
			canvas.style.width = "100%";
			canvas.style.marginLeft = "-5px";
			canvas.style.marginTop = "-23px";

			const ctx = document.getElementById("houseBankChart").getContext("2d");

			const ellipseCapPlugin = {
				id: 'ellipseCap',
				afterDatasetDraw(chart, args, pluginOptions) {
					const {
						ctx,
						chartArea,
						scales: {
							x,
							y
						}
					} = chart;
					ctx.save();
					ctx.fillStyle = '#C0B6E2';

					const meta = chart.getDatasetMeta(0);
					meta.data.forEach((bar) => {
						const barX = bar.x;
						const barY = bar.y;
						const barWidth = bar.width;
						const rx = barWidth / 2;
						const ry = 5;

						ctx.beginPath();
						ctx.ellipse(barX, barY, rx, ry, 0, 0, 2 * Math.PI);
						ctx.fill();
					});
					ctx.restore();
				}
			};

			this._houseBankChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: labels,
					datasets: [{
						label: 'Balance',
						data: values,
						backgroundColor: 'rgba(150, 134, 208, 0.85)',
						borderRadius: 0,
						barPercentage: 0.8,
						categoryPercentage: 0.5
					}]
				},
				options: {
					maintainAspectRatio: false,
					layout: {
						padding: {
							top: 0,
							bottom: 0,
							left: 0,
							right: 0
						}
					},
					responsive: true,
					plugins: {
						tooltip: {
							backgroundColor: '#ffffff',
							borderColor: '#d1d1d1',
							borderWidth: 1,
							titleColor: '#333',
							bodyColor: '#000',
							titleFont: {
								size: 12,
								weight: 'bold'
							},
							bodyFont: {
								size: 12
							},
							displayColors: true,
							padding: 10,
							callbacks: {
								title: function(context) {
									return context[0].label;
								},
								label: function(context) {
									return 'Balance: ' + context.raw.toLocaleString('en-IN');
								},
								labelTextColor: function() {
									return '#000';
								}
							}
						},
						legend: {
							display: false
						}
					},

					scales: {
						x: {
							ticks: {
								font: {
									color: "#000000B2",
									size: '9px',
									family: 'Geist'

								},
								padding: 6
							},
							grid: {
								color: "#e5e5e5",
								borderDash: [4, 4],
								borderDashOffset: 0,
								drawOnChartArea: true,
								drawTicks: false,
								drawBorder: false,
								lineWidth: 1
							},
							border: {
								dash: [2, 2]
							}
						},
						y: {
							ticks: {
								font: {
									color: "#000000B2",
									size: '9px',
									family: 'Geist'

								},

								callback: (val) => this.formatIndianNumber(val),
								maxTicksLimit: 4
							},
							grid: {
								color: "#e5e5e5",
								borderDash: [4, 4],
								borderDashOffset: 0,
								drawOnChartArea: true,
								drawTicks: false,
								drawBorder: false,
								lineWidth: 1
							},
							border: {
								dash: [2, 2]
							}
						}

					}
				},
				plugins: [ellipseCapPlugin]
			});
		},

		fnTop5collectionChart: function(sFromDate, sToDate) {

			var oDashboardModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");

			var fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - 30); // 30 days ago
			var toDate = new Date(); // today
			// var sFromDate = fromDate.getFullYear() + "-" +
			//     String(fromDate.getMonth() + 1).padStart(2, '0') + "-" +
			//     String(fromDate.getDate()).padStart(2, '0');
			// var sToDate = toDate.getFullYear() + "-" +
			//     String(toDate.getMonth() + 1).padStart(2, '0') + "-" +
			//     String(toDate.getDate()).padStart(2, '0');
			sap.ui.core.BusyIndicator.show(0);
			oDashboardModel.read("/Ven_BalanceSet", {
				filters: [
					new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
				],
				success: (oData) => {
					sap.ui.core.BusyIndicator.hide();
					const aResults = oData.results || [];

					aResults.sort((a, b) => parseFloat(b.Dmbtr) - parseFloat(a.Dmbtr));

					const aChartData = oData.results.map(item => ({
						x: item.Lifnr, // X-axis → Vendor Number
						y: parseFloat(item.Dmbtr), // Y-axis → Amount
						name: item.Sgtxt // Tooltip → Vendor Name
					}));

					setTimeout(() => {
						this.fnTopPayableVendor(aChartData);
					}, 0);
				},
				error: (oError) => {
					// console.error("Error calling FSC_DASHBOARD_SRV:", oError); line commented by yasin on 16-10-2025
					sap.m.MessageToast.show(oError);
				}
			});

		},
		// Utility: Format to yyyy-mm-dd (for OData filters)
		getFormattedDate: function(date) {
			return date.getFullYear() + "-" +
				String(date.getMonth() + 1).padStart(2, '0') + "-" +
				String(date.getDate()).padStart(2, '0');
		},

		//Utility: Format for UI (dd/mm/yyyy)
		formatUIDate: function(dateObj) {
			var dd = String(dateObj.getDate()).padStart(2, '0');
			var mm = String(dateObj.getMonth() + 1).padStart(2, '0');
			var yyyy = dateObj.getFullYear();
			return dd + "/" + mm + "/" + yyyy;
		},

		// Centralized OData fetch logic
		loadVendorData: function(sFromDate, sToDate) {
			var that = this;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read("/VendorInvoiceLineItemSet", {

				filters: [
					new sap.ui.model.Filter("BLDAT", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					// Sort by DMBTR descending
					var aSortedResults = oData.results.sort(function(a, b) {
						return b.DMBTR - a.DMBTR;
					});

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(aSortedResults);
					that.getView().setModel(oModel, "jsvenline");
					var oTable = that.byId("id_table");
					if (oTable) {
						oTable.setVisibleRowCount(aSortedResults.length);
					}
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to load invoice data");
				}
			});
		},

		// Today
		fn_TodayData: function() {
			var today = new Date();
			var sToday = this.getFormattedDate(today);
			this.loadVendorData(sToday, sToday);
			this.populateDropdownValues(today);
		},

		// This Week (today to coming Sunday)
		fn_thisWeekData: function() {
			var today = new Date();
			var day = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
			var sunday = new Date(today);
			sunday.setDate(today.getDate() + ((7 - day) % 7)); // move to this week's Sunday

			var sToday = this.getFormattedDate(today);
			var sSunday = this.getFormattedDate(sunday);

			this.loadVendorData(sToday, sSunday);
			this.populateDropdownValues(today); // prepopulate next week days based on this Sunday
		},

		// Next Week (Monday to Sunday after current week)
		fn_NextWeekData: function() {
			var today = new Date();
			var day = today.getDay();
			var diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1); // current week Monday
			var thisMonday = new Date(today.setDate(diffToMonday));
			var nextMonday = new Date(thisMonday);
			nextMonday.setDate(thisMonday.getDate() + 7);
			var nextSunday = new Date(nextMonday);
			nextSunday.setDate(nextMonday.getDate() + 6);

			var sNextMonday = this.getFormattedDate(nextMonday);
			var sNextSunday = this.getFormattedDate(nextSunday);

			this.loadVendorData(sNextMonday, sNextSunday);
			this.populateDropdownValues(nextMonday); // update dropdown
		},

		populateDropdownValues: function(startDate) {
			var dropdownDays = [];

			var date = new Date(startDate);
			var dayOfWeek = date.getDay(); // 0 = Sunday, ..., 6 = Saturday
			var daysToSunday = 7 - dayOfWeek; // how many days until end of week

			for (var i = 0; i < daysToSunday; i++) {
				var tempDate = new Date(startDate);
				tempDate.setDate(startDate.getDate() + i);

				dropdownDays.push({
					label: tempDate.toLocaleDateString('en-GB', {
						weekday: 'long',
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					}),
					key: this.getFormattedDate(tempDate)
				});
			}

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(dropdownDays);
			this.getView().setModel(oModel, "NextWeekDropDown");
		},

		onNextWeekDayChange: function(oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			if (!sSelectedKey) return;

			this.loadVendorData(sSelectedKey, sSelectedKey);
		},

		// onGetDue: function(oData) {
		// 	window.dispatchEvent(new Event('resize'));

		// 	var aSeriesData = [];
		// 	var aCategories = [];
		// 	var aGroups = [];
		// 	var aFinal = [];
		// 	var bal = 0;
		// 	var tot = 0;
		// 	aCategories.splice(0, aCategories.length);
		// 	aSeriesData.splice(0, aSeriesData.length);
		// 	for (var i = 0; i < JDue.length; i++) {
		// 		aCategories.push(JDue[i].Lifnr);
		// 		aSeriesData.push(JDue[i].Dmbtr);
		// 		bal = parseInt(JDue[i].Dmbtr) + parseInt(bal);
		// 		var temp = {
		// 			"Name": JDue[i].Vname,
		// 			"Dmbtr": this.formatter(JDue[i].Dmbtr),
		// 			"Days": JDue[i].Sgtxt
		// 		}
		// 		aGroups.push(temp);
		// 	}
		// 	tot = this.formatter(bal);
		// 	// this.getView().byId("id_totdue").setText("(" + tot + ")");
		// 	var options = {
		// 		chart: {
		// 			type: 'area',
		// 			width: "100%",
		// 			height: '145px',

		// 			foreColor: '#BFC3C9',
		// 			zoom: {
		// 				enabled: false
		// 			},
		// 			toolbar: {
		// 				show: false
		// 			},
		// 			offsetY: -16,
		// 			offsetX: 0
		// 		},
		// 		markers: {
		// 			size: 3,
		// 			colors: '#ffffff', // White inside
		// 			strokeColors: '#19AF9D', // Light cyan border
		// 			strokeWidth: 0.7
		// 		},
		// 		dataLabels: {
		// 			enabled: false
		// 		},
		// 		series: [{
		// 			name: 'Due',
		// 			data: aSeriesData,
		// 			color: '#19AF9D' // Soft cyan line color
		// 		}],
		// 		xaxis: {
		// 			categories: aCategories,
		// 			tickPlacement: 'between',
		// 			ticks: {
		// 				color: "#000000B2",
		// 				font: {
		// 					size: '9px'
		// 				}
		// 			},
		// 			labels: {
		// 				style: {
		// 					color: "#000000B2",
		// 					fontFamily: "Geist",
		// 					fontSize: '9px'
		// 				},
		// 				offsetX: 0,
		// 				offsetY: -5
		// 			},
		// 			title: {
		// 				style: {
		// 					color: "#000000B2",
		// 					fontFamily: "Geist",
		// 					fontSize: '9px'
		// 				}
		// 			},
		// 			axisBorder: {
		// 				show: true,
		// 				color: '#e5e5e5',
		// 				height: 1
		// 			},
		// 			axisTicks: {
		// 				show: false
		// 			}
		// 		},

		// 		grid: {
		// 			padding: {
		// 				left: 0, // removes left padding
		// 				right: 0
		// 					// Small gap on left side, tweak this value if needed
		// 			}
		// 		},
		// 		yaxis: {
		// 			type: 'numeric',
		// 			labels: {
		// 				formatter: function(value) {
		// 					if (value >= 10000000) {
		// 						return (value / 10000000).toFixed(0) + ' Cr';
		// 					} else if (value >= 100000) {
		// 						return (value / 100000).toFixed(0) + ' L';
		// 					} else if (value >= 1000) {
		// 						return (value / 1000).toFixed(0) + ' K';
		// 					} else {
		// 						return value.toFixed(0);
		// 					}
		// 				},
		// 				style: {
		// 					color: "#000000B2",
		// 					fontFamily: "Geist",
		// 					fontSize: '9px'
		// 				}
		// 			}
		// 		},
		// 		grid: {
		// 			borderColor: '#e5e5e5',
		// 			strokeDashArray: 2,
		// 			xaxis: {
		// 				lines: {
		// 					show: true
		// 				}
		// 			},
		// 			yaxis: {
		// 				lines: {
		// 					show: true
		// 				}
		// 			}
		// 		},
		// 		noData: {
		// 			text: 'Loading...'
		// 		},
		// 		stroke: {
		// 			curve: 'straight',
		// 			width: 0.7
		// 		},
		// 		fill: {
		// 			type: "gradient",
		// 			gradient: {
		// 				shadeIntensity: 1,
		// 				inverseColors: false,
		// 				opacityFrom: 0.5,
		// 				opacityTo: 0.05,
		// 				stops: [0, 90, 100],
		// 				colorStops: [{
		// 					offset: 0,
		// 					color: "#19AF9D",
		// 					opacity: 0.5
		// 				}, {
		// 					offset: 100,
		// 					color: "#19AF9D",
		// 					opacity: 0.05
		// 				}]
		// 			}
		// 		},
		// 		tooltip: {
		// 			custom: function({
		// 				series,
		// 				seriesIndex,
		// 				dataPointIndex,
		// 				w
		// 			}) {
		// 				var data = aGroups[dataPointIndex];
		// 				return '<table style="border-collapse: collapse; width="10px";"><tr><th style="border-bottom: 1px solid #dddddd;font-size: 12px;text-align: left;padding: 8px;background-color: #EDF2FD;color:#000000B2;">Vendor Details </th></tr>' +
		// 					'<tr><td style="text-align: left; white-space: break-spaces;font-size: 12px;color:#000000B2;padding-left:6px">' + "Name: " +
		// 					data.Name + '</tr>' +
		// 					'<tr><td style="text-align: left; white-space: break-spaces;font-size: 12px;color:#000000B2;padding-left:6px">' + "Amount: " +
		// 					data.Dmbtr + '</tr>' +
		// 					'<tr><td style="text-align: left; white-space: break-spaces;font-size: 12px;color:#000000B2;padding-left:6px">' + "Days: " +
		// 					data.Days + '</tr>' +
		// 					'</table>';
		// 			}
		// 		}
		// 	};

		// 	var chart = new ApexCharts(document.querySelector("#duechart"), options);
		// 	chart.render();
		// 	chart.updateSeries([{
		// 		series: [{
		// 			data: aSeriesData
		// 		}]
		// 	}]);
		// 	window.dispatchEvent(new Event('resize'));
		// },
		// formatter: function(value) {
		// 	var oFormatOptions = {
		// 		style: "short"
		// 			// decimals: 1
		// 			// shortDecimals: 2
		// 	};

		// 	// "NumberFormat" required from module "sap/ui/core/format/NumberFormat"
		// 	oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions);
		// 	return oFloatFormat.format(value);
		// },
		 onGetDue: function(oData) {
    window.dispatchEvent(new Event('resize'));

    var aSeriesData = [];
    var aCategories = [];
    var aGroups = [];
    var bal = 0;

    for (var i = 0; i < JDue.length; i++) {
        aCategories.push(JDue[i].Lifnr);
        // keep numeric value for ApexCharts
        aSeriesData.push(Number(JDue[i].Dmbtr) || 0);
        bal += Number(JDue[i].Dmbtr) || 0;

        var temp = {
            "Name": JDue[i].Vname,
            "Dmbtr": JDue[i].Dmbtr, // do not use formatter here
            "Days": JDue[i].Sgtxt
        };
        aGroups.push(temp);
    }

    var options = {
        chart: {
            type: 'area',
            width: "100%",
            height: '145px',
            foreColor: '#BFC3C9',
            zoom: { enabled: false },
            toolbar: { show: false },
            offsetY: -16,
            offsetX: 0
        },
        markers: {
            size: 3,
            colors: '#ffffff',
            strokeColors: '#19AF9D',
            strokeWidth: 0.7
        },
        dataLabels: { enabled: false },
        series: [{
            name: 'Due',
            data: aSeriesData,
            color: '#19AF9D'
        }],
        xaxis: {
            categories: aCategories,
            tickPlacement: 'between',
            ticks: { color: "#000000B2", font: { size: '9px' } },
            labels: {
                style: { color: "#000000B2", fontFamily: "Geist", fontSize: '9px' },
                offsetX: 0,
                offsetY: -5
            },
            axisBorder: { show: true, color: '#e5e5e5', height: 1 },
            axisTicks: { show: false }
        },
        yaxis: {
            type: 'numeric',
            labels: {
                formatter: function(value) {
                    if (value >= 10000000) return (value / 10000000).toFixed(0) + ' Cr';
                    else if (value >= 100000) return (value / 100000).toFixed(0) + ' L';
                    else if (value >= 1000) return (value / 1000).toFixed(0) + ' K';
                    else return value.toFixed(0);
                },
                style: { color: "#000000B2", fontFamily: "Geist", fontSize: '9px' }
            }
        },
        grid: {
            borderColor: '#e5e5e5',
            strokeDashArray: 2,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } },
            padding: { left: 0, right: 0 }
        },
        noData: { text: 'Loading...' },
        stroke: { curve: 'straight', width: 0.7 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0.05,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: "#19AF9D", opacity: 0.5 },
                    { offset: 100, color: "#19AF9D", opacity: 0.05 }
                ]
            }
        },
        tooltip: {
            custom: function({ dataPointIndex }) {
                var data = aGroups[dataPointIndex];
                return '<table style="border-collapse: collapse;"><tr><th style="border-bottom: 1px solid #dddddd;font-size: 12px;text-align: left;padding: 8px;background-color: #EDF2FD;color:#000000B2;">Vendor Details</th></tr>' +
                       '<tr><td style="text-align: left; white-space: break-spaces;font-size: 12px;color:#000000B2;padding-left:6px">Name: ' + data.Name + '</td></tr>' +
                       '<tr><td style="text-align: left; white-space: break-spaces;font-size: 12px;color:#000000B2;padding-left:6px">Amount: ' + data.Dmbtr + '</td></tr>' +
                       '<tr><td style="text-align: left; white-space: break-spaces;font-size: 12px;color:#000000B2;padding-left:6px">Days: ' + data.Days + '</td></tr>' +
                       '</table>';
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#duechart"), options);
    chart.render();
    chart.updateSeries([{ data: aSeriesData }]); // keep this as in your original code
    window.dispatchEvent(new Event('resize'));
},
    formatter: function(value) {
      var oFormatOptions = {
        style: "short"
          // decimals: 1
          // shortDecimals: 2
      };

      // "NumberFormat" required from module "sap/ui/core/format/NumberFormat"
      oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions);
      return oFloatFormat.format(value);
    },
		barchartClick: function() {
			var oView = this.getView();

			// Load only once
			if (!this._oBarChartFrag) {
				this._oBarChartFrag = sap.ui.xmlfragment(
					"FSC360NEW.fragment.barchartTable", // fragment path
					this // controller
				);
				oView.addDependent(this._oBarChartFrag);
			}

			// Load data before opening
			this._loadBarChartData();
		},

		_loadBarChartData: function() {
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			var oController = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/InvoiceSet", {
				filters: [
					new sap.ui.model.Filter("BUDAT", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData.results);
					oController._oBarChartFrag.setModel(oModel, "barModel");
					oController._oBarChartFrag.open(); // Now open
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
						oController.fnShowErrorDialog("Error loading invoice data.");
				
				}
			});
		},
		fnCloseManualInvInfo: function() {
			console.log("Closing dialog...");
			if (this._oBarChartFrag) {
				this._oBarChartFrag.close();
			}
		},
		onDownload_ManualInvInfo: function() {
			var oModel = this._oBarChartFrag.getModel("barModel");
			var aData = oModel.getData();

			var csv = "Invoice Document,Year,Account Document,Vendor,Invoice Type\n";
			aData.forEach(function(row) {
				csv += `${row.MIRO_DOC},${row.GJAHR},${row.ACCT_DOC},${row.NAME1},${row.INV_TYPE}\n`;
			});

			var blob = new Blob([csv], {
				type: "text/csv;charset=utf-8;"
			});
			var url = URL.createObjectURL(blob);

			var oLink = document.createElement("a");
			oLink.href = url;
			oLink.download = "Manual_Invoice_Report.csv";
			document.body.appendChild(oLink);
			oLink.click();
			document.body.removeChild(oLink);
		},

		fn_page_top: function() {
			this.byId("id_page").scrollTo(0);
			if (this.getView().byId("id_1st_content").getVisible() == false) {
				this.getView().byId("id_1st_content").setVisible(true);
				this.getView().byId("id_2nd_tit").setVisible(true);
				this.getView().byId("id_2nd_content").setVisible(true);

				this.getView().getModel('JSInvdet').setData(null);
				this.getView().getModel('JSInvdet').refresh();
				var oTableJson = new sap.ui.model.json.JSONModel();
				oTableJson.setData(arrTable.slice(0, 10));
				this.getView().setModel(oTableJson, 'JSInvdet');
			} else if (this.getView().byId("id_1st_content").getVisible() == true) {
				this.getView().byId("id_1st_content").setVisible(false);
				this.getView().byId("id_2nd_tit").setVisible(false);
				this.getView().byId("id_2nd_content").setVisible(false);

				this.getView().getModel('JSInvdet').setData(null);
				this.getView().getModel('JSInvdet').refresh();
				var oTableJson = new sap.ui.model.json.JSONModel();
				oTableJson.setData(arrTable.slice(0, 20));
				this.getView().setModel(oTableJson, 'JSInvdet');
			}
		},
		fnSearchField: function(oEvent) {
			if (FilterParameter === "") {
				FilterParameter = "Qid";
			}

			var vValue = oEvent.getSource().getValue();
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter(FilterParameter, sap.ui.model.FilterOperator.Contains, vValue);
				var aFilter = new sap.ui.model.Filter([oFilter]);
			}

			var binding = this.getView().byId("id_table_width").getBinding("rows");

			binding.filter(aFilter);
		},

		fn_filter_ascSort: function(oEvent) {
			var oTable = this.getView().byId("id_table_width");
			var oBinding = oTable.getBinding("rows");
			var SORTKEY = "Qid";
			var DESCENDING = false;
			var GROUP = false;
			var aSorter = [];
			aSorter.push(new sap.ui.model.Sorter(SORTKEY, DESCENDING, GROUP));
			oBinding.sort(aSorter);
		},
		fn_filter_descSort: function(oEvent) {
			var oTable = this.getView().byId("id_table_width");
			var oBinding = oTable.getBinding("rows");
			var SORTKEY = "Qid";
			var DESCENDING = true;
			var GROUP = false;
			var aSorter = [];
			aSorter.push(new sap.ui.model.Sorter(SORTKEY, DESCENDING, GROUP));
			oBinding.sort(aSorter);
		},

		fn_pdf: function(oEvent) {

			this.fn_list(oEvent);
			if (QueueID !== "") {
				this.fn_pdf_alignment();
				this.fnGetPDF(QueueID);

				if (sap.ui.getCore().AppController) {
					sap.ui.getCore().AppController.collapseSidebar();
				}

			} else if (QueueID === "") {
			
				this.fnShowErrorDialog("Please Select the Queue ID");
			}

		},
		fn_list: function(oEvent) {

			Docid = oEvent.getSource().getBindingContext('jsDet').getProperty('Docid');
			QueueID = oEvent.getSource().getBindingContext('jsDet').getProperty('Qid');
			// Bukrs = oEvent.getSource().getBindingContext('jsDet').getProperty('Bukrs');
			// InvoiceNo = oEvent.getSource().getBindingContext('jsDet').getProperty('Invno');
			// TransType = oEvent.getSource().getBindingContext('jsDet').getProperty('Transtype');
			// oEvent_nav = oEvent.getSource();

		},
		fn_pdf_alignment: function() {
			if (QueueID !== "") {
				if (QueueID === PrevQid && this.getView().byId("id_scrll").getVisible()) {
					// this.getView().byId("id_scrll").setVisible(false);
					var oModel1 = new sap.ui.model.json.JSONModel();

					var arr1 = [{
						"Key": false
					}];
					oModel1.setData(arr1);
					this.getView().setModel(oModel1, 'JsScrl');

					var oModel = this.getOwnerComponent().getModel("jsTab");

					var arr = [{

						"Key": true,
						"Width": "11%",
						"Align": "End",
						"Icon": false

					}];

					oModel.setData(arr);
					this.getView().setModel(oModel, 'jsTab');
					this.getView().byId("id_pdf_slide").setWidth("100%");

					this.getView().byId("id_vbox_table").setWidth("100%");

				} else if (QueueID !== PrevQid && this.getView().byId("id_scrll").getVisible()) {
					PrevQid = QueueID;
					var oModel1 = new sap.ui.model.json.JSONModel();

					var arr1 = [{
						"Key": true
					}];
					oModel1.setData(arr1);
					this.getView().setModel(oModel1, 'JsScrl');
					var oModel = this.getOwnerComponent().getModel("jsTab");

					var arr = [{

						"Key": false,
						"Width": "5%",
						"Align": "Center",
						"Icon": true

					}];

					oModel.setData(arr);
					this.getView().setModel(oModel, 'jsTab');
					this.getView().byId("id_pdf_slide").setWidth("65%");

					this.getView().byId("id_table_width").setWidth("100%");
					this.setColumnWidths("fixed");
				} else if (!this.getView().byId("id_scrll").getVisible()) {
					PrevQid = QueueID;
					// this.getView().byId("id_scrll").setVisible(true);
					var oModel1 = new sap.ui.model.json.JSONModel();

					var arr1 = [{
						"Key": true
					}];
					oModel1.setData(arr1);
					this.getView().setModel(oModel1, 'JsScrl');
					var oModel = this.getOwnerComponent().getModel("jsTab");

					var arr = [{

						"Key": false,
						"Width": "5%",
						"Align": "Center",
						"Icon": true

					}];

					oModel.setData(arr);
					this.getView().setModel(oModel, 'jsTab');
					this.getView().byId("id_pdf_slide").setWidth("65%");

					this.getView().byId("id_table_width").setWidth("100%");
					this.setColumnWidths("fixed");
				}
			} else if (QueueID === "") {
				this.fnShowErrorDialog("Please Select the Queue ID");
			
			}

		},
		fnGetPDF: function(QueueID) {

			if (QueueID !== "") {
				oGlobalBusyDialog.open();
				this.getView().byId('id_scrll').setBusy(false);
				var oScorl = this.getView().byId("id_scrll");

				oScorl.destroyContent();
			
				// var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=0&zoom=60";
				var Url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value#toolbar=1";

				var oHtml = new sap.ui.core.HTML({

				});
				// var oContent = "<div class='overlay'><iframe src=" + Url +
				// 	" id='id_imageIfrm' '  scrolling='yes' height='380' width='400' ></iframe></div>";
					var oContent = "<div class='overlay'><iframe src=" + Url +
					"  id='id_imageIfrm' ' allowtransparency='false' scrolling='yes'  height='430' width='360'></iframe></div>";
	
				oHtml.setContent(oContent);
				var oScrl = this.getView().byId("id_scrll");
				oScrl.addContent(oHtml);
				// oScrl.setVisible(true);
				$('id_scrll').click(false);
				oGlobalBusyDialog.close();
			} else {
				this.fnShowErrorDialog("Please Select the Queue ID");
			}
		},
		setColumnWidths: function(mode) {
			var oTable = this.getView().byId("id_table_width");
			var aColumns = oTable.getColumns();

			if (mode === "fixed") {
				// Fixed pixel widths
				var aFixedWidths = ["10px", "120px", "100px", "80px", "150px", "130px", "180px", "100px", "140px", "130px"];
				for (var i = 0; i < aColumns.length; i++) {
					aColumns[i].setWidth(aFixedWidths[i] || "100px");
				}
			} else if (mode === "responsive") {
				// Responsive percentage widths
				var aPercentWidths = ["4%", "12%", "12%", "10%", "10%", "12%", "14%", "16%", "10%", "11%"];
				for (var j = 0; j < aColumns.length; j++) {
					aColumns[j].setWidth(aPercentWidths[j] || "10%");
				}
			}
		},
		fn_close_pdf: function() {

			var oModel1 = new sap.ui.model.json.JSONModel();
			var arr1 = [{
				"Key": false
			}];
			oModel1.setData(arr1);
			this.getView().setModel(oModel1, 'JsScrl');

			// Reset layout sizes
			this.getView().byId("id_pdf_slide").setWidth("100%");

			// this.getView().byId("id_table_width").setWidth("114%");

			this.setColumnWidths("responsive");
		},
		fn_LoadData: function() {
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			var val_flag = 'W';

			// Use global date range for client-side filtering
			var sFromDate = this._grnFromDate;
			var sToDate = this._grnToDate;
			oGlobalBusyDialog.open();
			oModel.read("/DEEPHEADSet", {
				filters: [
					new Filter("Flag", FilterOperator.EQ, val_flag),
					new Filter("IvText", FilterOperator.EQ, 'W')
				],
				urlParameters: {
					$expand: "NavGetDash,NavGetInvCount,NavGetInvDet,NavHeadSt"
				},
				success: function(oData) {
					oGlobalBusyDialog.close();
					// Set user model
					var oUserModel = new sap.ui.model.json.JSONModel(oData.results[0]);
					that.getView().setModel(oUserModel, 'JSusername');
					UserType = oData.results[0].Flag;

					// Set table header model
					var oHeaderModel = new sap.ui.model.json.JSONModel({
						col1: "Queue ID",
						col2: "Date",
						col3: "Time",
						col4: "Invoice",
						col5: "Invoice Number",
						col6: "Invoice Type",
						col7: "Vendor",
						col8: "Plant",
						col9: "Agent",
						col10: "Status",
						showInvoiceIcon: true,
						showAgent: true
					});
					that.getView().setModel(oHeaderModel, "headerModel");

					// Filter table data client-side using global date range
					arrTable = oData.results[0].NavHeadSt.results;
					arrTable = arrTable.filter(function(row) {
						var qidDate = formatter.fnFormatQidDate(row.Qiddate); // must return YYYY-MM-DD

						if (!qidDate) return false;

						// Compare as strings (safe if all dates are in YYYY-MM-DD format)
						return qidDate >= sFromDate && qidDate <= sToDate;
					});

					arrTable.forEach(function(row) {
						var scanDate = row.Scandate ? new Date(row.Scandate) : null;
						var postDate = row.Postingdate ? new Date(row.Postingdate) : null;
						if (row.Status === "S40") {
							row.DisplayStatus = "On Hold";
						} else if (!row.Assignedto || row.Assignedto.trim() === "") {
							row.DisplayStatus = "Unassigned";
						} else if (scanDate && postDate) {
							var diffMs = postDate - scanDate;
							var diffHours = diffMs / (1000 * 60 * 60);
							row.DisplayStatus = diffHours <= 24 ? "Completed" : "Escalated";
						} else {
							row.DisplayStatus = "Assigned";
						}
					});

					that.aFullData = arrTable;
					that.aFilteredData = arrTable;
					that.iCurrentPage = 1;
					that.updatePaginatedModel();

					// Set dashboard counts model
					var oDashModel = new sap.ui.model.json.JSONModel(oData.results[0].NavGetDash.results);
					that.getView().setModel(oDashModel, 'JSCountdet');

					// Fetch additional dashboard data for charts
					that._fetchDashboardData(sFromDate, sToDate);

					// Update UI
					that.fn_inProgress();
					setTimeout(() => {
						that.onTotalCardClick({
							currentTarget: that.byId("idCardTotal").getDomRef()
						});
					}, 0);

					// Line chart data
					var chartData = [];
					var userMap = {};
					oData.results[0].NavHeadSt.results.forEach(function(item) {
						var user = (item.Username || "").trim();
						if (!user) return;
						var key = user.toLowerCase();
						var status = item.Stats;
						var qidDate = formatter.fnFormatQidDate(item.Qiddate);
						if (!qidDate || qidDate < sFromDate || qidDate > sToDate) return;

						if (!userMap[key]) {
							userMap[key] = {
								DisplayName: user,
								Posted: 0,
								InProgress: 0
							};
						}
						if (status === "S41") {
							userMap[key].Posted += 1;
						} else if (status === "S15" || status === "S20") {
							userMap[key].InProgress += 1;
						}
					});

					for (var key in userMap) {
						chartData.push({
							Username: userMap[key].DisplayName,
							Posted: userMap[key].Posted,
							InProgress: userMap[key].InProgress
						});
					}
					that.chartData = chartData;
					that.fn_AgentPerfchart();

					// Trigger donut chart load
					// that.onDonutChartLoad();
				},
				error: function(oError) {
					oGlobalBusyDialog.close();
					// console.error("Error loading DEEPHEADSet:", oError);
					sap.m.MessageToast.show("Error loading DEEPHEADSet:");
				}
			});
		},

		// Helper function to fetch dashboard data
		_fetchDashboardData: function(sFromDate, sToDate) {
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/GetDashSet", {
				filters: [
					new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var oGetModel = oData.results;

					// Manodashcard (debug)
					// console.log(oGetModel);

					// Donut Chart Data
					var aChartData = oGetModel.slice(13, 20).map(function(item) {
						return {
							Status: item.Text,
							Count: parseInt(item.CountTxt, 10) || 0
						};
					});

					// Draw Chart after minimal delay
					setTimeout(() => {
						that.fn_tatchart(aChartData);
					}, 0);
					var iTotal = aChartData.reduce(function(sum, item) {
						return sum + item.Count;
					}, 0);
					// that.byId("idCenterValue").setText(iTotal.toString()); //commented by Manosankari

					// Bind Model
					var donutModel = new sap.ui.model.json.JSONModel({
						chartData: aChartData
					});
					that.getView().setModel(donutModel, "DonutChartModel");
					var dashData = oData.results;

					// Update payment block donut chart
					var overdueCount = parseInt(that.getCountByText(dashData, "Overdue Pay. Block"), 10);
					var otherCount = parseInt(that.getCountByText(dashData, "Other Pay. Block"), 10);
					var totalCount = parseInt(that.getCountByText(dashData, "Total Pay. Block"), 10);
					var paymentAmountText = "₹" + (totalCount * 5000).toLocaleString("en-IN");

					setTimeout(function() {
						if (document.getElementById("donut-center-text")) {
							that.fnHalfDonutChart(otherCount, overdueCount, paymentAmountText, totalCount);
						}
					}, 200);

					// Update sales bar chart
					var oSalesData = {
						Sales: [{
							InvoiceType: "Material Based",
							ManuallyPosted: parseInt(that.getCountByText(dashData, "Manual Posted - Material-Based"), 10),
							ScannedInvoices: parseInt(that.getCountByText(dashData, "Scanned - Material-Based"), 10)
						}, {
							InvoiceType: "Service Based",
							ManuallyPosted: parseInt(that.getCountByText(dashData, "Manual Posted - Service-Based"), 10),
							ScannedInvoices: parseInt(that.getCountByText(dashData, "Scanned - Service-Based"), 10)
						}, {
							InvoiceType: "Capital Invoices",
							ManuallyPosted: parseInt(that.getCountByText(dashData, "Manual Posted - Capital-Based"), 10),
							ScannedInvoices: parseInt(that.getCountByText(dashData, "Scanned - Capital-Based"), 10)
						}, {
							InvoiceType: "Non-PO Invoices",
							ManuallyPosted: parseInt(that.getCountByText(dashData, "Manual Posted - Non-PO Invoices"), 10),
							ScannedInvoices: parseInt(that.getCountByText(dashData, "Scanned - Non-PO Invoices"), 10)
						}]
					};

					var totalManual = 0,
						totalScanned = 0;
					oSalesData.Sales.forEach(function(item) {
						totalManual += item.ManuallyPosted;
						totalScanned += item.ScannedInvoices;
					});
					that.getView().byId("id_manual_total").setText(totalManual);
					that.getView().byId("id_scanned_total").setText(totalScanned);
					that.fn_PostedInvChart(oSalesData);
					  that._drawAgeingChart();
            			that._drawPendingAgeingChart();
            	that._drawLocationAgeChart();

					// Update dashboard counts
					var inProgress = that.getCountByText(dashData, "In Progress");
					var parked = that.getCountByText(dashData, "Parked");
					var pendingScan = that.getCountByText(dashData, "Pending for Scanning");
					var pendingApprover = that.getCountByText(dashData, "In Workflow");
					var inProgress_amount = that.getCountByText(dashData, "In Progress-amount");
					var parked_amount = that.getCountByText(dashData, "Parked-amount");
					var pendingScan_amount = that.getCountByText(dashData, "Pending for Scanning-Amount");
					var pendingApprover_amount = that.getCountByText(dashData, "In Workflow-amount");
					var manuallyPosted_amount = that.getCountByText(dashData, "Manual Posted - Total Amount");
					var scanned_amount = that.getCountByText(dashData, "Scanned - Total Amount");

					that.getView().byId("id_inProgress").setText(parseInt(inProgress, 10).toString());
					that.getView().byId("id_pendingApprover").setText(parseInt(pendingApprover, 10).toString());
					that.getView().byId("id_parked").setText(parseInt(parked, 10).toString());
					that.getView().byId("id_pendingScan").setText(parseInt(pendingScan, 10).toString());

					var inProgressAmt = "₹ " + that.formatIndianNumber(parseFloat(inProgress_amount || 0));
					var parkedAmt = "₹ " + that.formatIndianNumber(parseFloat(parked_amount || 0));
					var pendingScanAmt = "₹ " + that.formatIndianNumber(parseFloat(pendingScan_amount || 0));
					var pendingApproverAmt = "₹ " + that.formatIndianNumber(parseFloat(pendingApprover_amount || 0));
					var manPosAmnt = "₹ " + that.formatIndianNumber(parseFloat(manuallyPosted_amount || 0));
					var scanAmnt = "₹ " + that.formatIndianNumber(parseFloat(scanned_amount || 0));

					that.byId("id_inProgressAmt").setText(inProgressAmt);
					that.byId("id_parkedAmt").setText(parkedAmt);
					that.byId("id_pendingScanAmt").setText(pendingScanAmt);
					that.byId("id_pendingApproverAmt").setText(pendingApproverAmt);
					that.byId("id_manPosAmnt").setText(manPosAmnt);
					that.byId("id_scanAmnt").setText(scanAmnt);
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					// console.error("Error loading GetDashSet:", oError);
					sap.m.MessageToast.show("Failed to load dashboard data.");
				}
			});
		},
		// Ensure getCountByText is defined only once in the controller
		getCountByText: function(dashArray, label) {
			var match = dashArray.find(function(obj) {
				return obj.Text === label;
			});
			return match && match.CountTxt ? match.CountTxt : "0";
		},

		formatDateToYYYYMMDD: function(date) {
			return sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd"
			}).format(date);
		},
		getCountByText: function(dashArray, label) {
			var match = dashArray.find(function(obj) {
				return obj.Text === label;
			});
			return match && match.CountTxt ? match.CountTxt : "0";
		},
		onToDateSelected: function() {
			var sKey = this.getView().byId("idFilterSelect").getSelectedKey(); // your filter select id
			if (sKey === "custom") {
				var oFromDate = this.getView().byId("id_fromdate").getDateValue();
				var oToDate = this.getView().byId("id_todate").getDateValue();

				if (oFromDate && oToDate) {
					this.onFilterChange({
						getSource: () => ({
							getSelectedKey: () => "custom"
						})
					});
				}
			}
		},

		onFilterChange: function(oEvent) {
			var that = this;
			var sKey = oEvent.getSource().getSelectedKey();
			var oFromDate, oToDate;
			var oToday = new Date();

			// Show/hide date pickers for custom filter
			this.getView().byId("fromDateBox").setVisible(sKey === "custom");
			this.getView().byId("toDateBox").setVisible(sKey === "custom");

			switch (sKey) {
				case "thisMonth":
					oFromDate = new Date(oToday.getFullYear(), oToday.getMonth(), 1);
					oToDate = new Date(oToday.getFullYear(), oToday.getMonth() + 1, 0);
					break;
				case "lastMonth":
					oFromDate = new Date(oToday.getFullYear(), oToday.getMonth() - 1, 1);
					oToDate = new Date(oToday.getFullYear(), oToday.getMonth(), 0);
					break;
				case "last6Months":
					oFromDate = new Date(oToday.getFullYear(), oToday.getMonth() - 5, 1);
					oToDate = new Date(oToday.getFullYear(), oToday.getMonth() + 1, 0);
					break;
				case "last1Year":
					oFromDate = new Date(oToday.getFullYear(), oToday.getMonth() - 11, 1);
					oToDate = new Date(oToday.getFullYear(), oToday.getMonth() + 1, 0);
					break;
				case "custom":
					oFromDate = this.getView().byId("id_fromdate").getDateValue();
					oToDate = this.getView().byId("id_todate").getDateValue();
					if (!oFromDate || !oToDate) {

						return;
					}
					break;
				default:
					return;
			}

			// Update global filter dates
			this._grnFromDate = this.formatDateToYYYYMMDD(oFromDate);
			this._grnToDate = this.formatDateToYYYYMMDD(oToDate);
			this.getView().getModel("viewModel1").setProperty("/selectedKey", sKey);

			// Determine selected tab and call appropriate function
			var selectedValue = this.byId("idCustomSegmentGroup")
				.getItems()
			// .find(btn => btn.hasStyleClass("cl_segmentBtnSelected"))?.getCustomData()
					.find(btn => btn.hasStyleClass("clSegmentBtnImg"))?.getCustomData()
				.find(d => d.getKey() === "value")?.getValue();

			if (selectedValue === "W") {
				this.fn_LoadData();
			} else if (selectedValue === "I") {
				this.fnSearchTo(this._grnFromDate, this._grnToDate);
			}
		},
		formatDateToYYYYMMDD: function(date) {
			var yyyy = date.getFullYear();
			var mm = String(date.getMonth() + 1).padStart(2, '0');
			var dd = String(date.getDate()).padStart(2, '0');
			return yyyy + '-' + mm + '-' + dd;
		},
		// onDonutChartLoad: function() {
		// 	var that = this;
		// 	var oFromDate, oToDate;
		// 	var oToday = new Date();
		// 	oFromDate = new Date(oToday.getFullYear(), oToday.getMonth(), 1);
		// 	oToDate = new Date(oToday.getFullYear(), oToday.getMonth() + 1, 0);
		// 	var sFromDate = that.formatDateToYYYYMMDD(oFromDate);
		// 	var sToDate = that.formatDateToYYYYMMDD(oToDate);

		// 	var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

		// 	oModel.read("/GetDashSet", {
		// 		filters: [
		// 			new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
		// 		],
		// 		success: function(oData) {
		// 			var oGetModel = oData.results;

		// 			// Donut Chart Data
		// 			var aChartData = oGetModel.slice(13, 20).map(function(item) {
		// 				return {
		// 					Status: item.Text,
		// 					Count: parseInt(item.CountTxt, 10) || 0
		// 				};
		// 			});

		// 			// Draw Chart after minimal delay
		// 			setTimeout(() => {
		// 				that.fn_tatchart(aChartData);
		// 			}, 0);

		// 			// Center value: Total
		// 			var iTotal = aChartData.reduce(function(sum, item) {
		// 				return sum + item.Count;
		// 			}, 0);
		// 			that.byId("idCenterValue").setText(iTotal.toString());

		// 			// Bind Model
		// 			var donutModel = new sap.ui.model.json.JSONModel({
		// 				chartData: aChartData
		// 			});
		// 			that.getView().setModel(donutModel, "DonutChartModel");
		// 		},
		// 		error: function(oError) {
		// 			console.error("Error loading data:", oError);
		// 		}
		// 	});
		// },
		onMaterialSpendChart: function() {
			var that = this;
			var oMaterialModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
			this.getView().setModel(oMaterialModel, "materialSpendModel");
			var oModel = this.getView().getModel("materialSpendModel");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/MaterialSpendSet", {
				filters: [
					new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var aResults = oData.results || [];
					var aChartData = aResults.map(function(oItem) {
						var amount = parseFloat(oItem.TOTAL_AMOUNT);
						return {
							Material: oItem.MAKTX || oItem.MATNR,
							Amount: isNaN(amount) ? 0 : amount
						};
					});

					var aSeriesData = [];
					var aCategories = [];
					aChartData.forEach(function(oItem) {
						aSeriesData.push(oItem.Amount);
						aCategories.push(oItem.Material);
					});

					// Ensure maxVal is valid
					var maxVal = aSeriesData.length ? Math.max(...aSeriesData) : 0;

					var interval;
					if (maxVal > 50000000) {
						interval = 10000000; // 1 Cr steps
					} else if (maxVal > 10000000) {
						interval = 5000000;
					} else if (maxVal > 5000000) {
						interval = 2000000;
					} else if (maxVal > 1000000) {
						interval = 1000000;
					} else if (maxVal > 500000) {
						interval = 200000;
					} else if (maxVal > 100000) {
						interval = 100000;
					} else if (maxVal > 50000) {
						interval = 50000;
					} else if (maxVal > 10000) {
						interval = 20000;
					} else if (maxVal > 1000) {
						interval = 10000;
					} else {
						interval = 1000;
					}

					var xaxisMax = Math.ceil(maxVal / interval) * interval + interval;
					xaxisMax = xaxisMax * 1.1;

					var options = {
						chart: {
							type: 'bar',
							width: "100%",
							height: '140',
							toolbar: {
								show: false
							},
							fontFamily: 'Geist',
							parentHeightOffset: 0
						},
						plotOptions: {
							bar: {
								horizontal: true,
								borderRadius: 6,
								borderRadiusApplication: 'end',
								barHeight: '60%',
								dataLabels: {
									position: 'top' // 'top' means right side for horizontal bars
								},
								colors: {
									backgroundBarColors: ['#D6DBED66'],
									backgroundBarOpacity: 1,
									backgroundBarRadius: 0
								}
							}
						},

						dataLabels: {
							enabled: true,
							position: 'top',
							offsetX: 20, // small gap from bar end

							style: {
								colors: ['#000000B2'],
								fontSize: '9px',
								fontFamily: 'Geist',
								fontWeight: 500
							},
							formatter: function(val) {
								return (
									val >= 10000000 ? (val / 10000000).toFixed(1) + ' Cr' :
									val >= 100000 ? (val / 100000).toFixed(1) + ' L' :
									val >= 1000 ? (val / 1000).toFixed(1) + ' K' : val
								);
							}
						}

						,
						series: [{
							name: 'Spend',
							data: aSeriesData,
							color: '#19AF9D'
						}],
						xaxis: {
							categories: aCategories,
							position: 'top',
							min: 0,
							max: xaxisMax,
							// tickAmount: xaxisMax / interval,
							tickAmount: 4,
							axisBorder: {
								show: true
							},
							axisTicks: {
								show: true // Optional: also hides tick marks
							},
							labels: {
								style: {
									fontFamily: 'Geist',
									fontSize: '9px',
									colors: '#000000B2'
								},
								formatter: function(val) {
									if (val >= 10000000) {
										return (val / 10000000).toFixed(0) + ' CR';
									} else if (val >= 100000) {
										return (val / 100000).toFixed(0) + ' L';
									} else if (val >= 1000) {
										return (val / 1000).toFixed(0) + ' K';
									}
									return val;
								}
							}
						},
						yaxis: {
							labels: {
								style: {
									fontFamily: 'Geist',
									fontSize: '11px',
									colors: ['#000000B2']
								},
								formatter: function(value) {
									if (value.length > 13) {
										return value.substring(0, 13) + "...";
									}
									return value;
								}
							}
						},
						grid: {
							padding: {
								bottom: -30,
								top: -20,
								left: 10,
								right: 30
							},
							show: true,
							xaxis: {
								lines: {
									show: true
								}
							},
							yaxis: {
								lines: {
									show: true
								}
							},
							borderColor: '#e5e5e5',

							strokeDashArray: 2
						},

						tooltip: {
							y: {
								formatter: function(val, opts) {
									return val; // This keeps your value unchanged
								}
							},
							x: {
								formatter: function(val, opts) {
									// Get the full category name (material name) from config
									var index = opts.dataPointIndex;
									return aCategories[index]; // This shows full name in tooltip
								}
							}
						}
					};

					// Clear existing chart and render new one
					var chartEl = document.querySelector("#materialChart");
					if (chartEl) {
						chartEl.innerHTML = "";
						var chart = new ApexCharts(chartEl, options);
						chart.render();
					}
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to load Material Spend data.");
				}
			});
		},

		fn_PostedInvChart: function(oChartData) {
			var labels = oChartData.Sales.map(item => item.InvoiceType);
			var data1 = oChartData.Sales.map(item => item.ManuallyPosted);
			var data2 = oChartData.Sales.map(item => item.ScannedInvoices);

			if (this._barChart) {
				this._barChart.destroy();
			}

			var ctx = document.getElementById("myBarChart").getContext("2d");

			this._barChart = new Chart(ctx, {
				type: "bar",
				data: {
					labels: labels,
					datasets: [{
						label: "Manually Posted",
						data: data1,
						backgroundColor: "#f4981761",
						borderColor: "#F49817",
						borderWidth: {
							top: 3,
							bottom: 0,
							left: 0,
							right: 0
						},
						barPercentage: 0.7,
						categoryPercentage: 0.5
					}, {
						label: "Scanned Invoices",
						data: data2,
						backgroundColor: "rgba(54, 186, 192, 0.55)",
						borderColor: "#36BAC0",
						borderWidth: {
							top: 3,
							bottom: 0,
							left: 0,
							right: 0
						},
						barPercentage: 0.7,
						categoryPercentage: 0.5

					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					layout: {
						padding: {
							top: 17,
							bottom: 18
						}
					},
					// plugins: {
					// 	tooltip: {
					// 		enabled: true,
					// 		callbacks: {
					// 			label: function(context) {
					// 				return `${context.dataset.label}: ${context.raw}`;
					// 			}
					// 		}
					// 	},
					// 	legend: {
					// 		display: false
					// 	},
					// 	datalabels: {
					// 		anchor: 'end',
					// 		align: 'end',
					// 		color: '#000000B2',
					// 		font: {
					// 			family: 'Geist',
					// 			size: 10

					// 		},
					// 		formatter: function(value) {
					// 			return value;
					// 		}
					// 	}
					// },
					  plugins: {
            // tooltip: {
            //   enabled: true,
            //   callbacks: {
            //     label: function(context) {
            //       return `${context.dataset.label}: ${context.raw}`;
            //     }
            //   }
            // },
            tooltip: {
  backgroundColor: "#ffffff",
  titleColor: "#000000",
  bodyColor: "#000000",
  borderColor: "#E0E0E0",
  borderWidth: 1,
  cornerRadius: 6,
  padding: 10,
  displayColors: true,

  callbacks: {
    // Title → Invoice Type
    title: function (tooltipItems) {
      return tooltipItems[0].label;
    },

    // Body → Dataset + Value
    label: function (context) {
      return context.dataset.label + ": " + context.raw;
    },

    // Footer → Optional explanation
    // footer: function (tooltipItems) {
    //   const dsLabel = tooltipItems[0].dataset.label;
    //   return dsLabel === "Manually Posted"
    //     ? "Invoices posted manually"
    //     : "Invoices processed via scanning";
    // },

    // Match tooltip color dot with bar color
    labelColor: function (context) {
      return {
        borderColor: context.dataset.borderColor,
        backgroundColor: context.dataset.borderColor
      };
    }
  }
},
            legend: {
              display: false
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              color: '#000000B2',
              font: {
                family: 'Geist',
                size: 10

              },
              formatter: function(value) {
                return value;
              }
            }
          },
					scales: {
						x: {
							ticks: {
								color: "#000000D9",
								font: {
									size: 10,
									family: 'Geist'
								}
							},

							grid: {
								color: '#e5e5e5',
								lineWidth: 1,
								borderDash: [2, 2],
								borderDashOffset: 0,
								drawOnChartArea: true,
								drawTicks: false,
								drawBorder: false
							},
							border: {
								dash: [2, 2]
							},
							barPercentage: 0.2,
							categoryPercentage: 0.5
						},
						y: {
							beginAtZero: true,
							ticks: {
								color: "#000000D9",
								font: {
									size: 10,
									family: 'Geist'
								}
							},
							grid: {
								color: '#e5e5e5',
								borderDash: [4, 4],
								drawOnChartArea: true,
								drawTicks: false,
								drawBorder: false
							},
							border: {
								dash: [2, 2]
							}
						}
					}

				},
				plugins: [ChartDataLabels]
			});
		},
		fn_AgentPerfchart: function() {
			var chartData = this.chartData || [];

			var labels = chartData.map(function(item) {
				return item.Username;
			});

			var postedData = chartData.map(function(item) {
				return item.Posted;
			});

			var inProgressData = chartData.map(function(item) {
				return item.InProgress;
			});

			document.getElementById("chart_div").innerHTML = '<canvas id="line_chart_canvas"></canvas>';

			setTimeout(() => {
				var canvas = document.getElementById("line_chart_canvas");

				canvas.width = 700;
				canvas.height = 140;

				canvas.style.width = "700px";
				canvas.style.height = "156px";

				var ctx = canvas.getContext("2d");

				if (this.oChart) this.oChart.destroy();

				this.oChart = new Chart(ctx, {
					type: 'line',
					data: {
						labels: labels,
						datasets: [{
							label: "In Progress",
							data: inProgressData,
							borderColor: "#FD6F41",
							backgroundColor: "transparent", // will be set via gradient plugin
							fill: true,
							borderWidth: 1,
							pointBackgroundColor: "#fff",
							pointBorderColor: "#FD6F41", //#FD6F41   25009D
							pointBorderWidth: 1,
							pointRadius: 3,
							tension: 0
						}, {
							label: "Posted",
							data: postedData,
							borderColor: "#2F292B",
							backgroundColor: "transparent", // will be set via gradient plugin
							fill: true,
							borderWidth: 1,
							pointBackgroundColor: "#fff",
							pointBorderColor: "#2F292B", //#2F292B  4CB150
							pointBorderWidth: 1,
							pointRadius: 3,
							tension: 0
						}]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						scales: {
							x: {
								title: {
									display: false
								},
								ticks: {
									color: "#000000B2",
									font: {
										size: 10
									},
									autoSkip: false, // Prevent skipping of labels
									maxRotation: 0, // Ensure no rotation
									minRotation: 0, // Ensure no rotation
									padding: 8 ,
								callback: function(value, index, ticks) {
            const label = this.getLabelForValue(value);
            return label.length > 7 ? label.substring(0, 7) + '…' : label;
        }
								},
								grid: {
									color: "#e5e5e5",
									borderDash: [4, 4], // Dashed horizontal lines
									borderDashOffset: 0,
									drawOnChartArea: true,
									drawTicks: false,
									drawBorder: false,
									lineWidth: 1
								},
								border: {
									dash: [2, 2]
								}
							},
							y: {
								beginAtZero: true,
								title: {
									display: false
								},
								ticks: {
									color: "#000000B2",
									font: {
										size: 10
									}
								},
								grid: {
									color: "#e5e5e5",
									borderDash: [4, 4],
									borderDashOffset: 0,
									drawOnChartArea: true,
									drawTicks: false,
									drawBorder: false,
									lineWidth: 1
								},
								border: {
									dash: [2, 2]
								},
							}
						},
						// plugins: {
						// 	legend: {
						// 		position: "top",
						// 		align: "end",
						// 		labels: {
						// 			usePointStyle: true,
						// 			pointStyle: "circle",
						// 			padding: 12,
						// 			boxWidth: 4,
						// 			boxHeight: 4,
						// 			font: {
						// 				family: "Geist",
						// 				size: 12
						// 			}
						// 		}
						// 	},
						// 	title: {
						// 		display: false
						// 	},
						// 	tooltip: {
						// 		mode: 'index',
						// 		intersect: false,
						// 		callbacks: {
								
						// 			labelColor: function(context) {
						// 				if (context.dataset.label === "In Progress") {
						// 					return {
						// 						borderColor: '#FD6F414D',
						// 						backgroundColor: '#FD6F414D' //'#25009E4D
						// 					};
						// 				} else if (context.dataset.label === "Posted") {
						// 					return {
						// 						borderColor: '#2F292B4D', //'#4CB1504D'
						// 						backgroundColor: '#2F292B4D'
						// 					};
						// 				}
						// 				return {
						// 					borderColor: '#000',
						// 					backgroundColor: '#000'
						// 				};
						// 			}
						// 		}
						// 	}

						// },
						  plugins: {
  legend: {
    position: "top",
    align: "end",
    labels: {
      usePointStyle: true,
      pointStyle: "circle",
      padding: 12,
      boxWidth: 4,
      boxHeight: 4,
      font: {
        family: "Geist",
        size: 12
      }
    }
  },

  tooltip: {
    backgroundColor: "#ffffff",
    titleColor: "#000000",
    bodyColor: "#000000",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    cornerRadius: 6,
    displayColors: true,

    callbacks: {
      // ✅ Agent Name
      title: function (tooltipItems) {
        const index = tooltipItems[0].dataIndex;
        return labels[index];
      },

      // ✅ Dataset label + value
      label: function (context) {
        return context.dataset.label + ": " + context.parsed.y;
      },

      // ✅ Match dot color
      labelColor: function (context) {
        return context.dataset.label === "In Progress"
          ? { borderColor: "#FD6F41", backgroundColor: "#FD6F414D" }
          : { borderColor: "#2F292B", backgroundColor: "#2F292B4D" };
      }
    }
  }
},
						interaction: {
							mode: 'nearest',
							axis: 'x',
							intersect: false
						}
					},
					plugins: [{
							id: 'customLegendPointColor',
							beforeInit: function(chart) {
								var datasets = chart.data.datasets;
								var legend = chart.options.plugins.legend;

								if (legend && legend.labels && legend.labels.usePointStyle) {
									legend.labels.generateLabels = function(chart) {
										return datasets.map(function(dataset, i) {
											var topGradientColor = (i === 0) ? "rgba(253, 111, 65, 0.45)" : "rgba(47, 41, 43, 0.25)";

											return {
												text: dataset.label,
												fillStyle: topGradientColor,
												strokeStyle: dataset.borderColor,
												pointStyle: 'circle',
												hidden: !chart.isDatasetVisible(i),
												datasetIndex: i
											};
										});
									};
								}
							}
						},
						// Full gradient fill plugin
						{
							id: 'dynamicFullGradient',
							beforeUpdate(chart) {
								const {
									ctx,
									chartArea
								} = chart;
								if (!chartArea) return;

								chart.data.datasets.forEach((dataset, index) => {
									const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

									if (index === 0) {
										// gradient.addColorStop(0, "rgba(37, 0, 158, 0.7)");
										// gradient.addColorStop(1, "rgba(37, 0, 158, 0)");
										  // ORANGE GRADIENT
        gradient.addColorStop(0, "rgba(253, 111, 65, 0.45)");
        gradient.addColorStop(1, "rgba(253, 111, 65, 0.05)");
										//138, 139, 245, 0
									} else {
										// gradient.addColorStop(0, "rgba(187, 227, 201, 0.7)");
										// gradient.addColorStop(1, "rgba(187, 227, 201, 0)");
										 // POSTED – NEUTRAL
        gradient.addColorStop(0, "rgba(47, 41, 43, 0.25)");
        gradient.addColorStop(1, "rgba(47, 41, 43, 0)");
									}

									dataset.backgroundColor = gradient;
								});
							}
						},
						// Custom 10px band plugin
						// {
						// 	id: 'customBandFill',
						// 	afterDatasetsDraw(chart) {
						// 		const {
						// 			ctx
						// 		} = chart;

						// 		chart.data.datasets.forEach((dataset, index) => {
						// 			const meta = chart.getDatasetMeta(index);
						// 			const points = meta.data;

						// 			if (!meta.hidden) {
						// 				ctx.save();

						// 				// Set the color for each dataset
						// 				if (index === 0) {
						// 					ctx.fillStyle = 'rgba(253, 111, 65, 0.45)';
						// 				} else {
						// 					ctx.fillStyle = 'rgba(47, 41, 43, 0.25)';
						// 				}

						// 				points.forEach((point, i) => {
						// 					if (i < points.length - 1) {
						// 						const current = points[i];
						// 						const next = points[i + 1];

						// 						const yOffset = 5;

						// 						// Check: draw band only if both points are above Y-axis (y > 0 in chart scale)
						// 						if (current.y < chart.chartArea.bottom && next.y < chart.chartArea.bottom) {

						// 							ctx.beginPath();
						// 							ctx.moveTo(current.x, current.y);
						// 							ctx.lineTo(next.x, next.y);
						// 							ctx.lineTo(next.x, next.y + yOffset);
						// 							ctx.lineTo(current.x, current.y + yOffset);
						// 							ctx.closePath();
						// 							ctx.fill();
						// 						}
						// 					}
						// 				});

						// 				ctx.restore();
						// 			}
						// 		});
						// 	}
						// }
					]
				});

				setTimeout(() => {
					this.oChart.update();
				}, 300);
			}, 0);
		},
		fn_fragpagetip: function(oEvent) {
			// 		if (!this.Value) {
			// 	this.Value = sap.ui.xmlfragment("FSC_WB_AP.fragment.Pagetip", this);
			// 	this.getView().addDependent(this.Value);
			// }
			// this.Value.open();

			var oButton = oEvent.getSource();
			if (!this.PageTip) {
				this.PageTip = sap.ui.xmlfragment(
					"FSC_WB_AP.fragment.Pagetip",
					this
				);
				this.getView().addDependent(this.PageTip);

			}

			this.PageTip.openBy(oButton);

		},
		fn_nav_to_wb: function(oEvent) {
			var t_flag = "N";
			var QueueID = parseInt(oEvent.getSource().getBindingContext('JSInvdet').getProperty('Qid'));
			var Bukrs = oEvent.getSource().getBindingContext('JSInvdet').getProperty('Bukrs');
			var Stats = oEvent.getSource().getBindingContext('JSInvdet').getProperty('Stats');
			var oType = 'X';
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("Workbench", {
				"QueueID": QueueID,
				"Bukrs": Bukrs,
				"Stats": Stats,
				"UserType": UserType,
				"NavScreen": "DashBoard",
				"Flag": t_flag,
				"Type": oType
			});

			// this.oRouter.navTo('');
		},
		fn_newbutton: function(oEvent) {
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("Capture");
			var oButton = oEvent.getSource();
			if (!this.CaptureOp) {
				this.CaptureOp = sap.ui.xmlfragment(
					"FSC_WB_AP.fragment.Captureselect",
					this
				);
				this.getView().addDependent(this.CaptureOp);

			}
			this.CaptureOp.openBy(oButton);
			// this.CaptureOp.open();
		},
		fn_nonposelect: function() {
			var c_flag = "D";
			var Flagcon;
			Flagcon = c_flag + '-' + "Non Po";
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("CaptureCenter", {
				"cFlag": Flagcon
			});
			sap.ui.getCore().AppController.handleNavigationPress(null, "hboxCapture");

		},
		fn_poselect: function() {
			var c_flag = "D";
			var Flagcon;
			Flagcon = c_flag + '-' + "PO";
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.navTo("CaptureCenter", {
				"cFlag": Flagcon
			});
			sap.ui.getCore().AppController.handleNavigationPress(null, "hboxCapture");
		},
		fn_dashrefresh: function() {
			location.reload();
		},
		onSegmentPress: function(oEvent) {

			var oHBox = this.byId("idCustomSegmentGroup");
			var aButtons = oHBox.getItems();

		// Update button styles
			aButtons.forEach(function(btn) {
				btn.removeStyleClass("clSegmentBtnImg");
					btn.removeStyleClass("cl_segmentBtnSelected");
				btn.addStyleClass("cl_segmentBtnUnselected");
			});
			var oClickedBtn = oEvent.getSource();
			oClickedBtn.removeStyleClass("cl_segmentBtnUnselected");
			oClickedBtn.addStyleClass("cl_segmentBtnSelected");
				oClickedBtn.addStyleClass("clSegmentBtnImg");
			
		

			// Get selected tab
			var selectedValue = oClickedBtn.getCustomData().find(d => d.getKey() === "value").getValue();

			// Show/hide VBoxes
			this.byId("idOverviewVBox").setVisible(selectedValue === "W");
			this.byId("idSpendVBox").setVisible(selectedValue === "I");
			this.byId("idIncomeExpense").setVisible(selectedValue === "incomExp");
			this.byId("idExpComp").setVisible(selectedValue === "E");
				this.byId("idAPPer").setVisible(selectedValue === "AP");

			//     this.byId("idOverviewVBox").setVisible(false);
			// this.byId("idSpendVBox").setVisible(false);
			// this.byId("idIncomeExpense").setVisible(true);

			// Load data based on tab
			//line commented by yasin start
			if (selectedValue === "W") {
				this.fn_LoadData();
			} else if (selectedValue === "incomExp") {

				setTimeout(() => {
					this.fnIncomeExpenseCall();

				}, 0);
			} else if (selectedValue === "E") {
				this.fn_MaterialCurrentChartCall();
				this.fn_MaterialMonthCurrentChartCall();
				this.fn_AccountsGroupCurrentCall();
				this.fn_AccountsGroupLast();

			} else if (selectedValue === "AP") {
        this.fnExalcaVolumeChart();
          this.fn_ScanToPostTATChart();
               this.fnInvoiceToPostAvgDaysChart();
                 this.fnScanToPostAvgDaysStackedChart();
             this.fnParkingTurnAroundTimeChart();
             this.fnPostingTATDonutChart();
             this.fn_WorkQueueScanAgeingChart();
        this.fn_WorkQueueMore2DaysChart();
       
      }  else {
				this.fnSearchTo(this._grnFromDate, this._grnToDate);

			}
			//line commented by yasin end
		},

		fnSearchTo: function(sFromDate, sToDate) {
			var vError = false;
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			if (vError === false) {
				var that = this;
				var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
				var oDataModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

				sFromDate = sFromDate || this._grnFromDate;
				sToDate = sToDate || this._grnToDate;
				this.fnTop5collectionChart(sFromDate, sToDate);

				var toDate = new Date(); // today
				// Get today's date
				var today = new Date();

				// === This Week (Monday to Saturday) ===
				var day = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
				var diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1); // move to Monday
				var monday = new Date(today.setDate(diffToMonday));
				var saturday = new Date(monday);
				saturday.setDate(monday.getDate() + 5); // 5 days after Monday = Saturday

				// === Next Week (next Monday to next Saturday) ===
				var nextMonday = new Date(saturday);
				nextMonday.setDate(saturday.getDate() + 2); // jump to next Monday
				var nextSaturday = new Date(nextMonday);
				nextSaturday.setDate(nextMonday.getDate() + 5);

				// Helper function for display format: "30/7/25"
				function formatDisplayDate(date) {
					return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear().toString().slice(2);
				}

				// Build model
				var oDateModel = new sap.ui.model.json.JSONModel({
					todayLabel: formatDisplayDate(new Date()),
					thisWeekLabel: formatDisplayDate(monday) + " To " + formatDisplayDate(saturday),
					nextWeekLabel: formatDisplayDate(nextMonday) + " To " + formatDisplayDate(nextSaturday)
				});

				this.getView().setModel(oDateModel, "DateModel");

				var sToDate1 = toDate.getFullYear() + "-" +
					String(toDate.getMonth() + 1).padStart(2, '0') + "-" +
					String(toDate.getDate()).padStart(2, '0');
				sap.ui.core.BusyIndicator.show(0);
				oDataModel.read('/VendorInvoiceLineItemSet', {
					filters: [
						new sap.ui.model.Filter("BLDAT", sap.ui.model.FilterOperator.BT, sToDate1, sToDate1)
						// new Filter("BLDAT", FilterOperator.BT ,"2025-06-09" , "2025-07-09")
					],
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						// Sort by DMBTR descending
						var aSortedResults = oData.results.sort(function(a, b) {
							return b.DMBTR - a.DMBTR;
						});

						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(aSortedResults);
						that.getView().setModel(oModel, "jsvenline");
						var oTable = that.byId("id_table");
						if (oTable) {
							oTable.setVisibleRowCount(aSortedResults.length);
						}
					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("Failed to load invoice data");
					}
				});
				this.populateDropdownValues(today);
				var todayKey = this.getFormattedDate(today); // should match the format used in key

				// var oComboBox = this.byId("idNextWeekDays");
				// if (oComboBox) {
				//   oComboBox.setSelectedKey(todayKey);
				//   this.onTodayCardClick({
				//         currentTarget: oComboBox.getDomRef() // simulate DOM element clicked
				//     });
				// }
				var oComboBox = this.byId("idNextWeekDays");
				if (oComboBox) {
					oComboBox.setSelectedKey(todayKey);

					// Simulate clicking the Today card
					var oTodayCard = this.byId("idCardToday");
					this.onTodayCardClick({
						currentTarget: oTodayCard.getDomRef()
					});
				}
				sap.ui.core.BusyIndicator.show(0);
				oDataModel2.read('/AdvanceNonpoSet', {
					filters: [
						new sap.ui.model.Filter("Fromdate", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
					],
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						var oHBModel = new sap.ui.model.json.JSONModel();
						oHBModel.setData(oData.results);
						that.getView().setModel(oHBModel, "houseBank");
						var oHtml = new sap.ui.core.HTML({
							content: '<canvas id="houseBankChart" height="133px" ></canvas>'
						});
						var oBox = that.getView().byId("houseBankChartWrapper");
						// Only remove previous chart HTML, not the title
						// const existingHtml = oBox.getItems().find(item => item instanceof sap.ui.core.HTML);
						// if (existingHtml) {
						//     oBox.removeItem(existingHtml);
						// }
						oBox.addItem(oHtml);
						// Wait for canvas to render before drawing chart
						setTimeout(function() {
							that.onHouseBankChart(oData.results);
						}, 100);
					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("Failed to load house bank data.");
					}
				});
				sap.ui.core.BusyIndicator.show(0);
				oDataModel.read('/Ven_OverduedateSet', {
					filters: [
						new Filter("Budat", FilterOperator.BT, sFromDate, sToDate)
					],
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						var odata1 = new sap.ui.model.json.JSONModel();
						odata1.setData(oData.results);
						for (var i = 0; i < oData.results.length; i++) {
							oData.results[i].Percentage = parseInt(oData.results[i].Percentage);
						}
						that.getView().setModel(odata1, "JMSlider");
						JDue = oData.results;
						that.onGetDue(oData.results);
					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("Http request failed");
					}
				});
				sap.ui.core.BusyIndicator.show(0);
				oDataModel.read('/MonthComparisonSet', {
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						var odata2 = new sap.ui.model.json.JSONModel();
						odata2.setData(oData.results);
						that.getView().setModel(odata2, "JMDaily");

						that.fn_ExpenseMonthChart(oData.results);
					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("Http request failed");
					}
				});
				sap.ui.core.BusyIndicator.show(0);
				oDataModel2.read('/AdvancePOSet', {
					filters: [
						new Filter("Fromdate", FilterOperator.BT, sFromDate, sToDate)
					],
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						const aResults = oData.results || [];
						// Create a map of Lifnr to Name1
						const nameMap = {};
						aResults.forEach(item => {
							nameMap[item.Lifnr] = item.Name1;
						});
						const aFormattedData = aResults
							.map(item => ({
								x: item.Lifnr,
								y: parseFloat(item.TotalAmount)
							}))
							.sort((a, b) => b.y - a.y);
						// setTimeout(function () {
						that.fnAdvancePOchart(aFormattedData, nameMap);
						// }, 100);
					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("Http request failed");
					}
				});

				this.fnTop5GLChart(sFromDate, sToDate);

				this.fnLocationWiseChart();
				setTimeout(() => {

					this.drawYTDBarChart();
					// this.fn_ExpenseMonthChart();
					this.onMaterialSpendChart();
					this.fnTop5CustomerChart();
					//this.fnAdvancePOchart();

				}, 500);
				// // setTimeout(() => {
				//             this.fnTop5CustomerChart();
				//              this.fnLocationWiseChart();
				//                this.onMaterialSpendChart();
				//              //this.fnAdvancePOchart();
				//         // }, 0);
			}
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
				oPrevBtn.setVisible(this.iCurrentPage > 1);
			}
			if (oNextBtn) {
				oNextBtn.setVisible(this.iCurrentPage < iTotalPages);
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
						justifyContent: "Start", // Align content to the top
						alignItems: "Center", // Center horizontally
						height: "32px" // Optional: control total height
					});

					oPageBox.addItem(oVBox);
				} else {
					addPageButton(page);
				}

			}
		},
		fnHalfDonutChart: function(otherCount, overdueCount, paymentAmount, totalBlockCount) {
			// Remove existing canvas if any
			var oldCanvas = document.getElementById("half_donut_canvas");
			if (oldCanvas) {
				oldCanvas.remove();
			}

			var canvas = document.createElement("canvas");
			canvas.id = "half_donut_canvas";
			document.querySelector("#donut-center-text").parentElement.insertBefore(canvas, document.querySelector("#donut-center-text"));

			var ctx = canvas.getContext("2d");

			if (this.oHalfDonutChart) {
				this.oHalfDonutChart.destroy();
			}

			// Center text
			document.getElementById("donut-center-text").innerHTML =
				"<div style='font-size: 22px; font-weight: bold;'>" + totalBlockCount + "</div>" +
				"<div style='font-size: 12px; color: #667085;'>" + paymentAmount + "</div>" +
				"<div style='font-size: 12px; color: #202124;'>Payment Block</div>";

			// Draw chart
			this.oHalfDonutChart = new Chart(ctx, {
				type: 'doughnut',
				data: {
					labels: ["Other Pay. Block", "Overdue Pay. Block"],
					datasets: [{
						data: [otherCount, overdueCount],
						backgroundColor: ["#25009D", "#4DB151"],
						borderWidth: 0,
						hoverOffset: 4,
						hoverBorderColor: "#B1D6FF", // Light blue border on hover
						hoverBorderWidth: 4, // Thickness of border on hover
						hoverOffset: 4
					}]
				},
				options: {
					cutout: '80%',
					rotation: -90,
					circumference: 180,
					responsive: true,
					layout: {
						padding: {
							left: 5,
							right: 5,
							top: 0,
							bottom: 0
						}
					},
					// plugins: {
					// 	legend: {
					// 		display: true,
					// 		position: 'bottom',
					// 		labels: {
					// 			usePointStyle: true,
					// 			font: {
					// 				size: 10
					// 			}
					// 		}
					// 	},
					// 	tooltip: {
					// 		enabled: true
					// 	}
					// },
					 plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                font: {
                  size: 10
                }
              }
            },
            // tooltip: {
            //   enabled: true
            // }
            tooltip: {
  backgroundColor: "#ffffff",
  titleColor: "#000000",
  bodyColor: "#000000",
  borderColor: "#E0E0E0",
  borderWidth: 1,
  padding: 10,
  cornerRadius: 6,
  displayColors: true,

  callbacks: {
    // Title → Payment Block type
    title: function (tooltipItems) {
      return tooltipItems[0].label;
    },

    // Label → Count
    label: function (context) {
      return "Count: " + context.parsed;
    },

    // Footer → Optional description
    // footer: function (tooltipItems) {
    //   const label = tooltipItems[0].label;
    //   return label === "Other Pay. Block"
    //     ? "Includes non-overdue payment blocks"
    //     : "Payments blocked due to overdue";
    // },

    // Color dot matching slice
    labelColor: function (context) {
      return {
        borderColor: context.dataset.backgroundColor[context.dataIndex],
        backgroundColor: context.dataset.backgroundColor[context.dataIndex]
      };
    }
  }
}

          },
					onClick: (event, elements, chart) => {
						if (elements.length > 0) {
							const index = elements[0].index;
							const label = chart.data.labels[index];

							let statusText = "";
							if (label === "Other Pay. Block") {
								statusText = "Payment Blocked";
							} else if (label === "Overdue Pay. Block") {
								statusText = "Overdue Payment Block";
							}

							if (statusText) {
								this.onPayBlockBoxClick(statusText); // pass status text instead of count
							}
						}
					}

				}

			});
		},
		onPayBlockBoxClick: function(statusText) {
			var that = this;

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			this.getView().setModel(oModel);
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/PayBlockDetailSet", {
				filters: [
					new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
				],
				success: function(oData) {

					sap.ui.core.BusyIndicator.hide();
					//  Filter locally in frontend based on clicked statusText
					var aFiltered = oData.results.filter(function(item) {
						return item.StatusText === statusText;
					});

					var oJSONModel = new sap.ui.model.json.JSONModel({
						items: aFiltered
					});

					that.getView().setModel(oJSONModel, "payBlockModel");

					if (!that._oPayBlockDialog) {
						that._oPayBlockDialog = sap.ui.xmlfragment("FSC360NEW.fragment.paymentblocktab", that);
						that.getView().addDependent(that._oPayBlockDialog);
					}

					that._oPayBlockDialog.open();
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to fetch Pay Block data");
				}
			});
		},

		handleOtherClick: function(value) {
			alert("Other Payment Block clicked! Value: " + value);
		},
		handleOverdueClick: function(value) {
			alert("Overdue Payment Block clicked! Value: " + value);
		},
		onTodayCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);
			$(".dateBoxText").removeClass("nextWeekTextSelected thisWeekBoxTextSelected");
			$clickedCard.addClass("dateBoxTextSelected");

			const today = new Date();
			const sFormattedToday = today.toLocaleDateString('en-GB', {
				weekday: 'long',
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});

			const oComboBox = this.byId("idNextWeekDays");
			oComboBox.setSelectedKey(""); // unselect dropdown
			oComboBox.setValue(sFormattedToday); // set formatted label

			this.fn_TodayData(); // fetch data
		},
		onThisWeekCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);
			$(".dateBoxText").removeClass("nextWeekTextSelected dateBoxTextSelected");
			$clickedCard.addClass("thisWeekBoxTextSelected");

			// Get the date range string from model
			const sThisWeekLabel = this.getView().getModel("DateModel").getProperty("/thisWeekLabel");

			// Set dropdown input text to this week label (visually only)
			const oComboBox = this.byId("idNextWeekDays");
			oComboBox.setSelectedKey(""); // no item selected
			oComboBox.setValue(sThisWeekLabel);

			// Now load data
			this.fn_thisWeekData();
		},
		onNextWeekCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);
			$(".dateBoxText").removeClass("dateBoxTextSelected thisWeekBoxTextSelected");
			$clickedCard.addClass("nextWeekTextSelected");

			const sNextWeekLabel = this.getView().getModel("DateModel").getProperty("/nextWeekLabel");

			const oComboBox = this.byId("idNextWeekDays");
			oComboBox.setSelectedKey(""); // Unselect any dropdown item
			oComboBox.setValue(sNextWeekLabel); // Set visible input text

			// Load data for next week
			this.fn_NextWeekData();
		},
		onTotalCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);

			$(".cl_container_d").removeClass("cardSelected total_card_selected with_you_selected unassign_selected ontime_selected");
			$(".cl_card_invamt").removeClass("text-blue");
			$(".cl_card_pendingamt").removeClass("text-blue");
			$(".cl_card_postscanamt").removeClass("text-blue");
			$(".cl_card_tdypostamt").removeClass("text-blue");
			$(".iconBackgroundtodayinvff").removeClass("iconBackgroundactiveff");

			$clickedCard.addClass("cardSelected total_card_selected");
			$clickedCard.addClass("cardSelected total_card_selected ");
			$clickedCard.find(".cl_card_invamt").addClass("text-blue");
			$clickedCard.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");
			this.byId("idCardTitle").setText("In Progress");
			this.fn_inProgress();
		},
		onUnassignCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);
			$(".cl_container_d").removeClass("cardSelected total_card_selected with_you_selected unassign_selected ontime_selected");
			$(".cl_card_invamt").removeClass("text-blue");
			$(".cl_card_invamt").removeClass("text-blue");
			$(".cl_card_pendingamt").removeClass("text-blue");
			$(".cl_card_postscanamt").removeClass("text-blue");
			$(".cl_card_tdypostamt").removeClass("text-blue");
			$(".iconBackgroundtodayinvff").removeClass("iconBackgroundactiveff");

			$clickedCard.addClass("cardSelected unassign_selected");
			$clickedCard.find(".cl_card_pendingamt").addClass("text-blue");
			$clickedCard.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");
			this.byId("idCardTitle").setText("Pending with Approver");
			this.fn_pendingApprover();
		},
		onWithYouCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);
			$(".cl_container_d").removeClass("cardSelected total_card_selected with_you_selected unassign_selected ontime_selected");
			$(".cl_card_invamt").removeClass("text-blue");
			$(".cl_card_pendingamt").removeClass("text-blue");
			$(".cl_card_postscanamt").removeClass("text-blue");
			$(".cl_card_tdypostamt").removeClass("text-blue");
			$clickedCard.addClass("cardSelected with_you_selected");
			$clickedCard.find(".cl_card_postscanamt").addClass("text-blue");
			$clickedCard.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");
			this.byId("idCardTitle").setText("Pending for Scanning");
			this.fn_grnPending();
		},
		onOntimeCardClick: function(oEvent) {
			const $clickedCard = $(oEvent.currentTarget);
			$(".cl_container_d").removeClass("cardSelected total_card_selected with_you_selected unassign_selected ontime_selected");
			$(".cl_card_invamt").removeClass("text-blue");
			$(".cl_card_pendingamt").removeClass("text-blue");
			$(".cl_card_postscanamt").removeClass("text-blue");
			$(".cl_card_tdypostamt").removeClass("text-blue");
			$clickedCard.addClass("cardSelected ontime_selected");
			$clickedCard.find(".cl_card_tdypostamt").addClass("text-blue");
			$clickedCard.find(".iconBackgroundtodayinvff").addClass("iconBackgroundactiveff");
			this.byId("idCardTitle").setText("Parked");
			this.fn_parked();
		},
		drawYTDBarChart: function() {
			if (this._ytdChartDrawn) return;
			this._ytdChartDrawn = true;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");

			const currentYear = new Date().getFullYear().toString(); // e.g. "2025"
			const previousYear = (new Date().getFullYear() - 1).toString(); // e.g. "2024"
			const that = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/YearExpSet", {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					const results = oData.results;

					const prevYearData = new Array(12).fill(0);
					const currYearData = new Array(12).fill(0);

					let currYearYTD = 0;
					let prevYearYTD = 0;

					results.forEach(item => {
						const year = item.GJAHR;
						const month = parseInt(item.MONTH, 10) - 1;
						const amount = parseFloat(item.AMOUNT) || 0;

						if (year === previousYear) {
							prevYearData[month] += amount;
							prevYearYTD += amount;

						} else if (year === currentYear) {
							currYearData[month] += amount;
							currYearYTD += amount;

						}
					});

					const formatAmountCrOrLakh = (amt, withDecimals = true) => {
						if (amt >= 10000000) {
							return withDecimals ? (amt / 10000000).toFixed(1) + " Cr" : Math.round(amt / 10000000) + " Cr";
						} else if (amt >= 100000) {
							return withDecimals ? (amt / 100000).toFixed(1) + " L" : Math.round(amt / 100000) + " L";
						} else {
							return withDecimals ? amt.toFixed(0) : Math.round(amt).toString();
						}
					};

					document.querySelector("#ytdCurrentAmount").innerText = formatAmountCrOrLakh(currYearYTD);
					document.querySelector("#ytdPreviousAmount").innerText = formatAmountCrOrLakh(prevYearYTD);
				

					setTimeout(() => {
						const chartContainer = document.querySelector("#ytdChart");

						if (chartContainer && typeof ApexCharts !== "undefined") {
							const options = {
								chart: {
									type: 'bar',
									height: 140,

									stacked: true,
									toolbar: {
										show: false
									},
									animations: {
										enabled: true,
										easing: 'easeinout',
										speed: 800
									},
									offsetY: -25,
									offsetX: -15
								},
								plotOptions: {
									bar: {
										columnWidth: '73%',
										borderRadius: 0
									}
								},
								series: [{
									name: previousYear,
									data: prevYearData
								}, {
									name: currentYear,
									data: currYearData
								}],
								colors: ['#175EE6', '#4DB151'],
								xaxis: {
									categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
									labels: {
										style: {
											fontSize: '9px'
										},
										offsetY: -6
									},
									axisTicks: {
										show: false
									},
									axisBorder: {
										show: false
									}
								},
								yaxis: {
									tickAmount: 2,
									labels: {
										formatter: val => formatAmountCrOrLakh(val, false), // <-- No decimals here
										style: {
											fontSize: '9px'
										}
									}
								},
								grid: {
									yaxis: {
										lines: {
											show: true
										}
									},
									xaxis: {
										lines: {
											show: true
										}
									},
									strokeDashArray: 2
								},
								legend: {
									position: 'bottom',
									horizontalAlign: 'center',
									fontSize: '9px',
									fontFamily: 'Geist',
									markers: {
										width: 5,
										height: 5,
										radius: 1
									}

								},
								dataLabels: {
									enabled: false
								},
								tooltip: {
									y: {
										formatter: val => val + " "
									}
								}
							};

							const chart = new ApexCharts(chartContainer, options);
							chart.render();
						}
					}, 300);
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();

				}
			});
		},

		fn_ExpenseMonthChart: function(aBackendData) {
			const today = new Date();
			const year = today.getFullYear();
			const monthIndex = today.getMonth();
			const monthName = today.toLocaleString("default", {
				month: "short"
			});
			const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

			const labels = [];
			const dataCurrent = [];
			const dataPrev = [];

			for (let i = 1; i <= daysInMonth; i++) {
				const entry = aBackendData.find(e => parseInt(e.day) === i);
				labels.push(`${i} ${monthName}`);

				const curr = entry ? parseFloat(entry.amount_curr) : 0;
				const prev = entry ? parseFloat(entry.amount_prev) : 0;

				dataCurrent.push(curr >= 0 ? curr : 0);
				dataPrev.push(prev >= 0 ? prev : 0);
			}

			const sumCurr = dataCurrent.reduce((a, b) => a + b, 0);
			const sumPrev = dataPrev.reduce((a, b) => a + b, 0);

			const formatAmount = val => {
				if (val >= 1e7) return (val / 1e7).toFixed(1).replace(/\.0$/, '') + " Cr";
				if (val >= 1e5) return (val / 1e5).toFixed(1).replace(/\.0$/, '') + " L";
				if (val >= 1e3) return (val / 1e3).toFixed(1).replace(/\.0$/, '') + " K";
				return val.toString();
			};

			const formattedCurr = formatAmount(sumCurr);
			const formattedPrev = formatAmount(sumPrev);

			const currentMonthLabel = `${monthName} ${year}`;
			const prevMonthLabel = `${monthName} ${year - 1}`;

			const oHTML = this.getView().byId("idChartHtmlExpense");
			const htmlContent =
				`
			<div style="display: flex; flex-direction: column; align-items: center; font-family: Geist; width: 100%; ">
			 
			  <!-- First Line: "For the Month" center aligned -->
			<div style="font-size: 12px; color: #202124; margin-bottom: 2px;">
			    For the Month
			</div>
			 
			  <!-- Second Line: three blocks -->
			<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 10px; padding-bottom: 5px;">
			 
			    <!-- Left Block -->
			<div style="display: flex; flex-direction: column;">
			<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px; font-size: 12px; color: #202124;">
			<span>${currentMonthLabel}</span>
			<span style="border: 1px solid #ccc; border-radius: 10px; padding: 2px 6px; font-size: 9px; color: #5F6369;">
			          Current Year Month
			</span>
			</div>
			<div style="font-size: 15px; font-weight: 600;">${formattedCurr}</div>
			</div>
			 
			    <!-- Center VS with vertical line -->
			<div style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;">
			<div style="height: 10px; width: 1px; background-color: #ccc;"></div>
			<div style="border: 1px solid #ccc; font-weight: 600; border-radius: 50px; padding: 4px 5px; font-size: 12px;">VS</div>
			<div style="height: 10px; width: 1px; background-color: #ccc;"></div>
			</div>
			 
			    <!-- Right Block -->
			<div style="display: flex; flex-direction: column; text-align: right;">
			<div style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; font-size: 12px; color: #202124;">
			<span style="border: 1px solid #ccc; border-radius: 10px; padding: 2px 6px; font-size: 9px; color: #5F6369;">
			          Last Year Month
			</span>
			<span>${prevMonthLabel}</span>
			</div>
			<div style="font-size: 15px; font-weight: 600;">${formattedPrev}</div>
			</div>
			 
			  </div>
			<div style="padding: 0 0px; width: 100%;">
			<canvas id="curve_chart_canvas" height="103"></canvas>
			</div>
			</div>
			`;
			oHTML.setContent(htmlContent);

			//Chart setup
			setTimeout(() => {
				const canvas = document.getElementById("curve_chart_canvas");
				if (!canvas) return;

				const ctx = canvas.getContext("2d");
				if (this.oChart) this.oChart.destroy();

				const gradientGreen = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
				gradientGreen.addColorStop(0, "rgba(76, 177, 80, 0.2)");
				gradientGreen.addColorStop(1, "rgba(180, 230, 180, 0)");

				const gradientBlue = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
				gradientBlue.addColorStop(0, "rgba(23, 94, 230, 0.2)");
				gradientBlue.addColorStop(1, "rgba(180, 210, 250, 0)");

				const customBandFill = {
					id: 'customBandFill',
					beforeDatasetDraw(chart, args) {
						const dataset = chart.data.datasets[args.index];
						const meta = chart.getDatasetMeta(args.index);
						const points = meta.data;
						const yOffset = 5;

						if (!points || points.length === 0) return;

						const {
							ctx
						} = chart;
						ctx.save();
						ctx.beginPath();

						let started = false;
						for (let i = 0; i < points.length; i++) {
							const val = dataset.data[i];
							if (val > 0) {
								if (!started) {
									ctx.moveTo(points[i].x, points[i].y);
									started = true;
								} else {
									ctx.lineTo(points[i].x, points[i].y);
								}
							} else {
								if (started) {
									// close previous non-zero segment
									for (let j = i - 1; j >= 0 && dataset.data[j] > 0; j--) {
										ctx.lineTo(points[j].x, points[j].y + yOffset);
									}
									ctx.closePath();
									ctx.fillStyle = args.index === 0 ? 'rgba(76, 177, 80, 0.12)' : 'rgba(23, 94, 230, 0.12)';
									ctx.fill();
									ctx.beginPath();
									started = false;
								}
							}
						}

						// Close and fill last segment if ended on non-zero
						if (started) {
							for (let j = points.length - 1; j >= 0 && dataset.data[j] > 0; j--) {
								ctx.lineTo(points[j].x, points[j].y + yOffset);
							}
							ctx.closePath();
							ctx.fillStyle = args.index === 0 ? 'rgba(76, 177, 80, 0.12)' : 'rgba(23, 94, 230, 0.12)';
							ctx.fill();
						}

						ctx.restore();
					}
				};

				this.oChart = new Chart(ctx, {
					type: "line",
					data: {
						labels: labels,
						datasets: [{
							label: year.toString(),
							data: dataCurrent,
							borderColor: "#4CB150",
							backgroundColor: gradientGreen,
							fill: 'start',
							tension: 0.4,
							pointRadius: 0,
							borderWidth: 1
						}, {
							label: (year - 1).toString(),
							data: dataPrev,
							borderColor: "#175EE6",
							backgroundColor: gradientBlue,
							fill: 'start',
							tension: 0.4,
							pointRadius: 0,
							borderWidth: 1
						}]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						layout: {
							padding: {
								bottom: 0,
								top: 0
							}
						},
						scales: {
							x: {
								offset: true,

								ticks: {
									callback: function(val, index) {
										return '';

									},
									color: "#000000B2",
									font: {
										size: 9
									},
									maxRotation: 0,
									minRotation: 0,
									autoSkip: false,
									padding: 6
								},
								grid: {
									color: "#e5e5e5",
									borderDash: [4, 4],
									borderDashOffset: 0,
									drawOnChartArea: true,
									drawTicks: false,
									drawBorder: false,
									lineWidth: 1
								},
								border: {
									dash: [2, 2]
								}
							},
							y: {
								beginAtZero: true,
								ticks: {
									callback: value => formatAmount(value),
									color: "#000000B2",
									font: {
										size: 9
									}
								},
								grid: {
									color: "#e5e5e5",
									borderDash: [4, 4],
									borderDashOffset: 0,
									drawOnChartArea: true,
									drawTicks: false,
									drawBorder: false,
									lineWidth: 1
								},
								border: {
									dash: [2, 2]
								}
							}
						},
						plugins: {
							legend: {
								display: true,
								position: "bottom",
								labels: {
									usePointStyle: true,
									pointStyle: "line",
									color: "#000000B2",
									font: {
										size: 9,
										family: "Geist"
									},
									padding: 10
								}
							},
							// tooltip: {
							// 	mode: "index",
							// 	intersect: false,
							// 	callbacks: {
							// 		label: function(ctx) {
							// 			return ctx.dataset.label + ": " + formatAmount(ctx.parsed.y);
							// 		}
							// 	}
							// }
							tooltip: {
	mode: "index",
	intersect: false,
	backgroundColor: "#ffffff",
	titleColor: "#000000",
	bodyColor: "#000000",
	borderColor: "#ccc",
	borderWidth: 1,
	padding: 10,
	cornerRadius: 6,
	displayColors: true,

	callbacks: {
		title: function(tooltipItems) {
			// Example: "12 Mar"
			return tooltipItems[0].label;
		},
		label: function(ctx) {
			return ctx.dataset.label + ": " + formatAmount(ctx.parsed.y);
		}
	}
}
						},
						interaction: {
							mode: "nearest",
							intersect: false
						}
					},
					plugins: [customBandFill]
				});
			}, 0); // Allow DOM to render first
		},

		setHeaderForStandardCards: function() {
			var oHeaderModel = new sap.ui.model.json.JSONModel({
				col1: "Queue ID",
				col2: "Date",
				col3: "Time",
				col4: "Invoice ",
				col5: "Invoice Number",
				col6: "Invoice Type",
				col7: "Vendor",
				col8: "Plant",
				col9: "Agent",
				col10: "Status",
				showInvoiceIcon: true
			});
			this.getView().setModel(oHeaderModel, "headerModel");
		},

		fn_inProgress: function() {
			var that = this;
			that.setHeaderForStandardCards();
			that.aFilteredData = that.aFullData.filter(function(row) {
				return row.Stats === "S15" || row.Stats === "S20";
			});
			that.iCurrentPage = 1;
			that.updatePaginatedModel();
		},
		fn_pendingApprover: function() {
			var that = this;
			that.setHeaderForStandardCards();
			that.aFilteredData = that.aFullData.filter(function(row) {
				return row.Stats === "S30";
			});
			that.iCurrentPage = 1;
			that.updatePaginatedModel();
		},
		fn_parked: function() {
			var that = this;
			that.setHeaderForStandardCards();
			that.aFilteredData = that.aFullData.filter(function(row) {
				return row.Stats === "S40";
			});
			that.iCurrentPage = 1;
			that.updatePaginatedModel();
		},

		fn_grnPending: function() {
		    this._sActiveTile = "GRN";
		    var that = this;
		    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
		    sap.ui.core.BusyIndicator.show(0);
		    oModel.read("/GrnPendingSet", {
		        filters: [
		            new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
		        ],
		        success: function(oData) {
		            sap.ui.core.BusyIndicator.hide();
		            var arr = oData.results.map(function(row) {
		                return {
		                    Qid: row.Mblnr,
		                    Qiddate: row.Bldat,
		                    Invno: row.InvNo,
		                    Invdesc: row.InvTyp,
		                    Name1: row.Vendor,
		                    Bukrs: row.Plant,
		                    Username: row.PoNo,
		                    DisplayStatus: row.Status
		                };
		            });
		
		            // store separately
		            that.aGrnData = arr;
		            that.aFilteredData = arr.slice();
		
		            that.iCurrentPage = 1;
		            that.updatePaginatedModel();
		
		            var oHeaderModel = new sap.ui.model.json.JSONModel({
		                col1: "Grn",
		                col2: "Date",
		                col3: "Time",
		                col4: "Invoice",
		                col5: "Invoice Number",
		                col6: "Invoice Type",
		                col7: "Vendor",
		                col8: "Plant",
		                col9: "Po Number",
		                col10: "Status",
		                showInvoiceIcon: false
		            });
		            that.getView().setModel(oHeaderModel, "headerModel");
		        },
		        error: function() {
		            sap.ui.core.BusyIndicator.hide();
		            sap.m.MessageToast.show("Failed to load Missing GRNs");
		        }
		    });
		},

		onClosePayBlockDialog: function() {
			sap.ui.getCore().byId("id_payblock_dialog").close();
		},
		onDownloadPayBlockExcel: function() {
			// Get table data from the model
			var oModel = this.getView().getModel("payBlockModel");
			var aItems = oModel.getProperty("/items");

			if (!aItems || aItems.length === 0) {
				MessageToast.show("No data available to download.");
				return;
			}

			// Define column headers (same order as in table)
			var aHeader = ["Queue Id", "Document No", "BELNR", "Year", "Payment Term", "Vendor", "Status"];

			// Start building CSV string
			var sCsv = aHeader.join(",") + "\n"; // header row

			aItems.forEach(function(item) {
				var aRow = [
					'\t' + item.Qid + ' ', // Add space to widen
					'\t' + item.Documentnumber + ' ',
					item.Belnr,
					item.Gjahr,
					'\t' + item.Zterm,
					item.Lifnr,
					item.StatusText
				];
				sCsv += aRow.join(",") + "\n";
			});

			// Encode and trigger download
			var sBlob = new Blob([sCsv], {
				type: "text/csv;charset=utf-8;"
			});
			var sLink = document.createElement("a");
			sLink.href = URL.createObjectURL(sBlob);
			sLink.download = "PaymentBlockedInvoices.csv";
			sLink.style.display = "none";
			document.body.appendChild(sLink);
			sLink.click();
			document.body.removeChild(sLink);
		},
		onTatanalysisClick: function() {
			var that = this;

			if (!this._oTatDialog) {
				this._oTatDialog = sap.ui.xmlfragment("FSC360NEW.fragment.TATDialog", this);
				this.getView().addDependent(this._oTatDialog);
			}
			sap.ui.core.BusyIndicator.show(0);
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			oModel.read("/tatanalysisSet", {
				filters: [
					new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var aResults = oData.results || [];

					var oJsonModel = new sap.ui.model.json.JSONModel({
						data: aResults
					});
					that._oTatDialog.setModel(oJsonModel, "tatModel");

					that._oTatDialog.open();
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to load TAT data.");
				}
			});
		},

		onCloseTatDialog: function() {
			if (this._oTatDialog) {
				this._oTatDialog.close();
			}
		},
		onDownloadTATExcel: function() {
			var oModel = this._oTatDialog.getModel("tatModel");
			var aData = oModel.getProperty("/data") || [];

			// Create CSV header
			var csv = "Qid,Date,Time,Document No,Ageing\n";

			aData.forEach(function(row) {
				var date = new Date(row.Qiddate);
				var dateStr = date.toLocaleDateString();
				var timeStr = date.toLocaleTimeString();

				csv += `${row.Qid},${dateStr},${timeStr},${row.Documentnumber},${row.Ageing}\n`;
			});

			// Create and download CSV
			var blob = new Blob([csv], {
				type: "text/csv;charset=utf-8;"
			});
			var url = URL.createObjectURL(blob);

			var oLink = document.createElement("a");
			oLink.href = url;
			oLink.download = "TAT_Analysis_Report.csv";
			document.body.appendChild(oLink);
			oLink.click();
			document.body.removeChild(oLink);
		},
		fnTopPayableVendor: function(aChartData) {
			const canvas = document.getElementById("myChart");
			if (!canvas) return;

			if (this._oBarChart) {
				this._oBarChart.destroy();
				this._oBarChart = null;
			}

			canvas.removeAttribute("width");
			canvas.removeAttribute("height");
			canvas.style.width = "100%";
			canvas.style.height = "115px";
			canvas.style.marginTop = "5px";
			canvas.style.marginLeft = "-8px";
			canvas.style.display = "block"; // ensure canvas occupies space

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const aLabels = aChartData.map(item => item.x);
			const aValues = aChartData.map(item => item.y);
			const aNames = aChartData.map(item => item.name);

			const gradient = ctx.createLinearGradient(0, 0, 0, 200);
			gradient.addColorStop(0, "#175EE6");
			gradient.addColorStop(1, "#A9C6FF");

			const iMaxValue = Math.max(...aValues);
			const stepSize = 50000;
			const iRoundedMax = Math.ceil(iMaxValue / stepSize) * stepSize;

			this._oBarChart = new Chart(ctx, {
				type: "bar",
				data: {
					labels: aLabels,
					datasets: [{
						label: "Amount",
						data: aValues,
						backgroundColor: gradient,
						borderRadius: 12,
						barThickness: 16
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							backgroundColor: "#ffffff",
							titleColor: "#000000",
							bodyColor: "#000000",
							borderColor: "#ccc",
							borderWidth: 1,
							padding: 10,
							cornerRadius: 6,
							displayColors: true,
							callbacks: {
								title: function(tooltipItems) {
									const index = tooltipItems[0].dataIndex;
									return aNames[index];
								},
								label: function(tooltipItem) {
									const val = tooltipItem.raw;
									return "Spend: " + val.toLocaleString();
								}
							}
						}
					},
					scales: {
						x: {
							ticks: {
								color: "#000000B2",
								font: {
									size: 9,
									family: "Geist"
								},
								padding: 6
							},
							grid: {
								color: '#e5e5e5',
								lineWidth: 1,
								borderDash: [2, 2],
								borderDashOffset: 0,
								drawOnChartArea: true,
								drawTicks: false,
								drawBorder: false
							},
							border: {
								dash: [2, 2]
							},
						},
						y: {
							beginAtZero: true,
							min: 0,
							max: iRoundedMax,
							ticks: {
								stepSize: iRoundedMax / 4,
								color: "#000000B2",
								font: {
									size: 9,
									family: "Geist"
								},
								callback: value => (value >= 100000 ? Math.round(value / 100000) + "L" : value)
							},
							grid: {
								color: '#e5e5e5',
								lineWidth: 1,
								borderDash: [2, 2],
								borderDashOffset: 0,
								drawOnChartArea: true,
								drawTicks: false,
								drawBorder: false
							},
							border: {
								dash: [2, 2]
							},
						}
					}
				},
				plugins: [{
					id: 'customBarBackground',
					beforeDatasetsDraw: function(chart) {
						const drawCtx = chart.ctx;
						const meta = chart.getDatasetMeta(0);
						const chartArea = chart.chartArea;
						if (!meta || !meta.data || !chartArea) return;
						drawCtx.save();
						drawCtx.fillStyle = "#D6DBED66";
						for (let i = 0; i < meta.data.length; i++) {
							const bar = meta.data[i];
							const x = bar.x;
							const width = bar.width || 24;
							const left = x - width / 2;
							drawCtx.fillRect(left, chartArea.top, width, chartArea.bottom - chartArea.top);
						}
						drawCtx.restore();
					}
				}]
			});

			setTimeout(() => {
				if (this._oBarChart) {
					this._oBarChart.resize();
				}
			}, 300); // 300ms ensures sidebar animations are done
		},

		fnTop5GLChart: function(sFromDate, sToDate) {
			function truncateText(str, maxLength) {
				return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;
			}

			const that = this;

			const oDashboardModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");

			sap.ui.core.BusyIndicator.show(0);
			oDashboardModel.read("/Gl_BalanceSet", {
				filters: [
					new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
					// new Filter("BLDAT", FilterOperator.BT ,"2025-06-09" , "2025-07-09")
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					const aResults = oData.results || [];

					const aTop5 = aResults
						.sort((a, b) => parseFloat(b.Balance) - parseFloat(a.Balance))
						.slice(0, 5)
						.map((item) => {
							return {
								glAccount: item.Txt20,
								glNumber: item.GlAccount, // Add this field!
								amount: parseFloat(item.Balance)
							};
						});
					JMTop5 = aTop5;
					const labels = aTop5.map(item => truncateText(item.glAccount, 15));
					const series = aTop5.map(item => item.amount);
					const fullLabels = aTop5.map(item => item.glAccount);

					var chartContainer = document.querySelector("#glDonutChart");
					if (!chartContainer) {

						return;
					}

					var options = {
						chart: {
							type: 'donut'
						},

						plotOptions: {
							pie: {
								donut: {
									size: '45%'
								}
							}
						},
						stroke: {
							width: 1,
							colors: ['#fff'] // border color between slices
						},
						series: series,
						labels: labels,

						tooltip: {
							theme: 'light',
							offsetX: 20,
							custom: function({
								series,
								seriesIndex,
								w
							}) {
								const val = series[seriesIndex];
								const glName = fullLabels[seriesIndex];

								let formattedVal = "";
								if (val >= 10000000) {
									formattedVal = (val / 10000000).toFixed(1) + " Cr";
								} else if (val >= 100000) {
									formattedVal = (val / 100000).toFixed(1) + " L";
								} else if (val >= 1000) {
									formattedVal = (val / 1000).toFixed(1) + " K";
								} else {
									formattedVal = val.toLocaleString();
								}

								return `
						<div style="
						        background: white;
						        border: 1px solid #ccc;
						        border-radius: 6px;
						        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
						        padding: 0;
						        font-family: 'Geist', sans-serif;
						        font-size: 12px;
						        color: #1a202c;
						        min-width: 160px;
						        overflow: hidden;
						      ">
						<div style="
						          background: #f3f4f6;
						          padding: 8px 12px;
						          font-weight: 600;
						          border-top-left-radius: 6px;
						          border-top-right-radius: 6px;
						        ">
						          ${glName}
						</div>
						<div style="padding: 8px 12px; display: flex; align-items: center;">
						<div style="width: 8px; height: 8px; border-radius: 50%; background: ${w.config.colors[seriesIndex]}; margin-right: 8px;"></div>
						<div><strong>Spend:</strong> ${formattedVal}</div>
						</div>
						</div>
						    `;
							}
						},
						legend: {
							show: false
						},
						colors: [
							"#19AF9D", "#4ABAAD", "#7BC6BD", "#ABD1CC", "#DCDCDC"
						],
						dataLabels: {
							enabled: false
						}
					};

					var chart = new ApexCharts(chartContainer, options);
					chart.render();

					const aLegendTexts = that.getView().byId("idLegendBoxGL").getItems();
					aTop5.forEach((entry, i) => {
						const oHBox = aLegendTexts[i];
						if (oHBox) {
							oHBox.getItems()[1].setText(truncateText(entry.glAccount, 15));
							oHBox.setVisible(true);
						}
					});

					for (let j = aTop5.length; j < 5; j++) {
						const oHBox = aLegendTexts[j];
						if (oHBox) {
							oHBox.setVisible(false);
						}
					}
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to load G/L data.");

				}
			});
		},
		_showGLPopover1: function() {
			this._openGLPopover(0, "id_glLegend1");
		},
		_showGLPopover2: function() {
			this._openGLPopover(1, "id_glLegend2");
		},
		_showGLPopover3: function() {
			this._openGLPopover(2, "id_glLegend3");
		},
		_showGLPopover4: function() {
			this._openGLPopover(3, "id_glLegend4");
		},
		_showGLPopover5: function() {
			this._openGLPopover(4, "id_glLegend5");
		},

		_openGLPopover: function(index, legendId) {
			const data = JMTop5[index];
			this.byId("gl_pop_name").setText("Name: " + data.glAccount);
			this.byId("gl_pop_number").setText("GL Account: " + data.glNumber);
			this.byId("gl_pop_amount").setText("Balance: ₹ " + data.amount.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}));

			this._glTimeout = setTimeout(() => {
				this.byId("glPopover").openBy(this.byId(legendId));
			}, 200);
		},

		_clearGLPopover: function() {
			clearTimeout(this._glTimeout);
			this.byId("glPopover").close();
		},
		fnTop5CustomerChart: function() {

			const that = this;

			const oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/gettopcustomersSet", {
				filters: [
					new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.BT, this._grnFromDate, this._grnToDate)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					const aChartData = oData.results.map(item => {

						return {

							x: item.CustmNo,

							y: parseFloat(item.Amount),
							label: item.CustmName

						};

					});

					aChartData.sort((a, b) => b.y - a.y);
					that.fnTopCustomerChart(aChartData); // Pass to chart

				},

				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to load top customers data");

				}

			});

		},

		fnTopCustomerChart: function(aData) {
			const el = document.querySelector("#lineChart");
			if (!el) {
				// console.warn("Chart container not found.");
				return;
			}

			el.innerHTML = ""; // Clear previous chart

			const options = {
				chart: {
					type: 'line',
					height: 175,
					width: '98%',
					fontFamily: 'Geist, sans-serif',
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false
					}
				},
				series: [{
					name: 'Collection',
					data: aData
				}],
				xaxis: {
					type: "category",
					categories: aData.map(obj => obj.x),
					tickPlacement: 'between',
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist, sans-serif',
						},
						offsetY: -3
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					min: 0,
					tickAmount: 4,
					labels: {
						formatter: function(val) {
							if (val >= 10000000) {
								return (val / 10000000).toFixed(1) + "Cr";
							} else if (val >= 100000) {
								return (val / 100000).toFixed(1) + "L";
							} else if (val >= 1000) {
								return (val / 1000).toFixed(0) + "K";
							}
							return val;
						},
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist, sans-serif'
						}
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				dataLabels: {
					enabled: true,
					formatter: function(val) {
						if (val >= 100000) {
							return (val / 100000).toFixed(1) + "L";
						} else if (val >= 1000) {
							return (val / 1000).toFixed(0) + "K";
						} else {
							return val.toString();
						}
					},

					offsetY: -10,
					style: {
						fontSize: '9px',
						fontWeight: '400',
						colors: ['#000000B2'],
						fontFamily: 'Geist, sans-serif'
					},
					background: {
						enabled: false
					}
				},
				stroke: {
					curve: 'smooth',
					width: 1
				},
				markers: {
					size: 4,
					colors: ['#ffffff'],
					strokeColors: '#6D28D9',
					strokeWidth: 1
				},
				colors: ['#6D28D9'],
				grid: {
					show: true,
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {

					enabled: true,

					x: {

						formatter: function(value, {
							dataPointIndex,
							w
						}) {

							const label = w.config.series[0].data[dataPointIndex].label;

							return "Customer: " + label;

						}

					},

					y: {

						formatter: function(val) {
							return val >= 100000 ? (val / 100000).toFixed(2) + ' L' : val.toLocaleString(); // Show exact number for < 1 lakh
						}

					},

					style: {

						fontSize: '9px',

						fontFamily: 'Geist, sans-serif'

					}

				}

			};

			this.chart = new ApexCharts(el, options);
			this.chart.render();
			const parentEl = document.querySelector("#lineChart")?.parentElement;
			if (parentEl) {
				parentEl.style.marginLeft = "-10px";
				parentEl.style.marginTop = "-2px";
			}
		},

		fn_sortByVendor: function() {
			var oTable = this.byId("id_table");
			var oBinding = oTable.getBinding("rows");

			if (oBinding) {
				// Toggle sort direction
				var oSorter = new sap.ui.model.Sorter("Name", !bVendorSortAsc); // false = ASC, true = DESC
				oBinding.sort(oSorter);

				var oImage = this.byId("vendorSortIcon");
				if (bVendorSortAsc) {
					oImage.setSrc("Images/arrow-up.svg");
				} else {
					oImage.setSrc("Images/arrow-down.svg");
				}

				bVendorSortAsc = !bVendorSortAsc; // toggle for next click
			}
		},
		fn_newbutton: function(oEvent) {
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("Capture");
			var oButton = oEvent.getSource();
			if (!this.CaptureOp) {
				this.CaptureOp = sap.ui.xmlfragment(
					"FSC360NEW.fragment.Captureselect",
					this
				);
				this.getView().addDependent(this.CaptureOp);

			}
			this.CaptureOp.openBy(oButton);
			// this.CaptureOp.open();
		},
		fnSearchPop: function(oEvent) {
			var oButton = oEvent && oEvent.getSource ? oEvent.getSource() : null;

			if (!oButton) {
				sap.m.MessageToast.show("No source control for popover.");
				return;
			}

			if (!this._PopOverSearch) {
				this._PopOverSearch = sap.ui.xmlfragment("FSC360NEW.fragment.SearchFrag", this);
				this.getView().addDependent(this._PopOverSearch);
				sap.ui.getCore().byId("cb_docid").setSelected(true);
			}

			this._PopOverSearch.openBy(oButton);
		},

		fn_Docid_Search: function() {
			FilterParameter = "Qid";
			this.getView().byId("id_search_field").setPlaceholder("Search by Qid");

			//Add 
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn_selected');
			//Remove
			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');
			this._PopOverSearch.close();
		},

		fn_Invo_Search: function() {
			FilterParameter = "Invno";

			this.getView().byId("id_search_field").setPlaceholder("Search by Invoice No");
			//Add 
			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},

		fn_Plant_Search: function() {
			FilterParameter = "Bukrs";
			this.getView().byId("id_search_field").setPlaceholder("Search by Plant");

			//Add 
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},

		fn_Vendor_Search: function() {
			FilterParameter = "Name1";
			this.getView().byId("id_search_field").setPlaceholder("Search by Vendor");

			//Add 
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},

		fn_agent_Search: function() {
			FilterParameter = "Assignedto";
			this.getView().byId("id_search_field").setPlaceholder("Search by Agent");

			//Add 
			sap.ui.getCore().byId('id_agent').removeStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_agent').addStyleClass('cl_searchfrag_btn_selected');
			//Remove

			sap.ui.getCore().byId('id_invo').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_invo').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_plant').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_plant').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_docid').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_docid').addStyleClass('cl_searchfrag_btn');
			sap.ui.getCore().byId('id_vendor').removeStyleClass('cl_searchfrag_btn_selected');
			sap.ui.getCore().byId('id_vendor').addStyleClass('cl_searchfrag_btn');

			this._PopOverSearch.close();
		},
		onCheckDocId: function(oEvent) {
			this.updateFilterFields("Qid", oEvent.getParameter("selected"));
		},

		onCheckVendor: function(oEvent) {
			this.updateFilterFields("Name1", oEvent.getParameter("selected"));
		},

		onCheckInvoice: function(oEvent) {
			this.updateFilterFields("Invno", oEvent.getParameter("selected"));
		},

		onCheckAgent: function(oEvent) {
			this.updateFilterFields("Assignedto", oEvent.getParameter("selected"));
		},

		onCheckPlant: function(oEvent) {
			this.updateFilterFields("Bukrs", oEvent.getParameter("selected"));
		},

		// Common method
		updateFilterFields: function(sField, bSelected) {
			if (!this.aFilterFields) {
				this.aFilterFields = [];
			}

			const index = this.aFilterFields.indexOf(sField);

			if (bSelected && index === -1) {
				this.aFilterFields.push(sField);
			} else if (!bSelected && index !== -1) {
				this.aFilterFields.splice(index, 1);
			}

			// Handle empty checkbox selection
			if (this.aFilterFields.length === 0) {
				this.aFilterFields = ["Qid"];
				sap.ui.getCore().byId("cb_docid").setSelected(true); // Reselect default
			}

			const labelMap = {
				Qid: "Queue Id",
				Name1: "Vendor",
				Invno: "Invoice No",
				Assignedto: "Agent",
				Bukrs: "Plant"
			};

			const placeholder = this.aFilterFields.length === 1 ? "Search by " + labelMap[this.aFilterFields[0]] : "Search by Multiple Fields";

			this.getView().byId("id_search_field").setPlaceholder(placeholder);
		},
		fnSearchField: function(oEvent) {
			var vValue = oEvent.getSource().getValue();

			if (!this.aFullData) {
				this.aFilteredData = [];
				this.updatePaginatedModel();
				return;
			}

			var aFieldsToFilter = this.aFilterFields && this.aFilterFields.length > 0 ? this.aFilterFields : ["Qid"];

			if (vValue && vValue.length > 0) {
				var aTerms = vValue.toLowerCase().split(/\s+/).filter(Boolean); // split by spaces

				var filteredData = this.aFullData.filter(function(row) {
					// Check that EVERY search term matches at least one of the selected fields
					return aTerms.every(function(term) {
						return aFieldsToFilter.some(function(field) {
							return row[field] && row[field].toLowerCase().includes(term);
						});
					});
				});

				this.aFilteredData = filteredData;
			} else {
				this.aFilteredData = this.aFullData;
			}

			this.iCurrentPage = 1;
			this.updatePaginatedModel();
		},
		fnFilterPop: function(oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oFilterPopover) {
				this._oFilterPopover = sap.ui.xmlfragment(
					"FSC360NEW.fragment.FilterPopovers",
					this
				);
				this.getView().addDependent(this._oFilterPopover);
			}

			this._oFilterPopover.openBy(oButton);
		},
		fncustomcolumns: function(oEvent) {
			var oView = this.getView();

			// create fragment only once
			if (!this._oCustomizePopover) {
				this._oCustomizePopover = sap.ui.xmlfragment(oView.getId(),"FSC360NEW.fragment.CustomCol_Autopark", this);

				this._oCustomizePopover.setModel(oView.getModel("FilterTableModel"), "FilterTableModel");

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
		
		fn_onCancelCreateTemplate: function() {
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
    const sTableName = "/EXL/FSC_DASH";

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
		fn_reloadTemplates: function() {
			const oView = this.getView();
			const oODataModel = this.getOwnerComponent().getModel();
			const oViewModel = oView.getModel("viewModel1");
			const sUserId = oView.getModel("JSusername").getProperty("/Userid");
			sap.ui.core.BusyIndicator.show(0);
			oODataModel.read("/SaveTemplateSet", {
				filters: [
					new sap.ui.model.Filter("Userid", sap.ui.model.FilterOperator.EQ, sUserId)
				],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					const aTemplateArray = oData.results.map(item => ({
						name: item.TemplateId,
						userid: item.Userid,
						columns: item.Columns || ""
					}));
					oViewModel.setProperty("/templates", aTemplateArray);
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Failed to reload templates");
				}
			});
		},
		onApplyTemplate: function() {
			//this.applyVisibleColumns();
			if (this._oCustomizePopover) {
				this._oCustomizePopover.close();
				this._oCustomizePopover.destroy();
				this._oCustomizePopover = null;
			}

		},

		fn_onOpenTemplatePopover: function(oEvent) {
			const oView = this.getView();
			const sTableName = "/EXL/FSC_DASH";
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

			oODataModel.read("/SaveTemplateSet", {
				filters: aFilters,
				success: function(oData) {

					// Map backend fields to UI model
					const aTemplateArray = oData.results.map(item => ({
						name: item.TemplateId, // template name
						userid: item.Userid,

						columns: item.Columns || "" // comma-separated columns
					}));

					oViewModel.setProperty("/templates", aTemplateArray);
				}.bind(this),
				error: function() {
					sap.m.MessageToast.show("Failed to load templates");
				}
			});

			// Open popover near the source control
			this._oTemplatePopover.openBy(oEvent.getSource());
		},
		fn_onTemplateListItemPress: function(oEvent) {

			const oItem = oEvent.getParameter("listItem"); // always the pressed CustomListItem
			const oCtx = oItem.getBindingContext("viewModel1");
			const sName = oCtx.getProperty("name");
			// console.log("Clicked template:", sName);
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
    var sReportName = "/EXL/FSC_DASH"; // Hardcoded Tabid

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
				oItem.visible = bSelected; // select or deselect all
			});

			oModel.refresh(true); // update bindings
		},
		fn_onZoomIn: function() {
			var oScroll = this.getView().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale, default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;
			var newScale = currentScale + 0.1;
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // scale from top-left corner
		},

		fn_onZoomOut: function() {
			var oScroll = this.getView().byId("id_scrll");
			var iframe = oScroll.getContent()[0].$().find('iframe')[0];
			if (!iframe) return;

			// Get current scale or default to 1
			var currentScale = iframe.style.transform ? parseFloat(iframe.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;

			// Reduce scale but don’t go below 0.5
			var newScale = Math.max(currentScale - 0.1, 0.5);
			iframe.style.transform = "scale(" + newScale + ")";
			iframe.style.transformOrigin = "0 0"; // Keep same origin as Zoom In
		},

		fn_onPrint: function() {
			var iframe = this.getView().byId("id_scrll").getContent()[0].getDomRef().querySelector('iframe');
			if (iframe) {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			}
		},

		fn_onDownload: function() {
			var that = this;
			var QueueID = window.QueueID || "";
			if (!QueueID) {
				this.fnShowErrorDialog("Please Select the Queue ID");
				return;
			}

			var url = "/sap/opu/odata/EXL/FSCNXT360_SRV/ImageSet(Qid='" + QueueID + "',Doc='')/$value";

			fetch(url, {
					method: "GET",
					headers: {
						"Accept": "application/pdf"
					}
				})
				.then(response => {
					if (!response.ok) throw new Error("Failed to download");
					return response.blob();
				})
				.then(blob => {
					var link = document.createElement('a');
					var objectURL = URL.createObjectURL(blob);
					link.href = objectURL;
					link.download = "Invoice_" + QueueID + ".pdf";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(objectURL);
				})
				.catch(err => {
					that.fnShowErrorDialog("Error while downloading: " + err.message);
			
				});
		},

		fnIncomeExpenseCall: function() {
			this.fetchDailyExpenseData();
			this.fetchDailyExpenseDataPrevYear();

			var that = this;
			var currentYear = new Date().getFullYear();
			var prevYear = currentYear - 1;

			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/InvCompYearSet", {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var aCurrentYearData = [];
					var aPrevYearData = [];

					var totalsCurrent = {
						po: 0,
						nonpo: 0,
						service: 0
					};
					var totalsPrev = {
						po: 0,
						nonpo: 0,
						service: 0
					};

					var countsCurrent = {
						po: 0,
						nonpo: 0,
						service: 0
					};
					var countsPrev = {
						po: 0,
						nonpo: 0,
						service: 0
					};

					oData.results.forEach(function(item) {
						if (!item.IsTotal) {
							var year = parseInt(item.Curryear);
							var monthObj = {
								month: item.Currmonth,
								po: 0,
								nonpo: 0,
								service: 0
							};

							switch (item.Category) {
								case "PO":
									monthObj.po = parseFloat(item.Amount);
									if (year === currentYear) countsCurrent.po++;
									if (year === prevYear) countsPrev.po++;
									break;
								case "NONPO":
									monthObj.nonpo = parseFloat(item.Amount);
									if (year === currentYear) countsCurrent.nonpo++;
									if (year === prevYear) countsPrev.nonpo++;
									break;
								case "SERVI":
									monthObj.service = parseFloat(item.Amount);
									if (year === currentYear) countsCurrent.service++;
									if (year === prevYear) countsPrev.service++;
									break;
							}

							if (year === currentYear) {
								// Add to current year
								var existing = aCurrentYearData.find(m => m.month === monthObj.month);
								if (existing) {
									existing.po += monthObj.po;
									existing.nonpo += monthObj.nonpo;
									existing.service += monthObj.service;
								} else {
									aCurrentYearData.push(monthObj);
								}

								totalsCurrent.po += monthObj.po;
								totalsCurrent.nonpo += monthObj.nonpo;
								totalsCurrent.service += monthObj.service;

							} else if (year === prevYear) {
								// Add to previous year
								var existingPrev = aPrevYearData.find(m => m.month === monthObj.month);
								if (existingPrev) {
									existingPrev.po += monthObj.po;
									existingPrev.nonpo += monthObj.nonpo;
									existingPrev.service += monthObj.service;
								} else {
									aPrevYearData.push(monthObj);
								}

								totalsPrev.po += monthObj.po;
								totalsPrev.nonpo += monthObj.nonpo;
								totalsPrev.service += monthObj.service;
							}
						}
					});

					// Sort months
					aCurrentYearData.sort((a, b) => parseInt(a.month) - parseInt(b.month));
					aPrevYearData.sort((a, b) => parseInt(a.month) - parseInt(b.month));

					that.fnIncomeExpense(aCurrentYearData);
					that.fnIncomeExpensePrev(aPrevYearData);

					that.byId("id_total_amount").setText(
						`Total ${that.formatCount(totalsCurrent.po + totalsCurrent.nonpo + totalsCurrent.service)}`);
					that.byId("id_po_amount").setText(that.formatCount(totalsCurrent.po));
					that.byId("id_nonpo_amount").setText(that.formatCount(totalsCurrent.nonpo));
					that.byId("id_service_amount").setText(that.formatCount(totalsCurrent.service));

					that.byId("id_total_amount_prev").setText(`Total ${that.formatCount(totalsPrev.po + totalsPrev.nonpo + totalsPrev.service)}`);
					that.byId("id_po_amount_prev").setText(that.formatCount(totalsPrev.po));
					that.byId("id_nonpo_amount_prev").setText(that.formatCount(totalsPrev.nonpo));
					that.byId("id_service_amount_prev").setText(that.formatCount(totalsPrev.service));

					that.byId("id_po_count").setText("\u00A0" + countsCurrent.po.toString());
					that.byId("id_nonpo_count").setText("\u00A0" + countsCurrent.nonpo.toString());
					that.byId("id_service_count").setText("\u00A0" + countsCurrent.service.toString());

					that.byId("id_po_count_prev").setText("\u00A0" + countsPrev.po.toString());
					that.byId("id_nonpo_count_prev").setText("\u00A0" + countsPrev.nonpo.toString());
					that.byId("id_service_count_prev").setText("\u00A0" + countsPrev.service.toString());

				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Error fetching data from backend.");

				}
			});
		},

		// Convert raw number to K / L / Cr for chart tooltip or summary
		formatCount: function(val) {
			if (val >= 10000000) return (val / 10000000).toFixed(2) + " Cr";
			if (val >= 100000) return (val / 100000).toFixed(2) + " L";
			if (val >= 1000) return (val / 1000).toFixed(2) + " K";
			return val;
		},

		formatCurrency: function(val) {
			// Example: use Cr/L/K suffix only
			return this.formatCount(val);
		},

		fnIncomeExpense: function(aData) {
			const el = document.querySelector("#barChart");
			if (!el) {

				// sap.m.MessageToast.show("Chart container not found.");
				return;
			}

			el.innerHTML = ""; // Clear previous chart

			// Force scale to lakhs for all series for uniformity
			const scale = 100000;
			const unit = 'L';

			// Scale data
			const scaledData = aData.map(d => ({
				month: d.month,
				po: d.po / scale,
				nonpo: d.nonpo / scale,
				service: d.service / scale
			}));

			// Determine max value for Y-axis dynamically
			let maxVal = 0;
			scaledData.forEach(d => {
				maxVal = Math.max(maxVal, d.po, d.nonpo, d.service);
			});

			const options = {
				chart: {
					type: 'bar',
					height: 200,
					width: '100%',
					fontFamily: 'Geist, sans-serif',
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false
					},
					parentHeightOffset: 50
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '25%',
						endingShape: 'rounded'
					}
				},
				series: [{
					name: 'PO',
					data: scaledData.map(obj => obj.po)
				}, {
					name: 'Non PO',
					data: scaledData.map(obj => obj.nonpo)
				}, {
					name: 'Service',
					data: scaledData.map(obj => obj.service)
				}],
				xaxis: {
					categories: scaledData.map(obj => obj.month),
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist, sans-serif'
						}
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					min: 0,
					max: Math.ceil(maxVal), // rounded max in lakhs
					tickAmount: 5,
					labels: {
						formatter: function(val) {
							return val.toFixed(2) + unit;
						}, // 2 decimals
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist, sans-serif'
						}
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				// colors: ['#25009D', '#4DB151', '#98A2B3'],
						colors: ['#048D95', '#013D6F', '#7AD254'],
				legend: {
					position: 'bottom',
					horizontalAlign: 'center',
					floating: false,
					offsetY: 10,
					labels: {
						colors: '#000000B2'
					}
				},
				grid: {
					show: true,
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					xaxis: {
						lines: {
							show: false
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				dataLabels: {
					enabled: false
				},
				tooltip: {
					shared: true,
					intersect: false,
					y: {
						formatter: val => val.toFixed(2) + unit // tooltip also 2 decimals
					}
				}
			};

			this.chart = new ApexCharts(el, options);
			this.chart.render();

			// Adjust margin
			const parentEl = document.querySelector("#barChart")?.parentElement;
			if (parentEl) {
				parentEl.style.marginLeft = "-10px";
				parentEl.style.marginTop = "-2px";
			}
		},

		fnIncomeExpensePrev: function(aData) {
			const el = document.querySelector("#incexpenseprev");
			if (!el) {
				// sap.m.MessageToast.show("Chart container not found.");

				return;
			}

			el.innerHTML = ""; // Clear previous chart

			// Force scale to lakhs for all series
			const scale = 100000;
			const unit = 'L';

			// Scale data
			const scaledData = aData.map(d => ({
				month: d.month,
				po: d.po / scale,
				nonpo: d.nonpo / scale,
				service: d.service / scale
			}));

			// Determine max value for Y-axis dynamically
			let maxVal = 0;
			scaledData.forEach(d => {
				maxVal = Math.max(maxVal, d.po, d.nonpo, d.service);
			});

			const options = {
				chart: {
					type: 'bar',
					height: 200,
					width: '100%',
					fontFamily: 'Geist, sans-serif',
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false
					},
					parentHeightOffset: 50
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '45%',
						endingShape: 'rounded'
					}
				},
				series: [{
					name: 'PO',
					data: scaledData.map(obj => obj.po)
				}, {
					name: 'Non PO',
					data: scaledData.map(obj => obj.nonpo)
				}, {
					name: 'Service',
					data: scaledData.map(obj => obj.service)
				}],
				xaxis: {
					categories: scaledData.map(obj => obj.month),
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist, sans-serif'
						}
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					min: 0,
					max: Math.ceil(maxVal), // auto max based on data
					tickAmount: 5,
					labels: {
						formatter: val => val.toFixed(2) + unit,
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist, sans-serif'
						}
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				// colors: ['#25009D', '#4DB151', '#98A2B3'],
					colors: ['#048D95', '#013D6F', '#7AD254'],
				legend: {
					position: 'bottom',
					horizontalAlign: 'center',
					floating: false,
					offsetY: 10,
					labels: {
						colors: '#000000B2'
					}
				},
				grid: {
					show: true,
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					xaxis: {
						lines: {
							show: false
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				dataLabels: {
					enabled: false
				},
				tooltip: {
					shared: true,
					intersect: false,
					y: {
						formatter: val => val.toFixed(2) + unit
					}
				}
			};

			this.chart = new ApexCharts(el, options);
			this.chart.render();

			// Adjust margin
			const parentEl = document.querySelector("#incexpenseprev")?.parentElement;
			if (parentEl) {
				parentEl.style.marginLeft = "-10px";
				parentEl.style.marginTop = "-2px";
				parentEl.style.flexGrow = "1";
			}
		},

		fnGraphTable: function(oEvent) {
			var oHBox = this.byId("id_fnGraphTable");
			var aButtons = oHBox.getItems();

			// Reset all buttons → unselected
			aButtons.forEach(function(btn) {
				btn.removeStyleClass("cl_segmentBtnSelected_incexp");
				btn.addStyleClass("cl_segmentBtnUnSelected_incexp");
			});

			// Mark only clicked button as selected
			var oClickedBtn = oEvent.getSource();
			oClickedBtn.removeStyleClass("cl_segmentBtnUnSelected_incexp");
			oClickedBtn.addStyleClass("cl_segmentBtnSelected_incexp");

			// Get custom value
			var selectedValue = oClickedBtn.getCustomData().find(function(d) {
				return d.getKey() === "value";
			}).getValue();
			var oTable = this.byId("tableContainer");
			var oTable1 = this.byId("tableContainerprev");
			var oChart = this.byId("cl_mont_exp_cont");
			if (selectedValue === "W") {
				oChart.setVisible(true);
				oTable.setVisible(false);
				oTable1.setVisible(false);
			} else if (selectedValue === "I") {
				oChart.setVisible(false);
				oTable.setVisible(true);
				oTable1.setVisible(true);

			}
		},

		fetchDailyExpenseData: function() {
			const oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			const today = new Date();
			const year = today.getFullYear();
			const monthIndex = today.getMonth();
			const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

			const dataPO = Array(daysInMonth).fill(0);
			const dataNonPO = Array(daysInMonth).fill(0);
			const dataService = Array(daysInMonth).fill(0);
			const amountPO = Array(daysInMonth).fill(0);
			const amountNonPO = Array(daysInMonth).fill(0);
			const amountService = Array(daysInMonth).fill(0);
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/InvCompMonthSet", {
				success: (oData) => {
					sap.ui.core.BusyIndicator.show(0);
					oData.results.forEach(rec => {
						const dayIndex = parseInt(rec.Currday, 10) - 1;
						const amt = parseFloat(rec.Amount);

						if (rec.Category === "PO") {
							dataPO[dayIndex] = rec.Nocount;
							amountPO[dayIndex] += amt;
						} else if (rec.Category === "NONPO") {
							dataNonPO[dayIndex] = rec.Nocount;
							amountNonPO[dayIndex] += amt;
						} else if (rec.Category === "SERVICE") {
							dataService[dayIndex] = rec.Nocount;
							amountService[dayIndex] += amt;
						}
					});

					// Totals
					const totalCountPO = dataPO.reduce((a, b) => a + b, 0);
					const totalCountNonPO = dataNonPO.reduce((a, b) => a + b, 0);
					const totalCountService = dataService.reduce((a, b) => a + b, 0);

					const totalAmountPO = amountPO.reduce((a, b) => a + b, 0);
					const totalAmountNonPO = amountNonPO.reduce((a, b) => a + b, 0);
					const totalAmountService = amountService.reduce((a, b) => a + b, 0);

					const totalCountAll = totalCountPO + totalCountNonPO + totalCountService;
					const totalAmountAll = totalAmountPO + totalAmountNonPO + totalAmountService;

					// Update UI cards
					this.getView().byId("idYtdPoCount").setText("\u00A0" + this.formatCount(totalCountPO));
					this.getView().byId("idYtdPoAmount").setText("\u00A0" + this.formatCurrency(totalAmountPO));
					this.getView().byId("idYtdNonPoCount").setText("\u00A0" + this.formatCount(totalCountNonPO));
					this.getView().byId("idYtdNonPoAmount").setText("\u00A0" + this.formatCurrency(totalAmountNonPO));
					this.getView().byId("idYtdServiceCount").setText("\u00A0" + this.formatCount(totalCountService));
					this.getView().byId("idYtdServiceAmount").setText("\u00A0" + this.formatCurrency(totalAmountService));

					this.getView().byId("idYtdTotal").setText(
						`Total ${this.formatCount(totalCountAll)} = ${this.formatCurrency(totalAmountAll)}`
					);
					const oText = this.byId("idYtdYear"); // Get the Text control by ID

					var now = new Date();

					var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
					var month = monthNames[now.getMonth()];
					var year = now.getFullYear();

					this.byId("idYtdYear").setText(`${month} ${year}`);
					this.byId("idPrevYear").setText(`${month} ${year - 1}`);
					// Prepare table data
					const tableData = [{
						category: "PO",
						total: totalCountPO,
						totalAmount: totalAmountPO,
						...dataPO.reduce((acc, val, idx) => {
							acc[`day${idx + 1}`] = val;
							acc[`amount${idx + 1}`] = amountPO[idx];
							return acc;
						}, {})
					}, {
						category: "NONPO",
						total: totalCountNonPO,
						totalAmount: totalAmountNonPO,
						...dataNonPO.reduce((acc, val, idx) => {
							acc[`day${idx + 1}`] = val;
							acc[`amount${idx + 1}`] = amountNonPO[idx];
							return acc;
						}, {})
					}, {
						category: "SERVICE",
						total: totalCountService,
						totalAmount: totalAmountService,
						...dataService.reduce((acc, val, idx) => {
							acc[`day${idx + 1}`] = val;
							acc[`amount${idx + 1}`] = amountService[idx];
							return acc;
						}, {})
					}];

					const oJSONModel = new sap.ui.model.json.JSONModel(tableData);
					this.getView().setModel(oJSONModel, "myModel");

					// --- LEFT TABLE (Category + Days) ---
					const oLeftTable = new sap.ui.table.Table({
						width: "820px",
						visibleRowCount: 3,
						selectionMode: sap.ui.table.SelectionMode.None,
						fixedColumnCount: 1
					}).addStyleClass("clFixedRowHeightTable");

					const monthName = today.toLocaleString("default", {
						month: "short"
					});
					const tableHeading = `${monthName} ${year}`;

					oLeftTable.addColumn(new sap.ui.table.Column({
						label: new sap.m.Label({
							text: tableHeading
						}).addStyleClass("cl_table_incexp"),
						template: new sap.m.Text({
							text: "{myModel>category}",
							textAlign: "Left",
							customData: [
								new sap.ui.core.CustomData({
									key: "category",
									value: "{myModel>category}",
									writeToDom: true
								})
							]
						}).addStyleClass("categoryCell"),
						width: "100px"
					}));

					for (let i = 1; i <= daysInMonth; i++) {
						oLeftTable.addColumn(new sap.ui.table.Column({
							label: new sap.m.Label({
								text: i.toString()
							}).addStyleClass("cl_table_incexp myRowHeightClass"),
							width: "80px",
							template: new sap.m.VBox({
								items: [
									new sap.m.Text({
										text: `{myModel>day${i}}`,
										textAlign: "Left"
									}).addStyleClass("cl_table_incexp"),
									new sap.m.Text({
										text: {
											path: `myModel>amount${i}`,
											formatter: val => val ? "₹ " + this.formatCurrency(val) : "₹ 0"
										},
										textAlign: "Left"
									}).addStyleClass("cl_table_incexp cl_amountText")
								]
							}),
							hAlign: sap.ui.core.HorizontalAlign.Left
						}));
					}

					// --- RIGHT TABLE (Totals per category) ---
					const oRightTable = new sap.ui.table.Table({
						width: "150px",
						visibleRowCount: 3,
						selectionMode: sap.ui.table.SelectionMode.None
					}).addStyleClass("cl_inc_exp_tot_column");

					oRightTable.addColumn(new sap.ui.table.Column({
						label: new sap.m.Label({
							text: "Total"
						}).addStyleClass("cl_table_incexp"),
						template: new sap.m.VBox({
							items: [
								new sap.m.Text({
									text: "{myModel>total}",
									textAlign: "Left"
								}).addStyleClass("cl_table_incexp"),
								new sap.m.Text({
									text: {
										path: "myModel>totalAmount",
										formatter: val => "₹ " + this.formatCurrency(val)
									},
									textAlign: "Left"
								}).addStyleClass("cl_table_incexp")
							]
						}),
						width: "100%"
					}));

					// --- GRAND TOTAL TABLE (one fixed row) ---
					const oGrandTotalTable = new sap.ui.table.Table({
						width: "100%",
						visibleRowCount: 1,
						selectionMode: sap.ui.table.SelectionMode.None
					}).addStyleClass("cl_grandTotalTable");

					// Create a separate model for grand total
					const grandTotalData = [{
						totalCount: totalCountAll,
						totalAmount: totalAmountAll
					}];
					const oGrandModel = new sap.ui.model.json.JSONModel(grandTotalData);
					this.getView().setModel(oGrandModel, "grandModel");

					oGrandTotalTable.addColumn(new sap.ui.table.Column({
						label: new sap.m.Label({
							text: ""
						}).addStyleClass("cl_grandTotalRow"),
						template: new sap.m.VBox({
							items: [
								new sap.m.Text({
									text: "{grandModel>totalCount}",
									textAlign: "Left"
								}).addStyleClass("cl_grandTotalRow"),
								new sap.m.Text({
									text: {
										path: "grandModel>totalAmount",
										formatter: val => "₹ " + this.formatCurrency(val)
									},
									textAlign: "Left"
								}).addStyleClass("cl_grandTotalRow")
							]
						}),
						width: "100%"
					}));

					oLeftTable.bindRows("myModel>/");
					oRightTable.bindRows("myModel>/");
					oGrandTotalTable.bindRows("grandModel>/");

					// Combine into HBox
					const oHBox = new sap.m.HBox({
						items: [oLeftTable, oRightTable, oGrandTotalTable]
					});

					this.getView().byId("tableContainer").removeAllItems();
					this.getView().byId("tableContainer").addItem(oHBox);

					// Draw chart
					this.fnCurrentYearIncExp({
						counts: {
							dataPO,
							dataNonPO,
							dataService
						},
						amounts: {
							amountPO,
							amountNonPO,
							amountService
						},
						daysInMonth,
						monthIndex
					});
				},
				error: (err) => {
					sap.m.MessageToast.show("OData error occurred. Please try again.")
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		fetchDailyExpenseDataPrevYear: function() {
			const oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");
			const today = new Date();
			const prevYear = today.getFullYear() - 1;
			const monthIndex = today.getMonth(); // current month index
			const daysInMonth = new Date(prevYear, monthIndex + 1, 0).getDate();

			const dataPO = Array(daysInMonth).fill(0);
			const dataNonPO = Array(daysInMonth).fill(0);
			const dataService = Array(daysInMonth).fill(0);
			const amountPO = Array(daysInMonth).fill(0);
			const amountNonPO = Array(daysInMonth).fill(0);
			const amountService = Array(daysInMonth).fill(0);

			const yearFilter = new sap.ui.model.Filter("Curryear", "EQ", prevYear);
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/InvCompMonthSet", {
				filters: [yearFilter],
				success: (oData) => {
					sap.ui.core.BusyIndicator.hide();
					oData.results.forEach(rec => {
						const dayIndex = parseInt(rec.Currday, 10) - 1;
						const amt = parseFloat(rec.Amount);

						if (rec.Category === "PO") {
							dataPO[dayIndex] = rec.Nocount;
							amountPO[dayIndex] += amt;
						} else if (rec.Category === "NONPO") {
							dataNonPO[dayIndex] = rec.Nocount;
							amountNonPO[dayIndex] += amt;
						} else if (rec.Category === "SERVICE") {
							dataService[dayIndex] = rec.Nocount;
							amountService[dayIndex] += amt;
						}
					});

					const totalCountPO = dataPO.reduce((a, b) => a + b, 0);
					const totalCountNonPO = dataNonPO.reduce((a, b) => a + b, 0);
					const totalCountService = dataService.reduce((a, b) => a + b, 0);

					const totalAmountPO = amountPO.reduce((a, b) => a + b, 0);
					const totalAmountNonPO = amountNonPO.reduce((a, b) => a + b, 0);
					const totalAmountService = amountService.reduce((a, b) => a + b, 0);

					const totalCountAll = totalCountPO + totalCountNonPO + totalCountService;
					const totalAmountAll = totalAmountPO + totalAmountNonPO + totalAmountService;

					// Update UI totals
					this.getView().byId("idPrevYearTotal").setText(
						`Total ${this.formatCount(totalCountAll)} = ${this.formatCurrency(totalAmountAll)}`
					);
					// this.getView().byId("idPrevYear").setText(prevYear);

					this.getView().byId("idPrevPoCount").setText("\u00A0" + this.formatCount(totalCountPO));
					this.getView().byId("idPrevPoAmount").setText(this.formatCurrency(totalAmountPO));

					this.getView().byId("idPrevNonPoCount").setText("\u00A0" + this.formatCount(totalCountNonPO));
					this.getView().byId("idPrevNonPoAmount").setText(this.formatCurrency(totalAmountNonPO));

					this.getView().byId("idPrevServiceCount").setText("\u00A0" + this.formatCount(totalCountService));
					this.getView().byId("idPrevServiceAmount").setText(this.formatCurrency(totalAmountService));

					this.fnIncomExpMonthPrev({
						counts: {
							dataPO,
							dataNonPO,
							dataService
						},
						amounts: {
							amountPO,
							amountNonPO,
							amountService
						},
						daysInMonth,
						monthIndex
					});

					const tableData = [{
						category: "PO",
						total: totalCountPO,
						totalAmount: totalAmountPO,
						...dataPO.reduce((acc, val, idx) => {
							acc[`day${idx + 1}`] = val;
							acc[`amount${idx + 1}`] = amountPO[idx];
							return acc;
						}, {})
					}, {
						category: "NONPO",
						total: totalCountNonPO,
						totalAmount: totalAmountNonPO,
						...dataNonPO.reduce((acc, val, idx) => {
							acc[`day${idx + 1}`] = val;
							acc[`amount${idx + 1}`] = amountNonPO[idx];
							return acc;
						}, {})
					}, {
						category: "SERVICE",
						total: totalCountService,
						totalAmount: totalAmountService,
						...dataService.reduce((acc, val, idx) => {
							acc[`day${idx + 1}`] = val;
							acc[`amount${idx + 1}`] = amountService[idx];
							return acc;
						}, {})
					}];

					const oJSONModel = new sap.ui.model.json.JSONModel(tableData);
					this.getView().setModel(oJSONModel, "myModelPrevYear");

					const oLeftTable = new sap.ui.table.Table({
						width: "820px",
						visibleRowCount: 3,
						selectionMode: sap.ui.table.SelectionMode.None,
						fixedColumnCount: 1
					}).addStyleClass("clFixedRowHeightTable");

					const monthName = new Date(prevYear, monthIndex).toLocaleString("default", {
						month: "short"
					});
					const tableHeading = `${monthName} ${prevYear}`;

					oLeftTable.addColumn(new sap.ui.table.Column({
						label: new sap.m.Label({
							text: tableHeading
						}).addStyleClass("cl_table_incexp"),
						template: new sap.m.Text({
							text: "{myModelPrevYear>category}",
							textAlign: "Left",
							customData: [
								new sap.ui.core.CustomData({
									key: "category",
									value: "{myModelPrevYear>category}",
									writeToDom: true
								})
							]
						}).addStyleClass("categoryCell").addStyleClass("cl_table_incexp"),
						width: "100px"
					}));

					for (let i = 1; i <= daysInMonth; i++) {
						oLeftTable.addColumn(new sap.ui.table.Column({
							label: new sap.m.Label({
								text: i.toString()
							}).addStyleClass("cl_table_incexp"),
							width: "80px",
							template: new sap.m.VBox({
								items: [
									new sap.m.Text({
										text: `{myModelPrevYear>day${i}}`,
										textAlign: "Left"
									}).addStyleClass("cl_table_incexp"),
									new sap.m.Text({
										text: {
											path: `myModelPrevYear>amount${i}`,
											formatter: val => val ? "₹ " + this.formatCurrency(val) : "₹ 0"
										},
										textAlign: "Left"
									}).addStyleClass("cl_table_incexp cl_amountText")
								]
							}),
							hAlign: sap.ui.core.HorizontalAlign.Left
						}));
					}

					const oRightTable = new sap.ui.table.Table({
						width: "150px",
						visibleRowCount: 3,
						selectionMode: sap.ui.table.SelectionMode.None
					}).addStyleClass("cl_table_incexp_prevmonth");

					oRightTable.addColumn(new sap.ui.table.Column({
						label: new sap.m.Label({
							text: "Total"
						}).addStyleClass("cl_table_incexp"),
						template: new sap.m.VBox({
							items: [
								new sap.m.Text({
									text: "{myModelPrevYear>total}",
									textAlign: "Left"
								}).addStyleClass("cl_table_incexp"),
								new sap.m.Text({
									text: {
										path: "myModelPrevYear>totalAmount",
										formatter: val => "₹ " + this.formatCurrency(val)
									},
									textAlign: "Left"
								}).addStyleClass("cl_table_incexp")
							]
						}),
						width: "100%"
					}));

					oLeftTable.bindRows("myModelPrevYear>/");
					oRightTable.bindRows("myModelPrevYear>/");

					// ======= GRAND TOTAL TABLE =======
					const oGrandTotalTable = new sap.ui.table.Table({
						width: "100%",
						visibleRowCount: 1,
						selectionMode: sap.ui.table.SelectionMode.None
					}).addStyleClass("cl_grandTotalTable1");

					const grandTotalData = [{
						totalCount: totalCountAll,
						totalAmount: totalAmountAll
					}];
					const oGrandModel = new sap.ui.model.json.JSONModel(grandTotalData);
					this.getView().setModel(oGrandModel, "grandModelPrevYear");

					oGrandTotalTable.addColumn(new sap.ui.table.Column({
						label: new sap.m.Label({
							text: ""
						}).addStyleClass("cl_grandTotalRow"),
						template: new sap.m.VBox({
							items: [
								new sap.m.Text({
									text: "{grandModelPrevYear>totalCount}",
									textAlign: "Left"
								}).addStyleClass("cl_grandTotalRow"),
								new sap.m.Text({
									text: {
										path: "grandModelPrevYear>totalAmount",
										formatter: val => "₹ " + this.formatCurrency(val)
									},
									textAlign: "Left"
								}).addStyleClass("cl_grandTotalRow")
							]
						}),
						width: "100%"
					}));

					oGrandTotalTable.bindRows("grandModelPrevYear>/");

					const oHBox = new sap.m.HBox({
						items: [oLeftTable, oRightTable, oGrandTotalTable]
					});

					const oVBox = this.getView().byId("tableContainerprev");
					oVBox.removeAllItems();
					oVBox.addItem(oHBox);

				},
				error: (err) => {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("OData error (Prev Year):")
				}
			});
		},

		fnCurrentYearIncExp: function({
			counts,
			amounts,
			daysInMonth,
			monthIndex
		}) {
			const monthName = new Date(0, monthIndex).toLocaleString("default", {
				month: "short"
			});
			const labels = Array.from({
				length: daysInMonth
			}, (_, i) => `${i + 1} ${monthName}`);

			const oHTML = this.getView().byId("idChartHtmlExpense1");
			oHTML.setContent("<canvas id='daily_chart_canvas1' class='cl_inc_exp_mon_chart' style='width:100%; height:120px;'></canvas>");

			oHTML.addEventDelegate({
				onAfterRendering: () => {
					const canvas = document.getElementById("daily_chart_canvas1");
					if (!canvas) return;

					const ctx = canvas.getContext("2d");
					if (this.oChart1) this.oChart1.destroy();

					// Formatter: Only Lakh (L) and Thousand (K)
					const formatAmount = val => {
						if (val >= 1e5) return (val / 1e5).toFixed(1).replace(/\.0$/, '') + " L";
						if (val >= 1e3) return (val / 1e3).toFixed(1).replace(/\.0$/, '') + " K";
						return val.toString();
					};

					this.oChart1 = new Chart(ctx, {
						type: "line",
						data: {
							labels,
							datasets: [{
								label: "PO",
								data: amounts.amountPO,
								borderColor: "#048D95",
								backgroundColor: "#25009D1A", // subtle transparent fill, optional
								fill: false, // no gradient/fill area
								tension: 0.4,
								pointRadius: 0,
								borderWidth: 1
							}, {
								label: "Non PO",
								data: amounts.amountNonPO,
								borderColor: "#013D6F",
								backgroundColor: "#4DB1511A",
								fill: false,
								tension: 0.4,
								pointRadius: 0,
								borderWidth: 1
							}, {
								label: "Service",
								data: amounts.amountService,
								borderColor: "#7AD254",
								backgroundColor: "#98A2B31A",
								fill: false,
								tension: 0.4,
								pointRadius: 0,
								borderWidth: 1
							}]
						},
						options: {
							responsive: true,
							maintainAspectRatio: false,
							layout: {
								padding: {
									bottom: 0,
									top: 0
								}
							},
							scales: {
								x: {
									ticks: {
										callback: () => '',
										color: "#000000B2",
										font: {
											size: 9
										}
									},
									grid: {
										color: "#e5e5e5",
										borderDash: [4, 4],
										drawTicks: false,
										drawBorder: false
									}
								},
								y: {
									beginAtZero: true,
									ticks: {
										callback: formatAmount,
										color: "#000000B2",
										font: {
											size: 9
										},
										maxTicksLimit: 5
									},
									grid: {
										color: "#e5e5e5",
										borderDash: [4, 4],
										drawTicks: false,
										drawBorder: false
									}
								}
							},
							plugins: {
								legend: {
									display: true,
									position: "bottom",
									labels: {
										usePointStyle: true,
										pointStyle: "line",
										color: "#000",
										font: {
											size: 11,
											family: "Geist"
										},
										padding: 10
									}
								},
								// tooltip: {
								// 	mode: "index",
								// 	intersect: false,
								// 	callbacks: {
								// 		label: ctx => {
								// 			const day = ctx.dataIndex;
								// 			const cat = ctx.dataset.label;
								// 			const amt = ctx.parsed.y;
								// 			const count = counts[`data${cat.replace(' ', '')}`][day];
								// 			return `${cat}: ${formatAmount(amt)} (${count} items)`;
								// 		}
								// 	}
								// }
								tooltip: {
	mode: "index",
	intersect: false,
	backgroundColor: "#ffffff",
	titleColor: "#000000",
	bodyColor: "#000000",
	borderColor: "#ccc",
	borderWidth: 1,
	padding: 10,
	cornerRadius: 6,
	displayColors: true,
	callbacks: {
		title: tooltipItems => {
			return labels[tooltipItems[0].dataIndex];
		},
		label: ctx => {
			const day = ctx.dataIndex;
			const cat = ctx.dataset.label;
			const amt = ctx.parsed.y;
			const count = counts[`data${cat.replace(' ', '')}`]?.[day] ?? 0;
			return `${cat}: ${formatAmount(amt)} (${count} items)`;
		}
	}
}
							},
							interaction: {
								mode: "nearest",
								intersect: false
							}
						}
					});
				}
			}, this);
		},

		fnIncomExpMonthPrev: function({
			counts,
			amounts,
			daysInMonth,
			monthIndex
		}) {
			const monthName = new Date(0, monthIndex).toLocaleString("default", {
				month: "short"
			});
			const labels = Array.from({
				length: daysInMonth
			}, (_, i) => `${i + 1} ${monthName}`);

			const oHTML = this.getView().byId("idChartHtmlExpense2");
			oHTML.setContent("<canvas id='daily_chart_canvas2' class='cl_inc_exp_mon_chart_right' style='width:100%; height:120px;'></canvas>");

			oHTML.addEventDelegate({
				onAfterRendering: () => {
					const canvas = document.getElementById("daily_chart_canvas2");
					if (!canvas) return;

					const ctx = canvas.getContext("2d");
					if (this.oChart2) this.oChart2.destroy();

					// Formatter: Only Lakh (L) and Thousand (K)
					const formatAmount = val => {
						if (val >= 1e5) return (val / 1e5).toFixed(1).replace(/\.0$/, '') + " L";
						if (val >= 1e3) return (val / 1e3).toFixed(1).replace(/\.0$/, '') + " K";
						return val.toString();
					};

					this.oChart2 = new Chart(ctx, {
						type: "line",
						data: {
							labels,
							datasets: [{
								label: "PO",
								data: amounts.amountPO,
								borderColor: "#048D95",
								backgroundColor: "#25009D1A", // light transparency optional
								fill: false,
								tension: 0.4,
								pointRadius: 0,
								borderWidth: 1
							}, {
								label: "Non PO",
								data: amounts.amountNonPO,
								borderColor: "#013D6F",
								backgroundColor: "#4DB1511A",
								fill: false,
								tension: 0.4,
								pointRadius: 0,
								borderWidth: 1
							}, {
								label: "Service",
								data: amounts.amountService,
								borderColor: "#7AD254",
								backgroundColor: "#98A2B31A",
								fill: false,
								tension: 0.4,
								pointRadius: 0,
								borderWidth: 1
							}]
						},
						options: {
							responsive: true,
							maintainAspectRatio: false,
							layout: {
								padding: {
									bottom: 0,
									top: 0
								}
							},
							scales: {
								x: {
									ticks: {
										callback: () => '',
										color: "#000000B2",
										font: {
											size: 9
										}
									},
									grid: {
										color: "#e5e5e5",
										borderDash: [4, 4],
										drawTicks: false,
										drawBorder: false
									}
								},
								y: {
									beginAtZero: true,
									ticks: {
										callback: formatAmount,
										color: "#000000B2",
										font: {
											size: 9
										},
										maxTicksLimit: 5 // <-- only 5 ticks on Y-axis
									},
									grid: {
										color: "#e5e5e5",
										borderDash: [4, 4],
										drawTicks: false,
										drawBorder: false
									}
								}
							},
							plugins: {
								legend: {
									display: true,
									position: "bottom",
									labels: {
										usePointStyle: true,
										pointStyle: "line",
										color: "#000",
										font: {
											size: 11,
											family: "Geist"
										},
										padding: 10
									}
								},
								// tooltip: {
								// 	mode: "index",
								// 	intersect: false,
								// 	callbacks: {
								// 		label: ctx => {
								// 			const day = ctx.dataIndex;
								// 			const cat = ctx.dataset.label;
								// 			const amt = ctx.parsed.y;
								// 			const count = counts[`data${cat.replace(' ', '')}`][day];
								// 			return `${cat}: ${formatAmount(amt)} (${count} items)`;
								// 		}
								// 	}
								// }
								tooltip: {
	mode: "index",
	intersect: false,
	backgroundColor: "#ffffff",
	titleColor: "#000000",
	bodyColor: "#000000",
	borderColor: "#ccc",
	borderWidth: 1,
	padding: 10,
	cornerRadius: 6,
	displayColors: true,
	callbacks: {
		title: tooltipItems => {
			return labels[tooltipItems[0].dataIndex];
		},
		label: ctx => {
			const day = ctx.dataIndex;
			const cat = ctx.dataset.label;
			const amt = ctx.parsed.y;
			const count = counts[`data${cat.replace(' ', '')}`]?.[day] ?? 0;
			return `${cat}: ${formatAmount(amt)} (${count} items)`;
		}
	}
}
							},
							interaction: {
								mode: "nearest",
								intersect: false
							}
						}
					});
				}
			}, this);
		},
		// Expense Comparison chart

		fn_MaterialCurrentChartCall: function() {
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			var currentYear = new Date().getFullYear().toString();
			var prevYear = (new Date().getFullYear() - 1).toString();
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/MATERIALSPEND_YEARSet", {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var results = oData.results || [];

					var filtered = results.filter(function(item) {
						return item.Gjahr === currentYear;
					});

					var chartData = filtered.map(function(item) {
						return {
							Material: item.Mtart,
							Amount: parseFloat(item.TotalAmount) || 0
						};
					});

					var filteredprevyear = results.filter(function(item) {
						return item.Gjahr === prevYear;
					});
					var chartDataprevyear = filteredprevyear.map(function(item) {
						return {
							Material: item.Mtart,
							Amount: parseFloat(item.TotalAmount) || 0
						};
					});

					// now render chart with backend data
					that.fn_MaterialCurrentChart(chartData);
					that.fn_MaterialLastChart(chartDataprevyear);
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Error fetching data from backend.");
					// console.error(oError);
				}
			});
		},
		fn_MaterialCurrentChart: function(aChartData) {
			aChartData = aChartData || [];

			function formatNumber(val) {
				if (val >= 1e7) return (val / 1e7).toFixed(1) + " Cr";
				if (val >= 1e5) return (val / 1e5).toFixed(1) + " L";
				if (val >= 1e3) return (val / 1e3).toFixed(1) + " K";
				return val;
			}

			var aSeriesData = aChartData.map(d => d.Amount);
			var aCategories = aChartData.map(d => d.Material);

			var maxVal = aSeriesData.length ? Math.max(...aSeriesData) : 0;
			var interval = 10;
			if (maxVal > 100) {
				interval = 20;
			}
			var xaxisMax = Math.ceil(maxVal / interval) * interval + interval;

			var options = {
				chart: {
					type: 'bar',
					height: 160,
					toolbar: {
						show: false
					},
					fontFamily: 'Geist'
				},
				plotOptions: {
					bar: {
						horizontal: true,
						borderRadius: 0,
						borderRadiusApplication: 'end',
						barHeight: '60%',
						dataLabels: {
							position: 'top'
						},
						colors: {
							backgroundBarColors: ['#D6DBED66'],
							backgroundBarOpacity: 1,
							backgroundBarRadius: 0
						}
					}
				},
				dataLabels: {
					enabled: true,
					position: 'top',
					offsetX: 15,
					style: {
						colors: ['#000000B2'],
						fontSize: '9px',
						fontFamily: 'Geist',
						fontWeight: 500
					},
					formatter: function(val) {
						return formatNumber(val);
					}
				},
				series: [{
					name: 'Spend',
					data: aSeriesData,
					color: '#4DB151'
				}],
				xaxis: {
					categories: aCategories,
					min: 0,
					max: xaxisMax,
					tickAmount: 4,
					position: 'top',
					axisBorder: {
						show: true
					},
					axisTicks: {
						show: true
					},
					labels: {
						style: {
							fontFamily: 'Geist',
							fontSize: '9px',
							colors: '#000000B2'
						},
						formatter: val => formatNumber(val)
					}
				},
				yaxis: {
					labels: {
						style: {
							fontFamily: 'Geist',
							fontSize: '9px',
							colors: ['#000000B2']
						}
					}
				},
				grid: {
					show: true,
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					padding: {
						top: -20,
						bottom: -20,
						left: 10,
						right: 20
					},
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					y: {
						formatter: val => formatNumber(val)
					},
					x: {
						formatter: function(val, opts) {
							return aCategories[opts.dataPointIndex];
						}
					}
				}
			};

			var chartEl = document.querySelector("#materialCurrentExpenses");
			if (chartEl) {
				chartEl.innerHTML = "";

				// Destroy old chart if exists
				if (this._materialCurrentChart) {
					this._materialCurrentChart.destroy();
				}

				// Create new chart
				this._materialCurrentChart = new ApexCharts(chartEl, options);
				this._materialCurrentChart.render();

				// Observe container resize
				var container = chartEl.parentElement;
				new ResizeObserver(() => {
					if (this._materialCurrentChart) {
						// this._materialCurrentChart.resize();
					}
				}).observe(container);
			}
		},

		fn_MaterialLastChart: function(aChartData) {
			aChartData = aChartData || [];

			// Helper function to format numbers
			function formatNumber(val) {
				if (val >= 1e7) return (val / 1e7).toFixed(1) + " Cr";
				if (val >= 1e5) return (val / 1e5).toFixed(1) + " L";
				if (val >= 1e3) return (val / 1e3).toFixed(1) + " K";
				return val;
			}

			var aSeriesData = aChartData.map(d => d.Amount);
			var aCategories = aChartData.map(d => d.Material);

			var maxVal = aSeriesData.length ? Math.max(...aSeriesData) : 0;
			var interval = 10;
			if (maxVal > 100) {
				interval = 20;
			}
			var xaxisMax = Math.ceil(maxVal / interval) * interval + interval;

			var options = {
				chart: {
					type: 'bar',
					height: 160,

					toolbar: {
						show: false
					},
					fontFamily: 'Geist',
					parentHeightOffset: 0
				},
				plotOptions: {
					bar: {
						horizontal: true,
						borderRadius: 0,
						borderRadiusApplication: 'end',
						barHeight: '60%',
						dataLabels: {
							position: 'top'
						},
						colors: {
							backgroundBarColors: ['#D6DBED66'],
							backgroundBarOpacity: 1,
							backgroundBarRadius: 0
						}
					}
				},
				dataLabels: {
					enabled: true,
					position: 'top',
					offsetX: 15,
					style: {
						colors: ['#000000B2'],
						fontSize: '9px',
						fontFamily: 'Geist',
						fontWeight: 500
					},
					formatter: function(val) {
						return formatNumber(val);
					}
				},
				series: [{
					name: 'Spend',
					data: aSeriesData,
					color: '#175EE6'
				}],
				xaxis: {
					categories: aCategories,
					min: 0,
					max: xaxisMax,
					tickAmount: 4,
					position: 'top',
					axisBorder: {
						show: true
					},
					axisTicks: {
						show: true
					},
					labels: {
						style: {
							fontFamily: 'Geist',
							fontSize: '9px',
							colors: '#000000B2'
						},
						formatter: val => formatNumber(val)
					}
				},
				yaxis: {
					labels: {
						style: {
							fontFamily: 'Geist',
							fontSize: '9px',
							colors: ['#000000B2']
						}
					}
				},
				grid: {
					show: true,
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					padding: {
						top: -20,
						bottom: -20,
						left: 10,
						right: 20
					},
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					y: {
						formatter: val => formatNumber(val)
					},
					x: {
						formatter: function(val, opts) {
							return aCategories[opts.dataPointIndex];
						}
					}
				}
			};

			var chartEl = document.querySelector("#materialLastExpenses");
			if (chartEl) {
				chartEl.innerHTML = ""; // clear existing chart
				// var chart = new ApexCharts(chartEl, options);
				// chart.render();
				if (this._materialPrevChart) {
					this._materialPrevChart.destroy();
				}
				this._materialPrevChart = new ApexCharts(chartEl, options);
				this._materialPrevChart.render();
				var container = chartEl.parentElement;
				new ResizeObserver(() => {
					if (this._materialPrevChart) {
						// this._materialPrevChart.resize();
					}
				}).observe(container);
			}
		},

		fn_MaterialMonthCurrentChartCall: function() {
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSCNXT360_SRV/");

			var currentYear = new Date().getFullYear().toString();
			var prevYear = (new Date().getFullYear() - 1).toString();
			const yearFilter = new sap.ui.model.Filter("Flag", "EQ", "MONTH");
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/MATERIALSPEND_YEARSet", {
				//filters: [yearFilter],
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var results = oData.results || [];

					var filtered = results.filter(function(item) {
						return item.Gjahr === currentYear;
					});

					var chartData = filtered.map(function(item) {
						return {
							Material: item.Mtart,
							Amount: parseFloat(item.TotalAmount) || 0
						};
					});

					var filteredprevyear = results.filter(function(item) {
						return item.Gjahr === currentYear;
					});
					var chartDataprevyear = filteredprevyear.map(function(item) {
						return {
							Material: item.Mtart,
							Amount: parseFloat(item.TotalAmount) || 0
						};
					});

					that.fn_MaterialMonthCurrentChart(chartData);
					that.fn_MaterialMonthLastChart(chartDataprevyear);

				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("Error fetching data from backend.");
					// console.error(oError);
				}
			});
		},
		fn_MaterialMonthCurrentChart: function(aData) {
			const nameMap = {
				"FY": "Finished Goods",
				"SFY": "Semi Finished",
				"ROH": "Raw Material",
				"Spares": "Spare Parts",
				"Others": "Miscellaneous"
			};

			// Helper function to format numbers
			function formatNumber(val) {
				if (val >= 1e7) return (val / 1e7).toFixed(1) + " Cr";
				if (val >= 1e5) return (val / 1e5).toFixed(1) + " L";
				if (val >= 1e3) return (val / 1e3).toFixed(1) + " K";
				return val;
			}

			const el = document.querySelector("#materialMonthCurrentExpenses");
			if (!el) return;

			el.innerHTML = "";
			el.style.height = "160px";
			el.style.width = "95%";

			const values = aData.map(o => o.Amount);
			const labels = aData.map(o => o.Material);
			let maxY = Math.max(...values) || 0;
			maxY = Math.ceil(maxY / 1000) * 1000;

			const capPixelHeight = 3;
			const chartPixelHeight = 165;
			const yRange = maxY - 0;
			const fixedCapHeight = (capPixelHeight / chartPixelHeight) * yRange;

			const capValues = values.map(v => Math.min(v, fixedCapHeight));
			const patternValues = values.map(v => v - Math.min(v, fixedCapHeight));

			const total = values.reduce((s, v) => s + v, 0);
			const txtCtrl = this.byId && this.byId("idAdvancePOTotal");
			if (txtCtrl) {
				txtCtrl.setText("₹ " + formatNumber(total));
			}

			const options = {
				chart: {
					type: 'bar',
					height: 160,
					width: '100%',
					toolbar: {
						show: false
					},
					stacked: true
				},
				legend: {
					show: false
				},
				plotOptions: {
					bar: {
						horizontal: true,
						barHeight: '60%',
						borderRadius: 0,
						borderRadiusApplication: 'end',
						dataLabels: {
							position: 'top'
						},
						colors: {
							backgroundBarColors: ['#D6DBED66'],
							backgroundBarOpacity: 1,
							backgroundBarRadius: 0
						},
						endingShape: 'flat'
					}
				},
				series: [{
					name: 'Pattern',
					data: patternValues
				}, {
					name: 'Cap',
					data: capValues
				}],
				xaxis: {
					categories: labels,
					position: 'top',
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist'
						},
						formatter: val => formatNumber(val)
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					min: 0,
					max: maxY,
					tickAmount: 5,
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2'
						},
						formatter: val => formatNumber(val)
					}
				},
				dataLabels: {
					enabled: true,
					position: 'top',
					offsetX: 20,
					style: {
						colors: ['#000000B2'],
						fontSize: '9px',
						fontFamily: 'Geist',
						fontWeight: 500
					},
					formatter: val => formatNumber(val)
				},
				fill: {
					type: ['pattern', 'solid'],
					pattern: {
						style: 'verticalLines',
						width: 3,
						height: 3,
						strokeWidth: 1.5
					},
					colors: ['#4DB151', '#4DB151']
				},
				grid: {
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					padding: {
						top: -20,
						bottom: -20,
						left: 10,
						right: 20
					},
					xaxis: {
						lines: {
							show: false
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					y: {
						formatter: (val, {
							dataPointIndex
						}) => {
							const key = aData[dataPointIndex].Material;
							const name = nameMap[key] || key;
							return `${key}<br>₹${formatNumber(val)}`;
						},
						title: {
							formatter: () => ''
						}
					}

				}
			};

			const chart = new ApexCharts(el, options);
			chart.render();
		},

		fn_MaterialMonthLastChart: function(chartDataprevyear) {
			// Helper function to format numbers
			function formatNumber(val) {
				if (val >= 1e7) return (val / 1e7).toFixed(1) + " Cr";
				if (val >= 1e5) return (val / 1e5).toFixed(1) + " L";
				if (val >= 1e3) return (val / 1e3).toFixed(1) + " K";
				return val;
			}

			const values = chartDataprevyear.map(o => o.Amount);
			const labels = chartDataprevyear.map(o => o.Material);

			let maxY = Math.max(...values) || 0;
			maxY = Math.ceil(maxY / 1000) * 1000;

			const capPixelHeight = 3;
			const chartPixelHeight = 165;
			const yRange = maxY - 0;
			const fixedCapHeight = (capPixelHeight / chartPixelHeight) * yRange;

			const capValues = values.map(v => Math.min(v, fixedCapHeight));
			const patternValues = values.map(v => v - Math.min(v, fixedCapHeight));

			const total = values.reduce((s, v) => s + v, 0);
			const txtCtrl = this.byId && this.byId("idAdvancePOTotal");
			if (txtCtrl) {
				txtCtrl.setText("₹ " + formatNumber(total));
			}

			const options = {
				chart: {
					type: 'bar',
					height: 160,
					width: '100%',
					toolbar: {
						show: false
					},
					stacked: true,
					fontFamily: 'Geist, sans-serif'
				},
				legend: {
					show: false
				},
				plotOptions: {
					bar: {
						horizontal: true,
						barHeight: '60%',
						borderRadius: 0,
						borderRadiusApplication: 'end',
						dataLabels: {
							position: 'top'
						},
						colors: {
							backgroundBarColors: ['#D6DBED66'],
							backgroundBarOpacity: 1,
							backgroundBarRadius: 0
						},
						endingShape: 'flat'
					}
				},
				series: [{
					name: 'Pattern',
					data: patternValues
				}, {
					name: 'Cap',
					data: capValues
				}],
				xaxis: {
					categories: labels,
					position: 'top',
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2',
							fontFamily: 'Geist'
						},
						formatter: val => formatNumber(val)
					},
					axisBorder: {
						show: false
					},
					axisTicks: {
						show: false
					}
				},
				yaxis: {
					min: 0,
					max: maxY,
					tickAmount: 5,
					labels: {
						style: {
							fontSize: '9px',
							colors: '#000000B2'
						},
						formatter: val => formatNumber(val)
					}
				},
				dataLabels: {
					enabled: true,
					position: 'top',
					offsetX: 20,
					style: {
						colors: ['#000000B2'],
						fontSize: '9px',
						fontFamily: 'Geist',
						fontWeight: 500
					},
					formatter: val => formatNumber(val)
				},
				fill: {
					type: ['pattern', 'solid'],
					pattern: {
						style: 'verticalLines',
						width: 3,
						height: 3,
						strokeWidth: 1.5
					},
					colors: ['#175EE6', '#175EE6']
				},
				grid: {
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					padding: {
						top: -20,
						bottom: -20,
						left: 10,
						right: 20
					},
					xaxis: {
						lines: {
							show: false
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					y: {
						formatter: (val, {
							dataPointIndex
						}) => {
							const key = labels[dataPointIndex];
							return `${key}<br>₹${formatNumber(val)}`;
						},
						title: {
							formatter: () => ''
						}
					}
				}
			};

			const el = document.querySelector("#materialMonthLastExpenses");
			if (!el) return;

			el.innerHTML = "";
			el.style.height = "160px";
			el.style.width = "95%";

			const chart = new ApexCharts(el, options);
			chart.render();
		},

		fn_AccountsGroupCurrentCall: function() {
			const oDashboardModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");

			// Get January 1st to today
			const oToday = new Date();
			const sYear = oToday.getFullYear();
			const oFromDate = new Date(`${sYear}-01-01T00:00:00`);
			const oToDate = oToday;

			// Format date to YYYY-MM-DD for OData
			const formatODataDate = (oDate) => {
				const yyyy = oDate.getFullYear();
				const mm = String(oDate.getMonth() + 1).padStart(2, "0");
				const dd = String(oDate.getDate()).padStart(2, "0");
				return `${yyyy}-${mm}-${dd}`;
			};

			const sFromDate = formatODataDate(oFromDate);
			const sToDate = formatODataDate(oToDate);

			const aFilters = [
				new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
			];
			sap.ui.core.BusyIndicator.show(0);
			oDashboardModel.read("/Gl_BalanceSet", {
				filters: aFilters,
				success: (oData) => {
					sap.ui.core.BusyIndicator.hide();
					const aResults = oData.results || [];

					const aData = aResults.map(item => ({
						x: item.Txt20 || item.GlAccount,
						y: parseFloat(item.Balance) || 0
					}));

					const totalAmount = aData.reduce((sum, item) => sum + item.y, 0);

					this.byId("id_txtYear_accgrpcurrent").setText(sYear);
					this.byId("id_txtAmount_accgrpcurrent").setText("Total: " + this.fnFormatAmount(totalAmount));

					// Zigzag reorder
					const aZigzag = [];
					let left = 0;
					let right = aData.length - 1;
					let toggle = true;

					while (left <= right) {
						if (toggle) {
							aZigzag.push(aData[left++]);
						} else {
							aZigzag.push(aData[right--]);
						}
						toggle = !toggle;
					}

					this.fn_AccountsGroupCurrent(aZigzag);
				},
				error: (oError) => {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show("OData error occurred. Please try again.");

				}
			});
		},

		fnFormatAmount: function(amount) {
			if (amount >= 10000000) return (amount / 10000000).toFixed(2) + " Cr";
			if (amount >= 100000) return (amount / 100000).toFixed(2) + " L";
			return amount.toFixed(2);
		},

		fn_AccountsGroupCurrent: function(aData) {

			const el = document.querySelector("#accountsGroupCurrent");
			if (!el) {
				// console.warn("Chart container not found.");
				return;
			}

			const maxValue = Math.max(...aData.map(item => item.y));
			el.innerHTML = ""; // Clear old chart if re-rendered

			const options = {
				chart: {
					type: 'area',
					height: 160,
					width: '104%',
					background: '#ffffff',
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false
					},
					offsetY: -15
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					curve: 'smooth',
					width: 1,
					colors: ['#4DB151']
				},
				fill: {
					type: 'gradient',
					gradient: {
						shade: 'light',
						shadeIntensity: 0.3,
						opacityFrom: 0.4,
						opacityTo: 0,
						stops: [0, 90, 100],
						colorStops: [{
							offset: 0,
							color: "#4DB151",
							opacity: 0.4
						}, {
							offset: 100,
							color: "#4DB151",
							opacity: 0
						}]
					}
				},
				markers: {
					size: 4,
					colors: ['#fff'],
					strokeColors: '#4DB151',
					strokeWidth: 1,
					hover: {
						size: 6
					}
				},
				series: [{
					name: "Spend",
					data: aData.map(item => item.y)
				}],
				xaxis: {
					categories: aData.map(item => item.x),
					labels: {
						style: {
							fontSize: '9px',
							fontFamily: 'Geist',
							color: '#000000B2'
						},
						offsetY: -5
					},
					axisTicks: {
						show: false
					},
					axisBorder: {
						show: false
					},
					tickPlacement: 'between'
				},
				yaxis: {
					min: 0,
					max: maxValue,
					tickAmount: 4,
					labels: {
						formatter: val => Math.round(val / 100000) + " L",
						style: {
							fontSize: '9px',
							fontFamily: 'Geist',
							color: '#000000B2'
						}
					}
				},
				grid: {
					padding: {
						top: -13
					},
					borderColor: '#e5e5e5',
					strokeDashArray: 2,
					xaxis: {
						lines: {
							show: true
						}
					},
					yaxis: {
						lines: {
							show: true
						}
					}
				},
				tooltip: {
					theme: 'light',
					style: {
						fontSize: '12px',
						fontFamily: 'Geist, sans-serif'
					}
				}
			};

			const chart = new ApexCharts(el, options);
			chart.render();
		},
		fn_AccountsGroupLast: function() {
			const oDashboardModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");

			const oToday = new Date();
			const sLastYear = oToday.getFullYear() - 1;
			//const sLastYear = oToday.getFullYear(); 
			const oFromDate = new Date(`${sLastYear}-01-01T00:00:00`);
			const oToDate = new Date(sLastYear, oToday.getMonth(), oToday.getDate());

			const formatODataDate = (oDate) => {
				const yyyy = oDate.getFullYear();
				const mm = String(oDate.getMonth() + 1).padStart(2, "0");
				const dd = String(oDate.getDate()).padStart(2, "0");
				return `${yyyy}-${mm}-${dd}`;
			};

			this.byId("id_txtYear_accgrpPrev").setText(sLastYear);

			const sFromDate = formatODataDate(oFromDate);
			const sToDate = formatODataDate(oToDate);

			const aFilters = [
				new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, sFromDate, sToDate)
			];
			sap.ui.core.BusyIndicator.show(0);
			oDashboardModel.read("/Gl_BalanceSet", {
				filters: aFilters,
				success: (oData) => {
					sap.ui.core.BusyIndicator.hide();
					const aResults = oData.results || [];

					let aData = aResults.map(item => ({
						x: item.Txt20 || item.GlAccount,
						y: parseFloat(item.Balance) || 0
					}));

					const aZigzag = [];
					let left = 0;
					let right = aData.length - 1;
					let toggle = true;

					while (left <= right) {
						if (toggle) {
							aZigzag.push(aData[left++]);
						} else {
							aZigzag.push(aData[right--]);
						}
						toggle = !toggle;
					}
					aData = aZigzag; // replace original data with zigzag order

					const totalAmount = aData.reduce((sum, item) => sum + item.y, 0);
					const maxValue = Math.max(...aData.map(item => item.y));

					this.byId("id_txtAmount_accgrpPrev").setText("Total " + this.fnFormatAmount(totalAmount));

					const el = document.querySelector("#accountsGroupLast");
					if (!el) {
						// console.warn("Chart container not found.");
						return;
					}
					el.innerHTML = "";

					const options = {
						chart: {
							type: 'area',
							height: 160,
							width: '105%',
							background: '#ffffff',
							toolbar: {
								show: false
							},
							zoom: {
								enabled: false
							},
							offsetY: -15
						},
						dataLabels: {
							enabled: false
						},
						stroke: {
							curve: 'smooth',
							width: 1,
							colors: ['#25009D']
						},
						fill: {
							type: 'gradient',
							gradient: {
								shade: 'light',
								shadeIntensity: 0.3,
								opacityFrom: 0.4,
								opacityTo: 0,
								stops: [0, 90, 100],
								colorStops: [{
									offset: 0,
									color: "#25009D",
									opacity: 0.4
								}, {
									offset: 100,
									color: "#25009D",
									opacity: 0
								}]
							}
						},
						markers: {
							size: 4,
							colors: ['#fff'],
							strokeColors: '#25009D',
							strokeWidth: 1,
							hover: {
								size: 6
							}
						},
						series: [{
							name: "Spend",
							data: aData.map(item => item.y)
						}],
						xaxis: {
							categories: aData.map(item => item.x),
							labels: {
								style: {
									fontSize: '9px',
									fontFamily: 'Geist',
									color: '#000000B2'
								},
								offsetY: -5
							},
							axisTicks: {
								show: false
							},
							axisBorder: {
								show: false
							},
							tickPlacement: 'between'
						},
						yaxis: {
							min: 0,
							max: maxValue,
							tickAmount: 4,
							labels: {
								formatter: val => Math.round(val / 100000) + " L",
								style: {
									fontSize: '9px',
									fontFamily: 'Geist',
									color: '#000000B2'
								}
							}
						},
						grid: {
							padding: {
								top: -13
							},
							borderColor: '#e5e5e5',
							strokeDashArray: 2,
							xaxis: {
								lines: {
									show: true
								}
							},
							yaxis: {
								lines: {
									show: true
								}
							}
						},
						tooltip: {
							theme: 'light',
							style: {
								fontSize: '12px',
								fontFamily: 'Geist, sans-serif'
							}
						}
					};

					const chart = new ApexCharts(el, options);
					chart.render();
				},
				error: (oError) => {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(oError);
				}
			});
		},
		fn_sortByQueid: function() {
		    var aData;
		
		    // choose dataset based on which tile is active
		    if (this._sActiveTile === "GRN") {
		        aData = this.aGrnData;
		    } else {
		        aData = this.aFullData;
		    }
		
		    if (!aData || !Array.isArray(aData)) {
		    	this.fnShowErrorDialog("No data to sort.");
		       
		        return;
		    }
		
		    if (this._bSortDescending === undefined) {
		        this._bSortDescending = false;
		    } else {
		        this._bSortDescending = !this._bSortDescending;
		    }
		
		    aData.sort(function(a, b) {
		        return this._bSortDescending
		            ? b.Qid.localeCompare(a.Qid)
		            : a.Qid.localeCompare(b.Qid);
		    }.bind(this));
		
		    // sync back to filtered array
		    this.aFilteredData = aData.slice();
		
		    // update icon
		    var oIcon = this.byId("qidSortIcon");
		    if (oIcon) {
		        oIcon.setSrc(this._bSortDescending ? "Images/arrow-down.svg" : "Images/arrow-up.svg");
		    }
		
		    this.iCurrentPage = 1;
		    this.updatePaginatedModel();
		},
		fnShowErrorDialog: function (message) {
		    var oView = this.getView();
			var that = this;
			 var oErrorModel = new sap.ui.model.json.JSONModel({ message:message  });
        	that.getView().setModel(oErrorModel, "errorModel");
	
		    if (!that._oErrorDialog) {
            that._oErrorDialog = sap.ui.xmlfragment(
            	oView.getId(),
            	"FSC360NEW.fragment.ErrorReuse",
            	that
            	);
            that.getView().addDependent(that._oErrorDialog);
        }
        that._oErrorDialog.open();
		
		  
		},
			fn_onCloseErrorDialog: function () {
			this._oErrorDialog.destroy();
			 this._oErrorDialog = null; 
		   
		},
		_drawPendingAgeingChart: function () {

    const chartContainer = document.querySelector("#pendingAgeingChart");
    if (!chartContainer || typeof ApexCharts === "undefined") {
        return;
    }

     var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
    const sPath = "/PendingageSet"; // <-- Your EntitySet name for pending ageing

    oModel.read(sPath, {
        success: function (oData) {

            if (!oData.results || oData.results.length === 0) {
                return;
            }

            // -----------------------------
            // Prepare chart data dynamically
            // -----------------------------
            const categories = [];
            const indexedArr = [];
            const parkedArr = [];
            const postedArr = [];

            oData.results.forEach(function (row) {
                categories.push(row.Agetext.replace(" ", "\n")); // add line break for X-axis
                indexedArr.push(Number(row.IndexC));
                parkedArr.push(Number(row.ParkedC));
                postedArr.push(Number(row.PostedC));
            });

            // -----------------------------
            // Apex chart options
            // -----------------------------
            const options = {
                chart: {
                    type: "bar",
                    height: 160,
                    stacked: true,
                    toolbar: { show: false },
                    animations: {
                        enabled: true,
                        easing: "easeinout",
                        speed: 700
                    }
                },
                // to remover hovereffecr
  states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } }
    },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: "45%"
                    }
                },

                series: [
                    { name: "To be indexed", data: indexedArr },
                    { name: "To be parked", data: parkedArr },
                    { name: "To be posted", data: postedArr }
                ],

                colors: ["#2A1EDD", "#4685FD", "#A36BF6"],

                xaxis: {
                    categories: categories,
                    labels: { style: { fontSize: "10px",	fontFamily: 'Geist, sans-serif'} },
                    axisTicks: { show: false },
                    axisBorder: { show: false }
                },

                yaxis: {
                    tickAmount: 4,
                    labels: { style: { fontSize: "10px",	fontFamily: 'Geist, sans-serif' } }
                },

                grid: {
                    strokeDashArray: 3,
                    yaxis: { lines: { show: true } },
                    xaxis: { lines: { show: false } }
                },

                legend: {
                    position: "bottom",
                    horizontalAlign: "center",
                    fontSize: "11px",
                    	fontFamily: 'Geist, sans-serif',
                    markers: { width: 6, height: 6, radius: 1 }
                },

                dataLabels: { enabled: false },

                tooltip: { shared: true, intersect: false }
            };

            // Destroy previous chart if exists
            if (this._pendingAgeingChart) {
                this._pendingAgeingChart.destroy();
            }

            // Render new chart
            this._pendingAgeingChart = new ApexCharts(chartContainer, options);
            this._pendingAgeingChart.render();

        }.bind(this),

        error: function () {
            sap.m.MessageToast.show("Failed to load Pending Ageing data");
        }
    });
},
_drawAgeingChart: function () {

  const chartContainer = document.querySelector("#ageingChart");
  if (!chartContainer || typeof ApexCharts === "undefined") {
    return;
  }

  //const oModel = this.getOwnerComponent().getModel(); // OData V2 model
     var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
  const sPath = "/ScanageSet"; // <-- Your EntitySet name

  oModel.read(sPath, {
    success: function (oData) {

      if (!oData.results || oData.results.length === 0) {
        return;
      }

      // -----------------------------
      // Prepare chart data
      // -----------------------------
      const categories = [];
      const indexedArr = [];
      const parkedArr  = [];
      const postedArr  = [];

      oData.results.forEach(function (row) {
        categories.push(row.Agetext.replace(" ", "\n")); // line break
        indexedArr.push(Number(row.IndexC));
        parkedArr.push(Number(row.ParkedC));
        postedArr.push(Number(row.PostedC));
      });

      // -----------------------------
      // Apex chart options
      // -----------------------------
      const options = {
        chart: {
          type: "bar",
          height: 160,
          stacked: true,
          toolbar: { show: false },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 700
          }
        },
  states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } }
    },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "45%"
          }
        },

        series: [
          { name: "To be indexed", data: indexedArr },
          { name: "To be parked", data: parkedArr },
          { name: "To be posted", data: postedArr }
        ],

        colors: ["#F5D77B", "#FBAFAB", "#7DE4A5"],

        xaxis: {
          categories: categories,
          labels: {
            style: { fontSize: "10px",	fontFamily: 'Geist, sans-serif' }
          },
          axisTicks: { show: false },
          axisBorder: { show: false }
        },

        yaxis: {
          tickAmount: 4,
          labels: {
            style: { fontSize: "10px",	fontFamily: 'Geist, sans-serif' }
          }
        },

        grid: {
          strokeDashArray: 3,
          yaxis: { lines: { show: true } },
          xaxis: { lines: { show: false } }
        },

        legend: {
          position: "bottom",
          horizontalAlign: "center",
          fontSize: "11px",
          	fontFamily: 'Geist, sans-serif',
          markers: {
            width: 6,
            height: 6,
            radius: 1
          }
        },

        dataLabels: { enabled: false },

        tooltip: {
          shared: true,
          intersect: false
        }
      };

      // -----------------------------
      // Render chart
      // -----------------------------
      if (this._ageingChart) {
        this._ageingChart.destroy();
      }

      this._ageingChart = new ApexCharts(chartContainer, options);
      this._ageingChart.render();

    }.bind(this),

    error: function () {
      sap.m.MessageToast.show("Failed to load ageing data");
    }
  });
},
    _drawLocationAgeChart: function () {

    const chartContainer = document.querySelector("#locationAgeChart");
    if (!chartContainer || typeof ApexCharts === "undefined") {
        return;
    }

    var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
    const sPath = "/LocscanageSet"; // <-- Your EntitySet name

    oModel.read(sPath, {
        success: function (oData) {

            if (!oData.results || oData.results.length === 0) {
                return;
            }

            // -----------------------------
            // Prepare chart data dynamically
            // -----------------------------
            const categories = [];
            const within1Arr = [];
            const day2Arr = [];
            const gt2Arr = [];

            oData.results.forEach(function (row) {
                categories.push(row.Bukrs);           // Company Code as X-axis
                  //categories.push(row.BUKRS.replace(" ", "\n")); // line break
                within1Arr.push(Number(row.Within1));
                day2Arr.push(Number(row.Day2));
                gt2Arr.push(Number(row.Gt2));
            });

            // -----------------------------
            // Apex chart options
            // -----------------------------
            const options = {
                chart: {
                    type: "bar",
                    height: 170,
                    stacked: true,
                    toolbar: { show: false },
                    animations: {
                        enabled: true,
                        easing: "easeinout",
                        speed: 700
                    }
                },
  states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } }
    },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: "40%"
                    }
                },

                series: [
                    { name: "> 2 workdays", data: gt2Arr },
                    { name: "Within 1 workday", data: within1Arr },
                    { name: "2 workdays", data: day2Arr }
                ],

                colors: ["#3B82F6", "#5ED0C0", "#F5C542"],

                xaxis: {
                    categories: categories,
                    labels: { style: { fontSize: "10px",	fontFamily: 'Geist, sans-serif' } },
                    axisTicks: { show: false },
                    axisBorder: { show: false }
                },

                yaxis: {
                    tickAmount: 4,
                    labels: { style: { fontSize: "10px",	fontFamily: 'Geist, sans-serif' } }
                },

                grid: {
                    strokeDashArray: 3,
                    yaxis: { lines: { show: true } },
                    xaxis: { lines: { show: false } }
                },

                legend: {
                    position: "bottom",
                    horizontalAlign: "center",
                    fontSize: "11px",
                    fontFamily: 'Geist, sans-serif',
                    markers: { width: 6, height: 6, radius: 1 }
                },

                dataLabels: { enabled: false },

                tooltip: { shared: true, intersect: false }
            };

            // Destroy previous chart if exists
            if (this._locationAgeChart) {
                this._locationAgeChart.destroy();
            }

            // Render new chart
            this._locationAgeChart = new ApexCharts(chartContainer, options);
            this._locationAgeChart.render();

        }.bind(this),

        error: function () {
            sap.m.MessageToast.show("Failed to load Location Age data");
        }
    });
},
fnExalcaVolumeChart: function () {
    var that = this;

    // var oModel = this.getView().getModel(); // your OData V2 model
  var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
    oModel.read("/VolumeccSet", {
        success: function (oData) {

            const el = document.getElementById("exalcaStackedChart");
            if (!el) {
                console.warn("Chart container not yet available");
                return;
            }

            el.innerHTML = "";

            var results = oData.results || [];

            if (!results.length) {
                console.warn("No volume data returned from backend");
                return;
            }

            // ----------------------------------
            // 1. Collect unique years (sorted)
            // ----------------------------------
            var yearSet = {};
            var companySet = {};

            results.forEach(function (row) {
                yearSet[row.Yrs] = true;
                companySet[row.Bukrs] = true;
            });

            var categories = Object.keys(yearSet).sort();   // X-axis years
            var companies  = Object.keys(companySet);       // Series (BUKRS)

            // ----------------------------------
            // 2. Build series per company
            // ----------------------------------
            var series = companies.map(function (bukrs) {

                var data = categories.map(function (yr) {

                    var match = results.find(function (r) {
                        return r.Yrs === yr && r.Bukrs === bukrs;
                    });

                    return match ? parseInt(match.Cnt, 10) : 0;
                });

                return {
                    name: bukrs,
                    data: data
                };
            });

            // ----------------------------------
            // 3. Apex Chart Options
            // ----------------------------------
            const options = {
                chart: {
                    type: "bar",
                    height: 190,
                    toolbar: { show: false },
                    fontFamily: "Geist, sans-serif"
                },

                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: "50%"
                    }
                },

                dataLabels: { enabled: false },

                series: series,

                xaxis: {
                    categories: categories,
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    labels: {
                        style: {
                            fontFamily: "Geist, sans-serif",
                            fontSize: "10px",
                            fontWeight: 500
                        }
                    }
                },

                yaxis: {
                    labels: {
                        formatter: val => val >= 1000 ? (val / 1000) + "K" : val,
                        style: {
                            fontFamily: "Geist, sans-serif",
                            fontSize: "10px",
                            fontWeight: 500
                        }
                    }
                },

                legend: {
                    position: "bottom",
                    horizontalAlign: "center",
                    fontFamily: "Geist, sans-serif",
                    fontSize: "9px",
                    fontWeight: 500,
                    markers: {
                        width: 10,
                        height: 10,
                        radius: 2
                    }
                },

                fill: {
                    type: "pattern",
                    pattern: {
                        style: "horizontalLines",
                        width: 2,
                        height: 2,
                        strokeWidth: 0.5
                    }
                },

                grid: {
                    borderColor: "#e5e5e5",
                    strokeDashArray: 3
                }
            };

            // ----------------------------------
            // 4. Destroy & Render
            // ----------------------------------
            if (that._exalcaChart) {
                that._exalcaChart.destroy();
            }

            that._exalcaChart = new ApexCharts(el, options);
            that._exalcaChart.render();
        },

        error: function (oError) {
            console.error("Error reading VOLUMECCSET", oError);
        }
    });
},
// fnExalcaVolumeChart: function () {
//     var that = this;

//     setTimeout(function () {

//         const el = document.getElementById("exalcaStackedChart");
//         if (!el) {
//             console.warn("Chart container not yet available");
//             return;
//         }

//         el.innerHTML = "";

//         const categories = ["2022", "2023", "2024", "2025"];

//         const series = [
//             { name: "GEML", data: [100000, 180000, 170000, 120000] },
//             { name: "VCPL", data: [140000, 130000, 60000, 90000] },
//             { name: "VGIL", data: [175000, 25000, 22000, 26000] }
//         ];

//         const options = {
//             chart: {
//                 type: "bar",
//                 height: 180,
//                 toolbar: { show: false },
//                 fontFamily: "Geist, sans-serif"
//             },
//             plotOptions: {
//                 bar: {
//                     horizontal: false,
//                     columnWidth: "50%"
//                 }
//             },
//             dataLabels: { enabled: false },

//             series: series,

//             xaxis: {
//                 categories: categories,
//                 axisBorder: { show: false },
//                 axisTicks: { show: false },
//                 labels: {
//                     style: {
//                         fontFamily: "Geist, sans-serif",
//                         fontSize: "10px",
//                         fontWeight: 500
//                     }
//                 }
//             },

//             yaxis: {
//                 labels: {
//                     formatter: val => val >= 1000 ? (val / 1000) + "K" : val,
//                     style: {
//                         fontFamily: "Geist, sans-serif",
//                         fontSize: "10px",
//                         fontWeight: 500
//                     }
//                 }
//             },

//             legend: {
//                 position: "bottom",
//                 horizontalAlign: "center",
//                 fontFamily: "Geist, sans-serif",
//                 fontSize: "9px",
//                 fontWeight: 500,
//                 markers: {
//                     width: 10,
//                     height: 10,
//                     radius: 2
//                 }
//             },

//             fill: {
//                 type: "pattern",
//                 pattern: {
//                     style: "horizontalLines",
//                     width: 2,
//                     height: 2,
//                     strokeWidth: 0.5
//                 }
//             },

//             colors: ["#FFB363", "#4672C3", "#60CD89"],

//             grid: {
//                 borderColor: "#e5e5e5",
//                 strokeDashArray: 3
//             }
//         };

//         if (that._exalcaChart) {
//             that._exalcaChart.destroy();
//         }

//         that._exalcaChart = new ApexCharts(el, options);
//         that._exalcaChart.render();

//     }, 300);
// },
fn_ScanToPostTATChart: function () {
    var that = this;

    setTimeout(function () {

        const el = document.getElementById("tatApexChart");
        if (!el) {
            console.warn("TAT Apex chart container not yet available");
            return;
        }

        el.innerHTML = "";

        // === Backend OData call ===
        var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/");
        oModel.read("/ScanToPostSet", {
            success: function (oData) {
                if (!oData.results || oData.results.length === 0) {
                    console.warn("No TAT data available");
                    return;
                }

                // 1️⃣ Extract unique years for X-axis
                const categories = [...new Set(oData.results.map(d => d.Yrs))].sort();

                // 2️⃣ Define buckets (labels)
                const buckets = ["Within 1 workday", "Within 2 - 3 workdays", "Late >3 days"];

                // 3️⃣ Build series from backend data
                const series = buckets.map(bucket => ({
                    name: bucket,
                    data: categories.map(year => {
                        // find the record that matches the year and bucket text
                        const item = oData.results.find(r => r.Yrs === year && r.Text === bucket);
                        return item ? item.Cnt : 0; // directly bind Cnt from backend
                    })
                }));

                // 4️⃣ Chart options (design unchanged)
                const options = {
                    chart: { type: "area", height: 190, toolbar: { show: false }, fontFamily: "Geist, sans-serif" },
                    stroke: { curve: "smooth", width: 0.5 },
                    fill: { type: "gradient", gradient: { shadeIntensity: 0.6, opacityFrom: 0.65, opacityTo: 0.05, stops: [0, 90, 100] } },
                    markers: { size: 4, strokeWidth: 1, fillColors: ["#ffffff"], hover: { size: 4 } },
                    dataLabels: { enabled: false },
                    series: series,
                    xaxis: { categories: categories, axisBorder: { show: false }, axisTicks: { show: false },
                             labels: { style: { fontSize: "9px", fontFamily: "Geist, sans-serif", colors: "#333" } } },
                    yaxis: { min: 0,
                             labels: { style: { fontSize: "9px", fontFamily: "Geist, sans-serif", colors: "#333" } } },
                    legend: { position: "bottom", horizontalAlign: "center", fontSize: "8px", fontFamily: "Geist",
                              markers: { width: 8, height: 8, radius: 12 } },
                    grid: { borderColor: "#e5e5e5", strokeDashArray: 3 },
                    colors: ["#4C8CFF", "#6A5CFF", "#F26C6C"]
                };

                // 5️⃣ Destroy old chart if exists
                if (that._tatApexChart) {
                    that._tatApexChart.destroy();
                }

                // 6️⃣ Render chart
                that._tatApexChart = new ApexCharts(el, options);
                that._tatApexChart.render();

            },
            error: function () {
                console.error("Failed to fetch TAT data from backend");
            }
        });

    }, 300);
},
// fn_ScanToPostTATChart: function () {
//     var that = this;

//     setTimeout(function () {

//         const el = document.getElementById("tatApexChart");
//         if (!el) {
//             console.warn("TAT Apex chart container not yet available");
//             return;
//         }

//         el.innerHTML = "";

//         const categories = ["2022", "2023", "2024", "2025"];

//         const series = [
//             { name: "Within 1 workday", data: [55, 60, 35, 95] },
//             { name: "Within 2 - 3 workdays", data: [25, 60, 90, 80] },
//             { name: "Late >3 days", data: [85, 65, 60, 75] }
//         ];

//         const options = {
//             chart: {
//                 type: "area",            // area for shaded fill
//                 height: 180,
//                 toolbar: { show: false },
//                 fontFamily: "Geist, sans-serif"
//             },

//             stroke: {
//                 curve: "smooth",
//                 width: 0.5             // thinner lines
//             },

//             fill: {
//                 type: "gradient",
//                 gradient: {
//                     shadeIntensity: 0.6,
//                     opacityFrom: 0.65,  // soft shaded area
//                     opacityTo: 0.05,
//                     stops: [0, 90, 100]
//                 }
//             },

//             markers: {
//                 size: 4,
//                 strokeWidth: 1,
//                 fillColors: ["#ffffff"], 
//                 // strokeColors: "#ffffff",   // white center border
//                 hover: { size: 4 }
//             },

//             dataLabels: { enabled: false },

//             series: series,

//             // xaxis: {
//             //     categories: categories,
//             //     axisBorder: { show: false },
//             //     axisTicks: { show: false }
//             // },

//             // yaxis: {
//             //     min: 0,
//             //     max: 100,
//             //     labels: {
//             //         formatter: function (val) {
//             //             return val + "%";
//             //         }
//             //     }
//             // },
//  xaxis: {
//                 categories: categories,
//                 axisBorder: { show: false },
//                 axisTicks: { show: false },
//                 labels: {
//                     style: {
//                         fontSize: "9px",
//                         fontFamily: "Geist, sans-serif",
//                         colors: "#333"
//                     }
//                 }
//             },

//             yaxis: {
//                 min: 0,
//                 max: 100,
//                 labels: {
//                     formatter: val => val + "%",
//                     style: {
//                         fontSize: "9px",
//                         fontFamily: "Geist, sans-serif",
//                         colors: "#333"
//                     }
//                 }
//             },
//             legend: {
//                 position: "bottom",
//                 horizontalAlign: "center",
//                   fontSize: "8px",                 // smaller legend text
//                 fontFamily: "Geist",  // Geist font
//                 markers: {
//                     width: 8,
//                     height: 8,
//                     radius: 12
//                 }
//             },

//             grid: {
//                 borderColor: "#e5e5e5",
//                 strokeDashArray: 3
//             },

//             colors: [
//                 "#4C8CFF",   // Within 1 day (blue)
//                 "#6A5CFF",   // Within 2-3 days (purple/blue)
//                 "#F26C6C"    // Late >3 days (red)
//             ]
//         };

//         if (that._tatApexChart) {
//             that._tatApexChart.destroy();
//         }

//         that._tatApexChart = new ApexCharts(el, options);
//         that._tatApexChart.render();

//     }, 300);
// },
fnInvoiceToPostAvgDaysChart: function () {
    var that = this;

    setTimeout(function () {

        const el = document.getElementById("avgDaysApexChart");
        if (!el) {
            return;
        }

        // Clear previous chart DOM
        el.innerHTML = "";

        var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/"
        );

        oModel.read("/InvoiceAvgSet", {
            success: function (oData) {

                if (!oData || !oData.results || !oData.results.length) {
                    return;
                }

                /* ----------------------------
                 * SORT BY YEAR ASC
                 * ---------------------------- */
                oData.results.sort(function (a, b) {
                    return a.Yrs - b.Yrs;
                });

                /* ----------------------------
                 * PREPARE CHART DATA
                 * ---------------------------- */
                var aYears = [];
                var aInvScan = [];
                var aScanPost = [];

                oData.results.forEach(function (item) {
                    aYears.push(String(item.Yrs));

                    // Convert NUMC strings safely
                    aInvScan.push(Number(item.AvgInv) || 0);
                    aScanPost.push(Number(item.Avgscan) || 0);
                });

                /* ----------------------------
                 * SERIES
                 * ---------------------------- */
                var aSeries = [
                    {
                        name: "Average of invoice2scan",
                        data: aInvScan
                    },
                    {
                        name: "Average of Scan2post",
                        data: aScanPost
                    }
                ];

                /* ----------------------------
                 * CHART OPTIONS
                 * ---------------------------- */
                var oOptions = {
                    chart: {
                        type: "bar",
                        height: 190,
                        toolbar: {
                            show: false
                        },
                        fontFamily: "Geist, sans-serif"
                    },

                    plotOptions: {
                        bar: {
                            horizontal: true,          // IMPORTANT
                            barHeight: "40%",
                            borderRadius: 3,
                            borderRadiusApplication: "end"
                        }
                    },

                    dataLabels: {
                        enabled: false
                    },

                    series: aSeries,

                    /* ----------------------------
                     * AXES
                     * For horizontal bar:
                     *  - categories MUST be on xaxis
                     * ---------------------------- */
                    xaxis: {
                        categories: aYears,          // ✅ YEARS HERE
                        min: 0,
                        max: 100,
                        tickAmount: 5,
                        labels: {
                            style: {
                                fontSize: "9px",
                                fontFamily: "Geist, sans-serif",
                                colors: "#333"
                            }
                        }
                    },

                    yaxis: {
                        labels: {
                            style: {
                                fontSize: "9px",
                                fontFamily: "Geist, sans-serif",
                                colors: "#333"
                            }
                        }
                    },

                    /* ----------------------------
                     * GRID & LEGEND
                     * ---------------------------- */
                    grid: {
                        borderColor: "#e5e5e5",
                        strokeDashArray: 3
                    },

                    legend: {
                        position: "bottom",
                        horizontalAlign: "center",
                        fontSize: "9px",
                        fontFamily: "Geist, sans-serif",
                        labels: {
                            colors: "#333"
                        },
                        markers: {
                            width: 8,
                            height: 8,
                            radius: 2
                        }
                    },

                    colors: [
                        "#1203F2",   // invoice2scan
                        "#19AF9D"    // scan2post
                    ]
                };

                /* ----------------------------
                 * DESTROY OLD CHART
                 * ---------------------------- */
                if (that._avgDaysChart) {
                    that._avgDaysChart.destroy();
                    that._avgDaysChart = null;
                }

                /* ----------------------------
                 * RENDER CHART
                 * ---------------------------- */
                that._avgDaysChart = new ApexCharts(el, oOptions);
                that._avgDaysChart.render();
            },

            error: function () {
                console.error("Failed to fetch InvoiceAvgSet data");
            }
        });

    }, 300);
},
// fnInvoiceToPostAvgDaysChart: function () {
//     var that = this;

//     setTimeout(function () {

//         const el = document.getElementById("avgDaysApexChart");
//         if (!el) return;

//         el.innerHTML = "";

//         const categories = ["2022", "2023", "2024", "2025"];

//         const series = [
//             {
//                 name: "Average of invoicescan",
//                 data: [22, 35, 55, 60]
//             },
//             {
//                 name: "Average of Scan2post",
//                 data: [25, 75, 100, 70]
//             }
//         ];

//         const options = {
//             chart: {
//                 type: "bar",
//                 height: 190,
//                 toolbar: { show: false },
//                 fontFamily: "Geist, sans-serif"
//             },

//             plotOptions: {
//                 bar: {
//                     horizontal: true,
//                     barHeight: "40%",
//                     borderRadius: 3,
//                     borderRadiusApplication: "end",
//                     borderRadiusWhenStacked: "last"
//                 }
//             },

//             dataLabels: { enabled: false },

//             series: series,

//             xaxis: {
//                 min: 0,
//                 max: 100,
//                 tickAmount: 5,
//                 labels: {
//                     style: {
//                         fontSize: "9px",
//                         fontFamily: "Geist, sans-serif",
//                         colors: "#333"
//                     }
//                 }
//             },

//             yaxis: {
//                 categories: categories,
//                 labels: {
//                     style: {
//                         fontSize: "9px",
//                         fontFamily: "Geist, sans-serif",
//                         colors: "#333"
//                     }
//                 }
//             },

//             legend: {
//                 position: "bottom",
//                 horizontalAlign: "center",
//                 fontSize: "8px",
//                 fontFamily: "Geist, sans-serif",
//                 labels: {
//                     colors: "#333"
//                 },
//                 markers: {
//                     width: 8,
//                     height: 8,
//                     radius: 2
//                 }
//             },

//             grid: {
//                 borderColor: "#e5e5e5",
//                 strokeDashArray: 3
//             },

//             colors: [
//                 "#1203F2",   // �Updated Blue
//                 "#19AF9D"    // �Updated Green
//             ]
//         };

//         if (that._avgDaysChart) {
//             that._avgDaysChart.destroy();
//         }

//         that._avgDaysChart = new ApexCharts(el, options);
//         that._avgDaysChart.render();

//     }, 300);
// },
fnScanToPostAvgDaysStackedChart: function () {
    var that = this;

    setTimeout(function () {

        const el = document.getElementById("scanToPostAvgStackedChart");
        if (!el) {
            console.warn("Scan to Post Avg stacked chart container not yet available");
            return;
        }

        el.innerHTML = "";

        var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/"
        );

        oModel.read("/ScantopostAvgSet", {
            success: function (oData) {

                var results = oData.results || [];

                // Sort by Year ascending (important for chart order)
                results.sort(function (a, b) {
                    return a.Yrs - b.Yrs;
                });

                var categories = [];
                var scanToParkData = [];
                var parkToPostData = [];

                results.forEach(function (item) {
                    categories.push(item.Yrs.toString());
                    scanToParkData.push(parseFloat(item.ScParkAvg || 0));
                    parkToPostData.push(parseFloat(item.ParkPostAvg || 0));
                });

                const options = {
                    chart: {
                        type: "bar",
                        height: 160,
                        stacked: true,
                        toolbar: { show: false },
                        fontFamily: "Geist, sans-serif"
                    },

                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: "45%",
                            borderRadius: 0,
                            borderRadiusApplication: "end"
                        }
                    },

                    dataLabels: {
                        enabled: true,
                        formatter: function (val) {
                            return val.toFixed(2);
                        },
                        style: {
                            fontSize: "9px",
                            fontWeight: 500,
                            colors: ["#202124"]
                        }
                    },

                    series: [
                        {
                            name: "Average of Scan2Park",
                            data: scanToParkData
                        },
                        {
                            name: "Average of Park2Post",
                            data: parkToPostData
                        }
                    ],

                    xaxis: {
                        categories: categories,
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                        labels: {
                            style: {
                                fontSize: "10px",
                                fontFamily: "Geist, sans-serif",
                                fontWeight: 500
                            }
                        }
                    },

                    yaxis: {
                        min: 0,
                        max: 200,
                        tickAmount: 4,
                        labels: {
                            style: {
                                fontSize: "10px",
                                fontFamily: "Geist, sans-serif",
                                fontWeight: 500
                            }
                        }
                    },

                    legend: {
                        position: "bottom",
                        horizontalAlign: "center",
                        fontSize: "9px",
                        fontFamily: "Geist, sans-serif",
                        fontWeight: 500,
                        markers: {
                            width: 8,
                            height: 8,
                            radius: 2
                        }
                    },

                    grid: {
                        borderColor: "#e5e5e5",
                        strokeDashArray: 3
                    },

                    colors: [
                        "#FFB0AE", // Scan → Park
                        "#3CC3DF"  // Park → Post
                    ]
                };

                if (that._scanToPostAvgStackedChart) {
                    that._scanToPostAvgStackedChart.destroy();
                }

                that._scanToPostAvgStackedChart = new ApexCharts(el, options);
                that._scanToPostAvgStackedChart.render();
            },

            error: function (err) {
                console.error("Error loading Scan to Post Avg data", err);
            }
        });

    }, 300);
},
// fnScanToPostAvgDaysStackedChart: function () {
//     var that = this;

//     setTimeout(function () {

//         const el = document.getElementById("scanToPostAvgStackedChart");
//         if (!el) {
//             console.warn("Scan to Post Avg stacked chart container not yet available");
//             return;
//         }

//         el.innerHTML = "";

//         const categories = ["2022", "2023", "2024", "2025"];

//         const series = [
//             {
//                 name: "Average of Scan2Park",
//                 data: [41.67, 95.79, 83.44, 45.36]
//             },
//             {
//                 name: "Average of Park2Post",
//                 data: [50.45, 43.63, 81.48, 41.08]
//             }
//         ];

//         const options = {
//             chart: {
//                 type: "bar",
//                 height: 190,
//                 stacked: true,
//                 toolbar: { show: false },
//                 fontFamily: "Geist, sans-serif"
//             },

//             plotOptions: {
//                 bar: {
//                     horizontal: false,
//                     columnWidth: "45%",
//                     borderRadius: 0,
//                     borderRadiusApplication: "end"
//                 }
//             },

//             dataLabels: {
//                 enabled: true,
//                 formatter: function (val) {
//                     return val.toFixed(2);
//                 },
//                 style: {
//                     fontSize: "9px",
//                     fontWeight: 500,
//                     colors: ["#202124"]
//                 }
//             },

//             series: series,

//             xaxis: {
//                 categories: categories,
//                 axisBorder: { show: false },
//                 axisTicks: { show: false },
//                 labels: {
//                     style: {
//                         fontSize: "10px",
//                         fontFamily: "Geist, sans-serif",
//                         fontWeight: 500
//                     }
//                 }
//             },

//             yaxis: {
//                 min: 0,
//                 max: 200,
//                 tickAmount: 4,
//                 labels: {
//                     style: {
//                         fontSize: "10px",
//                         fontFamily: "Geist, sans-serif",
//                         fontWeight: 500
//                     }
//                 }
//             },

//             legend: {
//                 position: "bottom",
//                 horizontalAlign: "center",
//                 fontSize: "9px",
//                 fontFamily: "Geist, sans-serif",
//                 fontWeight: 500,
//                 markers: {
//                     width: 8,
//                     height: 8,
//                     radius: 2
//                 }
//             },

//             grid: {
//                 borderColor: "#e5e5e5",
//                 strokeDashArray: 3
//             },

//             colors: [
//                 "#FFB0AE", // Pink
//                 "#3CC3DF"  // Blue
//             ]
//         };

//         if (that._scanToPostAvgStackedChart) {
//             that._scanToPostAvgStackedChart.destroy();
//         }

//         that._scanToPostAvgStackedChart = new ApexCharts(el, options);
//         that._scanToPostAvgStackedChart.render();

//     }, 300);
// },

// fnParkingTurnAroundTimeChart: function () {
//     var that = this;

//     setTimeout(function () {

//         const el = document.getElementById("parkingTurnAroundChart");
//         if (!el) {
//             console.warn("Parking Turn Around chart container not yet available");
//             return;
//         }

//         el.innerHTML = "";

//         // X-axis categories (Months)
//         const categories = ["January", "February", "March"];

//         // Series = grouped columns
//         const series = [
//             {
//                 name: "Within 1 workday",
//                 data: [40, 70, 30]
//             },
//             {
//                 name: "Within 2 workdays",
//                 data: [22, 35, 95]
//             },
//             {
//                 name: "Late Park > 2 Days",
//                 data: [45, 95, 28]
//             }
//         ];

//         const options = {
//             chart: {
//                 type: "bar",
//                 height: 220,
//                 stacked: false,           // 🔥 grouped (NOT stacked)
//                 toolbar: { show: false },
//                 fontFamily: "Geist, sans-serif"
//             },

//             plotOptions: {
//                 bar: {
//                     horizontal: false,
//                     columnWidth: "45%",
//                     borderRadius: 4,
//                     borderRadiusApplication: "end"
//                 }
//             },

//             dataLabels: {
//                 enabled: true,
//                 style: {
//                     fontSize: "11px",
//                     fontWeight: 500
//                 }
//             },

//             series: series,

//             xaxis: {
//                 categories: categories,
//                 axisBorder: { show: false },
//                 axisTicks: { show: false }
//             },

//             yaxis: {
//                 min: 0,
//                 max: 100,
//                 tickAmount: 5
//             },

//             legend: {
//                 position: "bottom",
//                 horizontalAlign: "center",
//                 markers: {
//                     width: 8,
//                     height: 8,
//                     radius: 2
//                 }
//             },

//             grid: {
//                 borderColor: "#e5e5e5",
//                 strokeDashArray: 3
//             },

//             colors: [
//                 "#7B6DFF",   // purple - Within 1 workday
//                 "#FF9B9B",   // pink/red - Within 2 workdays
//                 "#5BC6DE"    // teal - Late Park > 2 Days
//             ]
//         };

//         if (that._parkingTurnAroundChart) {
//             that._parkingTurnAroundChart.destroy();
//         }

//         that._parkingTurnAroundChart = new ApexCharts(el, options);
//         that._parkingTurnAroundChart.render();

//     }, 300);
// },
onParkTurnQuarterChange: function (oEvent) {
    var sQuarter = oEvent.getSource().getSelectedKey();
    console.log("Selected ParkTurn Quarter:", sQuarter);

    this._createOrUpdateParkTurnChart(sQuarter);
},
fnParkingTurnAroundTimeChart: function () {
    var that = this;

    setTimeout(function () {

        const el = document.getElementById("parkingTurnAroundChart");
        if (!el) {
            console.warn("Parking Turn Around chart container not yet available");
            return;
        }

        el.innerHTML = "";

        var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/"
        );

        oModel.read("/ParkTurnSet", {
            success: function (oData) {

                const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                // --- Init 12 months ---
                var categories = [];
                var within1d  = [];
                var within2d  = [];
                var more2d    = [];

                for (var j = 0; j < 12; j++) {
                    categories[j] = monthNames[j];
                    within1d[j]   = 0;
                    within2d[j]   = 0;
                    more2d[j]     = 0;
                }

                // --- Fill from backend (IMPORTANT: uppercase fields) ---
                for (var i = 0; i < oData.results.length; i++) {
                    var rec = oData.results[i];
                    var m = parseInt(rec.Mnth, 10) - 1;

                    within1d[m] = Number(rec.Within1d || 0);
                    within2d[m] = Number(rec.Within2d || 0);
                    more2d[m]   = Number(rec.More2d   || 0);
                }

                // --- Store full-year data on controller ---
                that._parkTurnFull = {
                    categories: categories,
                    within1d: within1d,
                    within2d: within2d,
                    more2d: more2d
                };

                // --- Create chart first time with Q1 ---
                that._createOrUpdateParkTurnChart("Q1");
            },


            error: function (oError) {
                console.error("Error reading ParkTurnSet", oError);
            }
        });

    }, 300);
},

_createOrUpdateParkTurnChart: function (sQuarter) {
    var el = document.getElementById("parkingTurnAroundChart");
    var data = this._parkTurnFull;
    if (!data || !el) return;

    var start = 0;
    switch (sQuarter) {
        case "Q1": start = 0; break;   // Jan–Mar
        case "Q2": start = 3; break;   // Apr–Jun
        case "Q3": start = 6; break;   // Jul–Sep
        case "Q4": start = 9; break;   // Oct–Dec
    }

    var cats = data.categories.slice(start, start + 3);
    var w1   = data.within1d.slice(start, start + 3);
    var w2   = data.within2d.slice(start, start + 3);
    var m2   = data.more2d.slice(start, start + 3);

    const options = {
        chart: {
            type: "bar",
            height: 190,
            stacked: false,                 // 🔥 grouped bars
            toolbar: { show: false },
            fontFamily: "Geist, sans-serif"
        },

        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "45%",
                borderRadius: 4,
                borderRadiusApplication: "end"
            }
        },

        dataLabels: {
            enabled: true,
            style: {
                fontSize: "10px",
                fontWeight: 500
            }
        },

        series: [
            { name: "Within 1 workday",    data: w1 },
            { name: "Within 2 workdays",  data: w2 },
            { name: "Late Park > 2 Days", data: m2 }
        ],

        xaxis: {
            categories: cats,
            axisBorder: { show: false },
            axisTicks: { show: false },
                 labels: {
                    style: {
                        fontSize: "10px",
                        fontFamily: "Geist, sans-serif",
                        fontWeight: 500
                    }
                }
        },

        yaxis: {
            min: 0,
            max: 100,          // same scale as your design
            tickAmount: 5,
               labels: {
                    style: {
                        fontSize: "10px",
                        fontFamily: "Geist, sans-serif",
                        fontWeight: 500
                    }
                }
        },

        legend: {
            position: "bottom",
            horizontalAlign: "center",
              fontSize: "9px",
                fontFamily: "Geist, sans-serif",
            markers: {
                width: 8,
                height: 8,
                radius: 2
            }
        },

        grid: {
            borderColor: "#e5e5e5",
            strokeDashArray: 3
        },

        colors: [
            "#7B6DFF",   // Within 1 workday
            "#FF9B9B",   // Within 2 workdays
            "#5BC6DE"    // Late Park > 2 Days
        ]
    };

    if (this._parkingTurnAroundChart) {
        // Smooth update on quarter change
        this._parkingTurnAroundChart.updateOptions(options, true, true);
    } else {
        this._parkingTurnAroundChart = new ApexCharts(el, options);
        this._parkingTurnAroundChart.render();
    }
},

// fnPostingTATDonutChart: function () {
//     var that = this;

//     setTimeout(function () {

//         const el = document.getElementById("postingTATDonutChart");
//         if (!el) {
//             console.warn("Posting TAT donut chart container not ready");
//             return;
//         }

//         el.innerHTML = "";

//         // 👉 Replace these with backend values
//         const tatData = {
//             within1: 40,
//             within2: 25,
//             within3: 20,
//             late: 15
//         };

//         const series = [
//             tatData.within1,
//             tatData.within2,
//             tatData.within3,
//             tatData.late
//         ];

//         // const options = {
//         //     chart: {
//         //         type: "donut",
//         //         height: 240,
//         //         fontFamily: "Geist, sans-serif"
//         //     },

//         //     series: series,

//         //     labels: [
//         //         "Within 1 workday",
//         //         "Within 2 workdays",
//         //         "Within 3 workdays",
//         //         "Late Posting > 3 workdays"
//         //     ],

//         //     colors: [
//         //         "#5A6BFF",   // Indigo
//         //         "#FF8A80",   // Soft Red
//         //         "#35C2F1",   // Cyan
//         //         "#FFB74D"    // Orange
//         //     ],

//         //     legend: {
//         //         position: "right",
//         //         fontSize: "12px",
//         //         itemMargin: {
//         //             vertical: 4
//         //         },
//         //         markers: {
//         //             width: 10,
//         //             height: 10,
//         //             radius: 10
//         //         }
//         //     },

//         //     dataLabels: {
//         //         enabled: false
//         //     },

//         //     stroke: {
//         //         width: 3,
//         //         colors: ["#ffffff"]
//         //     },

//         //     plotOptions: {
//         //         pie: {
//         //             donut: {
//         //                 size: "68%",
//         //                 labels: {
//         //                     show: true,
//         //                     name: { show: false },
//         //                     value: { show: false },
//         //                     total: {
//         //                         show: true,
//         //                         label: "Performance",
//         //                         fontSize: "22px",
//         //                         fontWeight: 700,
//         //                         color: "#2b2b2b",
//         //                         formatter: function (w) {
//         //                             const totals = w.globals.seriesTotals;
//         //                             const total = totals.reduce((a, b) => a + b, 0);
//         //                             const good = totals[0] + totals[1] + totals[2];
//         //                             return Math.round((good / total) * 100) + "%";
//         //                         }
//         //                     }
//         //                 }
//         //             }
//         //         }
//         //     },

//         //     tooltip: {
//         //         y: {
//         //             formatter: function (val) {
//         //                 return val + "% of invoices";
//         //             }
//         //         }
//         //     }
//         // };
//         const options = {
//     chart: {
//         type: "donut",
//         height: 250,
//         fontFamily: "Geist, sans-serif",
//         dropShadow: {
//             enabled: true,
//             top: 6,
//             left: 0,
//             blur: 8,
//             color: "#000",
//             opacity: 0.15
//         }
//     },

//     series: [40, 25, 20, 15],

//     labels: [
//         "Within 1 workday",
//         "Within 2 workdays",
//         "Within 3 workdays",
//         "Late Posting > 3 workdays"
//     ],

//     colors: [
//         "#3F51FF",
//         "#FF8A80",
//         "#29B6F6",
//         "#FFB74D"
//     ],

//     stroke: {
//         width: 4,
//         colors: ["#ffffff"]
//     },

//     dataLabels: {
//         enabled: false
//     },

//     legend: {
//         position: "right",
//         fontSize: "12px",
//         markers: {
//             width: 10,
//             height: 10,
//             radius: 12
//         }
//     },

//     fill: {
//         type: "gradient",
//         gradient: {
//             shade: "light",
//             type: "vertical",
//             shadeIntensity: 0.35,
//             gradientToColors: [
//                 "#1A2B9C",
//                 "#C75B5B",
//                 "#0F8BCB",
//                 "#C7771F"
//             ],
//             inverseColors: false,
//             opacityFrom: 1,
//             opacityTo: 1,
//             stops: [0, 100]
//         }
//     },

//     plotOptions: {
//         pie: {
//             startAngle: -90,
//             endAngle: 270,
//             donut: {
//                 size: "65%",
//                 background: "#f4f6fb",
//                 labels: {
//                     show: true,
//                     total: {
//                         show: true,
//                         label: "Performance",
//                         fontSize: "22px",
//                         fontWeight: 700,
//                         formatter: function (w) {
//                             const t = w.globals.seriesTotals;
//                             const total = t.reduce((a, b) => a + b, 0);
//                             const good = t[0] + t[1] + t[2];
//                             return Math.round((good / total) * 100) + "%";
//                         }
//                     }
//                 }
//             }
//         }
//     },

//     states: {
//         hover: {
//             filter: {
//                 type: "lighten",
//                 value: 0.08
//             }
//         }
//     },

//     tooltip: {
//         y: {
//             formatter: function (val) {
//                 return val + "% of invoices";
//             }
//         }
//     }
// };
// // const options = {
// //     chart: {
// //         type: "donut",
// //         height: 260,
// //         fontFamily: "Geist, sans-serif",
// //         dropShadow: {
// //             enabled: true,
// //             top: 8,
// //             blur: 12,
// //             opacity: 0.18
// //         }
// //     },

// //     series: series, // [40,25,20,15]

// //     labels: [
// //         "Within 1 workday",
// //         "Within 2 workdays",
// //         "Within 3 workdays",
// //         "Late Posting > 3 workdays"
// //     ],

// //     colors: [
// //         "#5665FF",   // Purple Blue
// //         "#FF8F87",   // Soft Red
// //         "#39C3F2",   // Cyan
// //         "#F5A623"    // Orange
// //     ],

// //     // ❌ REMOVE white borders between slices
// //     stroke: {
// //         width: 0
// //     },

// //     dataLabels: {
// //         enabled: false
// //     },

// //     legend: {
// //         position: "right",
// //         fontSize: "12px",
// //         markers: {
// //             width: 10,
// //             height: 10,
// //             radius: 12
// //         }
// //     },

// //     // ⭐ 3D SHADING EFFECT
// //     fill: {
// //         type: "gradient",
// //         gradient: {
// //             shade: "dark",
// //             type: "radial",
// //             shadeIntensity: 0.6,
// //             gradientToColors: [
// //                 "#2F3ECC",  // darker tone of blue
// //                 "#D96B63",  // darker red
// //                 "#1B9FCC",  // darker cyan
// //                 "#C97C12"   // darker orange
// //             ],
// //             stops: [0, 70, 100]
// //         }
// //     },

// //     plotOptions: {
// //         pie: {
// //             startAngle: -90,
// //             endAngle: 270,
// //             donut: {
// //                 size: "50%",   // thicker ring like Figma
// //                 background: "transparent",
// //                 labels: {
// //                     show: true,
// //                     name: { show: false },
// //                     value: { show: false },
// //                     total: {
// //                         show: true,
// //                         fontSize: "28px",
// //                         fontWeight: 700,
// //                         color: "#2b2b2b",
// //                         formatter: function (w) {
// //                             const t = w.globals.seriesTotals;
// //                             const total = t.reduce((a, b) => a + b, 0);
// //                             const good = t[0] + t[1] + t[2];
// //                             return Math.round((good / total) * 100) + "%";
// //                         }
// //                     }
// //                 }
// //             }
// //         }
// //     },

// //     states: {
// //         hover: {
// //             filter: {
// //                 type: "none"
// //             }
// //         }
// //     },

// //     tooltip: {
// //         y: {
// //             formatter: val => val + "%"
// //         }
// //     }
// // };


//         if (that._postingTATDonutChart) {
//             that._postingTATDonutChart.destroy();
//         }

//         that._postingTATDonutChart = new ApexCharts(el, options);
//         that._postingTATDonutChart.render();

//     }, 300);
// }
onPostingTATMonthChange: function (oEvent) {
    var sMonth = oEvent.getSource().getSelectedKey(); // 1–12
    console.log("Selected Posting TAT Month:", sMonth);

    this._updatePostingTATDonutChart(parseInt(sMonth, 10));
},
fnPostingTATDonutChart: function () {
    var that = this;

    setTimeout(function () {

        const el = document.getElementById("postingTATDonutChart");
        if (!el) {
            console.warn("Posting TAT donut container not ready");
            return;
        }

        var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/"
        );

        oModel.read("/PostTurnSet", {
            success: function (oData) {

                // Store ALL 12 months data
                that._postingTATFull = {};

                oData.results.forEach(function (rec) {
                    var m = parseInt(rec.Mnth, 10); // 1–12

                    that._postingTATFull[m] = {
                        within1: Number(rec.Within1d || 0),
                        within2: Number(rec.Within2d || 0),
                        within3: Number(rec.Within3d || 0),
                        late:    Number(rec.More3d    || 0)
                    };
                });

                // Default = January
                that._updatePostingTATDonutChart(1);
            },

            error: function (err) {
                console.error("Posting TAT OData Error", err);
            }
        });

    }, 300);
},
_updatePostingTATDonutChart: function (monthIndex) {

    var el = document.getElementById("postingTATDonutChart");
    if (!el || !this._postingTATFull) return;

    var data = this._postingTATFull[monthIndex] || {
        within1: 0,
        within2: 0,
        within3: 0,
        late: 0
    };

    const series = [
        data.within1,
        data.within2,
        data.within3,
        data.late
    ];

    const options = {
        chart: {
            type: "donut",
            height: 185,
            fontFamily: "Geist, sans-serif"
        },

        series: series,

        labels: [
            "Within 1 workday",
            "Within 2 workdays",
            "Within 3 workdays",
            "Late Posting > 3 workdays"
        ],

        colors: [
            "#8979FF", //purple
            "#FF928A", //pink
            "#3CC3DF", //blue
            "#FFAE4C" //yellow
        ],

        stroke: {
            width: 4,
            colors: ["#ffffff"]
        },

        legend: {
            position: "right",
            fontSize: "10px"
        },

        dataLabels: { enabled: false },

        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " invoices";
                }
            }
        },

        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        }
    };

    if (this._postingTATDonutChart) {
        this._postingTATDonutChart.updateOptions(options, true, true);
    } else {
        this._postingTATDonutChart = new ApexCharts(el, options);
        this._postingTATDonutChart.render();
    }
},
onScanAgeHalfChange: function (oEvent) {
    var key = oEvent.getSource().getSelectedKey();
    this._renderScanAgeHalf(key);
},
fn_WorkQueueScanAgeingChart: function () {
    var that = this;

    setTimeout(function () {

        var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/"
        );

        oModel.read("/WorkScanageSet", {
            success: function (oData) {

                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

                var categories = [],
                    within2 = [],
                    days46 = [],
                    daysgt6 = [];

                // Default 12 months
                for (var i = 0; i < 12; i++) {
                    categories[i] = monthNames[i] + " 2025";
                    within2[i] = 0;
                    days46[i] = 0;
                    daysgt6[i] = 0;
                }

                oData.results.forEach(function (row) {
                    var m = row.Mnth - 1;
                    within2[m] = +row.Within2;
                    days46[m] = +row.Days46;
                    daysgt6[m] = +row.DaysGt6;
                });

                // Store full dataset
                that._scanAgeFull = {
                    categories: categories,
                    within2: within2,
                    days46: days46,
                    daysgt6: daysgt6
                };

                // Default render → First 6 months
                that._renderScanAgeHalf("H1");
            }
        });

    }, 300);
},

_renderScanAgeHalf: function (halfKey) {

    var data = this._scanAgeFull;
    const el = document.getElementById("scanAgeingApexChart");
    if (!data || !el) return;

    var start = (halfKey === "H1") ? 0 : 6;

    var cats   = data.categories.slice(start, start + 6);
    var w2     = data.within2.slice(start, start + 6);
    var d46    = data.days46.slice(start, start + 6);
    var dgt6   = data.daysgt6.slice(start, start + 6);
// Find max value across all series in the selected half
var maxVal = Math.max(
    ...w2,
    ...d46,
    ...dgt6
);

// Add headroom (20%) and round to a clean number
var yMax = Math.ceil(maxVal * 1.2 / 10) * 10;

    const options = {
        chart: {
            type: "area",
            height: 160,
            toolbar: { show: false },
            fontFamily: "Geist, sans-serif"
        },

        series: [
            { name: "Within 2 workdays", data: w2 },
            { name: "4 – 6 workdays", data: d46 },
            { name: "> 6 workdays", data: dgt6 }
        ],

        stroke: { curve: "smooth", width: 0.75 },

        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.6,
                opacityFrom: 0.55,
                opacityTo: 0.05,
                stops: [0, 25, 100]
            }
        },

        markers: {
            size: 4,
            strokeWidth: 2,
            fillColors: ["#ffffff"],
            hover: { size: 5 }
        },

        dataLabels: { enabled: false },

        xaxis: {
            categories: cats,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { fontSize: "10px", colors: "#333" } }
        },

        // yaxis: {
        //     min: 0,
        //     max: 1000,
        //     tickAmount: 4,
        //     labels: { style: { fontSize: "10px", colors: "#333" } }
        // },
yaxis: {
    min: 0,
    max: yMax,
    tickAmount: 4,
    forceNiceScale: true,
    labels: {
        formatter: function (val) {
            return Math.round(val);
        },
        style: {
            fontSize: "10px",
            colors: "#333"
        }
    }
},
        legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "10px",
            markers: { width: 10, height: 10, radius: 12 }
        },

        grid: {
            borderColor: "#e6e6e6",
            strokeDashArray: 4
        },

        colors: ["#8979FF", "#FF928A", "#3CC3DF"],
        tooltip: { shared: true, intersect: false }
    };

    if (this._scanAgeingChart) {
        this._scanAgeingChart.updateOptions(options, true, true);
    } else {
        this._scanAgeingChart = new ApexCharts(el, options);
        this._scanAgeingChart.render();
    }
},
onMore2DaysHalfChange: function (oEvent) {
    var key = oEvent.getSource().getSelectedKey();
    this._renderWorkQueueMore2DaysHalf(key);
},
_renderWorkQueueMore2DaysHalf: function (halfKey) {

    var data = this._more2DaysFull;
    const el = document.getElementById("workQueueMore2DaysChart");
    if (!data || !el) return;

    var start = (halfKey === "H1") ? 0 : 6;

    var cats = data.categories.slice(start, start + 6);
    var inc  = data.increased.slice(start, start + 6);
    var park = data.parked.slice(start, start + 6);
    var post = data.posted.slice(start, start + 6);
// Find max across all series
var maxVal = Math.max(
    ...inc,
    ...park,
    ...post
);

// Get rounded upper bound
var yMax = this._getNiceMax(maxVal);

    const options = {
        chart: {
            type: "area",
            height: 190,
            toolbar: { show: false },
            fontFamily: "Geist, sans-serif"
        },

        series: [
            { name: "To be indexed", data: inc },
            { name: "To be Parked", data: park },
            { name: "To be Posted", data: post }
        ],

        stroke: { curve: "smooth", width: 0.75 },

        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.6,
                opacityFrom: 0.55,
                opacityTo: 0.05,
                stops: [0, 25, 100]
            }
        },

        markers: {
            size: 4,
            strokeWidth: 2,
            fillColors: ["#ffffff"],
            hover: { size: 6 }
        },

        dataLabels: { enabled: false },

        xaxis: {
            categories: cats,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { fontSize: "10px", colors: "#333" } }
        },

        // yaxis: {
        //     min: 0,
        //     max: 100,
        //     tickAmount: 4,
        //     labels: { style: { fontSize: "10px", colors: "#333" } }
        // },
        yaxis: {
    min: 0,
    max: yMax,
    tickAmount: 4,
    labels: {
        formatter: function (val) {
            if (val >= 1000) {
                return (val / 1000) + "K";
            }
            return val;
        },
        style: { fontSize: "10px", colors: "#333" }
    }
},


        legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "10px",
            markers: { width: 10, height: 10, radius: 12 }
        },

        grid: {
            borderColor: "#e6e6e6",
            strokeDashArray: 4
        },

        colors: ["#8979FF", "#FF928A", "#3CC3DF"],
        tooltip: { shared: true, intersect: false }
    };

    if (this._more2DaysChart) {
        this._more2DaysChart.updateOptions(options, true, true);
    } else {
        this._more2DaysChart = new ApexCharts(el, options);
        this._more2DaysChart.render();
    }
},
_getNiceMax: function (value) {
    if (value <= 10)   { return 10; }
    if (value <= 50)   { return 50; }
    if (value <= 100)  { return 100; }
    if (value <= 250)  { return 250; }
    if (value <= 500)  { return 500; }
    if (value <= 1000) { return 1000; }

    return Math.ceil(value / 1000) * 1000;
},

fn_WorkQueueMore2DaysChart: function () {
    var that = this;

    // setTimeout(function () {

        var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/EXL/FSC_DASHBOARD_SRV/"
        );

        oModel.read("/WorkQueuetwoSet", {
            success: function (oData) {

                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

                var categories = [],
                    increased = [],
                    parked = [],
                    posted = [];

                // Ensure 12 months default
                for (var i = 0; i < 12; i++) {
                    categories[i] = monthNames[i] + " 2025";
                    increased[i] = 0;
                    parked[i] = 0;
                    posted[i] = 0;
                }

                oData.results.forEach(function (row) {
                    var m = row.Mnth - 1;
                    increased[m] = +row.Indx;
                    parked[m] = +row.Park;
                    posted[m] = +row.Post;
                });

                // Store full year
                that._more2DaysFull = {
                    categories: categories,
                    increased: increased,
                    parked: parked,
                    posted: posted
                };

                // Default = First 6 months
                that._renderWorkQueueMore2DaysHalf("H1");
            }
        });

    // }, 300);
},





	});

});