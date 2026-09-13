import { M as unescapeHTML, P as createAstro, S as maybeRenderHead, i as spreadAttributes, w as addAttribute, x as renderTemplate } from "./jsx-runtime_BecIScU7.mjs";
import { f as FontFamilyNotFound, it as AstroError, p as FontFileUrlNotFound, y as ImageMissingAlt } from "./errors-data_21Mj7k88.mjs";
import { c as level, l as createComponent } from "./config_C2j_Y-7t.mjs";
import { t as createConsoleLogger } from "./console_BS3552R5.mjs";
import { a as inferRemoteSize$1, c as isRemoteImage, l as resolveSrc, n as getImage$1, s as isESMImportedImage, t as getConfiguredImageService } from "./assets_BTZ2HE8a.mjs";
import "./compiler_CLriVEbg.mjs";
import * as mime from "mrmime";
//#region node_modules/astro/components/Image.astro
createAstro("https://jiucaihua1.github.io/");
var $$Image = createComponent(async ($$result, $$props, $$slots) => {
	const Astro2 = $$result.createAstro($$props, $$slots);
	Astro2.self = $$Image;
	const props = Astro2.props;
	if (props.alt === void 0 || props.alt === null) throw new AstroError(ImageMissingAlt);
	if (typeof props.width === "string") props.width = Number.parseInt(props.width);
	if (typeof props.height === "string") props.height = Number.parseInt(props.height);
	if ((props.layout ?? imageConfig.layout ?? "none") !== "none") {
		props.layout ??= imageConfig.layout;
		props.fit ??= imageConfig.objectFit ?? "cover";
		props.position ??= imageConfig.objectPosition ?? "center";
	} else if (imageConfig.objectFit || imageConfig.objectPosition) {
		props.fit ??= imageConfig.objectFit;
		props.position ??= imageConfig.objectPosition;
	}
	const image = await getImage(props);
	const additionalAttributes = {};
	if (image.srcSet.values.length > 0) additionalAttributes.srcset = image.srcSet.attribute;
	const { class: className, ...attributes } = {
		...additionalAttributes,
		...image.attributes
	};
	return renderTemplate`${maybeRenderHead($$result)}<img${addAttribute(image.src, "src")}${spreadAttributes(attributes)}${addAttribute(className, "class")}>`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/node_modules/astro/components/Image.astro", void 0);
//#endregion
//#region node_modules/astro/components/Picture.astro
createAstro("https://jiucaihua1.github.io/");
var $$Picture = createComponent(async ($$result, $$props, $$slots) => {
	const Astro2 = $$result.createAstro($$props, $$slots);
	Astro2.self = $$Picture;
	const defaultFormats = ["webp"];
	const defaultFallbackFormat = "png";
	const specialFormatsFallback = [
		"gif",
		"svg",
		"jpg",
		"jpeg"
	];
	const { formats = defaultFormats, pictureAttributes = {}, fallbackFormat, ...props } = Astro2.props;
	if (props.alt === void 0 || props.alt === null) throw new AstroError(ImageMissingAlt);
	const scopedStyleClass = props.class?.match(/\bastro-\w{8}\b/)?.[0];
	if (scopedStyleClass) {
		if (pictureAttributes.class) pictureAttributes.class = `${pictureAttributes.class} ${scopedStyleClass}`;
		else pictureAttributes.class = scopedStyleClass;
	}
	const useResponsive = (props.layout ?? imageConfig.layout ?? "none") !== "none";
	if (useResponsive) {
		props.layout ??= imageConfig.layout;
		props.fit ??= imageConfig.objectFit ?? "cover";
		props.position ??= imageConfig.objectPosition ?? "center";
	} else if (imageConfig.objectFit || imageConfig.objectPosition) {
		props.fit ??= imageConfig.objectFit;
		props.position ??= imageConfig.objectPosition;
	}
	for (const key in props) if (key.startsWith("data-astro-cid")) pictureAttributes[key] = props[key];
	const originalSrc = await resolveSrc(props.src);
	if (props.inferSize && isRemoteImage(originalSrc)) {
		const remoteSize = await inferRemoteSize(originalSrc);
		delete props.inferSize;
		props.width ??= remoteSize.width;
		props.height ??= remoteSize.height;
	}
	const optimizedImages = await Promise.all(formats.map(async (format) => await getImage({
		...props,
		src: originalSrc,
		format,
		widths: props.widths,
		densities: props.densities
	})));
	const clonedSrc = isESMImportedImage(originalSrc) ? originalSrc.clone ?? originalSrc : originalSrc;
	let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat;
	if (!fallbackFormat && isESMImportedImage(clonedSrc) && specialFormatsFallback.includes(clonedSrc.format)) resultFallbackFormat = clonedSrc.format;
	const fallbackImage = await getImage({
		...props,
		format: resultFallbackFormat,
		widths: props.widths,
		densities: props.densities
	});
	const imgAdditionalAttributes = {};
	const sourceAdditionalAttributes = {};
	if (props.sizes) sourceAdditionalAttributes.sizes = props.sizes;
	if (fallbackImage.srcSet.values.length > 0) imgAdditionalAttributes.srcset = fallbackImage.srcSet.attribute;
	const { class: className, ...attributes } = {
		...imgAdditionalAttributes,
		...fallbackImage.attributes
	};
	return renderTemplate`${maybeRenderHead($$result)}<picture${spreadAttributes(pictureAttributes)}>${Object.entries(optimizedImages).map(([_, image]) => {
		const srcsetAttribute = props.densities || !props.densities && !props.widths && !useResponsive ? `${image.src}${image.srcSet.values.length > 0 ? ", " + image.srcSet.attribute : ""}` : image.srcSet.attribute;
		return renderTemplate`<source${addAttribute(srcsetAttribute, "srcset")}${addAttribute(mime.lookup(image.options.format ?? image.src) ?? `image/${image.options.format}`, "type")}${spreadAttributes(sourceAdditionalAttributes)}>`;
	})}<img${addAttribute(fallbackImage.src, "src")}${spreadAttributes(attributes)}${addAttribute(className, "class")}></picture>`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/node_modules/astro/components/Picture.astro", void 0);
//#endregion
//#region \0virtual:astro:assets/fonts/internal
var componentDataByCssVariable = /* @__PURE__ */ new Map([["--font-google-sans-code", {
	"preloads": [],
	"css": ":root{--font-google-sans-code:\"Google Sans Code-1a30c214885cb404\",monospace;}"
}]]);
var fontDataByCssVariable = { "--font-google-sans-code": [] };
//#endregion
//#region node_modules/astro/dist/assets/fonts/core/filter-preloads.js
function filterPreloads(data, preload) {
	if (!preload) return null;
	if (preload === true) return data;
	return data.filter(({ weight, style, subset }) => preload.some((p) => {
		if (p.weight !== void 0 && weight !== void 0 && !checkWeight(p.weight.toString(), weight)) return false;
		if (p.style !== void 0 && p.style !== style) return false;
		if (p.subset !== void 0 && p.subset !== subset) return false;
		return true;
	}));
}
function checkWeight(input, target) {
	const trimmedInput = input.trim();
	if (trimmedInput.includes(" ")) return trimmedInput === target;
	if (target.includes(" ")) {
		const [a, b] = target.split(" ");
		const parsedInput = Number.parseInt(input);
		return parsedInput >= Number.parseInt(a) && parsedInput <= Number.parseInt(b);
	}
	return input === target;
}
//#endregion
//#region node_modules/astro/components/Font.astro
createAstro("https://jiucaihua1.github.io/");
var $$Font = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Font;
	const { cssVariable, preload = false } = Astro.props;
	const data = componentDataByCssVariable.get(cssVariable);
	if (!data) throw new AstroError({
		...FontFamilyNotFound,
		message: FontFamilyNotFound.message(cssVariable)
	});
	const filteredPreloadData = filterPreloads(data.preloads, preload);
	return renderTemplate`<style>${unescapeHTML(data.css)}</style>${filteredPreloadData?.map(({ url, type }) => renderTemplate`<link rel="preload"${addAttribute(url, "href")} as="font"${addAttribute(`font/${type}`, "type")} crossorigin>`)}`;
}, "E:/code_workbuddy/博客/jiucaihua1.github.io/node_modules/astro/components/Font.astro", void 0);
//#endregion
//#region node_modules/astro/dist/assets/fonts/infra/remote-runtime-font-file-url-resolver.js
var RemoteRuntimeFontFileUrlResolver = class {
	#urls;
	#address;
	constructor({ urls, address }) {
		this.#urls = urls;
		this.#address = address;
	}
	resolve(url, requestUrl) {
		if (!this.#urls.has(url)) return null;
		if (!url.startsWith("/")) {
			if (this.#address) url = new URL(url).pathname;
			else return url;
		}
		if (this.#address) return `http://${this.#address.family === "IPv6" ? `[${this.#address.address}]` : this.#address.address}:${this.#address.port}${url}`;
		if (requestUrl) return `${requestUrl.origin}${url}`;
		throw new Error("Server address unavailable, this should not happen. Open an issue.");
	}
};
var runtimeFontFileUrlResolver = new RemoteRuntimeFontFileUrlResolver({
	urls: /* @__PURE__ */ new Set([]),
	address: null
});
//#endregion
//#region node_modules/astro/dist/assets/fonts/core/create-get-font-file-url.js
function createGetFontFileURL(runtimeFontFileUrlResolver) {
	return function getFontFileURL(url, requestUrl) {
		try {
			const result = runtimeFontFileUrlResolver.resolve(url, requestUrl);
			if (result === null) throw new Error("Not found");
			return result;
		} catch (cause) {
			throw new AstroError({
				...FontFileUrlNotFound,
				message: FontFileUrlNotFound.message(url)
			}, { cause });
		}
	};
}
//#endregion
//#region node_modules/astro/dist/assets/fonts/runtime.js
var fontData = fontDataByCssVariable;
var experimental_getFontFileURL = createGetFontFileURL(runtimeFontFileUrlResolver);
//#endregion
//#region \0astro:assets
var _astroLogger = createConsoleLogger({ level });
var _runtimeLogger = {
	info: (message) => _astroLogger.info(null, message),
	warn: (message) => _astroLogger.warn(null, message),
	error: (message) => _astroLogger.error(null, message)
};
var assetQueryParams = void 0;
var imageConfig = {
	"endpoint": { "route": "/_image" },
	"service": {
		"entrypoint": "astro/assets/services/sharp",
		"config": {}
	},
	"dangerouslyProcessSVG": false,
	"domains": [],
	"remotePatterns": [],
	"responsiveStyles": false
};
Object.defineProperty(imageConfig, "assetQueryParams", {
	value: assetQueryParams,
	enumerable: false,
	configurable: true
});
var inferRemoteSize = async (url) => {
	return (await getConfiguredImageService()).getRemoteSize?.(url, imageConfig, _runtimeLogger) ?? inferRemoteSize$1(url, imageConfig);
};
var getImage = async (options) => await getImage$1(options, imageConfig, _runtimeLogger);
//#endregion
export { $$Image as i, fontData as n, $$Font as r, experimental_getFontFileURL as t };
