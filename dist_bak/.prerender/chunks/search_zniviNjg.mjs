import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { P as createAstro, S as maybeRenderHead, a as createTransitionScope, p as renderComponent, w as addAttribute, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { l as createComponent, t as config } from "./config_C2j_Y-7t.mjs";
import { i as useTranslations, o as $$Layout, r as $$Header, s as getAssetPath, t as $$Footer, u as renderScript } from "./Footer_Y1kETs_t.mjs";
import { n as getRelativeLocaleUrl } from "./runtime_DbOvlAcr.mjs";
import "./compiler_CLriVEbg.mjs";
import { n as $$Breadcrumb, t as $$Main } from "./Main_DpZ5tPxp.mjs";
/* empty css                          */
//#region src/pages/search.astro
var search_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Search,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://jiucaihua1.github.io/");
var $$Search = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Search;
	const locale = Astro.currentLocale ?? config.site.lang;
	const notFoundUrl = getRelativeLocaleUrl(locale, "404");
	if (config.features.search !== "pagefind" && notFoundUrl) return Astro.rewrite(notFoundUrl);
	const backUrl = config.features.showBackButton ? `${Astro.url.pathname}` : getRelativeLocaleUrl(locale, "");
	const pagefindBundlePath = getAssetPath("pagefind/");
	const t = useTranslations(locale);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${t.pages.searchTitle} | ${config.site.title}` }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${renderComponent($$result, "Breadcrumb", $$Breadcrumb, {})}${renderComponent($$result, "Main", $$Main, {
		"pageTitle": t.pages.searchTitle,
		"pageDesc": t.pages.searchDesc
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div${addAttribute(createTransitionScope($$result, "637jddtz"), "data-astro-transition-persist")} id="pagefind-search"${addAttribute(backUrl, "data-backurl")}${addAttribute(pagefindBundlePath, "data-bundle-path")}></div>` })}${renderComponent($$result, "Footer", $$Footer, {})}` })}${renderScript($$result, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/search.astro?astro&type=script&index=0&lang.ts")}`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/search.astro", "self");
var $$file = "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/search.astro";
var $$url = "/search";
//#endregion
//#region \0virtual:astro:page:src/pages/search@_@astro
var page = () => search_exports;
//#endregion
export { page };
