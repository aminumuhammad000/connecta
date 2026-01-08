"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeWorkRemotelyScraper = exports.MyJobMagScraper = exports.TestScraper = exports.ExampleScraper = exports.JobbermanScraper = exports.BaseScraper = void 0;
// Export all scrapers here
var base_scraper_1 = require("./base.scraper");
Object.defineProperty(exports, "BaseScraper", { enumerable: true, get: function () { return base_scraper_1.BaseScraper; } });
var jobberman_scraper_1 = require("./jobberman.scraper");
Object.defineProperty(exports, "JobbermanScraper", { enumerable: true, get: function () { return jobberman_scraper_1.JobbermanScraper; } });
var example_scraper_1 = require("./example.scraper");
Object.defineProperty(exports, "ExampleScraper", { enumerable: true, get: function () { return example_scraper_1.ExampleScraper; } });
var test_scraper_1 = require("./test.scraper");
Object.defineProperty(exports, "TestScraper", { enumerable: true, get: function () { return test_scraper_1.TestScraper; } });
var myjobmag_scraper_1 = require("./myjobmag.scraper");
Object.defineProperty(exports, "MyJobMagScraper", { enumerable: true, get: function () { return myjobmag_scraper_1.MyJobMagScraper; } });
var weworkremotely_scraper_1 = require("./weworkremotely.scraper");
Object.defineProperty(exports, "WeWorkRemotelyScraper", { enumerable: true, get: function () { return weworkremotely_scraper_1.WeWorkRemotelyScraper; } });
