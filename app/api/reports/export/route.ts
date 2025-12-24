import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  TextRun,
  convertInchesToTwip,
  ImageRun,
  PageBreak
} from "docx";
import { parseDocument } from "htmlparser2";
import { Element, Text, isTag, isText } from "domhandler";
import sharp from "sharp";

// Configure the maximum request body size (50MB for large reports)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    }
  }
};

// Helper function to find parent list element
//eslint-disable-next-line
const findParentList = (element: Element, siblings: Element[]): Element | undefined => {
  for (const sibling of siblings) {
    if (sibling.children) {
      for (const child of sibling.children) {
        if (isTag(child) && child === element) {
          if (sibling.name === "ol" || sibling.name === "ul") {
            return sibling;
          }
        }
        if (isTag(child) && child.children) {
          //eslint-disable-next-line
          const found = findParentList(element, child.children as Element[]);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
};

export async function POST(req: Request) {
  try {
    const { htmlString, fileName = "report.docx", reportType = "ghg-statement" } = await req.json();

    if (!htmlString) {
      return NextResponse.json({ error: "htmlString is required" }, { status: 400 });
    }

    // Determine font based on report type
    const fontMap: { [key: string]: string } = {
      "ghg-statement": "Aptos",
      "iso-14064-full": "Poppins",
      "secr": "Times New Roman"
    };
    const primaryFont = fontMap[reportType] || "Aptos";

    console.log(`Generating DOCX export for ${reportType} report with ${primaryFont} font...`);

    // Parse HTML into DOM structure
    const dom = parseDocument(htmlString);
    const docChildren: any[] = [];

    // Helper to clean text
    const cleanText = (text: string): string => {
      return text
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Helper to extract text from element
    const getTextContent = (element: Element): string => {
      let text = "";
      if (element.children) {
        for (const child of element.children) {
          if (isText(child)) {
            text += child.data;
          } else if (isTag(child)) {
            text += getTextContent(child);
          }
        }
      }
      return cleanText(text);
    };

    // Helper to extract alignment from style
    const getAlignment = (element: Element): any|undefined => {
      const style = element.attribs?.style || "";
      if (style.includes("text-align: center") || style.includes("textAlign: center")) {
        return AlignmentType.CENTER;
      }
      if (style.includes("text-align: right") || style.includes("textAlign: right")) {
        return AlignmentType.RIGHT;
      }
      if (style.includes("text-align: justify") || style.includes("textAlign: justify")) {
        return AlignmentType.JUSTIFIED;
      }
      return AlignmentType.LEFT;
    };

    // Helper to extract font size from style (returns half-points for docx, e.g. 24pt = 48)
    const getFontSize = (element: Element, defaultSize: number = 22): number => {
      const style = element.attribs?.style || "";
      const sizeMatch = style.match(/font-size\s*:\s*([\d.]+)pt/i);
      if (sizeMatch) {
        return parseFloat(sizeMatch[1]) * 2;
      }
      return defaultSize;
    };

    // Helper to extract font weight from style
    const getFontBold = (element: Element): boolean => {
      const style = element.attribs?.style || "";
      return style.includes("font-weight: 700") || style.includes("fontWeight: 700") || style.includes("font-weight: bold");
    };

    // Helper to convert element with inline formatting (i, b, strong, etc) to TextRun array
    const convertToTextRuns = (element: Element, defaultSize: number = 22): TextRun[] => {
      const runs: TextRun[] = [];
      if (!element.children) return runs;

      // Check for parent styles that should apply to all children
      const parentSize = getFontSize(element, defaultSize);
      const parentBold = getFontBold(element);

      for (const child of element.children) {
        if (isText(child)) {
          const text = child.data; // Don't use cleanText here to preserve spaces
          if (text.length > 0) {
            runs.push(
              new TextRun({
                text: text,
                font: primaryFont,
                size: parentSize,
                bold: parentBold
              })
            );
          }
        } else if (isTag(child)) {
          const childElement = child as Element;
          const childText = getTextContent(childElement);
          const childSize = getFontSize(childElement, parentSize);
          const childBold = getFontBold(childElement) || parentBold;

          if (childElement.name === "i" || childElement.name === "em") {
            runs.push(
              new TextRun({
                text: childText,
                font: primaryFont,
                size: childSize,
                italics: true,
                bold: childBold
              })
            );
          } else if (childElement.name === "b" || childElement.name === "strong") {
            runs.push(
              new TextRun({
                text: " " + childText, // Add explicit space before bold text
                font: primaryFont,
                size: childSize,
                bold: true
              })
            );
          } else if (childElement.name === "u") {
            runs.push(
              new TextRun({
                text: childText,
                font: primaryFont,
                size: childSize,
                underline: {},
                bold: childBold
              })
            );
          } else if (childElement.name === "ul" || childElement.name === "ol") {
            // Skip nested lists, they are handled separately
            continue;
          } else {
            // Recursively handle nested formatting
            runs.push(...convertToTextRuns(childElement, childSize));
          }
        }
      }
      return runs;
    };

    // Helper to check if element has gray background (for styling)
    const hasGrayBackground = (element: Element): boolean => {
      const style = element.attribs?.style || "";
      return style.includes("background-color") &&
             (style.includes("#F5F5F5") || style.includes("#F3F4F6") || style.includes("rgb(243, 244, 246)"));
    };

    // Helper to extract background color from style attribute
    const extractBackgroundColor = (element: Element): string | null => {
      const style = element.attribs?.style || "";
      const bgColorMatch = style.match(/background-?color\s*:\s*([^;]+)/i);
      if (bgColorMatch) {
        let color = bgColorMatch[1].trim();
        // Convert hex to 6-digit format without #
        if (color.startsWith("#")) {
          color = color.substring(1);
          // Handle 3-digit hex
          if (color.length === 3) {
            color = color.split("").map(c => c + c).join("");
          }
          return color.toUpperCase();
        }
        // Convert rgb() to hex
        const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          return ((r << 16) | (g << 8) | b).toString(16).toUpperCase().padStart(6, "0");
        }
      }
      return null;
    };

    // Helper to check for page breaks
    const getPageBreak = (element: Element): { before: boolean; after: boolean } => {
      const style = element.attribs?.style || "";
      return {
        before: /page-?break-?before\s*:\s*always/i.test(style),
        after: /page-?break-?after\s*:\s*always/i.test(style)
      };
    };

    // Convert HTML table to DOCX table
    const convertTable = (tableElement: Element): Table => {
      const tableRows: TableRow[] = [];

      if (!tableElement.children) return new Table({ rows: [] });

      // Calculate the number of columns
      let columnCount = 0;
      for (const child of tableElement.children) {
        if (isTag(child) && (child.name === "thead" || child.name === "tbody")) {
          for (const row of child.children || []) {
            if (isTag(row) && row.name === "tr") {
              const cellsInRow = (row.children || []).filter(c => isTag(c) && (c.name === "td" || c.name === "th")).length;
              columnCount = Math.max(columnCount, cellsInRow);
            }
          }
        }
      }

      // First, process thead if it exists
      for (const child of tableElement.children) {
        if (isTag(child) && child.name === "thead") {
          for (const row of child.children || []) {
            if (isTag(row) && row.name === "tr") {
              const cells: TableCell[] = [];
              const isGray = hasGrayBackground(row);

              for (const cell of row.children || []) {
                if (isTag(cell) && (cell.name === "td" || cell.name === "th")) {
                  const cellText = getTextContent(cell);
                  const isCellGray = hasGrayBackground(cell);
                  const cellBgColor = extractBackgroundColor(cell);

                  // Determine header cell background color
                  let fillColor = "D9D9D9"; // default header gray
                  if (cellBgColor) {
                    fillColor = cellBgColor;
                  } else if (isGray || isCellGray) {
                    fillColor = "D0CECE";
                  }

                  cells.push(
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: cellText,
                              font: primaryFont,
                              size: 14, // 7pt for header
                              bold: true
                            })
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 0, after: 0 }
                        })
                      ],
                      shading: {
                        fill: fillColor
                      },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
                      },
                      margins: {
                        top: convertInchesToTwip(0.01),
                        bottom: convertInchesToTwip(0.01),
                        left: convertInchesToTwip(0.02),
                        right: convertInchesToTwip(0.02)
                      }
                    })
                  );
                }
              }

              if (cells.length > 0) {
                tableRows.push(new TableRow({ children: cells }));
              }
            }
          }
          break;
        }
      }

      // Then process tbody or remaining rows
      let tbody = tableElement;
      for (const child of tableElement.children) {
        if (isTag(child) && child.name === "tbody") {
          tbody = child;
          break;
        }
      }

      // Process rows
      for (const child of tbody.children || []) {
        if (isTag(child) && child.name === "tr") {
          const cells: TableCell[] = [];
          const isGray = hasGrayBackground(child);

          for (const cell of child.children || []) {
            if (isTag(cell) && (cell.name === "td" || cell.name === "th")) {
              const isHeader = cell.name === "th";
              const isCellGray = hasGrayBackground(cell);
              const cellBgColor = extractBackgroundColor(cell);

              // Get colspan attribute
              const colspan = parseInt(cell.attribs?.colspan || "1");

              // Get text alignment from style
              const style = cell.attribs?.style || "";
              const alignment = (() => {
                if (style.includes("text-align: right") || style.includes("textAlign: right")) {
                  return AlignmentType.RIGHT;
                }
                if (
                  style.includes("text-align: center") ||
                  style.includes("textAlign: center") ||
                  isHeader
                ) {
                  return AlignmentType.CENTER;
                }
                return AlignmentType.LEFT;
              })();

              // Determine cell background color
              let fillColor = "FFFFFF"; // default white
              if (cellBgColor) {
                fillColor = cellBgColor;
              } else if (isHeader || isGray || isCellGray) {
                fillColor = "F3F4F6";
              }

              // Check for italic content
              const hasItalic = cell.children?.some(c => isTag(c) && (c.name === "i" || c.name === "em"));

              // Use convertToTextRuns for proper formatting support
              const textRuns = convertToTextRuns(cell, 20);
              const children = textRuns.length > 0 ? textRuns : [
                new TextRun({
                  text: getTextContent(cell),
                  font: primaryFont,
                  size: 20,
                  bold: isHeader,
                  italics: hasItalic
                })
              ];

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: children,
                      alignment: alignment,
                      spacing: { before: 0, after: 0 }
                    })
                  ],
                  columnSpan: colspan,
                  shading: {
                    fill: fillColor
                  },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
                  },
                  margins: {
                    top: convertInchesToTwip(0.01),
                    bottom: convertInchesToTwip(0.01),
                    left: convertInchesToTwip(0.02),
                    right: convertInchesToTwip(0.02)
                  }
                })
              );
            }
          }

          if (cells.length > 0) {
            tableRows.push(new TableRow({ children: cells }));
          }
        }
      }

      return new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      });
    };

    // Helper to process nested lists with indentation and smaller font
    const processNestedList = (element: Element, level: number) => {
      if (!isTag(element)) return;

      if (element.name === "ul" || element.name === "ol") {
        if (element.children) {
          let itemNumber = 1;
          const indent = convertInchesToTwip(0.25 * level);
          const fontSize = Math.max(20, 22 - (level * 2)); // Decrease font by 2pt per level, min 10pt

          for (const child of element.children) {
            if (isTag(child) && child.name === "li") {
              const liElement = child as Element;
              const textRuns = convertToTextRuns(liElement, fontSize);

              if (textRuns.length > 0) {
                if (element.name === "ol") {
                  // For ordered lists, prepend number
                  const runs = [
                    new TextRun({
                      text: `${itemNumber}. `,
                      font: primaryFont,
                      size: fontSize
                    }),
                    ...textRuns
                  ];
                  docChildren.push(
                    new Paragraph({
                      children: runs,
                      indent: { left: indent },
                      spacing: { after: 100 }
                    })
                  );
                  itemNumber++;
                } else {
                  docChildren.push(
                    new Paragraph({
                      children: textRuns,
                      bullet: {
                        level: level
                      },
                      indent: { left: indent },
                      spacing: { after: 100 }
                    })
                  );
                }
              }

              // Process further nested lists
              if (child.children) {
                for (const nestedChild of child.children) {
                  if (isTag(nestedChild) && (nestedChild.name === "ol" || nestedChild.name === "ul")) {
                    processNestedList(nestedChild, level + 1);
                  }
                }
              }
            }
          }
        }
      }
    };

    // Process DOM nodes recursively
    const processNode = async (node: Element | Text) => {
      if (isText(node)) {
        const text = cleanText(node.data);
        if (text.length > 0) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  font: primaryFont,
                  size: 22 // 11pt
                })
              ],
              spacing: { after: 200 }
            })
          );
        }
        return;
      }

      if (!isTag(node)) return;

      const element = node as Element;

      switch (element.name) {
        case "h1":
          docChildren.push(
            new Paragraph({
              text: getTextContent(element),
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 300 },
              keepNext: true,
              run: {
                font: primaryFont,
                size: 36, // 18pt
                bold: true,
                color: "0F5E59" // Brand color
              }
            })
          );
          break;

        case "h2":
          docChildren.push(
            new Paragraph({
              text: getTextContent(element),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 240 },
              keepNext: true,
              run: {
                font: primaryFont,
                size: 28, // 14pt
                bold: true
              }
            })
          );
          break;

        case "h3":
          docChildren.push(
            new Paragraph({
              text: getTextContent(element),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 240, after: 200 },
              keepNext: true,
              run: {
                font: primaryFont,
                size: 24, // 12pt
                bold: true
              }
            })
          );
          break;

        case "h4":
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: getTextContent(element),
                  font: primaryFont,
                  size: 22, // 11pt
                  bold: true
                })
              ],
              spacing: { before: 200, after: 160 },
              keepNext: true
            })
          );
          break;

        case "p": {
          const textRuns = convertToTextRuns(element, 22);
          const alignment = getAlignment(element);
          if (textRuns.length > 0) {
            docChildren.push(
              new Paragraph({
                children: textRuns,
                alignment: alignment,
                spacing: { after: 200 }
              })
            );
          }
          break;
        }

        case "table":
          docChildren.push(convertTable(element));
          docChildren.push(
            new Paragraph({
              text: "",
              spacing: { after: 300 }
            })
          );
          break;

        case "img": {
          // Handle images (charts converted to base64 OR external URLs)
          const src = element.attribs?.src || "";
          let imageBuffer: Buffer | null = null;

          try {
            if (src.startsWith("data:image")) {
              const base64Data = src.split(",")[1];
              imageBuffer = Buffer.from(base64Data, "base64");
            } else if (src.startsWith("http") || src.startsWith("/")) {
              // Fetch external image
              // If relative URL, prepend base URL if possible, or skip if we can't resolve
              let fetchUrl = src;
              if (src.startsWith("/")) {
                // Try to resolve relative URL using NEXT_PUBLIC_USERS_API or similar
                // Assuming the API is running on the same host or accessible
                // For now, we might skip relative URLs if we don't have a base,
                // but let's try to use the USERS_API env var if available
                const apiBase = process.env.NEXT_PUBLIC_USERS_API || process.env.USERS_API;
                if (apiBase) {
                  const baseUrl = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
                  fetchUrl = `${baseUrl}${src}`;
                } else {
                  // Fallback: try to fetch relative to localhost if running locally?
                  // Or just skip.
                  console.warn("Skipping relative image URL without base:", src);
                }
              }

              if (fetchUrl.startsWith("http")) {
                const response = await fetch(fetchUrl);
                if (response.ok) {
                  const arrayBuffer = await response.arrayBuffer();
                  imageBuffer = Buffer.from(arrayBuffer);
                } else {
                  console.warn(`Failed to fetch image: ${fetchUrl} - ${response.statusText}`);
                }
              }
            }

            if (imageBuffer) {
              // Check if it's a logo based on alt text
              const isLogo = element.attribs?.alt === "Company Logo";

              // Default dimensions
              let width = 600;
              let height = 375;

              try {
                const metadata = await sharp(imageBuffer).metadata();
                if (metadata.width && metadata.height) {
                  const aspectRatio = metadata.width / metadata.height;

                  if (isLogo) {
                    // Constrain logo to max width 250 and max height 120
                    const maxWidth = 250;
                    const maxHeight = 120;

                    // Calculate scale to fit within bounds while maintaining aspect ratio
                    const widthRatio = maxWidth / metadata.width;
                    const heightRatio = maxHeight / metadata.height;
                    const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale

                    width = Math.round(metadata.width * scale);
                    height = Math.round(metadata.height * scale);
                  } else {
                    // For charts, keep 600 width and calculate height based on aspect ratio
                    width = 550;
                    height = Math.round(width / aspectRatio);
                  }
                }
              } catch (e) {
                console.warn("Failed to get image metadata with sharp, using defaults", e);
                // Fallback to defaults if sharp fails
                if (isLogo) {
                  width = 200;
                  height = 100;
                }
              }

              docChildren.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      type: "png", // Assuming PNG, but docx handles others too usually
                      data: imageBuffer,
                      transformation: {
                        width: width,
                        height: height
                      }
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 300, after: 300 }
                })
              );
            }
          } catch (imgError) {
            console.error("Failed to process image:", imgError);
          }
          break;
        }

        case "ul":
        case "ol":
          if (element.children) {
            let itemNumber = 1;

            for (const child of element.children) {
              if (isTag(child) && child.name === "li") {
                // Use convertToTextRuns to preserve formatting (bold, italic, size)
                const textRuns = convertToTextRuns(child as Element, 22);

                if (textRuns.length > 0) {
                  if (element.name === "ol") {
                    // For ordered lists, add number prefix
                    const numberRun = new TextRun({
                      text: `${itemNumber}. `,
                      font: primaryFont,
                      size: 22
                    });

                    docChildren.push(
                      new Paragraph({
                        children: [numberRun, ...textRuns],
                        spacing: { after: 120 }
                      })
                    );
                    itemNumber++;
                  } else {
                    // For unordered lists, add bullet prefix
                    docChildren.push(
                      new Paragraph({
                        children: textRuns,
                        bullet: {
                          level: 0
                        },
                        spacing: { after: 120 }
                      })
                    );
                  }
                }

                // Now recursively process nested lists
                if (child.children) {
                  for (const nestedChild of child.children) {
                    if (isTag(nestedChild) && (nestedChild.name === "ol" || nestedChild.name === "ul")) {
                      processNestedList(nestedChild, 1);
                    }
                  }
                }
              }
            }
          }
          break;

        case "div":
        case "section": {
          // Check for page breaks
          const pageBreak = getPageBreak(element);

          if (pageBreak.before) {
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
          }

          // Check if this div/section acts as a paragraph (contains text/inline elements only)
          // or if it's a container for other blocks.
          const hasBlockChildren = element.children?.some(child =>
            isTag(child) && ["div", "p", "table", "section", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "img"].includes(child.name)
          );

          if (!hasBlockChildren && element.children && element.children.length > 0) {
            // Treat as paragraph
            const textRuns = convertToTextRuns(element, 22);
            const alignment = getAlignment(element);
            if (textRuns.length > 0) {
              docChildren.push(
                new Paragraph({
                  children: textRuns,
                  alignment: alignment,
                  spacing: { after: 200 }
                })
              );
            }
          } else {
            // Recursively process children
            if (element.children) {
              for (const child of element.children) {
                if (isTag(child) || isText(child)) {
                  await processNode(child);
                }
              }
            }
          }

          if (pageBreak.after) {
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
          }
          break;
        }        default:
          // Process children for unknown tags
          if (element.children) {
            for (const child of element.children) {
              if (isTag(child) || isText(child)) {
                await processNode(child);
              }
            }
          }
      }
    };

    // Process all root nodes
    for (const node of dom.children) {
      await processNode(node as any);
    }

    // Create document with conditional landscape orientation (only for GHG Statement)
    const pageConfig: any = {
      margin: {
        top: convertInchesToTwip(0.75),
        right: convertInchesToTwip(0.5),
        bottom: convertInchesToTwip(0.75),
        left: convertInchesToTwip(0.5)
      }
    };

    // Only GHG Statement uses landscape orientation
    if (reportType === "ghg-statement") {
      pageConfig.size = {
        orientation: "landscape"
      };
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: pageConfig
          },
          children: docChildren.length > 0 ? docChildren : [new Paragraph("Report generated")]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);

    const orientationText = reportType === "ghg-statement" ? "landscape" : "portrait";
    console.log(`DOCX export generated successfully with ${orientationText} orientation and ${primaryFont} font`);

    return new Response(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName.replace(".html", ".docx")}"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { error: "Failed to export document", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
