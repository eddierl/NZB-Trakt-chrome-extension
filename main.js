


function getURL() {

	var minsize = 3000
	var maxsize = 13000
	var season = "";
	var episode= "";

	var header = document.getElementById("below-header").childNodes;

	var title	 =  "." + (header[1].textContent).replace(" ",".").replace("(","").replace(")","");

	// if there are episode data
	if (!(document.getElementById("below-header").childNodes[3].textContent=="")) {
		 var epinfo = header[3].textContent.substr(1).split("x");
		 season = "s" + ("00" + epinfo[0].trim()).slice(-2);
		 episode = "e" + ("00" + epinfo[1].trim()).slice(-2);
		 minsize = 400
		 maxsize = 3000;
	}
	var qadd = "720p | 1080p"
	var opts = "&minsize=" + minsize + "&maxsize=" + maxsize + "&hasnfo=1&complete=1";


	var query= encodeURIComponent(title + " " + season + " " + episode + " " + qadd) + opts
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
			
			if(infos.length>1) {
				var promptString = "";
				var labels = results.getElementsByTagName("label");
				/* get to the filesize */
				var tableBody = results.getElementsByTagName("tbody")[0];
				var rows = tableBody.getElementsByTagName("tr");
				for (var i = 0; labels[i] && (i < 5); i++) { // we only display the first 5 to choose from
					var row = rows[i];
					//sometimes there is an extra "tr" in the collection for "oldresults", ignore it
					if (!(row.hasAttribute("class")))
						continue;
					var column = row.getElementsByTagName("td")[2]; // file size in MB/GB
					var fileSize = column.getElementsByTagName("div")[0];
					
					promptString = promptString + (i + 1) + ") " + "(" + fileSize.textContent + ") " + labels[i].textContent + "\n";
					promptString = promptString + "--------------------------------------\n";

				}
				retVal = prompt("Choose NZB:\n" + promptString, "1");
			}
			var info = infos[retVal - 1];
			window.location.href = info.getElementsByTagName("div")[1].childNodes[1].href;			
		}
	  }
	}

	xhr.send();
}

function main() {

	var hideButton = "share";
	var node=document.getElementById(hideButton);
	var clone = node.cloneNode(true)
	clone.textContent="Download";

	clone.addEventListener("click" ,getURL);
	node.parentNode.appendChild(clone);

	node.setAttribute("style","display:none");
}

main();