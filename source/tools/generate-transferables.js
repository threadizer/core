export default function( data ){

	function traverse( source, callback, parentKey = null ){

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

	}

	function isTransferable( value ){

		try {

			return value instanceof ArrayBuffer || value instanceof MessagePort || value instanceof ImageBitmap || value instanceof OffscreenCanvas;

		}
		catch( error ){

			return false;

		}

	}

	const transferable = new Array();

	traverse(data, ( value )=>{

		if( isTransferable(value) ){

			transferable.push(value);

		}

	});

	return transferable;

}
