import Threadizer, { Stream, Pool } from "@/index.js";

async function runExternalScript( containerSelector, inMainThread = false ){

	const container = document.querySelector(containerSelector);

	const canvas = document.createElement("canvas");

	container.appendChild(canvas);

	const supports = !inMainThread && canvas.transferControlToOffscreen instanceof Function;

	const offscreenCanvas = supports ? canvas.transferControlToOffscreen() : canvas;

	const thread = await new Threadizer(window.location.href + "main.worker.js", null, !supports);

	thread.transfer("setup-canvas", offscreenCanvas);

};

async function  runInlineScript( containerSelector, inMainThread ){

	const container = document.querySelector(containerSelector);

	const canvas = document.createElement("canvas");

	container.appendChild(canvas);

	const supports = !inMainThread && canvas.transferControlToOffscreen instanceof Function;

	const offscreenCanvas = supports ? canvas.transferControlToOffscreen() : canvas;

	const thread = await new Threadizer(()=>{

		thread.on("setup-canvas", ({ detail: canvas })=>{

			const context = canvas.getContext("2d");

			context.fillRect(0, 0, canvas.width, canvas.height);

			Object.assign(context, {
				fillStyle: "#FFF",
				font: "13px sans-serif",
				textAlign: "center",
				textBaseline: "middle"
			});

			const text = thread.isWorker ? "OffscreenCanvas painted within a worker" : "OffscreenCanvas painted within main thread";

			context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width);

		});

	}, null, !supports);

	thread.transfer("setup-canvas", offscreenCanvas);

};

async function runTextScript( inMainThread = false){

	const textStream = new Stream("hello world!");

	const textThread = await new Threadizer(window.location.href + "simple-pipe.worker.js", null, inMainThread);

	const results = await textStream.pipe(textThread).pipe(textThread).pipe(textThread);

	console.log("OUTPUT RESULTS --->", results); // Output "!dlrow olleh"

};

async function runTextScriptClone( inMainThread = false){

	const textStream = new Stream("hello world!", false);

	const textThread = await new Threadizer(window.location.href + "simple-pipe.worker.js", null, inMainThread);

	textStream.pipe(textThread);

	const clone = await textStream.clone();

	const results = await clone.run();

	console.log("OUTPUT RESULTS CLONE --->", results); // Output "!dlrow olleh"

};

async function runCloneScript( inMainThread = false ){

	const thread = await new Threadizer(()=>{

		console.log("Job - 'clone' started", !!self.isWorker);

	}, null, inMainThread);

	await thread.clone();

};

async function runPoolScript( inMainThread = false ){

	const thread = await new Threadizer(window.location.href + "pool.worker.js", null, inMainThread);

	const pool = await new Pool(thread);

	for( let index = 0; index < 10; index++ ){

		pool.transfer("test", { index, inMainThread });

	};

}

async function runAddLibraryScript( inMainThread = false ){

	await Threadizer.addLibrary(()=>{

		self.THREE = {
			"library": true
		};

	});

	await new Threadizer(()=>{

		console.log("=>", self.THREE, self.TEST);

	}, ()=>{

		self.TEST = { extension: true };

	}, inMainThread);

}

document.addEventListener("DOMContentLoaded", async ()=>{

	// Canvas drawing
	runExternalScript("#ExternalWorker");
	runExternalScript("#ExternalMain", true);

	runInlineScript("#InlineWorker");
	runInlineScript("#InlineMain", true);

	// Simple text stream
	runTextScript();
	runTextScript(true);

	// Simple text stream clone
	runTextScriptClone();
	runTextScriptClone(true);

	// Cloning
	runCloneScript();
	runCloneScript(true);

	// Pool
	runPoolScript();
	runPoolScript(true);

	// Add library
	runAddLibraryScript();
	runAddLibraryScript(true);

	// Freeze button
	const button = document.querySelector("button");

	function freeze(){

		console.log("Freezing");

		const array = new Array();

		for( let index = 0; index < 1e4; index++ ){

			array[index] = Math.random();

			array.sort();

		}

		button.addEventListener("click", freeze, { once: true });

	}

	button.addEventListener("click", freeze, { once: true });

}, { once: true });
