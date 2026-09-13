import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as config } from "./config_C2j_Y-7t.mjs";
import { t as getCollection } from "./_astro_content_FI1_MVnI.mjs";
import { n as getPostUrl } from "./getPostPaths_CSDRrYhp.mjs";
import { t as getSortedPosts } from "./getSortedPosts_CI9dDGut.mjs";
import rss from "@astrojs/rss";
//#region src/pages/rss.xml.ts
var rss_xml_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
async function GET() {
	const posts = await getCollection("posts");
	const sortedPosts = getSortedPosts(posts);
	return rss({
		title: config.site.title,
		description: config.site.description,
		site: config.site.url,
		items: sortedPosts.map(({ data, id, filePath }) => ({
			link: getPostUrl(id, filePath, config.site.lang),
			title: data.title,
			description: data.description,
			pubDate: new Date(data.modDatetime ?? data.pubDatetime)
		}))
	});
}
//#endregion
//#region \0virtual:astro:page:src/pages/rss.xml@_@ts
var page = () => rss_xml_exports;
//#endregion
export { page };
