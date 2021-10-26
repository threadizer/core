export default function proxify( source, callbacks = {} ){

	const { onGet, onSet, onConstruct, onApply } = callbacks;

	return new Proxy(source, {
		get( target, property ){

			const value = Reflect.get(target, property);

			const realValue = resolveValue(value);

			console.log(value, realValue);

			if( value instanceof Object ){

				return proxify(value, callbacks);

			}
			else {

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
