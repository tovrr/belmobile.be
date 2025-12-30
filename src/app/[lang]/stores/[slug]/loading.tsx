
export default function StoreLoading() {
    return (
        <div className="min-h-screen bg-slate-950 pb-12">
            {/* Hero Map Skeleton */}
            <div className="relative h-[40vh] md:h-[450px] w-full bg-slate-800 animate-pulse">
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-4 relative z-10 -mt-8 md:-mt-20">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-t-3xl md:rounded-3xl shadow-xl min-h-[800px]">

                    {/* Content Section */}
                    <div className="p-5 md:p-10 relative z-10 bg-transparent rounded-t-3xl md:rounded-3xl">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">

                            {/* Left Column Skeleton */}
                            <div className="flex-1 w-full">
                                {/* Status Badge */}
                                <div className="h-6 w-24 bg-slate-800 rounded-full animate-pulse mb-4" />

                                {/* Title */}
                                <div className="h-10 md:h-14 w-3/4 bg-slate-800 rounded-lg animate-pulse mb-6" />

                                {/* Rating */}
                                <div className="h-6 w-48 bg-slate-800 rounded-lg animate-pulse mb-8" />

                                {/* Address & Buttons */}
                                <div className="flex flex-col md:flex-row gap-6 mb-12">
                                    <div className="h-12 w-full md:w-1/2 bg-slate-800 rounded-2xl animate-pulse" />
                                    <div className="h-12 w-full md:w-1/2 bg-slate-800 rounded-2xl animate-pulse" />
                                </div>

                                {/* Services Grid Skeleton */}
                                <div className="mb-12">
                                    <div className="h-8 w-40 bg-slate-800 rounded-lg animate-pulse mb-6" />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="aspect-4/5 bg-slate-800 rounded-4xl animate-pulse border border-white/5" />
                                        ))}
                                    </div>
                                </div>

                                {/* Carousel Skeleton */}
                                <div className="h-64 w-full bg-slate-800 rounded-3xl animate-pulse" />
                            </div>

                            {/* Right Column Skeleton (Sidebar) */}
                            <div className="hidden lg:block w-80 shrink-0 space-y-6">
                                <div className="h-64 bg-slate-800 rounded-3xl animate-pulse" />
                                <div className="h-40 bg-slate-800 rounded-3xl animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Section Skeleton */}
                <div className="mt-12 mb-12">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-12">
                        {/* Title & Desc */}
                        <div className="h-10 w-2/3 bg-slate-800 rounded-lg animate-pulse mb-6" />
                        <div className="h-4 w-full bg-slate-800 rounded animate-pulse mb-2" />
                        <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse mb-12" />

                        {/* SEO Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="h-48 bg-slate-800 rounded-2xl animate-pulse border border-white/5" />
                            <div className="h-48 bg-slate-800 rounded-2xl animate-pulse border border-white/5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
