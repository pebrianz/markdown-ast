import { describe, it, expect } from "vitest";
import dedent from "dedent";

import {
	NodeTypes,
	type createNode,
	tokenize,
	parse,
} from "../../build/debug.js";

type Node = Omit<
	Omit<ReturnType<typeof createNode>, "attributes">,
	"childNodes"
> & { childNodes: Node[] };

describe("blockquotes", async () => {
	it("should parse blockquotes", () => {
		const src = "> this is blockquotes";

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedResult: Node = {
			type: NodeTypes.Blockquotes,
			textContent: "",
			childNodes: [
				{
					type: NodeTypes.Paragraph,
					textContent: "this is blockquotes",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: "this is blockquotes",
							childNodes: [],
						},
					],
				},
			],
		};
		expect(ast.childNodes[0]).toMatchObject(expectedResult);
	});

	it("should parse blockquotes with multiple paragraph", () => {
		const src = dedent`
      > this is first paragraph
      >
      > this is second paragraph
    `;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const firstParagraph: Node = {
			type: NodeTypes.Paragraph,
			textContent: "this is first paragraph",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "this is first paragraph",
					childNodes: [],
				},
			],
		};
		const secondParagraph: Node = {
			type: NodeTypes.Paragraph,
			textContent: "this is second paragraph",
			childNodes: [
				{
					type: NodeTypes.Text,
					textContent: "this is second paragraph",
					childNodes: [],
				},
			],
		};
		expect(ast.childNodes[0].childNodes).toMatchObject([
			firstParagraph,
			secondParagraph,
		]);
	});

	it("should parse nested blockquotes", () => {
		const src = dedent`
      > this is blockquotes
      > > this is nested blockquotes
    `;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedBlockquotes: Node = {
			type: NodeTypes.Blockquotes,
			textContent: "",
			childNodes: [
				{
					type: NodeTypes.Paragraph,
					textContent: "this is blockquotes",
					childNodes: [
						{
							type: NodeTypes.Text,
							textContent: "this is blockquotes",
							childNodes: [],
						},
					],
				},
				{
					type: NodeTypes.Blockquotes,
					textContent: "",
					childNodes: [
						{
							type: NodeTypes.Paragraph,
							textContent: "this is nested blockquotes",
							childNodes: [
								{
									type: NodeTypes.Text,
									textContent: "this is nested blockquotes",
									childNodes: [],
								},
							],
						},
					],
				},
			],
		};
		expect(ast.childNodes).toMatchObject([expectedBlockquotes]);
	});

	it("should parse list in blockquotes", () => {
		const src = dedent`
	     > - first item
	     > - second item
	     >   paragraph inside second item
	   `;

		const tokens = tokenize(src);
		const ast = parse(tokens);

		const expectedBlockquotes: Node = {
			type: NodeTypes.Blockquotes,
			textContent: "",
			childNodes: [
				{
					type: NodeTypes.List,
					textContent: "",
					childNodes: [
						{
							type: NodeTypes.ListItem,
							textContent: "",
							childNodes: [
								{
									type: NodeTypes.Paragraph,
									textContent: "first item",
									childNodes: [
										{
											type: NodeTypes.Text,
											textContent: "first item",
											childNodes: [],
										},
									],
								},
							],
						},
						{
							type: NodeTypes.ListItem,
							textContent: "",
							childNodes: [
								{
									type: NodeTypes.Paragraph,
									textContent: "second item",
									childNodes: [
										{
											type: NodeTypes.Text,
											textContent: "second item",
											childNodes: [],
										},
									],
								},
								{
									type: NodeTypes.Paragraph,
									textContent: "paragraph inside second item",
									childNodes: [
										{
											type: NodeTypes.Text,
											textContent: "paragraph inside second item",
											childNodes: [],
										},
									],
								},
							],
						},
					],
				},
			],
		};
		expect(ast.childNodes).toMatchObject([expectedBlockquotes]);
	});
});
