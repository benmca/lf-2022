const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const sass = require("sass");
const path = require("node:path");
const nj = require("nunjucks");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const cheerio = require('cheerio');

module.exports = function (eleventyConfig) {

  eleventyConfig.addFilter('openImagesInNewWindow', (content) => {
    const $ = cheerio.load(content);

    $('img').each((i, img) => {
      const src = $(img).attr('src');
      $(img).wrap(`<a href="${src}" target="_blank"></a>`);
    });

    return $.html();
  });

    eleventyConfig.addTemplateFormats("scss");
    eleventyConfig.addPlugin(pluginRss);


    // Creates the extension for use
    eleventyConfig.addExtension("scss", {
        outputFileExtension: "css", // optional, default: "html"

        // `compile` is called once per .scss file in the input directory
        compile: async function(inputContent, inputPath) {
            let parsed = path.parse(inputPath);
            let result = sass.compileString(inputContent, {
                loadPaths: [
                    parsed.dir || ".",
                    this.config.dir.includes
                ]
            });
            this.addDependencies(inputPath, result.loadedUrls);
            // This is the render function, `data` is the full data cascade
            return async (data) => {
                return result.css;
            };
        }
    });

    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("thumbs");
    eleventyConfig.addPassthroughCopy("snd");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("js");

    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    });

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });

    eleventyConfig.addFilter('friendlyDate', (dateObj, format) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(format);
    });

    eleventyConfig.addFilter("thumb", function(string) {
        return string.replace('/img/','/thumbs/');
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if(!Array.isArray(array) || array.length === 0) {
            return [];
        }
        if( n < 0 ) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

    // Return the smallest number argument
    eleventyConfig.addFilter("min", (...numbers) => {
        return Math.min.apply(null, numbers);
    });

    // Return the smallest number argument
    eleventyConfig.addFilter("itemsByTag", (array, tag) => {
        if(tag && array && array.data && array.data.tags) {
            console.log(tag + ":" + array.data.tags);
        }
        return (array || []).filter(x => x.data.tags.includes(tag));
    });


    // Nunjucks Shortcode
    eleventyConfig.addNunjucksShortcode("audioPlayer", function(track) {
        return nj.render('_includes/audioPlayer.njk', {track: track});
    });

    // Nunjucks Shortcode
    eleventyConfig.addNunjucksShortcode("player", function(track) {
        return nj.render('_includes/player.njk', {track: track});
    });

    // Nunjucks Shortcode
    eleventyConfig.addNunjucksShortcode("abc", function(data) {
        var id = "abc-id-" + Math.random().toString(16).slice(2);
        return nj.render('_includes/abcjs.njk', {data: data, id: id});
    });

    eleventyConfig.addCollection("minutes", function(collectionApi) {
        return collectionApi.getFilteredByTag("1min");
    });

    // Customize Markdown library and settings:
    let markdownLibrary = markdownIt({
        html: true,
        linkify: false
    });
    eleventyConfig.setLibrary("md", markdownLibrary);

    return {
        // Control which files Eleventy will process
        // e.g.: *.md, *.njk, *.html, *.liquid
        templateFormats: [
            "md",
            "njk",
            "html",
            "liquid"
        ],

        // Pre-process *.md files with: (default: `liquid`)
        markdownTemplateEngine: "njk",

        // Pre-process *.html files with: (default: `liquid`)
        htmlTemplateEngine: "njk",

        pathPrefix: "/main/"
    };
};

