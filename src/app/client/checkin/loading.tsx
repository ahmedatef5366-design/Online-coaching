import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ClientCheckinLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
