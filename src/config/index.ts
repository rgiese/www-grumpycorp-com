import { InputDocument, InputDocumentInventory } from "../input/inputDocument";

export type RenderContextGenerator = (
  inputDocument: InputDocument,
  inputDocumentInventory: InputDocumentInventory,
) => object;

export type GeneratedDocument = {
  // Destination
  siteRelativeOutputPath: string;
  // Content
  frontMatter: {
    title: string;
  };
  contentTemplateName: string;
  contentTemplateContext: object;
  // Render
  templateName: string;
  templateRenderContext: object;
};

export type GeneratedDocumentsGenerator = (inputDocumentInventory: InputDocumentInventory) => GeneratedDocument[];

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

export type RootConfig = {
  // Source
  inputRootPath: string;
  themeRootPath: string;

  // Input
  documentGroups: DocumentGroupConfig[];
  generatedDocuments: GeneratedDocumentsGenerator | undefined;

  // Destination
  outputRootPath: string;
};
