import AirQualityDashboard from '@/components/AirQualityDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Luftkvalitet Dashboard
        </h1>
        <AirQualityDashboard />
      </div>
    </main>
  );
}