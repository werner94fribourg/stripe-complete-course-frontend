"use client";

import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { CartIcon } from "./CartIcon";
import { Button } from "@/app/components/ui/Button";

export function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Stripe Store
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link
                href="/products/new"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Add Product
              </Link>
            )}
          </nav>

          {/* Auth & Cart */}
          <div className="flex items-center space-x-4">
            <CartIcon />

            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.username}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
