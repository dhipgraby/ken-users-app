import { auth } from "@/auth";
import IconController from "@/components/icon-controller";

export default async function DashboardPage() {
  const session = await auth();

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const userName = session?.user?.name || "User";

  return (
    <div className="space-y-6">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0F5E59] via-[#0d4d48] to-[#0a3f3b] p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-1.5">
            {greeting}, <span className="text-emerald-300">{userName}</span>!
          </h1>
          <p className="text-white/80 text-base">Welcome to your dashboard. Here's your overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-md">
        {/* Account Info Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <IconController icon="user" className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">Verified</span>
            </div>
            <h3 className="text-sm font-medium text-white/80 mb-1">Account Email</h3>
            <p className="text-sm font-semibold truncate">{session?.user?.email || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#0F5E59] dark:hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <IconController icon="settings" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Settings</span>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#0F5E59] dark:hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
              <IconController icon="user" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Profile</span>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#0F5E59] dark:hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <IconController icon="help" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Support</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IconController icon="circleCheck" className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Successfully logged in</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Just now</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-50">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <IconController icon="linechart" className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">No recent activity</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start exploring the platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
