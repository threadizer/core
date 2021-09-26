import Threadizer from "@/index.js";

document.addEventListener("DOMContentLoaded", async ()=>{

	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	const supports = canvas.transferControlToOffscreen instanceof Function;

	const offscreenCanvas = supports ? canvas.transferControlToOffscreen() : canvas;

	const thread = await new Threadizer(window.location.href + "worker.js", null, !supports);

	thread.on("rendered", ( event )=>{

		console.log("MAIN THREAD - Canvas has been rendered");

		setTimeout(event.complete, 2000);

	});

	await thread.transfer("canvas", offscreenCanvas);

	requestAnimationFrame(async ()=>{

		const img = new Image();

		canvas.toBlob(( blob )=> img.src = URL.createObjectURL(blob));

		document.body.appendChild(img);

		console.log("End");

	});

}, { once: true });
