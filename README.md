# Threadizer

Execute code within worker.

## Install
The project is [published on npm](https://www.npmjs.com/package/@threadizer/core)
```
npm install @theadizer/core
```

## Quick start
```javascript
import Threadizer from "@threadizer/core";

// ...

const subthread = new Threadizer(()=>{

	console.log("Executed within a Worker");

});

```

## Property

 - `worker`: the instance of [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker).
 
## Methods

### constructor( `application`, `extension` )
Leave `application` empty if you dont want the worker to be automaticaly created.

 - `application`: *(Function|URL)* **Optional** The application (Function) to run within the worker or the worker direct file itself.
 - `extension`: *(Function)* **Optional** Function launched to extends the worker-manager (add global methods, libraries, variables, ...).

### async setApplication( application, extension )
Prepare and run the application within the worker.
That method is called by the constructor if `application` is defined or you can call it at any moment.

 - `application`: *(Function|URL)* **Optional** The application (Function) to run within the worker or the worker direct file itself.
 - `extension`: *(Function)* **Optional** Function launched to extends the worker-manager (add global methods, libraries, variables, ...).

### transfer( `type`, `data`, `transferable` )
Send data as event from main thread to worker

 - `type`: *(String)* The name of the event to transfer to the worker.
 - `data`: *(Any)* **Optional** Data or content to transfer to the worker.
 - `transferable`: *(Array)* **Optional** List of [transferable](https://developer.mozilla.org/en-US/docs/Web/API/Transferable) objects if needed (Not needed for anything working with `JSON.stringify()`)

### reset()
Terminate the worker and start it again.

### destroy()
Terminate the worker.

### on( `type`, `action`, `options` )
Add event listener to the class.
 - `type`: *(String)* The name of the event to listen.
 - `action`: *(Function)* The action to run when event is dispatched.
 - `options`: *(Boolean|Object)* Prevent bubbling with `false` or make non-passive with `{ passive: false }` or make it callable once with `{ once: true }`.

### off( `type`, `action`, `options` )
Remove event listener from the class that match one or all parameters.
 - `type`: *(String)* The name of the event to remove.
 - `action`: *(Function)* **Optional** The action registered to the event.
 - `options`: *(Boolean|Object)* **Optional** The options registered to the event.

### dispatch( `type`, `options` )
Dispatch event to the class that match one or all parameters.
 - `type`: *(String)* The name of the event to remove.
 - `options`: *(Any)* **Optional** The options passed to the creation of the [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
