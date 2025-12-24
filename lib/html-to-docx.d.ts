// lib/html-to-docx.d.ts
declare module "html-to-docx" {
  interface DocumentOptions {
    orientation?: "portrait" | "landscape";
    margin?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    font?: string;
    fontSize?: number;
    pageNumber?: boolean;
    [key: string]: unknown;
  }

  function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString?: string,
    options?: DocumentOptions,
    footerHTMLString?: string
  ): Promise<Buffer>;

  export default HTMLtoDOCX;
}
