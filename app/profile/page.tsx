"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsUpdating(true);

    try {
      const updateData: { username?: string; email?: string; password?: string } = {};

      if (username !== user?.username) {
        updateData.username = username;
      }
      if (email !== user?.email) {
        updateData.email = email;
      }
      if (password) {
        updateData.password = password;
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save");
        setIsUpdating(false);
        return;
      }

      await api.updateUser(user!.id, updateData);
      setSuccess("Profile updated successfully");
      setPassword("");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);

    try {
      await api.deleteUser(user!.id);
      logout();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Profile
      </h1>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h2>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="New Password (leave blank to keep current)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setUsername(user.username);
                  setEmail(user.email);
                  setPassword("");
                  setError("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Username
              </label>
              <p className="text-gray-900 dark:text-white">{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="w-full">
              Edit Profile
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Danger Zone
        </h2>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <Alert variant="warning">
              Are you sure you want to delete your account? This action cannot
              be undone and will remove all your data.
            </Alert>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1"
              >
                Delete Account
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full"
          >
            Delete Account
          </Button>
        )}
      </Card>
    </div>
  );
}
