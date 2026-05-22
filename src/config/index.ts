import { DirectiveConfig } from "marked-directive";

import { InputDocument, RenderContextGenerator, GeneratedDocumentsGenerator } from "../types";

export interface DocumentGroupConfig {
  // About
  documentGroupName: string;
  // Input
  inputRootRelativePath: string;
  requirePublishDate: boolean;
  // Render
  templateName: string;
  templateRenderContext?: RenderContextGenerator;
  // Output
  outputPathFromDocumentPath: (inputDocument: InputDocument) => string;
}

export interface SvgToCssConfig {
  inputRootRelativePath: string;
  siteRelativeOutputPath: string;
}

export interface Redirect {
  source: string;
  destination: string;
  code?: number;
}

export interface RootConfig {
  // Source
  inputRootPath: string;
  themeRootPath: string;

  // Input
  documentGroups: DocumentGroupConfig[];
  generatedDocuments: GeneratedDocumentsGenerator | undefined;

  // Transform
  customDirectives: DirectiveConfig[];
  defaultImageSizes: string[]; // for figureDirective, c.f. <img ... sizes="">

  // Asset transcodes
  svgToCssTranscodes: SvgToCssConfig[];

  // Redirects
  redirects: Redirect[];

  // Destination
  outputRootPath: string;
}
