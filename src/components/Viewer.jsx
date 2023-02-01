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
	}, [props.src]);

	React.useEffect(() => {
		if (pdf) {
			document.getElementById("Viewer").innerHTML = `
			<button id="download-button">Download pdf</button>
			`;

			for (let i = 1; i <= pdf.numPages; i++) {
				const canvas = document.createElement("canvas");
				canvas.id = `page_${i}`;
				const ctx = canvas.getContext("2d");

				pdf.getPage(i).then((page) => {
					const viewport = page.getViewport({ scale: 1.5 , rotation: page._pageInfo.rotate});
					canvas.height = viewport.height;
					canvas.width = viewport.width;
					const renderContext = {
						canvasContext: ctx,
						viewport: viewport,
					};
					page.render(renderContext);
					console.log(page._pageInfo.rotate);
					document.getElementById("Viewer").append(document.createElement("br"));
					document.getElementById("Viewer").append(canvas);
					document.getElementById("Viewer").append(document.createElement("br"));
					if (i === pdf.numPages) {
						document.getElementById("Viewer").append(document.createElement("br"));
					}

					document.getElementById(`page_${i}`).addEventListener("click", () => {
						if(page._pageInfo.rotate === 270){
							page._pageInfo.rotate = 0;
						}
						else{
						page._pageInfo.rotate += 90;
						}
						const newViewPort = page.getViewport({ scale: 1.5, rotation: page._pageInfo.rotate});
						console.log(page._pageInfo.rotate);
						console.log(page.rotate);
						canvas.height = newViewPort.height;
						canvas.width = newViewPort.width;
						page.render({
							canvasContext: ctx,
							viewport: newViewPort,
						});
						// console.log(rotation);
					});

					// document.getElementById(`page_${i}`).addEventListener("click", () => {

					// })
				});
			}

			document.getElementById("download-button").addEventListener("click", () => {
				pdf.getData().then((data) => {
					console.log(data);
					const blob = new Blob([data], { type: "application/pdf" });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = "sample.pdf";
					link.click();
				});
			});
		}
	}, [pdf]);

	return (
		<div id="viewer-container">
			<div id="Viewer">

			</div>
		</div>
	);
}

export default Viewer;
