import { createSourceFileSystem, OutputFileSystem } from "./fileSystem";
import { ingestInput } from "./input";
import { SiteRenderer } from "./render";
import { processAssets } from "./assets";
import { SiteValidator } from "./validate";

import rootConfig from "./site";

const minifyOutput = true;

const sourceFileSystem = createSourceFileSystem(rootConfig);
const outputFileSystem = new OutputFileSystem(rootConfig.outputRootPath);

const inputDocumentInventory = ingestInput(rootConfig, sourceFileSystem);

processAssets(sourceFileSystem.inputFiles, outputFileSystem, minifyOutput);
processAssets(sourceFileSystem.themeFiles, outputFileSystem, minifyOutput);

const siteRenderer = new SiteRenderer(rootConfig, inputDocumentInventory, outputFileSystem, minifyOutput);
siteRenderer.render();

new SiteValidator(rootConfig.outputRootPath).validate();
