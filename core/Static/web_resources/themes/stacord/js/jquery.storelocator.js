/*
* storeLocator v1.4.1 - jQuery Google Maps store locator plugin
* (c) Copyright 2012, Bjorn Holine (http://www.bjornblog.com)
* Released under the MIT license
* Distance calculation function by Chris Pietschmann: http://pietschsoft.com/post/2008/02/01/Calculate-Distance-Between-Geocodes-in-C-and-JavaScript.aspx
*/

(function ($) {
    $.fn.storeLocator = function (options) {

        var settings = $.extend({
            'mapDiv': 'map',
            'listDiv': 'loc-list',
            'formContainerDiv': 'form-container',
            'formID': 'user-location',
            'inputID': 'address',
            'zoomLevel': 12,
            'pinColor': '003399',
            'pinTextColor': 'ffffff',
            'lengthUnit': 'm',
            'storeLimit': 10,
            'distanceAlert': 60,
            'dataType': 'json',
            'dataLocation': '/DotComWCFWeb/WCFWeb.svc/GetBranchDataList',
            'listColor1': 'ffffff',
            'listColor2': 'eeeeee',
            'originMarker': true,
            'originpinColor': 'red',
            'bounceMarker': true,
            'slideMap': true,
            'modalWindow': false,
            'defaultLoc': true,
            'defaultLat': '41.0814',
            'defaultLng': '-81.5192',
            'autoGeocode': false,
            'maxDistance': false,
            'maxDistanceID': 'maxdistance',
            'fullMapStart': false,
            'noForm': false,
            'infowindowTemplatePath': '/web_resources/themes/stacord/maptemplates/infowindow-description.html',
            'listTemplatePath': '/web_resources/themes/stacord/maptemplates/location-list-description.html',
            'KMLinfowindowTemplatePath': 'templates/kml-infowindow-description.html',
            'KMLlistTemplatePath': 'templates/kml-location-list-description.html',
            'callbackBeforeSend': null,
            'callbackComplete': null,
            'callbackSuccess': null,
            'callbackModalOpen': null,
            'callbackModalClose': null
        }, options);

        return this.each(function () {

            var $this = $(this);

            //First load external templates and compile with Handlebars
            var listTemplate, infowindowTemplate;

            if (settings.dataType === 'kml') {
                //KML locations list
                $.get(settings.KMLlistTemplatePath, function (template) {
                    var source = template;
                    listTemplate = Handlebars.compile(source);
                });
                //KML infowindows
                $.get(settings.KMLinfowindowTemplatePath, function (template) {
                    var source = template;
                    infowindowTemplate = Handlebars.compile(source);
                });
            }
            else {
                //Locations list
                $.get(settings.listTemplatePath, function (template) {
                    var source = template;
                    listTemplate = Handlebars.compile(source);
                });
                //Infowindows
                $.get(settings.infowindowTemplatePath, function (template) {
                    var source = template;
                    infowindowTemplate = Handlebars.compile(source);
                });
            }

            //Add modal window divs if set
            if (settings.modalWindow === true) {
                $this.wrap('<div id="overlay"><div id="modal-window"><div id="modal-content">');
                $('#modal-window').prepend('<div id="close-icon"><\/div>');
                $('#overlay').hide();
            }

            if (settings.slideMap === true) {
                //Let's hide the map container to begin
                $this.hide();
            }

            var userinput, olat, olng, marker, letter, storenum;
            var locationset = [];

            //Calculate geocode distance functions - you could use Google's distance service instead
            var GeoCodeCalc = {};
            if (settings.lengthUnit === "km") {
                //Kilometers
                GeoCodeCalc.EarthRadius = 6367.0;
            }
            else {
                //Default is miles
                GeoCodeCalc.EarthRadius = 3956.0;
            }
            GeoCodeCalc.ToRadian = function (v) { return v * (Math.PI / 180); };
            GeoCodeCalc.DiffRadian = function (v1, v2) {
                return GeoCodeCalc.ToRadian(v2) - GeoCodeCalc.ToRadian(v1);
            };
            GeoCodeCalc.CalcDistance = function (lat1, lng1, lat2, lng2, radius) {
                return radius * 2 * Math.asin(Math.min(1, Math.sqrt((Math.pow(Math.sin((GeoCodeCalc.DiffRadian(lat1, lat2)) / 2.0), 2.0) + Math.cos(GeoCodeCalc.ToRadian(lat1)) * Math.cos(GeoCodeCalc.ToRadian(lat2)) * Math.pow(Math.sin((GeoCodeCalc.DiffRadian(lng1, lng2)) / 2.0), 2.0)))));
            };

            //Geocode function for the origin location
            function GoogleGeocode() {
                geocoder = new google.maps.Geocoder();
                this.geocode = function (address, callbackFunction) {
                    geocoder.geocode({ 'address': address }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var result = {};
                            result.latitude = results[0].geometry.location.lat();
                            result.longitude = results[0].geometry.location.lng();
                            callbackFunction(result);
                        } else {
                            alert("Geocode was not successful for the following reason: " + status);
                            callbackFunction(null);
                        }
                    });
                };
            }

            //Reverse geocode to get address for automatic options needed for directions link
            function ReverseGoogleGeocode() {
                geocoder = new google.maps.Geocoder();
                this.geocode = function (latlng, callbackFunction) {
                    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                var result = {};
                                result.address = results[0].formatted_address;
                                callbackFunction(result);
                            }
                        } else {
                            alert("Geocode was not successful for the following reason: " + status);
                            callbackFunction(null);
                        }
                    });
                };
            }

            //Used to round miles to display
            function roundNumber(num, dec) {
                var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
                return result;
            }

            function GetQueryStringParams(sParam) {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] == sParam) {
                        return sParameterName[1];
                    }
                }
            }

            //If show full map option is true
            if (settings.fullMapStart === true) {
                //Just do the mapping without an origin
                mapping();
            }

            //If a default location is set
            if (settings.defaultLoc === true) {

                //If there is an address in the query string, use that as the default.
                var loc = GetQueryStringParams('location');
                if (loc != null && loc != "") {

                    $("#address").val(decodeURIComponent(loc).replace(/\+/g, ' '));
                    var g = new GoogleGeocode();
                    var address = loc;
                    g.geocode(address, function (data) {
                        if (data !== null) {
                            olat = data.latitude;
                            olng = data.longitude;
                            mapping(olat, olng, address);
                        } else {
                            //Unable to geocode
                            alert('ERROR! Unable to geocode address');
                        }
                    });
                }
                //else {
                //    //The address needs to be determined for the directions link
                //    var r = new ReverseGoogleGeocode();
                //    var latlng = new google.maps.LatLng(settings.defaultLat, settings.defaultLng);
                //    r.geocode(latlng, function (data) {
                //        if (data !== null) {
                //            var originAddress = data.address;
                //            mapping(settings.defaultLat, settings.defaultLng, originAddress);
                //        } else {
                //            //Unable to geocode
                //            alert('Unable to find address');
                //        }
                //    });
                //}
            }

            //HTML5 geolocation API option
            if (settings.autoGeocode === true) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(autoGeocode_query, autoGeocode_error);
                }
            }

            //If location is detected automatically
            function autoGeocode_query(position) {
                //The address needs to be determined for the directions link
                var r = new ReverseGoogleGeocode();
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                r.geocode(latlng, function (data) {
                    if (data !== null) {
                        var originAddress = data.address;
                        mapping(position.coords.latitude, position.coords.longitude, originAddress);
                    } else {
                        //Unable to geocode
                        alert('Unable to find address');
                    }
                });
            }

            function autoGeocode_error(error) {
                //If automatic detection doesn't work show an error
                alert("Automatic location detection failed. Please fill in your address or zip code.");
            }

            //Set up the normal mapping
            function begin_mapping(distance) {
                //Get the user input and use it
                var userinput = $('#' + settings.formContainerDiv + ' #' + settings.inputID).val();

                if (userinput === "") {
                    //Show alert and stop processing
                    alert("The input box was blank.");
                }
                else {
                    var g = new GoogleGeocode();
                    var address = userinput;
                    g.geocode(address, function (data) {
                        if (data !== null) {
                            olat = data.latitude;
                            olng = data.longitude;
                            mapping(olat, olng, userinput, distance);
                        } else {
                            //Unable to geocode
                            alert('ERROR! Unable to geocode address');
                        }
                    });
                }
            }

            //Process form input
            $(function () {
                //Handle form submission
                function get_form_values(e) {
                    //Stop the form submission
                    e.preventDefault();

                    if (settings.maxDistance === true) {
                        var maxDistance = $('#' + settings.formContainerDiv + ' #' + settings.maxDistanceID).val();
                        //Start the mapping
                        begin_mapping(maxDistance);
                    }
                    else {
                        //Start the mapping
                        begin_mapping();
                    }
                }

                //ASP.net or regular submission?
                if (settings.noForm === true) {
                    $(document).on('click', '#' + settings.formContainerDiv + ' #submit', function (e) {
                        get_form_values(e);
                    });
                    $(document).keyup(function (e) {
                        if (e.keyCode === 13) {
                            get_form_values(e);
                        }
                    });
                }
                else {
                    $(document).on('submit', '#' + settings.formID, function (e) {
                        get_form_values(e);
                    });
                }
            });

            //Now all the mapping stuff
            function mapping(orig_lat, orig_lng, origin, maxDistance) {
                $(function () {

                    var dataTypeRead;

                    //KML is read as XML
                    if (settings.dataType === 'kml') {
                        dataTypeRead = "xml";
                    }
                    else {
                        dataTypeRead = settings.dataType;
                    }

                    jQuery.support.cors = true;
                    //Process the data
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: settings.dataLocation + (settings.dataType === 'jsonp' ? (settings.dataLocation.match(/\?/) ? '&' : '?') + 'callback=?' : ''),
                        dataType: dataTypeRead,
                        beforeSend: function () {
                            // Callback
                            if (settings.callbackBeforeSend) {
                                settings.callbackBeforeSend.call(this);
                            }
                        },
                        complete: function (event, request, options) {
                            // Callback
                            if (settings.callbackComplete) {
                                settings.callbackComplete.call(this, event, request, options);
                            }
                        },
                        success: function (data, xhr, options) {
                            // Callback
                            if (settings.callbackSuccess) {
                                settings.callbackSuccess.call(this, data, xhr, options);
                            }

                            //After the store locations file has been read successfully
                            var i = 0;
                            var barray = 0;
                            $('#' + settings.mapDiv).addClass('mapOpen');

                            //Depending on your data structure and what you want to include in the maps, you may need to change the following variables or comment them out
                            if (settings.dataType === 'json' || settings.dataType === 'jsonp') {
                                var branchList;
                                if (data.BranchList != null) { //new
                                    branchList = data.BranchList;
                                } else { // old
                                    branchList = data.BranchDataCollection;
                                }
								
								//Process JSON
                                $.each(branchList, function () {
                                    var name = this.Name;
                                    var lat = this.Lat;
                                    var lng = this.Lng;
                                    var address = this.Address;
                                    var address2 = "";
                                    var city = this.City;
                                    var state = this.State;
                                    var postal = this.Postal;
                                    var phone = this.Phone;
                                    var web = "";
                                    //web = web.replace("http://","");
                                    var hours1 = "";
                                    var hours2 = "";
                                    var hours3 = "";

                                    var lobbysunday;
                                    if (this.LobbySunday != null) {
                                        lobbysunday = this.LobbySunday;
                                    } else {
                                        if (this.LobbySundayOpen == "Closed" || this.LobbySundayOpen == "N/A") {
                                            lobbysunday = this.LobbySundayOpen;
                                        } else {
                                            lobbysunday = this.LobbySundayOpen + " - " + this.LobbySundayClose;
                                        }
                                    }

                                    var lobbymonday;
                                    if (this.LobbyMonday != null) {
                                        lobbymonday = this.LobbyMonday;
                                    } else {
                                        if (this.LobbyMondayOpen == "Closed" || this.LobbyMondayOpen == "N/A") {
                                            lobbymonday = this.LobbyMondayOpen;
                                        } else {
                                            lobbymonday = this.LobbyMondayOpen + " - " + this.LobbyMondayClose;
                                        }
                                    }

                                    var lobbytuesday;
                                    if (this.LobbyTuesday != null) {
                                        lobbytuesday = this.LobbyTuesday;
                                    } else {
                                        if (this.LobbyTuesdayOpen == "Closed" || this.LobbyTuesdayOpen == "N/A") {
                                            lobbytuesday = this.LobbyTuesdayOpen;
                                        } else {
                                            lobbytuesday = this.LobbyTuesdayOpen + " - " + this.LobbyTuesdayClose;
                                        }
                                    }

                                    var lobbywednesday;
                                    if (this.LobbyWednesday != null) {
                                        lobbywednesday = this.LobbyWednesday;
                                    } else {
                                        if (this.LobbyWednesdayOpen == "Closed" || this.LobbyWednesdayOpen == "N/A") {
                                            lobbywednesday = this.LobbyWednesdayOpen;
                                        } else {
                                            lobbywednesday = this.LobbyWednesdayOpen + " - " + this.LobbyWednesdayClose;
                                        }
                                    }

                                    var lobbythursday;
                                    if (this.LobbyThursday != null) {
                                        lobbythursday = this.LobbyThursday;
                                    } else {
                                        if (this.LobbyThursdayOpen == "Closed" || this.LobbyThursdayOpen == "N/A") {
                                            lobbythursday = this.LobbyThursdayOpen;
                                        } else {
                                            lobbythursday = this.LobbyThursdayOpen + " - " + this.LobbyThursdayClose;
                                        }
                                    }

                                    var lobbyfriday;
                                    if (this.LobbyFriday != null) {
                                        lobbyfriday = this.LobbyFriday;
                                    } else {
                                        if (this.LobbyFridayOpen == "Closed" || this.LobbyFridayOpen == "N/A") {
                                            lobbyfriday = this.LobbyFridayOpen;
                                        } else {
                                            lobbyfriday = this.LobbyFridayOpen + " - " + this.LobbyFridayClose;
                                        }
                                    }

                                    var lobbysaturday;
                                    if (this.LobbySaturday != null) {
                                        lobbysaturday = this.LobbySaturday;
                                    } else {
                                        if (this.LobbySaturdayOpen == "Closed" || this.LobbySaturdayOpen == "N/A") {
                                            lobbysaturday = this.LobbySaturdayOpen;
                                        } else {
                                            lobbysaturday = this.LobbySaturdayOpen + " - " + this.LobbySaturdayClose;
                                        }
                                    }

                                    var driveupsunday;
                                    if (this.DriveUpSunday != null) {
                                        driveupsunday = this.DriveUpSunday;
                                    } else {
                                        if (this.DriveUpSundayOpen == "Closed" || this.DriveUpSundayOpen == "N/A") {
                                            driveupsunday = this.DriveUpSundayOpen;
                                        } else {
                                            driveupsunday = this.DriveUpSundayOpen + " - " + this.DriveUpSundayClose;
                                        }
                                    }

                                    var driveupmonday;
                                    if (this.DriveUpMonday != null) {
                                        driveupmonday = this.DriveUpMonday;
                                    } else {
                                        if (this.DriveUpMondayOpen == "Closed" || this.DriveUpMondayOpen == "N/A") {
                                            driveupmonday = this.DriveUpMondayOpen;
                                        } else {
                                            driveupmonday = this.DriveUpMondayOpen + " - " + this.DriveUpMondayClose;
                                        }
                                    }

                                    var driveuptuesday;
                                    if (this.DriveUpTuesday != null) {
                                        driveuptuesday = this.DriveUpTuesday;
                                    } else {
                                        if (this.DriveUpTuesdayOpen == "Closed" || this.DriveUpTuesdayOpen == "N/A") {
                                            driveuptuesday = this.DriveUpTuesdayOpen;
                                        } else {
                                            driveuptuesday = this.DriveUpTuesdayOpen + " - " + this.DriveUpTuesdayClose;
                                        }
                                    }

                                    var driveupwednesday;
                                    if (this.DriveUpWednesday != null) {
                                        driveupwednesday = this.DriveUpWednesday;
                                    } else {
                                        if (this.DriveUpWednesdayOpen == "Closed" || this.DriveUpWednesdayOpen == "N/A") {
                                            driveupwednesday = this.DriveUpWednesdayOpen;
                                        } else {
                                            driveupwednesday = this.DriveUpWednesdayOpen + " - " + this.DriveUpWednesdayClose;
                                        }
                                    }

                                    var driveupthursday;
                                    if (this.DriveUpThursday != null) {
                                        driveupthursday = this.DriveUpThursday;
                                    } else {
                                        if (this.DriveUpThursdayOpen == "Closed" || this.DriveUpThursdayOpen == "N/A") {
                                            driveupthursday = this.DriveUpThursdayOpen;
                                        } else {
                                            driveupthursday = this.DriveUpThursdayOpen + " - " + this.DriveUpThursdayClose;
                                        }
                                    }

                                    var driveupfriday;
                                    if (this.DriveUpFriday != null) {
                                        driveupfriday = this.DriveUpFriday;
                                    } else {
                                        if (this.DriveUpFridayOpen == "Closed" || this.DriveUpFridayOpen == "N/A") {
                                            driveupfriday = this.DriveUpFridayOpen;
                                        } else {
                                            driveupfriday = this.DriveUpFridayOpen + " - " + this.DriveUpFridayClose;
                                        }
                                    }

                                    var driveupsaturday;
                                    if (this.DriveUpSaturday != null) {
                                        driveupsaturday = this.DriveUpSaturday;
                                    } else {
                                        if (this.DriveUpSaturdayOpen == "Closed" || this.DriveUpSaturdayOpen == "N/A") {
                                            driveupsaturday = this.DriveUpSaturdayOpen;
                                        } else {
                                            driveupsaturday = this.DriveUpSaturdayOpen + " - " + this.DriveUpSaturdayClose;
                                        }
                                    }

                                    var type = this.Type;

                                    var atm = this.ATM;
                                    if (atm == true)
                                    { atm = "Yes"; }
                                    else
                                    { atm = "No"; }

                                    var driveup = this.DriveUp;
                                    if (driveup == true)
                                    { driveup = "Yes"; }
                                    else
                                    { driveup = "No"; }

                                    var safedeposit = this.SafeDeposit;
                                    if (safedeposit == true)
                                    { safedeposit = "Yes"; }
                                    else
                                    { safedeposit = "No"; }

                                    var nightdeposit = this.NightDeposit;
                                    if (nightdeposit == true)
                                    { nightdeposit = "Yes"; }
                                    else
                                    { nightdeposit = "No"; }

                                    var saturdayhours = this.SaturdayHours;
                                    if (saturdayhours == true)
                                    { saturdayhours = "Yes"; }
                                    else
                                    { saturdayhours = "No"; }

                                    var atmdeposits = this.ATMDeposits;
                                    if (atmdeposits == true)
                                    { atmdeposits = "Yes"; }
                                    else
                                    { atmdeposits = "No"; }

                                    var atmdriveup = this.ATMDriveUp;
                                    if (atmdriveup == true)
                                    { atmdriveup = "Yes"; }
                                    else
                                    { atmdriveup = "No"; }

                                    var atmwalkup = this.ATMWalkUp;
                                    if (atmwalkup == true)
                                    { atmwalkup = "Yes"; }
                                    else
                                    { atmwalkup = "No"; }


                                    var distance = GeoCodeCalc.CalcDistance(orig_lat, orig_lng, lat, lng, GeoCodeCalc.EarthRadius);

                                    //Determines if a location is a Branch or ATM
                                    var IsBranch = "Yes";
                                    if (type == "ATM") {
                                        IsBranch = "No";
                                    }

                                    var UseAdvancedSeach = false;

                                    //Is Branch box checked?
                                    var chkbranch = "No";
                                    if ($('#chkBranch').is(':checked') == true) {
                                        chkbranch = "Yes";

                                        //If branch box is checked, also check Advanced Options
                                        var chkDriveThru = "No";
                                        var chkSatHours = "No";
                                        var chkSafeDeposit = "No";
                                        var chkNightDeposit = "No";
                                        if ($('#chkDriveThru').is(':checked') == true) {
                                            chkDriveThru = "Yes";
                                            UseAdvancedSeach = true;
                                        }
                                        if ($('#chkSatHours').is(':checked') == true) {
                                            chkSatHours = "Yes";
                                            UseAdvancedSeach = true;
                                        }
                                        if ($('#chkSafeDeposit').is(':checked') == true) {
                                            chkSafeDeposit = "Yes";
                                            UseAdvancedSeach = true;
                                        }
                                        if ($('#chkNightDeposit').is(':checked') == true) {
                                            chkNightDeposit = "Yes";
                                            UseAdvancedSeach = true;
                                        }
                                    }

                                    //Is ATM box checked?
                                    var chkatm = "No";
                                    if ($('#chkATM').is(':checked') == true) {
                                        chkatm = "Yes";

                                        //If ATM box is checked, also check Advanced Options
                                        var chkATMDeposits = "No";
                                        var chkATMDriveUp = "No";
                                        var chkATMWalkUp = "No";
                                        if ($('#chkATMDeposits').is(':checked') == true) {
                                            chkATMDeposits = "Yes";
                                            UseAdvancedSeach = true;
                                        }
                                        if ($('#chkATMDriveUp').is(':checked') == true) {
                                            chkATMDriveUp = "Yes";
                                            UseAdvancedSeach = true;
                                        }
                                        if ($('#chkATMWalkUp').is(':checked') == true) {
                                            chkATMWalkUp = "Yes";
                                            UseAdvancedSeach = true;
                                        }

                                    }

                                    //If neither box is checked, set both to YES
                                    if (($('#chkATM').is(':checked') == false) && ($('#chkBranch').is(':checked') == false)) {
                                        chkbranch = "Yes";
                                        chkatm = "Yes";
                                    }

                                    //Filter results
                                    if ((chkbranch == "Yes" && chkbranch == IsBranch) || (chkatm == "Yes" && chkatm == atm)) {

                                        if (UseAdvancedSeach == true) {

                                            var AddtoArray;

                                            if (chkDriveThru == "Yes") {
                                                if ((chkDriveThru == driveup) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }

                                            }
                                            if (chkSatHours == "Yes") {
                                                if ((chkSatHours == saturdayhours) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }
                                            }
                                            if (chkSafeDeposit == "Yes") {
                                                if ((chkSafeDeposit == safedeposit) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }
                                            }
                                            if (chkNightDeposit == "Yes") {
                                                if ((chkNightDeposit == nightdeposit) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }
                                            }
                                            if (chkATMDeposits == "Yes") {
                                                if ((chkATMDeposits == atmdeposits) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }
                                            }
                                            if (chkATMDriveUp == "Yes") {
                                                if ((chkATMDriveUp == atmdriveup) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }
                                            }
                                            if (chkATMWalkUp == "Yes") {
                                                if ((chkATMWalkUp == atmwalkup) && (AddtoArray != false)) {
                                                    AddtoArray = true;
                                                }
                                                else {
                                                    AddtoArray = false;
                                                }
                                            }

                                            if (AddtoArray == true) {
                                                //Create the array for Advanced Search
                                                locationset[barray] = [distance, name, lat, lng, address, address2, city, state, postal, phone, web, hours1, hours2, hours3, type, atm, driveup, safedeposit, nightdeposit, saturdayhours, atmdeposits, atmdriveup, atmwalkup, lobbysunday, lobbymonday, lobbytuesday, lobbywednesday, lobbythursday, lobbyfriday, lobbysaturday, driveupsunday, driveupmonday, driveuptuesday, driveupwednesday, driveupthursday, driveupfriday, driveupsaturday, IsBranch];
                                                barray++;
                                            }
                                        }
                                        else {
                                            //Create the array without Advanced Search
                                            locationset[barray] = [distance, name, lat, lng, address, address2, city, state, postal, phone, web, hours1, hours2, hours3, type, atm, driveup, safedeposit, nightdeposit, saturdayhours, atmdeposits, atmdriveup, atmwalkup, lobbysunday, lobbymonday, lobbytuesday, lobbywednesday, lobbythursday, lobbyfriday, lobbysaturday, driveupsunday, driveupmonday, driveuptuesday, driveupwednesday, driveupthursday, driveupfriday, driveupsaturday, IsBranch];
                                            barray++;
                                        }
                                    }


                                    ////Create the array
                                    //if (settings.maxDistance === true) {
                                    //    if (distance < maxDistance) {
                                    //        locationset[i] = [distance, name, lat, lng, address, address2, city, state, postal, phone, web, hours1, hours2, hours3];
                                    //    }
                                    //    else {
                                    //        return;
                                    //    }
                                    //}
                                    //else {
                                    //    locationset[i] = [distance, name, lat, lng, address, address2, city, state, postal, phone, web, hours1, hours2, hours3, type, atm, driveup, safedeposit, nightdeposit, saturdayhours, atmdeposits, atmdriveup, atmwalkup, lobbysunday, lobbymonday, lobbytuesday, lobbywednesday, lobbythursday, lobbyfriday, lobbysaturday, driveupsunday, driveupmonday, driveuptuesday, driveupwednesday, driveupthursday, driveupfriday, driveupsaturday];
                                    //}

                                    i++;
                                });
                            }
                            else if (settings.dataType === 'kml') {
                                //Process KML
                                $(data).find('Placemark').each(function () {
                                    var name = $(this).find('name').text();
                                    var lat = $(this).find('coordinates').text().split(",")[1];
                                    var lng = $(this).find('coordinates').text().split(",")[0];
                                    var description = $(this).find('description').text();

                                    var distance = GeoCodeCalc.CalcDistance(orig_lat, orig_lng, lat, lng, GeoCodeCalc.EarthRadius);

                                    //Create the array
                                    if (settings.maxDistance === true) {
                                        if (distance < maxDistance) {
                                            locationset[i] = [distance, name, lat, lng, description];
                                        }
                                        else {
                                            return;
                                        }
                                    }
                                    else {
                                        locationset[i] = [distance, name, lat, lng, description];
                                    }

                                    i++;
                                });
                            }
                            else {
                                //Process XML
                                $(data).find('marker').each(function () {
                                    var name = $(this).attr('name');
                                    var lat = $(this).attr('lat');
                                    var lng = $(this).attr('lng');
                                    var address = $(this).attr('address');
                                    var address2 = $(this).attr('address2');
                                    var city = $(this).attr('city');
                                    var state = $(this).attr('state');
                                    var postal = $(this).attr('postal');
                                    var phone = $(this).attr('phone');
                                    var web = $(this).attr('web');
                                    web = web.replace("http://", "");
                                    var hours1 = $(this).attr('hours1');
                                    var hours2 = $(this).attr('hours2');
                                    var hours3 = $(this).attr('hours3');

                                    var distance = GeoCodeCalc.CalcDistance(orig_lat, orig_lng, lat, lng, GeoCodeCalc.EarthRadius);

                                    //Create the array
                                    if (settings.maxDistance === true) {
                                        if (distance < maxDistance) {
                                            locationset[i] = [distance, name, lat, lng, address, address2, city, state, postal, phone, web, hours1, hours2, hours3];
                                        }
                                        else {
                                            return;
                                        }
                                    }
                                    else {
                                        locationset[i] = [distance, name, lat, lng, address, address2, city, state, postal, phone, web, hours1, hours2, hours3];
                                    }

                                    i++;
                                });
                            }

                            //Sort the multi-dimensional array numerically by distance
                            locationset.sort(function (a, b) {
                                var x = a[0];
                                var y = b[0];
                                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                            });

                            //Check the closest marker
                            if (settings.maxDistance === true) {
                                if (locationset[0] === undefined || locationset[0][0] > maxDistance) {
                                    alert("Unfortunately, our closest location is more than " + maxDistance + " miles away.");
                                    return;
                                }
                            }
                            else {
                                if (locationset[0][0] > settings.distanceAlert) {
                                    alert("Unfortunately, our closest location is more than " + settings.distanceAlert + " miles away.");
                                }
                            }

                            //Create the map with jQuery
                            $(function () {

                                var storeDistance, storeName, storeAddress1, storeAddress2, storeCity, storeState, storeZip, storePhone, storeWeb, storeHours1, storeHours2, storeHours3, storeDescription;
                                var locType, locAtm, locDriveup, locSafedeposit, locNightdeposit, locSaturdayhours, locAtmdeposits, locAtmdriveup, locAtmwalkup;
                                var locLobbysunday, locLobbymonday, locLobbytuesday, locLobbywednesday, locLobbythursday, locLobbyfriday, locLobbysaturday;
                                var locDriveupsunday, locDriveupmonday, locDriveuptuesday, locDriveupwednesday, locDriveupthursday, locDriveupfriday, locDriveupsaturday;
                                var locIsbranch, locShowatmservices;

                                //Instead of repeating the same thing twice below
                                function create_location_variables(loopcount) {
                                    storeDistance = locationset[loopcount][0];
                                    storeDistance = roundNumber(storeDistance, 2);
                                    storeName = locationset[loopcount][1];
                                    storeAddress1 = locationset[loopcount][4];
                                    storeAddress2 = locationset[loopcount][5];
                                    storeCity = locationset[loopcount][6];
                                    storeState = locationset[loopcount][7];
                                    storeZip = locationset[loopcount][8];
                                    storePhone = locationset[loopcount][9];
                                    storeWeb = locationset[loopcount][10];
                                    storeHours1 = locationset[loopcount][11];
                                    storeHours2 = locationset[loopcount][12];
                                    storeHours3 = locationset[loopcount][13];
                                    locType = locationset[loopcount][14];
                                    locAtm = locationset[loopcount][15];
                                    locDriveup = locationset[loopcount][16];
                                    locSafedeposit = locationset[loopcount][17];
                                    locNightdeposit = locationset[loopcount][18];
                                    locSaturdayhours = locationset[loopcount][19];
                                    locAtmdeposits = locationset[loopcount][20];
                                    locAtmdriveup = locationset[loopcount][21];
                                    locAtmwalkup = locationset[loopcount][22];
                                    locLobbysunday = locationset[loopcount][23];
                                    locLobbymonday = locationset[loopcount][24];
                                    locLobbytuesday = locationset[loopcount][25];
                                    locLobbywednesday = locationset[loopcount][26];
                                    locLobbythursday = locationset[loopcount][27];
                                    locLobbyfriday = locationset[loopcount][28];
                                    locLobbysaturday = locationset[loopcount][29];
                                    locDriveupsunday = locationset[loopcount][30];
                                    locDriveupmonday = locationset[loopcount][31];
                                    locDriveuptuesday = locationset[loopcount][32];
                                    locDriveupwednesday = locationset[loopcount][33];
                                    locDriveupthursday = locationset[loopcount][34];
                                    locDriveupfriday = locationset[loopcount][35];
                                    locDriveupsaturday = locationset[loopcount][36];
                                    locIsbranch = locationset[loopcount][37];
                                    //Convert to a bool for infowindow comparison
                                    if (locIsbranch == "Yes")
                                        locIsbranch = true;
                                    else
                                        locIsbranch = false;
                                }

                                //There are less variables for KML files
                                function create_kml_location_variables(loopcount) {
                                    storeDistance = locationset[loopcount][0];
                                    storeDistance = roundNumber(storeDistance, 2);
                                    storeName = locationset[loopcount][1];
                                    storeDescription = locationset[loopcount][4];
                                }

                                //Define the location data for the templates
                                function define_location_data(currentMarker) {
                                    if (settings.dataType === 'kml') {
                                        create_kml_location_variables(currentMarker.get("id"));
                                    }
                                    else {
                                        create_location_variables(currentMarker.get("id"));
                                    }

                                    var distLength;
                                    if (storeDistance <= 1) {
                                        if (settings.lengthUnit === "km") {
                                            distLength = "kilometer";
                                        }
                                        else {
                                            distLength = "mile";
                                        }
                                    }
                                    else {
                                        if (settings.lengthUnit === "km") {
                                            distLength = "kilometers";
                                        }
                                        else {
                                            distLength = "miles";
                                        }
                                    }

                                    //Set up alpha character
                                    var markerId = currentMarker.get("id");
                                    //Use dot markers instead of alpha if there are more than 26 locations
                                    if (settings.storeLimit > 26) {
                                        var indicator = markerId + 1;
                                    }
                                    else {
                                        var indicator = 1 + markerId;
                                        //var indicator = String.fromCharCode("A".charCodeAt(0) + markerId);
                                    }

                                    //Define location data
                                    if (settings.dataType === 'kml') {
                                        var locations = {
                                            location: [
                      {
                          "distance": storeDistance,
                          "markerid": markerId,
                          "marker": indicator,
                          "name": storeName,
                          "description": storeDescription,
                          "length": distLength,
                          "origin": origin
                      }
                    ]
                                        };
                                    }
                                    else {
                                        var locations = {
                                            location: [
                      {
                          "distance": storeDistance,
                          "markerid": markerId,
                          "marker": indicator,
                          "name": storeName,
                          "address": storeAddress1,
                          "address2": storeAddress2,
                          "city": storeCity,
                          "state": storeState,
                          "postal": storeZip,
                          "phone": storePhone,
                          "web": storeWeb,
                          "hours1": storeHours1,
                          "hours2": storeHours2,
                          "hours3": storeHours3,
                          "type": locType,
                          "atm": locAtm,
                          "driveup": locDriveup,
                          "safedeposit": locSafedeposit,
                          "nightdeposit": locNightdeposit,
                          "saturdayhours": locSaturdayhours,
                          "atmdeposits": locAtmdeposits,
                          "atmdriveup": locAtmdriveup,
                          "atmwalkup": locAtmwalkup,
                          "lobbysunday": locLobbysunday,
                          "lobbymonday": locLobbymonday,
                          "lobbytuesday": locLobbytuesday,
                          "lobbywednesday": locLobbywednesday,
                          "lobbythursday": locLobbythursday,
                          "lobbyfriday": locLobbyfriday,
                          "lobbysaturday": locLobbysaturday,
                          "driveupsunday": locDriveupsunday,
                          "driveupmonday": locDriveupmonday,
                          "driveuptuesday": locDriveuptuesday,
                          "driveupwednesday": locDriveupwednesday,
                          "driveupthursday": locDriveupthursday,
                          "driveupfriday": locDriveupfriday,
                          "driveupsaturday": locDriveupsaturday,
                          "isbranch": locIsbranch,
                          "showatmservices": locShowatmservices,
                          "length": distLength,
                          "origin": origin
                      }
                    ]
                                        };
                                    }

                                    return locations;
                                }

                                //Slide in the map container
                                if (settings.slideMap === true) {
                                    $this.slideDown();
                                }
                                //Set up the modal window
                                if (settings.modalWindow === true) {
                                    //Pop up the modal window
                                    $('#overlay').fadeIn();
                                    //Close modal when close icon is clicked
                                    $(document).on('click', '#close-icon', function () {
                                        $('#overlay').hide();
                                    });
                                    //Close modal when background overlay is clicked
                                    $(document).on('click', '#overlay', function () {
                                        $('#overlay').hide();
                                    });
                                    //Prevent clicks within the modal window from closing the entire thing
                                    $(document).on('click', '#modal-window', function (e) {
                                        e.stopPropagation();
                                    });
                                    //Close modal when escape key is pressed
                                    $(document).keyup(function (e) {
                                        if (e.keyCode === 27) {
                                            $('#overlay').hide();
                                        }
                                    });
                                }

                                //Google maps settings
                                if (settings.fullMapStart === true || settings.zoomLevel === 0) {
                                    var myOptions = {
                                        mapTypeId: google.maps.MapTypeId.ROADMAP
                                    };
                                    var bounds = new google.maps.LatLngBounds();
                                }
                                else {
                                    var myOptions = {
                                        zoom: settings.zoomLevel,
                                        center: new google.maps.LatLng(orig_lat, orig_lng),
                                        mapTypeId: google.maps.MapTypeId.ROADMAP
                                    };
                                }

                                var map = new google.maps.Map(document.getElementById(settings.mapDiv), myOptions);
                                var markers = [];
                                //Create one infowindow to fill later
                                var infowindow = new google.maps.InfoWindow();

                                //Avoid error if number of locations is less than the default of 26
                                if ((locationset.length - 1) < settings.storeLimit - 1) {
                                    storenum = locationset.length - 1;
                                }
                                else {
                                    storenum = settings.storeLimit - 1;
                                }

                                //Add origin marker if the setting is set
                                if (settings.originMarker === true) {
                                    var originPinShadow = new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_shadow",
                                    new google.maps.Size(40, 37),
                                    new google.maps.Point(0, 0),
                                    new google.maps.Point(12, 35));
                                    var originPoint = new google.maps.LatLng(orig_lat, orig_lng);
                                    var marker = new google.maps.Marker({
                                        position: originPoint,
                                        map: map,
                                        icon: 'https://maps.google.com/mapfiles/ms/icons/' + settings.originpinColor + '-dot.png',
                                        shadow: originPinShadow,
                                        draggable: false
                                    });
                                }

                                //Add markers and infowindows loop
                                for (var y = 0; y <= storenum; y++) {
                                    var letter = 1 + y;
                                    //var letter = String.fromCharCode("A".charCodeAt(0) + y);
                                    var point = new google.maps.LatLng(locationset[y][2], locationset[y][3]);
                                    marker = createMarker(point, locationset[y][1], locationset[y][4], letter);
                                    marker.set("id", y);
                                    markers[y] = marker;
                                    if (settings.fullMapStart === true || settings.zoomLevel === 0) {
                                        bounds.extend(point);
                                    }
                                    //Pass variables to the pop-up infowindows
                                    create_infowindow(marker);
                                }

                                //Center and zoom if no origin or zoom was provided
                                if (settings.fullMapStart === true || settings.zoomLevel === 0) {
                                    map.fitBounds(bounds);
                                }

                                //Create the links that focus on the related marker
                                $("#" + settings.listDiv + ' ul').empty();
                                $(markers).each(function (x, marker) {
                                    var letter = 1 + x;
                                    //var letter = String.fromCharCode("A".charCodeAt(0) + x);
                                    //This needs to happen outside the loop or there will be a closure problem with creating the infowindows attached to the list click
                                    var currentMarker = markers[x];
                                    listClick(currentMarker);
                                });

                                function listClick(marker) {
                                    //Define the location data
                                    var locations = define_location_data(marker);

                                    //Set up the list template with the location data
                                    var listHtml = listTemplate(locations);
                                    $('#' + settings.listDiv + ' ul').append(listHtml);
                                }

                                //Handle clicks from the list
                                $(document).on('click', '#' + settings.listDiv + ' li', function () {
                                    var markerId = $(this).data('markerid');

                                    var selectedMarker = markers[markerId];

                                    //Focus on the list
                                    $('#' + settings.listDiv + ' li').removeClass('list-focus');
                                    $('#' + settings.listDiv + ' li[data-markerid=' + markerId + ']').addClass('list-focus');

                                    map.panTo(selectedMarker.getPosition());
                                    var listLoc = "left";
                                    if (settings.bounceMarker === true) {
                                        selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
                                        setTimeout(function () { selectedMarker.setAnimation(null); create_infowindow(selectedMarker, listLoc); }, 700);
                                    }
                                    else {
                                        create_infowindow(selectedMarker, listLoc);
                                    }
                                });

                                //Add the list li background colors
                                $("#" + settings.listDiv + " ul li:even").css('background', "#" + settings.listColor1);
                                $("#" + settings.listDiv + " ul li:odd").css('background', "#" + settings.listColor2);

                                //Custom marker function - alphabetical
                                function createMarker(point, name, address, letter) {
                                    //Set up pin icon with the Google Charts API for all of our markers
                                    var pinImage = new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + letter + "|" + settings.pinColor + "|" + settings.pinTextColor,
                                    new google.maps.Size(21, 34),
                                    new google.maps.Point(0, 0),
                                    new google.maps.Point(10, 34));
                                    var pinShadow = new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_shadow",
                                    new google.maps.Size(40, 37),
                                    new google.maps.Point(0, 0),
                                    new google.maps.Point(12, 35));

                                    //Create the markers
                                    if (settings.storeLimit > 26) {
                                        var marker = new google.maps.Marker({
                                            position: point,
                                            map: map,
                                            draggable: false
                                        });
                                    }
                                    else {
                                        var marker = new google.maps.Marker({
                                            position: point,
                                            map: map,
                                            icon: pinImage,
                                            shadow: pinShadow,
                                            draggable: false
                                        });
                                    }

                                    return marker;
                                }

                                //Infowindows
                                function create_infowindow(marker, location) {

                                    //Define the location data
                                    var locations = define_location_data(marker);

                                    //Set up the infowindow template with the location data
                                    var formattedAddress = infowindowTemplate(locations);

                                    //Opens the infowindow when list item is clicked
                                    if (location === "left") {
                                        infowindow.setContent(formattedAddress);
                                        infowindow.open(marker.get(settings.mapDiv), marker);
                                    }
                                    //Opens the infowindow when the marker is clicked
                                    else {
                                        google.maps.event.addListener(marker, 'click', function () {
                                            infowindow.setContent(formattedAddress);
                                            infowindow.open(marker.get(settings.mapDiv), marker);
                                            //Focus on the list
                                            $('#' + settings.listDiv + ' li').removeClass('list-focus');
                                            markerId = marker.get("id");
                                            $('#' + settings.listDiv + ' li[data-markerid=' + markerId + ']').addClass('list-focus');

                                            //Scroll list to selected marker
                                            var container = $('#' + settings.listDiv), scrollTo = $('#' + settings.listDiv + ' li[data-markerid=' + markerId + ']');
                                            $('#' + settings.listDiv).animate({
                                                scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
                                            });
                                        });
                                    }

                                }

                            });
                        }
                    });
                });
            }

        });
    };
})(jQuery);
