import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Tag, ShoppingBag } from "lucide-react"

interface SearchResult {
  id: number
  title: string
  content: string
  type: string
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  isSearching: boolean
}

export function SearchResults({ results, query, isSearching }: SearchResultsProps) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "product":
        return <Package className="h-4 w-4" />
      case "category":
        return <Tag className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  if (isSearching) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Start Shopping</h3>
        <p className="text-muted-foreground">Search for products, brands, or categories in our marketplace</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Products Found</h3>
        <p className="text-muted-foreground">No products found for "{query}". Try a different search term.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Products Found ({results.length})</h2>
        <p className="text-sm text-muted-foreground">Results for "{query}"</p>
      </div>

      {results.map((result) => (
        <Card key={result.id} className="bg-card border-border hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
                {getIcon(result.type)}
                {result.title}
              </CardTitle>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {result.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


















// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { FileText, Database, File } from "lucide-react"

// interface SearchResult {
//   id: number
//   title: string
//   content: string
//   type: string
// }

// interface SearchResultsProps {
//   results: SearchResult[]
//   query: string
//   isSearching: boolean
// }

// export function SearchResults({ results, query, isSearching }: SearchResultsProps) {
//   const getIcon = (type: string) => {
//     switch (type.toLowerCase()) {
//       case "document":
//         return <FileText className="h-4 w-4" />
//       case "record":
//         return <Database className="h-4 w-4" />
//       default:
//         return <File className="h-4 w-4" />
//     }
//   }

//   if (isSearching) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map((i) => (
//           <Card key={i} className="bg-card border-border animate-pulse">
//             <CardHeader>
//               <div className="h-4 bg-muted rounded w-3/4"></div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <div className="h-3 bg-muted rounded"></div>
//                 <div className="h-3 bg-muted rounded w-5/6"></div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )
//   }

//   if (!query) {
//     return (
//       <div className="text-center py-12">
//         <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-foreground mb-2">Ready to Search</h3>
//         <p className="text-muted-foreground">Enter a search term to find data in your database</p>
//       </div>
//     )
//   }

//   if (results.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-foreground mb-2">No Results Found</h3>
//         <p className="text-muted-foreground">No data found for "{query}". Try a different search term.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-semibold text-foreground">Search Results ({results.length})</h2>
//         <p className="text-sm text-muted-foreground">Results for "{query}"</p>
//       </div>

//       {results.map((result) => (
//         <Card key={result.id} className="bg-card border-border hover:shadow-md transition-shadow">
//           <CardHeader className="pb-3">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
//                 {getIcon(result.type)}
//                 {result.title}
//               </CardTitle>
//               <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
//                 {result.type}
//               </Badge>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm text-muted-foreground leading-relaxed">{result.content}</p>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   )
// }
