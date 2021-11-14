console.log("pool worker");

thread.on("test", async ({ detail, complete })=>{

	console.log("pool worker tranfer test", detail);

	await new Promise(resolve => setTimeout(resolve, 1000));

	complete();

});
