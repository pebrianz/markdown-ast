# Supported Markdown Syntax Reference

## 1. Headings

Use number signs (`#`) to denote headings, from level 1 to level 6:

```markdown
# Heading level 1
## Heading level 2
### Heading level 3
#### Heading level 4
##### Heading level 5
###### Heading level 6
```

---

## 2. Paragraphs

```markdown
This is a paragraph.

This is another paragraph.
```

Do not indent paragraphs with spaces or tabs, unless the text is part of a list item.

---

## 5. Emphasis

```markdown
**bold text** *italic text* ***Bold and italic***
```
---

## 5. Blockquotes

Use `>` to create a blockquote. Blockquotes can contain multiple paragraphs, headings, lists, and even other blockquotes.

```markdown
> This is a blockquote.
```

### Multiple Paragraphs

Add a blank line between paragraphs inside the blockquote:

```markdown
> This is the first paragraph.
>
> This is the second paragraph inside the same blockquote.
```

### Nested Blockquotes

Add an extra `>` for each nesting level:

```markdown
> Top-level quote
> > Nested quote
> > > Third level quote
```

### Other Elements Inside

Blockquotes can also include other element:

```markdown
> ## Quoted Heading
>
> - Item one
> - Item two
>   Paragraph inside list item two
```

---

## 7. Lists

### Unordered Lists

Use any of the following indicators:

```markdown
- Item one
* Item two
+ Item three
```

### Ordered Lists

Use numeric indicators:

```markdown
1. First item
2. Second item
3. Third item
```

---

### Nested Lists

To nest a list, indent by **2 spaces** for each level of depth.
If the level is higher, it moves further to the right as a nested list.

```markdown
- Item one
  - Nested item (level 2)
    - Deeper nested item (level 3)
- Item two
```

---

### Mixing Ordered and Unordered Lists

Lists may be freely combined:

```markdown
1. First item
  - Sub-item A
  - Sub-item B
2. Second item
  - Sub-item C
    1. Nested ordered item
    2. Another nested ordered item
```

### Mixing Lists with Other Blocks

You can also place other element, like **paragraphs, blockquotes** inside mixed lists by indenting them correctly.

```markdown
1. First item
  - Sub-item with a paragraph:

    This is a paragraph inside a nested unordered list.

  - Sub-item with a blockquote:
    > Quoted text inside a nested list item.

2. Second item
  - Sub-item with code:

  - Sub-item with an image:
```

---

## 8. Code

### Inline Code

Wrap text in single backticks:

```markdown
Use the `git status` command.
```

### Code Blocks

Use triple backticks:

\```

function example() {
return true;
}

\```

---

## 9. Horizontal Rule

Create a horizontal rule using three or more hyphens, asterisks, or underscores:

```markdown
---
```

---

## 10. Links and Images

### Links

```markdown
[Link text](https://example.com "Optional title")
```

### Images

```markdown
![Alt text](https://example.com/image.jpg "Optional title")
```

---

## 11. Tables

Supported using pipe (`|`) syntax and hyphens (`---`):

```markdown
| Column 1 | Column 2 |
|----------|----------|
| A        | B        |
| C        | D        |
```

---

## 12. Reference-Style Links

In addition to inline links, you can use reference-style links to keep your Markdown clean and easier to read.

### Syntax

```markdown
[Link text][id]

[id]: https://www.markdownguide.org "Optional title"
```

### Example

```markdown
You can learn more at the [Markdown Guide][guide].

[guide]: https://www.markdownguide.org "Markdown Guide"
```

---

## 14. HTML Support

Your parser allows inline HTML tags within Markdown, offering flexibility to add elements like:

```markdown
<p>This is a paragraph with <em>HTML</em> markup inside.</p>
```

---
