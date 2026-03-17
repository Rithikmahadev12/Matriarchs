function updateFavicon(href) {
	if (!href) return;
	let link = document.querySelector("link[rel~='icon']");
	if (!link) {
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
	}
	link.href = href;
}
function applyStoredValues() {
	const savedTitle = localStorage.getItem("pageTitle");
	if (savedTitle) document.title = savedTitle;

	updateFavicon(localStorage.getItem("pageFavicon"));

	const backgroundURL = localStorage.getItem("backgroundURL");
	if (backgroundURL) {
		document.documentElement.style.setProperty(
			"--backgroundURL",
			`url(${backgroundURL})`
		);
	}
}

function loadAntiClose() {
	let xyz = localStorage.getItem("checkAntiClose");
	if (xyz == "true") {
		window.addEventListener("beforeunload", function(event) {
			event.preventDefault();
			event.returnValue =
				"This maessage prevents teachers from closing the tab";
		});
		localStorage.setItem("checkAntiClose", "true");
	} else {
		localStorage.setItem("checkAntiClose", "false");
	}
}
function updateName() {
	let x = localStorage.getItem("name");

	document.querySelector(".userName").textContent = x;
}



function updateGlassmorphismDarkness() {
	let opacityValue = localStorage.getItem("glassDarknessStore") || "0.432";
	const newGlassmorphismBG = `rgba(14, 13, 13, ${opacityValue})`;
	document.documentElement.style.setProperty(
		"--glassmorphismBG",
		newGlassmorphismBG
	);
}

window.addEventListener("storage", (event) => {
	switch (event.key) {
		case "pageTitle":
			if (event.newValue) document.title = event.newValue;
			break;
		case "pageFavicon":
			updateFavicon(event.newValue);
			break;
		case "backgroundURL":
			document.documentElement.style.setProperty(
				"--backgroundURL",
				`url(${event.newValue})`
			);
			break;
		case "glassDarknessStore":
			updateGlassmorphismDarkness();
			break;
		case "checkAntiClose":
			loadAntiClose();
			break;
		case "name":
			updateName();
			break;
	}
});

document.addEventListener("DOMContentLoaded", applyStoredValues);
document.addEventListener("DOMContentLoaded", updateGlassmorphismDarkness);
const currentSiteUrl = window.location.origin;
function launchBlob() {
	const htmlContent = `
    <html>
      <head>
            <title>Classroom</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/classroom/favicon.png">
        <style>
          body,
          html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          iframe {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="${currentSiteUrl}/x.html"></iframe>
      </body>
    </html>
	`;

	const blob = new Blob([htmlContent], {
		type: "text/html",
	});

	const blobUrl = URL.createObjectURL(blob);

	open(blobUrl);
}

function aboutBlank() {
	var y = window.open("about:blank");
	y.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
            <title>Classroom</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/classroom/favicon.png">
        </head>
        <body>
          <iframe src="${currentSiteUrl}/x.html"></iframe>
        </body>
        <style>
    body,iframe {
    background: #000;

    height: 100vh;
    width: 100vw;
    overflow: hidden;
    border: 0px;
    margin: 0px;
    }
    </style>
      </html>
    `);
	y.document.close();
}

window.auto = () => {
	if (localStorage.getItem("autoBlob") === "true") {
		launchBlob();
	}

	if (localStorage.getItem("autoAbout") === "true") {
		aboutBlank();
		location.replace(
			"https://lightingshovestature.com/tq5s28ueku?key=787c4f20eb8c6e759c73a4963748ab1c",
		);
	}
}
