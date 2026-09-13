import { P as createAstro, S as maybeRenderHead, o as renderTransition, p as renderComponent, w as addAttribute, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { l as createComponent } from "./config_C2j_Y-7t.mjs";
import "./compiler_CLriVEbg.mjs";
import { n as getPostUrl } from "./getPostPaths_CSDRrYhp.mjs";
/* empty css                          */
import { n as toTransitionName, t as $$Datetime } from "./Datetime_BBVLq6zD.mjs";
//#region src/components/Card.astro
createAstro("https://jiucaihua1.github.io/");
var $$Card = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Card;
	const { variant: Heading = "h2", id, data, filePath } = Astro.props;
	const { title, description, ...props } = data;
	return renderTemplate`${maybeRenderHead($$result)}<li class="my-6"><a${addAttribute(getPostUrl(id, filePath, Astro.currentLocale), "href")}${addAttribute([
		"text-accent inline-block text-lg font-medium",
		"decoration-dashed underline-offset-4 hover:underline",
		"focus-visible:no-underline focus-visible:underline-offset-0"
	], "class:list")}>${renderComponent($$result, "Heading", Heading, { "data-astro-transition-scope": renderTransition($$result, "jyu37kgb", "", toTransitionName(id)) }, { "default": ($$result) => renderTemplate`${title}` })}</a>${renderComponent($$result, "Datetime", $$Datetime, { ...props })}<p>${description}</p></li>`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/components/Card.astro", "self");
//#endregion
export { $$Card as t };
