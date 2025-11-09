import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty.tsx'

const DashboardPage = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 - Undergoing Construction</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for is undergoing construction.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export default DashboardPage
