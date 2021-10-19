console.log("WORKER RUN", self);

class ExposedClass {
	#privateVar = "secret";
	constructor(){

		this.name = "ExposedClass";

	}
	log(){

		this.#privateLog();

	}
	length(){

		return "empty";

	}
	#privateLog(){

		console.log("private ExposedClass log");

	}
	static live(){

		return true;

	}
};

thread.link(ExposedClass);
