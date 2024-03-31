import { DirectiveConfig } from "marked-directive";

import { InputDocument, RenderContextGenerator, GeneratedDocumentsGenerator } from "../types";

export type DocumentGroupConfig = {
  // About
  documentGroupName: string;
  // Input
  inputRootRelativePath: string;
  requirePublishDate: boolean;
  // Render
  templateName: string;
  templateRenderContext: RenderContextGenerator | undefined;
  // Output
  outputPathFromDocumentPath: (inputDocument: InputDocument) => string;
};

export type SvgToCssConfig = {
  inputRootRelativePath: string;
  siteRelativeOutputPath: string;
};

export type RootConfig = {
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

  // Destination
  outputRootPath: string;
};
