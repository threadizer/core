export default function proxify( source, callbacks = {}, origin = null ){

	const { onGet, onSet, onConstruct, onApply } = callbacks;

	function resolveValue( target, property ){

		console.log("resolve", target, property);

	};

	return new Proxy(source, {
		get( target, property ){

			const value = Reflect.get(target, property);

			if( value instanceof Object ){

				return proxify(value, callbacks);

			}
			else {

				const realValue = resolveValue(target, property);

				return onGet ? onGet(value) : value;

			}

		},
		set( target, property, value ){

			return onSet(target, property, value);

		},
		construct( target, property ){

			console.log("proxy construct", target, property);	

		},
		apply( target, property ){

			console.log("proxy apply", target, property);

		}
	});

};
