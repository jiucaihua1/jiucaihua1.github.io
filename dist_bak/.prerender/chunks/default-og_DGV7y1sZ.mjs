//#region public/default-og.jpg
var default_og_default = new Proxy({
	"src": "/_astro/default-og.jWlOTf-L.jpg",
	"width": 2455,
	"height": 1381,
	"format": "jpg"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "E:/code_workbuddy/博客/jiucaihua1.github.io/public/default-og.jpg";
	if (target[name] !== void 0 && globalThis.astroAsset) globalThis.astroAsset?.referencedImages?.add("E:/code_workbuddy/博客/jiucaihua1.github.io/public/default-og.jpg");
	return target[name];
} });
//#endregion
export { default_og_default as default };
