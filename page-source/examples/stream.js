import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const randomData = window.btoa(window.location.href);

	const stream = Threadizer.createStream(randomData);

	const resolveThread = await new Threadizer(()=>{

		self.on("pipe", ({ detail, complete })=>{

			console.log("resolve pipe");

			complete(self.atob(detail));

		});

	});

	const fetchThread = await new Threadizer(()=>{

		self.on("pipe", ({ detail, complete })=>{

			console.log("fetch pipe");

			const output = new Object();

			fetch(detail).then(( response )=>{

				output.ok = response.ok;
				output.url = response.url;
				output.type = response.type;
				output.status = response.status;
				output.redirected = response.redirected;
				output.redirected = response.redirected;

				return response.text();

			}).then(( text )=>{

				output.content = text;

				complete(output);

			});

		});

	});

	const page = await stream.pipe(resolveThread).pipe(fetchThread);

	console.log(page);

	unmount();

	return {
		destroy: ()=>{

			unmount();

		}
	};

};
