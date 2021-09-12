import Threadizer from "@/index.js";

document.addEventListener("DOMContentLoaded", async ()=>{

	const canvas = document.createElement("canvas");

	document.body.appendChild(canvas);

	const offscreenCanvas = canvas.transferControlToOffscreen();

	const thread = await new Threadizer(window.location.href + "worker.js");

	// const thread = await new Threadizer(()=>{

	// 	self.on("canvas", ({ detail: canvas })=>{

	// 		const context = canvas.getContext("2d");

	// 		context.fillRect(0, 0, canvas.width, canvas.height);

	// 		Object.assign(context, {
	// 			fillStyle: "#FFF",
	// 			font: "13px sans-serif",
	// 			textAlign: "center",
	// 			textBaseline: "middle"
	// 		});

	// 		context.fillText("OffscreenCanvas painted within a subthread", canvas.width / 2, canvas.height / 2, canvas.width);

	// 	});

	// });

	thread.transfer("canvas", offscreenCanvas, [offscreenCanvas]);

}, { once: true });
