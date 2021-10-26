import Threadizer from "@/index.js";

console.log("main.js");

(async ()=>{

	class ExposedClass {
		#privateVar = "secret";
		constructor( parameter = "default" ){

			this.all = {
				parameter,
				custom: {
					events: new Array()
				}
			};

		}
		log( message ){

			this.#privateLog(message);

		}
		#privateLog( message ){

			console.log("class log", message);

		}
		static staticLog(){

			console.log("static log");

		}
	}

	// thread.link(ExposedClass);

	const obj = {
		hello(){

			console.log("hello");

		},
		test: {
			subtest: {
				deep: true
			}
		},
		array: ["content1", "content2"]
	};

	const prox = thread.link(obj);

	console.log("PROX ?", prox.hello);

})();

// thread.on("setup-canvas", async ({ detail: canvas, complete })=>{

// 	const stream = Threadizer.createStream(canvas);

// 	const drawThread = await new Threadizer(self.location.origin + "/draw.worker.js");
// 	const invertThread = await new Threadizer(self.location.origin + "/invert.worker.js");

// 	await stream.pipe(drawThread).pipe(invertThread).pipe(drawThread);

// 	complete();

// });
