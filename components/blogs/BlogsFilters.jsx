"use client";

import FilterButton from "./FilterButton";
import { CATEGORY_LABELS, POST_TYPE_LABELS } from "./blogToolbarUtils";

export default function BlogsFilters({
  categories,
  category,
  onCategoryChange,
  postTypes,
  postType,
  onPostTypeChange,
  tags,
  tag,
  onTagChange,
}) {
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.length > 0 && (
          <>
            <FilterButton active={category === "all"} onClick={() => onCategoryChange("all")}>All</FilterButton>
            {categories.map((item) => (
              <FilterButton key={item} active={category === item} onClick={() => onCategoryChange(item === category ? "all" : item)}>
                {CATEGORY_LABELS[item] || item.replace(/_/g, " ")}
              </FilterButton>
            ))}
          </>
        )}
      </div>

      {(postTypes.length > 1 || tags.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {postTypes.length > 1 && postTypes.map((item) => (
            <FilterButton key={item} active={postType === item} onClick={() => onPostTypeChange(item === postType ? "all" : item)}>
              {POST_TYPE_LABELS[item] || item}
            </FilterButton>
          ))}
          {tags.map((item) => (
            <FilterButton key={item} active={tag === item} onClick={() => onTagChange(item === tag ? "all" : item)}>
              #{item}
            </FilterButton>
          ))}
        </div>
      )}
    </>
  );
}
