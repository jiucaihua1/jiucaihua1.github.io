import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { P as createAstro, S as maybeRenderHead, p as renderComponent, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { l as createComponent, t as config } from "./config_C2j_Y-7t.mjs";
import { i as useTranslations, o as $$Layout, r as $$Header, t as $$Footer } from "./Footer_Y1kETs_t.mjs";
import { t as getCollection } from "./_astro_content_FI1_MVnI.mjs";
import "./compiler_CLriVEbg.mjs";
import { n as $$Breadcrumb, t as $$Main } from "./Main_DpZ5tPxp.mjs";
import { t as $$Tag } from "./Tag_CVr0nZuf.mjs";
import { t as getUniqueTags } from "./getUniqueTags_Vj6zpkrh.mjs";
//#region src/pages/tags/index.astro
var tags_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://jiucaihua1.github.io/");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const posts = await getCollection("posts", ({ data }) => !data.draft);
	const tags = getUniqueTags(posts);
	const locale = Astro.currentLocale ?? config.site.lang;
	const t = useTranslations(locale);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${t.pages.tagsTitle} | ${config.site.title}` }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${renderComponent($$result, "Breadcrumb", $$Breadcrumb, {})}${renderComponent($$result, "Main", $$Main, {
		"pageTitle": t.pages.tagsTitle,
		"pageDesc": t.pages.tagsDesc
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<ul class="flex flex-wrap gap-6">${tags.map(({ tag, tagName }) => renderTemplate`${renderComponent($$result, "Tag", $$Tag, {
		"tag": tag,
		"tagName": tagName
	})}`)}</ul>` })}${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/tags/index.astro", void 0);
var $$file = "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/tags/index.astro";
var $$url = "/tags";
//#endregion
//#region \0virtual:astro:page:src/pages/tags/index@_@astro
var page = () => tags_exports;
//#endregion
export { page };
