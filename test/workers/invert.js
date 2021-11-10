console.log("Job 'invert' started - worker: ", !!self.isWorker);

thread.on("pipe", ({ detail: imageData, complete })=>{

	for( let index = 0; index < imageData.data.length; index += 4 ){

		imageData.data[index + 0] = 255 - imageData.data[index + 0];
		imageData.data[index + 1] = 255 - imageData.data[index + 1];
		imageData.data[index + 2] = 255 - imageData.data[index + 2];
		// dont alter alpha

	}

	complete(imageData);

});
