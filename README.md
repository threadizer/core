[![npm](https://img.shields.io/npm/v/@threadizer/core?label=version&style=for-the-badge)](https://www.npmjs.com/package/@threadizer/core)
![](https://img.shields.io/node/v/@threadizer/core?label=node%20engine&style=for-the-badge)
![](https://img.shields.io/bundlephobia/minzip/@threadizer/core?label=size&style=for-the-badge)

<p align="center">
	<img src="https://github.com/threadizer/core/blob/github-page/page-source/assets/images/logo.png?raw=true" alt="Image" width="128" style="display: block; margin: 0 auto" />
</p>

# Threadizer

Run code within a worker (or main-thread as fallback).

The package is [published on npm](https://www.npmjs.com/package/@threadizer/core), [sources](https://github.com/threadizer/core) and [documentation](https://github.com/threadizer/core/wiki) are available on github.

## Quick start

```javascript
import Threadizer from "@threadizer/core";

// ...

const thread = await new Threadizer(( thread )=>{

	console.log("Worker initialized", thread);

	thread.on("any-event", ({ detail: data, complete })=>{

		console.log("Processing data", data);

		//...

		complete(data);

	});

});

const results = await thread.transfer("any-event", someData);
```

More examples are available on the [demo page](https://threadizer.github.io/core/) and the full documentation is in [the wiki](https://github.com/threadizer/core/wiki)
