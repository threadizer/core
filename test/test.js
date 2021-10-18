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

}, { once: true });
