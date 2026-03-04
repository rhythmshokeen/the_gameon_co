"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  LogOut,
  Trash2,
  Save,
  Loader2,
  Mail,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");

  // Password change form
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences (local state — would normally persist to API)
  const [notifications, setNotifications] = useState({
    emailApplications: true,
    emailConnections: true,
    emailCompetitions: true,
    emailNewsletter: false,
  });

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    // Simulated — in production, you'd call an API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Password changed successfully");
    setPasswords({ current: "", new: "", confirm: "" });
    setChangingPassword(false);
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  activeTab === id
                    ? "bg-slate-800 text-indigo-400"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Account Tab */}
          {activeTab === "account" && (
            <>
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-base">Profile Information</CardTitle>
                  <CardDescription>
                    Your basic account details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || ""}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        session?.user?.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {session?.user?.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {session?.user?.email}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {session?.user?.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={session?.user?.name || ""}
                        disabled
                        className="opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={session?.user?.email || ""}
                        disabled
                        className="opacity-50"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    To change your name or email, please contact support.
                  </p>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-900/50 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-base text-red-400">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-900/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Sign out of all devices
                      </p>
                      <p className="text-xs text-slate-500">
                        This will sign you out everywhere.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="border-red-900/50 text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-900/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Delete account
                      </p>
                      <p className="text-xs text-slate-500">
                        Permanently delete your account and all data.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        toast.error(
                          "Account deletion is handled by support. Please contact us."
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    changingPassword ||
                    !passwords.current ||
                    !passwords.new ||
                    !passwords.confirm
                  }
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-base">Email Notifications</CardTitle>
                <CardDescription>
                  Choose what emails you&apos;d like to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "emailApplications" as const,
                    title: "Application Updates",
                    desc: "Get notified when your applications are reviewed.",
                  },
                  {
                    key: "emailConnections" as const,
                    title: "Connection Requests",
                    desc: "Get notified about new connection requests.",
                  },
                  {
                    key: "emailCompetitions" as const,
                    title: "New Competitions",
                    desc: "Get notified about new competitions in your sport.",
                  },
                  {
                    key: "emailNewsletter" as const,
                    title: "Newsletter",
                    desc: "Receive our weekly newsletter with tips and updates.",
                  },
                ].map(({ key, title, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border border-slate-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{title}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notifications[key] ? "bg-indigo-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          notifications[key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <Button
                  onClick={() => toast.success("Notification preferences saved!")}
                  className="mt-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>
                  Customize the look of your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Theme</p>
                    <p className="text-xs text-slate-500">
                      GameOn Co. uses a dark theme by default.
                    </p>
                  </div>
                  <Badge variant="secondary">Dark</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Accent Color</p>
                    <p className="text-xs text-slate-500">
                      The primary accent color used throughout the app.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
                    <span className="text-sm text-slate-400">Indigo</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  More customization options coming soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
