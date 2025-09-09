import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthModal } from "@/components/auth-modal";
import { getStoredAuth } from "@/lib/auth";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated } = getStoredAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6" data-testid="text-main-title">
            Create Your LinkTree Clone
          </h1>
          <p className="text-xl text-purple-200 mb-12 leading-relaxed" data-testid="text-main-subtitle">
            Build a beautiful profile page to showcase all your important links in one place.
            Perfect for social media bios, business cards, and personal branding.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:opacity-90 transition-opacity" data-testid="button-dashboard">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10" data-testid="button-view-profile">
                    View My Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-primary hover:opacity-90 transition-opacity"
                  onClick={() => setShowAuth(true)}
                  data-testid="button-get-started"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white/10"
                  onClick={() => setShowAuth(true)}
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <i className="fas fa-palette text-primary"></i>
                  <span>Customizable Themes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  Choose from beautiful gradient, dark, and light themes to match your personal brand.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <i className="fas fa-chart-line text-primary"></i>
                  <span>Click Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  Track how many people are clicking your links and viewing your profile.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <i className="fas fa-mobile-alt text-primary"></i>
                  <span>Mobile Friendly</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  Your profile looks perfect on all devices with responsive design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        onSuccess={() => {
          setShowAuth(false);
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
