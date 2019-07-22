/* Cookie functions */
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
    if (name == "LineOfBusiness") {
        alert("Your default homepage has been saved.");
    }
}

function readCookie(name) {
    var ca = document.cookie.split(';');
    var nameEQ = name + "=";
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length); //delete spaces
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

/* Popup Utilities */
function leaveSite(url, params) {
    if (params == "" || params == undefined) {
        params = "toolbar=yes, scrollbars=yes, location=yes, resizable=yes, status=yes, menubar=yes"
    }
    if (confirm("By linking to this website you are exiting the FirstMerit web site. The external website may have privacy and security standards which are different from FirstMerit's. Even though FirstMerit has a business relationship with the external website provider, FirstMerit cannot guarantee the products, services, information or recommendations contained in external websites.")) {
        var newwin = window.open(url, '', params);
        if (newwin != null) {
            newwin.focus();
        }
    }
}

function internalPopup(url, params) {
    if (params == "" || params == undefined) {
        params = "toolbar=yes, scrollbars=yes, location=yes, resizable=yes, status=yes, menubar=yes"
    }
    var newwin = window.open(url, '', params);
    if (newwin != null) {
        newwin.focus();
    }
}

/*Form Submit Functions*/
var GenericFormContactGroup;
function contactUs(contactgroup) {
    $("body").append("<div id=\"contact\"></div>");

    var dlg = $('#contact').dialog({
        title: 'Email Us',
        resizable: true,
        autoOpen: false,
        modal: true,
        hide: 'fade'
    });
    //dlg.load('contact-template.html', function () {
    dlg.load('web_resources/themes/stacord/contacttemplates/contact-template.html', function () {
        dlg.dialog('open');
    });
    GenericFormContactGroup = contactgroup;
}

function contactUsMyHome(contactgroup) {
    $("body").append("<div id=\"contact\"></div>");

    var dlg = $('#contact').dialog({
        title: 'Loan Inquiry',
        resizable: true,
        autoOpen: false,
        modal: true,
        width: 650,
        hide: 'fade'
    });
    //dlg.load('contact-template.html', function () {
    dlg.load('web_resources/themes/stacord/contacttemplates/contact-mortgage-template.html', function () {
        dlg.dialog('open');
    });
    GenericFormContactGroup = contactgroup;
}

function OnContactFormSubmitted(msg) {
    //$("#contact").dialog("close");
    $("#formdiv").hide();
    $("#successdiv").show();
}

function OnGenericFormSubmitted(msg) {
    $("#form").hide();
    $("#SubmitOk").show();
}

function OnGenericFormErrored() {
    $("#form").hide();
    $("#SubmitErr").show();
}

function GenericFormRequest(items, formname) {
    this.FormName = FilterGenericFormText(formname);
    this.URL = document.URL; //old
	this.Url = document.URL; //new
    this.Items = items;
}

function GenericFormItem(name, value, inputType) {
    this.Name = FilterGenericFormText(name);
    this.Value = FilterGenericFormText(value);
    this.InputType = FilterGenericFormText(inputType);
}

function FilterGenericFormText(value) {
    if (value && value != "") {
        return value.replace(/[<>(){}:;+%'"=]*/g, '');
    }
    else
        return "";
}

function SubmitForm(formName, OnSuccess, OnError) {
    $("input[type=submit]").attr("disabled", "disabled");
    var inReq = BuildObj($("input[fmq],select[fmq],textarea[fmq]"), formName);
    CallProxy("SubmitGenericForm", inReq, OnSuccess, OnError, false);
    return false;
}

function SubmitGenericForm(formName) {
    return SubmitForm(formName, OnGenericFormSubmitted, OnGenericFormErrored);
}

function SubmitContactForm() {
    if ($("#email").val() == '' && $("#phone").val() == '') {
        $("div.error").html("Please enter your phone number or email address.");
        $("div.error").show();
        return false;
    }
    else if ($("#name").val() == '') {
        $("div.error").html("Please enter your name.");
        $("div.error").show();
        return false;
    }
    else if ($("#email").val() != '' && validateEmail($("#email").val()) == false) {
        $("div.error").html("Please enter a valid email address.");
        $("div.error").show();
        return false;
    }
    else if ($("#phone").val() != '' && validatePhone($("#phone").val()) == false) {
        $("div.error").html("Please enter a valid phone number.");
        $("div.error").show();
        return false;
    }
    else if ($("#address").length > 0) {
        if ($("#address").val() == '') {
            $("div.error").html("Please enter the property address.");
            $("div.error").show();
            return false;
        }
    }
    else {
        $("div.error").hide();
        return SubmitForm(GenericFormContactGroup, OnContactFormSubmitted, null);
    }
}

function validateEmail(email) {
    var regexObj = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexObj.test(email);
}

function validatePhone(phone) {
    var regexObj = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return regexObj.test(phone);
}


function BuildObj($questions, formName) {

    var Q1Items = [];
    $questions.each(function () {
        var myType = $(this).attr("type");
        switch (myType) {
            case "checkbox":
                {
                    Q1Items.push(new GenericFormItem($(this).attr("fmq"), (this.checked ? $(this).attr("fma") : ""), myType));
                }
                break;
            default:
                {
                    Q1Items.push(new GenericFormItem($(this).attr("fmq"), FilterGenericFormText($(this).val()), myType));
                }
        }
    });

    var retVal = new GenericFormRequest(Q1Items, formName);
    return retVal;
}

/************** Start Login/Link Support ********************/

var envLinks = {
    InternetBanking: 'https://www.firstmeritib.com',
    EConnect: 'https://econnect.firstmerit.com',
    MortgageBot: 'https://mortgagebot.com',
    Benefit401k: 'https://www.benefitwebaccess.com/firstmerit',
    Streetscape: 'https://www.mystreetscape.com/',
    CreditCardDetail: 'https://fmcc.fdecs.com/',
    PayrollServices: 'https://www.businessonlinepayroll.com/login/auth.asp',
    SmartData: 'https://sdg2.mastercard.com/sdng/login/login.do',
    ArLockbox: 'https://ar-lockbox.firstmerit.com/portal/esec_firstmerit/login.ht',
    ELockbox: 'https://lockbox.firstmerit.com',
    RemoteDepositCapture: 'https://direct.imagedepositgateway.com/MultiFactorAuthenticationWebClient/Default.aspx?ReturnUrl=%2fMerchantCaptureWebClient%2fDefault.aspx%3finstitution%3d0143&institution=0143',
    ArBox: 'https://www.ecpays.com/arbox',
    MyTrust: 'https://www.account3000.com/firstmerit/',
    PlanSponsorTrust: 'https://retirementplans.firstmerit.com/',
    AccountView: 'https://myaccountviewonline.com/AccountView/',
    PrepaidReloadableCard: '',
    CRBCMI: 'https://cibng.ibanking-services.com/cib/CEBMainServlet/Login?FIORG=143&FIFID=072400528',
    CRBCOH: 'https://cibng.ibanking-services.com/cib/CEBMainServlet/Login?FIORG=143&FIFID=072400528',
    CRBCWI: 'https://cibng.ibanking-services.com/cib/CEBMainServlet/Login?FIORG=887&FIFID=075901998',
    REDeSpend: 'https://www.consumercardaccess.com/redespend',
    CRBCBE: 'https://citizensbank.ebanking-services.com/Nubi/signin.aspx',
    CRBCLB: 'https://www.enternetbank.com/citizensonline/',
    CRBCWM: 'https://clientpoint.fisglobal.com/tdcb/main/UserLogon?bankNumber=NC&subProduct=CBWEALTH',
    CRBCPC: 'https://www.go-retire.com/citizensflint/srtweb1.htm'
};

$(function () {
    var curURL = '' + window.location.href;
    curURL = curURL.toLowerCase();
    if (curURL.indexOf('https://www./') != 0) {
        UpdateEnvLinks();
    }
    LoginTypeChange();
    $("#btn-login, #btn-Go").click(LoginClick);
    $("#dd-login-type").change(LoginTypeChange);
});

function UpdateEnvLinks() {
    CallProxy("GetEnvLinks", null, UpdateEnvLinksReturn, null, true);
}

function UpdateEnvLinksReturn(results) {
    envLinks = results;

    $('a[href*="https://www.firstmeritib.com"]').each(function () {
        $(this).attr('href', $(this).attr('href').replace('https://www.firstmeritib.com/', envLinks.InternetBanking));
    });

    $('a[href*="https://econnect.firstmerit.com"]').each(function () {
        $(this).attr('href', $(this).attr('href').replace('https://econnect.firstmerit.com/', envLinks.EConnect));
    });

    $('a[href*="https://mortgagebot.com"]').each(function () {
        $(this).attr('href', $(this).attr('href').replace('https://mortgagebot.com/', envLinks.MortgageBot));
    });

}

function LoginTypeChange() {
    var loginType = $("#dd-login-type").val();
    var mobileView = ($("#footerRight").css('float') == "none");

    if (loginType == "PersonalOnlineBanking") {
        if (!mobileView) {
            $("#li-Username, #li-Login-Button, #li-Username-Label").css("display", "");
            $("#li-Go-Button, #li-Company-Label, #li-Company").hide();
            $("#Username").focus();
        } else {
            $("#li-Login-Button").show();
            $("#li-Go-Button").hide();
        }
    } else if (loginType == "BusinessOnlineBanking" || loginType == "eLockbox") {
        if (!mobileView) {
            $("#li-Username, #li-Login-Button, #li-Username-Label, #li-Company-Label, #li-Company").css("display", "");
            $("#li-Go-Button").hide();
            $("#Company").focus();
        } else {
            $("#li-Login-Button").show();
            $("#li-Go-Button").hide();
        }
    } else if (loginType == "Benefit401k" || loginType == "Streetscape" || loginType == "CreditCardDetail" ||
			   loginType == "PayrollServices" || loginType == "SmartData" || loginType == "arLockbox" ||
			   loginType == "RemoteDepositCapture" || loginType == "arBox" || loginType == "myTrust" ||
			   loginType == "PlanSponsorTrust" || loginType == "CRBCMI" || loginType == "CRBCOH" || loginType == "CRBCWI" ||
               loginType == "REDeSpend" || loginType == "CRBCBE" || loginType == "CRBCLB" || loginType == "CRBCWM" ||
               loginType == "CRBCPC" || loginType == "AccountView" || loginType == "PrepaidReloadableCard" || loginType == "eConnect") {
        if (!mobileView) {
            $("#li-Username, #li-Login-Button, #li-Username-Label, #li-Company-Label, #li-Company").hide();
            $("#li-Go-Button").show();
        } else {
            $("#li-Login-Button").hide();
            $("#li-Go-Button").show();
        }
    }
}

function LoginClick(event) {
    if (event)
        event.preventDefault();

    var loginType = $("#dd-login-type").val();

    if (loginType == "PersonalOnlineBanking") {
        jsCheck();
        $('#CustomerType').val('R');
        $('#loginForm').attr("action", envLinks.InternetBanking + "/LoginConsolidated.aspx");
        if (event) $('#loginForm').submit();
    } else if (loginType == "Benefit401k") {
        window.location.href = envLinks.Benefit401k;
    } else if (loginType == "Streetscape") {
        window.location.href = envLinks.Streetscape;
    } else if (loginType == "BusinessOnlineBanking") {
        jsCheck();
        $('#CustomerType').val('B');
        $('#loginForm').attr("action", envLinks.InternetBanking + "/LoginConsolidated.aspx");
        if (event) $('#loginForm').submit();
    } else if (loginType == "eLockbox") {
        jsCheck();
        $('#CustomerType').val('E');
        $('#loginForm').attr("action", envLinks.ELockbox + "/LoginConsolidated.aspx");
        if (event) $('#loginForm').submit();
    } else if (loginType == "CreditCardDetail") {
        window.location.href = envLinks.CreditCardDetail;
    } else if (loginType == "PayrollServices") {
        leaveSite(envLinks.PayrollServices);
    } else if (loginType == "SmartData") {
        leaveSite(envLinks.SmartData);
    } else if (loginType == "arLockbox") {
        window.location.href = envLinks.ArLockbox;
    } else if (loginType == "RemoteDepositCapture") {
        window.location.href = envLinks.RemoteDepositCapture;
    } else if (loginType == "arBox") {
        window.location.href = envLinks.ArBox;
    } else if (loginType == "myTrust") {
        window.location.href = envLinks.MyTrust;
    } else if (loginType == "PlanSponsorTrust") {
        window.location.href = envLinks.PlanSponsorTrust;
    } else if (loginType == "CRBCMI") {
        window.location.href = envLinks.CRBCMI;
    } else if (loginType == "CRBCOH") {
        window.location.href = envLinks.CRBCOH;
    } else if (loginType == "CRBCWI") {
        window.location.href = envLinks.CRBCWI;
    } else if (loginType == "REDeSpend") {
        window.location.href = envLinks.REDeSpend;
    } else if (loginType == "CRBCBE") {
        window.location.href = envLinks.CRBCBE;
    } else if (loginType == "CRBCLB") {
        window.location.href = envLinks.CRBCLB;
    } else if (loginType == "CRBCWM") {
        window.location.href = envLinks.CRBCWM;
    } else if (loginType == "CRBCPC") {
        window.location.href = envLinks.CRBCPC;
    }  else if (loginType == "AccountView") {
        window.location.href = envLinks.AccountView;
    } else if (loginType == "PrepaidReloadableCard") {
        window.location.href = envLinks.PrepaidReloadableCard;
    } else if (loginType == "eConnect") {
        window.location.href = envLinks.EConnect;
    }

    return false;
}

function jsCheck() {
    var txtJavascriptEnabled = document.getElementById("JavascriptEnabled");
    if (txtJavascriptEnabled) txtJavascriptEnabled.value = "true";
}
/************** Finish Login/Link Support *******************/


