/**
 * formReForm JavaScript for Form Layout, version 0.5
 * (c) Joe Lippeatt (joey@lippeatt.com)
 * 
 * See the latest revisions at http://code.google.com/p/formreform/
 * 
 * formReForm is freely distributable and open.  Please contribute improvements
 * back to the project.  
 * 
 * see included README.txt for license information
 * 
 */

/* ---------------------------------------
 * formReForm(formDivId)
 * 
 * formReForm Main Constructor
   --------------------------------------- */
FormReForm = function( opts ) {

	/* Optional overridable properties 
	 * ------------------------------- */
	this.autoLoadCss = ((opts.autoLoadCss!=undefined) && (opts.autoLoadCss==true)) ? true : false;
	this.autoReform = ((opts.autoReform!=undefined) && (opts.autoReform==true)) ? true : false;
	
    this.c50pct = ((opts.class50Pct!=undefined) && (opts.class50Pct==true)) ?  opts.class50Pct : "f50p";
    this.c100pct = ((opts.class100Pct!=undefined) && (opts.class100Pct==true)) ?  opts.class100Pct : "f100p";
	this.chkbxDiv = ((opts.classCheckBoxDiv!=undefined) && (opts.classCheckBoxDiv==true)) ?  opts.classCheckBoxDiv : "fChkBx";
	
	this.cLabelDiv = "fLabel";
	this.cInputDiv = "fValue";
	this.cChkBxNm = "fChkBxItem";
	
	this.cssLoc = ((opts.cssFileLoc!=undefined) && (opts.cssFileLoc==true)) ?  opts.cssFileLoc : "formReForm.css";
	
	this.formContainerWidth = null;
	
	this._isIe = false;
	
    if ((opts.formContainerId=='') || (opts.formContainerId==undefined)) {
		alert("No form container found.");
		return false;
	}
	var fContainerOjb = document.getElementById(opts.formContainerId);
       
	// create array of label and input objects
	var formObjArr = new Array();
	
	/* ---------------------------------------
	 * this is the starting point for resculpting
	 * the form.  this functino sets up basic
	 * requirements and calls the reFormEl
	 * method.
	 * --------------------------------------- */
 
    this.doReForm = function()
	{
        this._isIe = this.browserChk();
        // prevent some flicker
        fContainerOjb.style.visibility = 'hidden';

		if (this.formContainerWidth!=null)
			fContainerOjb.style.width = this.formContainerWidth;

		// create label collection
		var fLabelCol = fContainerOjb.getElementsByTagName("label");

        if (fLabelCol.length > 0) {
            for (var i = 0; i < fLabelCol.length; i++) {

                // get the current label for value
                var labelForAttr = this.getElementAttribute(fLabelCol[i], 'for');
				// get the current label options form the rel value
				var labelRelAttr = this.getElementAttribute(fLabelCol[i], 'rel');
				// get the element this item is "for"
                var thisEl = document.getElementById(labelForAttr);
				
				this.reFormEl(fLabelCol[i], thisEl, labelRelAttr);

			}
		}
        fContainerOjb.style.visibility = 'visible';
	};
	
	/* ---------------------------------------
	 * reFormEl does all the heavy lifting.  
	 * This function take the label and form elements 
	 * and sculpts out the new GUI.
	 * --------------------------------------- */
	this.reFormEl = function(labelEl, fInputEl, opts) 
	{
		var elType = this.getElementAttribute(fInputEl,'type');
		var outerDiv = document.createElement('div');
		fContainerOjb.insertBefore(outerDiv,labelEl);
		var labelDiv = document.createElement('div');
		var inputDiv = document.createElement('div');

		if (elType != 'checkbox') 
		{
			outerDiv.className = (opts == '100pct') ? this.c100pct : this.c50pct;
			
			outerDiv.className += " field";
			labelDiv.className = this.cLabelDiv;
			inputDiv.className = this.cInputDiv;
			outerDiv.appendChild(labelDiv);
			outerDiv.appendChild(inputDiv);

		} else {
			outerDiv.className = this.chkbxDiv;
			labelDiv.className = this.cLabelDiv;
			inputDiv.className = this.cChkBxNm;

			outerDiv.appendChild(inputDiv);
			outerDiv.appendChild(labelDiv);		
		}
		labelDiv.appendChild(labelEl);
		inputDiv.appendChild(fInputEl);

	};
			
	/* ---------------------------------------
	 * this.loadformReFormCss()
	 * if the css is not included as a link or 
	 * style attribute in the html file itself, 
	 * you can load the style by calling this 
	 * function
	 * --------------------------------------- */
	this.loadformReFormCss = function()
	{
		var cssO = document.createElement('link');
		cssO.setAttribute('type', 'text/css');
		cssO.setAttribute('rel', 'stylesheet');
		cssO.setAttribute('href', this.cssLoc);
		
		if ((cssO!="undefined") && (cssO!=null)) 
		{
			var headObj = document.getElementsByTagName('head');
			headObj[0].appendChild(cssO);
		}
    };
    
	/* crude but simple check for IE */
	this.browserChk = function() 
	{
		var u = navigator.userAgent;
		i = u.indexOf('MSIE');
		return (i >= 0) ? true : false;
	};

	// retrieve the value of an element's attribute
	this.getElementAttribute = function(el, attr) 
	{
		var returnVal = null;
		if (this._isIe) 
		{
			for( var x = 0; x < el.attributes.length; x++ ) {
				if( el.attributes[x].nodeName.toLowerCase() == attr.toLowerCase() ) 
				{
					returnVal = el.attributes[x].nodeValue;
					return returnVal;
				}
			}
		} else {
			returnVal = el.getAttribute(attr);
		}
		return returnVal;
	};

	if (this.autoLoadCss) this.loadformReFormCss();
	if (this.autoReform) this.doReForm();
}


