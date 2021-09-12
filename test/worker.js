self.on("canvas", ({ detail: canvas })=>{

	const context = canvas.getContext("2d");

	context.fillRect(0, 0, canvas.width, canvas.height);

	Object.assign(context, {
		fillStyle: "#FFF",
		font: "13px sans-serif",
		textAlign: "center",
		textBaseline: "middle"
	});

	context.fillText("OffscreenCanvas painted within a subthread", canvas.width / 2, canvas.height / 2, canvas.width);

});
