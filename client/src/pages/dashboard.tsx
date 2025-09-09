import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { LinkEditor } from "@/components/link-editor";
import { getStoredAuth, logout, getAuthHeaders } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { Plus, GripVertical, Edit, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import type { Link as LinkType } from "@shared/schema";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  username: z.string().min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { user, isAuthenticated } = getStoredAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users/profile"],
    queryFn: async () => {
      const response = await fetch("/api/users/profile", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  const { data: links, isLoading: linksLoading } = useQuery<LinkType[]>({
    queryKey: ["/api/links"],
    queryFn: async () => {
      const response = await fetch("/api/links", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch links");
      return response.json();
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      username: profile?.username || "",
    },
  });

  // Update form when profile loads
  if (profile && !form.formState.isDirty) {
    form.reset({
      displayName: profile.displayName,
      bio: profile.bio,
      username: profile.username,
    });
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { theme?: string }) => {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      toast({ title: "Profile updated successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "gradient" | "dark" | "light");
    updateProfileMutation.mutate({
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      username: profile?.username || "",
      theme: newTheme,
    });
  };

  const handleEditLink = (link: LinkType) => {
    setEditingLink(link);
    setShowLinkEditor(true);
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setShowLinkEditor(true);
  };

  if (profileLoading || linksLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-6 w-48" />
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-dashboard-title">
              LinkTree Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground text-sm" data-testid="text-user-email">
              {user?.email}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your display name"
                              data-testid="input-display-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Tell people about yourself"
                              data-testid="textarea-bio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile URL</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="bg-muted text-muted-foreground px-3 py-2 border border-r-0 border-border rounded-l-md text-sm">
                                /profile/
                              </span>
                              <Input
                                placeholder="username"
                                className="rounded-l-none"
                                data-testid="input-username"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-update-profile"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Links Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Links</CardTitle>
                <Button onClick={handleAddLink} data-testid="button-add-link">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </CardHeader>
              <CardContent>
                {links && links.length > 0 ? (
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="bg-secondary border border-border rounded-md p-4 flex items-center space-x-4"
                        data-testid={`link-item-${link.id}`}
                      >
                        <div className="drag-handle text-muted-foreground hover:text-foreground cursor-grab">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <i className={`${link.icon} text-primary`}></i>
                            <span className="font-medium text-foreground" data-testid={`text-link-title-${link.id}`}>
                              {link.title}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate" data-testid={`text-link-url-${link.id}`}>
                            {link.url}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground" data-testid={`text-link-clicks-${link.id}`}>
                            {link.clicks || 0} clicks
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLink(link)}
                            data-testid={`button-edit-link-${link.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4" data-testid="text-no-links">
                      No links added yet.
                    </p>
                    <Button onClick={handleAddLink} data-testid="button-add-first-link">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics Overview</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Total Clicks</span>
                      <span className="text-xl font-bold text-foreground" data-testid="text-total-clicks">
                        {analytics?.totalClicks || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">This Month</span>
                      <span className="text-lg font-semibold text-primary" data-testid="text-monthly-clicks">
                        {analytics?.monthlyClicks || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Page Views</span>
                      <span className="text-lg font-semibold text-foreground" data-testid="text-page-views">
                        {analytics?.pageViews || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Theme Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={profile?.theme || "gradient"}
                  onValueChange={handleThemeChange}
                  data-testid="radio-group-theme"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="gradient" id="gradient" />
                    <Label htmlFor="gradient" className="flex items-center space-x-2 cursor-pointer">
                      <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                      <span>Purple Gradient</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                      <div className="w-6 h-6 rounded bg-gray-900 border border-border"></div>
                      <span>Dark</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                      <div className="w-6 h-6 rounded bg-white border border-border"></div>
                      <span>Light</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Profile Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-white/20 flex items-center justify-center">
                    <i className="fas fa-user text-white opacity-60"></i>
                  </div>
                  <h4 className="text-white font-medium text-sm" data-testid="text-preview-name">
                    {profile?.displayName || "Your Name"}
                  </h4>
                  <p className="text-purple-200 text-xs mt-1" data-testid="text-preview-username">
                    /profile/{profile?.username || "username"}
                  </p>
                </div>
                <Link href={`/profile/${profile?.username}`}>
                  <Button className="w-full mt-3" variant="outline" data-testid="button-view-public-profile">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LinkEditor
        open={showLinkEditor}
        onOpenChange={setShowLinkEditor}
        link={editingLink}
      />
    </div>
  );
}
