import { Skeleton } from "@/components/ui/skeleton"

export function OrdersSkeleton() {
  return (
    <div className="w-full">
      {/* Header with filters */}
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
      
      {/* Table skeleton */}
      <div className="overflow-hidden rounded-md border">
        <div className="border-b">
          <div className="flex items-center px-4 py-3">
            <Skeleton className="h-4 w-4 mr-3" />
            <Skeleton className="h-4 w-20 mr-6" />
            <Skeleton className="h-4 w-24 mr-6" />
            <Skeleton className="h-4 w-20 mr-6" />
            <Skeleton className="h-4 w-16 mr-6" />
            <Skeleton className="h-4 w-20 mr-6" />
            <Skeleton className="h-4 w-16 mr-6" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center px-4 py-3 border-b last:border-b-0">
            <Skeleton className="h-4 w-4 mr-3" />
            <Skeleton className="h-4 w-20 mr-6" />
            <div className="mr-6">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full mr-6" />
            <Skeleton className="h-6 w-16 rounded-full mr-6" />
            <Skeleton className="h-4 w-20 mr-6" />
            <Skeleton className="h-4 w-16 mr-6" />
            <div className="flex items-center space-x-2 ml-auto">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
