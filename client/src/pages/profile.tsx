import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { LinkCard } from "@/components/link-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getStoredAuth } from "@/lib/auth";

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  theme: string;
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
  }>;
}

export default function Profile() {
  const params = useParams();
  const { user } = getStoredAuth();
  
  // If no username in params, use current user's username
  const username = params.username || user?.username;

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ["/api/users", username],
    enabled: !!username,
  });

  const getThemeBackground = (theme: string) => {
    switch (theme) {
      case "light":
        return "bg-gray-50";
      case "dark":
        return "bg-gray-900";
      default:
        return "bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
    }
  };

  const getThemeTextColor = (theme: string) => {
    switch (theme) {
      case "light":
        return "text-gray-900";
      case "dark":
        return "text-white";
      default:
        return "text-white";
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Please provide a valid username in the URL.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center mb-8">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-error-title">Profile Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600" data-testid="text-error-description">
              The user profile you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeBackground(profile.theme)}`}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/20 shadow-xl object-cover"
              data-testid="img-profile-avatar"
            />
          ) : (
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/20 shadow-xl bg-primary/20 flex items-center justify-center"
              data-testid="div-default-avatar"
            >
              <i className="fas fa-user text-3xl text-primary opacity-60"></i>
            </div>
          )}
          
          <h1 className={`text-2xl font-bold mb-2 ${getThemeTextColor(profile.theme)}`} data-testid="text-profile-name">
            {profile.displayName}
          </h1>
          {profile.bio && (
            <p className={`text-sm leading-relaxed opacity-80 ${getThemeTextColor(profile.theme)}`} data-testid="text-profile-bio">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        {profile.links.length > 0 ? (
          <div className="space-y-4 mb-8">
            {profile.links.map((link) => (
              <LinkCard
                key={link.id}
                title={link.title}
                url={link.url}
                icon={link.icon}
                theme={profile.theme}
                trackClick={true}
                linkId={link.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center mb-8">
            <p className={`opacity-60 ${getThemeTextColor(profile.theme)}`} data-testid="text-no-links">
              No links available yet.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs opacity-60 ${getThemeTextColor(profile.theme)}`}>
            Create your own LinkTree clone
          </p>
        </div>
      </div>
    </div>
  );
}
