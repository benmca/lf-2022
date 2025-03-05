const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const sass = require("sass");
const path = require("node:path");
const nj = require("nunjucks");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const cheerio = require('cheerio');
const { el } = require("date-fns/locale");
const { weeksToDays, monthsInQuarter, isFirstDayOfMonth } = require("date-fns");

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
        compile: async function (inputContent, inputPath) {
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
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("dd LLL yyyy");
    });

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
    });

    eleventyConfig.addFilter('friendlyDate', (dateObj, format) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(format);
    });

    eleventyConfig.addFilter("thumb", function (string) {
        return string.replace('/img/', '/thumbs/');
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        if (n < 0) {
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
        if (tag && array && array.data && array.data.tags) {
            console.log(tag + ":" + array.data.tags);
        }
        return (array || []).filter(x => x.data.tags.includes(tag));
    });


    // Nunjucks Shortcode
    eleventyConfig.addNunjucksShortcode("audioPlayer", function (track) {
        return nj.render('_includes/audioPlayer.njk', { track: track });
    });

    // Nunjucks Shortcode
    eleventyConfig.addNunjucksShortcode("player", function (track) {
        return nj.render('_includes/player.njk', { track: track });
    });

    // Nunjucks Shortcode
    eleventyConfig.addNunjucksShortcode("abc", function (data) {
        var id = "abc-id-" + Math.random().toString(16).slice(2);
        return nj.render('_includes/abcjs.njk', { data: data, id: id });
    });

    eleventyConfig.addCollection("minutes", function (collectionApi) {
        return collectionApi.getAll().filter(item => {
            if (item.data.tags && item.data.tags.includes('1min') && !item.data.tags.includes('2025.02.break') && !item.data.tags.includes('break')) {
                return item;
            }
        }).sort((a, b) => a.date - b.date);
    });

    eleventyConfig.addFilter("urlencode", function (value) {
        return encodeURIComponent(value);
    });

    // Customize Markdown library and settings:
    let markdownLibrary = markdownIt({
        html: true,
        linkify: false
    });
    eleventyConfig.setLibrary("md", markdownLibrary);

    // Tags
    eleventyConfig.addCollection('tagList', collection => {
        const tagsSet = new Set();
        collection.getAll().forEach(item => {
            if (!item.data.tags) return;
            item.data.tags.filter(tag => !['posts', 'all', '1min', 'listen', 'blog', '2025.02.break'].includes(tag)).forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    });

    // Tags
    eleventyConfig.addCollection('minutesByMonth', collection => {
        const months = new Set();
        let week = new Array(7);
        week.fill(null);
        let month = new Set();

        items = collection.getFilteredByTag("1min").forEach(item => {
            dayOfMonth = parseInt(DateTime.fromJSDate(item.date, { zone: 'utc' }).toFormat('d'));
            dayOfWeek = parseInt(DateTime.fromJSDate(item.date, { zone: 'utc' }).toFormat('c'));
            if (dayOfWeek == 7) dayOfWeek = 1; else dayOfWeek = dayOfWeek + 1;
            item.dayOfWeek = dayOfWeek;

            if (dayOfMonth == 1) {
                month = new Set();
                month.date = item.date;
                months.add(month);

                week = new Array(7);
                week.fill(null);
                month.add(week);
            } else if (dayOfWeek == 1) {
                week = new Array(7);
                week.fill(null);
                month.add(week);
            }

            week[dayOfWeek - 1] = item;
        });
        months.forEach(month => {
            month.forEach(week => {
                week.forEach(day => {
                    if (day && day.data.tags.includes('break')) {
                        day.isBreak = true;
                    }
                });
            });
        });
        return Array.from(months).sort((a, b) => b.date - a.date);
    });

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

