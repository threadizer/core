export default function generateStructure( object ){

	const traverse = self.traverse || require("@/components/transverse/traverse").default;

	const structure = {
		__path__: [],
		__type__: typeof source
	};

	traverse(object, ( value, key, memory = new Array() )=>{

		if( key ){

			memory = Array.from(memory);
			memory.push(key);

			let target = structure;

			for( let index = 0; index < memory.length; index++ ){

				const chunk = memory[index];

				if( !target[chunk] ){

					target[chunk] = {
						__type__: value.constructor.name.toLowerCase() || typeof value,
						__path__: memory
					};

				}

				target = target[chunk];

			}

		}

		return memory;

	});

	return structure;

};
