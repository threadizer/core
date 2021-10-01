import Threadizer from "@/index.js";

document.addEventListener("DOMContentLoaded", async ()=>{

	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	const supports = canvas.transferControlToOffscreen instanceof Function;

	const offscreenCanvas = supports ? canvas.transferControlToOffscreen() : canvas;

	const threadA = await new Threadizer(window.location.href + "draw.worker.js", null, !supports);
	const threadB = await new Threadizer(window.location.href + "convert.worker.js", null, !supports);

	threadA.on("rendered", ( event )=>{

		console.log("MAIN THREAD - Canvas has been rendered");

		setTimeout(event.complete, 2000);

	});

	await threadA.transfer("canvas", offscreenCanvas);

	requestAnimationFrame(async ()=>{

		const img = new Image();

		canvas.toBlob(( blob )=> img.src = URL.createObjectURL(blob));

		document.body.appendChild(img);

		console.log("End");

	});

}, { once: true });
