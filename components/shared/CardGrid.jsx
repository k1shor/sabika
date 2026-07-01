"use client";

import { Fragment } from "react";

export default function CardGrid({ items, renderItem, className, getKey }) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <Fragment key={getKey?.(item, index) ?? item.title ?? item.label ?? index}>
          {renderItem(item, index)}
        </Fragment>
      ))}
    </div>
  );
}
