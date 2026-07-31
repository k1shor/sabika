"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";

export default function UserSearchBar({
  query,
  disabled,
  onQueryChange,
  onSearch,
  onRefresh,
}) {
  return (
    <form onSubmit={onSearch} className="flex w-full gap-2 lg:max-w-md">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search name, email, or role"
      />
      <Button type="submit" disabled={disabled}>Search</Button>
      <Button type="button" disabled={disabled} onClick={onRefresh}>
        Refresh
      </Button>
    </form>
  );
}
