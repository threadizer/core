export default function traverse( source, callback, parentKey = null ){

	callback(source, parentKey, source);

	for( let key in source ){

		if( source.hasOwnProperty(key) ){

			let value = source[key];

			if( value instanceof Object ){

				traverse(value, callback, key);

			}
			else {

				callback(value, parentKey, source);

			}

		}

	}

};
