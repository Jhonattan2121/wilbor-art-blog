import HiveAuthButton from '@/components/HiveAuthButton';
import GridPage from '../../src/components/projects/page';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const username = process.env.NEXT_PUBLIC_HIVE_USERNAME;

  if (!username) {
    return <div>Username not configured</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Authentication Area */}
      <div className="flex justify-end items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <HiveAuthButton />
      </div>

      {/* Content Area */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="w-full">
        <GridPage />
      </div>
    </div>
  );
}