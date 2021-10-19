import Threadizer from "@/index.js";

document.addEventListener("DOMContentLoaded", async ()=>{

	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	const supports = canvas.transferControlToOffscreen instanceof Function;

	const offscreenCanvas = supports ? canvas.transferControlToOffscreen() : canvas;

	const mainThread = await new Threadizer(window.location.href + "main.worker.js", null, !supports);

	mainThread.transfer("setup-canvas", offscreenCanvas);

	// const linkThread = await Threadizer.link(window.location.href + "link.worker.js");

	// linkThread.log();

	// console.log("THREAD RETURNED", linkThread);

	const textStream = Threadizer.createStream("hello world!");

	const textThread = await new Threadizer(window.location.href + "simple-pipe.worker.js");

	const results = await textStream.pipe(textThread).pipe(textThread);

	console.log("RESULTS --->", results); // Output "hello wolrd!"

}, { once: true });
