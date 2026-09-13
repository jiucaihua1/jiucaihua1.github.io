import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { P as createAstro, S as maybeRenderHead, p as renderComponent, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { l as createComponent, t as config } from "./config_C2j_Y-7t.mjs";
import { i as useTranslations, o as $$Layout, r as $$Header, t as $$Footer } from "./Footer_Y1kETs_t.mjs";
import { t as getCollection } from "./_astro_content_FI1_MVnI.mjs";
import "./compiler_CLriVEbg.mjs";
import { n as $$Breadcrumb, t as $$Main } from "./Main_DpZ5tPxp.mjs";
import { t as slugifyAll } from "./slugify_7khGWwfZ.mjs";
import { t as $$Card } from "./Card_XIFzStiv.mjs";
import { t as getSortedPosts } from "./getSortedPosts_CI9dDGut.mjs";
import { t as $$Pagination } from "./Pagination_CgqCE5vC.mjs";
import { t as getUniqueTags } from "./getUniqueTags_Vj6zpkrh.mjs";
//#region src/pages/tags/[tag]/[...page].astro
var ____page__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Component,
	file: () => $$file,
	getStaticPaths: () => getStaticPaths,
	url: () => $$url
});
createAstro("https://jiucaihua1.github.io/");
async function getStaticPaths({ paginate }) {
	const posts = await getCollection("posts", ({ data }) => !data.draft);
	return getUniqueTags(posts).flatMap(({ tag, tagName }) => {
		return paginate(getSortedPosts(posts.filter(({ data }) => slugifyAll(data.tags).includes(tag))), {
			params: { tag },
			props: { tagName },
			pageSize: config.posts.perPage
		});
	});
}
var $$Component = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Component;
	const { page, tagName } = Astro.props;
	const locale = Astro.currentLocale ?? config.site.lang;
	const t = useTranslations(locale);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${t.pages.tagTitle}: ${tagName} | ${config.site.title}` }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${renderComponent($$result, "Breadcrumb", $$Breadcrumb, {})}${renderComponent($$result, "Main", $$Main, {
		"pageTitle": `${t.pages.tagTitle}: ${tagName}`,
		"pageDesc": `${t.pages.tagDesc} "${tagName}".`
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<ul>${page.data.map((data) => renderTemplate`${renderComponent($$result, "Card", $$Card, { ...data })}`)}</ul>` })}${renderComponent($$result, "Pagination", $$Pagination, { "page": page })}${renderComponent($$result, "Footer", $$Footer, { "noMarginTop": page.lastPage > 1 })}` })}`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/tags/[tag]/[...page].astro", void 0);
var $$file = "E:/code_workbuddy/博客/jiucaihua1.github.io/src/pages/tags/[tag]/[...page].astro";
var $$url = "/tags/[tag]/[...page]";
//#endregion
//#region \0virtual:astro:page:src/pages/tags/[tag]/[...page]@_@astro
var page = () => ____page__exports;
//#endregion
export { page };
