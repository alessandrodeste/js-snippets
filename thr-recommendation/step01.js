//
// On page ready
//
$(function () {
  
	var contentsIds = [
		["9688c985-0ff8-47ae-9eab-a95184801e4f", "oz1csf"],
		["392a10d0-03a7-4e83-9ce6-2351988a7bba", "BIWdGF", "mobile"]
	];
	
	var viewModel = new Page01ViewModel();
	viewModel.load(contentsIds);

});

//
// ViewModel class (a sort of...)
//
function Page01ViewModel() {
	
	// Public fields
	this.contents = [];

	// Private fields
	var that = this;
	var selectedThumb = undefined;

	//
	// Public methods
	//
	this.load = function(contentsIds) {
		
		$('#table-ex01 tbody').empty();
		$('ul.thumbList').empty();
		
		$.each(contentsIds, function(i, cId) {
			var content = new Content();
			content.load(createRow, cId[0], cId[1], (cId.length > 2 ? cId[2] : undefined));
			that.contents.push(content);
		});
		
		// Close dialog event
		document.getElementById("closeThumbDialog").onclick = function() {
			var thumbDialog = document.getElementById("thumbDialog");
			thumbDialog.close();
			
			// Clear variables
			selectedThumb = undefined;
			$('dialog video').hide().attr('src', '');
			
		};
		
		// Next dialog event
		document.getElementById("nextThumbDialog").onclick = showNextImage;
		
		// Previous dialog event
		document.getElementById("previousThumbDialog").onclick = showPrevImage;
		
		// Test compatibility... 
		//var testdialog = document.createElement("dialog");
		//testdialog.setAttribute("open", "");
		//if (!testdialog.open) { 
		//	dialogPolyfill.registerDialog(cover); 
		//}

	
	};
	
	//
	// Private methods
	//
	function createRow(content) {
		
		// fill table
		var table = $('#table-ex01 tbody');
		var row = $('<tr />').addClass('row');
		
		// Column 1: open action
		var a_url = $('<a />'); 
		a_url.attr('href', content.url);
		a_url.append($('<i></i>').addClass(content.contentType == "IMAGE" ? "fa fa-2x fa-file-image-o" : "fa fa-2x fa-file-video-o" ));
		row.append($('<td />').append(a_url));
		
		// Column 2: Preview (and hidden field with list of thumbs, todo: handle with databind...)
		var thumb = $('<a href="#" />').addClass('thumb');
		thumb.html('<img src="' + content.thumbnail + '" with="75" />');
		row.append($('<td />').append(thumb));
		
		// Column 3: Owner
		row.append($('<td />').text(content.owner));
		
		// Column 4: Datetime
		row.append($('<td />').text(content.creationDate));
		
		table.append(row);
		
		// Add thumb in list
		$('ul.thumbList').append(
			$('<li />')
				.data('content', content)
				.html('<img src="' + content.thumbnail + '" />')
				.click(showImage)
		);
		
		sortTable();
	}
	
	function showImage(e) {
		
		e.preventDefault();
			
		var content = $(this).data('content');
		
		//var childrenThumbs = $(this.querySelector("ul")).children();
	
		for (var i = 0; i < that.contents.length; i++) {
			if (that.contents[i].id == content.id) {
				selectedThumb = i;
				break;
			}
		}
		
		changeImage(selectedThumb);
		
		
		var thumbDialog = document.getElementById("thumbDialog");
		thumbDialog.showModal();
		
	}
	
	function showNextImage(e) {
		selectedThumb++;
		if (!that.contents[selectedThumb])
		{
			selectedThumb = 0;
		}
		changeImage(selectedThumb);
		
	}
	
	function showPrevImage(e) {
		selectedThumb--;
		if (!that.contents[selectedThumb])
		{
			selectedThumb = that.contents.length - 1;
		}
		changeImage(selectedThumb);
	}
	
	function changeImage(selectedThumb) {
		
		// TODO: if type VIDEO show video, else show image (NOT the thumbnail)
		var dialog = $('.thumbDialogMedia');
		
		if (that.contents[selectedThumb].contentType == "VIDEO")
		{
			dialog.fadeOut('fast', function () {
				
		        // FIXME: check the video type
				$('dialog img').hide();
				var video = $('dialog video');
			 	video.show();
				video.attr('src', that.contents[selectedThumb].url);
				
		        dialog.fadeIn('fast');
	    	});
	    	
			
		}
		else
		{	
			dialog.fadeOut('fast', function () {
				
		        // FIXME: check the video type
				$('dialog video').hide().attr('src', '');
				var img = $('dialog img');
				img.show();
				img.attr('src', that.contents[selectedThumb].thumbnail);
				
		        dialog.fadeIn('fast');
	    	});
	    	
			
		}
		
		
	
	}
	
	
	function sortTable() {
		
		// Check if is all loaded
		var loadingComplete = true;
		$.each(that.contents, function(i, content) {
			if (!content.loaded)
			{
				loadingComplete = false;
				return false;
			}
		});
		
		// Sort table
		if (loadingComplete)
		{
			$("#table-ex01").tablesorter( {
				dateFormat: 'pt',  
				headers: { 
		            0: { sorter: false  },
		            1: { sorter: false  }
    		} } ); 
		}
	}
}

//
// Content class
//
// Class and ES5... so bad
function Content() {
	
	// Public fields
	this.id = "";
	this.url = "";
	this.owner = "";
	this.creationDate = "";
	this.thumbnail = "";
	this.thumbnails = [];
	this.contentType = "";
	this.loaded = false;
	
	// Private fields
	var that = this;
	
	//
	// Public methods
	//
	
	this.toString = function () {
		return "Content: " + this.id + " (" + this.url + ")";
	};
	
	// Load data 
	// TODO: use promises
	this.load = function (createRow, xcontentId, pkey, linkedUserAgent) {
		
		// Inizialise variables
		var url = "http://newvision-view.4me.it/api/xcontents/resources/delivery/getContentDetail";
		var param = { 
			"clientId": "newvision", 
			"xcontentId": xcontentId, 
			"pkey": pkey 
		};
		if (linkedUserAgent) { 
			$.extend( true, param, { "linkedUserAgent": linkedUserAgent } ); 
		}
		
		// Call services
		$.getJSON( url, param, function( data ) {
			console.log( "Reqested data:" );
			console.log(data);
			fill(data);
			createRow(that);
		}) 
		.fail(function(data) {
			console.log( "Error on request" );
			console.log(data);
		});
	};
	
	//
	// Private methods
	//
	
	// Put data into field
	function fill(data) {
		
		that.id = data.content.id;
		that.owner = data.content.owner; 				// Differenza rispetto a specifiche (content.contentType.owner)
		// Formato yyyy-mm-ddT17:48:36.017Z a dd/MM/yyyy hh:mm:ss
		var dateTmp = new Date(data.content.creationDate);
		var dateStr = padStr(dateTmp.getDate()) + '/' + padStr(1 + dateTmp.getMonth()) + '/' + padStr(dateTmp.getFullYear()) + ' ' +
                  padStr(dateTmp.getHours()) + ':' + padStr(dateTmp.getMinutes()) + ':' + padStr(dateTmp.getSeconds());
		that.creationDate = dateStr; 	// FIXME: creationDate must be in human readable formats.
		that.thumbnail = data.content.dynThumbService; 	// Differenza rispetto a specifiche (content.contentType.dynThumbService)
		that.contentType = data.content.contentType;
		
		// If not exists url, try to find in next record until first valid record
		if (typeof data.content.deliveryInfo != "undefined" && data.content.deliveryInfo != null && data.content.deliveryInfo.length > 0) {
			$.each(data.content.deliveryInfo, function(i, dInfo) {
				if (dInfo.contentUrl)
				{
					that.url = dInfo.contentUrl;
					that.thumbnails = dInfo.thumbsUrl;
					return false;
				}
			});
		}
		
		that.loaded = true;
		console.log( "Load Successfully:" + that.toString() );

	};
}

//
// Utilities
//

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}