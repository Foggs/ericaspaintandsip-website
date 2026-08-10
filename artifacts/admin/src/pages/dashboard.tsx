import { Link } from "wouter";
import { useGetEventsSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Image as ImageIcon, FileText, Plus, DollarSign, Users, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const { data: summary, isLoading } = useGetEventsSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue ?? 0)}</div>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{summary?.totalBookings ?? 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{summary?.upcomingEvents ?? 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{summary?.totalEvents ?? 0}</div>}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
            <Link href="/events/new">
              <Calendar className="h-6 w-6" />
              <span>Add Event</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
            <Link href="/gallery">
              <ImageIcon className="h-6 w-6" />
              <span>Upload Photo</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
            <Link href="/posts/new">
              <FileText className="h-6 w-6" />
              <span>Write Post</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
