import { ingestInput } from "./input";
import { renderSite } from "./render";
import { processAssets } from "./assets";

import rootConfig from "./siteConfig";

const inputDocumentGroups = ingestInput(rootConfig);
renderSite(rootConfig, inputDocumentGroups);
processAssets(rootConfig);
