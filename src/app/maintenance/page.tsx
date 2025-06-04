export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-800">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-dark-700 rounded-lg shadow-lg text-center border border-gray-200 dark:border-dark-600">
        <h1 className="text-3xl font-bold text-primary-500 mb-4">
          System Maintenance
        </h1>
        <div className="animate-pulse mb-6">
          <div className="h-2 bg-primary-500/20 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-2 bg-primary-500/20 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-gray-900 dark:text-dark-100 mb-4">
          We're currently performing system maintenance to improve your experience.
          Please check back soon.
        </p>
        <p className="text-gray-600 dark:text-dark-300 text-sm">
          Our team is working hard to bring the system back online as quickly as possible.
        </p>
      </div>
    </div>
  );
} 