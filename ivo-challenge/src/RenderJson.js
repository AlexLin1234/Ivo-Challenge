import React, { useRef } from "react";
import "./styles.css";

function RenderNode({
  node,
  clauseCounter,
  definitionCounter,
  parentTitle
}) {
  if (!node) return null;

  // Recursively render children
  const renderChildren = (children, newParentTitle) =>
    (children || []).map((child, i) => (
      <RenderNode
        key={i}
        node={child}
        clauseCounter={clauseCounter}
        definitionCounter={definitionCounter}
        parentTitle={newParentTitle}
      />
    ));

  // 1) Text nodes
  if (typeof node.text === "string") {
    const style = {
      fontWeight: node.bold ? "bold" : "normal",
      textDecoration: node.underline ? "underline" : "none",
    };

    // Split on newlines and insert <br/>
    const lines = node.text.split("\n");
    return lines.map((line, idx) => (
      <React.Fragment key={idx}>
        <span style={style}>{line}</span>
        {idx < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  }


  // 2) Mentions (highlight text with color)
  if (node.type === "mention") {
    return (
      <span
        className="mention"
        style={{ "--mention-bg": node.color }}
      >
        {renderChildren(node.children, parentTitle)}
      </span>
    );
  }

  // 3) “Parties” block (skip top-level numbering)
  if (node.type === "block" && node.title === "Parties") {
    return <div>{renderChildren(node.children, node.title)}</div>;
  }

  // 4) Clauses (numbered vs lettered)
  if (node.type === "clause") {
    // If inside "Definitions", letter them (a), (b), etc.
    if (parentTitle === "Definitions") {
      definitionCounter.current++;
      const letter = String.fromCharCode(96 + definitionCounter.current/2); 
      return (
        <div style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
          <span>({letter}) </span>
          {renderChildren(node.children, node.title)}
        </div>
      );
    }

    // Otherwise, top-level clauses
    const skipNumberingTitles = ["Business Day definition", "Charges definition"];
    if (skipNumberingTitles.includes(node.title)) {
      // Don’t increment or show a number
      return <div>{renderChildren(node.children, node.title)}</div>;
    }
    // Number this clause
    const num = ++clauseCounter.current;

    // If "Definitions" at top level, reset sub-definition letters
    if (node.title === "Definitions") {
      definitionCounter.current = 0;
    }

    // Check if clause has a heading child
    const hasChildHeading = node.children?.some(
      (c) => ["h1","h2","h3","h4"].includes(c.type)
    );

    return (
      <div style={{ marginTop: "1rem" }}>
        {/* If no child heading, show number + title here */}
        {!hasChildHeading && (
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            {num}. {node.title}
          </div>
        )}
        {/* If there's a child heading, show number only */}
        {hasChildHeading && (
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            {num}.
          </div>
        )}

        {renderChildren(node.children, node.title)}
      </div>
    );
  }
  

  // 5) Lists
  if (node.type === "ul") {
    return <ul>{renderChildren(node.children, parentTitle)}</ul>;
  }
  if (node.type === "ol") {
    return <ol>{renderChildren(node.children, parentTitle)}</ol>;
  }
  if (node.type === "li") {
    return <li>{renderChildren(node.children, parentTitle)}</li>;
  }
  if (node.type === "lic") {
    return <>{renderChildren(node.children, parentTitle)}</>;
  }

  // 6) Headings / Paragraphs / etc.
  switch (node.type) {
    case "h1":
      return <h1>{renderChildren(node.children, parentTitle)}</h1>;
      case "h4":
        // For headings, render their children. If those children have \n, they become new lines.
        return <h4>{node.children?.map((child, i) => <RenderNode key={i} node={child} />)}</h4>;
    case "block":
      return <div>{renderChildren(node.children, parentTitle)}</div>;
    case "p": {
      // If paragraph is empty after trimming, skip
      const onlyWhitespace = 
        node.children?.every(
          (child) => typeof child.text === "string" && !child.text.trim()
        );
      if (onlyWhitespace) return null;
      return <p>{renderChildren(node.children, parentTitle)}</p>;
    }
    default:
      return <>{renderChildren(node.children, parentTitle)}</>;
  }
}

export default function RenderJson({ data }) {
  // Start numbering at 0 so the first clause is 1
  const clauseCounter = useRef(-1);
  const definitionCounter = useRef(0);

  return (
    <div className="container">
      {data.map((node, idx) => (
        <RenderNode
          key={idx}
          node={node}
          clauseCounter={clauseCounter}
          definitionCounter={definitionCounter}
          parentTitle=""
        />
      ))}
    </div>
  );
}
