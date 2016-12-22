var Defmech = Defmech || {};

Defmech.Main = (function() {
	// Should scene show helpers
	var USE_HELPERS = false;

	// scene vars
	var scene, camera, renderer, orbitControls;

	// canvas capture vars
	var canvasImageData;
	var getCanvasImageData = false;
	var ONCE = 'once';

	// texture vars
	var textureBumpMapLoader, textureMapBump;


	// Capture
	var capturer = new CCapture({
		format: 'webm'
	});
	var isCapturing = false;

	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = -Defmech.Utils.randomRange(300, 500);
		camera.position.y = Defmech.Utils.randomRange(300, 500);
		camera.position.z = Defmech.Utils.randomRange(300, 500);

		camera.lookAt(0, 0, 0);

		// init renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		document.body.appendChild(renderer.domElement);

		// add controls
		orbitControls = new THREE.OrbitControls(camera, renderer.domElement);


		// add window resize handler
		window.addEventListener('resize', onWindowResize, false);

		// load images
		textureBumpMapLoader.load('./img/texture.png', function(texture) {
			textureMapBump = texture;
			init();
		});

		if (USE_HELPERS) scene.add(new THREE.AxisHelper(300));
	}

	function init() {

		// add content
		addFloor();
		addSkyBox();
		addLighting();
		addMesh();

		// init keyboard listener
		initKeyboard();
	}

	function handleKeyboardR(event) {
		if (!isCapturing) {
			isCapturing = true;
			capturer.start();
			console.log('Main.js', 'Started recording... ');

		} else {
			isCapturing = false;
			capturer.stop();

			// default save, will download automatically a file called {name}.extension (webm/gif/tar)
			capturer.save();
			console.log('Main.js', 'Ended recording... ');
		}
	}

	function initKeyboard() {
		// listen for keystrokes
		document.body.addEventListener("keyup", function(event) {
			// console.info('event.keyCode', event.keyCode);

			switch (event.keyCode) {
				case 80: // p
					exportCanvasImageDataToPNG();
					break;
				case 82: // r
					handleKeyboardR();
					break;
			}
		});
	}

	// gets image data 
	function exportCanvasImageDataToPNG() {
		getCanvasImageData = true;
		render(ONCE);

		var win = window.open("", "Canvas Image");
		var canvas = renderer.domElement;
		var src = canvas.toDataURL("image/png");

		win.document.write("<img src='" + canvasImageData + "' width='" + canvas.width + "' height='" + canvas.height + "'/>");
	}

	function onWindowResize() {
		// Update camera and renderer
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function addLighting() {
		// Add a light
		var light1 = new THREE.DirectionalLight(0xffffff, 0.5);
		light1.position.set(Defmech.Utils.randomRange(300, 500), Defmech.Utils.randomRange(300, 500), Defmech.Utils.randomRange(300, 500));

		light1.target.position.set(0, 0, 0);
		// Shadow
		var shadowSize = 1024;

		light1.castShadow = true;
		light1.shadow.mapSize.width = shadowSize * 2;
		light1.shadow.mapSize.height = shadowSize * 2;
		light1.shadow.camera.near = 400;
		light1.shadow.camera.far = 1300;
		light1.shadow.camera.left = -shadowSize / 2;
		light1.shadow.camera.right = shadowSize / 2;
		light1.shadow.camera.top = shadowSize / 2;
		light1.shadow.camera.bottom = -shadowSize / 2;

		scene.add(light1);

		// add another spotlight
		var light2 = new THREE.DirectionalLight(0xffffff, 0.125);
		light2.position.set(Defmech.Utils.randomRange(-300, -500), Defmech.Utils.randomRange(-300, -500), Defmech.Utils.randomRange(-300, -500));
		light2.target.position.set(0, 0, 0);
		scene.add(light2);

		// helper
		if (USE_HELPERS) {
			scene.add(new THREE.DirectionalLightHelper(light1));
			scene.add(new THREE.DirectionalLightHelper(light2));
			scene.add(new THREE.CameraHelper(light1.shadow.camera));
		}

		// Add and additional AmbientLight
		// scene.add(new THREE.AmbientLight(0xAAAAAA));
		scene.add(new THREE.AmbientLight(0x222222));
	}

	function addFloor() {
		var floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			shading: THREE.FlatShading,
			emissive: 0x666666,
			specular: 0x111111,
			shininess: 30,
		});

		var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -(200 / 2);
		scene.add(floor);
	}

	function addSkyBox() {
		var skyBoxWidth = 2000;
		var skybox = new THREE.Mesh(new THREE.BoxGeometry(skyBoxWidth, skyBoxWidth, skyBoxWidth), new THREE.MeshBasicMaterial({
			// color: 0xBBBBBB,
			color: new THREE.Color('hsl(354, 7%, 71%)'),
			// HSL(354, 7%, 71%)
			side: THREE.BackSide,
		}));
		skybox.receiveShadow = true;
		scene.add(skybox);
	}

	function addMesh() {
		// create a cube and add it to scene
		var geometry = new THREE.BoxGeometry(200, 200, 200);

		var material = new THREE.MeshPhongMaterial({
			color: 0xff0000,
			shading: THREE.FlatShading,
			bumpMap: textureMapBump,
			bumpScale: 0.5
		});

		var mesh = new THREE.Mesh(geometry, material);
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		// give it some random rotation
		// mesh.rotation.y = Defmech.Utils.degToRad(Defmech.Utils.randomRange(45, 60));

		// Add mesh to scene
		scene.add(mesh);
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		renderer.clear();
		renderer.render(scene, camera);
		orbitControls.update();

		capturer.capture(renderer.domElement);

		if (getCanvasImageData === true) {
			canvasImageData = renderer.domElement.toDataURL();
			getCanvasImageData = false;
		}
	}

	return {
		init: function() {
			setup();
			render();
		}
	};
})();