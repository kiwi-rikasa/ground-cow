import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 max-w-md w-full mx-auto p-6 rounded-lg shadow-md bg-white dark:bg-gray-800",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <span className="sr-only">TSMC Inc.</span>
          </a>
          <h1 className="text-2xl font-bold text-center">
            Welcome to TSMC Inc.
          </h1>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Please sign in to continue.
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-1">
          <Button
            variant="outline"
            className="w-full cursor-pointer py-6 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => signIn("google")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-5"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </Button>
        </div>
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground border-t pt-4 mt-2">
        By clicking continue, you agree to our{" "}
        <a
          href="#"
          className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
