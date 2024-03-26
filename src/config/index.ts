import { InputDocument } from "../input/inputDocument";

export type DocumentGroupConfig = {
  // About
  documentGroupName: string;
  // Input
  inputRootRelativePath: string;
  requirePublishDate: boolean;
  // Render
  templateName: string;
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
