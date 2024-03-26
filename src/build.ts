import { createSourceFileSystem, OutputFileSystem } from "./fileSystem";
import { ingestInput } from "./input";
import { renderSite } from "./render";
import { processAssets } from "./assets";

import rootConfig from "./site";

const sourceFileSystem = createSourceFileSystem(rootConfig);
const outputFileSystem = new OutputFileSystem(rootConfig.outputRootPath);

const inputDocumentGroups = ingestInput(rootConfig, sourceFileSystem);

processAssets(sourceFileSystem.inputFiles, outputFileSystem);
processAssets(sourceFileSystem.themeFiles, outputFileSystem);

renderSite(rootConfig, inputDocumentGroups, outputFileSystem);
