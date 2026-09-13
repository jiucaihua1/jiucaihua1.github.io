//#region src/content/posts/how-to-configure-astropaper-theme.mdx?astroPropagatedAssets
async function getMod() {
	return import("./how-to-configure-astropaper-theme_CY3H8okg.mjs");
}
var defaultMod = {
	__astroPropagation: true,
	getMod,
	collectedLinks: "@@ASTRO-LINKS@@",
	collectedStyles: "@@ASTRO-STYLES@@",
	collectedScripts: []
};
//#endregion
export { defaultMod as default };
