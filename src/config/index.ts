import { InputDocument } from "../input/inputDocument";

export type DocumentGroupConfig = {
  documentGroupName: string;
  inputRootRelativePath: string;
  outputPathFromDocumentPath: (inputDocument: InputDocument) => string;
  templateName: string;
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
