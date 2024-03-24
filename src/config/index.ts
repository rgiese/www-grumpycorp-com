import { InputDocument } from "../input/inputDocument";

export type DocumentGroupConfig = {
  documentGroupName: string;
  inputRelativePath: string;
  ouputPathFromDocumentPath: (inputDocument: InputDocument) => string;
};

export type RootConfig = {
  inputRootPath: string;
  outputRootPath: string;
  documentGroups: DocumentGroupConfig[];
};
