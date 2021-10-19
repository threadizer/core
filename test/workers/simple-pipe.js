thread.on("pipe", ({ detail: data, complete })=>{

	complete([...data].reverse().join(""));

});
