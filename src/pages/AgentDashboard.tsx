import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/context/axios";
import { toast } from "sonner";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

const AgentDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/agents/my-stats');
      setStats(response.data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No agent data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agent = stats.agent;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your agent code: <strong>{agent.agent_code}</strong></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${agent.total_sales_value?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">All time sales value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${agent.total_commission_earned?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Total commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${agent.pending_commission?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.total_orders_referred || 0}</div>
            <p className="text-xs text-muted-foreground">Total referred</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rate */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Commission Rate</CardTitle>
          <CardDescription>Your earnings per sale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{agent.commission_rate || 5}%</div>
          <p className="text-sm text-muted-foreground mt-2">
            Status: <Badge variant={agent.agent_status === 'active' ? 'default' : 'secondary'}>
              {agent.agent_status || 'active'}
            </Badge>
          </p>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Your latest commissions</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentSales && stats.recentSales.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">Order #{sale.order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${sale.commission_amount.toFixed(2)}</p>
                    <Badge variant={
                      sale.commission_status === 'paid' ? 'default' :
                      sale.commission_status === 'approved' ? 'secondary' : 'outline'
                    }>
                      {sale.commission_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No sales yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;