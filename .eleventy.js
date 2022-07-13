const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const sass = require("sass");
const path = require("node:path");

module.exports = function (eleventyConfig) {
    eleventyConfig.addTemplateFormats("scss");

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

            // This is the render function, `data` is the full data cascade
            return async (data) => {
                return result.css;
            };
        }
    });

    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("snd");

    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    });

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
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
        return (array || []).filter(x => x.data.tags.includes(tag));
    });

    function filterTagList(tags) {
        return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
    }

    eleventyConfig.addFilter("filterTagList", filterTagList)

    // Create an array of all tags
    eleventyConfig.addCollection("tagList", function(collection) {
        let tagSet = new Set();
        collection.getAll().forEach(item => {
            (item.data.tags || []).forEach(tag => tagSet.add(tag));
        });

        return filterTagList([...tagSet]);
    });

    // Customize Markdown library and settings:
    let markdownLibrary = markdownIt({
        html: true,
        linkify: false
    });
        // .use(markdownItAnchor, {
    //     permalink: markdownItAnchor.permalink.ariaHidden({
    //         placement: "after",
    //         class: "direct-link",
    //         symbol: "#"
    //     }),
    //     level: [1,2,3,4],
    //     slugify: eleventyConfig.getFilter("slugify")
    // });
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
        htmlTemplateEngine: "njk"
    };
};

