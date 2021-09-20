import Threadizer from "@/index.js";

export default async ()=>{

	await new Threadizer(()=>{

		importScripts(location.origin + "/three.min.js");

		console.log(THREE);

	});

};
