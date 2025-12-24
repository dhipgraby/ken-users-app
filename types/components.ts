export enum Stages {
  hidden = "hidden",
  loading = "loading",
  error = "error",
  show = "show",
}

export type FileProps = {
  file: File;
  name: string;
  url: string;
};
