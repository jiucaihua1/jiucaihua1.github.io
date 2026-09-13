import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { p as renderComponent, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { l as createComponent, t as config } from "./config_C2j_Y-7t.mjs";
import { o as $$Layout, r as $$Header, t as $$Footer } from "./Footer_Y1kETs_t.mjs";
import { n as getEntry, r as render } from "./_astro_content_FI1_MVnI.mjs";
import "./compiler_CLriVEbg.mjs";
import { n as $$Breadcrumb, t as $$Main } from "./Main_DpZ5tPxp.mjs";
//#region src/pages/about.astro
var about_exports = /* @__PURE__ */ __exportAll({
	default: () => $$About,
	file: () => $$file,
	url: () => $$url
});
var $$About = createComponent(async ($$result, $$props, $$slots) => {
	const about = await getEntry("pages", "about");
	if (!about) throw new Error("Missing content entry: `about.md` or `about.mdx` in `src/content/pages/`");
	const { Content } = await render(about);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": `${about.data.title} | ${config.site.title}`,
		"description": about.data.description,
		"ogImage": about.data.ogImage,
		"canonicalURL": about.data.canonicalURL
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${renderComponent($$result, "Breadcrumb", $$Breadcrumb, {})}${renderComponent($$result, "Main", $$Main, {
		"pageTitle": about.data.title,
		"class": "app-prose"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Content", Content, {})}` })}${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/about.astro", void 0);
var $$file = "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/about.astro";
var $$url = "/about";
//#endregion
//#region \0virtual:astro:page:src/pages/about@_@astro
var page = () => about_exports;
//#endregion
export { page };
