import Threadizer, { Stream } from "@/index.js";

document.addEventListener("DOMContentLoaded", async ()=>{

	// Canvas drawing
	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	const supports = canvas.transferControlToOffscreen instanceof Function;

	const offscreenCanvas = supports ? canvas.transferControlToOffscreen() : canvas;

	const mainThread = await new Threadizer(window.location.href + "main.worker.js", null, !supports);

	mainThread.transfer("setup-canvas", offscreenCanvas);

	// Simple text stream
	const textStream = new Stream("hello world!");

	const textThread = await new Threadizer(window.location.href + "simple-pipe.worker.js");

	const results = await textStream.pipe(textThread).pipe(textThread);

	console.log("RESULTS --->", results); // Output "hello wolrd!"

}, { once: true });