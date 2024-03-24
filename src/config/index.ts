import { InputDocument } from "../input/inputDocument";

export type DocumentGroupConfig = {
  documentGroupName: string;
  inputRelativePath: string;
};

export type RootConfig = {
  inputRootPath: string;
  outputRootPath: string;
  documentGroups: DocumentGroupConfig[];
};
