'use client';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Simple Spinner */}
        <div className="flex justify-center">
          <div className="w-12 h-12 border-3 border-muted rounded-full">
            <div className="w-12 h-12 border-3 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-foreground">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    </div>
  );
}
