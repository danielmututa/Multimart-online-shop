
import type React from "react"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
}

export function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
           placeholder="Search for products, categories, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-input border-border focus:ring-2 focus:ring-ring"
            disabled={isSearching}
          />
        </div>
        <Button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>
    </div>
  )
}
