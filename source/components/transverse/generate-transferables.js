export default function generateTransferable( data ){

	const traverse = self.traverse || require("@/components/transverse/traverse").default;

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
