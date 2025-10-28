import { Dashboard } from "@/components/dashboard/dashboard"
import { getDashboardData } from "@/lib/api/dashboard"

export default async function Page() {
  const data = await getDashboardData()
  
  return <Dashboard data={data} />
}
