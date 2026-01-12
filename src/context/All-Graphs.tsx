


import { useState } from "react"
import { OverallSalesCard } from "@/ChartGraphs/Overall-Sales-Card"
import { SourceOfPurchasesCard } from "@/ChartGraphs/Source-Of-Purchases-Card"
import { VisitorsCard } from "@/ChartGraphs/Visitors-Card"
import { CountriesCard } from "@/ChartGraphs/Citties-card"
import { SalesPerWeekCard } from "@/ChartGraphs/Sales-Per-Week-Card"
import { SalesHistoryCard } from "@/ChartGraphs/Sales-History-Card"





export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 7 days")

  const salesData = [
    { month: "Dec 1", value: 45000 },
    { month: "Dec 2", value: 52000 },
    { month: "Dec 3", value: 48000 },
    { month: "Dec 4", value: 74805 },
    { month: "Dec 5", value: 58000 },
    { month: "Dec 6", value: 62000 },
    { month: "Dec 7", value: 55000 },
  ]

  const countryData = [
    { country: "India", value: 1000, color: "#3b82f6", flag: "🇮🇳" },
    { country: "United States", value: 900, color: "#3b82f6", flag: "🇺🇸" },
    { country: "China", value: 400, color: "#60a5fa", flag: "🇨🇳" },
    { country: "Indonesia", value: 1400, color: "#f97316", flag: "🇮🇩" },
    { country: "Russia", value: 700, color: "#3b82f6", flag: "🇷🇺" },
    { country: "Bangladesh", value: 600, color: "#60a5fa", flag: "🇧🇩" },
    { country: "Canada", value: 600, color: "#60a5fa", flag: "🇨🇦" },
    { country: "Australia", value: 400, color: "#60a5fa", flag: "🇦🇺" },
  ]

  const salesHistory = [
    {
      id: 1,
      name: "Alpha Turner",
      amount: 30.92,
      avatar: "AT",
      color: "bg-green-500",
      country: "United States",
      timestamp: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      name: "Bella Poarch",
      amount: 199.99,
      avatar: "BP",
      color: "bg-purple-500",
      country: "United States",
      timestamp: "4 hours ago",
      status: "completed",
    },
    {
      id: 3,
      name: "Cinderella",
      amount: 30.0,
      avatar: "C",
      color: "bg-purple-500",
      country: "United States",
      timestamp: "6 hours ago",
      status: "pending",
    },
    {
      id: 4,
      name: "David Johnson",
      amount: 49.99,
      avatar: "DJ",
      color: "bg-blue-500",
      country: "United States",
      timestamp: "8 hours ago",
      status: "completed",
    },
    {
      id: 5,
      name: "Peter Parker",
      amount: 49.99,
      avatar: "PP",
      color: "bg-gray-500",
      country: "United States",
      timestamp: "1 day ago",
      status: "completed",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Monitor your business performance in real-time</p>
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <OverallSalesCard
            salesData={salesData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
          <SourceOfPurchasesCard />
          <VisitorsCard />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CountriesCard
            countryData={countryData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
          <SalesPerWeekCard
            salesData={salesData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
          <SalesHistoryCard
            salesHistory={salesHistory}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        </div>
      </div>
    </div>
  )
}



