export default function traverse( source, callback ){

	function parse( source, callback, key, memory ){

		memory = callback(source, key, memory);

		for( let key in source ){

			const value = source[key];

			if( value instanceof Object ){

				parse(value, callback, key, memory);

			}
			else {

				callback(value, key, memory);

			}

		}

	}

	return parse(source, callback);

}
