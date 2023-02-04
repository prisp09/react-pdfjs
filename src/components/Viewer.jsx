import React from "react";
import * as pdfjsLib from "pdfjs-dist";

import { PDFDocument, degrees } from "pdf-lib";

import "../styles/viewer.css";

function Viewer(props) {
	const [pdfRendered, setPdfRendered] = React.useState(false);
	const [pdf, setPdf] = React.useState();
	const [pdfObj, setPdfObj] = React.useState();

	//an array of rotation values for each page that can be use by all useEffects
	const [rotation] = React.useState([]);

	React.useEffect(() => {
		async function loadPDF() {
			pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
			await pdfjsLib.getDocument(props.src).promise.then((pdf_) => {
				setPdf(pdf_);
			});
			const existingPdfBytes = await fetch(props.src).then((res) => res.arrayBuffer());
			const pdfDoc = await PDFDocument.load(existingPdfBytes);
			setPdfObj(pdfDoc);
		}
		loadPDF();
	}, [props.src]);

	React.useEffect(() => {
		if (pdf && pdfObj) {
			document.getElementById("Viewer").innerHTML = `
			<button id="download-button">Download pdf</button>
			`;

			for (let i = 1; i <= pdf.numPages; i++) {
				const canvas = document.createElement("canvas");
				canvas.id = `page_${i}`;
				const ctx = canvas.getContext("2d");

				const rotateButton = document.createElement("button");
				rotateButton.id = `rotate_${i}`;
				rotateButton.innerHTML = "Rotate";

				pdf.getPage(i).then((page) => {
					rotation.push(page._pageInfo.rotate);
					const viewport = page.getViewport({ scale: 1.5, rotation: page._pageInfo.rotate });
					canvas.height = viewport.height;
					canvas.width = viewport.width;
					const renderContext = {
						canvasContext: ctx,
						viewport: viewport,
					};
					page.render(renderContext);
					document.getElementById("Viewer").append(document.createElement("br"));
					document.getElementById("Viewer").append(rotateButton);
					document.getElementById("Viewer").append(document.createElement("br"));
					document.getElementById("Viewer").append(canvas);
					document.getElementById("Viewer").append(document.createElement("br"));
					if (i === pdf.numPages) {
						document.getElementById("Viewer").append(document.createElement("br"));
					}

					document.getElementById(`rotate_${i}`).addEventListener("click", () => {
						page._pageInfo.rotate = (page._pageInfo.rotate + 90) % 360;
						rotation[i - 1] = page._pageInfo.rotate;
						const newViewPort = page.getViewport({ scale: 1.5, rotation: page._pageInfo.rotate });
						canvas.height = newViewPort.height;
						canvas.width = newViewPort.width;
						page.render({
							canvasContext: ctx,
							viewport: newViewPort,
						});
					});
				});
			}
			setPdfRendered(true);
		}
	}, [pdf]);

	React.useEffect(() => {
		if (pdfRendered) {
			console.log("pdf rendered");
			document.getElementById("download-button").addEventListener("click", () => {
				console.log("download button clicked");
				console.log(pdfObj);
				console.log(pdf);
				const pages = pdfObj.getPages();
				console.log(pages);
				for(let i=0;i<pages.length;i++){
					pages[i].setRotation(degrees(rotation[i]));
				}
				pdfObj.save().then((_pdfBytes) => {
					const blob = new Blob([_pdfBytes], { type: "application/pdf" });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = "download.pdf";
					link.click();
				});
			});
		}
	}, [pdfRendered]);

	return (
		<div id="viewer-container">
			<div id="Viewer"></div>
		</div>
	);
}

export default Viewer;
