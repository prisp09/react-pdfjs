import React from "react";
import * as pdfjsLib from "pdfjs-dist";

import "../styles/viewer.css";

function Viewer(props) {
	const [pdf, setPdf] = React.useState();

	React.useEffect(() => {
		async function loadPDF() {
			pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
			await pdfjsLib.getDocument(props.src).promise.then((pdf_) => {
				console.log(pdf_);
				setPdf(pdf_);
			});
		}
		loadPDF();
	}, []);

	React.useEffect(() => {
		if (pdf) {
			document.getElementById("Viewer").innerHTML = "";

			for (let i = 1; i <= pdf.numPages; i++) {
				const canvas = document.createElement("canvas");
				canvas.id = `page_${i}`;
				const ctx = canvas.getContext("2d");
				const viewport = pdf.getPage(i).then((page) => {

					const viewport = page.getViewport({ scale: 1.5 });
					canvas.height = viewport.height;
					canvas.width = viewport.width;
					const renderContext = {
						canvasContext: ctx,
						viewport: viewport,
					};
					page.render(renderContext);
					document.getElementById("Viewer").append(document.createElement("br"));
					document.getElementById("Viewer").append(canvas);
					document.getElementById("Viewer").append(document.createElement("br"));
					if(i === pdf.numPages) {
						document.getElementById("Viewer").append(document.createElement("br"));
					}

					document.getElementById(`page_${i}`).addEventListener("click", () => {
						document.getElementById(`page_${i}`).classList.toggle("selected");
					});

					// document.getElementById(`page_${i}`).addEventListener("click", () => {

					// })
				});
			}
		}
	}, [pdf]);

	return (
		<div id="viewer-container">
			<div id="Viewer"></div>
		</div>
	);
}

export default Viewer;
