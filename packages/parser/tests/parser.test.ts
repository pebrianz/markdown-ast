import { describe, it, expect } from "vitest";
import dedent from "dedent";

import {
	NodeTypes,
	type createNode,
	getMapValue,
	tokenize,
	parse,
} from "../build/debug.js";

type Node = Omit<
	Omit<ReturnType<typeof createNode>, "attributes">,
	"childNodes"
> & { childNodes: Node[] };

describe("parser", async () => {
	it("should parse heading, paragraph and text", () => {
		const src = dedent`
      # heading
      this is paragraph
    `;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedHeading: Node = {
			type: NodeTypes.Heading,
			textContent: "heading",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "heading",
					childNodes: [],
				},
			],
		};
		const expectedParagraph: Node = {
			type: NodeTypes.Paragraph,
			textContent: "this is paragraph",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "this is paragraph",
					childNodes: [],
				},
			],
		};

		expect(ast.childNodes).toMatchObject([
			expectedHeading,
			expectedParagraph,
		]);
	});

	it.each([["*"]])("should parse bold italic", (mark) => {
		const src = `${mark}italic${mark} ${mark + mark}bold${mark + mark} ${mark + mark + mark}italicbold${mark + mark + mark}`;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedItalic: Node = {
			type: NodeTypes.Italic,
			textContent: "italic",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "italic",
					childNodes: [],
				},
			],
		};
		const expectedBold: Node = {
			type: NodeTypes.Bold,
			textContent: "bold",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "bold",
					childNodes: [],
				},
			],
		};
		const expectedItalicBold: Node = {
			type: NodeTypes.BlockItalic,
			textContent: "italicbold",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "italicbold",
					childNodes: [],
				},
			],
		};

		const space: Node = {
			type: NodeTypes.Text,
			textContent: " ",
			childNodes: [],
		};

		const expectedResult = [
			expectedItalic,
			space,
			expectedBold,
			space,
			expectedItalicBold,
		];

		const paragraph = ast.childNodes[0];
		expect(paragraph.childNodes).toMatchObject(expectedResult);
	});

	it("should parse code", () => {
		const src = "`code \\` **hello** world` and text";

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedResult: Node[] = [
			{
				type: NodeTypes.Code,
				textContent: "code ` **hello** world",
				childNodes: [],
			},
			{
				type: NodeTypes.Text,
				textContent: " and text",
				childNodes: [],
			},
		];

		const paragraph = ast.childNodes[0];
		expect(paragraph.childNodes).toMatchObject(expectedResult);
	});

	it("should parse table", () => {
		const src = dedent`
      | header1 | header2 | header3 |
      |---|:---:|---:
      | cellA | cellB | cellC |
    `;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedHeader: Node = {
			type: NodeTypes.TableHeader,
			textContent: "",
			childNodes: [
				{
					type: NodeTypes.TableCell,
					textContent: " header1 ",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: " header1 ",
							childNodes: [],
						},
					],
				},
				{
					type: NodeTypes.TableCell,
					textContent: " header2 ",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: " header2 ",
							childNodes: [],
						},
					],
				},
				{
					type: NodeTypes.TableCell,
					textContent: " header3 ",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: " header3 ",
							childNodes: [],
						},
					],
				},
			],
		};
		const expectedRow: Node = {
			type: NodeTypes.TableRow,
			textContent: "",
			childNodes: [
				{
					type: NodeTypes.TableCell,
					textContent: " cellA ",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: " cellA ",
							childNodes: [],
						},
					],
				},
				{
					type: NodeTypes.TableCell,
					textContent: " cellB ",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: " cellB ",
							childNodes: [],
						},
					],
				},
				{
					type: NodeTypes.TableCell,
					textContent: " cellC ",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: " cellC ",
							childNodes: [],
						},
					],
				},
			],
		};
		const expectedTable: Node = {
			type: NodeTypes.Table,
			textContent: "",
			childNodes: [expectedHeader, expectedRow],
		};

		const table = ast.childNodes[0];
		expect(table).toMatchObject(expectedTable);

		const align = getMapValue(table.attributes, "align");
		expect(align).toBe("left|center|right");
	});

	it("should parse horizontal rule", () => {
		const src = "---";

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedResult: Node = {
			type: NodeTypes.HorizontalRule,
			textContent: "",
			childNodes: [],
		};
		expect(ast.childNodes[0]).toMatchObject(expectedResult);
	});

	it("should parse highlight", () => {
		const src = "this is ==highlight==";

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedResult: Node = {
			type: NodeTypes.Highlight,
			textContent: "highlight",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "highlight",
					childNodes: [],
				},
			],
		};
		const paragraph = ast.childNodes[0];
		expect(paragraph.childNodes[1]).toMatchObject(expectedResult);
	});

	it("should parse html tag", () => {
		const src = dedent`
			<div foo="bar">this is
			text</div>
		`;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expected: Node[] = [
			{
				type: NodeTypes.Paragraph,
				textContent: `<div foo="bar">this is`,
				childNodes: [
					{
						type: NodeTypes.HtmlTag,
						textContent: `<div foo="bar">`,
						childNodes: [],
					},
					{
						type: NodeTypes.Text,
						textContent: "this is",
						childNodes: [],
					},
				],
			},
			{
				type: NodeTypes.Paragraph,
				textContent: "text</div>",
				childNodes: [
					{
						type: NodeTypes.Text,
						textContent: "text",
						childNodes: [],
					},
					{
						type: NodeTypes.HtmlTag,
						textContent: "</div>",
						childNodes: [],
					},
				],
			},
		];
		expect(ast.childNodes).toMatchObject(expected);
	});

	it("should parse fenced code block", () => {
		const src = dedent`
      \`\`\`ts
      let a = "hello world"
      console.log(a)
      \`\`\`
    `;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expected: Node = {
			type: NodeTypes.Fenced,
			childNodes: [],
			textContent: '```ts\nlet a = "hello world"\nconsole.log(a)',
		};
		expect(ast.childNodes[0]).toMatchObject(expected);
	});
});
