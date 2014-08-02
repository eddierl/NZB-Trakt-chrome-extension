
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function getURL() {

	var minsize = 3000
	var maxsize = 13000
	var season = "";
	var episode= "";

	var header = document.getElementById("below-header").childNodes;

	// replace(/ /g, " .") - will replace ALL instances of " " to " ."
	var title	 =  "." + (header[1].textContent).replace(/ /g, " .").replace("(","").replace(")","");
	//window.alert(title);
	// if there is episode data
	if (!(document.getElementById("below-header").childNodes[3].textContent=="")) {
		 var epinfo = header[3].textContent.substr(1).split("x");
		 season = "s" + ("00" + epinfo[0].trim()).slice(-2);
		 episode = "e" + ("00" + epinfo[1].trim()).slice(-2);
		 minsize = 400
		 maxsize = 3000;
	}
	var qadd = "720p | 1080p"
	var opts = "&minsize=" + minsize + "&maxsize=" + maxsize;


	var query= encodeURIComponent(title + " " + season + episode + " " + qadd) + opts
	//window.alert(query);
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://nzbindex.nl/search/?q=" + query, true);
	 console.log("http://nzbindex.nl/search/?q=" + query);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		
		var parser=new DOMParser();
		var res=parser.parseFromString(xhr.responseText,"text/html");
		var results = res.getElementById("results");
		if(results.innerHTML.indexOf("No results found") != -1){
			window.alert("Sorry, no results :(");
		}
		else { // result found
			var infos = results.getElementsByClassName("info");
			var retVal = 1;
			
			if(infos.length >= 1) {
				
				var labels = results.getElementsByTagName("label");
				var tableBody = results.getElementsByTagName("tbody")[0];
				var rows = tableBody.getElementsByTagName("tr");
				var promptString = "";
				
				for (var i = 0; labels[i] && (i < 5); i++) { // we only display the first 5 to choose from
					var row = rows[i];

					//sometimes there is an extra "tr" in the collection for "oldresults", ignore it
					if (!(row.hasAttribute("class"))) {
						rows[i].parentNode.removeChild(row); // delete this useless row
						i--;
						continue;
					}

					// check if password protected
					if(row.innerHTML.indexOf("Password protected") != -1){
						// we don't want password protected files
						rows[i].parentNode.removeChild(row); // delete this useless row
						i--;
						continue;
					}

					//check if it has a NFO file
					var nfo = "";
					if(row.innerHTML.indexOf("NFO") != -1){
						nfo = "[NFO] ";
					}

					// get file size in MB/GB
					var column = row.getElementsByTagName("td")[2];
					var fileSize = column.getElementsByTagName("div")[0];

					// get file age (days ago)
					var fileAge = row.getElementsByTagName("td")[4]; // 
					fileAge = "[" + fileAge.textContent.trim() + "] ";

					// extract current listing and filter it (get only the text within the double quotes)
					var listing = labels[i].textContent.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
					// fotmat listing (replace dots and dashes, with spaces)
					listing = toTitleCase(listing.replace(/\.|-/g, " "))
					// more filters (remove common words):
					listing = listing.replace("Nzb", "").replace("Nfo", "").replace("Par2", "").replace("Hdtv", "");
					listing = listing.replace("X264", "").replace("264", "").replace("Sample", "").replace("Mkv", "");

					// get file resolution (from listing)
					var resolution = "";
					if (listing.indexOf("720p") != -1) {
						resolution = "[720p] ";
						listing = listing.replace("720p", "");
					}
					else if (listing.indexOf("1080p") != -1) {
						resolution = "[1080p] ";
						listing = listing.replace("1080p", "");
					}

					// check for missing blocks
					var missing = "";
					var infoHtml = infos[i].innerHTML;
					var startMissing = infoHtml.indexOf(", ");
					var endMissing = infoHtml.indexOf(")", startMissing);
					if (startMissing != -1)  {// we found missing blocks
						missing = "[" + infoHtml.substr(startMissing + 2, endMissing - 2 - startMissing) + "] ";
					}

					// generate a prompt string
					promptString = promptString + "(" + (i + 1) + ")  " + listing + "\n" + "[" + fileSize.textContent + "] ";
					promptString = promptString + fileAge + resolution + nfo + missing;
					promptString = promptString + "\n--------------------------------------------------\n";

				}
				if (i == 0) { // i will be zero, if we deleted unused rows.
					window.alert("Sorry, no results :(");
					return;
				}
				retVal = prompt("Choose NZB:\n\n" + promptString, "1");
			}
			if (retVal != null) {  // user didn't click "Cancel"
				if (retVal > 0 && retVal <= infos.length) { // user selected a valid option
					var info = infos[retVal - 1];
					window.location.href = info.getElementsByTagName("div")[1].childNodes[1].href;
				}
				else {  // user selected invalid option
					alert("Invalid selection number!");
				}
			}
		}
	  }
	}

	xhr.send();
}

function main() {

	var hideButton = "share";
	var node=document.getElementById(hideButton);
	
	//reposition
	node.parentNode.appendChild(node);
	
	var clone = node.cloneNode(false);
	node.parentNode.replaceChild(clone,node);
	
	clone.textContent="Download";
	clone.addEventListener("click" ,getURL);
	
		
}



main();