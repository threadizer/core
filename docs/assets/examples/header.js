import Threadizer from "@/index.js";

export default async ( container )=>{

	const canvas = document.createElement("canvas");

	container.appendChild(canvas);

	// Convert Canvas into OffscreenCanvas
	const offscreenCanvas = canvas.transferControlToOffscreen();

	const thread = await new Threadizer(()=>{

		// Import ThreeJS WebGL library
		importScripts(location.origin + "/vendors/three.min.js");

		const duration = 1000;
		const delay = 1000;
		const rotation = 0.1;
		const translation = 0.05;

		let renderer = null;
		let camera = null;
		let group = null;
		let scene = null;
		let top = null;
		let bottom = null;
		let width = 0;
		let height = 0;
		let animationStart = 0;
		let animationPositionStart = new THREE.Vector3();
		let animationPositionEnd = new THREE.Vector3();
		let movePositionTarget = new THREE.Vector3();
		let moveRotationTarget = new THREE.Vector3();

		function generatePlane( colors ){

			const width = 0.25;
			const height = 0.5;
			const skew = 0.25;

			const vertices = new Float32Array([
				+width + skew, +height, 0,
				-width + skew, +height, 0,
				-width - skew, -height, 0,
				+width - skew, -height, 0
			]);

			const geometry = new THREE.BufferGeometry();

			geometry.setIndex([0, 1, 2, 3, 0, 2]);
			geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

			geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));

			for( let index = 0; index < colors.length; index++ ){

				geometry.attributes.color.setXYZ(index, colors[index].r, colors[index].g, colors[index].b);

			}

			const material = new THREE.MeshBasicMaterial({
				vertexColors: true,
				transparent: true,
				depthTest: false
			});

			material.blending = THREE.AdditiveBlending;

			const mesh = new THREE.Mesh(geometry, material);

			return mesh;

		}

		// Listen to the "canvas" event from main thread
		self.on("setCanvas", ({ detail: offscreenCanvas })=>{

			renderer = new THREE.WebGLRenderer({
				canvas: offscreenCanvas,
				alpha: true,
				antialias: true
			});

			renderer.setClearColor(0, 0);

			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10);
			camera.position.set(0, 0, 5);

			scene = new THREE.Scene();

			group = new THREE.Object3D();
			scene.add(group);

			top = generatePlane([
				new THREE.Color(0xFB7FAC),
				new THREE.Color(0xFA929E),
				new THREE.Color(0xF4C175),
				new THREE.Color(0xF2D461)
			]);

			bottom = generatePlane([
				new THREE.Color(0x0BD6FB),
				new THREE.Color(0x4DC9F8),
				new THREE.Color(0x90A7EF),
				new THREE.Color(0xA799EB)
			]);

			middle = generatePlane([
				new THREE.Color(0x90A7EF),
				new THREE.Color(0xA799EB),
				new THREE.Color(0xFB7FAC),
				new THREE.Color(0xFA929E)
			]);

			moving = generatePlane([
				new THREE.Color(0x90A7EF),
				new THREE.Color(0xA799EB),
				new THREE.Color(0xFB7FAC),
				new THREE.Color(0xFA929E)
			]); 

			group.add(top);
			group.add(middle);
			group.add(moving);
			group.add(bottom);

			setInterval(()=>{

				const random = Math.random() > 0.5;

				animationPositionStart = random ? top.position.clone() : bottom.position.clone();
				animationPositionEnd = random ? bottom.position.clone() : top.position.clone();

				moving.position.copy(animationPositionStart);

				animationStart = performance.now();

			}, 5000);

			function update(){

				requestAnimationFrame(update);

				const now = performance.now();

				if( now >= delay ){

					const progress = Math.min(1, (now - delay) / duration);

					const easeProgress = progress * (2 - progress);

					top.position.set(easeProgress * -0.05, easeProgress * 0.3, 0.2);
					bottom.position.set(easeProgress * 0.05, easeProgress * -0.3, -0.2);

					const animationProgress = Math.min(1, (now - animationStart) / duration);
					const animationEaseProgress = animationProgress < 0.5 ? (2 * animationProgress * animationProgress) : (-1 + (4 - 2 * animationProgress) * animationProgress);

					const animationDelta = animationPositionEnd.clone().sub(animationPositionStart).multiplyScalar(animationEaseProgress);

					moving.position.copy(animationPositionStart).add(animationDelta);

					moving.material.opacity = 1 - Math.abs(animationProgress * 2 - 1);

				}

				const postionDelta = movePositionTarget.clone().sub(group.position).divideScalar(6);

				group.position.add(postionDelta);

				const rotationDelta = moveRotationTarget.clone().sub(group.rotation.toVector3()).divideScalar(6);

				group.rotation.setFromVector3(rotationDelta);

				renderer.render(scene, camera);

			}

			requestAnimationFrame(update);

		});

		// Listen to the "mousemove" event from main thread
		self.on("move", ({ detail: move })=>{

			const x = -((move.clientX / width) * 2 - 1);
			const y = -((move.clientY / height) * 2 - 1);

			movePositionTarget.set(x * translation, -y * translation, 0);
			moveRotationTarget.set(y * rotation, x * rotation, 0);

		});

		// Listen to the "resize" event from main thread
		self.on("setSize", ({ detail: size })=>{

			width = size.width;
			height = size.height;

			renderer.setSize(size.width, size.height, false);
			renderer.setPixelRatio(size.pixelRatio);

			const frustum = 3;
			const aspect = size.width / size.height;

			camera.left = frustum * aspect / - 2;
			camera.right = frustum * aspect / 2;
			camera.top = frustum / 2;
			camera.bottom = frustum / - 2;

			camera.updateProjectionMatrix();

		});

	});

	// Transfer offscreencanvas to worker thread through a "setCanvas" event
	thread.transfer("setCanvas", offscreenCanvas, [offscreenCanvas]);

	// Transfer resize event to worker thread through a "setSize" event
	window.addEventListener("resize", ()=>{

		const { width, height } = container.getBoundingClientRect();

		thread.transfer("setSize", { width, height });

	});

	// Transfer mousemove event to worker thread through "move" event
	window.addEventListener("mousemove", ({ clientX, clientY })=>{

		thread.transfer("move", { clientX, clientY });

	});

	// Trigger resize event transfer to set initial canvas size
	window.dispatchEvent(new Event("resize"));

};
