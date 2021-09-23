export default async ( unmout )=>{

	console.log("begin performance-main-thread");
	console.time("performance-main-thread");

	const array = new Array();

	let abort = false;

	for( let index = 0; index < 1e4; index++ ){

		if( abort ) break;

		array[index] = Math.random();

		array.sort();

	}

	unmout();

	console.timeEnd("performance-main-thread");

	return {
		element: null,
		destroy: ()=>{

			console.log("abort");

			abort = true;

		}
	};

};
