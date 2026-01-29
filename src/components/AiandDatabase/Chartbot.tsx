import { useState } from "react";
import { SearchBar } from "./Search-bar";
import { AIChat } from "./Aichart";
import { SearchResults } from "./Search-results";
import { globalSearchApi } from "@/api/searchApi"; // <-- your API

export default function AIChartbot() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    try {
      const data = await globalSearchApi({ q: query, page: 1, limit: 10 });
      // Map API response to your SearchResults component
      const mappedResults = data.results.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.description,
        type: item.type,
      }));
      setSearchResults(mappedResults);
    } catch (error: any) {
      console.error("Search error:", error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen pt-[60px] bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
<h1 className="text-3xl font-bold text-foreground mb-2">Multi-Mart Marketplace</h1>
          <p className="text-muted-foreground">Browse all products, search our marketplace, and find exactly what you need</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2 space-y-6">
            <SearchBar onSearch={handleSearch} isSearching={isSearching} />
            <SearchResults results={searchResults} query={searchQuery} isSearching={isSearching} />
          </div>

          {/* AI Chat Section */}
          <div className="lg:col-span-1">
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  );
}
