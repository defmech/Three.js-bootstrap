if (Defmech.WebGLDetect.canProceed)
{
	// If WebGL is available to use then we load our libraries.
	LazyLoad.js(
		[
			"//cdnjs.cloudflare.com/ajax/libs/three.js/r83/three.min.js",
			"./js/vendor/OrbitControls.js",
			"./js/vendor/CCapture.all.min.js",
			"./js/Utils.js",
			"./js/Main.js"
		],
		function()
		{
			Defmech.Main.init();
		});
}