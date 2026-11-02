import { describe, expect, it } from "vitest";
import { htmlToMarkdown, markdownToHtml, markdownToText, parseMarkdown, escapeHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  it("converts headings, emphasis and inline code", () => {
    const html = markdownToHtml("## Title\n\nSome **bold**, *italic* and `code`.");
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<code>code</code>");
  });

  it("converts lists and blockquotes", () => {
    const html = markdownToHtml("- one\n- two\n\n> quoted");
    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain("<blockquote>quoted</blockquote>");
  });

  it("keeps fenced code verbatim and escapes it", () => {
    const html = markdownToHtml("```html\n<div class=\"x\"></div>\n```");
    expect(html).toContain("&lt;div class=&quot;x&quot;&gt;");
    expect(html).toContain('<pre><code class="language-html">');
  });

  it("escapes raw HTML instead of passing it through", () => {
    const html = markdownToHtml('<script>alert("x")</script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("adds rel attributes to links", () => {
    expect(markdownToHtml("[x](https://example.com)")).toContain('rel="noopener noreferrer nofollow"');
  });
});

describe("parseMarkdown", () => {
  it("produces block nodes in order", () => {
    const blocks = parseMarkdown("# A\n\ntext\n\n1. one\n2. two");
    expect(blocks.map((block) => block.type)).toEqual(["heading", "paragraph", "list"]);
  });
});

describe("htmlToMarkdown", () => {
  it("converts headings, emphasis and links", () => {
    const markdown = htmlToMarkdown(
      '<h2>Title</h2><p>Hello <strong>world</strong> &amp; <a href="https://x.com">link</a></p>',
    );
    expect(markdown).toContain("## Title");
    expect(markdown).toContain("Hello **world** & [link](https://x.com)");
  });

  it("converts lists and code blocks", () => {
    const markdown = htmlToMarkdown("<ul><li>a</li><li>b</li></ul><pre><code>const x = 1;</code></pre>");
    expect(markdown).toContain("- a\n- b");
    expect(markdown).toContain("```\nconst x = 1;\n```");
  });

  it("removes scripts and styles", () => {
    const markdown = htmlToMarkdown("<style>.a{}</style><script>alert(1)</script><p>Safe</p>");
    expect(markdown).toBe("Safe");
  });

  it("decodes common entities", () => {
    expect(htmlToMarkdown("<p>5 &lt; 10 &amp;&amp; 10 &gt; 5</p>")).toBe("5 < 10 && 10 > 5");
  });
});

describe("markdownToText", () => {
  it("strips markup for plain text", () => {
    expect(markdownToText("## Title\n\nSome **bold** text.")).toContain("Some bold text.");
  });
});

describe("escapeHtml", () => {
  it("escapes the five reserved characters", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
  });
});
