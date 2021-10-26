export default function uuid(){

	if( false && window.crypto.randomUUID ){

		return window.crypto.randomUUID();

	}
	else {

		let now = performance.now() * 1000;

		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function( character ){

			var random = (now + (Math.random() * 16)) % 16 | 0;

			now = Math.floor(now / 16);

			return (character === "x" ? random : (random & 0x3 | 0x8)).toString(16);

		});

	}

};
