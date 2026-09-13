import "./jsx-runtime_BecIScU7.mjs";
import { it as AstroError, o as DuplicateContentEntrySlugError } from "./errors-data_21Mj7k88.mjs";
import { t as config } from "./config_C2j_Y-7t.mjs";
import { _ as slash } from "./remote_DCWYK5x-.mjs";
import { n as getRelativeLocaleUrl } from "./runtime_DbOvlAcr.mjs";
import { i as defineCollection } from "./_astro_content_FI1_MVnI.mjs";
import { n as slugifyStr } from "./slugify_7khGWwfZ.mjs";
import * as mod from "zod/v4";
import colors from "piccolore";
import { existsSync, promises } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import "js-yaml";
import "smol-toml";
import path, { relative } from "node:path";
import { slug } from "github-slugger";
import "xxhash-wasm";
import "common-ancestor-path";
import pLimit from "p-limit";
import picomatch from "picomatch";
import { glob } from "tinyglobby";
typeof process !== "undefined" && process.platform;
//#endregion
//#region node_modules/astro/dist/core/viteUtils.js
var isWindows = typeof process !== "undefined" && process.platform === "win32";
function normalizePath(id) {
	return path.posix.normalize(isWindows ? slash(id) : id);
}
//#endregion
//#region node_modules/astro/dist/content/loaders/glob.js
function generateIdDefault({ entry, base, data }, isLegacy) {
	if (data.slug) return String(data.slug);
	const entryURL = new URL("./" + encodeURI(entry), base);
	if (isLegacy) {
		const { id } = getContentEntryIdAndSlug({
			entry: entryURL,
			contentDir: base,
			collection: ""
		});
		return id;
	}
	const { slug } = getContentEntryIdAndSlug({
		entry: entryURL,
		contentDir: base,
		collection: ""
	});
	return slug;
}
function checkPrefix(pattern, prefix) {
	if (Array.isArray(pattern)) return pattern.some((p) => p.startsWith(prefix));
	return pattern.startsWith(prefix);
}
var secretLegacyFlag = /* @__PURE__ */ Symbol("astro.legacy-glob");
function glob$1(globOptions) {
	if (checkPrefix(globOptions.pattern, "../")) throw new Error("Glob patterns cannot start with `../`. Set the `base` option to a parent directory instead.");
	if (checkPrefix(globOptions.pattern, "/")) throw new Error("Glob patterns cannot start with `/`. Set the `base` option to a parent directory or use a relative path instead.");
	const isLegacy = !!globOptions[secretLegacyFlag];
	const userGenerateId = globOptions?.generateId ?? ((opts) => generateIdDefault(opts, isLegacy));
	const generateId = (opts) => String(userGenerateId(opts));
	const fileToIdMap = /* @__PURE__ */ new Map();
	return {
		name: "glob-loader",
		load: async ({ config, collection, logger, watcher, parseData, store, generateDigest, entryTypes }) => {
			const renderFunctionByContentType = /* @__PURE__ */ new WeakMap();
			const untouchedEntries = new Set(store.keys());
			async function syncData(entry, base, entryType, oldId) {
				if (!entryType) {
					logger.warn(`No entry type found for ${entry}`);
					return;
				}
				const fileUrl = new URL("./" + encodeURI(entry), base);
				const contents = await promises.readFile(fileUrl, "utf-8").catch((err) => {
					logger.error(`Error reading ${entry}: ${err.message}`);
				});
				if (!contents && contents !== "") {
					logger.warn(`No contents found for ${entry}`);
					return;
				}
				const { body, data } = await entryType.getEntryInfo({
					contents,
					fileUrl
				});
				const id = generateId({
					entry,
					base,
					data
				});
				if (oldId && oldId !== id) store.delete(oldId);
				untouchedEntries.delete(id);
				const existingEntry = store.get(id);
				const digest = generateDigest(contents);
				const filePath2 = fileURLToPath(fileUrl);
				if (existingEntry && existingEntry.digest === digest && existingEntry.filePath) {
					if (existingEntry.deferredRender) store.addModuleImport(existingEntry.filePath);
					if (existingEntry.assetImports?.length) store.addAssetImports(existingEntry.assetImports, existingEntry.filePath);
					fileToIdMap.set(filePath2, id);
					return;
				}
				const relativePath2 = posixRelative(fileURLToPath(config.root), filePath2);
				const parsedData = await parseData({
					id,
					data,
					filePath: filePath2
				});
				if (existingEntry && existingEntry.filePath && existingEntry.filePath !== relativePath2) {
					const oldFilePath = new URL(existingEntry.filePath, config.root);
					if (existsSync(oldFilePath)) {
						const message = DuplicateContentEntrySlugError.message(collection, id, existingEntry.filePath, relativePath2);
						if (config.prerenderConflictBehavior === "error") throw new AstroError({
							...DuplicateContentEntrySlugError,
							message
						});
						else if (config.prerenderConflictBehavior !== "ignore") logger.warn(message);
					}
				}
				if (entryType.getRenderFunction && !globOptions.deferRender) {
					let render = renderFunctionByContentType.get(entryType);
					if (!render) {
						render = await entryType.getRenderFunction(config);
						renderFunctionByContentType.set(entryType, render);
					}
					let rendered = void 0;
					try {
						rendered = await render?.({
							id,
							data,
							body,
							filePath: filePath2,
							digest
						});
					} catch (error) {
						logger.error(`Error rendering ${entry}: ${error.message}`);
					}
					store.set({
						id,
						data: parsedData,
						body: globOptions.retainBody === false ? void 0 : body,
						filePath: relativePath2,
						digest,
						rendered,
						assetImports: rendered?.metadata?.imagePaths
					});
				} else if (entryType.getRenderFunction && globOptions.deferRender || "contentModuleTypes" in entryType) store.set({
					id,
					data: parsedData,
					body: globOptions.retainBody === false ? void 0 : body,
					filePath: relativePath2,
					digest,
					deferredRender: true
				});
				else store.set({
					id,
					data: parsedData,
					body: globOptions.retainBody === false ? void 0 : body,
					filePath: relativePath2,
					digest
				});
				fileToIdMap.set(filePath2, id);
			}
			let baseDir;
			if (isLegacy && !globOptions.base) baseDir = new URL(`./src/content/${collection}`, config.root);
			else baseDir = globOptions.base ? new URL(globOptions.base, config.root) : config.root;
			if (!baseDir.pathname.endsWith("/")) baseDir.pathname = `${baseDir.pathname}/`;
			const filePath = fileURLToPath(baseDir);
			const relativePath = relative(fileURLToPath(config.root), filePath);
			const exists = existsSync(baseDir);
			if (!exists) logger.warn(`The base directory "${fileURLToPath(baseDir)}" does not exist.`);
			const files = await glob(globOptions.pattern, {
				cwd: fileURLToPath(baseDir),
				expandDirectories: false
			});
			if (exists && files.length === 0) {
				logger.warn(`No files found matching "${globOptions.pattern}" in directory "${relativePath}"`);
				return;
			}
			function configForFile(file) {
				const ext = file.split(".").at(-1);
				if (!ext) {
					logger.warn(`No extension found for ${file}`);
					return;
				}
				return entryTypes.get(`.${ext}`);
			}
			const limit = pLimit(10);
			const skippedFiles = [];
			const contentDir = new URL("content/", config.srcDir);
			const configFiles = new Set([
				"config.js",
				"config.ts",
				"config.mjs"
			].map((file) => new URL(file, contentDir).href));
			function isConfigFile(file) {
				const fileUrl = new URL("./" + encodeURI(file), baseDir);
				return configFiles.has(fileUrl.href);
			}
			await Promise.all(files.map((entry) => {
				if (isConfigFile(entry)) return;
				return limit(async () => {
					const entryType = configForFile(entry);
					await syncData(entry, baseDir, entryType);
				});
			}));
			const skipCount = skippedFiles.length;
			if (skipCount > 0) {
				const patternList = Array.isArray(globOptions.pattern) ? globOptions.pattern.join(", ") : globOptions.pattern;
				logger.warn(`The glob() loader cannot be used for files in ${colors.bold("src/content")} when legacy mode is enabled.`);
				if (skipCount > 10) logger.warn(`Skipped ${colors.green(skippedFiles.length)} files that matched ${colors.green(patternList)}.`);
				else {
					logger.warn(`Skipped the following files that matched ${colors.green(patternList)}:`);
					skippedFiles.forEach((file) => logger.warn(`\u2022 ${colors.green(file)}`));
				}
			}
			untouchedEntries.forEach((id) => store.delete(id));
			if (!watcher) return;
			watcher.add(filePath);
			const patterns = Array.isArray(globOptions.pattern) ? globOptions.pattern : [globOptions.pattern];
			const positivePatterns = patterns.filter((p) => !p.startsWith("!"));
			const negationPatterns = patterns.filter((p) => p.startsWith("!")).map((p) => p.slice(1));
			const matchesGlob = (entry) => !entry.startsWith("../") && picomatch.isMatch(entry, positivePatterns, { ignore: negationPatterns.length > 0 ? negationPatterns : void 0 });
			const basePath = fileURLToPath(baseDir);
			async function onChange(changedPath) {
				const entry = posixRelative(basePath, changedPath);
				if (!matchesGlob(entry)) return;
				const entryType = configForFile(changedPath);
				const baseUrl = pathToFileURL(basePath);
				const oldId = fileToIdMap.get(changedPath);
				try {
					await syncData(entry, baseUrl, entryType, oldId);
					logger.info(`Reloaded data from ${colors.green(entry)}`);
				} catch (e) {
					logger.error(`Failed to reload ${entry}: ${e.message}`);
				}
			}
			watcher.on("change", onChange);
			watcher.on("add", onChange);
			watcher.on("unlink", async (deletedPath) => {
				const entry = posixRelative(basePath, deletedPath);
				if (!matchesGlob(entry)) return;
				const id = fileToIdMap.get(deletedPath);
				if (id) {
					store.delete(id);
					fileToIdMap.delete(deletedPath);
				}
			});
		}
	};
}
//#endregion
//#region node_modules/astro/dist/content/utils.js
var entryTypeSchema = mod.object({ id: mod.string({ error: "Content entry `id` must be a string" }) }).passthrough();
mod.union([mod.array(entryTypeSchema), mod.record(mod.string(), mod.object({ id: mod.string({ error: "Content entry `id` must be a string" }).optional() }).passthrough())]);
function getContentEntryIdAndSlug({ entry, contentDir, collection }) {
	const relativePath = getRelativeEntryPath(entry, collection, contentDir);
	const slug$1 = relativePath.replace(new RegExp(path.extname(relativePath) + "$"), "").split(path.sep).map((segment) => slug(segment)).join("/").replace(/\/index$/, "");
	return {
		id: normalizePath(relativePath),
		slug: slug$1
	};
}
function getRelativeEntryPath(entry, collection, contentDir) {
	const relativeToContent = path.relative(fileURLToPath(contentDir), fileURLToPath(entry));
	return path.relative(collection, relativeToContent);
}
function posixifyPath(filePath) {
	return filePath.split(path.sep).join("/");
}
function posixRelative(from, to) {
	return posixifyPath(path.relative(from, to));
}
defineCollection({
	loader: glob$1({
		pattern: "**/[^_]*.{md,mdx}",
		base: `./src/content/posts`
	}),
	schema: ({ image }) => mod.object({
		author: mod.string().default(config.site.author),
		pubDatetime: mod.date(),
		modDatetime: mod.date().optional().nullable(),
		title: mod.string(),
		featured: mod.boolean().optional(),
		draft: mod.boolean().optional(),
		tags: mod.array(mod.string()).default(["others"]),
		ogImage: image().or(mod.string()).optional(),
		description: mod.string(),
		canonicalURL: mod.string().optional(),
		hideEditPost: mod.boolean().optional(),
		timezone: mod.string().optional()
	})
});
defineCollection({
	loader: glob$1({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/pages"
	}),
	schema: mod.object({
		title: mod.string(),
		description: mod.string().optional(),
		ogImage: mod.string().optional(),
		canonicalURL: mod.string().optional()
	})
});
//#endregion
//#region src/utils/getPostPaths.ts
function getPostPathSegments(filePath) {
	return filePath?.replace("src/content/posts", "").split("/").filter((path) => path !== "").filter((path) => !path.startsWith("_")).slice(0, -1).map((segment) => slugifyStr(segment)) ?? [];
}
function getIdSlug(id) {
	const postId = id.split("/");
	return postId.length > 0 ? String(postId[postId.length - 1]) : id;
}
function getPostSlugPath(id, filePath) {
	const pathSegments = getPostPathSegments(filePath);
	const slug = getIdSlug(id);
	return pathSegments.length > 0 ? [...pathSegments, slug].join("/") : String(slug);
}
/**
* Returns the slug-only path for use as a route param in `getStaticPaths`.
* No base prefix, no locale — Astro handles those at a higher level.
* e.g. `/examples/my-post`
*/
function getPostSlug(id, filePath) {
	return `/${getPostSlugPath(id, filePath)}`;
}
/**
* Returns a fully navigable URL for use in `<a href>` and RSS links.
* Applies both locale routing and the configured Astro base via
* `getRelativeLocaleUrl`.
* e.g. `/posts/my-post` or `/en/posts/my-post`
*/
function getPostUrl(id, filePath, locale = config.site.lang) {
	return getRelativeLocaleUrl(locale, `posts/${getPostSlugPath(id, filePath)}`);
}
//#endregion
export { getPostUrl as n, getPostSlug as t };
