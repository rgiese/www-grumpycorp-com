import { ingestInput } from "./input";
import { renderSite } from "./render";
import { processAssets } from "./assets";

import rootConfig from "./siteConfig";
import { createSourceFileSystem } from "./fileSystem";

const sourceFileSystem = createSourceFileSystem(rootConfig);

const inputDocumentGroups = ingestInput(rootConfig, sourceFileSystem);

processAssets(rootConfig, sourceFileSystem.inputFiles);
processAssets(rootConfig, sourceFileSystem.themeFiles);

renderSite(rootConfig, inputDocumentGroups);
