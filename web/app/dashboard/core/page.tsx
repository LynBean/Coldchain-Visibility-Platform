import { connection } from 'next/server.js'
import DashboardCoreShowcase from './DashboardCoreShowcase.tsx'

const DashboardCorePage: React.FunctionComponent = async () => {
  await connection()
  return <DashboardCoreShowcase />
}

export default DashboardCorePage
