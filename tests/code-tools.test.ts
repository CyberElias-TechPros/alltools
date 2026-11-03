import { describe, expect, it } from "vitest";
import { beautifyCode, formatBytes, minifyCss, minifyHtml, minifyJs } from "@/lib/format";
import { csvToJson, inspectJson, jsonToCsv, parseCsv } from "@/lib/tabular";
import { formatXml, validateXml } from "@/lib/xml";
import { characterSets, crackTime, generatePassword, passwordEntropy, strengthOf } from "@/lib/passwords";
import { buildGradientValue, buildShadowValue, hexToRgb, normaliseHex, parseColour, rgbToHexValue } from "@/lib/css-gen";
import { explainRegex } from "@/lib/regex";

describe("code formatting", () => {
  it("beautifies JavaScript", () => {
    const out = beautifyCode("js", "function a(){return 1}");
    expect(out).toContain("function a() {");
    expect(out).toContain("  return 1");
  });

  it("beautifies CSS and HTML", () => {
    expect(beautifyCode("css", "a{color:red}")).toContain("a {");
    expect(beautifyCode("html", "<div><p>hi</p></div>")).toContain("<div>");
  });
});

describe("CSS minifier", () => {
  it("removes comments and redundant whitespace", () => {
    const input = `/* hi */\n.card {\n  color: red;\n  padding : 0 10px ;\n}`;
    expect(minifyCss(input)).toBe(".card{color:red;padding:0 10px}");
  });

  it("keeps strings, url() and calc() spacing intact", () => {
    const out = minifyCss(`a { content: "a ; b"; background: url( "x y.png" ); width: calc(100% - 10px); }`);
    expect(out).toContain('"a ; b"');
    expect(out).toContain("calc(100% - 10px)");
  });

  it("drops the trailing semicolon but keeps media queries readable", () => {
    expect(minifyCss("@media (max-width: 600px) { a { color: red; } }")).toBe(
      "@media (max-width:600px){a{color:red}}",
    );
  });
});

describe("HTML minifier", () => {
  it("collapses whitespace and strips comments", () => {
    const out = minifyHtml(`<div>\n  <!-- note -->\n  <p>Hello   world</p>\n</div>`);
    expect(out).toBe("<div><p>Hello world</p></div>");
  });

  it("preserves pre and textarea content", () => {
    const out = minifyHtml("<pre>  a\n  b</pre>");
    expect(out).toBe("<pre>  a\n  b</pre>");
  });
});

describe("JS minifier", () => {
  it("minifies with a real parser and reports sizes", async () => {
    const result = await minifyJs("function add(a, b) {\n  return a + b;\n}\nconsole.log(add(1, 2));");
    expect(result.error).toBeUndefined();
    expect(result.code.length).toBeLessThan(70);
    expect(result.after).toBeGreaterThan(0);
    expect(result.code).toContain("function add");
  });

  it("reports a syntax error instead of emitting broken code", async () => {
    const result = await minifyJs("function (");
    expect(result.error).toBeTruthy();
    expect(result.code).toBe("");
  });
});

describe("json <-> csv", () => {
  it("converts an array of objects", () => {
    const { csv, columns, rowCount } = jsonToCsv('[{"name":"Ada","age":36},{"name":"Lin, Jr","age":41}]');
    expect(columns).toEqual(["name", "age"]);
    expect(rowCount).toBe(2);
    expect(csv).toBe('name,age\nAda,36\n"Lin, Jr",41');
  });

  it("flattens nested objects and stringifies arrays", () => {
    const { csv } = jsonToCsv('[{"user":{"name":"Ada","tags":["x","y"]}}]');
    expect(csv).toBe('user.name,user.tags\nAda,"[""x"",""y""]"');
  });

  it("round-trips through the CSV parser", () => {
    const parsed = parseCsv('a,b\n1,"x,y"\n2,"say ""hi"""');
    expect(parsed.rows).toEqual([
      ["a", "b"],
      ["1", "x,y"],
      ["2", 'say "hi"'],
    ]);
  });

  it("builds JSON from CSV with type inference", () => {
    const { json, rowCount } = csvToJson("name,score\nAda,36\nLin,41.5", { indent: 0 });
    expect(rowCount).toBe(2);
    expect(json).toBe('[{"name":"Ada","score":36},{"name":"Lin","score":41.5}]');
  });

  it("supports headerless CSV", () => {
    const { json } = csvToJson("1,2\n3,4", { header: false, indent: 0 });
    expect(json).toBe("[[1,2],[3,4]]");
  });

  it("rejects invalid JSON with a helpful message", () => {
    expect(() => jsonToCsv("{oops}")).toThrow(/not valid JSON/);
  });
});

describe("json inspection", () => {
  it("reports stats for valid JSON", () => {
    const stats = inspectJson('{"a":[1,2],"b":{"c":true}}');
    expect(stats.valid).toBe(true);
    expect(stats.keys).toBe(3);
    expect(stats.depth).toBe(3);
    expect(stats.type).toBe("object");
  });

  it("locates a syntax error", () => {
    const stats = inspectJson('{\n  "a": 1,\n}');
    expect(stats.valid).toBe(false);
    expect(stats.error?.line).toBe(3);
  });
});

describe("xml", () => {
  it("formats nested markup", () => {
    const out = formatXml('<catalog><book id="1"><title>Dune</title></book></catalog>', { indent: 2 });
    expect(out).toBe(
      ['<catalog>', '  <book id="1">', "    <title>Dune</title>", "  </book>", "</catalog>"].join("\n"),
    );
  });

  it("keeps declarations and comments", () => {
    const out = formatXml('<?xml version="1.0"?><!-- c --><a><b/></a>');
    expect(out.split("\n")).toEqual(['<?xml version="1.0"?>', "<!-- c -->", "<a>", "  <b/>", "</a>"]);
  });

  it("accepts well-formed documents", () => {
    expect(validateXml('<a x="1"><b>t</b><!-- c --></a>').valid).toBe(true);
  });

  it("rejects mismatched and unclosed tags", () => {
    expect(validateXml("<a><b></a></b>").valid).toBe(false);
    expect(validateXml("<a><b></b>").issue?.message).toMatch(/never closed/);
    expect(validateXml("<a><b></a></b>").issue?.message).toMatch(/does not match/);
  });

  it("rejects unquoted attributes and multiple roots", () => {
    expect(validateXml('<a href=x></a>').valid).toBe(false);
    expect(validateXml("<a/><b/>").valid).toBe(false);
  });
});

describe("passwords", () => {
  const options = {
    length: 20,
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
    requireEach: true,
  };

  it("uses the requested length and includes every selected set", () => {
    const password = generatePassword(options);
    expect(password).toHaveLength(20);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()\-_=+[\]{};:,.?/]/);
  });

  it("removes ambiguous characters when asked", () => {
    const sets = characterSets({ ...options, excludeAmbiguous: true });
    expect(sets.join("")).not.toMatch(/[0O1lI|`'"]/);
  });

  it("is not obviously repetitive", () => {
    const a = generatePassword(options);
    const b = generatePassword(options);
    expect(a).not.toBe(b);
  });

  it("computes entropy and labels", () => {
    expect(passwordEntropy(options)).toBeGreaterThan(120);
    expect(strengthOf(30).label).toBe("Weak");
    expect(strengthOf(95).label).toBe("Excellent");
    expect(crackTime(128)).toMatch(/age of the universe/);
  });
});

describe("css builders", () => {
  it("builds gradients with sorted stops", () => {
    const value = buildGradientValue({
      type: "linear",
      angle: 135,
      stops: [
        { color: "#fff", position: 100 },
        { color: "#000", position: 0 },
      ],
    });
    expect(value).toBe("linear-gradient(135deg, #000 0%, #fff 100%)");
  });

  it("builds radial and conic gradients", () => {
    expect(
      buildGradientValue({ type: "radial", angle: 0, stops: [{ color: "red", position: 0 }, { color: "blue", position: 100 }] }),
    ).toContain("radial-gradient(circle at 50% 50%");
    expect(
      buildGradientValue({ type: "conic", angle: 90, stops: [{ color: "red", position: 0 }, { color: "blue", position: 100 }] }),
    ).toContain("conic-gradient(from 90deg");
  });

  it("builds multi-layer shadows and skips empty layers", () => {
    const value = buildShadowValue([
      { x: 0, y: 1, blur: 2, spread: 0, color: "rgba(0,0,0,.2)", inset: false },
      { x: 0, y: 0, blur: 0, spread: 0, color: "red", inset: false },
      { x: 0, y: 1, blur: 0, spread: 0, color: "rgba(0,0,0,.1)", inset: true },
    ]);
    expect(value).toBe("0px 1px 2px 0px rgba(0,0,0,.2), inset 0px 1px 0px 0px rgba(0,0,0,.1)");
  });

  it("converts colours between notations", () => {
    expect(normaliseHex("abc")).toBe("#aabbcc");
    expect(hexToRgb("#3366cc")).toEqual({ r: 51, g: 102, b: 204, a: 1 });
    expect(rgbToHexValue(51, 102, 204)).toBe("#3366cc");
    expect(parseColour("rgb(51 102 204)")?.hex).toBe("#3366cc");
    expect(parseColour("#3366cc")?.hslString).toBe("hsl(220 60% 50%)");
    expect(parseColour("not a colour")).toBeNull();
  });

  it("formats byte sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1500)).toBe("1.5 KB");
  });
});

describe("regex explainer", () => {
  it("explains anchors, classes and quantifiers", () => {
    const { parts, valid } = explainRegex("^\\d{2,4}$");
    expect(valid).toBe(true);
    expect(parts.map((part) => part.label)).toEqual([
      "Start anchor",
      "Character class",
      "Repetition",
      "End anchor",
    ]);
    expect(parts[2].detail).toBe("between 2 and 4 times");
  });

  it("describes groups and lookarounds with depth", () => {
    const { parts } = explainRegex("(?<year>\\d{4})-(?=x)");
    expect(parts[0].label).toBe("Named capture group");
    expect(parts.some((part) => part.label === "Lookahead (positive)")).toBe(true);
  });

  it("flags invalid patterns", () => {
    expect(explainRegex("(abc").valid).toBe(false);
    expect(explainRegex("[abc").error).toMatch(/never closed/);
    expect(explainRegex("(").valid).toBe(false);
  });
});
