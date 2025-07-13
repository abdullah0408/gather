"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import * as SignUp from "@clerk/elements/sign-up";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [loading, setLoading] = useState<string | false>(false);

  return (
    <div className="flex flex-col">
      <SignIn.Root>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <span className="sr-only">Gather</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to Gather</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
          <SignIn.Step name="start">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Clerk.Field
                  name="identifier"
                  className="flex flex-col gap-y-2"
                >
                  <Clerk.Label asChild>
                    <Label>Email or Username</Label>
                  </Clerk.Label>
                  <Clerk.Input asChild>
                    <Input required />
                  </Clerk.Input>
                  <Clerk.FieldError className="text-red-600 text-sm italic" />
                </Clerk.Field>
              </div>
              <SignUp.Action submit asChild>
                <Button className="w-full">Continue</Button>
              </SignUp.Action>
            </div>
          </SignIn.Step>
          <SignIn.Step name="verifications">
            <SignIn.Strategy name="email_code">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    We sent a code to
                    <span className=" italic font-bold">
                      {" "}
                      <SignIn.SafeIdentifier />.
                    </span>
                  </p>
                  <Clerk.Field name="code" className="flex flex-col gap-y-2">
                    <Clerk.Label asChild>
                      <Label>Email Code</Label>
                    </Clerk.Label>
                    <Clerk.Input asChild>
                      <Input />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-red-600 text-sm italic" />
                  </Clerk.Field>
                </div>
                <SignIn.Action submit asChild>
                  <Button className="w-full">Contienu</Button>
                </SignIn.Action>
              </div>
            </SignIn.Strategy>
            <SignIn.Strategy name="password">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Clerk.Field
                    name="password"
                    className="flex flex-col gap-y-2"
                  >
                    <div className="flex justify-between">
                      <Clerk.Label>Password</Clerk.Label>
                      <SignIn.Action navigate="forgot-password">
                        Forgot password?
                      </SignIn.Action>
                    </div>
                    <Clerk.Input asChild>
                      <Input />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-red-600 text-sm italic" />
                  </Clerk.Field>
                </div>
                <SignIn.Action submit asChild>
                  <Button className="w-full">Continue</Button>
                </SignIn.Action>
              </div>
            </SignIn.Strategy>
            <SignIn.Strategy name="reset_password_email_code">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    We sent a code to
                    <span className=" italic font-bold">
                      {" "}
                      <SignIn.SafeIdentifier />.
                    </span>
                  </p>
                  <Clerk.Field name="code" className="flex flex-col gap-y-2">
                    <Clerk.Label asChild>
                      <Label>Email Code</Label>
                    </Clerk.Label>
                    <Clerk.Input asChild>
                      <Input />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-red-600 text-sm italic" />
                  </Clerk.Field>
                </div>
                <SignIn.Action submit asChild>
                  <Button className="w-full">Continue</Button>
                </SignIn.Action>
              </div>
            </SignIn.Strategy>
          </SignIn.Step>
          <SignIn.Step name="forgot-password">
            <h1 className="text-lg font-semibold">Forgot your password?</h1>
            <div className="flex justify-between">
              <SignIn.SupportedStrategy name="reset_password_email_code">
                <p className="text-sm text-muted-foreground underline">
                  Reset password
                </p>
              </SignIn.SupportedStrategy>
              <div className="flex flex-row">
                <SignIn.Action navigate="previous">
                  <ArrowLeft className="h-5 w-5"></ArrowLeft> Go back
                </SignIn.Action>
              </div>
            </div>
          </SignIn.Step>
          <SignIn.Step name="reset-password">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Clerk.Field name="password">
                  <Clerk.Label asChild>
                    <Label>New Password</Label>
                  </Clerk.Label>
                  <Clerk.Input asChild>
                    <Input />
                  </Clerk.Input>
                  <Clerk.FieldError className="text-red-600 text-sm italic" />
                </Clerk.Field>
                <Clerk.Field name="confirmPassword">
                  <Clerk.Label asChild>
                    <Label>Confirm password</Label>
                  </Clerk.Label>
                  <Clerk.Input asChild>
                    <Input />
                  </Clerk.Input>
                  <Clerk.FieldError className="text-red-600 text-sm italic" />
                </Clerk.Field>
              </div>
              <SignIn.Action submit asChild>
                <Button className="w-full">Reset password</Button>
              </SignIn.Action>
            </div>
          </SignIn.Step>
        </div>
      </SignIn.Root>
      <SignUp.Root>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6" />
          <SignUpMissingField />
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Clerk.Connection name="github" asChild>
              <Button
                variant="outline"
                className="w-full"
                disabled={!!loading}
                onClick={() => setLoading("github")}
              >
                {loading === "github" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      fill="currentColor"
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.533 2.294 6.537 5.47 7.599.4.074.553-.174.553-.388 0-.192-.008-.694-.011-1.364-2.223.489-2.692-1.073-2.692-1.073-.363-.922-.89-1.167-.89-1.167-.727-.497.055-.487.055-.487.803.057 1.226.828 1.226.828.711 1.22 1.868.868 2.323.664.073-.517.278-.868.507-1.067-1.777-.202-3.644-.889-3.644-3.947 0-.873.312-1.589.828-2.147-.083-.202-.359-.946.079-1.974 0 0 .67-.215 2.19.828 1.297-.36 2.698-.36 3.995 0 1.52-1.043 2.19-.828 2.19-.828.437 1.027.162 1.772.079 1.974.515.557.828 1.274.828 2.147 0 3.061-1.867 3.745-3.647 3.947.284.244.528.726.528 1.468 0 1.058-.009 1.92-.009 2.181 0 .215.152.463.56.388C13.706 14.537 16 11.533 16 8c0-4.42-3.58-8-8-8z"
                    />
                  </svg>
                )}
                {loading === "github"
                  ? "Please wait..."
                  : "Continue with GitHub"}
              </Button>
            </Clerk.Connection>
            <Clerk.Connection name="google" asChild>
              <Button
                variant="outline"
                className="w-full"
                disabled={!!loading}
                onClick={() => setLoading("google")}
              >
                {loading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {loading === "google"
                  ? "Please wait..."
                  : "Continue with Google"}
              </Button>
            </Clerk.Connection>
          </div>
        </div>
      </SignUp.Root>
    </div>
  );
}

const SignUpMissingField = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Check the current path
  useEffect(() => {
    // Check if the URL path matches '/sign-in/continue'
    if (window.location.pathname === "/sign-in/continue") {
      setIsVisible(true);
    }
  }, []);
  if (!isVisible) {
    return null; // Hide the component for other paths
  }
  return (
    <SignUp.Step name="continue">
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Clerk.Field name="username" className="flex flex-col gap-y-2">
            <Clerk.Label asChild>
              <Label>Username</Label>
            </Clerk.Label>
            <Clerk.Input asChild>
              <Input required />
            </Clerk.Input>
            <Clerk.FieldError className="text-red-600 text-sm italic" />
          </Clerk.Field>
        </div>
        <SignUp.Action submit asChild>
          <Button className="w-full">Sign Up</Button>
        </SignUp.Action>
      </div>
    </SignUp.Step>
  );
};
