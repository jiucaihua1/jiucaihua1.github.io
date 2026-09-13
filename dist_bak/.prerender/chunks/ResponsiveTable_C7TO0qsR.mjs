import { P as createAstro, S as maybeRenderHead, v as renderSlot, w as addAttribute, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { l as createComponent } from "./config_C2j_Y-7t.mjs";
import "./compiler_CLriVEbg.mjs";
//#region src/components/ResponsiveTable.astro
createAstro("https://jiucaihua1.github.io/");
var $$ResponsiveTable = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ResponsiveTable;
	const { class: className, variant } = Astro.props;
	const variantClasses = {
		minimal: "[&_td]:border-0 [&_th]:border-0",
		striped: "[&_tbody_tr]:odd:bg-muted/25"
	};
	return renderTemplate`${maybeRenderHead($$result)}<div${addAttribute(variant, "data-table-variant")}${addAttribute([
		"overflow-hidden [&_table]:my-0 [&_table]:min-w-xl",
		variant === "minimal" && variantClasses.minimal,
		variant === "striped" && variantClasses.striped,
		variant === "striped-minimal" && `${variantClasses.minimal} ${variantClasses.striped}`,
		className
	], "class:list")}><div class="relative w-full overflow-x-auto">${renderSlot($$result, $$slots["default"])}</div></div>`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/src/components/ResponsiveTable.astro", void 0);
//#endregion
export { $$ResponsiveTable as t };
