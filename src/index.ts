import minimist from "minimist";

import { createSourceFileSystem, OutputFileSystem } from "./fileSystem";
import { ingestInput } from "./input";
import { SiteRenderer } from "./render";
import { processAssets } from "./assets";
import { SiteValidator } from "./validate";

import rootConfig from "./site";

function build(minifyOutput: boolean) {
  const sourceFileSystem = createSourceFileSystem(rootConfig);
  const outputFileSystem = new OutputFileSystem(rootConfig.outputRootPath);

  const inputDocumentInventory = ingestInput(rootConfig, sourceFileSystem);

  processAssets(sourceFileSystem.inputFiles, outputFileSystem, minifyOutput);
  processAssets(sourceFileSystem.themeFiles, outputFileSystem, minifyOutput);

  const siteRenderer = new SiteRenderer(rootConfig, inputDocumentInventory, outputFileSystem, minifyOutput);
  siteRenderer.render();

  new SiteValidator(rootConfig.outputRootPath).validate();
}

// Parse command line
function usage() {
  console.log(`Usage: ${process.argv[1]} build`);
  process.exit(-1);
}

const argv = minimist(process.argv.slice(2));

if (!argv._ || argv._.length !== 1) {
  usage();
}

const verb = argv._[0];

if (verb !== "build") {
  usage();
}

build(argv.minify || false);