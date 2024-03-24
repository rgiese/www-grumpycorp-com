import { ingestInput } from "./input";
import { renderSite } from "./render";

import rootConfig from "./siteConfig";

const inputDocumentGroups = ingestInput(rootConfig);
renderSite(rootConfig, inputDocumentGroups);
