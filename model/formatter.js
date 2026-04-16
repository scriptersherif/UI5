jQuery.sap.declare("FSC360NEW.model.formatter");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
FSC360NEW.model.formatter = {
	fnName: function(name) {
		if (name != null) {
			var vName = name.toLowerCase();
			var vRetName = vName.charAt(0).toUpperCase() + vName.slice(1);
			return vRetName;
		} else {
			return name;
		}
	},
		fnColumnVisibleCombined: function (bMetaVisible, bHeaderFlag) {
  return bMetaVisible && bHeaderFlag;
},
fnAmountBoxClass: function (sState) {
    var sBase = "cl_saleAmountBox1w inpvali";

    if (sState === "Success") {
        return sBase + " successBorder";
    }
    if (sState === "Error") {
        return sBase + " errorBorder";
    }
    return sBase;
}
,
formatCompany: function (bukrs, butxt) {
    if (bukrs && butxt) {
        return bukrs + " - " + butxt;
    }
    return bukrs || butxt || "";
}
,
// In formatter
formatInvoiceDateColor: function(value, row) {
    if (value === "Y") return "Good";   // green
    if (value === "N") return "Error";  // red
    return "Neutral";
}

,
	TransId: function(value) {
		var num = parseInt(value);
		return num;
	},
fn_durationReadable: function (sValue) {
    if (!sValue) {
        return "";
    }

    // Case 1: format hh:mm
    if (sValue.includes(":")) {
        var parts = sValue.split(":"); 

        var hours = parseInt(parts[0], 10);
        var mins  = parseInt(parts[1], 10);

        var result = "";
        if (hours > 0) {
            result += hours + "h ";
        }
        if (mins > 0) {
            result += mins + "m";
        }
        return result.trim();
    }


    var totalSecs = parseInt(sValue, 10);
    if (isNaN(totalSecs)) {
        return sValue; // fallback
    }

    var hours = Math.floor(totalSecs / 3600);
    var mins  = Math.floor((totalSecs % 3600) / 60);
    var secs  = totalSecs % 60;

    var result = "";
    if (hours > 0) {
        result += hours + "h ";
    }
    if (mins > 0) {
        result += mins + "m ";
    }
    if (secs > 0 || result === "") {
        result += secs + "s";
    }

    return result.trim();
},



fn_time_calculation: function(vTime) {
		if (vTime == "" || vTime == null || vTime == " ") {
			return "00:00:00";
		} else {
		var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
		var vtime_new = new Date(vTime.ms + TZOffsetMs);
		var actual_hours = vtime_new.getHours();
		var actual_min = vtime_new.getMinutes();
		var actual_sec = vtime_new.getSeconds();
		return actual_hours + ':' + actual_min + ':' + actual_sec;}
	},
fnFormatQidDate: function(qidDateStr) {
    if (!qidDateStr) return null;

    var date = new Date(qidDateStr);
    if (isNaN(date)) return null;

    // Return in YYYY-MM-DD format
    var yyyy = date.getFullYear();
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var dd = String(date.getDate()).padStart(2, '0');

    return yyyy + "-" + mm + "-" + dd;

}
,
fnLeadingZero1: function(value) {
    if (value === null || value === undefined) {
        return ""; // or handle differently
    }

    return String(value).replace(/^\d$/, "0$&");
}
,
// formatter.js
fnTableWidth: function(forceFullWidth, sidebarCollapsed) {
  if (forceFullWidth) {
    return "100%";
  }
  return sidebarCollapsed ? "100.3%" : "100.3%";
}
,
		formatAmountUnit: function(value) {
  if (!value) return "0";

  value = parseFloat(value);

  if (value >= 10000000) {
    return (value / 10000000).toFixed(2) + " Cr";  // Crores
  } else if (value >= 100000) {
    return (value / 100000).toFixed(2) + " L";     // Lakhs
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + " K";       // Thousands
  } else {
    return value.toFixed(2);
  }
}
,
	formatPONumber: function(sPONumber) {
    return "<span style='color: #25009D; font-weight: 500; font-size: 10.4px; margin-top: -3px;'>PO-" + sPONumber + "</span>";
}
,
	formatGLNumber: function(sPONumber) {
    return "<span style='color: #25009D; font-weight: 500; font-size: 10.4px; padding-top: 7px;'>" + sPONumber + "</span>";
},
	fnIndexDays: function(value) {
		if (value) {
			var oDtFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});
			return oDtFormat.format(value);
		} else {
			return "";
		}
	},
	fnVisibleVendor: function(value1, value2) {
		if (value1 == "" && value2 == "") {
			return false;
		} else {
			return true;
		}
	},
fnGetStatusText: function (sStatus) {

    switch (sStatus) {
		case "S05": return "Attached";
    	 case "S10": return "Attached SES";

        case "S15": return "Indexed";

        case "S20": return "In Progress";

        case "S30": return " In Workflow";

        case "S40": return "Parked";

        case "S41": return "Posted";

        case "S50": return "Rejected";

        default: return sStatus || "Unknown";

    }

},
	fnPostDays: function(value1, value2, value3) {
		if (value2 != null && value1 != null) {
			var timeDiff = Math.abs(value2.getTime() - value1.getTime());
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
			if (diffDays === 1 || diffDays === 0) {
				return diffDays + " " + "Day" + "(s)";
			} else if (diffDays > 1) {
				return diffDays + " " + "Day" + "(s)";
			}
		} else {
			var vReturn = '';
			return vReturn;
		}
	},
	fnStatColor: function(value) {
		if (value === "S10") {
			return "sap-icon://attachment";
		} else if (value === "S01") {
			return "sap-icon://attachment";
		} else if (value === "S05") {
			return "sap-icon://feeder-arrow";
		} else if (value === "S15") {
			return "sap-icon://feeder-arrow";
		} else if (value === "S20") {
			return "sap-icon://step";
		} else if (value === "S30") {
			return "sap-icon://workflow-tasks";
		} else if (value === "S40") {
			return "sap-icon://activate";
		} else if (value === "S41") {
			return "sap-icon://message-success";
		} else if (value === "S50") {
			return "sap-icon://decline";
		}
	},
	fnStatColor1: function(value) {
		if (value == "S10") {
			return "#3366ff";
		} else if (value == "S05") {
			return '#bbbb38a8';
		} else if (value == "S15") {
			return "#ffff00";
		} else if (value == "S20") {
			return "#ff8c00";
		} else if (value == "S30") {
			return "#B22222";
		} else if (value == "S40") {
			return "#21610B";
		} else if (value == "S41") {
			return "#4bb543";
		} else if (value == "S50") {
			return "#ff0000";
		}
	},
	fnVisible: function(value) {
		if (value !== '') {
			return true;
		} else {
			return false;
		}
	},
		date: function(value) {
		if (value) {
			var oDtFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});
			return oDtFormat.format(value);
		} else {
			return "";
		}
	},
	fnIndexDay: function(value) {
		if (value) {
			var oDtFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});
			return oDtFormat.format(value);
		} else {
			return "";
		}
	},
fnTextOrDash: function(value) {
    return value ? value : "-";
},

 formatQidColor: function(sMatch) {
   
    // return sMatch === "X" ? "green" : "orange";
     if (sMatch === "X") {
        return "red";
    } else {
        return ""; // string, but empty
    }
},
	fnDate: function(value) {

		// if (value) {

		// 	var today = value;
		// 	var dd = today.getDate();
		// 	var MM = today.getMonth() + 1;
		// 	var yyyy = today.getFullYear();
		// 	var hours = today.getHours();
		// 	var min = today.getMinutes();
		// 	var sec = today.getSeconds();
		// 	var ampm = hours >= 12 ? 'PM' : 'AM';
		// 	hours = hours % 12;
		// 	hours = hours ? hours : 12; // the hour '0' should be '12'

		// 	var today_upd = dd + '/' + MM + '/' + yyyy;

		// 	return today_upd;
		// } else {
		// 	return value;
		// }

		if (value) {
			var oDtFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});
			return oDtFormat.format(value);
		} else {
			return "";
		}

	},
	fnDate1: function(value) {
		if (value) {
			var oDtFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd.MM.YYYY"
			});
			return oDtFormat.format(value);
		} else {
			return "";
		}
	},
	// fnTime: function(value) {

	// 	if (value) {

	// 		var today = value;
	// 		var hours = today.getHours();
	// 		var min = today.getMinutes();
	// 		var sec = today.getSeconds();
	// 		var ampm = hours >= 12 ? 'PM' : 'AM';
	// 		hours = hours % 12;
	// 		hours = hours ? hours : 12; // the hour '0' should be '12'
	// 		var today_upd = hours + ":" + min + ":" + sec + " " + ampm;

	// 		return today_upd;
	// 	} else {
	// 		return value;
	// 	}

	// },
// 	fnTime: function(value) {
//     // If no value (null, undefined, 0, ""), return empty text
//     if (!value) {
//         return "";
//     }

//     // Convert to string
//     value = String(value).trim();

//     // If still empty after trim → return ""
//     if (value === "" || value === "0") {
//         return "";
//     }

//     // Ensure 6 chars (HHMMSS)
//     while (value.length < 6) {
//         value = "0" + value;
//     }

//     var hours = parseInt(value.substring(0, 2), 10);
//     var min   = value.substring(2, 4);
//     var sec   = value.substring(4, 6);

//     if (isNaN(hours)) {
//         return ""; // safeguard against corrupted data
//     }

//     var ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12;  // convert 0 → 12

//     return hours + ":" + min + ":" + sec + " " + ampm;
// },
fnTime: function(value) {
    // If no value provided, return empty string
    if (!value) {
        return "";
    }

    // If the value is a string, try to parse it to a Date
    var oDate = value instanceof Date ? value : new Date(value);

    // Validate date
    if (isNaN(oDate.getTime())) {
        return ""; // Invalid date
    }

    // Extract hours, minutes, seconds
    var hours = oDate.getHours();
    var minutes = oDate.getMinutes();
    var seconds = oDate.getSeconds();

    // Convert to 12-hour format with AM/PM
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // 0 → 12

    // Pad minutes and seconds to two digits
    var minStr = minutes.toString().padStart(2, "0");
    var secStr = seconds.toString().padStart(2, "0");

    return hours + ":" + minStr + ":" + secStr + " " + ampm;
}
,
	fnGetButtonStyle: function(status) {
		switch (status) {
			case "Completed":
				return "color: white; background-color: #107E3E; border:none;"; // green
			case "Escalated":
			case "On Hold":
				return "color: white; background-color: #BB0000; border:none;"; // red
			case "Assigned":
				return "color: white; background-color: #0A6ED1; border:none;"; // blue
			case "Unassigned":
				return "color: white; background-color: #E9730C; border:none;"; // orange
			default:
				return "color: black; background-color: #f0f0f0; border:none;"; // default gray
		}
	}
,
statusButtonType: function (sStatus) {
    switch (sStatus) {
        case "Completed": return "Accept";       // Green
        case "Escalated": return "Reject";       // Red
        case "On Hold": return "Reject";         // Red
        case "Assigned": return "Default";    
        case "Unassigned": return "Default";     // Orange (via class)
        default: return "Default";
    }
},

statusButtonClass: function (sStatus) {
            if (!sStatus) {
                return "cl_status_default";
            }
            switch (sStatus.toLowerCase()) {
                case "approved":
                    return "cl_status_approved";
                case "rejected":
                    return "cl_status_rejected";
                case "pending":
                    return "cl_status_pending"; // Orange color for Pending
                case "in progress":
                    return "cl_status_inprogress";
                default:
                    return "cl_status_default";
            }
        },
	fnAmount: function(value) {
		if (value == "" || value == null || value == " ") {
			return "0.00";
		} else {
			var fixedFloat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});

			var newVal = parseFloat(value).toFixed(2);
			return fixedFloat.format(newVal);
		}
	},
statusColor: function (sValue) {
    if (sValue === "S") {
        return "Success"; // green
    } else if (sValue === "H") {
        return "Error"; // red
    } else {
        return "None"; // default
    }
}

,
	Age: function(value) {
		//var idText = this.byId("id_age"); 
		if (value === 'Z') {
			return "images/Agered.png";
		}
		if (value === 'A') {
			return "images/Age_red.svg";
		}
		if (value === 'Y') {
			return "images/AgeGreen.png";
		}
	},
		getTimelineIcon: function (sTdformat) {
    if (!sTdformat) {
        return "images/Default.svg"; // fallback
    }

    var map = {
        "C": "commented.svg",
        "PA": "Parked.svg",
        "PO": "Posted.svg",
        "W": "trigger.svg",
        "I": "indexed.svg",
        "G": "Gate.svg",
        "P": "inProgress.svg",
        "IP": "inProgress.svg",
        "A": "attached.svg",
        "R": "rejected.svg"
    };

    return "Images/" + (map[sTdformat] || "Default.svg");
},
// FSC360NEW/model/formatter.js

getTimelineTitle: function(tdline) {
	if (!tdline){ return "";}
	var parts = tdline.split(" by ");
	return parts[0] || tdline; // e.g., "Attached SES"
},

getTimelineAuthorDate: function(tdline) {
	if (!tdline) return "";

	var parts = tdline.split(" by ");
	if (parts.length < 2) return "";

	var byAndDate = parts[1].split(" on ");
	if (byAndDate.length < 2) return "";

	// Split the user & comment text
	var userText = byAndDate[0] ? byAndDate[0].trim() : "";
	var datetime = byAndDate[1] ? byAndDate[1].trim() : "";

	var userParts = userText.split(" ");
	var user = userParts[0]; // e.g., DEV2
	var comment = userParts.slice(1).join(" "); // e.g., "and Commented as INV CAPTURED"

	if (!user || !datetime) {
		return "By <span style='color:#25009D'>" + user + "</span>";
	}

	var dateTimeParts = datetime.split(" at ");
	if (dateTimeParts.length < 2) {
		return "By <span style='color:#25009D'>" + user + "</span>";
	}

	var datePart = dateTimeParts[0];
	var timePart = dateTimeParts[1];

	var convertedDateTime = datePart.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$2/$1/$3') + " " + timePart;
	var dateObj = new Date(convertedDateTime);
	if (isNaN(dateObj)) {
		return "By <span style='color:#25009D'>" + user + "</span>";
	}

	var dateStr = dateObj.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit"
	});

	// Final formatted text
	return "By <span style='color:#25009D'>" + user + "</span> " + comment + " on " + dateStr;
},
		fnProcessState: function(state) {
		if (state == "S") {
			return "Positive";
		} else if (state == "H") {
			return "Negative";
		} else {
			return "Positive";
		}
	},
		fnZero: function(value) {
		var val = parseInt(value);
		return val;
	},

	fnRemoveLeadingZero: function(value) {
		if (value) {
			return value.replace(/^0+/, '');

		} else {
			return '';
		}

	},

	// fnLeadingZero: function(value) {
	// 	if (value) {
	// 		value = +value;
	// 		if (value == 0) {
	// 			return '';
	// 		} else {
	// 			return value.toString();
	// 		}
	// 	} else {
	// 		return '';
	// 	}
	// },
	fnLeadingZero: function(value) {
	if (!value) {
		return '';
	}

	var trimmed = value.replace(/^0+/, '');


	return trimmed === '' ? '0' : trimmed;
},

	fn_Hour: function(value) {

		/*	if (value === 0 || value === null) {
				return value;
			} */
		Number(value);
		if (value >= 0) {
			var Days = Math.floor(value / 24);
			var Remainder = value % 24;
			var Hours = Math.floor(Remainder);
			var Minutes = Math.floor(60 * (Remainder - Hours));

			if (Days === 0 && Hours === 0 && Minutes === 0) {
				var format = 0;
			} else if (Hours === 0 && Days === 0) {
				format = Minutes + " Minutes";
			} else if (Days === 0) {
				format = Hours + " Hours";
			} else if (Days !== 0 && Hours !== 0 && Minutes !== 0) {
				format = Days + " Days";
			}

			return format;
		} else {
			return value;
		}

	},
	fnZero: function(value) {
		var val = parseInt(value);
		return val;
	},
	fnCurrencySymbol: function (sCode) {
    var map = {
        USD: "$",
        EUR: "€",
        INR: "₹",
        GBP: "£",
        JPY: "¥",
        // add more if needed
          // Common currencies
       
        CNY: "¥",
        RUB: "₽",
        KRW: "₩",
        VND: "₫",
        THB: "฿",
        AUD: "A$",
        CAD: "C$",
        NZD: "NZ$",
        SGD: "S$",
        HKD: "HK$",
        CHF: "Fr",
        ZAR: "R",

        // Specific to your list
        AED: "د.إ",
        AFN: "؋",
        ALL: "L",
        AMD: "֏",
        ANG: "ƒ",
        AOA: "Kz",
        ARS: "$",
        AWG: "ƒ",
        AZN: "₼",
        BAM: "KM",
        BBD: "$",
        BDT: "৳",
        BGN: "лв",
        BHD: ".د.ب",
        BIF: "FBu",
        BMD: "$",
        BND: "$",
        BOB: "Bs.",
        BRL: "R$",

        // Old/Obsolete Currencies
        ADP: "₧",    // Spanish peseta symbol
        AFA: "؋",
        AON: "Kz",
        AOR: "Kz",
        AZM: "₼",
        ATS: "ÖS",
        BEF: "FB"  ,   // Belgian Franc
        // Newly added codes
        BSD: "$",       // Bahamian Dollar
        BTN: "Nu.",     // Bhutan Ngultrum
        BWP: "P",       // Botswana Pula
        BYB: "Br",      // Belarusian Ruble (Old)
        BYN: "Br",      // Belarusian Ruble (New)
        BYR: "Br",      // Belarusian Ruble (Previous ISO)
        BZD: "$",       // Belize Dollar
        CAD: "C$",      // Already added
        CDF: "FC",      // Congolese Franc
        CLP: "$",       // Chilean Peso
        CNY: "¥",       // Already added
        COP: "$",       // Colombian Peso
        CRC: "₡"  ,      // Costa Rican Colon
         XPF: "₣",
    CHF: "Fr",
    CLP: "$",
    CNY: "¥",
    COP: "$",
    CRC: "₡",
    CSD: "дин.",
    CUC: "$",
    CUP: "$",
    CVE: "$",
    CYP: "£",
    CZK: "Kč",
    DEM: "DM",
      XPF: "₣",      // French Pacific Franc
  CHF: "Fr",     // Swiss Franc
  CLP: "$",      // Chilean Peso
  CNY: "¥",      // Chinese Renminbi
  COP: "$",      // Colombian Peso
  CRC: "₡",      // Costa Rican Colon
  CSD: "дин.",   // Serbian Dinar (Old)
  CUC: "$",      // Peso Convertible (Cuba)
  CUP: "$",      // Cuban Peso
  CVE: "$",      // Cape Verde Escudo (no unique symbol, $ used)
  CYP: "£",      // Cyprus Pound
  CZK: "Kč",     // Czech Koruna
  DEM: "DM",      // German Mark (Old)
    CYP: "£",     // Cyprus Pound (Old → EUR)
  CZK: "Kč",    // Czech Koruna
  DEM: "DM",    // German Mark (Old → EUR), use once even if duplicated
  DJF: "Fdj",   // Djibouti Franc
  DKK: "kr",    // Danish Krone
  DOP: "RD$",   // Dominican Peso
  DZD: "د.ج",   // Algerian Dinar
  ECS: "S/.",   // Ecuadorian Sucre (obsolete; symbol based on convention)
  EEK: "kr",    // Estonian Kroon (Old → EUR)
  EGP: "£",     // Egyptian Pound
  ERN: "Nfk",   // Eritrean Nakfa
  ESP: "₧",      // Spanish Peseta (obsolete)
    ESP: "₧",     // Spanish Peseta (Old → EUR)
  ETB: "Br",    // Ethiopian Birr
  EUR: "€",     // European Euro
  EU4: "€",     // Alternate code for Euro (same symbol)
  FIM: "mk",    // Finnish Markka (Old → EUR)
  FJD: "$",     // Fiji Dollar
  FKP: "£",     // Falkland Islands Pound
  FRF: "₣",     // French Franc (Old → EUR)
  GBP: "£",     // British Pound
  GEL: "₾",     // Georgian Lari
  GHC: "₵",     // Ghanaian Cedi (Old)
  GHS: "₵",     // Ghanaian Cedi (New)
  GIP: "£",     // Gibraltar Pound
  GMD: "D",      // Gambian Dalasi
    GNF: "FG",     // Guinean Franc
  GRD: "₯",      // Greek Drachma (Old → EUR)
  GTQ: "Q",      // Guatemalan Quetzal
  GWP: "P",      // Guinea Peso (Old → SHP); fallback symbol used
  GYD: "$",      // Guyana Dollar
  HKD: "HK$",    // Hong Kong Dollar
  HNL: "L",      // Honduran Lempira
  HRK: "kn",     // Croatian Kuna
  HTG: "G",      // Haitian Gourde
  HUF: "Ft",     // Hungarian Forint
  IDR: "Rp",     // Indonesian Rupiah
  IEP: "£",      // Irish Punt (Old → EUR)
  ILS: "₪" ,      // Israeli Shekel (New Shekel)
   IQD: "ع.د",     // Iraqi Dinar
  IRR: "﷼",       // Iranian Rial
  ISK: "kr",       // Iceland Krona
  ITL: "₤",       // Italian Lira (Old → EUR)
  JMD: "J$",       // Jamaican Dollar
  JOD: "د.ا",     // Jordanian Dinar
  JPY: "¥",        // Japanese Yen
  KES: "KSh",      // Kenyan Shilling
  KGS: "сом",      // Kyrgyzstan Som
  KHR: "៛",        // Cambodian Riel
  KMF: "CF",       // Comoros Franc
  KPW: "₩",        // North Korean Won
  KRW: "₩",        // South Korean Won
  KWD: "د.ك"      // Kuwaiti Dinar
    };
    return map[sCode] || sCode; // fallback to code if symbol not found
},
getPaymentLeftBoxWidth: function(bSidebarCollapsed, bPdfCollapsed) {
	if (bSidebarCollapsed && bPdfCollapsed) {
		return "53%";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "59%";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "75%";
	} else {
		return "82%";
	}
},
getPaymentBoxWidth: function(bSidebarCollapsed, bPdfCollapsed) {
	if (bSidebarCollapsed && bPdfCollapsed) {
		return "47%";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "41%";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "23%";
	} else {
		return "18%";
	}
},
getInputWidth: function(bSidebarCollapsed, bPdfCollapsed) {
	if (bSidebarCollapsed && bPdfCollapsed) {
		return "175%";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "175%";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "100%";
	} else {
		return "100%";
	}
},
getTagInputWidth: function(bSidebarCollapsed, bPdfCollapsed) {
		if (bSidebarCollapsed && bPdfCollapsed) {
		return "100%";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "100%";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "100%";
	} else {
		return "100%";
	}
},

getZprzInputWidth: function(bSidebarCollapsed, bPdfCollapsed) {
	if (bSidebarCollapsed && bPdfCollapsed) {
		return "100%";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "100%";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "100%";
	} else {
		return "100%";
	}
}
,
getDaysInputWidth: function(bSidebarCollapsed, bPdfCollapsed) {
		if (bSidebarCollapsed && bPdfCollapsed) {
		return "200px";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "200px";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "100px";
	} else {
		return "100%";
	}
},

getNetDaysInputWidth: function(bSidebarCollapsed, bPdfCollapsed) {
	if (bSidebarCollapsed && bPdfCollapsed) {
		return "60px";
	} else if (!bSidebarCollapsed && bPdfCollapsed) {
		return "124px";
	} else if (bSidebarCollapsed && !bPdfCollapsed) {
		return "105px";
	} else {
		return "100%";
	}
},
	fnNumber: function(sValue) {
			if (sValue) {
				var oFormatOptions = {
					style: "short",
					decimals: 1,
					shortDecimals: 2
				};

				// "NumberFormat" required from module "sap/ui/core/format/NumberFormat"
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions);
				return oFloatFormat.format(Math.abs(sValue));
			} else {
				sValue = "";
				return sValue;
			}
		},
			Date: function (sDate) {
  if (!sDate){ return "";}
 
  var oDate = new Date(sDate);
  var day = String(oDate.getDate()).padStart(2, '0');
  var month = String(oDate.getMonth() + 1).padStart(2, '0');
  var year = oDate.getFullYear();
 
  return day + "." + month + "." + year; // Format: DD.MM.YYYY
},
// FSC360NEW/model/formatter.js
getTimelineAuthorDate2: function(sFrom, sTime, sComment) {
    return "By <b>" + sFrom + "</b> On " + sTime + "<br/>" + sComment;
}
,
getTimelineAuthorDate2: function(sFrom, sTime, sComment) {
    return sComment + ' By <span style="color: #25009D; font-weight: bold;">' + sFrom + '</span> ' + sTime;
},
formatAmountInLakhs: function(value) {
    if (!value || isNaN(value)) {return "0 L";}

    var amount = parseFloat(value);
    var lakhs = amount / 100000;

    return lakhs.toFixed(2) + " L";
},
// formatInvoiceDateColor: function(sMatch) {
//     console.log("InvdtMatch value:", sMatch); // debug
//     return sMatch === "X" ? "green" : "orange";
// },
formatInvoiceDateColor: function(sMatch) {
   
    // return sMatch === "X" ? "green" : "orange";
     if (sMatch === "X") {
        return "green";
    } else if (sMatch === ""){
        return "orange";
    } else {
        return ""; // string, but empty
    }
},
formatAccMatchColor: function (sMatch) {
    console.log("AccMatch value:", sMatch); // debug
    if (sMatch === "X") {
        return "green";
    } else if (sMatch === "C") {
        return "blue";
    } else {
        return "orange";
    }
},
Time: function(time) {
    if (time) {
      var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
        pattern: "HH:mm:ss"
      });
      var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
      var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
      return timeStr;
    }
    return null;
  },
  editableFormatter: function(value) {
    if (value === null) {
      return true;
    } else {
      return false;
    }
  },
  fnStoreSelected: function(vGrnUser) {
    if (vGrnUser === "X") {
      return true;
    } else {
      return false;
    }
  },
  fnStoreEnabled: function(vStoreAuth, vGrnUser, vIdtUser, vFiUser) {
    if (vStoreAuth === "Z" && vGrnUser === "") {
      return true;
    } else {
      return false;
    }
  },
  fnStoreEnabled1: function(vStoreAuth, vGrnUser, vIdtUser, vFiUser) {
    if (vStoreAuth === "Z") {
      return true;
    } else {
      return false;
    }
  },

  fnIdtSelected: function(vIdtUser) {
    if (vIdtUser === "X") {
      return true;
    } else {
      return false;
    }
  },

  fnIdtEnabled: function(vIdtAuth, vGrnUser, vIdtUser, vFiUser, vRemark , vPotyp) {

    if ((vIdtAuth === "X" || vIdtAuth === "Y")) {
      if (vIdtUser === "") {
        if(( vRemark === "NAvailable") && (vPotyp === "LOIM"))
    {
       return false;
    }
    else if ( vPotyp != "LOIM" )
        {
           return true;
        }
    else if ( ( vRemark === "Available") && (vPotyp === "LOIM") )
        {
           return true;
        }
      }
    else if (vIdtUser === "X") {
        return false;
      } else {
        return false;
      }
    }

    else if ( vPotyp === 'LOIM') //Added by Sathya on 30.07.2021
    {
      if(( vRemark === "NAvailable") && (vPotyp === "LOIM"))
    {
       return false;
    }
    else if ( ( vRemark === "Available") && (vPotyp === "LOIM") )
        {
           return true;
        }
    }

    else {
      return false;
    }
  },

  fnIdtEnabled1: function(vIdtAuth, vGrnUser, vIdtUser, vFiUser) {
    if (vIdtAuth === "X" || vIdtAuth === "Y") {
      return true;
    } else {
      return false;
    }
  },

  fnFiSelected: function(vFiUser) {
    if (vFiUser === "X") {
      return true;
    } else {
      return false;
    }
  },

  fnFiEnabled: function(vFiAuth, vGrnUser, vIdtUser, vFiUser) {
    if (vFiAuth === "W") {
      if (vFiUser === "") {
        return true;
      } else if (vFiUser === "X") {
        return false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
	fnEditable: function(Indi) {
		if (Indi == 'S') {
			return false;
		} else {
			return true;
		}
	},
  fnFiEnabled1: function(vFiAuth, vGrnUser, vIdtUser, vFiUser) {
    if (vFiAuth === "W") {
      return true;
    } else {
      return false;
    }
  },
    fnCapitalizeFirst: function(sValue) {
            if (!sValue) return "";
            sValue = sValue.toLowerCase(); // make everything lowercase first
            return sValue.charAt(0).toUpperCase() + sValue.slice(1);
        },
        	CD: function(value) {

		if (value === 'H') {

			var dep = "Credit";
			this.removeStyleClass("cl_textfc");
			this.addStyleClass("cl_textfrd");
			return dep;
		}
		if (value === 'S') {
			//idText.addtyleClass("cl_textfc");
			var cre = "Debit";
			this.removeStyleClass("cl_textfrd");
			this.addStyleClass("cl_textfc");
			return cre;
		}
	},
fnStatus: function (value) {
    if (value === "X") {
        // MSME Update case
      
        return "MSME Update";
    } else {
        // Default (not X)
      
        return "Normal";
    }
}

		/*-------------------------------------------Ended by Lokesh-----------------------------*/


// fnInvTypeText: function (sCode) {
//   switch (sCode) {
//     case "1": return "Purchase Order";
//     case
//     case "9": return "Service Entry Sheet";
    
//     default: return "";
//   }
// }





};