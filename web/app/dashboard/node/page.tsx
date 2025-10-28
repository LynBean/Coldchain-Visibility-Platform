import { connection } from 'next/server.js'
import DashboardNodeShowcase from './DashboardNodeShowcase.tsx'

const DashboardNodePage: React.FunctionComponent = async () => {
  await connection()
  return <DashboardNodeShowcase />
}

export default DashboardNodePage
