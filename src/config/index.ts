import { InputDocument, InputDocumentInventory } from "../input/inputDocument";

export type RenderContextGenerator = (
  inputDocument: InputDocument,
  inputDocumentInventory: InputDocumentInventory,
) => object;

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

  // Transformation
  documentGroups: DocumentGroupConfig[];

  // Destination
  outputRootPath: string;
};
