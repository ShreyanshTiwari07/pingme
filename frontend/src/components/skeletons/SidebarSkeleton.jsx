const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-pine-400 flex flex-col transition-all duration-200 bg-pine-100">
      {/* Header */}
      <div className="border-b border-pine-400 w-full p-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pine-400 rounded animate-pulse" />
          <div className="hidden lg:block w-20 h-5 bg-pine-400 rounded animate-pulse" />
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="w-12 h-12 rounded-full bg-pine-400 animate-pulse" />

            {/* User info skeleton */}
            <div className="hidden lg:block space-y-2 flex-1">
              <div className="h-4 w-32 bg-pine-400 rounded animate-pulse" />
              <div className="h-3 w-24 bg-pine-400 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
