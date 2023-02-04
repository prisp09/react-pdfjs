import React from "react";
import * as pdfjsLib from "pdfjs-dist";

import { PDFDocument, degrees, rgb } from "pdf-lib";

import "../styles/viewer.css";

function Viewer(props) {
	const [pdfRendered, setPdfRendered] = React.useState(false);
	const [pdf, setPdf] = React.useState();
	const [pdfObj, setPdfObj] = React.useState();

	const [rotation] = React.useState([]);

	const[savedText] = React.useState([]);

	React.useEffect(() => {
		// Load pdfjs object
		async function loadPDF() {
			pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
			await pdfjsLib.getDocument(props.src).promise.then((pdf_) => {
				setPdf(pdf_);
			});
		}

		// Load pdf-lib object
		async function loadPDFObj() {
			const existingPdfBytes = await fetch(props.src).then((res) => res.arrayBuffer());
			const pdfDoc = await PDFDocument.load(existingPdfBytes);
			setPdfObj(pdfDoc);
		}

		loadPDFObj();

		loadPDF();
	}, [props.src]);

	React.useEffect(() => {
		if (pdf && pdfObj) {
			document.getElementById("Viewer").innerHTML = `
			<br />
			<button id="download-button">Download pdf</button>
			<br />
			`;

			// Adding PDF pages with buttons to the DOM
			for (let i = 1; i <= pdf.numPages; i++) {
				const canvas = document.createElement("canvas");
				canvas.id = `page_${i}`;
				const ctx = canvas.getContext("2d");

				const rotateButton = document.createElement("button");
				rotateButton.id = `rotate_${i}`;
				rotateButton.innerHTML = "Rotate";

				const textButton = document.createElement("button");
				textButton.id = `text_${i}`;
				textButton.innerHTML = "Add Text";

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
					document.getElementById("Viewer").append(textButton);
					document.getElementById("Viewer").append(document.createElement("br"));
					document.getElementById("Viewer").append(canvas);
					document.getElementById("Viewer").append(document.createElement("br"));
					if (i === pdf.numPages) {
						document.getElementById("Viewer").append(document.createElement("br"));
					}

					// Adding event listeners to buttons
					// Rotate button
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

					// Text button
					document.getElementById(`text_${i}`).addEventListener("click", () => {
						const text = prompt("Enter text");
						if (text) {
							savedText[i-1] = text;
							const { width, height } = canvas;
							const textWidth = ctx.measureText(text).width;
							const textHeight = 20;
							ctx.fillStyle = "black";
							ctx.fillText(text, (width - textWidth) / 2, (height + textHeight) / 2 - 5);
						}
					});
				});
			}
			setPdfRendered(true);
		}
	}, [pdf]);

	React.useEffect(() => {
		if (pdfRendered) {
			document.getElementById("download-button").addEventListener("click", () => {
				const pages = pdfObj.getPages();
				for (let i = 0; i < pages.length; i++) {
					// Rotate pages in the pdf-lib object
					pages[i].setRotation(degrees(rotation[i]));

					// Add text to pages in the pdf-lib object
					if(savedText[i]) {
						pages[i].drawText(savedText[i], {
							x: pages[i].getWidth() / 2,
							y: pages[i].getHeight() / 2,
							size: 8,
							color: rgb(0, 0, 0)
						});
					}

				}
				// Download the pdf using the pdf-lib object
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
